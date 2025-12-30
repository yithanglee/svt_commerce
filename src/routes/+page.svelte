<script>
	import { addItem } from '$lib/stores/cart';
	import { goto } from '$app/navigation';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { formatNETSPH } from '$lib/utils/format';
	import Header from '$lib/components/Header.svelte';
	/** @type {import('./$types').PageData} */
	export let data;

	// Keep these reactive so navigation (e.g. ?page=2) refreshes the UI
	$: slides = Array.isArray(data.slides) ? data.slides : [];
	$: categories = Array.isArray(data.categories) ? data.categories : [];
	$: products = Array.isArray(data.products) ? data.products : [];

	$: currentPage = data.pagination?.page || 1;
	$: totalPages = data.pagination?.totalPages || 1;
	
	// Get hero image from first slide or use default
	$: heroImage = slides.length > 0 
		? (slides[0].img_url || slides[0].mobile_img_url || '')
		: '';
	
	function handleAdd(e) {
		addItem(e.detail.product);
	}
	
	function goToShop() {
		goto('/shop');
	}

	function goToPage(page) {
		const next = Math.max(1, Math.min(totalPages, page));
		const params = new URLSearchParams(window.location.search);
		params.set('page', String(next));
		const queryString = params.toString();
		goto(`/${queryString ? '?' + queryString : ''}`, { noScroll: true });
	}
	
	const navigationItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Shop', href: '/shop' },
		{ label: 'Sell', href: '/merchants/apply' },
		{ label: 'Community', href: '/merchants' }
	];
</script>

<div class="relative flex h-auto min-h-screen w-full flex-col bg-[#101623] overflow-x-hidden" style='font-family: Manrope, "Noto Sans", sans-serif;'>
	<div class="layout-container flex h-full grow flex-col">
		<!-- Header -->
		<Header 
			showSearch={true}
			showWishlist={true}
			showApplyMerchant={true}
			{navigationItems}
			logoText="Netsphere Barter Marketplace"
			logoHref="/"
		/>
		
		<div class="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
			<div class="layout-content-container flex flex-col max-w-[960px] flex-1">
				<div class="p-4">
					<!-- Hero Section -->
					<div
						class="flex min-h-[480px] flex-col gap-6 sm:gap-8 bg-cover bg-center bg-no-repeat sm:rounded-lg items-center justify-center p-4"
						style='background-image: linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("{heroImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200'}");'
					>
						<div class="flex flex-col gap-2 text-center">
							<h1
								class="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]"
							>
								Find your next treasure
							</h1>
							<h2 class="text-white text-sm sm:text-base font-normal leading-normal">
								Discover unique, pre-loved items and give them a new home. Shop sustainably and find amazing deals on everything from fashion to furniture.
							</h2>
						</div>
						<div class="flex-wrap gap-3 flex justify-center">
							<button
								class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 px-4 sm:px-5 bg-[#0da6f2] text-white text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#0b8cc9] transition-colors"
								on:click={goToShop}
							>
								<span class="truncate">Shop Now</span>
							</button>
							<button
								class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 px-4 sm:px-5 bg-[#223c49] text-white text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#2a4855] transition-colors"
								on:click={goToShop}
							>
								<span class="truncate">Sell Your Item</span>
							</button>
						</div>
					</div>
				</div>
				
				<!-- Shop by Category -->
				<h2 class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Shop by Category</h2>
				<div class="px-4 pb-2">
					<div class="category-scroll flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden pb-3">
						{#each categories as category, idx (`${category?.id ?? 'null'}-${idx}`)}
							<button
								on:click={() => goto(`/shop?category=${category.id}&page=1`)}
								class="shrink-0 px-3 py-2 rounded-full bg-[#223c49] text-white text-sm font-semibold hover:bg-[#2a4855] transition-colors"
							>
								{category.name}
							</button>
						{/each}
					</div>
				</div>
				
				<!-- Featured Listings -->
				<h2 class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Featured Listings</h2>
				<div class="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					<div class="flex items-stretch p-4 gap-3">
						{#each products as product, idx (`${product?.id ?? 'null'}-${idx}`)}
							<button
								on:click={() => goto('/shop')}
								class="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 cursor-pointer hover:opacity-90 transition-opacity"
							>
								<div
									class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex flex-col"
									style='background-image: url("{PHX_HTTP_PROTOCOL + PHX_ENDPOINT + product.img_url || '/placeholder.png'}");'
								></div>
								<div>
									<p class="text-white text-base font-medium leading-normal">{product.name}</p>
									<p class="text-[#90b7cb] text-sm font-normal leading-normal">{product.desc || 'Excellent condition'}</p>
									<p class="text-white text-sm font-semibold leading-normal mt-1">
										{formatNETSPH(product.retail_price, { decimals: 2, position: 'prefix' })}
									</p>
								</div>
							</button>
						{/each}
					</div>
				</div>
				{#if totalPages > 1}
					<div class="flex items-center justify-center gap-2 px-4 pb-10">
						<button
							class="px-3 py-2 rounded-lg bg-[#223c49] text-white disabled:opacity-50"
							on:click={() => goToPage(currentPage - 1)}
							disabled={currentPage <= 1}
						>
							Prev
						</button>

						<div class="flex items-center gap-1">
							{#each Array(totalPages) as _, i (i)}
								<button
									class="px-3 py-2 rounded-lg {currentPage === i + 1
										? 'bg-[#0da6f2] text-white'
										: 'bg-[#223c49] text-white'}"
									on:click={() => goToPage(i + 1)}
								>
									{i + 1}
								</button>
							{/each}
						</div>

						<button
							class="px-3 py-2 rounded-lg bg-[#223c49] text-white disabled:opacity-50"
							on:click={() => goToPage(currentPage + 1)}
							disabled={currentPage >= totalPages}
						>
							Next
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?display=swap&family=Manrope:wght@400;500;700;800&family=Noto+Sans:wght@400;500;700;900');

	/* Visible horizontal scrollbar for categories */
	.category-scroll::-webkit-scrollbar {
		height: 10px;
	}
	.category-scroll::-webkit-scrollbar-track {
		background: #0f172a;
		border-radius: 999px;
	}
	.category-scroll::-webkit-scrollbar-thumb {
		background: #223c49;
		border-radius: 999px;
	}
	.category-scroll::-webkit-scrollbar-thumb:hover {
		background: #2a4855;
	}
</style>
