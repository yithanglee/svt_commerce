<script>
	import Datatable from '$lib/components/Datatable.svelte';
	import { onMount } from 'svelte';
	import { Card, Spinner, Button, Label, Input, Checkbox } from 'flowbite-svelte';
	import { isToastOpen } from '$lib/stores/toast';
	import { isTableReloaded } from '$lib/stores/reloadTable';
	/** @type {import('./$types').PageData} */
	export let data;

	import { goto } from '$app/navigation';
	onMount(async () => {});

	let  isLoading = false, module = data.module,
		inputs = data.inputs;
	import { buildQueryString, postData } from '$lib/index.js';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

	

	async function fetchData() {
		var form = document.getElementById('currentForm');
		var formData = new FormData(form);
		await postData(formData, {
			isFormData: true,
			endpoint: PHX_HTTP_PROTOCOL + PHX_ENDPOINT + '/svt_api/webhook?scope=admin_insert_wallet_trx',
			successCallback: () => {
				isLoading = false;
				isTableReloaded.activate();		
			}
		});
	}
</script>

<div class="flex sm:grid grid-cols-12 flex-col-reverse">
	<div class="col-span-12 sm:col-span-9 mx-4 p-4">
		<Datatable 
			data={{
				appendQueries: { ewallet_id: data.id },
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
						list: ['id', 'before', 'after', 'amount']
					}
				],
				buttons: [],
				columns: [
					{ label: 'ID', data: 'id' },

					{ label: 'User', data: 'username', through: ['user'] },
					{ label: 'Before', data: 'before' },
					{ label: 'Amount', data: 'amount' },
					{ label: 'After', data: 'after' },
					{ label: 'Remarks', data: 'remarks' }
				]
			}}
		/>
	</div>
	<div class="col-span-12 sm:col-span-3 mr-4 py-4">
		<Card class="w-full max-w-md ">
			<form
				id="currentForm"
				class="flex flex-col space-y-6"
				action="javascript:void(0);"
				on:submit|preventDefault={fetchData}
			>
				<h3 class="text-xl font-medium text-gray-900 dark:text-white">Admin Insert Transaction</h3>

				<Input type="hidden" name="ewallet_id" value={data.id} placeholder="" />

				<Label class="space-y-2">
					<span>Amount</span>
					<Input type="number" name="amount" placeholder="" />
				</Label>
				<Label class="space-y-2">
					<span>Remarks</span>
					<Input type="text" name="remarks" placeholder="" />
				</Label>

				{#if isLoading}
					<div class="text-center"><Spinner /></div>
				{:else}
					<Button type="submit" class="w-full">Create</Button>
				{/if}
			</form>
		</Card>
	</div>
</div>
