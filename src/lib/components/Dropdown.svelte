<script>
	import { Button, Dropdown, Input, Radio, DropdownItem, Checkbox, Search } from 'flowbite-svelte';

	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { postData, buildQueryString } from '$lib/index.js';
	/** @type {import('./$types').PageData} */
	import { Icon } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	export let data, input, newData, name, module, parent, search_queries, title_key, selection;

	let dropdownOpen = false,
		group1 = 0,
		newFormData = {},
		title = 'Selected',
		pages = [],
		items = [],
		cac_url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT,
		query,
		itemsPerPage = 100;
	function inputName(key) {
		return parent + '[' + key + ']';
	}
	async function tryPost() {
		let map = {};
		newFormData[newData] = query;
		map[module] = { ...newFormData, id: '0' };
		console.log(map);

		await postData(map, {
			endpoint: PHX_HTTP_PROTOCOL + PHX_ENDPOINT + '/svt_api/' + module
		});
	}
	async function fetchData(pageNumber) {
		const apiData = {
			search: { regex: 'false', value: query != null ? query.trim() : '' },
			additional_join_statements: data.join_statements,
			additional_search_queries: search_queries,
			draw: '1',

			length: itemsPerPage,
			model: module,
			columns: { 0: { data: 'id', name: 'id' } },
			order: { 0: { column: 0, dir: 'desc' } },
			preloads: JSON.stringify(data.preloads),
			start: ((pageNumber == null ? 1 : pageNumber) - 1) * itemsPerPage
		};
		const queryString = buildQueryString(apiData);
		try {
			let blog_url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
			const response = await fetch(blog_url + '/api/' + module + `?${queryString}`, {
				headers: {
					'Content-Type': 'application/json'
				}
			});
			// const response = await fetch('/api/datatable/' + module + `?${queryString}`, {
			// 	headers: {
			// 		'Content-Type': 'application/json'
			// 	}
			// });

			if (response.ok) {
				let dataList = await response.json();
				items = dataList.data;

				var totalPages = Math.ceil(dataList.recordsFiltered / itemsPerPage);

				pages = [];

				for (var i = 0; i < totalPages; i++) {
					pages.push({ name: i + 1, href: `?page=` + (i + 1) });
				}
			} else {
				console.error('API request failed');
			}
		} catch (error) {
			console.error('An error occurred', error);
		}
	}
	function updateData(id, name) {
		dropdownOpen = false;
		console.log(data[input.key]);
		data[input.key] = id;
		title = name;
	}
	onMount(() => {
		try {
			console.log(typeof selection == 'string')
			console.log(title_key);
			if (title_key == null) {
				title_key = 'name';
			}
			console.log(data);
		
			if (typeof selection == 'string') {
				fetchData();
				title = data[input.key.replace('_id', '')][title_key];
			} else {
				
				items = selection.map((v, i) => {
					return { id: v, name: v };
				});
				title = data[input.key];
			
			}
		} catch (e) {}
	});
</script>

<div>
	<Input type="hidden" name={inputName(input.key)} bind:value={data[input.key]} />
	<Button
		>{title}<Icon
			name="chevron-down-solid"
			class="w-3 h-3 ml-2 text-white dark:text-white"
		/></Button
	>
	<Dropdown bind:open={dropdownOpen}  class="w-full overflow-y-auto py-1 h-48">
		<div slot="header" class="p-3">
			<Search
				bind:value={query}
				on:change={() => {
					console.log(query);
					fetchData();
				}}
				size="md"
			/>
		</div>

		{#each items as item}
			<DropdownItem on:click={updateData(item.id, item[title_key])} >{item[title_key]}</DropdownItem>
		{/each}
		{#if typeof selection == 'string'}
			<Button
				slot="footer"
				size="xs"
				class="m-2"
				on:click={() => {
					tryPost();
				}}
			>
				<Icon name="check-solid" class="w-4 h-4 mr-2 text-white " />
				Add
			</Button>
		{/if}
	</Dropdown>
</div>
