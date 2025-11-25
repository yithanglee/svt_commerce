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
		search_queries: [
			'a.phone',
			'a.name',
			'a.email'
		],
		model: 'Customer',
		preloads: [],
		customCols: [{title: 'General', list: ['id', 'username', 'name', 'email', 'phone']}],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Username', data: 'username' },
			// { label: 'Full', data: 'full_name' },
			{ label: 'Name', data: 'name' },
			{ label: 'Email', data: 'email' },
			{ label: 'Code', data: 'member_code' },
			{ label: 'Phone', data: 'phone' }
		]
	}}
/>
