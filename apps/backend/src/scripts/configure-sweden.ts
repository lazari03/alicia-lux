import { existsSync } from "node:fs"
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  updateProductVariantsWorkflow,
  updateRegionsWorkflow,
  updateServiceZonesWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

// ECB reference rate on 2026-11-20. Prices are stored in major currency units.
const eurToSek = 11.2125
const toSek = (eur: number) => Math.round(eur * eurToSek * 100) / 100
const organizerSkus = ["ALUX-SIGNATURE-COFFEE", "ALUX-SIGNATURE-CHAMPAGNE", "ALUX-SIGNATURE-NOIR"]

export default async function configureSweden({ container }: ExecArgs) {
  const regionService = container.resolve(Modules.REGION)
  const storeService = container.resolve(Modules.STORE)
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const pricing = container.resolve(Modules.PRICING)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const [regions, stores, zones] = await Promise.all([
    regionService.listRegions({}, { relations: ["countries"] }),
    storeService.listStores({}, { relations: ["supported_currencies"] }),
    fulfillment.listServiceZones({}, { relations: ["geo_zones"] }),
  ])
  const sweden = regions.find(({ countries }) => countries?.some(({ iso_2 }) => iso_2 === "se"))
  const swedishZones = zones.filter(({ geo_zones }) => geo_zones?.some(({ country_code }) => country_code === "se"))

  if (!sweden || !stores.length || !swedishZones.length) {
    throw new Error("Configure a store, region, and delivery zone for Sweden in Medusa before deploying.")
  }

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "price_set.id", "price_set.prices.*"],
    filters: { sku: organizerSkus },
  })
  for (const variant of variants) {
    const priceSet = variant.price_set
    if (priceSet?.prices?.some((price) => price?.currency_code === "sek")) continue

    const prices = [{ currency_code: "sek", amount: toSek(220) }]
    if (priceSet?.id) {
      await pricing.addPrices({ priceSetId: priceSet.id, prices })
    } else {
      await updateProductVariantsWorkflow(container).run({
        input: { product_variants: [{ id: variant.id, prices }] },
      })
    }
  }

  const shippingOptions = await fulfillment.listShippingOptions({ price_type: "flat" })
  const shippingZoneIds = new Set(swedishZones.map(({ id }) => id))
  const flatIds = shippingOptions.filter(({ service_zone_id }) => shippingZoneIds.has(service_zone_id)).map(({ id }) => id)
  if (flatIds.length) {
    const { data: shippingPrices } = await query.graph({
      entity: "shipping_option_price_set",
      fields: ["price_set.id", "price_set.prices.*"],
      filters: { shipping_option_id: flatIds },
    })
    for (const { price_set: priceSet } of shippingPrices) {
      if (!priceSet || priceSet.prices?.some((price) => price?.currency_code === "sek")) continue
      const euroPrice = priceSet.prices?.find((price) => price?.currency_code === "eur" && !price.rules_count)
      if (euroPrice) {
        await pricing.addPrices({
          priceSetId: priceSet.id,
          prices: [{ currency_code: "sek", amount: toSek(Number(euroPrice.amount)) }],
        })
      }
    }
  }

  for (const zone of zones) {
    const current = zone.geo_zones ?? []
    const allowed = current.filter(({ country_code }) => country_code === "se")
    if (allowed.length === current.length) continue
    await updateServiceZonesWorkflow(container).run({
      input: {
        selector: { id: zone.id },
        update: { geo_zones: allowed.map(({ id }) => ({ id })) },
      },
    })
  }

  for (const region of regions) {
    const isSwedishRegion = region.id === sweden.id
    const countries = region.countries ?? []
    if (isSwedishRegion ? region.currency_code === "sek" && countries.length === 1 : !countries.length) continue
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: isSwedishRegion ? { countries: ["se"], currency_code: "sek" } : { countries: [] },
      },
    })
  }

  const hostedCheckout = process.env.STRIPE_HOSTED_CHECKOUT === "true" ||
    (process.env.STRIPE_HOSTED_CHECKOUT !== "false" && existsSync(".env.stripe-hosted"))
  if (hostedCheckout || (process.env.STRIPE_API_KEY && process.env.STRIPE_WEBHOOK_SECRET)) {
    const { data: [market] } = await query.graph({
      entity: "region",
      fields: ["id", "payment_providers.id"],
      filters: { id: sweden.id },
    })
    const providerIds = (market?.payment_providers ?? [])
      .flatMap((provider) => provider?.id ? [provider.id] : [])
    const stripeProvider = hostedCheckout ? "pp_stripe-hosted_stripe-hosted" : "pp_stripe_stripe"
    const replacedProviders = ["pp_system_default", hostedCheckout ? "pp_stripe_stripe" : "pp_stripe-hosted_stripe-hosted"]
    if (!providerIds.includes(stripeProvider) || providerIds.some((id) => replacedProviders.includes(id))) {
      await updateRegionsWorkflow(container).run({
        input: {
          selector: { id: sweden.id },
          update: {
            payment_providers: [...new Set([
              ...providerIds.filter((id) => !replacedProviders.includes(id)),
              stripeProvider,
            ])],
          },
        },
      })
    }
  }

  for (const store of stores) {
    if (store.supported_currencies?.some(({ currency_code, is_default }) => currency_code === "sek" && is_default)) continue
    const supportedCurrencies = (store.supported_currencies ?? [])
      .filter(({ currency_code }) => currency_code !== "sek")
      .map(({ currency_code }) => ({ currency_code, is_default: false }))
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: { supported_currencies: [...supportedCurrencies, { currency_code: "sek", is_default: true }] },
      },
    })
  }

  container.resolve(ContainerRegistrationKeys.LOGGER).info("Swedish delivery zones and SEK pricing are configured.")
}
