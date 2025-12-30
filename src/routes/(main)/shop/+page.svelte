<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { formatNETSPH } from '$lib/utils/format';
	/** @type {import('./$types').PageData} */
	export let data;

	// Keep these reactive so navigation (e.g. ?page=2) refreshes the UI
	$: products = data.products || [];
	$: merchantProductCategories = data.categories || [];

	let searchQuery = data.filters?.search || '';
	let selectedMerchantProductCategoryIds = [];

	$: currentPage = data.pagination?.page || 1;
	$: totalPages = data.pagination?.totalPages || 1;

	// Calculate max price from products or use default
	$: maxProductPrice =
		products.length > 0
			? Math.max(...products.map((p) => parseFloat(p.retail_price) || 0), 500)
			: 500;

	// Initialize with default values to prevent undefined
	let priceRange = { min: 0, max: 500 };
	let selectedProductConditions = [];

	// Calculate relevance score for search ranking
	function calculateRelevanceScore(product, query) {
		if (!query) return 0;

		const queryLower = query.toLowerCase();
		const nameLower = (product.name || '').toLowerCase();
		const descLower = (product.desc || '').toLowerCase();
		const brandLower = (product.brand_name || '').toLowerCase();

		let score = 0;

		// Exact match in name gets highest score
		if (nameLower === queryLower) {
			score += 1000;
		}
		// Name starts with query gets high score
		else if (nameLower.startsWith(queryLower)) {
			score += 500;
		}
		// Name contains query gets medium score
		else if (nameLower.includes(queryLower)) {
			score += 200;
		}

		// Check if all words in query match
		const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 0);
		const nameWords = nameLower.split(/\s+/);
		const allWordsMatch = queryWords.every((word) => nameWords.some((nw) => nw.includes(word)));
		if (allWordsMatch && nameLower.includes(queryLower)) {
			score += 300; // Bonus for matching all words
		}

		// Brand name match gets bonus
		if (brandLower.includes(queryLower)) {
			score += 150;
		}

		// Description match gets lower score
		if (descLower.includes(queryLower)) {
			score += 50;
		}

		// Partial word matches (if query has multiple words)
		if (queryWords.length > 1) {
			const matchedWords = queryWords.filter(
				(word) => nameLower.includes(word) || brandLower.includes(word)
			).length;
			score += matchedWords * 100;
		}

		return score;
	}

	// Filter and sort products based on search, merchant product categories, price, and product condition
	$: filteredProducts = (() => {
		// First filter products
		let filtered = products.filter((product) => {
			// Search filter
			if (searchQuery) {
				const queryLower = searchQuery.toLowerCase();
				const nameLower = (product.name || '').toLowerCase();
				const descLower = (product.desc || '').toLowerCase();
				const brandLower = (product.brand_name || '').toLowerCase();

				// Check if product matches search query
				const matchesSearch =
					nameLower.includes(queryLower) ||
					descLower.includes(queryLower) ||
					brandLower.includes(queryLower) ||
					// Check if all words in query are found
					queryLower
						.split(/\s+/)
						.every(
							(word) =>
								nameLower.includes(word) || descLower.includes(word) || brandLower.includes(word)
						);

				if (!matchesSearch) {
					return false;
				}
			}

			// Merchant product category filter (fallback to legacy category_id if present)
			const merchantProductCategoryId = product.merchant_product_category_id ?? product.category_id;
			const merchantProductCategoryIdNum =
				typeof merchantProductCategoryId === 'string'
					? parseInt(merchantProductCategoryId, 10)
					: merchantProductCategoryId;
			if (
				selectedMerchantProductCategoryIds.length > 0 &&
				!selectedMerchantProductCategoryIds.includes(merchantProductCategoryIdNum)
			) {
				return false;
			}

			// Price filter
			const price = parseFloat(product.retail_price) || 0;
			const minPrice = priceRange.min ?? 0;
			const maxPrice = priceRange.max ?? maxProductPrice ?? 500;
			if (price < minPrice || price > maxPrice) {
				return false;
			}

			// Product condition filter (fallback to legacy "condition" if present)
			const productCondition = product.product_condition ?? product.condition;
			if (
				selectedProductConditions.length > 0 &&
				(!productCondition || !selectedProductConditions.includes(productCondition))
			) {
				return false;
			}

			return true;
		});

		// Then sort by relevance if there's a search query
		if (searchQuery) {
			filtered = filtered.sort((a, b) => {
				const scoreA = calculateRelevanceScore(a, searchQuery);
				const scoreB = calculateRelevanceScore(b, searchQuery);
				return scoreB - scoreA; // Higher score first
			});
		}

		return filtered;
	})();

	function handleSearch(e) {
		searchQuery = e.target.value;
		updateFilters();
	}

	function toggleMerchantProductCategory(categoryId) {
		if (selectedMerchantProductCategoryIds.includes(categoryId)) {
			selectedMerchantProductCategoryIds = selectedMerchantProductCategoryIds.filter(
				(id) => id !== categoryId
			);
		} else {
			selectedMerchantProductCategoryIds = [...selectedMerchantProductCategoryIds, categoryId];
		}
		updateFilters();
	}

	function toggleProductCondition(condition) {
		if (selectedProductConditions.includes(condition)) {
			selectedProductConditions = selectedProductConditions.filter((c) => c !== condition);
		} else {
			selectedProductConditions = [...selectedProductConditions, condition];
		}
		updateFilters();
	}

	function updatePriceRange(e) {
		const value = parseFloat(e.target.value);
		if (!isNaN(value) && value >= 0) {
			priceRange.max = value;
			updateFilters();
		}
	}

	function updateFilters() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		if (selectedMerchantProductCategoryIds.length > 0) {
			params.set('merchant_product_category', selectedMerchantProductCategoryIds.join(','));
		}
		if (priceRange.min > 0) params.set('minPrice', priceRange.min.toString());
		if (priceRange.max < maxProductPrice) params.set('maxPrice', priceRange.max.toString());
		if (selectedProductConditions.length > 0) {
			params.set('product_condition', selectedProductConditions.join(','));
		}
		// Reset pagination when filters change
		params.set('page', '1');

		const queryString = params.toString();
		goto(`/shop${queryString ? '?' + queryString : ''}`, { replaceState: true, noScroll: true });
	}

	function goToPage(page) {
		const next = Math.max(1, Math.min(totalPages, page));
		const params = new URLSearchParams(window.location.search);
		params.set('page', String(next));
		const queryString = params.toString();
		goto(`/shop${queryString ? '?' + queryString : ''}`, { noScroll: true });
	}

	function goToCategory(categoryId) {
		const params = new URLSearchParams(window.location.search);
		// Use legacy param name requested
		params.set('category', String(categoryId));
		// Avoid conflicting param names
		params.delete('merchant_product_category');
		// Reset pagination
		params.set('page', '1');
		const queryString = params.toString();
		goto(`/shop${queryString ? '?' + queryString : ''}`, { noScroll: true });
	}

	function goToProduct(product) {
		goto(`/products/${product.id}`);
	}

	onMount(() => {
		// Initialize filters from URL params
		if (data.filters?.merchant_product_category) {
			selectedMerchantProductCategoryIds = data.filters.merchant_product_category
				.split(',')
				.map((id) => parseInt(id, 10))
				.filter((n) => !isNaN(n));
		}
		if (data.filters?.minPrice) {
			const minPrice = parseFloat(data.filters.minPrice);
			if (!isNaN(minPrice) && minPrice >= 0) {
				priceRange.min = minPrice;
			}
		}
		if (data.filters?.maxPrice) {
			const maxPrice = parseFloat(data.filters.maxPrice);
			if (!isNaN(maxPrice) && maxPrice >= 0) {
				priceRange.max = maxPrice;
			}
		}
		if (data.filters?.product_condition) {
			selectedProductConditions = data.filters.product_condition.split(',');
		}
	});

	// Update price range max when products load and ensure it's never undefined
	$: if (maxProductPrice > 0 && products.length > 0) {
		// If max is still at default (500) or undefined, or exceeds actual max, update it
		if (!priceRange.max || priceRange.max === 500 || priceRange.max > maxProductPrice) {
			priceRange.max = maxProductPrice;
		}
		// Ensure min is never undefined
		if (!priceRange.min && priceRange.min !== 0) {
			priceRange.min = 0;
		}
	}
