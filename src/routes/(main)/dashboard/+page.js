/** @type {import('./$types').PageLoad} */
import { redirect } from '@sveltejs/kit';
import { session } from '$lib/stores/session';
import { get } from 'svelte/store';

export const load = async ({ fetch, params, parent }) => {
	// Get merchant_id from session
	const sessionData = get(session);
	let merchant_id = null;
	
	if (sessionData && sessionData.loggedIn && sessionData.user) {
		merchant_id = sessionData.user.merchant_id;
	}
	
	// If merchant_id is available, redirect to merchant profile page
	if (merchant_id) {
		throw redirect(307, `/merchants/${merchant_id}/profile`);
	}
	
	// Otherwise redirect to home
	throw redirect(307, '/');
};