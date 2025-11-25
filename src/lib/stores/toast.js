import { writable } from 'svelte/store';


function createToast() {
    var map = {
        message: "Your toast message here.",
        open: false

    }
    const { subscribe, set, update } = writable(map);

    return {
        subscribe,
        show: (message) => update((n) => {
            console.log(n)
            return { ...n, open: true, message: message }
        }
        ),
        hide: () => update((n) => {
            console.log(n)
            return { ...n, open: false }
        }
        ),
        open: () => {
            return map.open
        },
        notify: (message) => {
            if (map.open) {
                update((n) => {
                    console.log(n)
                    return { ...n, open: true, message: message }
                }
                )
            } else {
                update((n) => {
                    console.log(n)
                    return { ...n, open: true, message: message }
                }
                )


            }
            setTimeout(() => {
                update((n) => {
                    console.log(n)
                    return { ...n, open: false }
                }
                )
            }, 3500);

        }



    }
}

export const isToastOpen = createToast()

