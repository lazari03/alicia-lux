const target = new URL(process.argv[2])

async function probe() {
  const cookies = new Map()
  const signal = AbortSignal.timeout(5000)
  let url = target

  for (let redirects = 0; redirects < 6; redirects++) {
    const cookie = [...cookies].map(([name, value]) => `${name}=${value}`).join('; ')
    const response = await fetch(url, {
      headers: cookie ? { cookie } : {},
      redirect: 'manual',
      signal,
    })
    await response.body?.cancel()

    if (response.ok) return null

    const location = response.headers.get('location')
    if (![301, 302, 303, 307, 308].includes(response.status) || !location) {
      return `HTTP ${response.status}`
    }

    const destination = new URL(location, url)
    if (destination.origin !== target.origin) {
      return 'redirected away from the local service'
    }

    for (const header of response.headers.getSetCookie()) {
      const pair = header.split(';', 1)[0]
      const separator = pair.indexOf('=')
      if (separator > 0) cookies.set(pair.slice(0, separator), pair.slice(separator + 1))
    }
    url = destination
  }

  return 'too many redirects'
}

let failure
for (let attempt = 0; attempt < 90; attempt++) {
  try {
    failure = await probe()
    if (failure === null) process.exit(0)
  } catch (error) {
    failure = error.cause?.code ?? error.name
  }
  await new Promise(resolve => setTimeout(resolve, 2000))
}
console.error(`Service did not become ready: ${target.href} (${failure}). Run make logs.`)
process.exit(1)
