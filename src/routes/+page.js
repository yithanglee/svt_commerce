import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

/** @type {import('./$types').PageLoad} */
export async function load({ url: urlObj }) {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

	// Pagination (DataTables params expected by backend)
	const searchParams = urlObj.searchParams;
	const perPage = 8;
	const pageParam = searchParams.get('page') || '1';
	const page = Math.max(1, parseInt(pageParam, 10) || 1);
	const start = perPage * (page - 1);

	// Fetch slides, categories, and products
	const [slidesRes, categoriesRes, productsRes] = await Promise.all([
		api_get(url, { scope: 'ecommerce_slides' }).catch(() => []),
		api_get(url, { scope: 'datatable', model: 'MerchantProductCategory', length: 200, start: 0, additional_order: JSON.stringify([{ prefix: 'a', column: 'name', direction: 'asc' }]) }).catch(
			() => []
		),
		api_get(url, { scope: 'datatable', model: 'MerchantProduct',
			
			additional_joins: JSON.stringify([{ join_suffix: 'a', assoc: 'merchant', prefix: 'b' }]),
			
			additional_search: JSON.stringify([{ column: 'is_approved', value: true, prefix: 'b', operator: '=' }, { column: 'name', value: true, prefix: 'a', operator: 'not_null' }]),
			length: perPage,
			start }).catch(() => [])
	]);

	// Ensure all are arrays
	const slides = Array.isArray(slidesRes) ? slidesRes : [];
	const categories =
		categoriesRes?.data && Array.isArray(categoriesRes.data)
			? categoriesRes.data
			: Array.isArray(categoriesRes)
				? categoriesRes
				: [];
	const products = (productsRes?.data && Array.isArray(productsRes.data)) ? productsRes.data : [];

	const total = typeof productsRes?.recordsTotal === 'number' ? productsRes.recordsTotal : 0;
	const totalPages = Math.max(1, Math.ceil(total / perPage));

	return { 
		slides,
		categories,
		products,
		pagination: {
			page,
			perPage,
			start,
			total,
			totalPages
		}
	};
}

