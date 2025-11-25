<script>
	import { Card, Button, Label, Input, Checkbox } from 'flowbite-svelte';
    import { goto } from '$app/navigation';
	
	import Datatable from '$lib/components/Datatable.svelte';
	/** @type {import('./$types').PageData} */
	export let data;
	let inputs = data.inputs,
		datetime = '';
	function fetchData() {
        goto('/rewards/royalty_users/bonus/' + datetime )
	

    }
</script>
<div class="flex sm:grid grid-cols-12 flex-col-reverse">

<div class="col-span-12 sm:col-span-4 mr-4 py-4">
	<Card class="w-full max-w-md ">
		<form
			class="flex flex-col space-y-6"
			action="javascript:void(0);"
			on:submit|preventDefault={fetchData}
		>
			<h3 class="text-xl font-medium text-gray-900 dark:text-white">Monthly Royalty Bonus</h3>

			<Label class="space-y-2">
				<span>Month-Year</span>
				<Input type="text" name="module" placeholder="MM-YYYY" bind:value={datetime} required />
			</Label>

			<Button type="submit" class="w-full">Check</Button>
		</form>
	</Card>
</div>
<div class="col-span-12 sm:col-span-8 mx-4 p-4">
	<Datatable
		data={{
			showNew: true,
			inputs: inputs,
			search_queries: null,
			model: 'RoyaltyUser',
			preloads: ['user'],
			customCols: [
				{
					title: 'General',
					list: [
						'id',
						'perc',
						{
							label: 'user_id',
							selection: 'User',
							customCols: null,
							search_queries: ['a.username'],
							newData: 'username',
							title_key: 'username'
						}
					]
				}
			],
			columns: [
				{ label: 'ID', data: 'id' },
				{ label: 'Perc', data: 'perc' },
				// { label: 'Code', data: 'member_code', isBadge: true },
				{ label: 'User', data: 'username', through: ['user'] }
			]
		}}
	/>
</div>

</div>