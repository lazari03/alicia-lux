const sek = new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" })
const sekWhole = new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 })

/** Format integer öre as SEK, dropping ",00" for whole amounts. */
export function formatPrice(ore: number) {
  return ore % 100 === 0 ? sekWhole.format(ore / 100) : sek.format(ore / 100)
}

/** Swedish VAT (25 %) contained in a VAT-inclusive amount. */
export const vatPortion = (ore: number) => Math.round((ore * 25) / 125)

export const shippingFor = (subtotal: number, s: { shipping_fee_ore: number; free_shipping_over_ore: number | null }) =>
  s.free_shipping_over_ore != null && subtotal >= s.free_shipping_over_ore ? 0 : s.shipping_fee_ore
