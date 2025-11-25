<script>
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { goto } from '$app/navigation';
	import Datatable from '$lib/components/Datatable.svelte';
	import { buildQueryString, postData } from '$lib/index.js';
	/** @type {import('./$types').PageData} */
	export let data;

	let inputs = data.inputs;
	var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

	function pushList(data, wallet_type, list){
		data.parent_ewallets.filter((f,i) => {return f.wallet_type == wallet_type}).forEach((v, i) => {
				var checked = v.total > data.product.retail_price;
				if (data.product.can_pay_by_drp && v.wallet_type == 'direct_recruitment') {
					list.push(
						`<tr class="text-gray-500">
							<td  class="border-t text-right">` +
													v.wallet_type +
													`</td>

							<td  class="border-t text-right">` +
													v.total.toFixed(2) +
													`</td>

							<td  class="border-t ">
								<span class="flex justify-end pr-4">
								<input name="choosen_wallet_type" `+ (checked ? 'checked' : '')  +` data-wallet-type='` +
													v.wallet_type +
													`' type="radio"  >
								</span>
								</td>
							
							</tr>`
					);
				}
				if ( v.wallet_type != 'direct_recruitment') {
					list.push(
						`<tr class="text-gray-500">
							<td  class="border-t text-right">` +
													v.wallet_type +
													`</td>

							<td  class="border-t text-right">` +
													v.total.toFixed(2) +
													`</td>

							<td  class="border-t ">
								<span class="flex justify-end pr-4">
								<input name="choosen_wallet_type" `+ (checked ? 'checked' : '')  +` data-wallet-type='` +
													v.wallet_type +
													`' type="radio"  >
								</span>
								</td>
							
							</tr>`
					);
				}

					
				
			});
	}


	function payMember(data, checkPage, confirmModal) {
		console.log(data);
		console.log('transfer approved!');

		var totalCost = 0,
			list = [],
			wallet_list = ['register', 'direct_recruitment'];
		
			pushList(data, wallet_list[0], list)
			pushList(data, wallet_list[1], list)
			

		confirmModal(
			true,
			`	<span class="">Will deduct sponsor's ewallet to mark the instalment as paid.</span>
				<label class="	text-left my-4 text-sm font-medium block 
								text-gray-900 dark:text-gray-300 space-y-2">
								Instalment amount: RP ` +
				data.product.retail_price.toFixed(2) +
				` 
				</label>
					
					<table class="border-collapse border border-gray-200 w-full" style="margin: 48px 0px;">
						<tr>
							<th class="text-right">Type</th>
						
							<th class="text-right">Amount (RP)</th>
                            <th class="text-right">Action</th>
						</tr>
                        ` +
				list.join('') +
				`
					</table>
				
				<div class="text-sm flex flex-col w-1/3">
					<span style="margin: 16px 0px; right: 0;">Confirm with password</span>  
					<input 	name="password" placeholder="" type="text" 
							class="	block w-75 disabled:cursor-not-allowed disabled:opacity-50 p-2.5 
									focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-500 
									dark:focus:ring-primary-500 bg-gray-50 text-gray-900 dark:bg-gray-600 dark:text-white 
									dark:placeholder-gray-400 border-gray-300 dark:border-gray-500 text-sm rounded-lg"> 
				</div>
				
				`,
			() => {
				var dom = document.querySelector("input[name='password']"),
					radio_doms = document.querySelectorAll("input[name='choosen_wallet_type']");

				var selectedType = 'register';

				radio_doms.forEach((dm, i) => {
					if (dm.checked) {
						selectedType = dm.dataset.walletType;
					}
				});

				if (dom.value == '1234') {
					postData(
						{ scope: 'sponsor_pay_instalment', id: data.id, selectedType: selectedType },
						{
							endpoint: url + '/svt_api/webhook',
							successCallback: () => {
								checkPage();
							}
						}
					);
				} else {
					alert('Incorrect confirmation password');
				}
			}
		);
	}
</script>

<Datatable
	data={{
		appendQueries: { is_paid: false },
		showNew: true,
		canDelete: false,
		inputs: inputs,
		join_statements: JSON.stringify([{ user: 'user' }]),
		search_queries: ['a.id|b.username'],
		model: 'MemberInstalment',
		preloads: ['user', 'product', 'instalment', 'parent_ewallets'],
		buttons: [{ name: 'Sponsor Pay', onclickFn: payMember }],
		customCols: [
			{
				title: 'Gemeral',
				list: ['id', { label: 'is_paid', boolean: true }]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },
			{ label: 'Timestamp', data: 'inserted_at', formatDateTime: true, offset: 8 },
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
			{ label: 'Instalment Months', data: 'no_of_months', through: ['instalment'] },
			{ label: 'Month', data: 'month_no' },
			{ label: 'Due Date', data: 'due_date' },
			{ label: 'Plan', data: 'name', through: ['product'] },
			{ label: 'Sponsor', data: 'username', through: ['sponsor'] },
			{ label: 'Member', data: 'username', through: ['user'] }
		]
	}}
/>
