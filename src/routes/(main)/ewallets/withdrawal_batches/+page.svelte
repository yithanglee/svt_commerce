<script>
	import Datatable from '$lib/components/Datatable.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	/** @type {import('./$types').PageData} */
	export let data;
	onMount(async () => {});

	let module = data.module,
		inputs = data.inputs;
	import { buildQueryString, postData } from '$lib/index.js';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	function viewTransfer(data) {
		console.log(data);
		console.log('transfer approved!');
		goto('/ewallets/withdrawal_batches/' + data.id + '/wallet_withdrawals');
	}
	function showCondition(data) {
		var bool = true;
		if (data.paid_date != null) {
			bool = false;
		}
		return bool;
	}
	function approveTokenTransfer(data, checkPage, confirmModal) {
		console.log(data);
		console.log('transfer approved!');

		confirmModal(true, 'Are you sure to approve these withdrawals?', () => {
			postData(
				{ scope: 'approve_token_withdrawal_batch', id: data.id },
				{
					endpoint: url + '/svt_api/webhook',
					successCallback: () => {
						checkPage();
					}
				}
			);
		});
	}
	function approveTransfer(data, checkPage, confirmModal) {
		console.log(data);
		console.log('transfer approved!');

		confirmModal(true, 'Are you sure to approve these withdrawals?', () => {
			postData(
				{ scope: 'approve_withdrawal_batch', id: data.id },
				{
					endpoint: url + '/svt_api/webhook',
					successCallback: () => {
						checkPage();
					}
				}
			);
		});
	}
</script>

<Datatable
	data={{showNew: true, canDelete: true,
		inputs: inputs,
		join_statements: JSON.stringify([]),
		// search_queries: [],
		model: module,
		preloads: [],
		customCols: [
			{
				title: 'General',
				list: [
					{ label: 'code', expose: true },
					{ label: 'day', expose: true },
					{ label: 'month', expose: true },
					{ label: 'year', expose: true },
					{ label: 'remarks', editor2: true },
					'id',
					{ label: 'is_open', boolean: true }
				]
			}
		],
		buttons: [
			
			{ name: 'Approve (Token)', onclickFn: approveTokenTransfer , showCondition: showCondition},
			{ name: 'Approve', onclickFn: approveTransfer , showCondition: showCondition},
			{ name: 'View', onclickFn: viewTransfer }
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Code', data: 'code' },
			{ label: 'Paid', data: 'paid_date' },

			{ label: 'DD', data: 'day' },
			{ label: 'MM', data: 'month' },
			{ label: 'YYYY', data: 'year' },

			{
				label: 'Open?',
				data: 'is_open',
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
			{ label: 'Remarks', data: 'remarks' }
		]
	}}
/>
