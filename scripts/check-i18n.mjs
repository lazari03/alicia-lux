// Fails if se.json and en.json don't have exactly the same keys.
// Run: node scripts/check-i18n.mjs  (also runs before every build)
import { readFileSync } from "node:fs"

const load = (f) => JSON.parse(readFileSync(`messages/${f}.json`, "utf8"))
const keys = (o, p = "") =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v) ? keys(v, `${p}${k}.`) : [`${p}${k}${Array.isArray(v) ? `[${v.length}]` : ""}`]
  )
const se = new Set(keys(load("se")))
const en = new Set(keys(load("en")))
const missing = [...[...en].filter((k) => !se.has(k)).map((k) => `se.json is missing ${k}`), ...[...se].filter((k) => !en.has(k)).map((k) => `en.json is missing ${k}`)]
if (missing.length) {
  console.error(missing.join("\n"))
  process.exit(1)
}
console.log(`✓ i18n: ${se.size} keys in both se.json and en.json`)
