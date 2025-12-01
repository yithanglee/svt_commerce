<script>
	import { cartItems, removeItem, setQty, clearCart } from '$lib/stores/cart';
	import { postData, api_get } from '$lib/index.js';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { session } from '$lib/stores/session';
	import { onMount } from 'svelte';
	
	/** @type {import('./$types').PageData} */
	export let data;
	
	let isSubmitting = false;
	let shippingOption = 'standard';
	let paymentMethod = 'member_points';
	
	// Shipping information
	let address = '';
	let city = '';
	let state = '';
	let zipCode = '';
	
	// Member points
	let memberPointsBalance = data?.eWallet?.total || 0;
	let isLoadingPoints = false;
	
	$: items = $cartItems;
	$: subtotal = items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0), 0);
	$: shippingCost = shippingOption === 'express' ? 15 : (shippingOption === 'self_pickup' ? 0 : 0);
	$: total = subtotal + shippingCost;
	$: insufficientPoints = paymentMethod === 'member_points' && memberPointsBalance < total;
	
	onMount(async () => {
	});
	


	function getImageUrl(imgUrl) {
		if (!imgUrl) return '/placeholder.png';
		if (imgUrl.startsWith('http')) return imgUrl;
		return PHX_HTTP_PROTOCOL + PHX_ENDPOINT + imgUrl;
	}
	
	async function checkout() {
		if (insufficientPoints) {
			return;
		}
		
		isSubmitting = true;
		const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
		const payload = { 
			scope: 'ecommerce_checkout', 
			items,
			shippingOption,
			paymentMethod,
			shippingInfo: {
				address,
				city,
				state,
				zipCode
			}
		};
		const res = await postData(payload, { endpoint: url + '/svt_api/webhook' });
		isSubmitting = false;
		if (res && res.status === 'ok') {
			clearCart();
		}
	}
</script>

