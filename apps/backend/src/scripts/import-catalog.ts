import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createProductsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"

const finishes = [
  { name: "Coffee Brown", image: "coffee", sku: "ALUX-SIGNATURE-COFFEE" },
  { name: "Champagne", image: "champagne", sku: "ALUX-SIGNATURE-CHAMPAGNE" },
  { name: "Noir", image: "noir", sku: "ALUX-SIGNATURE-NOIR" },
]

const demoProducts: Record<string, string> = {
  "t-shirt": "SHIRT-S-BLACK",
  sweatshirt: "SWEATSHIRT-S",
  sweatpants: "SWEATPANTS-S",
  shorts: "SHORTS-S",
}

export default async function importCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const store = container.resolve(Modules.STORE)
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const handles = finishes.map(({ image }) => `signature-organizer-${image}`)
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "status", "variants.sku"],
    filters: { handle: [...handles, ...Object.keys(demoProducts)] },
  })

  const missing = finishes.filter(({ image }) =>
    !existing.some(({ handle }) => handle === `signature-organizer-${image}`)
  )

  if (missing.length) {
    const [[storeConfig], [shippingProfile]] = await Promise.all([
      store.listStores(),
      fulfillment.listShippingProfiles({ type: "default" }),
    ])
    const salesChannelId = storeConfig?.default_sales_channel_id
    if (!salesChannelId || !shippingProfile) {
      throw new Error("Configure a default sales channel and shipping profile before importing the Alicia Lux catalog.")
    }

    await createProductsWorkflow(container).run({
      input: {
        products: missing.map(({ name, image, sku }) => {
          const imageUrl = `/images/signature-${image}.webp`
          return {
            title: `Signature Jewelry & Beauty Organizer — ${name}`,
            handle: `signature-organizer-${image}`,
            description: `The Alicia Lux Signature Organizer in ${name}, with an illuminated mirror, compartments for beauty essentials, and drawers for jewelry.`,
            thumbnail: imageUrl,
            images: [{ url: imageUrl }],
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            sales_channels: [{ id: salesChannelId }],
            options: [{ title: "Finish", values: [name] }],
            variants: [{
              title: name,
              sku,
              options: { Finish: name },
              manage_inventory: true,
              allow_backorder: false,
              prices: [],
            }],
          }
        }),
      },
    })
  }

  const demos = existing.filter(({ handle, status, variants }) =>
    status === ProductStatus.PUBLISHED
      && Object.prototype.hasOwnProperty.call(demoProducts, handle)
      && variants?.some((variant) => variant?.sku === demoProducts[handle])
  )
  if (demos.length) {
    await updateProductsWorkflow(container).run({
      input: {
        products: demos.map(({ id }) => ({ id, status: ProductStatus.DRAFT })),
      },
    })
  }

  logger.info(`Alicia Lux catalog ready. Created ${missing.length} listing(s); moved ${demos.length} demo product(s) to draft.`)
}
