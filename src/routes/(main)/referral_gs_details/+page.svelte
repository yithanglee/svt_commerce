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
		
			{ user: 'user' },
			{ referral_group_sales_summary: 'referral_group_sales_summary' }
		]),
		search_queries: ['b.username'],
		model: module,
		preloads: ['user', 'referral_group_sales_summary'],
		customCols: [
			{
				title: 'General',
				list: ['id']
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
	
			{ label: 'Sale ID', data: 'sale_id' },
			{ label: 'Month', data: 'month', through: ['referral_group_sales_summary'] },
			{ label: 'Year', data: 'year', through: ['referral_group_sales_summary'] },
			{ label: 'User', data: 'username', through: ['user'] },

			{ label: 'before', data: 'before' },
            { label: 'amount', data: 'amount' },
			{ label: 'after', data: 'after' },
	
	
		]
	}}
/>
