<script>
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { goto } from '$app/navigation';
	import Datatable from '$lib/components/Datatable.svelte';
	import { buildQueryString, postData } from '$lib/index.js';
	/** @type {import('./$types').PageData} */
	export let data;

	let inputs = data.inputs;
	var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

	function viewDO(data, checkPage, confirmModal) {
		goto('/stock_adjustments/' + data.id);
	}

	function doAdjustment(data, checkPage, confirmModal) {
		console.log(data);
		console.log('transfer approved!');

		confirmModal(true, 'Are you sure to perform the adjustment?', () => {
			postData(
				{ scope: 'do_adjustment', id: data.id },
				{
					endpoint: url + '/svt_api/webhook',
					successCallback: () => {
						checkPage();
					}
				}
			);
		});
	}

	function showCondition2(data) {
		var bool = false;
		if (data.status == 'pending') {
			bool = true;
		}
		return bool;
	}
</script>

<Datatable
	data={{
		showNew: true,
		inputs: inputs,
		// join_statements: JSON.stringify([{ user: 'user' }]),
		search_queries: ['a.day|a.month|a.year'],
		model: data.module,
		preloads: [],
		buttons: [
			{ name: 'Details', onclickFn: viewDO },
			// { name: 'Download DO (PDF)', onclickFn: downloadDO },
			// {
			// 	name: 'Mark Pending Delivery',
			// 	onclickFn: doMarkPendingDelivery,
			// 	showCondition: showCondition
			// },
			{ name: 'Execute Adjustment', onclickFn: doAdjustment, showCondition: showCondition2 }
		],
		customCols: [
			{
				title: 'Order',
				list: [
					'id',
					'title',
					'day',
					'month',
					'year',
					{
						label: 'location_id',
						selection: 'PickUpPoint',
                        module: 'PickUpPoint',
						customCols: null,
						search_queries: ['a.name'],
						newData: 'name',
						title_key: 'name'
					},

					'ref_no',
					{ label: 'staff_id', value: 1, hidden: true },
					{ label: 'description', editor2: true }
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{
				label: 'Status',
				data: 'status',
				isBadge: true,
				color: [
					{
						key: 'pending',
						value: 'yellow'
					},

					{
						key: 'complete',
						value: 'green'
					}
				]
			},

			{ label: 'Title', data: 'title' },
			{ label: 'Ref', data: 'ref_no' },
			{ label: 'Timestamp', data: 'inserted_at', formatDateTime: true, offset: 8 }
		]
	}}
/>
