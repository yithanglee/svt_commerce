<script>
	import ProductCard from '$lib/components/ecommerce/ProductCard.svelte';
	import { addItem } from '$lib/stores/cart';
	/** @type {import('./$types').PageData} */
	export let data;
	let products = Array.isArray(data?.products) ? data.products : [];
	function handleAdd(e) {
		addItem(e.detail.product);
	}
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold">Shop</h1>
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each products as product (product.id)}
			<ProductCard {product} on:add={handleAdd} />
		{/each}
	</div>
</div>

