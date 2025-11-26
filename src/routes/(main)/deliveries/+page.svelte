<script>
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { goto } from '$app/navigation';
	import Datatable from '$lib/components/Datatable.svelte';
	import { buildQueryString, postData } from '$lib/index.js';
	/** @type {import('./$types').PageData} */
	import { Button, Modal, Label, Input, Checkbox } from 'flowbite-svelte';
	import FormInput from '$lib/components/FormInput.svelte';

	export let data;

	let inputs = data.inputs,
		checkPage,
		fdata = { pick_up_point_id: 1, shipping_ref: null },
		formModal = false;
	var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

	function downloadDO(data, checkPage, confirmModal) {
		window.open(url + '/pdf?type=do&id=' + data.id, '_blank').focus();
	}
	function viewDO(data, checkPage, confirmModal) {
		goto('/deliveries/' + data.id);
	}
	function showCondition(data) {
		var bool = false;
		if (data.status == 'processing') {
			bool = true;
		}
		return bool;
	}
	function showCondition2(data) {
		var bool = false;
		if (data.status == 'pending_delivery') {
			bool = true;
		}
		return bool;
	}
	function doMarkPendingDelivery(data, checkPage, confirmModal) {
		console.log(data);
		console.log('transfer approved!');

		confirmModal(true, 'Are you sure to mark this order as pending delivery?', () => {
			postData(
				{ scope: 'mark_do', id: data.id, status: 'pending_delivery' },
				{
					endpoint: url + '/svt_api/webhook',
					successCallback: () => {
						checkPage();
					}
				}
			);
		});
	}
	function doMarkSent(data, zcheckPage) {
		console.log('do mar');
		console.log(data);
		fdata = data;
		checkPage = zcheckPage;
		formModal = true;
	}
	function _doMarkSent(data, checkPage, confirmModal) {
		console.log(data);
		console.log('transfer approved!');

		confirmModal(
			true,
			`
			<label class="my-4 text-sm font-medium block 
			 space-y-2">
			<span>Shipping Ref</span>  <input name="shipping_ref" 
			placeholder="" type="text" class="block w-75 disabled:cursor-not-allowed disabled:opacity-50 p-2.5 focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-500 dark:focus:ring-primary-500 bg-gray-50 dark:bg-gray-600 dark: dark:placeholder-gray-400 border-gray-300 dark:border-gray-500 text-sm rounded-lg"> </label>
			<span class="">Are you sure to mark this order as sent?</span>`,
			() => {
				var dom = document.querySelector("input[name='shipping_ref']");
				postData(
					{ scope: 'mark_do', shipping_ref: dom.value, id: data.id, status: 'sent' },
					{
						endpoint: url + '/svt_api/webhook',
						successCallback: () => {
							checkPage();
						}
					}
				);
			}
		);
	}
	function tryPost() {
		postData(
			{
				scope: 'mark_do',
				id: fdata.id,
				shipping_ref: fdata.shipping_ref,
				location_id: fdata.pick_up_point_id,
				status: 'sent'
			},
			{
				endpoint: url + '/svt_api/webhook',
				successCallback: () => {
					checkPage();
					formModal = false;
				}
			}
		);
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
</script>

<Modal bind:open={formModal} size="lg" autoclose={false} class="w-full" outsideclose>
	<form class="flex flex-col space-y-6" id="currentForm" action="#">
		<h3 class="mb-4 text-xl font-medium dark:">Confirmation</h3>
		<p class="">Are you sure to mark this order as sent?</p>
		<div
			class="p-4 bg-gray-50 rounded-lg dark:bg-gray-800 mt-4"
			role="tabpanel"
			aria-labelledby="id-tab"
		>
			<FormInput
				module={'Sale'}
				key={{
					label: 'shipping_ref',
					expose: true
				}}
				data={fdata}
				input={filteredInput({
					label: 'shipping_ref',
					expose: true
				})}
			/>
			<FormInput
				module={'Sale'}
				key={{
					label: 'pick_up_point_id',
					selection: 'PickUpPoint',
					module: 'PickUpPoint',
					customCols: null,
					search_queries: ['a.name'],
					newData: 'name',
					title_key: 'name'
				}}
				data={fdata}
				input={filteredInput({
					label: 'pick_up_point_id',
					selection: 'PickUpPoint',
					module: 'PickUpPoint',
					customCols: null,
					search_queries: ['a.name'],
					newData: 'name',
					title_key: 'name'
				})}
			/>
		</div>
	</form>
	<svelte:fragment slot="footer">
		<Button on:click={() => tryPost()}>Submit</Button>
	</svelte:fragment>
</Modal>
<Datatable
	data={{
		appendQueries: { merchant_id: 'null', country_id: data.country_id },
		inputs: inputs,
		join_statements: JSON.stringify([
			// { corporate_account: 'corporate_account' },
			{ user: 'user' }
		]),
		search_queries: [
			'a.id|b.username|b.fullname|a.is_instalment=false',
			
			'a.has_freebies=true'
		],
		model: 'Sale',
		preloads: ['user', 'sales_person', 'payment', 'country'],
		buttons: [
			{ name: 'Preview', onclickFn: viewDO },
			{ name: 'Download DO (PDF)', onclickFn: downloadDO },
			{
				name: 'Mark Pending Delivery',
				onclickFn: doMarkPendingDelivery,
				showCondition: showCondition
			},
			{ name: 'Mark Sent', onclickFn: doMarkSent, showCondition: showCondition2 }
		],
		customCols: [
			{
				title: 'Order',
				list: [
					'id',
					'shipping_method',
					'shipping_company',
					'shipping_ref',
					{ label: 'remarks', editor2: true }
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Country', data: 'name', through: ['country'] },
			{ label: 'Timestamp', data: 'inserted_at', formatDateTime: true, offset: 8 },
			// { label: 'Sale Date', data: 'sale_date' },
			{ label: 'Fee', data: 'shipping_fee' },
			{ label: 'Ref', data: 'shipping_ref' },
			{
				label: 'Status',
				data: 'status',
				isBadge: true,
				color: [
					{
						key: 'pending_payment',
						value: 'yellow'
					},
					{
						key: 'pending_confirmation',
						value: 'yellow'
					},
					{
						key: 'processing',
						value: 'blue'
					},
					{
						key: 'sent',
						value: 'pink'
					},
					{
						key: 'pending_delivery',
						value: 'purple'
					},
					{
						key: 'complete',
						value: 'green'
					}
				]
			},

			{ label: 'User', data: 'username', through: ['user'] },
			{ label: 'Sales Person', data: 'username', through: ['sales_person'] }
		]
	}}
/>
