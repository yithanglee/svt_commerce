<script>
	import { Card, Button, Spinner, Label, Input, Checkbox, Select } from 'flowbite-svelte';

	let positions = [
		{ value: 'left', name: 'Left' },
		{ value: 'right', name: 'Right' }
	];
	import { postData } from '$lib/index.js';
	import Datatable from '$lib/components/Datatable.svelte';
	/** @type {import('./$types').PageData} */
	export let data;
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

	import { isTableReloaded } from '$lib/stores/reloadTable';
	let fullname,
		isLoading = false,
		password,
		phone,
		email,
		sponsor,
		position,
		username,
		inputs = data.inputs;
	async function fetchData3() {
		isLoading = true;
		setTimeout(() => {
			isLoading = false;
		}, 6000);
		var form = document.getElementById('currentForm3');
		var formData = new FormData(form);
		await postData(formData, {
			isFormData: true,
			endpoint: PHX_HTTP_PROTOCOL + PHX_ENDPOINT + '/svt_api/webhook?scope=admin_modify_referral',
			successCallback: () => {
				isLoading = false;
				// isToastOpen.notify('Member recorded!');
				isTableReloaded.activate();
			}
		});
	}
	async function fetchData2() {
		isLoading = true;
		setTimeout(() => {
			isLoading = false;
		}, 6000);
		var form = document.getElementById('currentForm2');
		var formData = new FormData(form);
		await postData(formData, {
			isFormData: true,
			endpoint: PHX_HTTP_PROTOCOL + PHX_ENDPOINT + '/svt_api/webhook?scope=admin_modify_placement',
			successCallback: () => {
				isLoading = false;
				// isToastOpen.notify('Member recorded!');
				isTableReloaded.activate();
			}
		});
	}
	async function fetchData() {
		isLoading = true;
		setTimeout(() => {
			isLoading = false;
		}, 6000);
		var form = document.getElementById('currentForm');
		var formData = new FormData(form);
		await postData(formData, {
			isFormData: true,
			endpoint: PHX_HTTP_PROTOCOL + PHX_ENDPOINT + '/svt_api/webhook?scope=admin_register_member',
			successCallback: () => {
				isLoading = false;
				// isToastOpen.notify('Member recorded!');
				isTableReloaded.activate();
			}
		});
	}
</script>

<div class="flex sm:grid grid-cols-12 flex-col-reverse">
	<div class="col-span-12 sm:col-span-9 mx-4 p-4">
		<Datatable
			data={{canDelete: true,
				inputs: inputs,
				search_queries: ['a.username|a.phone'],
				model: 'User',
				preloads: ['rank'],
				customCols: [
					{
						title: 'General',
						list: [
							'id',
							'username',
							'fullname',

							{
								label: 'rank_id',
								selection: 'Rank',
								customCols: null,
								search_queries: ['a.name'],
								newData: 'name',
								title_key: 'name'
							},
							{ label: 'is_stockist', boolean: true },
							{ label: 'stockist_type', selection: ['mobile', 'area', 'regional'] },
						]
					},
					{
						title: 'Personal Info',
						list: [
							'phone',
							'email',
							'rank_name',
							'ic_no',
							{ label: 'password', expose: true },
							'bank_account_holder',
							'bank_account_no',
							'bank_name'
						]
					},
					{
						title: 'Admin',
						list: [
							'temp_pin',
							
						]
					}
				],
				columns: [
					{ label: 'ID', data: 'id' },
					{
						label: 'Stockist?',
						data: 'is_stockist',
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

					{ label: 'Username', data: 'username' },
					{ label: 'Phone/Email', data: 'phone', subtitle: { data: 'email' } },

					{ label: 'Rank', data: 'name', through: ['rank'] }
				]
			}}
		/>
	</div>
	<div class="col-span-12 sm:col-span-3 mr-4 py-4">
		<Card class="w-full max-w-md ">
			<form
				id="currentForm3"
				class="flex flex-col space-y-6"
				action="javascript:void(0);"
				on:submit|preventDefault={fetchData3}
			>
				<h3 class="text-xl font-medium text-gray-900 dark:text-white">Modify referral</h3>

				<Label class="space-y-2">
					<span>Username</span>
					<Input type="text" name="username" placeholder="" />
				</Label>
				<Label class="space-y-2">
					<span>Under Username</span>
					<Input type="text" name="to_new_placement_username" placeholder="" />
				</Label>


				{#if isLoading}
					<div class="text-center"><Spinner /></div>
				{:else}
					<Button type="submit" class="w-full">Create</Button>
				{/if}
			</form>
		</Card>
		<Card class="w-full max-w-md ">
			<form
				id="currentForm2"
				class="flex flex-col space-y-6"
				action="javascript:void(0);"
				on:submit|preventDefault={fetchData2}
			>
				<h3 class="text-xl font-medium text-gray-900 dark:text-white">Modify placement</h3>

				<Label class="space-y-2">
					<span>Username</span>
					<Input type="text" name="username" placeholder="" />
				</Label>
				<Label class="space-y-2">
					<span>Under Username</span>
					<Input type="text" name="to_new_placement_username" placeholder="" />
				</Label>

				<Label class="space-y-2">
					<span>Position</span>

					<Select class="mt-2" name="position" items={positions} />
				</Label>

				{#if isLoading}
					<div class="text-center"><Spinner /></div>
				{:else}
					<Button type="submit" class="w-full">Create</Button>
				{/if}
			</form>
		</Card>
		<Card class="w-full max-w-md ">
			<form
				id="currentForm"
				class="flex flex-col space-y-6"
				action="javascript:void(0);"
				on:submit|preventDefault={fetchData}
			>
				<h3 class="text-xl font-medium text-gray-900 dark:text-white">
					Register Member Without Products
				</h3>
				<Label class="space-y-2">
					<span>Sponsor</span>
					<Input type="text" name="user[sponsor]" placeholder="" />
				</Label>

				<Label class="space-y-2">
					<span>Username</span>
					<Input type="text" name="user[username]" placeholder="" />
				</Label>
				<Label class="space-y-2">
					<span>IC Name</span>
					<Input type="text" name="user[fullname]" placeholder="" />
				</Label>
				<Label class="space-y-2">
					<span>Position</span>

					<Select class="mt-2" name="user[placement][position]" items={positions} />
				</Label>
				<Label class="space-y-2">
					<span>Password</span>
					<Input type="text" name="user[password]" placeholder="" />
				</Label>
				<Label class="space-y-2">
					<span>Phone</span>
					<Input type="text" name="user[phone]" placeholder="" />
				</Label>
				<Label class="space-y-2">
					<span>Email</span>
					<Input type="text" name="user[email]" placeholder="" />
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
