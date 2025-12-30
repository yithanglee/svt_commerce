<script>
	import { goto } from '$app/navigation';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	
	/** @type {import('./$types').PageData} */
	export let data;
	
	const merchant = data.merchant || {};
	const banners = data.banners || [];
	const merchant_id = data.merchant_id;
	let products = data.products || [];
	
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	
	// Search and filter state
	let searchQuery = '';
	let sortBy = 'price';
	let currentPage = 1;
	const itemsPerPage = 8;
	let previousSearchQuery = '';
	
	// Reset to page 1 when search query changes
	$: {
		if (searchQuery !== previousSearchQuery) {
			currentPage = 1;
			previousSearchQuery = searchQuery;
		}
	}
	
	// Get banner image
	function getBannerImage() {
		if (banners && banners.length > 0 && banners[0].img_url) {
			return banners[0].img_url.startsWith('http') 
				? banners[0].img_url 
				: url + banners[0].img_url;
		}
		if (merchant.background_image) {
			return merchant.background_image.startsWith('http') 
				? merchant.background_image 
				: url + merchant.background_image;
		}
		if (merchant.img_url) {
			return merchant.img_url.startsWith('http') 
				? merchant.img_url 
				: url + merchant.img_url;
		}
		return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvESCivmaIK2plGAYSpK58ZiY0UYL49m968NuqYE_WaSdShUL7lGE5dtBS7TebNU6m178DpudxHDKH9IblA8pm9lmzuEUNFQyx0CVOVb2lBT9-d_orAlNvEhQMSAoejXvLlaMpxVEEtPjLkM5CzEoIsvRhKzsTEGmgSq_dSKpRPgs_lv8DcIFnZFS09QLW2LMvotCDPPn2dYqRq1SN4L2urpQdmRkO-VQLCIsMxTrwCSZbnfjtgkIwjgnarDr5L3cclgfvhzvDuYs';
	}
	
	function getMerchantName() {
		return merchant.name || merchant.business_name || 'Merchant Store';
	}
	
	function getMerchantDescription() {
		return merchant.description || merchant.remarks || 'Curated collection of unique products.';
	}

	function getMerchantAvatar() {
		const imgUrl = merchant.img_url;
		if (!imgUrl) return '/placeholder.png';
		if (imgUrl.startsWith('http')) return imgUrl;
		return url + imgUrl;
	}
	
	// Filter and sort products
	$: filteredProducts = (() => {
		let filtered = products;
		
		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(p => 
				p.name?.toLowerCase().includes(query) ||
				p.description?.toLowerCase().includes(query) ||
				p.brand_name?.toLowerCase().includes(query)
			);
		}
		
		// Apply sorting
		if (sortBy === 'price') {
			filtered = [...filtered].sort((a, b) => {
				const priceA = parseFloat(a.retail_price) || 0;
				const priceB = parseFloat(b.retail_price) || 0;
				return priceA - priceB;
			});
		} else if (sortBy === 'price-desc') {
			filtered = [...filtered].sort((a, b) => {
				const priceA = parseFloat(a.retail_price) || 0;
				const priceB = parseFloat(b.retail_price) || 0;
				return priceB - priceA;
			});
		} else if (sortBy === 'name') {
			filtered = [...filtered].sort((a, b) => {
				const nameA = (a.name || '').toLowerCase();
				const nameB = (b.name || '').toLowerCase();
				return nameA.localeCompare(nameB);
			});
		}
		
		return filtered;
	})();
	
	// Pagination
	$: totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
	$: paginatedProducts = filteredProducts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);
	
	$: if (currentPage > totalPages && totalPages > 0) {
		currentPage = totalPages;
	}
	
	function getImageUrl(imgUrl) {
		if (!imgUrl) return '/placeholder.png';
		if (imgUrl.startsWith('http')) return imgUrl;
		return url + imgUrl;
	}
	
	function formatPrice(price) {
		const numPrice = parseFloat(price) || 0;
		return `${numPrice.toFixed(2)} NETSPH`;
	}
	
	function goToProduct(productId) {
		goto(`/products/${productId}`);
	}
	
	function handleSortChange() {
		if (sortBy === 'price') {
			sortBy = 'price-desc';
		} else if (sortBy === 'price-desc') {
			sortBy = 'name';
		} else {
			sortBy = 'price';
		}
		currentPage = 1;
	}
	
	function getSortLabel() {
		if (sortBy === 'price') return 'Price: Low to High';
		if (sortBy === 'price-desc') return 'Price: High to Low';
		if (sortBy === 'name') return 'Name: A to Z';
		return 'Sort by: Price';
	}
</script>

