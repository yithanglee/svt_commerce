<script>
	import { addItem } from '$lib/stores/cart';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session';
	import { cartItems } from '$lib/stores/cart';
	import { Icon } from 'flowbite-svelte-icons';
	/** @type {import('./$types').PageData} */
	export let data;
	
	let slides = Array.isArray(data.slides) ? data.slides : [];
	let categories = Array.isArray(data.categories) ? data.categories : [];
	let products = Array.isArray(data.products) ? data.products.slice(0, 8) : [];
	let searchQuery = '';
	
	// Get hero image from first slide or use default
	$: heroImage = slides.length > 0 
		? (slides[0].img_url || slides[0].mobile_img_url || '')
		: '';
	
	$: cartCount = $cartItems.reduce((sum, item) => sum + item.qty, 0);
	$: isLoggedIn = $session?.loggedIn || false;
	$: user = $session?.user || null;
	
	// Get user initials from username
	function getUserInitials(username) {
		if (!username) return '';
		const parts = username.trim().split(/\s+/);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return username.substring(0, 2).toUpperCase();
	}
	
	$: userInitials = user?.username ? getUserInitials(user.username) : '';
	
	function handleAdd(e) {
		addItem(e.detail.product);
	}
	
	function goToShop() {
		goto('/shop');
	}
	
	function goToLogin() {
		goto('/login');
	}
	
	function goToCart() {
		goto('/cart');
	}
	
	function goToProfile() {
		if (isLoggedIn && user?.merchant_id) {
			goto(`/merchants/${user.merchant_id}/profile`);
		} else {
			goto('/login');
		}
	}
	
	function handleSearch(e) {
		searchQuery = e.target.value;
		if (e.key === 'Enter' && searchQuery.trim()) {
			goto(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
		}
	}
</script>

<div class="relative flex h-auto min-h-screen w-full flex-col bg-[#101623] overflow-x-hidden" style='font-family: Manrope, "Noto Sans", sans-serif;'>
	<div class="layout-container flex h-full grow flex-col">
		<!-- Header -->
		<header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#212f4a] px-10 py-3">
			<div class="flex items-center gap-8">
				<div class="flex items-center gap-4 text-white">
					<div class="size-4">
						<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
							<path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
						</svg>
					</div>
					<h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em]">ReCrafted</h2>
				</div>
				<div class="flex items-center gap-9">
					<button class="text-white text-sm font-medium leading-normal hover:text-[#8ea3cc] transition-colors cursor-pointer bg-transparent border-none" on:click={() => goto('/')}>Home</button>
					<button class="text-white text-sm font-medium leading-normal hover:text-[#8ea3cc] transition-colors cursor-pointer bg-transparent border-none" on:click={goToShop}>Shop</button>
					<button class="text-white text-sm font-medium leading-normal hover:text-[#8ea3cc] transition-colors cursor-pointer bg-transparent border-none">Sell</button>
					<button class="text-white text-sm font-medium leading-normal hover:text-[#8ea3cc] transition-colors cursor-pointer bg-transparent border-none">Community</button>
				</div>
			</div>
			<div class="flex flex-1 justify-end gap-8">
				<label class="flex flex-col min-w-40 !h-10 max-w-64">
					<div class="flex w-full flex-1 items-stretch rounded-lg h-full">
						<div class="text-[#8ea3cc] flex border-none bg-[#212f4a] items-center justify-center pl-4 rounded-l-lg border-r-0">
							<svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
								<path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
							</svg>
						</div>
						<input 
							class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#212f4a] focus:border-none h-full placeholder:text-[#8ea3cc] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" 
							placeholder="Search" 
							bind:value={searchQuery}
							on:keydown={handleSearch}
						/>
					</div>
				</label>
				{#if !isLoggedIn}
					<button class="text-white text-sm font-medium leadbg-[#1f68f9] hover:bg-[#1a5ae0]ng-normal flex items-center px-4 py-2 rounded-lg hover:bg-[#212f4a] transition-colors cursor-pointer bg-transparent border-none" on:click={() => goto('/merchants/apply')}>Apply as Merchant</button>
				{/if}
				<div class="flex gap-2">
					<button class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#212f4a] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-[#2a3d5a] transition-colors">
						<div class="text-white">
							<svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
								<path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z"></path>
							</svg>
						</div>
					</button>
					<button 
						class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#212f4a] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-[#2a3d5a] transition-colors relative"
						on:click={goToCart}
					>
						<div class="text-white">
							<svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
								<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z"></path>
							</svg>
						</div>
						{#if cartCount > 0}
							<span class="absolute -top-1 -right-1 bg-[#1f68f9] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
								{cartCount}
							</span>
						{/if}
					</button>
				</div>
				{#if isLoggedIn && user}
					<button 
						class="px-3 bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 flex items-center justify-center text-white font-semibold text-sm bg-[#1f68f9] hover:bg-[#1a5ae0] transition-colors cursor-pointer"
						on:click={goToProfile}
						title={user.username}
					>
						{userInitials}
					</button>
				{:else}
					<button 
						class="px-3 bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-[#212f4a] flex items-center justify-center cursor-pointer hover:bg-[#2a3d5a] transition-colors border-none"
						on:click={goToLogin}
						aria-label="Sign in"
					>
						<Icon name="user-circle-solid" class="size-5 text-[#8ea3cc]" />
					</button>
				{/if}
			</div>
		</header>
		
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
				<div class="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
					{#each categories.slice(0, 6) as category (category.id)}
						<button
							on:click={() => goto('/shop?category=' + category.id)}
							class="flex flex-col gap-3 pb-3"
						>
							<div
								class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
								style='background-image: url("{category.img_url || '/placeholder.png'}");'
							></div>
							<p class="text-white text-base font-medium leading-normal">{category.name}</p>
						</button>
					{/each}
				</div>
				
				<!-- Featured Listings -->
				<h2 class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Featured Listings</h2>
				<div class="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					<div class="flex items-stretch p-4 gap-3">
						{#each products as product (product.id)}
							<button
								on:click={() => goto('/shop')}
								class="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 cursor-pointer hover:opacity-90 transition-opacity"
							>
								<div
									class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex flex-col"
									style='background-image: url("{product.img_url || '/placeholder.png'}");'
								></div>
								<div>
									<p class="text-white text-base font-medium leading-normal">{product.name}</p>
									<p class="text-[#90b7cb] text-sm font-normal leading-normal">{product.desc || 'Excellent condition'}</p>
									<p class="text-white text-sm font-semibold leading-normal mt-1">RM {product.retail_price}</p>
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?display=swap&family=Manrope:wght@400;500;700;800&family=Noto+Sans:wght@400;500;700;900');
</style>
