<script>
	import Datatable from '$lib/components/Datatable.svelte';
	import { onMount } from 'svelte';
	/** @type {import('./$types').PageData} */
	export let data;
	onMount(async () => {});

	let module = data.module, batch_id = data.id,
		inputs = data.inputs;
	import { buildQueryString, postData } from '$lib/index.js';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	function approveTransfer(data, checkPage, confirmModal) {
		console.log(data);
		console.log('transfer approved!');

		confirmModal(true, 'Are you sure to approve this merchant withdrawal?', () => {
			postData(
				{ scope: 'approve_merchant_withdrawal', id: data.id },
				{
					endpoint: url + '/svt_api/webhook',
					successCallback: () => {
						checkPage();
					}
				}
			);
		});
	}
    function showCondition(data) {
		var bool = true;
		if (data.is_paid) {
			bool = false;
		}

		return bool;
	}

</script>

<Datatable
	data={{
		inputs: inputs,
		join_statements: JSON.stringify([
			// { corporate_account: 'corporate_account' },
			{ merchant: 'merchant' }
		]),
		search_queries: ['b.name'],
		model: module,
		preloads: ['merchant'],
		customCols: [
			{
				title: 'General',
				list: [
					'id',
					'merchant_id',
					'amount',
					'bank_name',
					'bank_account_number',
					'remarks',
					
					// { label: 'is_approved', boolean: true }
				]
			}
		],
        buttons: [
			{ name: 'Approve', onclickFn: approveTransfer, showCondition: showCondition },
		
		],
		columns: [
			{ label: 'ID', data: 'id' },
            { label: 'Timestamp', data: 'inserted_at', formatDateTime: true , offset: 8},
		
			{ label: 'Bank', data: 'bank_name' },	
			{ label: 'Acc No', data: 'bank_account_number' },
			{
				label: 'Paid?',
				data: 'is_paid',
				isBadge: true,
				color: [
					{
						key: false,
						value: 'yellow'
					},

					{
						key: true,
						value: 'green'
					}
				]
			},

			{ label: 'From', data: 'name', through: ['merchant'] },
			{ label: 'Amount', data: 'amount' },
			{ label: 'Remarks', data: 'remarks' }
		]
	}}
/>
