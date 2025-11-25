<script>
	import Datatable from '$lib/components/Datatable.svelte';
	import { buildQueryString } from '$lib/index.js';
	/** @type {import('./$types').PageData} */
	export let data;

	let inputs = data.inputs;
</script>

<Datatable
	data={{
		inputs: inputs,
		join_statements: JSON.stringify([
			{ corporate_account: 'corporate_account' },
			{ customer: 'customer' }
		]),
		search_queries: ['a.delivery_ref', 'b.username|b.name', 'c.name'],
		model: 'CustomerOrder',
		preloads: ['user', 'customer'],
		customCols: [
			{
				title: 'Order',
				list: ['id', 'delivery_ref', 'remarks', { label: 'customer_id', expose: true }]
			},
			{ title: 'Customer', list: ['receiver_name', 'receiver_phone'] }
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{
				label: 'Delivery Ref',
				data: 'delivery_ref',
				subtitle: { label: 'Courier', data: 'delivery_method' }
			},
			{ label: 'Order Date', data: 'date' },
			{
				label: 'Status',
				data: 'status',
				isBadge: true,
				color: [
					{
						key: 'pending_confirmation',
						value: 'yellow'
					},
					{
						key: 'pending_processing',
						value: 'blue'
					},
					{
						key: 'pending_delivery',
						value: 'green'
					}
				]
			},
			{ label: 'Customer', data: 'name', through: ['customer'] },
			{ label: 'Receiver', data: 'receiver_name', subtitle: { label: 'Phone', data: 'receiver_phone' } },
			
		]
	}}
/>
