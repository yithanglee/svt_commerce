<script>
	import { goto } from '$app/navigation';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	
	/** @type {import('./$types').PageData} */
	export let data;
	
	const sale = data.sale || {};
	const orderUser = data.orderUser || {};
	const user_id = data.user.id;
	const eWallet = data.eWallet || {};
	
	function parseOrderDetails() {
		try {
			// First, try to use sales_items array (most reliable source)
			if (sale.sales_items && Array.isArray(sale.sales_items) && sale.sales_items.length > 0) {
				return sale.sales_items.map(item => ({
					image: item.img_url || '',
					name: item.item_name || 'Product',
					price: parseFloat(item.item_price || 0),
					pv: parseFloat(item.item_pv || 0),
					quantity: parseInt(item.qty || 1)
				}));
			}
			
			// Fallback to registration_details.items array (new format)
			if (sale.registration_details) {
				const details = typeof sale.registration_details === 'string' 
					? JSON.parse(sale.registration_details) 
					: sale.registration_details;
				
				if (details.items && Array.isArray(details.items) && details.items.length > 0) {
					return details.items.map(item => ({
						image: item.img_url || '',
						name: item.name || 'Product',
						price: parseFloat(item.price || 0),
						pv: parseFloat(item.pv || 0),
						quantity: parseInt(item.qty || 1)
					}));
				}
				
				// Fallback to old format: registration_details.user.products
				if (details.user && details.user.products) {
					const products = details.user.products;
					const productKeys = Object.keys(products);
					return productKeys.map(key => {
						const product = products[key];
						return {
							image: product.img_url || '',
							name: product.item_name || 'Product',
							price: parseFloat(product.item_price || 0),
							pv: parseFloat(product.item_pv || 0),
							quantity: parseInt(product.qty || 1)
						};
					});
				}
			}
		} catch (e) {
			console.error('Error parsing order details:', e);
		}
		return [];
	}
	
	function getStatusBadge(status) {
		const statusMap = {
			'pending_confirmation': { text: 'Pending Confirmation', class: 'bg-yellow-500/20 text-yellow-400' },
			'pending_payment': { text: 'Pending Payment', class: 'bg-orange-500/20 text-orange-400' },
			'processing': { text: 'Processing', class: 'bg-blue-500/20 text-blue-400' },
			'pending_delivery': { text: 'Pending Delivery', class: 'bg-purple-500/20 text-purple-400' },
			'sent': { text: 'Sent', class: 'bg-green-500/20 text-green-400' },
			'in_transit': { text: 'In Transit', class: 'bg-yellow-500/20 text-yellow-400' },
			'delivered': { text: 'Delivered', class: 'bg-green-500/20 text-green-400' },
			'complete': { text: 'Delivered', class: 'bg-green-500/20 text-green-400' },
			'cancelled': { text: 'Cancelled', class: 'bg-red-500/20 text-red-400' }
		};
		return statusMap[status] || { text: status || 'Unknown', class: 'bg-gray-500/20 text-gray-400' };
	}
	
	function formatPrice(price) {
		if (!price && price !== 0) return 'RM 0.00';
		return ` ${parseFloat(price).toFixed(2)} ATP`;
	}
	
	function formatDateTime(dateString) {
		if (!dateString) return '-';
		try {
			const date = new Date(dateString);
			return date.toLocaleString('en-US', { 
				year: 'numeric', 
				month: '2-digit', 
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			});
		} catch {
			return dateString;
		}
	}
	
	function downloadInvoice() {
		if (sale.id) {
			window.open(PHX_HTTP_PROTOCOL + PHX_ENDPOINT + '/pdf?id=' + sale.id, '_blank');
		}
	}
	
	function getUserInitials(username) {
		if (!username) return 'U';
		const parts = username.trim().split(/\s+/);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return username.substring(0, 2).toUpperCase();
	}
	
	$: products = parseOrderDetails();
	$: statusBadge = getStatusBadge(sale.status);
	$: subtotal = sale.subtotal || 0;
	$: shippingFee = sale.shipping_fee || 0;
	$: grandTotal = sale.grand_total || subtotal + shippingFee;
	$: totalPV = sale.total_point_value || 0;
</script>

