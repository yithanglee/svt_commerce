import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

/** @type {import('./$types').PageLoad} */
export async function load() {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	// Expect backend to support this scope returning merchant_products columns
	const productsRes = await api_get(url, { scope: 'ecommerce_products' }).catch(() => []);
	const products = Array.isArray(productsRes) ? productsRes : [];
	return { products };
}

