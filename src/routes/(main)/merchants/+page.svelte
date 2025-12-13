<script>
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { buildQueryString, postData } from '$lib/index.js';
	import { Modal, Button } from 'flowbite-svelte';
	import { isTableReloaded } from '$lib/stores/reloadTable';

	/** @type {import('./$types').PageData} */
	export let data;

	let inputs = data.inputs || [];
	var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

	// Search input (single search field)
	let searchQuery = '';

	// Data state
	let items = [];
	let pages = [];
	let isLoading = false;
	let confirmModal = false;
	let selectedMerchant = null;
	let modalMessage = '';
	let modalFn = null;
	let previewModal = false;
	let previewImageUrl = '';

	const itemsPerPage = 16; // 4x4 grid

	let apiData = {
		search: { regex: 'false', value: '' },
		additional_search_queries: null,
		draw: '1',
		length: itemsPerPage,
		model: 'Merchant',
		columns: { 0: { data: 'id', name: 'id' } },
		order: { 0: { column: 0, dir: 'desc' } },
		preloads: JSON.stringify(['user', 'merchant_category']),
		start: null
	};

	function buildSearchString() {
		if (searchQuery.trim()) {
			// Search across name, email, and phone
			return `a.name=${searchQuery.trim()}|a.company_email=${searchQuery.trim()}|a.company_phone=${searchQuery.trim()}`;
		}
		return null;
	}

	async function fetchData(pageNumber) {
		isLoading = true;
		const currentPage = parseInt($page.url.searchParams.get('page')) || pageNumber || 1;
		
		apiData.additional_search_queries = buildSearchString();
		apiData.start = (currentPage - 1) * itemsPerPage;
		
		const queryString = buildQueryString(apiData);
		
		try {
			const response = await fetch(url + '/api/Merchant' + `?${queryString}`, {
				headers: {
					'content-type': 'application/json'
				}
			});
			
			if (response.ok) {
				let dataList = await response.json();
				items = dataList.data || [];
				
				totalPagesCount = Math.ceil(dataList.recordsFiltered / itemsPerPage);
				currentPageNum = currentPage;
			} else {
				console.error('API request failed');
			}
		} catch (error) {
			console.error('An error occurred', error);
		} finally {
			isLoading = false;
		}
	}

	function handleSearch() {
		fetchData(1);
		goto('?page=1', { replaceState: true });
	}

	function checkPage() {
		setTimeout(() => {
			const pageNum = $page.url.searchParams.get('page') || 1;
			fetchData(pageNum);
		}, 200);
	}

	const previous = () => {
		const currentPage = parseInt($page.url.searchParams.get('page')) || 1;
		if (currentPage > 1) {
			goto(`?page=${currentPage - 1}`, { replaceState: true });
			fetchData(currentPage - 1);
		}
	};

	const next = () => {
		const currentPage = parseInt($page.url.searchParams.get('page')) || 1;
		if (currentPage < totalPagesCount) {
			goto(`?page=${currentPage + 1}`, { replaceState: true });
			fetchData(currentPage + 1);
		}
	};

	function goToPage(pageNum) {
		goto(`?page=${pageNum}`, { replaceState: true });
		fetchData(pageNum);
	}

	function showCondition(data) {
		return data.is_approved == false;
	}

	function showCondition2(data) {
		return data.is_approved == true;
	}

	function disableMerchant(merchant) {
		selectedMerchant = merchant;
		modalMessage = 'Are you sure to disable this merchant?';
		modalFn = () => {
			postData(
				{ scope: 'disable_merchant', id: merchant.id },
				{
					endpoint: url + '/svt_api/webhook',
					successCallback: () => {
						checkPage();
						confirmModal = false;
					}
				}
			);
		};
		confirmModal = true;
	}

	function approveMerchant(merchant) {
		selectedMerchant = merchant;
		modalMessage = 'Are you sure to approve this merchant?';
		modalFn = () => {
			postData(
				{ scope: 'approve_merchant', id: merchant.id },
				{
					endpoint: url + '/svt_api/webhook',
					successCallback: () => {
						checkPage();
						confirmModal = false;
					}
				}
			);
		};
		confirmModal = true;
	}

	function viewMerchant(merchant) {
		goto('/merchants/' + merchant.id + '/products');
	}

	function showPreview(imageUrl) {
		previewImageUrl = imageUrl;
		previewModal = true;
	}

	function getBadgeColor(isApproved) {
		return isApproved ? 'green' : 'pink';
	}

	function getUsername(merchant) {
		return merchant.user?.username || 'N/A';
	}

	function getCategoryName(merchant) {
		return merchant.merchant_category?.name || 'N/A';
	}

	function getBannerImage(merchant) {
		// Use background_image if available, otherwise fall back to img_url
		if (merchant.background_image) {
			return url + merchant.background_image;
		}
		if (merchant.img_url) {
			return url + merchant.img_url;
		}
		return null;
	}

	function getDescription(merchant) {
		return merchant.description || merchant.remarks || 'Discover unique products from this trusted seller.';
	}

	let currentPageNum = 1;
	let totalPagesCount = 1;

	// Subscribe to table reload
	let unsub2 = isTableReloaded.subscribe((v) => {
		if (v.open) {
			fetchData(1);
		}
	});

	onMount(() => {
		const pageNum = parseInt($page.url.searchParams.get('page')) || 1;
		fetchData(pageNum);
	});

	onDestroy(unsub2);
