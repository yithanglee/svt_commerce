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

	// Pagination (DataTables params expected by backend)
	const perPage = 15;
	const pageParam = searchParams.get('page') || '1';
	const page = Math.max(1, parseInt(pageParam, 10) || 1);
	const start = perPage * (page - 1);

	const additionalSearch = [{ column: 'is_approved', value: true, prefix: 'b', operator: '=' }, { column: 'name', value: true, prefix: 'a', operator: 'not_null' }];
	if (search) {
		additionalSearch.push({ column: 'name', value: search, prefix: 'a', operator: 'ilike' });
	}

	// Fetch products and merchant product categories
	const [productsRes, categoriesRes] = await Promise.all([
		api_get(url, {
			scope: 'datatable',
			model: 'MerchantProduct',
			length: perPage,
			start,
			additional_joins: JSON.stringify([{ join_suffix: 'a', assoc: 'merchant', prefix: 'b' }]),
			additional_search: JSON.stringify(additionalSearch)
		}).catch(() => []),
		api_get(url, { scope: 'datatable', model: 'MerchantProductCategory', length: 200, start: 0 }).catch(
			() => []
		)
	]);

	const products = productsRes?.data && Array.isArray(productsRes.data) ? productsRes.data : [];
	const total = typeof productsRes?.recordsTotal === 'number' ? productsRes.recordsTotal : 0;
	const totalPages = Math.max(1, Math.ceil(total / perPage));
	const categories =
		categoriesRes?.data && Array.isArray(categoriesRes.data)
			? categoriesRes.data
			: Array.isArray(categoriesRes)
			? categoriesRes
			: [];

	return {
		products,
		categories,
		pagination: {
			page,
			perPage,
			start,
			total,
			totalPages
		},
		filters: {
			search,
			merchant_product_category,
			minPrice,
			maxPrice,
			product_condition
		}
	};
}
