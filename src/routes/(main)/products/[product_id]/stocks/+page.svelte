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
		appendQueries: { product_id: data.product_id },
		inputs: inputs,
		search_queries: null,
		model: 'ProductStock',
		preloads: ['product', 'stock'],
		customCols: [
			{
				title: 'General',
				list: [
					'id',
				
					{
						label: 'Stock',
						selection: 'Stock',
						multiSelection: true,
						dataList: dataList.stocks,
						module: 'Stock',
						parentId: data.product_id,
						parent_module: 'ProductStock'
					},
					{label: 'qty', expose: true},
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Product', data: 'name', through: ['product'] },
			{ label: 'Stock', data: 'name', through: ['stock'] },
			{ label: 'Qty', data: 'qty' }
			// { label: 'URL', data: 'route', through: ['app_route'] }
		]
	}}
/>
