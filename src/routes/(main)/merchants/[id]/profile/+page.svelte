<script>
	import { goto } from '$app/navigation';
	/** @type {import('./$types').PageData} */
	export let data;
	const merchant = data.merchant || {};
	const products = data.products || [];
	const stats = data.stats || { activeListings: 0, pendingOrders: 0, totalSales: 0, earnings: '0.00' };
	
	function formatDate(dateString) {
		if (!dateString) return '-';
		try {
			const date = new Date(dateString);
			return date.toISOString().split('T')[0];
		} catch {
			return dateString;
		}
	}
	
	function formatPrice(price) {
		if (!price) return '$0';
		return `$${parseFloat(price).toFixed(2)}`;
	}
	
	function getStatus(product) {
		// Assuming products have a status field, or use is_active
		if (product.status) return product.status;
		return product.is_active !== false ? 'Active' : 'Sold';
	}
</script>

<div class="relative flex h-auto min-h-screen w-full flex-col bg-[#101a23] dark group/design-root overflow-x-hidden" style='font-family: Manrope, "Noto Sans", sans-serif;'>
	<div class="layout-container flex h-full grow flex-col">
		<div class="gap-1 px-6 flex flex-1 justify-center py-5">
			<!-- Sidebar -->
			<div class="layout-content-container flex flex-col w-80">
				<div class="flex h-full min-h-[700px] flex-col justify-between bg-[#101a23] p-4">
					<div class="flex flex-col gap-4">
						<div class="flex gap-3">
							{#if merchant.logo}
								<div
									class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
									style="background-image: url('{merchant.logo}');"
								></div>
							{:else}
								<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gray-600"></div>
							{/if}
							<h1 class="text-white text-base font-medium leading-normal">{merchant.name || 'Merchant'}</h1>
						</div>
						<div class="flex flex-col gap-2">
							<a href="/merchants/{data.merchant_id}/profile" class="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#223649]">
								<div class="text-white" data-icon="House" data-size="24px" data-weight="fill">
									<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
										<path
											d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"
										></path>
									</svg>
								</div>
								<p class="text-white text-sm font-medium leading-normal">Dashboard</p>
							</a>
							<a href="/merchants/{data.merchant_id}/products" class="flex items-center gap-3 px-3 py-2">
								<div class="text-white" data-icon="ListBullets" data-size="24px" data-weight="regular">
									<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
										<path
											d="M80,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H88A8,8,0,0,1,80,64Zm136,56H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm0,64H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM44,52A12,12,0,1,0,56,64,12,12,0,0,0,44,52Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,116Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,180Z"
										></path>
									</svg>
								</div>
								<p class="text-white text-sm font-medium leading-normal">Listings</p>
							</a>
							<a href="/customer_orders" class="flex items-center gap-3 px-3 py-2">
								<div class="text-white" data-icon="ShoppingCart" data-size="24px" data-weight="regular">
									<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
										<path
											d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z"
										></path>
									</svg>
								</div>
								<p class="text-white text-sm font-medium leading-normal">Orders</p>
							</a>
							<div class="flex items-center gap-3 px-3 py-2">
								<div class="text-white" data-icon="ChartBar" data-size="24px" data-weight="regular">
									<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
										<path
											d="M224,200h-8V40a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8V80H96a8,8,0,0,0-8,8v40H48a8,8,0,0,0-8,8v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16ZM160,48h40V200H160ZM104,96h40V200H104ZM56,144H88v56H56Z"
										></path>
									</svg>
								</div>
								<p class="text-white text-sm font-medium leading-normal">Analytics</p>
							</div>
							<div class="flex items-center gap-3 px-3 py-2">
								<div class="text-white" data-icon="Gear" data-size="24px" data-weight="regular">
									<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
										<path
											d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"
										></path>
									</svg>
								</div>
								<p class="text-white text-sm font-medium leading-normal">Settings</p>
							</div>
						</div>
					</div>
					<div class="flex flex-col gap-1">
						<div class="flex items-center gap-3 px-3 py-2">
							<div class="text-white" data-icon="Question" data-size="24px" data-weight="regular">
								<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
									<path
										d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
									></path>
								</svg>
							</div>
							<p class="text-white text-sm font-medium leading-normal">Help and Support</p>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Main Content -->
			<div class="layout-content-container flex flex-col max-w-[960px] flex-1">
				<div class="flex flex-wrap justify-between gap-3 p-4">
					<div class="flex min-w-72 flex-col gap-3">
						<p class="text-white tracking-light text-[32px] font-bold leading-tight">Seller Dashboard</p>
						<p class="text-[#90adcb] text-sm font-normal leading-normal">Manage your listings, orders, and track your sales performance.</p>
					</div>
				</div>
				
				<!-- Overview Cards -->
				<h2 class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Overview</h2>
				<div class="flex flex-wrap gap-4 p-4">
					<div class="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#223649]">
						<p class="text-white text-base font-medium leading-normal">Active Listings</p>
						<p class="text-white tracking-light text-2xl font-bold leading-tight">{stats.activeListings}</p>
					</div>
					<div class="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#223649]">
						<p class="text-white text-base font-medium leading-normal">Pending Orders</p>
						<p class="text-white tracking-light text-2xl font-bold leading-tight">{stats.pendingOrders}</p>
					</div>
					<div class="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#223649]">
						<p class="text-white text-base font-medium leading-normal">Total Sales</p>
						<p class="text-white tracking-light text-2xl font-bold leading-tight">{stats.totalSales}</p>
					</div>
					<div class="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#223649]">
						<p class="text-white text-base font-medium leading-normal">Earnings</p>
						<p class="text-white tracking-light text-2xl font-bold leading-tight">${stats.earnings}</p>
					</div>
				</div>
				
				<!-- Recent Activity -->
				<h2 class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Recent Activity</h2>
				<div class="px-4 py-3 @container">
					<div class="flex overflow-hidden rounded-lg border border-[#314d68] bg-[#101a23]">
						<table class="flex-1">
							<thead>
								<tr class="bg-[#182634]">
									<th class="table-column-120 px-4 py-3 text-left text-white w-[400px] text-sm font-medium leading-normal">Item</th>
									<th class="table-column-240 px-4 py-3 text-left text-white w-60 text-sm font-medium leading-normal">Status</th>
									<th class="table-column-360 px-4 py-3 text-left text-white w-[400px] text-sm font-medium leading-normal">Price</th>
									<th class="table-column-480 px-4 py-3 text-left text-white w-[400px] text-sm font-medium leading-normal">Date Listed</th>
									<th class="table-column-600 px-4 py-3 text-left text-white w-60 text-[#90adcb] text-sm font-medium leading-normal">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{#each products.slice(0, 5) as product}
									<tr class="border-t border-t-[#314d68]">
										<td class="table-column-120 h-[72px] px-4 py-2 w-[400px] text-white text-sm font-normal leading-normal">
											{product.name || '-'}
										</td>
										<td class="table-column-240 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
											<button
												class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#223649] text-white text-sm font-medium leading-normal w-full"
											>
												<span class="truncate">{getStatus(product)}</span>
											</button>
										</td>
										<td class="table-column-360 h-[72px] px-4 py-2 w-[400px] text-[#90adcb] text-sm font-normal leading-normal">
											{formatPrice(product.retail_price)}
										</td>
										<td class="table-column-480 h-[72px] px-4 py-2 w-[400px] text-[#90adcb] text-sm font-normal leading-normal">
											{formatDate(product.created_at || product.date_listed)}
										</td>
										<td class="table-column-600 h-[72px] px-4 py-2 w-60 text-[#90adcb] text-sm font-bold leading-normal tracking-[0.015em] cursor-pointer"
											on:click={() => goto(`/products/${product.id}`)}
										>
											View
										</td>
									</tr>
								{:else}
									<tr>
										<td colspan="5" class="px-4 py-8 text-center text-[#90adcb] text-sm">No listings found</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<style>
						@container(max-width:120px){.table-column-120{display: none;}}
						@container(max-width:240px){.table-column-240{display: none;}}
						@container(max-width:360px){.table-column-360{display: none;}}
						@container(max-width:480px){.table-column-480{display: none;}}
						@container(max-width:600px){.table-column-600{display: none;}}
					</style>
				</div>
				
				<!-- Add New Listing Button -->
				<div class="flex px-4 py-3 justify-end">
					<button
						class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0d80f2] text-white text-sm font-bold leading-normal tracking-[0.015em]"
						on:click={() => goto(`/products/new?merchant_id=${data.merchant_id}`)}
					>
						<span class="truncate">Add New Listing</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>


