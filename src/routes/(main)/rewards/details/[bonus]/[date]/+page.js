/** @type {import('./$types').PageLoad} */
export const load = async ({ fetch, params, parent }) => {

    console.log(params['bonus'])
    return {
        module: 'Reward',
        bonus: params['bonus'],
        date: params['date']
    };
};