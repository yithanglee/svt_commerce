/** @type {import('./$types').PageLoad} */
import { genInputs } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
import { session } from '$lib/stores/session';
export async function load() {
    let country_id,url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
    let inputs = await genInputs(url, 'Sale')

    session.subscribe((value) => {
		console.info('subscribed session2!');
		console.info (value);
		if (value && value.loggedIn) {
            country_id = value.user.country_id;
		}
		
	});

 
    return {country_id: country_id,
        module: 'Sale',
        inputs: inputs
    };
};