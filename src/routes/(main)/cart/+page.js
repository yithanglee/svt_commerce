/** @type {import('./$types').PageLoad} */
import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
export async function load(event) { 
    const { parent } = event;
    const layoutData = await parent();

    console.log('layoutData', layoutData);
    // layoutData {
    //     app_routes: [],
    //     user: {
    //       country_id: 1,
    //       username: 'SUZIE',
    //       token: 'SFMyNTY.g2gDbQAAAAVTVVpJRW4GALlDo72aAWIAAVGA.UsnTSc70NAHEz95-BHFkpuG3y7rUG4tVKV_V8_a453M',
    //       role_app_routes: [],
    //       id: 44,
    //       merchant_id: null
    //     },
    //     needLogin: false
    //   }
      
    const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
    console.log('url', url);
    const user = layoutData?.user || {};
    const user_id = user?.id;
    console.log('user_id', user_id);
    const [eWallet] = await Promise.all([
        api_get(url, { scope: 'model_get_by', model: 'Ewallet', user_id: user_id, wallet_type: 'active_token' }).catch(() => null)
    ]);
    console.log('eWallet', eWallet);
    return { eWallet: eWallet || {} };
};