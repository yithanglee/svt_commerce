import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	const merchant_id = params.id;
	const [merchant, banners, allProducts] = await Promise.all([
		api_get(url, { scope: 'merchant_profile', merchant_id }).catch(() => null),
		api_get(url, { scope: 'merchant_banners', merchant_id }).catch(() => []),
		api_get(url, { scope: 'ecommerce_products' }).catch(() => [])
	]);
	
	// Filter products by merchant_id
	const products = Array.isArray(allProducts) 
		? allProducts.filter(p => p.merchant_id == merchant_id)
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
		stats: {
			activeListings,
			pendingOrders,
			totalSales,
			earnings: earnings.toFixed(2)
		}
	};
}


