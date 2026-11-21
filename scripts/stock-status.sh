#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo 'Inventory recorded for the organizer variants:'
docker compose exec -T postgres psql -X -v ON_ERROR_STOP=1 -P pager=off -U medusa -d alicia_lux <<'SQL'
BEGIN READ ONLY;
SELECT
  v.sku,
  COALESCE(location.name, 'No stock level') AS stock_location,
  level.stocked_quantity AS stocked,
  level.reserved_quantity AS reserved,
  level.stocked_quantity - level.reserved_quantity AS available,
  COALESCE(channel.name, 'No matching sales channel') AS sales_channel,
  COALESCE(string_agg(DISTINCT key.title, ', '), 'No active storefront key') AS storefront_keys
FROM product_variant v
LEFT JOIN product_variant_inventory_item item
  ON item.variant_id = v.id AND item.deleted_at IS NULL
LEFT JOIN inventory_level level
  ON level.inventory_item_id = item.inventory_item_id AND level.deleted_at IS NULL
LEFT JOIN stock_location location
  ON location.id = level.location_id AND location.deleted_at IS NULL
LEFT JOIN sales_channel_stock_location channel_location
  ON channel_location.stock_location_id = location.id AND channel_location.deleted_at IS NULL
LEFT JOIN product_sales_channel product_channel
  ON product_channel.product_id = v.product_id
  AND product_channel.sales_channel_id = channel_location.sales_channel_id
  AND product_channel.deleted_at IS NULL
LEFT JOIN sales_channel channel
  ON channel.id = product_channel.sales_channel_id AND channel.deleted_at IS NULL AND NOT channel.is_disabled
LEFT JOIN publishable_api_key_sales_channel key_channel
  ON key_channel.sales_channel_id = channel.id AND key_channel.deleted_at IS NULL
LEFT JOIN api_key key
  ON key.id = key_channel.publishable_key_id AND key.deleted_at IS NULL AND key.revoked_at IS NULL
WHERE v.deleted_at IS NULL AND v.sku IN (
  'ALUX-SIGNATURE-COFFEE', 'ALUX-SIGNATURE-CHAMPAGNE', 'ALUX-SIGNATURE-NOIR'
)
GROUP BY v.sku, location.name, level.stocked_quantity, level.reserved_quantity, channel.name
ORDER BY v.sku, stock_location, sales_channel;
COMMIT;
SQL

port=''
if [[ -r /etc/caddy/Caddyfile ]]; then
  port="$(sed -nE 's/^[[:blank:]]*reverse_proxy[[:blank:]]+127\.0\.0\.1:(900[012])[[:blank:]]*$/\1/p' /etc/caddy/Caddyfile)"
fi
if [[ "$port" =~ ^900[012]$ ]]; then
  export MEDUSA_BACKEND_URL="http://127.0.0.1:$port"
fi

echo 'Availability returned by Medusa for the storefront key:'
node --env-file=apps/storefront/.env.local --input-type=module <<'NODE'
const base = process.env.MEDUSA_BACKEND_URL ?? 'http://127.0.0.1:9000'
const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
if (!key) throw new Error('The storefront publishable key is missing.')
const handles = ['coffee', 'champagne', 'noir'].map(finish => `signature-organizer-${finish}`)
const url = new URL('/store/products', base)
for (const handle of handles) url.searchParams.append('handle[]', handle)
url.searchParams.set('fields', '+variants.inventory_quantity')
const response = await fetch(url, {
  headers: { 'x-publishable-api-key': key },
  signal: AbortSignal.timeout(10000),
})
if (!response.ok) throw new Error(`Medusa returned HTTP ${response.status}.`)
const { products } = await response.json()
for (const handle of handles) {
  const product = products.find(product => product.handle === handle)
  const variants = product?.variants ?? []
  if (!variants.length) console.log(`${handle}: no variants visible to the storefront key`)
  for (const variant of variants) {
    console.log(`${variant.sku}: ${variant.inventory_quantity ?? 'quantity unavailable'}`)
  }
}
NODE
