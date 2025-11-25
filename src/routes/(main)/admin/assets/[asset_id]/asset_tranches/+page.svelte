<script>
	import Datatable from '$lib/components/Datatable.svelte';
	/** @type {import('./$types').PageData} */
	export let data;
	let inputs = data.inputs,
		dataList = data.dataList;
</script>

<Datatable
	data={{
		showNew: true,
		canDelete: true,
		appendQueries: { asset_id: data.asset_id },
		inputs: inputs,
		search_queries: null,
		model: 'AssetTranche',
		preloads: ['asset'],
		customCols: [
			{
				title: 'General',
				list: [
					'id',

					{
						label: 'asset_id',
						selection: 'Asset',
						customCols: null,
						search_queries: ['a.name'],
						newData: 'name',
						title_key: 'name'
					},
					{ label: 'state', selection: ['upcoming', 'open', 'closed'] },
					'seq',
					'quantity',
					'qty_sold',
					'unit_price'
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Asset', data: 'name', through: ['asset'] },
			{ label: 'Quantity', data: 'quantity' },
			{ label: 'Qty Sold', data: 'qty_sold' },
			{ label: 'Unit Price', data: 'unit_price' },
			{
				label: 'State',
				data: 'state',
				isBadge: true,
				color: [
					{
						key: 'upcoming',
						value: 'yellow'
					},
					{
						key: 'open',
						value: 'blue'
					},
					{
						key: 'closed',
						value: 'red'
					},
					
				]
			},
	
			// { label: 'Released At', data: 'released_at', formatDateTime: true, offset: 8 },
			{ label: 'Seq', data: 'seq' }
		]
	}}
/>
