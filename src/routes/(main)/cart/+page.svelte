<script>
	import { cartItems, removeItem, setQty, clearCart } from '$lib/stores/cart';
	import { postData } from '$lib/index.js';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { get } from 'svelte/store';
	let isSubmitting = false;
	$: items = $cartItems;
	$: total = items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0), 0);
	async function checkout() {
		isSubmitting = true;
		const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
		const payload = { scope: 'ecommerce_checkout', items };
		const res = await postData(payload, { endpoint: url + '/svt_api/webhook' });
		isSubmitting = false;
		if (res && res.status === 'ok') {
			clearCart();
		}
	}
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold">Your Cart</h1>
	{#if items.length === 0}
		<p class="text-gray-500">Your cart is empty.</p>
	{:else}
		<div class="space-y-3">
			{#each items as item (item.product_id)}
				<div class="flex items-center gap-3 p-3 border rounded">
					<img src={item.img_url || '/placeholder.png'} alt={item.name} class="w-16 h-16 object-cover rounded" />
					<div class="flex-1">
						<div class="font-semibold">{item.name}</div>
						<div class="text-sm text-gray-500">RM {item.price}</div>
						<div class="mt-1 flex items-center gap-2">
							<label for="qty" class="text-sm">Qty</label>
							<input id="qty" type="number" min="1" value={item.qty} on:change={(e) => setQty(item.product_id, Number(e.target.value))} class="w-20 border rounded px-2 py-1" />
						</div>
					</div>
					<button class="text-red-600 text-sm" on:click={() => removeItem(item.product_id)}>Remove</button>
				</div>
			{/each}
		</div>
		<div class="flex items-center justify-between pt-4 border-t">
			<div class="text-lg font-semibold">Total: RM {total.toFixed(2)}</div>
			<button class="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={isSubmitting} on:click={checkout}>
				{isSubmitting ? 'Processing...' : 'Checkout'}
			</button>
		</div>
	{/if}
</div>

