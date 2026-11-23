// Builds favicon.ico, icon.png and apple-icon.png from the Alicia Lux mark.
// Run: node scripts/generate-icons.mjs
import sharp from "sharp"
import { writeFile } from "node:fs/promises"

const mark = "public/images/alicia-lux-mark.png"
const ivory = { r: 248, g: 245, b: 240, alpha: 1 }

async function tile(size, { padding = 0.12, radius = 0.22, background = ivory } = {}) {
  const inner = Math.round(size * (1 - padding * 2))
  const logo = await sharp(mark).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
  const r = Math.round(size * radius)
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}"/></svg>`)
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, gravity: "center" }, { input: mask, blend: "dest-in" }])
    .png()
    .toBuffer()
}

// ICO container with embedded PNGs (supported by every modern browser).
function ico(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4)
  let offset = 6 + 16 * images.length
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0); e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2); e.writeUInt8(0, 3); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6)
    e.writeUInt32LE(data.length, 8); e.writeUInt32LE(offset, 12)
    offset += data.length
    return e
  })
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)])
}

const sizes = [16, 32, 48]
const icoImages = await Promise.all(sizes.map(async (size) => ({ size, data: await tile(size, { padding: 0.04, radius: 0.2 }) })))
await writeFile("src/app/favicon.ico", ico(icoImages))
await writeFile("src/app/icon.png", await tile(512))
await writeFile("src/app/apple-icon.png", await tile(180, { radius: 0, padding: 0.14 }))
console.log("✓ favicon.ico, icon.png, apple-icon.png")
