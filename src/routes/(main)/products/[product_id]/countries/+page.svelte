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
		model: 'ProductCountry',
		preloads: ['product', 'country'],
		customCols: [
			{
				title: 'General',
				list: [
					'id',
					{
						label: 'Country',
						selection: 'Country',
						multiSelection: true,
						dataList: dataList.countries,
						module: 'Country',
						parentId: data.product_id,
						parent_module: 'ProductCountry'
					}
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Product', data: 'name', through: ['product'] },
			{ label: 'Country', data: 'name', through: ['country'] }
			// { label: 'URL', data: 'route', through: ['app_route'] }
		]
	}}
/>
