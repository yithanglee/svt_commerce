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
		goto('/deliveries/' + data.id);
	}
</script>

<Datatable
	data={{
		showNew: true,
		canDelete: true,
		inputs: inputs,
		// join_statements: JSON.stringify([
		//   { user: 'user' }
		// ]),
		search_queries: ['a.id|b.name'],
		model: 'Instalment',
		preloads: [],
		buttons: [],
		customCols: [
			{
				title: 'Gemeral',
				list: ['id', 'name', 'no_of_months', 'delay']
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Timestamp', data: 'inserted_at', formatDateTime: true, offset: 8 },
			{ label: 'Name', data: 'name' },
			{ label: 'Months', data: 'no_of_months' }
		]
	}}
/>
