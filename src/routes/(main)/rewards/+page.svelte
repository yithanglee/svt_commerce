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
	data={{canDelete: true,
		inputs: inputs,
		join_statements: JSON.stringify([
			// { corporate_account: 'corporate_account' },
			{ user: 'user' }
		]),
		search_queries: ['a.name|b.username|a.is_paid'],
		model: module,
		preloads: ['user'],
		customCols: [
			{
				title: 'General',
				list: ['id', {label: 'is_paid', boolean: true}]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			
			{ label: 'Sales ID', data: 'sales_id' },
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
			{ label: 'day', data: 'day' },
			{ label: 'month', data: 'month' },
			{ label: 'year', data: 'year' },
			{ label: 'User', data: 'username', through: ['user'] },

			{ label: 'Bonus', data: 'name' },
			{ label: 'Amount', data: 'amount' },
			{ label: 'Remarks', data: 'remarks' }
		]
	}}
/>
