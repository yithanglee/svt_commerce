-- public.merchant_banners
CREATE TABLE IF NOT EXISTS public.merchant_banners (
  id BIGSERIAL PRIMARY KEY,
  merchant_id BIGINT NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  link_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_banners_merchant_id ON public.merchant_banners(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_banners_active_sort ON public.merchant_banners(is_active, sort_order);


