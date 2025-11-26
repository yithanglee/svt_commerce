/** @type {import('./$types').LayoutLoad} */
export async function load({ parent }) {
	return parent();
}