</script>

<div class="min-h-screen bg-[#101922]">
	<main class="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-10">
		<div class="flex flex-col w-full max-w-6xl flex-1">
			<!-- PageHeading -->
			<div class="flex flex-wrap justify-between gap-3 p-4">
				<div class="flex min-w-72 flex-col gap-3">
					<h1 class="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">Merchants</h1>
					<p class="text-gray-400 text-base font-normal leading-normal">Discover our community of trusted sellers.</p>
				</div>
			</div>

			<!-- ToolBar -->
			<div class="flex flex-col md:flex-row justify-between gap-4 p-4">
				<div class="flex flex-1">
					<label class="flex flex-col w-full max-w-sm">
						<div class="relative flex w-full flex-1 items-stretch rounded-lg h-10">
							<div class="text-gray-400 flex items-center justify-center pl-3 absolute inset-y-0 left-0">
								<span class="material-symbols-outlined" style="font-size: 20px;">search</span>
							</div>
							<input
								class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#0d7ff2] border-white/10 bg-white/5 h-full placeholder:text-gray-400 pl-10 text-base font-normal leading-normal"
								placeholder="Search by store name..."
								bind:value={searchQuery}
								on:keydown={(e) => e.key === 'Enter' && handleSearch()}
							/>
						</div>
					</label>
				</div>
				<div class="flex gap-2">
					<button
						class="flex min-w-0 max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white/5 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] px-4 hover:bg-white/10"
						on:click={handleSearch}
					>
						<span class="material-symbols-outlined text-gray-400" style="font-size: 20px;">filter_list</span>
						<span class="truncate">Filter</span>
					</button>
					<button class="flex min-w-0 max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white/5 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] px-4 hover:bg-white/10">
						<span class="material-symbols-outlined" style="font-size: 20px;">swap_vert</span>
						<span class="truncate">Sort by: Newest</span>
					</button>
				</div>
			</div>

			<!-- Loading State -->
			{#if isLoading}
				<div class="text-center py-12">
					<p class="text-gray-400">Loading merchants...</p>
				</div>
			{:else if items.length === 0}
				<div class="text-center py-12">
					<p class="text-gray-400">No merchants found.</p>
				</div>
			{:else}
				<!-- ImageGrid -->
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
					{#each items as merchant}
						<div class="flex flex-col gap-3 pb-3 bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-[#0d7ff2] transition-colors duration-300">
							<!-- Banner Image -->
							<div class="w-full bg-center bg-no-repeat aspect-video bg-cover" data-alt="Banner image for {merchant.name} store">
								{#if getBannerImage(merchant)}
									<img src={getBannerImage(merchant)} alt="{merchant.name} banner" class="w-full h-full object-contain" />
								{:else}
									<div class="w-full h-full bg-gradient-to-br from-[#0d7ff2] to-[#8b5cf6] flex items-center justify-center">
										<span class="text-white text-2xl font-bold">{merchant.name?.charAt(0) || 'M'}</span>
									</div>
								{/if}
							</div>
							
							<div class="p-4 flex flex-col gap-3 flex-grow">
								<p class="text-white text-base font-bold leading-normal">{merchant.name || 'N/A'}</p>
								<p class="text-gray-400 text-sm font-normal leading-normal flex-grow">{getDescription(merchant)}</p>
								<button
									class="mt-2 w-full flex min-w-0 max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 px-4 bg-[#0d7ff2] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#0d7ff2]/90"
									on:click={() => viewMerchant(merchant)}
								>
									<span class="truncate">Visit Store</span>
								</button>
								
								<!-- Admin Actions (hidden by default, can be shown conditionally) -->
								{#if merchant.is_approved === false || merchant.is_approved === true}
									<div class="flex gap-2 mt-2">
										{#if showCondition(merchant)}
											<button
												class="flex-1 text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
												on:click={() => approveMerchant(merchant)}
											>
												Approve
											</button>
										{/if}
										
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<!-- Pagination -->
				{#if totalPagesCount > 1}
					<div class="flex items-center justify-center p-4">
						<nav class="flex items-center gap-2">
							<button
								class="flex size-10 items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors {currentPageNum === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
								on:click={previous}
								disabled={currentPageNum === 1}
							>
								<span class="material-symbols-outlined" style="font-size: 20px;">chevron_left</span>
							</button>
							
							{#if totalPagesCount <= 7}
								{#each Array(totalPagesCount) as _, i}
									{@const pageNum = i + 1}
									<button
										class="text-sm {currentPageNum === pageNum ? 'font-bold' : 'font-normal'} leading-normal flex size-10 items-center justify-center text-white rounded-lg {currentPageNum === pageNum ? 'bg-[#0d7ff2]' : 'hover:bg-white/5'} transition-colors"
										on:click={() => goToPage(pageNum)}
									>
										{pageNum}
									</button>
								{/each}
							{:else}
								<!-- First page -->
								<button
									class="text-sm {currentPageNum === 1 ? 'font-bold' : 'font-normal'} leading-normal flex size-10 items-center justify-center text-white rounded-lg {currentPageNum === 1 ? 'bg-[#0d7ff2]' : 'hover:bg-white/5'} transition-colors"
									on:click={() => goToPage(1)}
								>
									1
								</button>
								
								{#if currentPageNum > 3}
									<span class="text-sm font-normal leading-normal flex size-10 items-center justify-center text-white">...</span>
								{/if}
								
								<!-- Pages around current -->
								{#each Array(5) as _, i}
									{@const pageNum = currentPageNum - 2 + i}
									{#if pageNum > 1 && pageNum < totalPagesCount}
										<button
											class="text-sm {currentPageNum === pageNum ? 'font-bold' : 'font-normal'} leading-normal flex size-10 items-center justify-center text-white rounded-lg {currentPageNum === pageNum ? 'bg-[#0d7ff2]' : 'hover:bg-white/5'} transition-colors"
											on:click={() => goToPage(pageNum)}
										>
											{pageNum}
										</button>
									{/if}
								{/each}
								
								{#if currentPageNum < totalPagesCount - 2}
									<span class="text-sm font-normal leading-normal flex size-10 items-center justify-center text-white">...</span>
								{/if}
								
								<!-- Last page -->
								<button
									class="text-sm {currentPageNum === totalPagesCount ? 'font-bold' : 'font-normal'} leading-normal flex size-10 items-center justify-center text-white rounded-lg {currentPageNum === totalPagesCount ? 'bg-[#0d7ff2]' : 'hover:bg-white/5'} transition-colors"
									on:click={() => goToPage(totalPagesCount)}
								>
									{totalPagesCount}
								</button>
							{/if}
							
							<button
								class="flex size-10 items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors {currentPageNum === totalPagesCount ? 'opacity-50 cursor-not-allowed' : ''}"
								on:click={next}
								disabled={currentPageNum === totalPagesCount}
							>
								<span class="material-symbols-outlined" style="font-size: 20px;">chevron_right</span>
							</button>
						</nav>
					</div>
				{/if}
			{/if}
		</div>
	</main>
</div>

<!-- Confirmation Modal -->
<Modal title="Confirm?" bind:open={confirmModal} autoclose outsideclose>
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
		{modalMessage || 'Are you sure?'}
	</p>
	<svelte:fragment slot="footer">
		<Button
			color="red"
			on:click={() => {
				if (modalFn) {
					modalFn();
					modalFn = null;
					modalMessage = '';
				} else {
					confirmModal = false;
				}
			}}
		>
			Confirm
		</Button>
		<Button color="gray" on:click={() => { confirmModal = false; }}>
			Cancel
		</Button>
	</svelte:fragment>
</Modal>

<!-- Preview Modal -->
<Modal title="SSM Document Preview" bind:open={previewModal} autoclose outsideclose>
	{#if previewImageUrl}
		<img src="{url}{previewImageUrl}" alt="SSM Document" class="w-full" />
	{/if}
	<svelte:fragment slot="footer">
		<Button color="gray" on:click={() => { previewModal = false; }}>
			Close
		</Button>
	</svelte:fragment>
</Modal>
