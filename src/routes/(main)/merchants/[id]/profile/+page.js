import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

/** @type {import('./$types').PageLoad} */
export async function load(event) {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	const { params, fetch } = event;
	const merchant_id = params.id;

	// Helper function to make API calls using the load function's fetch
	async function apiGetWithFetch(scope, params = {}) {
		const apiData = { scope, ...params };
		const queryString = Object.keys(apiData)
			.map((key) => {
				const value = apiData[key];
				if (value == null) return '';
				return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
			})
			.filter(Boolean)
			.join('&');

		const response = await fetch(`${url}/svt_api/webhook?${queryString}`, {
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			return await response.json();
		}
		return null;
	}

	const [
		merchant,
		banners,
		allProducts,
		categories,
		merchantProductCategoriesResponse,
		ordersResponse
	] = await Promise.all([
		api_get(url, { scope: 'merchant_profile', merchant_id }).catch(() => null),
		api_get(url, { scope: 'merchant_banners', merchant_id }).catch(() => []),
		api_get(url, {
			scope: 'datatable',
			model: 'MerchantProduct',
			limit: 100,
			additional_search: JSON.stringify([
				{ column: 'merchant_id', value: merchant_id, prefix: 'a', operator: '' }
			])
		}).catch(() => []),
		api_get(url, { scope: 'ecommerce_categories' }).catch(() => []),
		// Merchant product categories (new FK: merchant_product_category_id)
		api_get(url, { scope: 'datatable', model: 'MerchantProductCategory', limit: 200 }).catch(
			() => ({ data: [] })
		),
		apiGetWithFetch('datatable', {
			model: 'Sale',
			preloads: JSON.stringify(['sales_items', 'user', 'payment']),
			additional_search: JSON.stringify([
				{ column: 'merchant_id', value: merchant_id, prefix: 'a', operator: '' }
			])
		}).catch(() => ({ data: [] }))
	]);

	// Filter products by merchant_id
	const products = Array.isArray(allProducts?.data) ? allProducts?.data : [];

	const merchant_product_categories = Array.isArray(merchantProductCategoriesResponse?.data)
		? merchantProductCategoriesResponse.data
		: [];

	// Extract orders from response
	const orders = Array.isArray(ordersResponse?.data)
		? ordersResponse.data
		: Array.isArray(ordersResponse)
		? ordersResponse
		: [];

	// Separate active and completed orders
	const activeOrders = orders.filter((order) => {
		const status = order.status?.toLowerCase();
		return (
			status === 'pending_confirmation' ||
			status === 'pending_payment' ||
			status === 'processing' ||
			status === 'preparing' ||
			status === 'pending_delivery'
		);
	});

	// Order history: sent, complete, cancelled, refund
	const orderHistory = orders.filter((order) => {
		const status = order.status?.toLowerCase();
		return (
			status === 'sent' || status === 'complete' || status === 'cancelled' || status === 'refund'
		);
	});

	// Calculate stats from actual orders
	const activeListings = products.filter((p) => p.is_active !== false).length;
	const pendingOrders = activeOrders.length;
	const totalSales = orders.length;
	const earnings = orders
		.filter((o) => o.status?.toLowerCase() === 'sent' || o.status?.toLowerCase() === 'complete')
		.reduce((sum, o) => sum + (parseFloat(o.grand_total) || 0), 0);

	return {
		merchant: merchant || {},
		banners: banners || [],
		merchant_id,
		products: products || [],
		categories: Array.isArray(categories) ? categories : [],
		merchant_product_categories,
		orders: orders || [],
		activeOrders: activeOrders || [],
		orderHistory: orderHistory || [],
		stats: {
			activeListings,
			pendingOrders,
			totalSales,
			earnings: earnings.toFixed(2)
		}
	};
}
