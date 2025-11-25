<script>
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import Cookies from 'js-cookie';
	import SimpleTable from '$lib/components/SimpleTable.svelte';
	import { session } from '$lib/stores/session';
	import { isToastOpen } from '$lib/stores/toast';
	import { onMount } from 'svelte';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { Card, Button, Label, Input, Checkbox } from 'flowbite-svelte';
	import { buildQueryString, postData } from '$lib/index.js';
	/** @type {import('./$types').PageData} */
	import Chart from 'chart.js/auto';
	export let data;
	let chart;
	import DataForm from '$lib/components/DataForm.svelte';

	let chartData = data.chartData;

	let items = [{ key: 'id', value: 'int' }],
		module = '',
		title = '';
	var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

	var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
	var values = [];
	onMount(() => {
		// const labels = Object.keys(chartData[0]).filter((key) => key !== 'year');
		// const values = labels.map((label) => chartData[0][label]);
		// console.log(labels);
		// console.log(values);

		months.forEach((v, i) => {
			console.log(chartData[0][v]);
			var vsales = 0;

			if (chartData[0][v] != null) {
				vsales = chartData[0][v];
			}

			// values = [vsales,  ...values];
			values.push(vsales);
		});

		console.log(values);

		const ctx = document.getElementById('myChart').getContext('2d');
		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: [
					'jan',
					'feb',
					'mar',
					'apr',
					'may',
					'jun',
					'jul',
					'aug',
					'sep',
					'oct',
					'nov',
					'dec'
				],
				datasets: [
					{
						label: 'Monthly Values (RP)',
						data: values,
						backgroundColor: 'rgba(75, 192, 192, 0.2)',
						borderColor: 'rgba(75, 192, 192, 1)',
						borderWidth: 1
					}
				]
			}
		});
	});
	function refreshPage() {}
	let staff;
	session.subscribe((value) => {
		console.log('subscribed session!');
		console.log(value);
		if (value && value.loggedIn) {
		
			staff = value.user;

		}
		
	});

	let showNew = false,
		customCols = [
			{
				title: 'General',
				list: [	
						
			
					'id',
					{ label: 'username', expose: true },
					{ label: 'password', expose: true },
				
				]
			}
		],
		selectedData = staff,
		inputs = data.inputs,
		cac_url = url,
		model = 'Staff';
</script>

<div class="flex sm:grid grid-cols-12 flex-col-reverse">
	<div class="col-span-8 mx-4">
		<canvas id="myChart" />
	</div>
	<div class="col-span-4 p-4 mx-4">
		<DataForm
			style={'show'}
			{showNew}
			{customCols}
			data={selectedData}
			{inputs}
			url={cac_url}
			module={model}
			postFn={refreshPage}
		/>
	</div>
</div>

<div class="mt-4">
	<SimpleTable
		title="Monthly Sales Transactions"
		description={''}
		data={{
			apiData: { id: data.id },
			buttons: [],
			scope: 'current_month_outlet_trx',
			columns: [
				{ label: 'Year', data: 'year' },
				{ label: 'Location', data: 'location' },
			
				{ label: 'Jan', data: 'jan' },
				{ label: 'Feb', data: 'feb' },
				{ label: 'Mar', data: 'mar' },
				{ label: 'Apr', data: 'apr' },
				{ label: 'May', data: 'may' },
				{ label: 'Jun', data: 'jun' },
				{ label: 'Jul', data: 'jul' },
				{ label: 'Aug', data: 'aug' },
				{ label: 'Sep', data: 'sep' },
				{ label: 'Oct', data: 'oct' },
				{ label: 'Nov', data: 'nov' },
				{ label: 'Dec', data: 'dec' }
			]
		}}
	/>
</div>

<div class="mt-4">
	<SimpleTable
		title="Monthly Sales Transactions (RP)"
		description={''}
		data={{
			apiData: { id: data.id },
			buttons: [],
			scope: 'current_month_outlet_trx_only_rp',
			columns: [
				{ label: 'Year', data: 'year' },
				{ label: 'Location', data: 'location' },
				{ label: 'Jan', data: 'jan' },
				{ label: 'Feb', data: 'feb' },
				{ label: 'Mar', data: 'mar' },
				{ label: 'Apr', data: 'apr' },
				{ label: 'May', data: 'may' },
				{ label: 'Jun', data: 'jun' },
				{ label: 'Jul', data: 'jul' },
				{ label: 'Aug', data: 'aug' },
				{ label: 'Sep', data: 'sep' },
				{ label: 'Oct', data: 'oct' },
				{ label: 'Nov', data: 'nov' },
				{ label: 'Dec', data: 'dec' }
			]
		}}
	/>
</div>

<div class="mt-4">
	<SimpleTable
		title="Monthly Sales Transactions (DRP)"
		description={''}
		data={{
			apiData: { id: data.id },
			buttons: [],
			scope: 'current_month_outlet_trx_drp',
			columns: [
				{ label: 'Year', data: 'year' },
				{ label: 'Location', data: 'location' },
				{ label: 'Jan', data: 'jan' },
				{ label: 'Feb', data: 'feb' },
				{ label: 'Mar', data: 'mar' },
				{ label: 'Apr', data: 'apr' },
				{ label: 'May', data: 'may' },
				{ label: 'Jun', data: 'jun' },
				{ label: 'Jul', data: 'jul' },
				{ label: 'Aug', data: 'aug' },
				{ label: 'Sep', data: 'sep' },
				{ label: 'Oct', data: 'oct' },
				{ label: 'Nov', data: 'nov' },
				{ label: 'Dec', data: 'dec' }
			]
		}}
	/>
</div>
