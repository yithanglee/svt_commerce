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
		search_queries: null,
		model: module,
		preloads: ['stored_medias', 'category'],
		customCols: [
			{
				title: 'General',
				list: [
					'id',
					'title',
					'excerpt',
					{ label: 'thumbnail_img', upload: true },
					{ label: 'img_url', upload: true }
				]
			},
			{
				title: 'Content',
				list: [
					{
						label: 'category_id',
						selection: 'Category',
						customCols: null,
						search_queries: ['a.name'],
						newData: 'name',
						title_key: 'name'
					},
					{ label: 'content', editor: true },
					{ label: 'stored_medias', gallery: true, child: 's3_url' }
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Title', data: 'title' },
			{ label: 'Category', data: 'name', through: ['category'] }
		]
	}}
/>
