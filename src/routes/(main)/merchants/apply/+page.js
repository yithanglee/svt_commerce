import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT, PHX_COOKIE } from '$lib/constants';
import Cookies from 'js-cookie';
import { goto } from '$app/navigation';
/** @type {import('./$types').PageLoad} */
export async function load({  }) {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	let merchant = null;
	let user_id = null;

	// Get cookie token - use SvelteKit's cookies API for server-side compatibility
	const cookieToken = Cookies.get(PHX_COOKIE);

	if (cookieToken) {
		try {
			// First, get user info from cookie to get user_id
			const userResponse = await fetch(
				url + '/svt_api/webhook?scope=get_cookie_merchant&cookie=' + cookieToken,
				{
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);

			if (userResponse.ok) {
				const userData = await userResponse.json();
				if (userData && userData.user_id) {
					user_id = userData.user_id;

					// Query merchant for this user_id
					merchant = await api_get(url, {
						scope: 'model_get_by', 
                        model: 'Merchant',
						user_id: user_id
					}).catch(() => null);

                    console.log('merchant 1', merchant);



                    if (merchant && merchant.is_approved == true) {
                        goto(`/merchants/${merchant.id}/profile`);
                    }
				}
			}
		} catch (error) {
			console.error('Error fetching merchant:', error);
		}
	}

	return {
		merchant: merchant || null,
		user_id: user_id || null
	};
}