<div class="relative flex h-auto min-h-screen w-full flex-col bg-background-dark font-display">
	<div class="flex h-full grow flex-row">
	
		<!-- Main Content -->
		<main class="flex-1 p-8">
			<div class="max-w-7xl mx-auto">
				<div class="flex flex-wrap items-center justify-between gap-4 mb-8">
					<div>
						<button 
							class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary mb-2 transition-colors cursor-pointer bg-transparent border-none p-0" 
							type="button"
							on:click={() => goto(`/users/${data.user.id}/profile#orders`)}
						>
							<span class="material-symbols-outlined">arrow_back</span>
							Back to Orders
						</button>
						<div class="flex items-center gap-4">
							<h1 class="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Order #{sale.id || 'N/A'}</h1>
							<span class="inline-flex items-center rounded-full {statusBadge.class} px-3 py-1 text-xs font-medium">
								{statusBadge.text}
							</span>
						</div>
					</div>
					<button 
						class="text-white bg-primary hover:bg-primary/90 focus:ring-4 focus:ring-primary/50 font-medium rounded-lg text-sm px-5 py-2.5" 
						type="button"
						on:click={downloadInvoice}
					>
						Download Invoice
					</button>
				</div>
				
				<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<!-- Left Column - Items and Summary -->
					<div class="lg:col-span-2 space-y-6">
						<!-- Items Table -->
						<div class="rounded-lg border border-slate-700 bg-[#15202b] p-6">
							<h2 class="text-xl font-bold text-white mb-4">Items in this Order</h2>
							<div class="relative overflow-x-auto">
								<table class="w-full text-sm text-left rtl:text-right text-slate-400">
									<thead class="text-xs text-slate-400 uppercase bg-[#101922]">
										<tr>
											<th class="px-6 py-3" scope="col">Product</th>
											<th class="px-6 py-3" scope="col">Price</th>
											<th class="px-6 py-3" scope="col">PV</th>
											<th class="px-6 py-3" scope="col">Quantity</th>
											<th class="px-6 py-3 text-right" scope="col">Total</th>
										</tr>
									</thead>
									<tbody>
										{#each products as product}
											<tr class="border-b border-slate-700">
												<th class="px-6 py-4 font-medium text-white" scope="row">
													<div class="flex items-center gap-4">
														{#if product.image}
															<img 
																alt={product.name} 
																class="w-16 h-16 object-cover rounded-md" 
																src={PHX_HTTP_PROTOCOL + PHX_ENDPOINT + product.image}
															/>
														{:else}
															<div class="w-16 h-16 bg-slate-700 rounded-md flex items-center justify-center">
																<span class="material-symbols-outlined text-slate-500">image</span>
															</div>
														{/if}
														<span>{product.name}</span>
													</div>
												</th>
												<td class="px-6 py-4">{formatPrice(product.price)}</td>
												<td class="px-6 py-4">{product.pv}</td>
												<td class="px-6 py-4">{product.quantity}</td>
												<td class="px-6 py-4 text-right font-medium text-white">{formatPrice(product.price * product.quantity)}</td>
											</tr>
										{:else}
											<tr>
												<td colspan="5" class="px-6 py-4 text-center text-slate-400">No items found</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
						
						<!-- Order Summary -->
						<div class="rounded-lg border border-slate-700 bg-[#15202b] p-6">
							<h2 class="text-xl font-bold text-white mb-4">Order Summary</h2>
							<div class="space-y-3 text-slate-300">
								<div class="flex justify-between">
									<span>Subtotal:</span>
									<span class="font-medium text-white">{formatPrice(subtotal)}</span>
								</div>
								<div class="flex justify-between">
									<span>Shipping:</span>
									<span class="font-medium text-white">{formatPrice(shippingFee)}</span>
								</div>
								<div class="border-t border-slate-700 my-3"></div>
								<div class="flex justify-between text-lg">
									<span class="font-bold text-white">Grand Total:</span>
									<span class="font-bold text-primary">{formatPrice(grandTotal)}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="font-bold text-white">Total Point Value (PV):</span>
									<span class="font-bold text-primary">{totalPV}</span>
								</div>
							</div>
						</div>
					</div>
					
					<!-- Right Column - Order Information -->
					<div class="lg:col-span-1">
						<div class="rounded-lg border border-slate-700 bg-[#15202b] p-6 space-y-4 sticky top-8">
							<h2 class="text-xl font-bold text-white border-b border-slate-700 pb-3">Order Information</h2>
							<dl class="space-y-4 text-sm">
								<div>
									<dt class="text-slate-400">Order ID</dt>
									<dd class="font-medium text-white">#{sale.id || 'N/A'}</dd>
								</div>
								<div>
									<dt class="text-slate-400">Order Date</dt>
									<dd class="font-medium text-white">{formatDateTime(sale.inserted_at || sale.sale_date)}</dd>
								</div>
								{#if sale.shipping_ref}
									<div>
										<dt class="text-slate-400">Shipping Reference</dt>
										<dd class="font-medium text-primary">{sale.shipping_ref}</dd>
									</div>
								{/if}
								{#if sale.user_id}
									<div>
										<dt class="text-slate-400">User ID</dt>
										<dd class="font-medium text-white">{sale.user_id}</dd>
									</div>
								{/if}
								{#if sale.sales_person_id}
									<div>
										<dt class="text-slate-400">Sales Person ID</dt>
										<dd class="font-medium text-white">{sale.sales_person_id}</dd>
									</div>
								{/if}
							</dl>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
</div>

<style>
	.material-symbols-outlined {
		font-variation-settings:
		'FILL' 0,
		'wght' 400,
		'GRAD' 0,
		'opsz' 24
	}
</style>

