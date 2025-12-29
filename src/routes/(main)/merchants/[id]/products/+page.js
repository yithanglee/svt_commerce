import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

/** @type {import('./$types').PageLoad} */
export async function load(event) {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	const { params } = event;
	const merchant_id = params.id;
	
	const [merchant, banners, allProducts] = await Promise.all([
		api_get(url, { scope: 'model_get_by', model: 'Merchant', id: merchant_id }).catch(() => null),
		api_get(url, { scope: 'merchant_banners', merchant_id }).catch(() => []),
		api_get(url, {
			scope: 'datatable', 
			model: 'MerchantProduct', 
			limit: 100,
			additional_search: JSON.stringify([{ column: 'merchant_id', value: merchant_id, prefix: 'a', operator: '' }])
		}).catch(() => [])
	]);

	// Filter products by merchant_id and only active products
	const products = Array.isArray(allProducts?.data)
		? allProducts.data.filter(p => p.is_active !== false)
		: [];

	return {
		merchant: merchant || {},
		banners: banners || [],
		merchant_id,
		products: products || []
	};
}