<script>
	/** @type {import('./$types').PageData} */

	import SimpleTable from '$lib/components/SimpleTable.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { postData, buildQueryString } from '$lib/index.js';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { isToastOpen } from '$lib/stores/toast';
	var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

	export let data;

	let shippingDeets = JSON.parse(data.sale.registration_details).user.shipping;
</script>

<SimpleTable
	title="Deliveries - #SO"
	+
	data.id
	description={'Recipient: ' +
		shippingDeets.fullname +
		'(' +
		shippingDeets.phone +
		')<br>' +
		'<br>Address: ' +
		(shippingDeets.line1 || '') +
		' ' +
		(shippingDeets.line2 || '') +
		'<br>' +
		(shippingDeets.city || '') +
		' ' +
		(shippingDeets.postcode || '') +
		' ' +
		(shippingDeets.state || '')}
	data={{
		apiData: { id: data.id },
		buttons: [],
		scope: 'get_sales_items',
		columns: [
			{ label: 'Img', data: 'img_url', showImg: true },
			{ label: 'Name', data: 'item_name' },

			{ label: 'Qty', data: 'qty' }
		]
	}}
/>
