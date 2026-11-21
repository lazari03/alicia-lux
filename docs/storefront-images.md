# Storefront campaign imagery

The user selected previously created Alicia Lux renders for the storefront. The catalog import uses these campaign images as the thumbnails and gallery images for the matching organizer listings.

| Local asset | Original image |
| --- | --- |
| `apps/storefront/public/images/signature-coffee.webp` | Luxury Brown Jewelry Makeup Box.png |
| `apps/storefront/public/images/signature-champagne.webp` | Luxury Champagne Beauty Organizer.png |
| `apps/storefront/public/images/signature-noir.webp` | Luxury ALICIA LUX Jewelry Organizer.png |

Each original is 1254 × 1254 pixels. WebP derivatives preserve the full composition, with quality 87, no crop and no upscale. The three assets total approximately 474 KiB. Next Image supplies responsive sizes; the hero is prioritized and below-the-fold images are lazy loaded.

The deployment runs `make catalog-import` after migrations. This creates any missing organizer listings and moves matching demo apparel to draft. The deployment initializes missing SEK prices at 2,466.75 kr per finish, based on the ECB reference rate of 11.2125 SEK per euro on 2026-11-20. Set inventory in Medusa Admin to make the organizers purchasable. Re-running the import preserves existing organizer records and their settings.
