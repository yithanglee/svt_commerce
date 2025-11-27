import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

/** @type {import('./$types').PageLoad} */
export async function load(event) {



	const { parent, params } = event;
	const layoutData = await parent();

	console.log('layoutData', layoutData);

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
			let orderUser = null;
			if (sale?.user_id) {
				[orderUser] = await Promise.all([
					api_get(url, { scope: 'model_get_by', model: 'User', id: sale.user_id }).catch(() => null),
					// api_get(url, { scope: 'model_get_by', model: 'Ewallet', user_id: sale.user_id, wallet_type: 'active_token' }).catch(() => null)
				]);
			}

			return {
				sale_id,
				sale: sale || null,
				orderUser: orderUser || {},
				user: layoutData.user || {},
			};
		}

		return {
			sale_id,
			sale: null,
			orderUser: {},
			user: layoutData.user || {},
		};
	} catch (error) {
		console.error('Error loading sale:', error);
		return {
			sale_id,
			sale: null,
			orderUser: {},
			user: layoutData.user || {},
		};
	}
}

