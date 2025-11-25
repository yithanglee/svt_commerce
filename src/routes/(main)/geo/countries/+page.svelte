<script>
	import Datatable from '$lib/components/Datatable.svelte';
	import { buildQueryString } from '$lib/index.js';
	/** @type {import('./$types').PageData} */
	export let data;

	let inputs = data.inputs;
</script>

<Datatable
	data={{
		showNew: true,
		inputs: inputs,

		search_queries: null,
		model: data.module,

		customCols: [
			{
				title: 'General',
				list: ['id', 'name', 'alias', 'currency', 'conversion', { label: 'img_url', upload: true }]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{
				label: 'Country Name',
				data: 'name',
				subtitle: { label: 'Conversion', data: 'conversion' }
			},
			{ label: 'Alias', data: 'alias' },
			{ label: 'Currency', data: 'currency' }
		]
	}}
/>
