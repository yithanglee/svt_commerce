<script>
	import { createEventDispatcher } from 'svelte';
	import { Card, Button } from 'flowbite-svelte';
	const dispatch = createEventDispatcher();
	export let product;
	function addToCart() {
		dispatch('add', { product });
	}
</script>

<Card class="w-full h-full">
	<div class="flex flex-col h-full">
		<img src={product.img_url || '/placeholder.png'} alt={product.name} class="w-full h-48 object-cover rounded" />
		<div class="mt-3 flex-1">
			<h3 class="text-lg font-semibold">{product.name}</h3>
			<p class="text-sm text-gray-500 line-clamp-3">{product.desc}</p>
			<div class="mt-2 font-bold">RM {product.retail_price}</div>
		</div>
		<div class="mt-4">
			<Button class="w-full" on:click={addToCart}>Add to cart</Button>
		</div>
	</div>
</Card>


