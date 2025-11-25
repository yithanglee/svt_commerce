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
	<div class="col-span-12 sm:col-span-12 mx-4 p-4">
		<Datatable 
			data={{
				appendQueries: { stock_id: data.stock_id, location_id: data.location_id },
				inputs: inputs,
				// join_statements: JSON.stringify([
				
				// 	{ user: 'user' }
				// ]),
				search_queries: ['a.remarks'],
				model: module,
				preloads: ['stock'],
				customCols: [
					{
						title: 'General',
						list: ['id', 'before', 'after', 'amount']
					}
				],
				buttons: [],
				columns: [
					{ label: 'ID', data: 'id' },
					{ label: 'Timestamp', data: 'inserted_at', formatDateTime: true , offset: 8},
					{ label: 'Stock', data: 'name', through: ['stock'] },
					{ label: 'Before', data: 'before' },
					{ label: 'Amount', data: 'amount' },
					{ label: 'After', data: 'after' },
					{ label: 'Remarks', data: 'remarks' }
				]
			}}
		/>
	</div>
	
</div>
