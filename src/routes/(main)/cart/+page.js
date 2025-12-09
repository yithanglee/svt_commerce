/** @type {import('./$types').PageLoad} */
import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
export async function load(event) { 
    const { parent } = event;
    const layoutData = await parent();

    const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
    console.log('url', url);
    const user = layoutData?.user || {};
    const user_id = user?.id;
    console.log('user_id', user_id);
    const [eWallet, userSaleAddresses] = await Promise.all([
        api_get(url, { scope: 'model_get_by', model: 'Ewallet', user_id: user_id, wallet_type: 'active_token' }).catch(() => null),
        api_get(url, { scope: 'datatable', model: 'UserSalesAddress', 
            additional_search: JSON.stringify([{ column: 'user_id', value: user_id, prefix: 'a', operator: '' }])


            
         }).catch(() => null)
    ]);
    console.log('eWallet', eWallet);
    return { eWallet: eWallet || {}, userSaleAddresses: userSaleAddresses || [] };
};