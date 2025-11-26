import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	const sale_id = params.id;
	
	try {
		// Fetch sale details
		const response = await fetch(url + '/svt_api/webhook?scope=get_sale&id=' + sale_id, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		
		if (response.ok) {
			const sale = await response.json();
			
			// Fetch user data if user_id exists
			let user = null;
			let eWallet = null;
			if (sale?.user_id) {
				[user, eWallet] = await Promise.all([
					api_get(url, { scope: 'model_get_by', model: 'User', id: sale.user_id }).catch(() => null),
					api_get(url, { scope: 'model_get_by', model: 'Ewallet', user_id: sale.user_id, wallet_type: 'active_token' }).catch(() => null)
				]);
			}
			
			return {
				sale_id,
				sale: sale || null,
				user: user || {},
				eWallet: eWallet || {}
			};
		}
		
		return {
			sale_id,
			sale: null,
			user: {},
			eWallet: {}
		};
	} catch (error) {
		console.error('Error loading sale:', error);
		return {
			sale_id,
			sale: null,
			user: {},
			eWallet: {}
		};
	}
}

