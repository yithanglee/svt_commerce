/** @type {import('./$types').PageLoad} */
import { genInputs } from '$lib/index.js';
import { postData, buildQueryString } from '$lib/index.js';

import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
export const load = async ({ fetch, params, parent }) => {

    let url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
    let inputs = await genInputs(url, 'RoleAppRoute')
    const queryString = buildQueryString({ scope: "get_role_app_routes", id: params["role_id"] });
    const response = await fetch(url + '/svt_api/webhook?' + queryString, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        let dataList = await response.json();

        return {
            dataList: dataList,
            role_id: params['role_id'],
            module: 'RoleAppRoute',
            inputs: inputs
        };
    }



};