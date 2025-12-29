import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

/** @type {import('./$types').PageLoad} */
export async function load() {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	
	// Fetch slides, categories, and products
	const [slidesRes, categoriesRes, productsRes] = await Promise.all([
		api_get(url, { scope: 'ecommerce_slides' }).catch(() => []),
		api_get(url, { scope: 'ecommerce_categories' }).catch(() => []),
		api_get(url, { scope: 'datatable', model: 'MerchantProduct',
			additional_joins: JSON.stringify([{ join_suffix: 'a', assoc: 'merchant', prefix: 'b' }]),
			additional_search: JSON.stringify([{ column: 'is_approved', value: true, prefix: 'b', operator: '=' }]),
			limit: 8 }).catch(() => [])
	]);
	
	// Ensure all are arrays
	const slides = Array.isArray(slidesRes) ? slidesRes : [];
	const categories = Array.isArray(categoriesRes) ? categoriesRes : [];
	const products = (productsRes?.data && Array.isArray(productsRes.data)) ? productsRes.data : [];
	
	return { 
		slides,
		categories,
		products
	};
}

