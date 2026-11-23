-- Alicia Lux catalog seed. Idempotent: re-running updates copy and images
-- but never overwrites stock, price or visibility you changed in the admin.
-- psql variables (set by scripts/supabase-setup.sh):
--   :stock         initial stock per product
--   :shipping_ore  flat shipping fee in öre

insert into public.products
  (slug, name, subtitle, description, features, description_en, features_en, price_ore, images, swatch, stock, active, featured, sort_order)
values
  ('signature-organizer-coffee-brown',
   'Signature Organizer',
   'Coffee Brown',
   'Varm. Fyllig. Självklart tidlös. Alicia Lux Signature Organizer i Coffee Brown, med upplyst spegel, fack för skönhetsprodukter och lådor för smycken.',
   array['Upplyst spegel i centrum av din dagliga ritual',
         'Genomtänkta fack för skönhetsfavoriter',
         'Lådor för ringar, halsband och armband',
         'Mjuka texturer med varma metalldetaljer'],
   'Warm. Rich. Effortlessly timeless. The Alicia Lux Signature Organizer in Coffee Brown, with an illuminated mirror, compartments for beauty essentials and drawers for jewelry.',
   array['Illuminated mirror at the heart of your daily ritual',
         'Considered compartments for beauty essentials',
         'Drawers for rings, necklaces and bracelets',
         'Soft textures with warm metallic accents'],
   246675,
   array['/images/signature-coffee.webp', '/images/signature-closed.webp'],
   '#583b2a', :stock, true, true, 1),
  ('signature-organizer-champagne',
   'Signature Organizer',
   'Champagne',
   'Mjukt ljus, i sin vackraste form. Alicia Lux Signature Organizer i Champagne, med upplyst spegel, fack för skönhetsprodukter och lådor för smycken.',
   array['Upplyst spegel i centrum av din dagliga ritual',
         'Genomtänkta fack för skönhetsfavoriter',
         'Lådor för ringar, halsband och armband',
         'Präglat AL-monogram och dragflik'],
   'Soft light, in its most beautiful form. The Alicia Lux Signature Organizer in Champagne, with an illuminated mirror, compartments for beauty essentials and drawers for jewelry.',
   array['Illuminated mirror at the heart of your daily ritual',
         'Considered compartments for beauty essentials',
         'Drawers for rings, necklaces and bracelets',
         'Embossed AL monogram and pull tab'],
   246675,
   array['/images/signature-champagne.webp', '/images/signature-closed.webp'],
   '#d6ba95', :stock, true, true, 2),
  ('signature-organizer-noir',
   'Signature Organizer',
   'Noir',
   'Ett tyst statement. En bestående klassiker. Alicia Lux Signature Organizer i Noir, med upplyst spegel, fack för skönhetsprodukter och lådor för smycken.',
   array['Upplyst spegel i centrum av din dagliga ritual',
         'Genomtänkta fack för skönhetsfavoriter',
         'Lådor för ringar, halsband och armband',
         'Mjuka texturer med varma metalldetaljer'],
   'A quiet statement. An enduring classic. The Alicia Lux Signature Organizer in Noir, with an illuminated mirror, compartments for beauty essentials and drawers for jewelry.',
   array['Illuminated mirror at the heart of your daily ritual',
         'Considered compartments for beauty essentials',
         'Drawers for rings, necklaces and bracelets',
         'Soft textures with warm metallic accents'],
   246675,
   array['/images/signature-noir.webp', '/images/signature-closed.webp'],
   '#26231f', :stock, true, true, 3)
on conflict (slug) do update set
  name        = excluded.name,
  subtitle    = excluded.subtitle,
  description    = excluded.description,
  features       = excluded.features,
  description_en = excluded.description_en,
  features_en    = excluded.features_en,
  images      = excluded.images,
  swatch      = excluded.swatch;

update public.store_settings set shipping_fee_ore = :shipping_ore where id;
