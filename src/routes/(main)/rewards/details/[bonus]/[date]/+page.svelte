<script>
	import Datatable from '$lib/components/Datatable.svelte';
	import { onMount } from 'svelte';
	import { postData, buildQueryString } from '$lib/index.js';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { isToastOpen } from '$lib/stores/toast';
	var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	/** @type {import('./$types').PageData} */
	export let data;
	onMount(async () => {});

	let module = data.module, bonus = data.bonus, date_data = data.date.split("-"),
		inputs = data.inputs;

	function unwithholdReward(data, checkPage, confirmModal) {
		console.log(data);
		console.log('withholding reward!');

		confirmModal(true, 'Are you sure to withhold these reward?', () => {
			postData(
				{ scope: 'unwithhold_reward', id: data.id },
				{
					endpoint: url + '/svt_api/webhook',
					successCallback: () => {
						isToastOpen.notify('Reward Withheld!');
						checkPage();
					}
				}
			);
		});
	}

	function withholdReward(data, checkPage, confirmModal) {
		console.log(data);
		console.log('withholding reward!');

		confirmModal(true, 'Are you sure to withhold these reward?', () => {
			postData(
				{ scope: 'withhold_reward', id: data.id },
				{
					endpoint: url + '/svt_api/webhook',
					successCallback: () => {
						isToastOpen.notify('Reward Withheld!');
						checkPage();
					}
				}
			);
		});
	}

	function paySingleReward(data, checkPage, confirmModal) {
		console.log(data);
		console.log('paying single reward!');

		confirmModal(true, 'Are you sure to pay this reward?', () => {
			postData(
				{ scope: 'pay_single_reward', reward_id: data.id },
				{
					endpoint: url + '/svt_api/webhook',
					successCallback: () => {
						isToastOpen.notify('Reward Paid!');
						checkPage();
					}
				}
			);
		});
	}
</script>

<Datatable
	data={{
     	appendQueries: { name: bonus, is_paid: false, day: date_data[0], month: date_data[1], year: date_data[2] },
		inputs: inputs,
		join_statements: JSON.stringify([
			// { corporate_account: 'corporate_account' },
			{ user: 'user' }
		]),
		search_queries: [ 'b.username'],
		model: module,
		preloads: ['user'],
		buttons: [
			{
				name: 'Pay',
				onclickFn: paySingleReward,
				showCondition: (data) => !data.is_paid
			},
			{
				name: 'Withhold',
				onclickFn: withholdReward,
				showCondition: (data) => !data.is_withheld
			},
			{
				name: 'Unwithhold',
				onclickFn: unwithholdReward,
				showCondition: (data) => data.is_withheld
			}
		],
		customCols: [
			{
				title: 'General',
				list: ['id']
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Sales ID', data: 'sales_id' },

			{
				label: 'Paid?',
				data: 'is_paid',
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
			{ label: 'Withheld?', data: 'is_withheld', isBadge: true, color: [
				{
					key: false,
					value: 'green'
				},
				{
					key: true,
					value: 'red'
				}
			]},
			{ label: 'day', data: 'day' },
			{ label: 'month', data: 'month' },
			{ label: 'year', data: 'year' },
			{ label: 'User', data: 'username', through: ['user'] },

			{ label: 'Bonus', data: 'name' },
			{ label: 'Amount', data: 'amount' },
			{ label: 'Remarks', data: 'remarks' }
		]
	}}
/>
