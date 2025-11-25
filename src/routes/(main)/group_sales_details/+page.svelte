<script>
	import Datatable from '$lib/components/Datatable.svelte';
	import { onMount } from 'svelte';
	/** @type {import('./$types').PageData} */
	export let data;
	onMount(async () => {});

	let module = data.module,
		inputs = data.inputs;
</script>

<Datatable
	data={{
		inputs: inputs,
		join_statements: JSON.stringify([
			// { corporate_account: 'corporate_account' },
			{ to_user: 'to_user' },
			{ from_user: 'from_user' },
			{ gs_summary: 'gs_summary' }
		]),
		search_queries: ['b.username', 'a.sales_id'],
		model: module,
		preloads: ['to_user', 'from_user', 'gs_summary'],
		customCols: [
			{
				title: 'General',
				list: ['id']
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'gs_summary_id', data: 'gs_summary_id' },
			{ label: 'Day', data: 'day', through: ['gs_summary'] },
			{ label: 'Month', data: 'month', through: ['gs_summary'] },
			{ label: 'Year', data: 'year', through: ['gs_summary'] },
			{ label: 'From', data: 'username', through: ['from_user'] },
			{ label: 'User', data: 'username', through: ['to_user'] },

			{ label: 'position', data: 'position' },
			{ label: 'before', data: 'before' },
			{ label: 'after', data: 'after' },
			{ label: 'amount', data: 'amount' },
			{ label: 'Remarks', data: 'remarks' }
		]
	}}
/>
