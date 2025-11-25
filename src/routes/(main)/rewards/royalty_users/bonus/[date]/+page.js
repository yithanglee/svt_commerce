/** @type {import('./$types').PageLoad} */

import { postData, buildQueryString } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
export const load = async ({ fetch, params, parent }) => {

    let url2 = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
    const apiData = params;
    const queryString = buildQueryString(apiData);

    return {
        date: params.date,
     
    };
    
};