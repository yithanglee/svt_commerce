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
		join_statements: JSON.stringify([{ user: 'user' }]),
		search_queries: ['a.id|b.username'],
		model: 'MemberInstalment',
		preloads: ['user', 'product', 'instalment'],
		buttons: [],
		customCols: [
			{
				title: 'Gemeral',
				list: ['id', { label: 'is_paid', boolean: true }]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Timestamp', data: 'inserted_at', formatDateTime: true, offset: 8 },
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
			{ label: 'Instalment Months', data: 'no_of_months', through: ['instalment'] },
			{ label: 'Month', data: 'month_no' },
            { label: 'Due Date', data: 'due_date' },
			{ label: 'Plan', data: 'name', through: ['product'] },
			{ label: 'Member', data: 'username', through: ['user'] }
		]
	}}
/>
