import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT, PHX_COOKIE } from '$lib/constants';

/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ cookies, fetch }) => {
	const defaultUser = { username: 'Guest' };
	let app_routes = [];
	let needLogin = false;
	let user = defaultUser;

	const cookieToken = cookies.get(PHX_COOKIE);

	if (!cookieToken) {
		return { app_routes, user, needLogin: true };
	}

	try {
		const response = await fetch(
			`${PHX_HTTP_PROTOCOL + PHX_ENDPOINT}/svt_api/webhook?scope=get_cookie_merchant&cookie=${cookieToken}`,
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);

		if (!response.ok) {
			needLogin = true;
		} else {
			const res = await response.json();

			if (res) {
				user = {
					country_id: res.user?.country_id,
					username: res.user?.username,
					rank_name: res.user?.rank?.name,
					token: cookieToken,
					role_app_routes: res.role_app_routes ?? [],
					id: res.user_id,
					merchant_id: res.merchant_id
				};

				app_routes = res.role_app_routes ?? res.app_routes ?? [];
			} else {
				needLogin = true;
			}
		}
	} catch (error) {
		console.error('Failed to fetch user from cookie token', error);
		needLogin = true;
	}

	return {
		app_routes,
		user,
		needLogin
	};
};

