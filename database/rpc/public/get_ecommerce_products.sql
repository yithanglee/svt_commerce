create or replace function public.get_ecommerce_products()
returns table (
  id bigint,
  merchant_id bigint,
  name text,
  desc text,
  retail_price numeric,
  img_url text
)
language sql
stable
as $$
  select
    mp.id,
    mp.merchant_id,
    mp.name,
    mp.desc,
    mp.retail_price,
    mp.img_url
  from public.merchant_products mp
  where coalesce(mp.is_active, true) = true
  order by mp.id desc;
$$;


