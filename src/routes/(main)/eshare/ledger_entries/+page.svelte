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
		goto('/eshare/users/' + data.id + '/ledger_entries');
	}
	function showCondition(data) {
		var bool = false;
		if (data.is_approved == false) {
			bool = true;
		}
		return bool;
	}



</script>

<Datatable
	data={{
		showNew: false,
		canDelete: false,
		inputs: inputs,
		join_statements: JSON.stringify([{ user: 'user' }, { asset: 'asset' }]),
		search_queries: ['a.journal', 'b.username', 'b.fullname'],
		model: 'LedgerEntry',
		preloads: ['user', 'asset'],
		buttons: [
		
			
		],
		customCols: [
			{
				title: 'General',
				list: [
					'id',
					
					{label: 'reference', editor2: true},
					
				]
			}
			
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Timestamp', data: 'inserted_at', formatDateTime: true, offset: 8 },
	
			{ label: 'Amount', data: 'amount' },
			{ label: 'Direction', data: 'direction' },
			{ label: 'User', data: 'username', through: ['user'] },
			{ label: 'Asset', data: 'name', through: ['asset'] },
			{
				label: 'Journal',
				data: 'journal',
				isBadge: true,
				color: [
					{
						key: 'cash',
						value: 'green'
					},

					{
						key: 'asset',
						value: 'pink'
					}
				]
			},
			{ label: 'Reference', data: 'reference' },
		]
	}}
/>
