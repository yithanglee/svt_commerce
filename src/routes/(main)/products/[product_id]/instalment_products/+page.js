/** @type {import('./$types').PageLoad} */
import { genInputs } from '$lib/index.js';
import { postData, buildQueryString } from '$lib/index.js';

import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
export const load = async ({ fetch, params, parent }) => {

    let url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
    let inputs = await genInputs(url, 'ProductCountry')
    const queryString = buildQueryString({ scope: "get_product_countries", id: params["product_id"] });
    const response = await fetch(url + '/svt_api/webhook?' + queryString, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        let dataList = await response.json();
        return {
            dataList: dataList,
            product_id: params['product_id'],
            module: 'ProductStock',
            inputs: inputs
        };
    }
};