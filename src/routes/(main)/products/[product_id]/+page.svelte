<script>
	import { goto, invalidateAll } from '$app/navigation';
	import { addItem } from '$lib/stores/cart';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	
	/** @type {import('./$types').PageData} */
	export let data;
	
	// Make these reactive so they update when data changes
	$: product = data.product;
	$: relatedProducts = data.relatedProducts || [];
	$: category = data.category;
	
	// Product images - use img_url as main, could be extended to support multiple images
	$: productImages = (() => {
		let images = [];
		if (product) {
			if (product.img_url) {
				images.push(product.img_url);
			}
			// Add additional images if available (assuming product might have img_url_2, img_url_3, etc.)
			if (product.img_url_2) images.push(product.img_url_2);
			if (product.img_url_3) images.push(product.img_url_3);
			if (product.img_url_4) images.push(product.img_url_4);
			// If only one image, duplicate it for the gallery
			if (images.length === 1) {
				images = [images[0], images[0], images[0], images[0]];
			} else if (images.length === 2) {
				images = [images[0], images[1], images[0], images[1]];
			} else if (images.length === 3) {
				images = [images[0], images[1], images[2], images[0]];
			}
			// Ensure we have at least 4 images for the grid
			while (images.length < 4) {
				images.push(images[0] || '/placeholder.png');
			}
		}
		return images;
	})();
	
	function handleAddToCart() {
		if (product) {
			addItem(product);
		}
	}
	
	function handleBuyNow() {
		if (product) {
			addItem(product);
			goto('/cart');
		}
	}
	
	async function goToProduct(productId) {
		await goto(`/products/${productId}`, { invalidateAll: true });
	}
	
	function formatDate(dateString) {
		if (!dateString) return '';
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now - date);
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
		
		if (diffDays === 0) return 'today';
		if (diffDays === 1) return '1 day ago';
		return `${diffDays} days ago`;
	}
	
	function getImageUrl(imgUrl) {
		if (!imgUrl) return '/placeholder.png';
		if (imgUrl.startsWith('http')) return imgUrl;
		return PHX_HTTP_PROTOCOL + PHX_ENDPOINT + imgUrl;
	}
</script>

{#if product}
	<div class="px-40 flex flex-1 justify-center py-5 bg-gray-900">
		<div class="layout-content-container flex flex-col max-w-[960px] flex-1">
			<!-- Breadcrumb -->
			<div class="flex flex-wrap gap-2 p-4">
				{#if category}
					<a class="text-base font-medium leading-normal transition-colors cursor-pointer" href="/shop?category={category.id}">
						{category.name || 'Clothing'}
					</a>
					<span class="text-base font-medium leading-normal">/</span>
				{/if}
				<span class="text-base font-medium leading-normal">{product.name || 'Product'}</span>
			</div>
			
			<!-- Product Image Gallery -->
			<div class="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
				{#each productImages.slice(0, 4) as imageUrl}
					<div class="flex flex-col gap-3">
						<div 
							class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
							style='background-image: url("{getImageUrl(imageUrl)}");'
						></div>
					</div>
				{/each}
			</div>
			
			<!-- Product Title -->
			<h1 class="text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
				{product.name || 'Product Name'}
			</h1>
			
			<!-- Product Description -->
			<p class="text-base font-normal leading-normal pb-3 pt-1 px-4">
				{product.desc || product.description || 'No description available.'}
			</p>
			
			<!-- Listed By Info -->
			<p class="text-sm font-normal leading-normal pb-3 pt-1 px-4">
				{#if product.merchant_name}
					Listed by {product.merchant_name}
				{:else if product.created_at}
					Listed {formatDate(product.created_at)}
				{:else}
					Listed recently
				{/if}
			</p>
			
			<!-- Price -->
			<h1 class="text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
				RM {(parseFloat(product.retail_price) || 0).toFixed(2)}
			</h1>
			
			<!-- Action Buttons -->
			<div class="flex justify-stretch">
				<div class="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
					<button 
						class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-blue-600 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors"
						on:click={handleAddToCart}
					>
						<span class="truncate">Add to Cart</span>
					</button>
					<button 
						class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-blue-800 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-900 transition-colors"
						on:click={handleBuyNow}
					>
						<span class="truncate">Buy Now</span>
					</button>
				</div>
			</div>
			
			<!-- Save and Share Buttons -->
			<div class="@container">
				<div class="gap-2 px-4 flex flex-wrap justify-start">
					<div class="flex flex-col items-center gap-2 bg-gray-900 py-2.5 text-center w-20">
						<div class="rounded-full bg-blue-800 p-2.5 cursor-pointer hover:bg-blue-900 transition-colors">
							<div class="">
								<svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
									<path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z"></path>
								</svg>
							</div>
						</div>
						<p class="text-sm font-medium leading-normal">Save</p>
					</div>
					<div class="flex flex-col items-center gap-2 bg-gray-900 py-2.5 text-center w-20">
						<button 
							class="rounded-full bg-blue-800 p-2.5 cursor-pointer hover:bg-blue-900 transition-colors border-none"
							aria-label="Share product"
							on:click={() => {
								if (navigator.share) {
									navigator.share({
										title: product.name,
										text: product.desc || product.description,
										url: window.location.href
									});
								} else {
									// Fallback: copy to clipboard
									navigator.clipboard.writeText(window.location.href);
									alert('Link copied to clipboard!');
								}
							}}
						>
							<div class="">
								<svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
									<path d="M229.66,109.66l-48,48a8,8,0,0,1-11.32-11.32L204.69,112H165a88,88,0,0,0-85.23,66,8,8,0,0,1-15.5-4A103.94,103.94,0,0,1,165,96h39.71L170.34,61.66a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,229.66,109.66ZM192,208H40V88a8,8,0,0,0-16,0V208a16,16,0,0,0,16,16H192a8,8,0,0,0,0-16Z"></path>
								</svg>
							</div>
						</button>
						<p class="text-sm font-medium leading-normal">Share</p>
					</div>
				</div>
			</div>
			
			<!-- Related Items -->
			{#if relatedProducts.length > 0}
				<h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Related Items</h2>
				<div class="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					<div class="flex items-stretch p-4 gap-3">
						{#each relatedProducts as relatedProduct (relatedProduct.id)}
							<button
								on:click={() => goToProduct(relatedProduct.id)}
								class="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40 cursor-pointer hover:opacity-90 transition-opacity text-left"
							>
								<div 
									class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
									style='background-image: url("{getImageUrl(relatedProduct.img_url)}");'
								></div>
								<div>
									<p class="text-base font-medium leading-normal">{relatedProduct.name}</p>
									<p class="text-sm font-normal leading-normal">RM {(parseFloat(relatedProduct.retail_price) || 0).toFixed(2)}</p>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="px-40 flex flex-1 justify-center py-5">
		<div class="layout-content-container flex flex-col max-w-[960px] flex-1">
			<div class="flex flex-col items-center justify-center py-20">
				<p class="text-lg">Product not found</p>
				<button 
					class="mt-4 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-blue-600 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors"
					on:click={() => goto('/shop')}
				>
					<span class="truncate">Back to Shop</span>
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?display=swap&family=Manrope:wght@400;500;700;800&family=Noto+Sans:wght@400;500;700;900');
</style>
