<script>
	import Datatable from '$lib/components/Datatable.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	/** @type {import('./$types').PageData} */
	export let data;
	onMount(async () => {});

	let module = data.module,
		inputs = data.inputs;
	function viewTransfer(data) {
		goto('/stocks/summaries/' + data.stock_id + '/' + data.location_id + '/stock_movements');
	}
</script>

<Datatable
	data={{
		
		inputs: inputs,
		join_statements: JSON.stringify([
			// { corporate_account: 'corporate_account' },
			{ stock: 'stock' },
			{ location: 'location' }
		]),
		search_queries: ['a.day|a.month|a.year|b.name|c.name'],
		model: data.module,
		preloads: ['stock', 'location'],

		customCols: [
			{
				title: 'General',
				list: ['id']
			}
		],
		buttons: [{ name: 'View', onclickFn: viewTransfer }],

		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Stock', data: 'name', through: ['stock'] },
			{ label: 'Location', data: 'name', through: ['location'] },
			{ label: 'Day', data: 'day' },
			{ label: 'Month', data: 'month' },
			{ label: 'Year', data: 'year' },
			{ label: 'Amount', data: 'amount' }
		]
	}}
/>
