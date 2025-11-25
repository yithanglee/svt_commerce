/** @type {import('./$types').PageLoad} */

import { genInputs, postData, buildQueryString } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
export const load = async () => {
let url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT ,module;

let inputs = await genInputs(url, 'Slide')
  return {module: 'Slide',
    inputs: inputs
  };
};