</script>

<div
	class="relative flex h-auto min-h-screen w-full flex-col bg-gray-900 dark group/design-root overflow-x-hidden"
	style="--checkbox-tick-svg: url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(37,99,235)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e'); font-family: Manrope, &quot;Noto Sans&quot;, sans-serif;"
>
	<div class="layout-container flex h-full grow flex-col">
		<div class="gap-1 px-6 flex flex-1 justify-center py-5">
			<!-- Sidebar Filters -->
			<div class="layout-content-container flex flex-col w-80">
				<div class="px-4 py-3">
					<label class="flex flex-col min-w-40 h-12 w-full">
						<div class="flex w-full flex-1 items-stretch rounded-lg h-full">
							<div
								class="text-[#8ea3cc] flex border-none bg-[#212f4a] items-center justify-center pl-4 rounded-l-lg border-r-0"
								data-icon="MagnifyingGlass"
								data-size="24px"
								data-weight="regular"
							>
								<svg
									fill="currentColor"
									height="24px"
									viewBox="0 0 256 256"
									width="24px"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
									/>
								</svg>
							</div>
							<input
								class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#212f4a] focus:border-none h-full placeholder:text-[#8ea3cc] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
								placeholder="Search items"
								value={searchQuery}
								on:input={handleSearch}
							/>
						</div>
					</label>
				</div>

				<h3 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
					Categories
				</h3>
				<!-- Scrollable list to keep sidebar within viewport height -->
				<div class="px-4 max-h-[45vh] overflow-y-auto">
					{#each merchantProductCategories as category, idx (`${category?.id ?? 'null'}-${idx}`)}
						<label class="flex gap-x-3 py-3 flex-row cursor-pointer">
							<input
								class="h-5 w-5 rounded border-[#2f436a] border-2 bg-transparent text-[#1f68f9] checked:bg-[#1f68f9] checked:border-[#1f68f9] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#2f436a] focus:outline-none"
								type="checkbox"
								checked={selectedMerchantProductCategoryIds.includes(category.id)}
								on:change={() => toggleMerchantProductCategory(category.id)}
							/>
							<a
								class="text-white text-base font-normal leading-normal hover:underline text-left"
								href={`/shop?category=${category.id}&page=1`}
								on:click|preventDefault|stopPropagation={() => goToCategory(category.id)}
							>
								{category.name}
							</a>
						</label>
					{/each}
				</div>

				<h3 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
					Price Range
				</h3>
				<div class="px-4">
					<div class="@container">
						<div
							class="relative flex w-full flex-col items-start justify-between gap-3 p-4 @[480px]:flex-row"
						>
							<p class="text-white text-base font-medium leading-normal w-full shrink-[3]">Price</p>
							<div class="flex h-[38px] w-full pt-1.5 relative">
								<input
									type="range"
									min="0"
									max={maxProductPrice || 500}
									step="10"
									bind:value={priceRange.max}
									on:input={updatePriceRange}
									class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
								/>
								<div class="flex h-1 w-full rounded-sm bg-[#2f436a] relative">
									<div class="absolute left-0 -top-1.5 flex flex-col items-center gap-1">
										<div class="size-4 rounded-full bg-[#1f68f9]" />
										<p class="text-white text-sm font-normal leading-normal">
											{formatNETSPH(priceRange.min ?? 0, { decimals: 0 })}
										</p>
									</div>
									<div
										class="h-1 rounded-sm bg-[#1f68f9] absolute left-0 top-0"
										style="width: {maxProductPrice > 0 && priceRange.max
											? (priceRange.max / maxProductPrice) * 100
											: 100}%"
									/>
									<div
										class="absolute -left-3 -top-1.5 flex flex-col items-center gap-1"
										style="left: {maxProductPrice > 0 && priceRange.max
											? (priceRange.max / maxProductPrice) * 100
											: 100}%"
									>
										<div class="size-4 rounded-full bg-[#1f68f9]" />
										<p class="text-white text-sm font-normal leading-normal">
											{formatNETSPH(priceRange.max ?? maxProductPrice ?? 500, { decimals: 0 })}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<h3 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
					Product Condition
				</h3>
				<div class="px-4">
					<label class="flex gap-x-3 py-3 flex-row cursor-pointer">
						<input
							class="h-5 w-5 rounded border-[#2f436a] border-2 bg-transparent text-[#1f68f9] checked:bg-[#1f68f9] checked:border-[#1f68f9] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#2f436a] focus:outline-none"
							type="checkbox"
							checked={selectedProductConditions.includes('new')}
							on:change={() => toggleProductCondition('new')}
						/>
						<p class="text-white text-base font-normal leading-normal">New</p>
					</label>
					<label class="flex gap-x-3 py-3 flex-row cursor-pointer">
						<input
							class="h-5 w-5 rounded border-[#2f436a] border-2 bg-transparent text-[#1f68f9] checked:bg-[#1f68f9] checked:border-[#1f68f9] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#2f436a] focus:outline-none"
							type="checkbox"
							checked={selectedProductConditions.includes('like_new')}
							on:change={() => toggleProductCondition('like_new')}
						/>
						<p class="text-white text-base font-normal leading-normal">Like New</p>
					</label>
					<label class="flex gap-x-3 py-3 flex-row cursor-pointer">
						<input
							class="h-5 w-5 rounded border-[#2f436a] border-2 bg-transparent text-[#1f68f9] checked:bg-[#1f68f9] checked:border-[#1f68f9] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#2f436a] focus:outline-none"
							type="checkbox"
							checked={selectedProductConditions.includes('used')}
							on:change={() => toggleProductCondition('used')}
						/>
						<p class="text-white text-base font-normal leading-normal">Used</p>
					</label>
				</div>
			</div>

			<!-- Main Content -->
			<div class="layout-content-container flex flex-col max-w-[960px] flex-1">
				<div class="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
					{#each filteredProducts as product, idx (`${product?.id ?? 'null'}-${idx}`)}
						<button
							on:click={() => goToProduct(product)}
							class="flex flex-col gap-3 pb-3 cursor-pointer hover:opacity-90 transition-opacity text-left"
						>
							<div
								class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
								style={`background-image: url("${
									product.img_url
										? PHX_HTTP_PROTOCOL + PHX_ENDPOINT + product.img_url
										: '/placeholder.png'
								}");`}
							/>
							<div>
								<p class="text-white text-base font-medium leading-normal">{product.name}</p>
								<p class="text-[#8ea3cc] text-sm font-normal leading-normal">
									{formatNETSPH(product.retail_price, { decimals: 2 })}
								</p>
							</div>
						</button>
					{/each}
				</div>
				{#if totalPages > 1}
					<div class="flex items-center justify-center gap-2 px-4 pb-6">
						<button
							class="px-3 py-2 rounded-lg bg-[#212f4a] text-white disabled:opacity-50"
							on:click={() => goToPage(currentPage - 1)}
							disabled={currentPage <= 1}
						>
							Prev
						</button>

						<div class="flex items-center gap-1">
							{#each Array(totalPages) as _, i (i)}
								<button
									class="px-3 py-2 rounded-lg {currentPage === i + 1
										? 'bg-[#1f68f9] text-white'
										: 'bg-[#212f4a] text-white'}"
									on:click={() => goToPage(i + 1)}
								>
									{i + 1}
								</button>
							{/each}
						</div>

						<button
							class="px-3 py-2 rounded-lg bg-[#212f4a] text-white disabled:opacity-50"
							on:click={() => goToPage(currentPage + 1)}
							disabled={currentPage >= totalPages}
						>
							Next
						</button>
					</div>
				{/if}
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
