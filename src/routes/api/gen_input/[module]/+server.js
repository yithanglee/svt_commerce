import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
import { buildQueryString } from '$lib/index.js';
/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
    console.log('get req gen inputs')
    console.log(params)
    let url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
    const apiData = {
        scope: 'gen_inputs',
        module: params.module
    };
    const queryString = buildQueryString(apiData);
    const response = await fetch(url + '/svt_api/webhook' + `?${queryString}`, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
};