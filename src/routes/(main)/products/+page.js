/** @type {import('./$types').PageLoad} */
import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

export async function load({ url: urlObj }) {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	
	// Get query parameters for filtering
	const searchParams = urlObj.searchParams;
	const search = searchParams.get('search') || '';
	const category = searchParams.get('category') || '';
	const minPrice = searchParams.get('minPrice') || '';
	const maxPrice = searchParams.get('maxPrice') || '';
	const condition = searchParams.get('condition') || '';
	
	// Fetch products and categories
	const [productsRes, categoriesRes] = await Promise.all([
		api_get(url, { scope: 'ecommerce_products' }).catch(() => []),
		api_get(url, { scope: 'ecommerce_categories' }).catch(() => [])
	]);
	
	const products = Array.isArray(productsRes) ? productsRes : [];
	const categories = Array.isArray(categoriesRes) ? categoriesRes : [];
	
	return {
		products,
		categories,
		filters: {
			search,
			category,
			minPrice,
			maxPrice,
			condition
		}
	};
}