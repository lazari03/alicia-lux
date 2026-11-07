import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
const read = path => fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : ''
const parse = text => Object.fromEntries(text.split(/\r?\n/).filter(line => /^[A-Za-z_][A-Za-z_0-9]*=/.test(line)).map(line => { const i = line.indexOf('='); return [line.slice(0,i), line.slice(i+1).replace(/^(['"])(.*)\1$/, '$2')] }))
function write(path, values) {
  let text = read(path)
  for (const [key,value] of Object.entries(values)) {
    text = text.split(/\r?\n/).filter(line => !line.startsWith(key+'=')).join('\n').replace(/\n*$/, '') + `\n${key}=${value}\n`
  }
  fs.writeFileSync(path,text.replace(/^\n/,''),{mode:0o600});fs.chmodSync(path,0o600)
}
const secret = () => crypto.randomBytes(32).toString('hex')
if (process.argv[2] === 'backend') {
  const root = parse(read('.env'))
  const backend = parse(read('apps/backend/.env'))
  if (!root.POSTGRES_PASSWORD && !backend.DATABASE_URL) {
    // Existing volumes must retain their original password; never guess or reset it.
    const volumes = execFileSync('docker',['volume','ls','--filter','label=com.docker.compose.project=alicia-lux','-q'],{encoding:'utf8'}).trim()
    if (volumes) throw new Error('Existing PostgreSQL volume found without credentials. Restore .env or apps/backend/.env before continuing.')
    root.POSTGRES_PASSWORD=secret();write('.env',{POSTGRES_PASSWORD:root.POSTGRES_PASSWORD})
  }
  if (!root.POSTGRES_PASSWORD && backend.DATABASE_URL) {
    root.POSTGRES_PASSWORD=decodeURIComponent(new URL(backend.DATABASE_URL).password)
    write('.env',{POSTGRES_PASSWORD:root.POSTGRES_PASSWORD})
  }
  const defaults={DATABASE_URL:`postgres://medusa:${encodeURIComponent(root.POSTGRES_PASSWORD)}@localhost:5432/alicia_lux`,STORE_CORS:'http://localhost:8000',ADMIN_CORS:'http://localhost:9000',AUTH_CORS:'http://localhost:8000,http://localhost:9000',JWT_SECRET:secret(),COOKIE_SECRET:secret()}
  write('apps/backend/.env',Object.fromEntries(Object.entries(defaults).filter(([k])=>!backend[k])))
} else {
  const key=execFileSync('docker',['compose','exec','-T','postgres','psql','-U','medusa','-d','alicia_lux','-Atc',"SELECT token FROM api_key WHERE type='publishable' AND deleted_at IS NULL LIMIT 1;"],{encoding:'utf8'}).trim()
  if (!key.startsWith('pk_')) throw new Error('No publishable API key exists. Check the Medusa seed output.')
  const current=parse(read('apps/storefront/.env.local'))
  const defaults={MEDUSA_BACKEND_URL:'http://localhost:9000',NEXT_PUBLIC_BASE_URL:'http://localhost:8000',NEXT_PUBLIC_DEFAULT_REGION:'de',REVALIDATE_SECRET:secret()}
  const missing=Object.fromEntries(Object.entries(defaults).filter(([k])=>!current[k]))
  write('apps/storefront/.env.local',{...missing,NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:key})
}
