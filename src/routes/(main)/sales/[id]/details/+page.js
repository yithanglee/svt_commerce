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
			return {
				sale_id,
				sale: sale || null
			};
		}
		
		return {
			sale_id,
			sale: null
		};
	} catch (error) {
		console.error('Error loading sale:', error);
		return {
			sale_id,
			sale: null
		};
	}
}

