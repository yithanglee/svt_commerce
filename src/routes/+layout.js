import { browser } from '$app/environment';
import { session } from '$lib/stores/session';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data }) {
	if (browser) {
		if (data?.user?.token) {
			session.login(data.user);
		} else {
			session.logout();
		}
	}
console.log('from layout data', data);
	return data;
}