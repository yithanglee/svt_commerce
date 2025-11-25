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
		preloads: [],

		customCols: [
			{
				title: 'General',
				list: [
					'id',
					'name',
					'desc',
					
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
            { label: 'Name', data: 'name' },
            { label: 'Desc', data: 'desc' },
		]
	}}
/>
