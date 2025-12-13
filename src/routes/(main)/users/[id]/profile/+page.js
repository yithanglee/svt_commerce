import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT, PHX_COOKIE } from '$lib/constants';
import { redirect } from '@sveltejs/kit';
/** @type {import('./$types').PageLoad} */
export async function load(event) {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

	const { parent, params, cookies, fetch } = event;
	const layoutData = await parent();
	
	// Use params.id as primary source, then layoutData.user.id, then try to get from cookie
	let user_id = params.id || layoutData.user.id;

	console.log('user_id from params:', params.id);
	console.log('user_id from layoutData:', layoutData.user.id);
	console.log('final user_id:', user_id);
	
	// If still no user_id, try to get from cookie (server-side)
	if (!user_id) {
		const cookieToken = cookies.get(PHX_COOKIE);
		if (cookieToken) {
			try {
				const response = await fetch(
					`${PHX_HTTP_PROTOCOL + PHX_ENDPOINT}/svt_api/webhook?scope=get_cookie_merchant&cookie=${cookieToken}`,
					{
						headers: {
							'Content-Type': 'application/json'
						}
					}
				);

				if (response.ok) {
					const res = await response.json();
					if (res && res.user_id) {
						user_id = res.user_id;
					}
				}
			} catch (error) {
				console.error('Error fetching user from cookie:', error);
			}
		}
	}

	// If still no user_id, redirect to login
	if (!user_id) {
		throw redirect(307, '/login');
	}



	console.log('layoutData', layoutData);
	
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
	
	// Fetch user data and orders using the load function's fetch
	const [user, eWallet, ordersResponse] = await Promise.all([
		apiGetWithFetch('model_get_by', { model: 'User', id: user_id }).catch(() => null),
		apiGetWithFetch('model_get_by', { model: 'Ewallet', user_id: user_id, wallet_type: 'active_token' }).catch(() => null),
		apiGetWithFetch('datatable', {
			model: 'Sale',
			preloads: JSON.stringify(['sales_items']),
			additional_search: JSON.stringify([
				{ column: 'user_id', value: user_id, prefix: 'a', operator: '' },
				{ column: 'merchant_id', value: 0, prefix: 'a', operator: '!=' }])
		}).catch(() => ({ data: [] }))
	]);

	// Extract orders from response (response has { data: [...], draw, recordsFiltered, recordsTotal })
	const orders = Array.isArray(ordersResponse?.data) ? ordersResponse.data :
		Array.isArray(ordersResponse) ? ordersResponse : [];
console.log('orders', orders);
	// Separate active and completed orders
	// Active orders: all statuses except delivered, cancelled, or complete
	const activeOrders = orders.filter(order => {
		const status = order.status?.toLowerCase();
		return status === 'pending_confirmation' ||
			status === 'pending_payment' ||
			status === 'processing' ||
			status === 'pending_delivery';
	});

	// Order history: delivered, cancelled, or complete orders
	const orderHistory = orders.filter(order => {
		const status = order.status?.toLowerCase();
		return status === 'sent';
	});

	return {
		user: user || {},

		eWallet: eWallet || {},
		user_id,
		activeOrders: activeOrders || [],
		orderHistory: orderHistory || []
	};
}

