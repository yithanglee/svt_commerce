<script>
	import Datatable from '$lib/components/Datatable.svelte';
	/** @type {import('./$types').PageData} */
	export let data;
	let inputs = data.inputs;
	import { goto } from '$app/navigation';
    import { buildQueryString, postData } from '$lib/index.js';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	function viewTransfer(data) {
		console.log(data);
		console.log('transfer approved!');
		goto('/admin/role/' + data.id + '/app_routes2');
	}
</script>

<Datatable
	data={{showNew: true,
		inputs: inputs,
		search_queries: null,
		model: 'Role',
		preloads: [],
		customCols: [
			{
				title: 'General',
				list: [{ label: 'name', expose: true }, { label: 'desc', expose: true }, 'id']
			}
		],
        buttons: [		{ name: 'View', onclickFn: viewTransfer }],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Role', data: 'name' },
			{ label: 'Desc', data: 'desc' }
		]
	}}
/>
