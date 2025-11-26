import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	const merchant_id = params.id;
	const [merchant, banners, allProducts, categories] = await Promise.all([
		api_get(url, { scope: 'merchant_profile', merchant_id }).catch(() => null),
		api_get(url, { scope: 'merchant_banners', merchant_id }).catch(() => []),
		api_get(url, {
			scope: 'datatable', model: 'MerchantProduct', limit: 100,

			additional_search: JSON.stringify([{ column: 'merchant_id', value: merchant_id, prefix: 'a', operator: '' }])
			
		}).catch(() => []),
		api_get(url, { scope: 'ecommerce_categories' }).catch(() => [])
	]);

	// Filter products by merchant_id
	// allProducts = {"data":[{"brand_name":"raspberry","category_name":"IOT","description":"123","id":4,"img_url":"/images/uploads/Screenshot from 2025-11-26 15-40-13.png","img_url2":null,"img_url3":null,"img_url4":null,"inserted_at":"2025-11-26T13:20:33","merchant":null,"merchant_id":7,"name":"pi 4","override_pv":null,"point_value":1.0,"retail_price":123.0,"short_desc":"123","updated_at":"2025-11-26T13:20:33"}],"draw":1,"recordsFiltered":1,"recordsTotal":1}
	const products = Array.isArray(allProducts?.data)
		? allProducts?.data
		: [];

	// Calculate stats from products
	const activeListings = products.filter(p => p.is_active !== false).length;
	const totalSales = products.length; // This would need actual sales data
	const pendingOrders = 0; // This would need actual order data
	const earnings = products.reduce((sum, p) => sum + (parseFloat(p.retail_price) || 0), 0);

	return {
		merchant: merchant || {},
		banners: banners || [],
		merchant_id,
		products: products || [],
		categories: Array.isArray(categories) ? categories : [],
		stats: {
			activeListings,
			pendingOrders,
			totalSales,
			earnings: earnings.toFixed(2)
		}
	};
}


