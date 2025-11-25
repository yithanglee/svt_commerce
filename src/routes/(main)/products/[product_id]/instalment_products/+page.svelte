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
		appendQueries: { instalment_product_id: data.product_id },
		inputs: inputs,
		search_queries: null,
		model: 'InstalmentProduct',
		preloads: ['instalment_product', 'instalment', 'product'],
		customCols: [
			{
				title: 'General',
				list: [
					'id',
				
					{
						label: 'Product',
						selection: 'Product',
						multiSelection: true,
						dataList: dataList.products,
						module: 'Product',
						parentId: data.product_id,
						parent_module: 'InstalmentProduct'
					},
					{label: 'qty', expose: true},
					{label: 'month_no', expose: true},
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Freebie', data: 'name', through: ['product'] },
            { label: 'Month', data: 'month_no' },
			{ label: 'Qty', data: 'qty' }
			// { label: 'URL', data: 'route', through: ['app_route'] }
		]
	}}
/>