<div class="relative flex h-auto min-h-screen w-full flex-col bg-gray-900 dark group/design-root overflow-x-hidden" style="--radio-dot-svg: url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(37,99,235)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3ccircle cx=%278%27 cy=%278%27 r=%273%27/%3e%3c/svg%3e'); font-family: Manrope, &quot;Noto Sans&quot;, sans-serif;">
	<div class="px-40 flex flex-1 justify-center py-5">
		<div class="layout-content-container flex flex-col max-w-[960px] flex-1">
			<!-- Breadcrumb -->
			<div class="flex flex-wrap gap-2 p-4">
				<a href="/shop" class="text-blue-300 text-base font-medium leading-normal hover:text-white transition-colors">Shop</a>
				<span class="text-blue-300 text-base font-medium leading-normal">/</span>
				<span class="text-white text-base font-medium leading-normal">Cart</span>
			</div>
			
			<!-- Page Title -->
			<div class="flex flex-wrap justify-between gap-3 p-4">
				<p class="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Your Cart</p>
			</div>
			
			{#if items.length === 0}
				<div class="p-4">
					<p class="text-blue-300 text-base font-normal leading-normal">Your cart is empty.</p>
				</div>
			{:else}
				<!-- Items in Cart -->
				<h3 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Items in Cart</h3>
				<div class="space-y-0">
					{#each items as item (item.product_id)}
						<div class="flex gap-4 bg-gray-900 px-4 py-3">
							<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-[70px] w-[70px] h-[70px]" style='background-image: url("{ getImageUrl(item.img_url) || '/placeholder.png'}")'></div>
							<div class="flex flex-1 flex-col justify-center">
								<p class="text-white text-base font-medium leading-normal">{item.name}</p>
								{#if item.size}
									<p class="text-blue-300 text-sm font-normal leading-normal">Size: {item.size}</p>
								{/if}
								<div class="flex items-center gap-2 mt-1">
									<label for="qty-{item.product_id}" class="text-blue-300 text-sm font-normal leading-normal">Qty:</label>
									<input 
										id="qty-{item.product_id}" 
										type="number" 
										min="1" 
										value={item.qty} 
										on:change={(e) => setQty(item.product_id, Number(e.target.value))} 
										class="w-20 border border-gray-700 bg-gray-800 text-white rounded px-2 py-1 text-sm focus:outline-0 focus:ring-0 focus:border-blue-600" 
									/>
								</div>
							</div>
							<button 
								class="text-blue-300 text-sm font-normal leading-normal hover:text-white transition-colors self-center" 
								on:click={() => removeItem(item.product_id)}
							>
								Remove
							</button>
						</div>
					{/each}
				</div>
				
				<!-- Shipping Information -->
				<h3 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Shipping Information</h3>
				<div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
					<label class="flex flex-col min-w-40 flex-1">
						<p class="text-white text-base font-medium leading-normal pb-2">Address</p>
						<input 
							type="text" 
							bind:value={address}
							placeholder="Enter your address" 
							class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border border-gray-700 bg-gray-800 focus:border-blue-600 h-14 placeholder:text-blue-300 p-[15px] text-base font-normal leading-normal"
						/>
					</label>
				</div>
				<div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
					<label class="flex flex-col min-w-40 flex-1">
						<p class="text-white text-base font-medium leading-normal pb-2">City</p>
						<input 
							type="text" 
							bind:value={city}
							placeholder="Enter your city" 
							class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border border-gray-700 bg-gray-800 focus:border-blue-600 h-14 placeholder:text-blue-300 p-[15px] text-base font-normal leading-normal"
						/>
					</label>
				</div>
				<div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
					<label class="flex flex-col min-w-40 flex-1">
						<p class="text-white text-base font-medium leading-normal pb-2">State</p>
						<input 
							type="text" 
							bind:value={state}
							placeholder="Enter your state" 
							class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border border-gray-700 bg-gray-800 focus:border-blue-600 h-14 placeholder:text-blue-300 p-[15px] text-base font-normal leading-normal"
						/>
					</label>
					<label class="flex flex-col min-w-40 flex-1">
						<p class="text-white text-base font-medium leading-normal pb-2">Zip Code</p>
						<input 
							type="text" 
							bind:value={zipCode}
							placeholder="Enter zip code" 
							class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border border-gray-700 bg-gray-800 focus:border-blue-600 h-14 placeholder:text-blue-300 p-[15px] text-base font-normal leading-normal"
						/>
					</label>
				</div>
				
				<!-- Shipping Options -->
				<h3 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Shipping Options</h3>
				<div class="flex flex-col gap-3 p-4">
					<label class="flex items-center gap-4 rounded-lg border border-solid border-gray-700 p-[15px] cursor-pointer hover:border-blue-600 transition-colors">
						<input 
							type="radio" 
							name="shipping" 
							value="standard" 
							bind:group={shippingOption}
							class="h-5 w-5 border-2 border-gray-700 bg-transparent text-transparent checked:border-blue-600 checked:bg-[image:--radio-dot-svg] focus:outline-none focus:ring-0 focus:ring-offset-0 checked:focus:border-blue-600"
						/>
						<div class="flex grow flex-col">
							<p class="text-white text-sm font-medium leading-normal">Standard (5-7 business days)</p>
							<p class="text-blue-300 text-sm font-normal leading-normal">Free</p>
						</div>
					</label>
					<label class="flex items-center gap-4 rounded-lg border border-solid border-gray-700 p-[15px] cursor-pointer hover:border-blue-600 transition-colors">
						<input 
							type="radio" 
							name="shipping" 
							value="self_pickup" 
							bind:group={shippingOption}
							class="h-5 w-5 border-2 border-gray-700 bg-transparent text-transparent checked:border-blue-600 checked:bg-[image:--radio-dot-svg] focus:outline-none focus:ring-0 focus:ring-offset-0 checked:focus:border-blue-600"
						/>
						<div class="flex grow flex-col">
							<p class="text-white text-sm font-medium leading-normal">Self Pickup</p>
							<p class="text-blue-300 text-sm font-normal leading-normal">Free</p>
						</div>
					</label>
				</div>
				
				<!-- Payment Method -->
				<h3 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Payment Method</h3>
				<div class="flex flex-col gap-3 p-4">
					<label class="flex items-center gap-4 rounded-lg border border-solid border-gray-700 p-[15px] cursor-pointer hover:border-blue-600 transition-colors">
						<input 
							type="radio" 
							name="payment" 
							value="member_points" 
							bind:group={paymentMethod}
							class="h-5 w-5 border-2 border-gray-700 bg-transparent text-transparent checked:border-blue-600 checked:bg-[image:--radio-dot-svg] focus:outline-none focus:ring-0 focus:ring-offset-0 checked:focus:border-blue-600"
						/>
						<div class="flex grow flex-col">
							<p class="text-white text-sm font-medium leading-normal">Member Points Balance</p>
							<p class="text-blue-300 text-sm font-normal leading-normal">
								{#if isLoadingPoints}
									Loading...
								{:else}
									Current Balance: {memberPointsBalance} points
								{/if}
							</p>
						</div>
					</label>
				</div>
				
				{#if paymentMethod === 'member_points' && insufficientPoints}
					<div class="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 p-4 mx-4">
						<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
							<path clip-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fill-rule="evenodd"></path>
						</svg>
						<p class="text-red-400 text-sm font-medium">Insufficient member points to checkout.</p>
					</div>
				{/if}
				
				<!-- Order Summary -->
				<h3 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Order Summary</h3>
				<div class="p-4">
					<div class="flex justify-between gap-x-6 py-2">
						<p class="text-blue-300 text-sm font-normal leading-normal">Subtotal</p>
						<p class="text-white text-sm font-normal leading-normal text-right">${subtotal.toFixed(2)}</p>
					</div>
					<div class="flex justify-between gap-x-6 py-2">
						<p class="text-blue-300 text-sm font-normal leading-normal">Shipping</p>
						<p class="text-white text-sm font-normal leading-normal text-right">{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</p>
					</div>
					<div class="flex justify-between gap-x-6 py-2">
						<p class="text-blue-300 text-sm font-normal leading-normal">Total</p>
						<p class="text-white text-sm font-normal leading-normal text-right">${total.toFixed(2)}</p>
					</div>
				</div>
				
				<!-- Place Order Button -->
				<div class="flex px-4 py-3 justify-end">
					<button 
						class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-blue-600 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
						disabled={isSubmitting || insufficientPoints} 
						on:click={checkout}
					>
						<span class="truncate">{isSubmitting ? 'Processing...' : 'Place Order'}</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

