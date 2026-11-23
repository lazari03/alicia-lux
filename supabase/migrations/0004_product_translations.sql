-- Bilingual product content. The main columns are Swedish (the shop's main
-- language); *_en columns hold English and fall back to Swedish when empty.

set client_min_messages = warning;

alter table public.products add column if not exists name_en        text;
alter table public.products add column if not exists subtitle_en    text;
alter table public.products add column if not exists description_en text;
alter table public.products add column if not exists features_en    text[] not null default '{}';

-- Move the original English launch copy into *_en and write Swedish copy into
-- the main columns — only for products still holding the untouched seed text.
update public.products p set
  description_en = p.description,
  features_en    = p.features,
  description    = s.description,
  features       = s.features
from (values
  ('signature-organizer-coffee-brown',
   'Varm. Fyllig. Självklart tidlös. Alicia Lux Signature Organizer i Coffee Brown, med upplyst spegel, fack för skönhetsprodukter och lådor för smycken.',
   array['Upplyst spegel i centrum av din dagliga ritual', 'Genomtänkta fack för skönhetsfavoriter', 'Lådor för ringar, halsband och armband', 'Mjuka texturer med varma metalldetaljer']),
  ('signature-organizer-champagne',
   'Mjukt ljus, i sin vackraste form. Alicia Lux Signature Organizer i Champagne, med upplyst spegel, fack för skönhetsprodukter och lådor för smycken.',
   array['Upplyst spegel i centrum av din dagliga ritual', 'Genomtänkta fack för skönhetsfavoriter', 'Lådor för ringar, halsband och armband', 'Präglat AL-monogram och dragflik']),
  ('signature-organizer-noir',
   'Ett tyst statement. En bestående klassiker. Alicia Lux Signature Organizer i Noir, med upplyst spegel, fack för skönhetsprodukter och lådor för smycken.',
   array['Upplyst spegel i centrum av din dagliga ritual', 'Genomtänkta fack för skönhetsfavoriter', 'Lådor för ringar, halsband och armband', 'Mjuka texturer med varma metalldetaljer'])
) as s(slug, description, features)
where p.slug = s.slug
  and p.description_en is null
  and p.description like '%Alicia Lux Signature Organizer in%';

grant all on public.products to service_role;
