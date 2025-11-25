<script>
	import Datatable from '$lib/components/Datatable.svelte';
	import { onMount } from 'svelte';
	/** @type {import('./$types').PageData} */
	export let data;
    onMount(async () => {
    
    
    })


	let module = data.module,
		inputs = data.inputs;
</script>

<Datatable
	data={{
		inputs: inputs,
        join_statements: JSON.stringify([
			// { corporate_account: 'corporate_account' },
			{ user: 'user' }
		]),
		search_queries: ['b.username'],
		model: module,
		preloads: ['user'],
		customCols: [
			{
				title: 'General',
				list: [
					'id',
					
			
				]
			},
			
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'month', data: 'month' },
			{ label: 'year', data: 'year' },
            { label: 'User', data: 'username', through: ['user'] },
			{ label: 'Amount', data: 'amount' },
	
		
		]
	}}
/>
