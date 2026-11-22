import { readFileSync } from 'node:fs'

const [file, port] = process.argv.slice(2)
if (!/^900[012]$/.test(port)) throw new Error('Unexpected Medusa port.')
const config = readFileSync(file, 'utf8')
const site = /^([ \t]*shopalicialux\.se,\s*www\.shopalicialux\.se\s*\{)[ \t]*$/m
if (!site.test(config)) throw new Error('Expected the Alicia Lux domain block in the Caddyfile.')

const block = [
  '  # BEGIN ALICIA DASHBOARD',
  '  @aliciaLocalizedDashboard path_regexp alicia_dashboard ^/[a-z]{2}(/app(?:/.*)?)$',
  '  redir @aliciaLocalizedDashboard {re.alicia_dashboard.1} 302',
  '  @aliciaDashboard path /app /app/* /hooks/payment/stripe_stripe /hooks/payment/stripe-hosted_stripe-hosted',
  '  handle @aliciaDashboard {',
  `    reverse_proxy http://127.0.0.1:${port}`,
  '  }',
  '  # END ALICIA DASHBOARD',
].join('\n')

const managed = /^[ \t]*# BEGIN ALICIA DASHBOARD\r?\n[\s\S]*?^[ \t]*# END ALICIA DASHBOARD[ \t]*$/m
process.stdout.write(managed.test(config) ? config.replace(managed, block) : config.replace(site, `$1\n${block}`))
