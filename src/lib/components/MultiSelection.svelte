<script>
	import { Button, Dropdown, Input, Radio, DropdownItem, Checkbox, Search } from 'flowbite-svelte';

	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { postData, buildQueryString } from '$lib/index.js';
	/** @type {import('./$types').PageData} */
	import { Icon } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	export let data,
		input,
		newData,
		dataList,
		name,
		module,
		parent,
		parent_id,
		search_queries,
		title_key,
		selection;

	let dropdownOpen = false,
		group1 = 0,
		newFormData = {},
		title = 'Selected',
		pages = [],
		items = [],
		cac_url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT,
		query,
		itemsPerPage = 100;
	function inputName(key, value) {
		return parent + '[' + key + '][' + parent_id + '][' + value + ']';
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
		console.log(dataList);
		try {
			console.log(typeof selection == 'string');
			console.log(title_key);
			if (title_key == null) {
				title_key = 'name';
			}
			console.log(data);

			if (typeof selection == 'string') {
				fetchData();
				title = data[input.key];
			} else {
				title = data[input.key.replace('_id', '')].name;
				items = selection.map((v, i) => {
					return { id: v, name: v };
				});
				title = data[input.key];
			}
		} catch (e) {}
	});
</script>

<div>
	<p class="mb-4 font-semibold text-gray-900 dark:text-white" />
	<ul
		class="w-48 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-600 divide-y divide-gray-200 dark:divide-gray-600"
	>
		{#each items as item}
			{#if dataList != null}
				{#if dataList != []}
					{#if dataList
						.map((v, i) => {
							return v.id;
						})
						.includes(item.id)}
						<Checkbox class="p-3" checked name={inputName(input.key, item.id)}>{item.name}</Checkbox
						>
					{:else}
						<Checkbox class="p-3" name={inputName(input.key, item.id)}>{item.name}</Checkbox>
					{/if}
				{/if}
			{:else}
				<Checkbox class="p-3" name={inputName(input.key, item.id)}>{item.name}</Checkbox>
			{/if}
			<li />
		{/each}
		<!-- <li><Checkbox class="p-3">Vue JS</Checkbox></li> -->
	</ul>
</div>
