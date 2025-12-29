import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

/** @type {import('./$types').PageLoad} */
export async function load({ url: urlObj }) {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

	// Get query parameters for filtering
	const searchParams = urlObj.searchParams;
	const search = searchParams.get('search') || '';
	// New param name: merchant_product_category (fallback to legacy "category")
	const merchant_product_category =
		searchParams.get('merchant_product_category') || searchParams.get('category') || '';
	const minPrice = searchParams.get('minPrice') || '';
	const maxPrice = searchParams.get('maxPrice') || '';
	// New param name: product_condition (fallback to legacy "condition")
	const product_condition =
		searchParams.get('product_condition') || searchParams.get('condition') || '';

	// Fetch products and merchant product categories
	const [productsRes, categoriesRes] = await Promise.all([
		api_get(url, { scope: 'datatable', model: 'MerchantProduct', limit: 12, 
			additional_joins: JSON.stringify([{ join_suffix: 'a', assoc: 'merchant', prefix: 'b' }]),
			additional_search: JSON.stringify([{ column: 'is_approved', value: true, prefix: 'b', operator: '=' }]) }).catch(() => []),
		api_get(url, { scope: 'datatable', model: 'MerchantProductCategory', limit: 200 }).catch(
			() => []
		)
	]);

	const products = productsRes?.data && Array.isArray(productsRes.data) ? productsRes.data : [];
	const categories =
		categoriesRes?.data && Array.isArray(categoriesRes.data)
			? categoriesRes.data
			: Array.isArray(categoriesRes)
			? categoriesRes
			: [];

	return {
		products,
		categories,
		filters: {
			search,
			merchant_product_category,
			minPrice,
			maxPrice,
			product_condition
		}
	};
}
