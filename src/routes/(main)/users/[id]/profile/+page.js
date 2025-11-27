import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

/** @type {import('./$types').PageLoad} */
export async function load(event) {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;




	const { parent, params } = event;
	const layoutData = await parent();
	const user_id = layoutData.user.id;
	console.log('layoutData', layoutData);
	// Fetch user data and orders
	const [user, eWallet, ordersResponse] = await Promise.all([
		api_get(url, { scope: 'model_get_by', model: 'User', id: user_id }).catch(() => null),

		api_get(url, { scope: 'model_get_by', model: 'Ewallet', user_id: user_id, wallet_type: 'active_token' }).catch(() => null),
		api_get(url, { scope: 'datatable', model: 'Sale', 
			
			additional_search: JSON.stringify([{ column: 'user_id', value: user_id, prefix: 'a', operator: '' }]) 
		}).catch(() => ({ data: [] }))
	]);

	// Extract orders from response (response has { data: [...], draw, recordsFiltered, recordsTotal })
	const orders = Array.isArray(ordersResponse?.data) ? ordersResponse.data :
		Array.isArray(ordersResponse) ? ordersResponse : [];

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

