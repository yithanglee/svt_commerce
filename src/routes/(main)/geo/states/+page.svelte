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
		preloads: ['country'],

		customCols: [
			{
				title: 'General',
				list: [
					'id',
					'name',
					'shortcode',
					{
						label: 'country_id',
						selection: 'Country',
						module: 'Country',
						customCols: null,
						search_queries: ['a.name'],
						newData: 'name',
						title_key: 'name'
					}
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{
				label: 'State Name',
				data: 'name',
				subtitle: { label: 'shortcode', data: 'shortcode' }
			},
			{ label: 'Country', data: 'name', through: ['country'] }
		]
	}}
/>
