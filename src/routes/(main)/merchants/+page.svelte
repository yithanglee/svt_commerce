<script>
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { goto } from '$app/navigation';
	import Datatable from '$lib/components/Datatable.svelte';
	import { buildQueryString, postData } from '$lib/index.js';
	/** @type {import('./$types').PageData} */
	export let data;

	let inputs = data.inputs;
	var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

	function viewDO(data, checkPage, confirmModal) {
		goto('/merchants/' + data.id + '/products');
	}
	function showCondition(data) {
		var bool = false;
		if (data.is_approved == false) {
			bool = true;
		}
		return bool;
	}
	function showCondition2(data) {
		var bool = false;
		if (data.is_approved == true) {
			bool = true;
		}
		return bool;
	}

	function disableMerchant(data, checkPage, confirmModal) {
		console.log(data);
		console.log('transfer approved!');

		confirmModal(true, 'Are you sure to disable this merchant?', () => {
			postData(
				{ scope: 'disable_merchant', id: data.id },
				{
					endpoint: url + '/svt_api/webhook',
					successCallback: () => {
						checkPage();
					}
				}
			);
		});
	}

	function approveMerchant(data, checkPage, confirmModal) {
		console.log(data);
		console.log('transfer approved!');

		confirmModal(true, 'Are you sure to approve this merchant?', () => {
			postData(
				{ scope: 'approve_merchant', id: data.id },
				{
					endpoint: url + '/svt_api/webhook',
					successCallback: () => {
						checkPage();
					}
				}
			);
		});
	}
</script>

<Datatable
	data={{
		showNew: true,
		canDelete: true,
		inputs: inputs,
		// join_statements: JSON.stringify([{ user: 'user' }]),
		search_queries: ['a.id'],
		model: 'Merchant',
		preloads: ['user', 'merchant_category'],
		buttons: [
			// { name: 'Products', onclickFn: viewDO },

			{
				name: 'Approve Merchant',
				onclickFn: approveMerchant,
				showCondition: showCondition
			},

			{
				name: 'Disable Merchant',
				onclickFn: disableMerchant,
				showCondition: showCondition2
			}
		],
		customCols: [
			{
				title: 'General',
				list: [
					'id',
					'commission_perc',
					'name',
					'remarks',
					{ label: 'is_approved', boolean: true },

					{
						label: 'merchant_category_id',
						selection: 'MerchantCategory',
						customCols: null,
						search_queries: ['a.name'],
						newData: 'name',
						title_key: 'name'
					}
				]
			},
			{
				title: 'CompanyDetails',
				list: [
					'company_address',
					'company_phone',
					'company_email',
					'company_reg_no',
					{ label: 'is_approved', boolean: true }
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Timestamp', data: 'inserted_at', formatDateTime: true, offset: 8 },
			{ label: 'Logo', data: 'img_url', showImg: true },
			{ label: 'SSM', data: 'company_ssm_image_url', showPreview: true },
			{ label: 'Name', data: 'name' },
			{ label: 'User', data: 'username', through: ['user'] },
			{ label: 'Category', data: 'name', through: ['merchant_category'] },
			{
				label: 'Approved?',
				data: 'is_approved',
				isBadge: true,
				color: [
					{
						key: true,
						value: 'green'
					},

					{
						key: 'false',
						value: 'pink'
					}
				]
			}
		]
	}}
/>
