/** @type {import('./$types').PageLoad} */
import { genInputs } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
export const load = async ({ fetch, params, parent }) => {
    let url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
    console.log(url)
    const response = await fetch(url + '/svt_api/webhook?scope=get_sale&id=' + params['id'], {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        let res = await response.json();
        console.log(res)
        return {
            id: params['id'],
            sale: res

        };

    }


};