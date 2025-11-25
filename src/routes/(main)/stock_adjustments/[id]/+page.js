/** @type {import('./$types').PageLoad} */

import { genInputs, postData, buildQueryString } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
export const load = async ({ fetch, params, parent }) => {
let url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT ,module;

let inputs = await genInputs(url, 'StockAdjustmentLine'), scope = "get_product_countries";

// const queryString = buildQueryString({ scope: scope, id: params[""] });
// const response = await fetch(url + '/svt_api/webhook?' + queryString, {
//   headers: {
//         'Content-Type': 'application/json'
//     }
// });
//   if (response.ok) {
    //   let dataList = await response.json();
      return {
        //   dataList: dataList,
          id: params['id'],
          module: 'StockAdjustmentLine',
          inputs: inputs
      };
//   }
};