<div class="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-dark dark:bg-background-dark">
	<main class="layout-container flex h-full grow flex-col">
		<div class="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-10">
			<div class="layout-content-container flex flex-col w-full max-w-6xl flex-1">
				<!-- Merchant Banner Section -->
				<div class="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-8">
					<div class="absolute inset-0 bg-cover bg-center" style='background-image: url("{getBannerImage()}");'></div>
					<div class="absolute inset-0 bg-black/50"></div>
					<div class="relative h-full flex flex-col justify-center items-center text-center p-8">
						<img
							src={getMerchantAvatar()}
							alt={`${getMerchantName()} avatar`}
							class="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white/20 shadow-lg mb-4"
							loading="lazy"
						/>
						<h1 class="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
							{getMerchantName()}
						</h1>
						<p class="text-gray-300 text-lg mt-2 max-w-2xl">
							{getMerchantDescription()}
						</p>
					</div>
				</div>

				<!-- Search and Filter Controls -->
				<div class="flex flex-col md:flex-row justify-between gap-4 p-4">
					<div class="flex flex-1">
						<label class="flex flex-col w-full max-w-sm">
							<div class="relative flex w-full flex-1 items-stretch rounded-lg h-10">
								<div class="text-gray-400 flex items-center justify-center pl-3 absolute inset-y-0 left-0">
									<span class="material-symbols-outlined" style="font-size: 20px;">search</span>
								</div>
								<input 
									class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary border-white/10 bg-white/5 h-full placeholder:text-gray-400 pl-10 text-base font-normal leading-normal dark:bg-white/5 dark:border-white/10 dark:text-white" 
									placeholder="Search this store..." 
									bind:value={searchQuery}
								/>
							</div>
						</label>
					</div>
					<div class="flex gap-2">
						<button 
							class="flex min-w-0 max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white/5 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] px-4 hover:bg-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
							on:click={() => {}}
						>
							<span class="material-symbols-outlined text-gray-400" style="font-size: 20px;">filter_list</span>
							<span class="truncate">Filter</span>
						</button>
						<button 
							class="flex min-w-0 max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white/5 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] px-4 hover:bg-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
							on:click={handleSortChange}
						>
							<span class="material-symbols-outlined" style="font-size: 20px;">swap_vert</span>
							<span class="truncate">{getSortLabel()}</span>
						</button>
					</div>
				</div>

				<!-- Products Grid -->
				{#if paginatedProducts.length > 0}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
						{#each paginatedProducts as product}
							<div class="flex flex-col gap-3 pb-3 bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-primary transition-colors duration-300 group dark:bg-white/5 dark:border-white/10 dark:hover:border-primary">
								<a class="block" href="/products/{product.id}" on:click|preventDefault={() => goToProduct(product.id)}>
									<div 
										class="w-full bg-center bg-no-repeat aspect-square bg-cover" 
										data-alt={product.name || 'Product image'}
										style='background-image: url("{getImageUrl(product.img_url)}");'
									></div>
									<div class="p-4 flex flex-col gap-2">
										<p class="text-white text-base font-bold leading-normal group-hover:text-primary transition-colors dark:text-white dark:group-hover:text-primary">
											{product.name || 'Unnamed Product'}
										</p>
										<p class="text-primary text-lg font-semibold leading-normal">
											{formatPrice(product.retail_price)}
										</p>
									</div>
								</a>
							</div>
						{/each}
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center p-12 text-center">
						<span class="material-symbols-outlined text-6xl text-gray-400 mb-4" style="font-size: 64px;">inventory_2</span>
						<p class="text-white text-xl font-semibold mb-2 dark:text-white">
							{searchQuery ? 'No products found' : 'No products available'}
						</p>
						<p class="text-gray-400 text-base dark:text-gray-400">
							{searchQuery ? 'Try adjusting your search terms' : 'This merchant hasn\'t added any products yet'}
						</p>
					</div>
				{/if}

				<!-- Pagination -->
				{#if totalPages > 1}
					<div class="flex items-center justify-center p-4">
						<nav class="flex items-center gap-2">
							<button 
								class="flex size-10 items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
								on:click={() => currentPage = Math.max(1, currentPage - 1)}
								disabled={currentPage === 1}
							>
								<span class="material-symbols-outlined" style="font-size: 20px;">chevron_left</span>
							</button>
							
							{#each Array(totalPages) as _, i}
								{@const pageNum = i + 1}
								{#if pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)}
									<button
										class="text-sm font-bold leading-normal tracking-[0.015em] flex size-10 items-center justify-center text-white rounded-lg {pageNum === currentPage ? 'bg-primary' : 'hover:bg-white/5 transition-colors dark:text-white dark:hover:bg-white/5'}"
										on:click={() => currentPage = pageNum}
									>
										{pageNum}
									</button>
								{:else if pageNum === currentPage - 2 || pageNum === currentPage + 2}
									<span class="text-sm font-normal leading-normal flex size-10 items-center justify-center text-white dark:text-white">...</span>
								{/if}
							{/each}
							
							<button 
								class="flex size-10 items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
								on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
								disabled={currentPage === totalPages}
							>
								<span class="material-symbols-outlined" style="font-size: 20px;">chevron_right</span>
							</button>
						</nav>
					</div>
				{/if}
			</div>
		</div>
	</main>
</div>

<style>
	:global(.material-symbols-outlined) {
		font-variation-settings:
			'FILL' 0,
			'wght' 400,
			'GRAD' 0,
			'opsz' 24
	}
</style>
