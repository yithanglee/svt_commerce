<script>
	import Datatable from '$lib/components/Datatable.svelte';
	/** @type {import('./$types').PageData} */
	export let data;
    import { goto } from '$app/navigation';
	let inputs = data.inputs;
    function viewTransfer(data) {
		console.log(data);
		console.log('transfer approved!');
		goto('/admin/assets/' + data.id + '/asset_tranches');
	}
</script>

<Datatable
	data={{showNew: true,
		inputs: inputs,
		search_queries: null,
		model: 'Asset',
		preloads: [],
        buttons: [{ name: 'View', onclickFn: viewTransfer }],
		customCols: [
			{
				title: 'General',
				list: [
					'name',
					
                    'total_supply_cap',
					'base_price',
					'price_increment_type',
					'price_increment_value',
			
					'id'
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
            { label: 'Name', data: 'name' },
            { label: 'Base Price', data: 'base_price' },
            { label: 'Price Increment Type', data: 'price_increment_type' },
            { label: 'Price Increment Value', data: 'price_increment_value' },
     

            { label: 'Total Supply Cap', data: 'total_supply_cap' },
            { label: 'Status', data: 'status' },
  
 
            { label: 'Min Order Qty', data: 'min_order_qty' },
            { label: 'Created At', data: 'inserted_at', formatDateTime: true, offset: 8 },
   
		]
	}}
/>
