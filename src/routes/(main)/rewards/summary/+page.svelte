<script>
	/** @type {import('./$types').PageData} */
	import SimpleTable from '$lib/components/SimpleTable.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { postData, buildQueryString } from '$lib/index.js';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { isToastOpen } from '$lib/stores/toast';
	var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	/** @type {import('./$types').PageData} */
	export let data;
	onMount(async () => {});
	function checkReward(data, checkPage, confirmModal) {
		console.log(data);
		console.log('checking reward!');
		var params = { bonus: 'team bonus' };
		goto('/rewards/details/'+ data.name +'/' + data.day + "-" + data.month + "-" + data.year );
	}

	function payReward(data, checkPage, confirmModal) {
		console.log(data);
		console.log('paying reward!');

		confirmModal(true, 'Are you sure to pay these reward?', () => {
			postData(
				{ scope: 'pay_reward', name: data.name, day: data.day, month: data.month, year: data.year },
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

<SimpleTable
	data={{apiData: {},
		buttons: [
			{
				name: 'Pay',
				onclickFn: payReward
			},
			{
				name: 'Details',
				onclickFn: checkReward
			}
		],
		scope: 'unpaid_reward_summary',
		columns: [
			{ label: 'Bonus', data: 'name' },
			{ label: 'DD', data: 'day' },
			{ label: 'MM', data: 'month' },
			{ label: 'YY', data: 'year' },
			{ label: 'Amount', data: 'sum' }
		]
	}}
/>
