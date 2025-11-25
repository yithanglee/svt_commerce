import { writable } from 'svelte/store';

function createSession() {
    var map = {
        user: null,
        loggedIn: false,
        token: null

    }
    const { subscribe, set, update } = writable(map);

    return {
        subscribe,
        set,
        login: (user) => update((n) => {
            console.log(n)
            return { ...n, loggedIn: true, user: user }
        }
        ),
        logout: () => update((n) => {
            return { ...n, loggedIn: false, user: null }
        }
        ),
        user: () => {
            return map.user
        },


    }
}

export const session = createSession()


