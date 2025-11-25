<script>
	import { Button, Modal, Label, Input, Checkbox } from 'flowbite-svelte';
	import { isModalOpen } from '../stores/modal';
	import { onMount, onDestroy, afterUpdate, beforeUpdate } from 'svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { Tabs, TabItem } from 'flowbite-svelte';

	import { Icon } from 'flowbite-svelte-icons';
	import { postData } from '$lib/index.js';

	export let data, inputs, customCols, module, postFn, showNew, style;

	console.log('customCols');
	console.log(customCols);
	let formModal = false,
		tabElements,
		options,
		keys = [];

	let unsub = isModalOpen.subscribe((v) => {
		formModal = v;
	});
	function refreshData() {
		postFn();
	}

	async function tryPost() {
		let map = {},
			primary_key;

		primary_key = data['id'].toString();
		delete data.password;
		map[module] = { ...data, id: primary_key };

		console.log(map);

		var form = document.getElementById('currentForm');
		var formData = new FormData(form);
		// maybe check if there's any file upload involved, if yes, probably need to convert the map
		// to formdata or post twice as a subsequent update.. post image first then the rest.
		//

		// if isFormData, formData
		await postData(formData, {
			isFormData: true,
			endpoint: PHX_HTTP_PROTOCOL + PHX_ENDPOINT + '/svt_api/' + module
		});
		refreshData();
		formModal = false;
		isModalOpen.set(false);
	}

	function filteredInput(key) {
		let res = inputs.filter((v, i) => {
			return v.key == key;
		});

		if (res) {
			return res[0];
		} else {
			return null;
		}
	}

	onDestroy(() => {
		unsub();
	});

	beforeUpdate(() => {
		console.log('before update');
		console.log(data);
		// need another customCols to define the keys
		keys = Object.keys(data).sort((a, b) => {
			return a.localeCompare(b);
		});

		console.log(inputs);
	});

	afterUpdate(() => {
		if (formModal == false) {
			selectedTab = customCols[0].title;
			isModalOpen.set(false);
		}
	});
	function selectTab(title) {
		console.log(title);
		selectedTab = title;
		var tabs = document.querySelectorAll('button[role="tab"]');

		tabs.forEach((tab, i) => {
			tab.setAttribute('class', inactiveClass);

			if (tab.getAttribute('aria-labelledby') == title) {
				tab.setAttribute('class', activeClass);
			}
		});
		var tabContents = document.querySelectorAll('.tab-content');
		tabContents.forEach((tab, i) => {
			tab.classList.add('hidden');
			if (tab.getAttribute('target') == title) {
				tab.classList.remove('hidden');
			}
		});
	}
	function tabClass(title) {
		var tclass = inactiveClass;

		if (selectedTab == title) {
			tclass = activeClass;
		}
		return tclass;
	}
	let selectedTab,
		activeClass =
			'inline-block text-sm font-medium text-center disabled:cursor-not-allowed p-4 text-primary-600 border-b-2 border-primary-600 dark:text-primary-500 dark:border-primary-500 active',
		inactiveClass =
			'inline-block text-sm font-medium text-center disabled:cursor-not-allowed p-4 border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-gray-500 dark:text-gray-400';
	onMount(() => {
		selectedTab = customCols[0].title;
	});
</script>

{#if style == null}
	{#if showNew}
		<Button
			on:click={() => {
				formModal = true;
				data = { id: 0 };
			}}
			class="">New</Button
		>
	{/if}

	<Modal bind:open={formModal} size="lg" autoclose={false} class="w-full" outsideclose>
		<form class="flex flex-col space-y-6" id="currentForm" action="#">
			<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">{module} Form</h3>

			<ul class="flex flex-wrap space-x-2 -mb-px">
				{#if customCols.length > 0}
					{#each customCols as customCol}
						{#if customCols[0].title == customCol.title}
							<li class="group" role="presentation">
								<button
									on:click={selectTab(customCol.title)}
									type="button"
									role="tab"
									aria-labelledby={customCol.title}
									class={tabClass(customCol.title)}
								>
									<div class="flex items-center gap-2">
										<Icon name="grid-solid" size="sm" />
										{customCol.title}
									</div></button
								>
								<div class="hidden tab_content_placeholder" />
							</li>
						{:else}
							<li class="group" role="presentation">
								<button
									on:click={selectTab(customCol.title)}
									type="button"
									role="tab"
									aria-labelledby={customCol.title}
									class={tabClass(customCol.title)}
									><div class="flex items-center gap-2">
										<Icon name="grid-solid" size="sm" />
										{customCol.title}
									</div></button
								>
							</li>
						{/if}
					{/each}
				{/if}
			</ul>
			<div
				class="p-4 bg-gray-50 rounded-lg dark:bg-gray-800 mt-4"
				role="tabpanel"
				aria-labelledby="id-tab"
			>
				{#if customCols.length > 0}
					{#each customCols as customCol}
						{#if customCols[0].title == customCol.title}
							<div target={customCol.title} class=" tab-content flex flex-wrap w-full gap-2">
								{#each customCol.list as key}
									<FormInput {module} {key} {data} input={filteredInput(key)} />
								{/each}
							</div>
						{:else}
							<div target={customCol.title} class="hidden tab-content flex flex-wrap w-full gap-2">
								{#each customCol.list as key}
									<FormInput {module} {key} {data} input={filteredInput(key)} />
								{/each}
							</div>
						{/if}
					{/each}
				{/if}
			</div>
		</form>
		<svelte:fragment slot="footer">
			<Button on:click={() => tryPost()}>Submit</Button>
		</svelte:fragment>
	</Modal>
{:else}
	<form class="flex flex-col space-y-6" id="currentForm" action="#">
		<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">{module} Form</h3>

		<ul class="flex flex-wrap space-x-2 -mb-px">
			{#if customCols.length > 0}
				{#each customCols as customCol}
					{#if customCols[0].title == customCol.title}
						<li class="group" role="presentation">
							<button
								on:click={selectTab(customCol.title)}
								type="button"
								role="tab"
								aria-labelledby={customCol.title}
								class={tabClass(customCol.title)}
							>
								<div class="flex items-center gap-2">
									<Icon name="grid-solid" size="sm" />
									{customCol.title}
								</div></button
							>
							<div class="hidden tab_content_placeholder" />
						</li>
					{:else}
						<li class="group" role="presentation">
							<button
								on:click={selectTab(customCol.title)}
								type="button"
								role="tab"
								aria-labelledby={customCol.title}
								class={tabClass(customCol.title)}
								><div class="flex items-center gap-2">
									<Icon name="grid-solid" size="sm" />
									{customCol.title}
								</div></button
							>
						</li>
					{/if}
				{/each}
			{/if}
		</ul>
		<div
			class="p-4 bg-gray-50 rounded-lg dark:bg-gray-800 mt-4"
			role="tabpanel"
			aria-labelledby="id-tab"
		>
			{#if customCols.length > 0}
				{#each customCols as customCol}
					{#if customCols[0].title == customCol.title}
						<div target={customCol.title} class=" tab-content flex flex-wrap w-full gap-2">
							{#each customCol.list as key}
								<FormInput {module} {key} {data} input={filteredInput(key)} />
							{/each}
						</div>
					{:else}
						<div target={customCol.title} class="hidden tab-content flex flex-wrap w-full gap-2">
							{#each customCol.list as key}
								<FormInput {module} {key} {data} input={filteredInput(key)} />
							{/each}
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	</form>
	<div class="my-4">

		<Button on:click={() => tryPost()}>Submit</Button>
	</div>
{/if}
