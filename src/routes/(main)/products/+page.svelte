<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { addItem } from '$lib/stores/cart';
	/** @type {import('./$types').PageData} */
	export let data;

	let products = data.products || [];
	let categories = data.categories || [];
	let searchQuery = data.filters?.search || '';
	let selectedCategories = [];
	
	// Calculate max price from products or use default
	$: maxProductPrice = products.length > 0 
		? Math.max(...products.map(p => parseFloat(p.retail_price) || 0), 500)
		: 500;
	
	let priceRange = { min: 0, max: maxProductPrice };
	let selectedConditions = [];
	
	// Filter products based on search, categories, price, and condition
	$: filteredProducts = products.filter(product => {
		// Search filter
		if (searchQuery && !product.name?.toLowerCase().includes(searchQuery.toLowerCase()) && 
		    !product.desc?.toLowerCase().includes(searchQuery.toLowerCase())) {
			return false;
		}
		
		// Category filter
		if (selectedCategories.length > 0 && !selectedCategories.includes(product.category_id)) {
			return false;
		}
		
		// Price filter
		const price = parseFloat(product.retail_price) || 0;
		if (price < priceRange.min || price > priceRange.max) {
			return false;
		}
		
		// Condition filter (assuming product has a condition field)
		if (selectedConditions.length > 0 && product.condition && !selectedConditions.includes(product.condition)) {
			return false;
		}
		
		return true;
	});

	function handleSearch(e) {
		searchQuery = e.target.value;
		updateFilters();
	}

	function toggleCategory(categoryId) {
		if (selectedCategories.includes(categoryId)) {
			selectedCategories = selectedCategories.filter(id => id !== categoryId);
		} else {
			selectedCategories = [...selectedCategories, categoryId];
		}
	}

	function toggleCondition(condition) {
		if (selectedConditions.includes(condition)) {
			selectedConditions = selectedConditions.filter(c => c !== condition);
		} else {
			selectedConditions = [...selectedConditions, condition];
		}
	}

	function updatePriceRange(e) {
		const value = parseFloat(e.target.value);
		priceRange.max = value;
		updateFilters();
	}

	function updateFilters() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
		if (priceRange.min > 0) params.set('minPrice', priceRange.min.toString());
		if (priceRange.max < 500) params.set('maxPrice', priceRange.max.toString());
		if (selectedConditions.length > 0) params.set('condition', selectedConditions.join(','));
		
		const queryString = params.toString();
		goto(`/products${queryString ? '?' + queryString : ''}`, { replaceState: true, noScroll: true });
	}

	function handleAddToCart(product) {
		addItem(product);
	}

	function goToProduct(product) {
		goto(`/products/${product.id}`);
	}

	onMount(() => {
		// Initialize filters from URL params
		if (data.filters?.category) {
			selectedCategories = data.filters.category.split(',').map(id => parseInt(id));
		}
		if (data.filters?.minPrice) {
			priceRange.min = parseFloat(data.filters.minPrice);
		}
		if (data.filters?.maxPrice) {
			priceRange.max = parseFloat(data.filters.maxPrice);
		}
		if (data.filters?.condition) {
			selectedConditions = data.filters.condition.split(',');
		}
	});
	
	// Update price range max when products load
	$: if (maxProductPrice > 0 && priceRange.max === 500 && products.length > 0) {
		priceRange.max = maxProductPrice;
	}
</script>

