<script>
	import DataForm from '$lib/components/DataForm.svelte';
	import DataCell from '$lib/components/DataCell.svelte';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { postData, buildQueryString } from '$lib/index.js';

	import { isTableReloaded } from '$lib/stores/reloadTable';
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import {
		Img,
		Pagination,
		Modal,
		Button,
		Label,
		Input,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { isModalOpen } from '../stores/modal';
	export let data;
	let unsub2 = isTableReloaded.subscribe((v) => {
		if (v.open) {
			fetchData(1);
		}
	});
	let showNew = data.showNew != null ? data.showNew : false,
		canDelete = data.canDelete != null ? data.canDelete : false,
		modalFn,
		modalMessage,
		customCols = data.customCols,
		appendQueries = data.appendQueries,
		query = {},
		query2,
		confirmModal = false,
		selectedId = 0,
		inputs = data.inputs,
		isOpen = false,
		items = [],
		columns = data.columns,
		pages = [],
		selectedData = {},
		cac_url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT,
		model = data.model;

	const itemsPerPage = 100;
	let apiData = {
		search: { regex: 'false', value: query != null ? query : '' },
		additional_join_statements: data.join_statements,
		additional_search_queries: data.search_queries,
		draw: '1',
		length: itemsPerPage,
		model: data.model,
		columns: { 0: { data: 'id', name: 'id' } },
		order: { 0: { column: 0, dir: 'desc' } },
		preloads: JSON.stringify(data.preloads),
		start: null
	};

	function buildSearchString(query) {
		var slist = [];
		// this query is map
		var keys = Object.keys(query);
		if (keys.length > 0) {
			try {
				console.log(keys);

				keys.forEach((v, i) => {
					if (query[v]) {
						slist.push(v + '=' + query[v]);
					}
				});
				return slist.join('|');
			} catch (e) {
				console.log(e);
				return data.search_queries;
			}
		} else {
			return data.search_queries;
		}
	}

	async function fetchData(pageNumber) {
		// start transform the query
		var currentPage = parseInt($page.url.searchParams.get('page'));
		console.info(currentPage);
		apiData.additional_search_queries = buildSearchString(query);

		apiData.start = ((pageNumber == null ? 1 : pageNumber) - 1) * itemsPerPage;
		const queryString = buildQueryString({ ...apiData, ...appendQueries });
		console.log(queryString);
		try {
			let blog_url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

			const response = await fetch(blog_url + '/api/' + model + `?${queryString}`, {
				headers: {
					'content-type': 'application/json'
				}
			});
			if (response.ok) {
				let dataList = await response.json();
				console.log(dataList);
				items = dataList.data;

				var totalPages = Math.ceil(dataList.recordsFiltered / itemsPerPage);

				pages = [];

				if (totalPages <= 10) {
					for (let i = 1; i <= totalPages; i++) {
						pages.push({ name: i, href: `?page=${i}` });
					}
				} else {
					let middle = currentPage + 3;
					let firstPages = [1, 2, 3];

					let lastPages = [totalPages - 2, totalPages - 1, totalPages];
					let middlePages = [middle - 2, middle - 1, middle, middle + 1, middle + 2];

					middlePages = middlePages
						.filter((page) => !firstPages.includes(page) && !lastPages.includes(page))
						.filter((v, i) => {
							return v <= totalPages;
						});

					pages = [...firstPages];

					if (middlePages.length > 0 && middlePages[0] - firstPages[firstPages.length - 1] > 1) {
						pages.push({ name: '...', href: `` }); // Placeholder between first and middle pages
					}

					pages.push(...middlePages);

					if (lastPages[0] - pages[pages.length - 1] > 1) {
						pages.push({ name: '...', href: `` }); // Placeholder between middle and last pages
					}

					pages.push(...lastPages);

					pages = pages.map((page) =>
						typeof page === 'number' ? { name: page, href: `?page=${page}` } : page
					);
				}
			} else {
				console.error('API request failed');
			}
		} catch (error) {
			console.error('An error occurred', error);
		}
	}
	const currentPage = parseInt($page.url.searchParams.get('page'));

	const previous = () => {
		fetchData(currentPage - 1);
		alert('Previous btn clicked. Make a call to your server to fetch data.');
	};
	const next = () => {
		fetchData(currentPage + 1);
		alert('Next btn clicked. Make a call to your server to fetch data.');
	};
	onMount(() => {
		fetchData(1);
	});

	async function checkPage() {
		setTimeout(() => {
			console.log($page.url.searchParams.get('page'));
			fetchData($page.url.searchParams.get('page'));
		}, 200);
	}
	function deleteData(data) {
		// need a confirmation button...

		confirmModal = true;
		selectedId = data.id;
	}
	function confirmDelete(id) {
		confirmModal = false;
		postData(
			{},
			{
				method: 'DELETE',
				endpoint: PHX_HTTP_PROTOCOL + PHX_ENDPOINT + '/svt_api/' + model + '/' + id
			}
		);
		checkPage();
		selectedId = null;
	}
	function openModal(data) {
		selectedData = data;

		isModalOpen.set(!isOpen);
	}
	let img_url;
	function confirmModalFn(bool, message, fn, opts) {
		let default_opts = {
			img_url: null
		};

		img_url =
			opts != null
				? opts.img_url != null
					? opts.img_url
					: default_opts.img_url
				: default_opts.img_url;

		modalMessage = message;
		confirmModal = bool;
		modalFn = fn;
	}
	onMount(() => {});

	let unsub = isModalOpen.subscribe((v) => {
		isOpen = v;
		console.log(v);
	});
	onDestroy(unsub);
</script>

<div class="mb-6 flex flex items-center">
	<div class="">
		<Label for="default-input" class="block mb-2">Search</Label>
		<div class="flex gap-4 items-center">
			{#if data.search_queries != null}
				{#if data.search_queries != []}
					{#each data.search_queries as search_query}
						{#each search_query.split('|') as single_query}
							{#if !single_query.includes('=')}
								<Input
									id="default-input"
									bind:value={query['' + single_query + '']}
									placeholder={single_query.split('.')[1]}
								/>
							{/if}
						{/each}
					{/each}
				{/if}
			{/if}

			<Button
				on:click={() => {
					fetchData(1);
				}}>Search</Button
			>

			<DataForm
				{showNew}
				{customCols}
				data={selectedData}
				{inputs}
				url={cac_url}
				module={data.model}
				postFn={checkPage}
			/>
		</div>
	</div>
</div>
<div class="flex flex-col items-center justify-center gap-2 mb-4" />
<Table shadow hoverable={true}>
	<TableHead>
		{#each columns as col}
			<TableHeadCell>{col.label}</TableHeadCell>
		{/each}
		<TableHeadCell>
			<span class="sr-only">Action</span>
		</TableHeadCell>
	</TableHead>
	<TableBody class="divide-y">
		{#each items as item}
			<TableBodyRow>
				{#each columns as col}
					<TableBodyCell class="font-light dark:text-white {col.className || ''}">
						<DataCell {item} {col} />
					</TableBodyCell>
				{/each}
				<!-- if have customized button? -->
				<TableBodyCell>
					<a
						on:click|preventDefault={openModal(item)}
						href="#"
						class="font-medium text-primary-600 hover:underline dark:text-primary-500">Edit</a
					>

					{#if data.buttons != null}
						{#if data.buttons != []}
							{#each data.buttons as button}
								{#if button.showCondition != null}
									{#if button.showCondition(item)}
										|
										<a
											on:click|preventDefault={button.onclickFn(item, checkPage, confirmModalFn)}
											href="#"
											class="font-medium text-primary-600 hover:underline dark:text-primary-500"
											>{button.name}</a
										>
									{/if}
								{:else}
									|
									<a
										on:click|preventDefault={button.onclickFn(item, checkPage, confirmModalFn)}
										href="#"
										class="font-medium text-primary-600 hover:underline dark:text-primary-500"
										>{button.name}</a
									>
								{/if}
							{/each}
						{/if}
					{/if}
					{#if canDelete}
						|
						<a
							on:click|preventDefault={deleteData(item)}
							href="#"
							class="font-medium text-primary-600 hover:underline dark:text-primary-500">Delete</a
						>
					{/if}
				</TableBodyCell>
			</TableBodyRow>
		{/each}
	</TableBody>
</Table>
<div class="flex flex-col items-center justify-center gap-2 mt-4">
	<Pagination {pages} on:click={checkPage} on:previous={previous} on:next={next} />
</div>

<Modal title="Confirm?" bind:open={confirmModal} autoclose outsideclose>
	{#if img_url != null}
		<Img src="{cac_url}{img_url}" alt="sample 1" />
	{/if}

	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
		{#if modalMessage != null}
			{@html modalMessage}
		{:else}
			Are you sure you want to delete?
		{/if}
	</p>
	<svelte:fragment slot="footer">
		<Button
			color="red"
			on:click={() => {
				if (modalFn != null) {
					modalFn();
					modalMessage = null;
					modalFn = null;
				} else {
					confirmDelete(selectedId);
				}
			}}>Confirm</Button
		>
	</svelte:fragment>
</Modal>
