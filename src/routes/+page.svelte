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
	$: heroImage = slides.length > 0 ? slides[0].img_url || slides[0].mobile_img_url || '' : '';

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
		{ label: 'Posting Manual', href: '/seller-posting-manual-policy' },
		{ label: 'Community', href: '/merchants' }
	];
</script>

<div
	class="relative flex h-auto min-h-screen w-full flex-col bg-[#101623] overflow-x-hidden"
	style="font-family: Manrope, Noto Sans, sans-serif;"
>
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
				<!-- Start Trading -->
				<div
					class="mt-8 mx-4 p-6 bg-[#1a2c38] rounded-xl border border-[#223c49] shadow-lg flex flex-col md:flex-row items-center gap-6"
				>
					<div class="bg-[#223c49] p-4 rounded-full shrink-0">
						<span class="material-symbols-outlined text-[#0da6f2] text-4xl">account_circle</span>
					</div>
					<div class="flex flex-col text-center md:text-left flex-1">
						<h2 class="text-[#0da6f2] text-2xl font-bold mb-1 uppercase tracking-wide">
							Start Trading
						</h2>
						<p class="text-white text-lg font-medium mb-1">Get Started Easily and Instantly</p>
						<p class="text-[#90b7cb] text-sm">
							Use your existing Netsphere account (Username &amp; Password) to log in and begin your
							journey.
						</p>
					</div>
				</div>

				<!-- Membership Tiers -->
				<h2
					class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-8 text-center uppercase"
				>
					Membership Tiers
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 pb-8">
					<div class="hexagon-border-wrapper filter drop-shadow-[0_0_10px_rgba(205,127,50,0.3)]">
						<div class="hexagon-clip bg-[#2a1b15] h-full p-[1px]">
							<div
								class="hexagon-clip bg-gradient-to-b from-[#2a1b15] to-[#101623] h-full p-6 flex flex-col items-center text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
							>
								<div
									class="absolute inset-0 bg-gradient-to-b from-[#cd7f32] to-transparent opacity-30 pointer-events-none"
								/>
								<div class="absolute inset-[1px] bg-[#101623] hexagon-clip -z-10" />
								<div
									class="absolute inset-[1px] bg-gradient-to-b from-[#2a1b15] to-[#101623] hexagon-clip -z-10"
								/>
								<div
									class="absolute inset-0 bg-[#cd7f32]/10 blur-xl scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full"
								/>
								<div
									class="px-3 py-1 size-16 rounded-full bg-[#cd7f32] flex items-center justify-center mb-4 z-10 shadow-[0_0_15px_rgba(205,127,50,0.5)] mt-4"
								>
									<span class="text-white font-bold text-2xl">3</span>
								</div>
								<h3 class="text-[#cd7f32] text-xl font-bold uppercase mb-1 z-10">Bronze Member</h3>
								<p class="text-white font-medium mb-4 z-10">Entry Member</p>
								<div class="mt-auto z-10 mb-4">
									<p class="text-[#90b7cb] text-sm">Post up to</p>
									<p class="text-white text-3xl font-black">3 items</p>
								</div>
							</div>
						</div>
					</div>

					<div class="hexagon-border-wrapper filter drop-shadow-[0_0_10px_rgba(192,192,192,0.3)]">
						<div class="hexagon-clip bg-[#1c2329] h-full p-[1px]">
							<div
								class="hexagon-clip bg-gradient-to-b from-[#1c2329] to-[#101623] h-full p-6 flex flex-col items-center text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
							>
								<div
									class="absolute inset-0 bg-gradient-to-b from-[#c0c0c0] to-transparent opacity-30 pointer-events-none"
								/>
								<div class="absolute inset-[1px] bg-[#101623] hexagon-clip -z-10" />
								<div
									class="absolute inset-[1px] bg-gradient-to-b from-[#1c2329] to-[#101623] hexagon-clip -z-10"
								/>
								<div
									class="absolute inset-0 bg-[#c0c0c0]/10 blur-xl scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full"
								/>
								<div
									class="px-3 py-1 size-16 rounded-full bg-[#c0c0c0] flex items-center justify-center mb-4 z-10 shadow-[0_0_15px_rgba(192,192,192,0.5)] mt-4"
								>
									<span class="text-[#101623] font-bold text-2xl">6</span>
								</div>
								<h3 class="text-[#c0c0c0] text-xl font-bold uppercase mb-1 z-10">Silver Member</h3>
								<p class="text-white font-medium mb-4 z-10">Standard Member</p>
								<div class="mt-auto z-10 mb-4">
									<p class="text-[#90b7cb] text-sm">Post up to</p>
									<p class="text-white text-3xl font-black">6 items</p>
								</div>
							</div>
						</div>
					</div>

					<div class="hexagon-border-wrapper filter drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">
						<div class="hexagon-clip bg-[#2b2510] h-full p-[1px]">
							<div
								class="hexagon-clip bg-gradient-to-b from-[#2b2510] to-[#101623] h-full p-6 flex flex-col items-center text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
							>
								<div
									class="absolute inset-0 bg-gradient-to-b from-[#ffd700] to-transparent opacity-30 pointer-events-none"
								/>
								<div class="absolute inset-[1px] bg-[#101623] hexagon-clip -z-10" />
								<div
									class="absolute inset-[1px] bg-gradient-to-b from-[#2b2510] to-[#101623] hexagon-clip -z-10"
								/>
								<div
									class="absolute inset-0 bg-[#ffd700]/10 blur-xl scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full"
								/>
								<div
									class=" px-3 py-2 size-12 rounded-full bg-[#ffd700] flex items-center justify-center mb-4 z-10 shadow-[0_0_15px_rgba(255,215,0,0.6)] mt-4"
								>
									<span class="text-[#101623] font-bold text-2xl">30</span>
								</div>
								<h3 class="text-[#ffd700] text-xl font-bold uppercase mb-1 z-10">Gold Member</h3>
								<p class="text-white font-medium mb-4 z-10">Premium Member</p>
								<div class="mt-auto z-10 mb-4">
									<p class="text-[#90b7cb] text-sm">Post up to</p>
									<p class="text-white text-3xl font-black">30 items</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Posting Guide -->
				<div class=" rounded-xl p-6">
					<div class="flex items-center gap-3 mb-6">
						<span class="material-symbols-outlined text-[#0da6f2] text-3xl">assignment</span>
						<h2 class="text-white text-xl font-bold uppercase">Posting Guide</h2>
					</div>
					<div class="grid gap-0">
						<div class="flex items-start gap-4 p-1 rounded-lg hover:bg-[#1a2c38] transition-colors">
							<div class="p-2 bg-[#223c49] rounded-lg text-[#0da6f2]">
								<span class="material-symbols-outlined">photo_camera</span>
							</div>
							<div>
								<h4 class="text-white font-bold text-base">Appealing Photos</h4>
								<p class="text-[#90b7cb] text-sm">3 - 5 photos per item to showcase quality.</p>
							</div>
						</div>
						<div class="flex items-start gap-4 p-1 rounded-lg hover:bg-[#1a2c38] transition-colors">
							<div class="p-2 bg-[#223c49] rounded-lg text-[#0da6f2]">
								<span class="material-symbols-outlined">description</span>
							</div>
							<div>
								<h4 class="text-white font-bold text-base">Clear Details</h4>
								<p class="text-[#90b7cb] text-sm">Specify specs and features accurately.</p>
							</div>
						</div>
						<div class="flex items-start gap-4 p-1 rounded-lg hover:bg-[#1a2c38] transition-colors">
							<div class="p-2 bg-[#223c49] rounded-lg text-[#0da6f2]">
								<span class="material-symbols-outlined">token</span>
							</div>
							<div>
								<h4 class="text-white font-bold text-base">Token Price</h4>
								<p class="text-[#90b7cb] text-sm">List in Netsphere Token only.</p>
							</div>
						</div>
						<div class="flex items-start gap-4 p-1 rounded-lg hover:bg-[#1a2c38] transition-colors">
							<div class="p-2 bg-[#223c49] rounded-lg text-[#0da6f2]">
								<span class="material-symbols-outlined">smartphone</span>
							</div>
							<div>
								<h4 class="text-white font-bold text-base">
									Direct Contact Info (Very Important!)
								</h4>
								<p class="text-[#90b7cb] text-sm">Name, Phone, Line, Messenger, etc.</p>
							</div>
						</div>
					</div>
				</div>

				<!-- P2P Direct Trade -->
				<div
					class="mx-4 mb-8 bg-gradient-to-r from-[#1a2c38] to-[#101623] rounded-xl p-8 border border-[#0da6f2]/30 relative overflow-hidden"
				>
					<div class="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
						<span class="material-symbols-outlined text-white text-9xl">handshake</span>
					</div>
					<div class="relative z-10">
						<div class="flex items-center gap-3 mb-6">
							<span class="material-symbols-outlined text-[#ffd700] text-3xl">bolt</span>
							<h2 class="text-[#ffd700] text-xl font-bold uppercase">
								P2P Direct Trade: Freedom of Exchange
							</h2>
						</div>
						<div class="space-y-4 ml-2 border-l-2 border-[#223c49] pl-6">
							<div>
								<h4 class="text-white font-bold text-lg mb-1">Contact Directly</h4>
								<p class="text-[#90b7cb]">Members can chat with sellers directly.</p>
							</div>
							<div>
								<h4 class="text-white font-bold text-lg mb-1">Transfer &amp; Ship Yourself</h4>
								<p class="text-[#90b7cb]">100% agreement between members.</p>
							</div>
							<div>
								<h4 class="text-white font-bold text-lg mb-1">Mediator Space</h4>
								<p class="text-[#90b7cb]">Platform is for promotion only.</p>
							</div>
						</div>
						<div class="mt-8 pt-4 border-t border-[#223c49] text-center">
							<p class="text-[#90b7cb] text-xs italic">
								*Please verify the credibility of your trading partner and plan before every
								transaction.
							</p>
						</div>
					</div>
				</div>

				<!-- Shop by Category -->
				<h2
					class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5"
				>
					Shop by Category
				</h2>
				<div class="px-4 pb-2">
					<div
						class="category-scroll flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden pb-3"
					>
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
				<h2
					class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5"
				>
					Featured Listings
				</h2>
				<div
					class="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				>
					<div class="flex items-stretch p-4 gap-3">
						{#each products as product, idx (`${product?.id ?? 'null'}-${idx}`)}
							<button
								on:click={() => goto('/shop')}
								class="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 cursor-pointer hover:opacity-90 transition-opacity"
							>
								<div
									class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex flex-col"
									style={`background-image: url('${
										product?.img_url
											? PHX_HTTP_PROTOCOL + PHX_ENDPOINT + product.img_url
											: '/placeholder.png'
									}');`}
								/>
								<div>
									<p class="text-white text-base font-medium leading-normal">{product.name}</p>
									<p class="text-[#90b7cb] text-sm font-normal leading-normal">
										{product.desc || 'Excellent condition'}
									</p>
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

	.hexagon-clip {
		clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
	}
	.hexagon-border-wrapper {
		filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
	}

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
