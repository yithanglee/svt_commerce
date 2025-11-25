<script>
	import Datatable from '$lib/components/Datatable.svelte';
	/** @type {import('./$types').PageData} */
	export let data;
	let inputs = data.inputs,
		dataList = data.dataList;
</script>

<Datatable
	data={{
		appendQueries: { stock_adjustment_id: data.id },
		showNew: true,
		canDelete: true,
		//   appendQueries: { : data. },
		inputs: inputs,
		search_queries: null,
		model: 'StockAdjustmentLine',
		preloads: ['stock'],
		customCols: [
			{
				title: 'General',
				list: [
					'id',

					{
						label: 'qty',
						customValidation: true,
						fn: (val) => {
							console.info(val);
							if (val.includes('+') || val.includes('-')) {
							} else {
								alert('please input +/- operators!');
								var dom = document.getElementsByName('StockAdjustmentLine[qty]')[0];
								dom.value = null;
							}
						}
					},
					{ label: 'stock_adjustment_id', hidden: true, value: data.id },
					{
						label: 'stock_id',
						selection: 'Stock',
						module: 'Stock',
						customCols: null,
						search_queries: ['a.name'],
						newData: 'name',
						title_key: 'name'
					}
					// {
					//   label: '',
					//   selection: '',
					//   multiSelection: true,
					//   dataList: dataList.,
					//   module: '',
					//   parentId: data.,
					//   parent_module: 'StockAdjustmentLine'
					// }
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Qty', data: 'qty' , showPrefix: true},
			{ label: 'Stock', data: 'name', through: ['stock'] }
			// { label: 'URL', data: 'route', through: ['app_route'] }
		]
	}}
/>
