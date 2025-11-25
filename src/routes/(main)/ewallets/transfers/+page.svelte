<script>
	import Datatable from '$lib/components/Datatable.svelte';
	import { onMount } from 'svelte';
	/** @type {import('./$types').PageData} */
	export let data;
	onMount(async () => {});

	let module = data.module,
		inputs = data.inputs;


    function approveTransfer(data){
        console.log(data);
        console.log("transfer approved!")
    }

</script>

<Datatable
	data={{showNew: true, canDelete: true,
		inputs: inputs,
		join_statements: JSON.stringify([
			// { corporate_account: 'corporate_account' },
			{ from_user: 'from_user' },
			{ to_user: 'to_user' }
		]),
		search_queries: ['b.username'],
		model: module,
		preloads: ['from_user', 'to_user', 'wallet_type'],
		customCols: [
			{
				title: 'General',
				list: [
					'id',

					{ label: 'img_url', upload: true },
					{ label: 'from_username', expose: true },
					{ label: 'to_username', expose: true },
					'from_user_id',
					'to_user_id',
					'amount',
					'remarks',
					{
						label: 'wallet_type_id',
						selection: 'WalletType',
						customCols: null,
						search_queries: ['a.name'],
						newData: 'name',
						title_key: 'name'
					},
					{ label: 'is_approved', boolean: true }
				]
			}
		],
        buttons: [{name: 'Approve', onclickFn: approveTransfer}],
		columns: [
			{ label: 'ID', data: 'id' },
			{
				label: 'Approved?',
				data: 'is_approved',
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

			{ label: 'From', data: 'username', through: ['from_user'] },
			{ label: 'To', data: 'username', through: ['to_user'] },
			{ label: 'Type', data: 'name', through: ['wallet_type'] },

			{ label: 'Amount', data: 'amount' },
			{ label: 'Remarks', data: 'remarks' }
		]
	}}
/>