<div class="relative flex h-auto min-h-screen w-full flex-col bg-[#101623] dark group/design-root overflow-x-hidden" style="--checkbox-tick-svg: url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e'); font-family: Manrope, &quot;Noto Sans&quot;, sans-serif;">
	<div class="layout-container flex h-full grow flex-col">
		<div class="gap-1 px-6 flex flex-1 justify-center py-5">
			<!-- Sidebar Filters -->
			<div class="layout-content-container flex flex-col w-80">
				<div class="px-4 py-3">
					<label class="flex flex-col min-w-40 h-12 w-full">
						<div class="flex w-full flex-1 items-stretch rounded-lg h-full">
							<div class="text-[#8ea3cc] flex border-none bg-[#212f4a] items-center justify-center pl-4 rounded-l-lg border-r-0">
								<svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
									<path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
								</svg>
							</div>
							<input 
								class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-0 border-none bg-[#212f4a] focus:border-none h-full placeholder:text-[#8ea3cc] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" 
								placeholder="Search items" 
								bind:value={searchQuery}
								on:input={handleSearch}
							/>
						</div>
					</label>
				</div>
				
				<h3 class="text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Categories</h3>
				<div class="px-4">
					{#each categories as category (category.id)}
						<label class="flex gap-x-3 py-3 flex-row cursor-pointer">
							<input 
								class="h-5 w-5 rounded border-[#2f436a] border-2 bg-transparent text-[#1f68f9] checked:bg-[#1f68f9] checked:border-[#1f68f9] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#2f436a] focus:outline-none" 
								type="checkbox"
								checked={selectedCategories.includes(category.id)}
								on:change={() => toggleCategory(category.id)}
							/>
							<p class="text-base font-normal leading-normal">{category.name}</p>
						</label>
					{/each}
				</div>
				
				<h3 class="text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Price Range</h3>
				<div class="px-4">
					<div class="@container">
						<div class="relative flex w-full flex-col items-start justify-between gap-3 p-4 @[480px]:flex-row">
							<p class="text-base font-medium leading-normal w-full shrink-[3]">Price</p>
							<div class="flex h-[38px] w-full pt-1.5 relative">
								<div class="flex h-1 w-full rounded-sm bg-[#2f436a] relative">
									<div 
										class="h-1 rounded-sm bg-[#1f68f9] absolute left-0"
										style="width: {(priceRange.max / maxProductPrice) * 100}%"
									></div>
									<div class="absolute -left-3 -top-1.5 flex flex-col items-center gap-1">
										<div class="size-4 rounded-full bg-[#1f68f9]"></div>
										<p class="text-sm font-normal leading-normal">RM {priceRange.min}</p>
									</div>
									<div 
										class="absolute -left-3 -top-1.5 flex flex-col items-center gap-1"
										style="left: {(priceRange.max / maxProductPrice) * 100}%"
									>
										<div class="size-4 rounded-full bg-[#1f68f9]"></div>
										<p class="text-sm font-normal leading-normal">RM {priceRange.max}</p>
									</div>
								</div>
							</div>
						</div>
						<input 
							type="range" 
							min="0" 
							max={maxProductPrice} 
							step="10"
							bind:value={priceRange.max}
							on:input={updatePriceRange}
							class="w-full h-2 bg-[#2f436a] rounded-lg appearance-none cursor-pointer accent-[#1f68f9]"
						/>
					</div>
				</div>
				
				<h3 class="text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Condition</h3>
				<div class="px-4">
					<label class="flex gap-x-3 py-3 flex-row cursor-pointer">
						<input 
							class="h-5 w-5 rounded border-[#2f436a] border-2 bg-transparent text-[#1f68f9] checked:bg-[#1f68f9] checked:border-[#1f68f9] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#2f436a] focus:outline-none" 
							type="checkbox"
							checked={selectedConditions.includes('new')}
							on:change={() => toggleCondition('new')}
						/>
						<p class="text-base font-normal leading-normal">New</p>
					</label>
					<label class="flex gap-x-3 py-3 flex-row cursor-pointer">
						<input 
							class="h-5 w-5 rounded border-[#2f436a] border-2 bg-transparent text-[#1f68f9] checked:bg-[#1f68f9] checked:border-[#1f68f9] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#2f436a] focus:outline-none" 
							type="checkbox"
							checked={selectedConditions.includes('like_new')}
							on:change={() => toggleCondition('like_new')}
						/>
						<p class="text-base font-normal leading-normal">Like New</p>
					</label>
					<label class="flex gap-x-3 py-3 flex-row cursor-pointer">
						<input 
							class="h-5 w-5 rounded border-[#2f436a] border-2 bg-transparent text-[#1f68f9] checked:bg-[#1f68f9] checked:border-[#1f68f9] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#2f436a] focus:outline-none" 
							type="checkbox"
							checked={selectedConditions.includes('used')}
							on:change={() => toggleCondition('used')}
						/>
						<p class="text-base font-normal leading-normal">Used</p>
					</label>
				</div>
			</div>
			
			<!-- Main Content -->
			<div class="layout-content-container flex flex-col max-w-[960px] flex-1">
				
				<div class="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
					{#each filteredProducts as product (product.id)}
						<button
							on:click={() => goToProduct(product)}
							class="flex flex-col gap-3 pb-3 cursor-pointer hover:opacity-90 transition-opacity text-left"
						>
							<div
								class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
								style='background-image: url("{product.img_url || '/placeholder.png'}");'
							></div>
							<div>
								<p class="text-base font-medium leading-normal">{product.name}</p>
								<p class="text-[#8ea3cc] text-sm font-normal leading-normal">RM {product.retail_price}</p>
							</div>
						</button>
					{/each}
				</div>
				{#if filteredProducts.length === 0}
					<div class="flex justify-center items-center py-12">
						<p class="text-[#8ea3cc] text-lg">No products found matching your filters.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?display=swap&family=Manrope:wght@400;500;700;800&family=Noto+Sans:wght@400;500;700;900');
</style>
