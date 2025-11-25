create or replace function public.get_merchant_profile(p_merchant_id bigint)
returns table (
  id bigint,
  name text,
  contact text,
  address text,
  email text,
  shipping_policy text,
  return_policy text,
  logo text,
  background_image text,
  merchant_category text
)
language sql
stable
as $$
  select
    m.id,
    m.name,
    m.contact,
    m.address,
    m.email,
    m.shipping_policy,
    m.return_policy,
    m.logo,
    m.background_image,
    mc.name as merchant_category
  from public.merchants m
  left join public.merchant_categories mc on mc.id = m.merchant_category_id
  where m.id = p_merchant_id
$$;


