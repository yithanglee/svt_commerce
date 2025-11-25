<script>
	import Datatable from '$lib/components/Datatable.svelte';
	/** @type {import('./$types').PageData} */
	export let data;
	let inputs = data.inputs;
</script>

<Datatable
	data={{showNew: true,
		inputs: inputs,
		search_queries: null,
		model: 'AppRoute',
		preloads: [],
		customCols: [
			{
				title: 'General',
				list: [
					{ label: 'name', expose: true },
					{ label: 'icon', expose: true },
					{ label: 'route', expose: true },
					'id',
                    { label: 'can_get', boolean: true },
                    { label: 'can_post', boolean: true },
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },

			{ label: 'Name', data: 'name' },
			{ label: 'Icon', data: 'icon' },
			{ label: 'Route', data: 'route' },
			{
				label: 'HTTP GET',
				data: 'can_get',
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
			{
				label: 'HTTP POST',
				data: 'can_post',
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
			}
			// { label: 'Code', data: 'member_code', isBadge: true },
			// { label: 'Role', data: 'name', through: ['role'] }
		]
	}}
/>
