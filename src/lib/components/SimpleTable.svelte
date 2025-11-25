<script>
	import DataCell from '$lib/components/DataCell.svelte';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { postData, buildQueryString } from '$lib/index.js';
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import {
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
	import { isModalOpen } from '$lib/stores/modal';
	export let data, title, description;

	let modalFn,
		apiData = data.apiData,
		scope = data.scope,
		columns = data.columns,
		modalMessage,
		confirmModal = false,
		selectedId = 0,
		isOpen = false,
		items = [],
		pages = [],
		selectedData = {};

	const itemsPerPage = 100;

	async function fetchData(pageNumber) {
		// start transform the query

		const queryString = buildQueryString(apiData);
		console.log(queryString);
		try {
			let blog_url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
			const response = await fetch(blog_url + '/api/webhook?scope=' + scope + `&${queryString}`, {
				headers: {
					'content-type': 'application/json'
				}
			});
			if (response.ok) {
				let dataList = await response.json();
				console.log(dataList);
				items = dataList;
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
	const previous = () => {
		alert('Previous btn clicked. Make a call to your server to fetch data.');
	};
	const next = () => {
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

	function confirmModalFn(bool, message, fn) {
		modalMessage = message;
		confirmModal = bool;
		modalFn = fn;
	}

	let unsub = isModalOpen.subscribe((v) => {
		isOpen = v;
		console.log(v);
	});
	onDestroy(unsub);
</script>

<div class="mb-6 flex flex items-center">
	<div class="hidden">
		<Label for="default-input" class="block mb-2">Search</Label>
		<div class="flex gap-4 items-center">
			<Button
				on:click={() => {
					fetchData(1);
				}}>Search</Button
			>
		</div>
	</div>
	<div class="flex flex-col">
		{#if title}
			<h1 class="text-lg font-bold  dark:text-white">
				{title}
			</h1>
		{/if}
		{#if description}
			<p class=" dark:text-white">{@html description}</p>
		{/if}
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
					<TableBodyCell class="font-light dark:text-white">
						<DataCell {item} {col} />
					</TableBodyCell>
				{/each}
				<!-- if have customized button? -->
				<TableBodyCell>
					{#if data.buttons != null}
						{#if data.buttons != []}
							{#each data.buttons as button}
								<a
									on:click|preventDefault={button.onclickFn(item, checkPage, confirmModalFn)}
									href="#"
									class="font-medium text-primary-600 hover:underline dark:text-primary-500"
									>{button.name}</a
								> <span class="mx-1">|</span>
							{/each}
						{/if}
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
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
		{#if modalMessage != null}
			{modalMessage}
		{:else}
			Are you sure you want to perform this action?
		{/if}
	</p>
	<svelte:fragment slot="footer">
		<Button
			color="red"
			on:click={() => {
				modalFn();
				modalMessage = null;
				modalFn = null;
			}}>Confirm</Button
		>
	</svelte:fragment>
</Modal>
