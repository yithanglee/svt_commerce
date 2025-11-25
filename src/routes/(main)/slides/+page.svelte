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
		// goto('/deliveries/' + data.id);
	}
</script>

<Datatable
	data={{
		showNew: true,
		inputs: inputs,

		search_queries: ['a.remarks'],
		model: 'Slide',
		preloads: [],
		buttons: [{ name: 'Preview', onclickFn: viewDO }],
		customCols: [
			{
				title: 'Order',
				list: [
					'id',
                    'order',
					'remarks',
                    { label: 'mobile_img_url', upload: true },
					{ label: 'img_url', upload: true },
					{ label: 'is_show', boolean: true }
				]
			}
		],
		columns: [
			{ label: 'ID', data: 'id' },

            { label: 'Sequence', data: 'order' },
            { label: 'Mobile', data: 'mobile_img_url', showImg: true },
            { label: 'Desktop', data: 'img_url', showImg: true },

			{ label: 'Timestamp', data: 'inserted_at', formatDateTime: true, offset: 8 },
			{ label: 'Remarks', data: 'remarks' },
			{
				label: 'Status',
				data: 'is_show',
				isBadge: true,
				color: [
					{
						key: 'false',
						value: 'pink'
					},

					{
						key: 'true',
						value: 'green'
					}
				]
			}
		]
	}}
/>
