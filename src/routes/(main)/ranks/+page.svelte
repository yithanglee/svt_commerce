<script>
	import Datatable from '$lib/components/Datatable.svelte';
	import { onMount } from 'svelte';
	/** @type {import('./$types').PageData} */
	export let data;
    onMount(async () => {
    
    
    })


	let module = data.module,
		inputs = data.inputs;
</script>

<Datatable
	data={{
		inputs: inputs,
		search_queries: null,
		model: module,
		preloads: [],
		customCols: [
			{
				title: 'General',
				list: [
					'id',
					'name',
					{ label: 'desc', editor2: true },
				]
			},
			{
				title: 'Price',
				list: [
                    'retail_price',
                    'register_point',
                    'point_value',
					
					{ label: 'img_url', upload: true }
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Title', data: 'name' },
			{ label: 'Register P', data: 'register_point' }
		]
	}}
/>
