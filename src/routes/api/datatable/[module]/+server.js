import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

/** @type {import('./$types').RequestHandler} */

export async function GET({ params, url }) {


    let blog_url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

	const response = await fetch(blog_url + '/api/' + params.module + `${url.search}`, {
        headers: {
            'content-type': 'application/json'
        }
    });
console.log(response)
    return response;
};