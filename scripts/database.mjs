import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { parseEnv } from 'node:util'

const rootEnv = new URL('../.env', import.meta.url)
const backendEnv = new URL('../apps/backend/.env', import.meta.url)
const backendDir = fileURLToPath(new URL('../apps/backend', import.meta.url))
const requireBackend = createRequire(new URL('../apps/backend/package.json', import.meta.url))
const readEnv = file => existsSync(file) ? readFileSync(file, 'utf8') : ''
const localUrl = 'postgres://medusa@127.0.0.1:5432/alicia_lux'

async function checkConnection(connectionString) {
  const { Client } = requireBackend('pg')
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 })
  try {
    await client.connect()
    await client.query('SELECT 1')
  } finally {
    await client.end()
  }
}

function stageEnv(file, key, value) {
  const original = readEnv(file)
  const pattern = new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`)
  const lines = original.split(/\r?\n/).filter(line => !pattern.test(line))
  const text = lines.join('\n').trimEnd()
  const temporary = new URL(`${file.href}.${randomBytes(8).toString('hex')}`)
  writeFileSync(temporary, `${text ? text + '\n' : ''}${key}=${value}\n`, { mode: 0o600, flag: 'wx' })
  return [temporary, file]
}

function isLocalDatabase(connectionString) {
  const url = new URL(connectionString)
  return ['postgres:', 'postgresql:'].includes(url.protocol)
    && ['localhost', '127.0.0.1'].includes(url.hostname)
    && ['', '5432'].includes(url.port)
    && url.username === 'medusa'
    && url.pathname === '/alicia_lux'
    && !url.search
}

async function main() {
  const repair = process.argv[2] === 'repair'
  const exportedDatabaseUrl = process.env.DATABASE_URL
  const { loadEnv } = requireBackend('@medusajs/framework/utils')
  loadEnv(process.env.NODE_ENV || 'development', backendDir)
  const url = process.env.DATABASE_URL

  if (url) {
    try {
      await checkConnection(url)
      console.log('PostgreSQL login verified from the host.')
      return
    } catch (error) {
      if (error.code !== '28P01') {
        throw new Error(`PostgreSQL connection failed (${error.code ?? 'connection error'}). Check the database service and connection settings.`)
      }
    }
  }

  if (!repair) {
    throw new Error(url
      ? 'PostgreSQL rejected the configured password (28P01). For the local Compose database, run make db-repair and then make deploy.'
      : 'DATABASE_URL is missing. Restore apps/backend/.env or run make db-repair for an existing local Compose database.')
  }

  const fileUrl = parseEnv(readEnv(backendEnv)).DATABASE_URL
  if (exportedDatabaseUrl !== undefined || (url && (url !== fileUrl || !isLocalDatabase(url)))) {
    throw new Error('Repair requires the local Compose database and DATABASE_URL in apps/backend/.env. Clear any override and check the configured database.')
  }

  const password = randomBytes(32).toString('hex')
  const connection = new URL(localUrl)
  connection.password = password
  const staged = []
  try {
    staged.push(stageEnv(rootEnv, 'POSTGRES_PASSWORD', password))
    staged.push(stageEnv(backendEnv, 'DATABASE_URL', connection.href))

    try {
      execFileSync('docker', [
        'compose', 'exec', '-T', 'postgres',
        'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'medusa', '-d', 'alicia_lux',
        '-c', '\\password medusa',
      ], { input: `${password}\n${password}\n`, stdio: ['pipe', 'ignore', 'ignore'] })
    } catch {
      throw new Error('Could not update the local PostgreSQL password. Check that the existing postgres service is running with docker compose ps postgres.')
    }

    await checkConnection(connection.href)
    for (const [temporary, file] of staged) renameSync(temporary, file)
    console.log('PostgreSQL login verified. Both .env files updated. Run make deploy.')
  } finally {
    for (const [temporary] of staged) rmSync(temporary, { force: true })
  }
}

main().catch(error => {
  console.error(`Database setup: ${error.message}`)
  process.exitCode = 1
})
