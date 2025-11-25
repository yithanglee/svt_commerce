import { writable } from 'svelte/store';


function createReload() {
    var map = {

        open: false

    }
    const { subscribe, set, update } = writable(map);

    return {
        subscribe,
        activate: () => {


            update((n) => {
                console.log(n)
                return { ...n, open: true }
            })

            setTimeout(() => {
                update((n) => {
                    console.log(n)
                    return { ...n, open: false }
                }
                )
            }, 3500);

        },
        open: () => {
            return map.open
        }


    }
}

export const isTableReloaded = createReload()

