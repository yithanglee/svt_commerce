/** @type {import('./$types').LayoutLoad} */
import { session } from '$lib/stores/session';
import Cookies from 'js-cookie';
import { redirect } from "@sveltejs/kit";
import { onDestroy } from 'svelte';
import { isToastOpen } from '$lib/stores/toast';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT, PHX_COOKIE } from '$lib/constants';

export async function load({ locals }) {

    console.log("check if this load 1")
    console.log(locals)
    let app_routes = [], session_user, user = { username: 'Guest' }, needLogin = false;


    function relogin() {
        session.logout();
        Cookies.remove('user');
        Cookies.remove(PHX_COOKIE);
        needLogin = true;
    }


    let cookieToken = await Cookies.get(PHX_COOKIE);
    console.log("from main layout js")
    console.log(cookieToken);
    console.log(session.user())


    if (cookieToken != null) {
        const response = await fetch((PHX_HTTP_PROTOCOL + PHX_ENDPOINT) + '/svt_api/webhook?scope=get_cookie_merchant&cookie=' + cookieToken, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // use cookie to call the user
            // from the token get the username data
            let res = await response.json()
            console.log(res)
            if (res != null) {
                session.login({
                    country_id: res.user.country_id,
                    username: res.user.username,
                    token: cookieToken,
                    role_app_routes: [],
                    id: res.user_id,
                    merchant_id: res.merchant_id
                });

                app_routes = [];
               
            } else {

                relogin();
                isToastOpen.notify("Close this window and re login!")
                // redirect(307, '/');
            }

        } else {

            relogin();
            isToastOpen.notify("Close this window and re login!")
            // redirect(307, '/');
        }


    } else {

        relogin();
        isToastOpen.notify("Close this window and re login!")
        // redirect(307, '/');
    }




    return {
        app_routes: app_routes,
        user: user, needLogin: needLogin

    };
}