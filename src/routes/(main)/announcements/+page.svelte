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
			// { user: 'user' }
		]),
		search_queries: ['a.author'],
		model: module,
		preloads: [],
		customCols: [
			{
				title: 'General',
				list: [
					'id',
                    'author',
                    'category',
                    'title',
                    'subtitle'
				]
			},
            {
				title: 'Content',
				list: [
				
                    {label: 'img_url', upload: true},
                    {label: 'content', editor2: true},
				]
			},
			
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Title', data: 'title' },
			{ label: 'Subtitle', data: 'subtitle' },
            { label: 'Category', data: 'category' },
            { label: 'Author', data: 'author' },

		
		]
	}}
/>
