create or replace function public.get_merchant_banners(p_merchant_id bigint)
returns setof public.merchant_banners
language sql
stable
as $$
  select *
  from public.merchant_banners
  where merchant_id = p_merchant_id
    and is_active = true
  order by sort_order asc, id asc;
$$;


