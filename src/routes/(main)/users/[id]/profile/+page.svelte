<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { session } from '$lib/stores/session';
	import Cookies from 'js-cookie';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT, PHX_COOKIE } from '$lib/constants';
	import { onMount } from 'svelte';
	
	/** @type {import('./$types').PageData} */
	export let data;
	
	const user = data.user || {};
	const eWallet = data.eWallet || {};
	const activeOrders = data.activeOrders || [];
	const orderHistory = data.orderHistory || [];
	const user_id = data.user_id;
	
	let activeTab = 'profile';
	let ordersSubTab = 'active';
	
	// Check for tab query parameter on mount
	onMount(() => {
		const tabParam = $page.url.searchParams.get('tab');
		if (tabParam === 'orders') {
			activeTab = 'orders';
			ordersSubTab = 'active';
		}
	});
	
	function logout() {
		session.logout();
		Cookies.remove('user');
		Cookies.remove(PHX_COOKIE);
		setTimeout(() => {
			goto('/');
		}, 200);
	}
	
	function formatDate(dateString) {
		if (!dateString) return '-';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
		} catch {
			return dateString;
		}
	}
	
	function formatPrice(price) {
		if (!price) return '0.00 ATP';
		return `${parseFloat(price).toFixed(2)} ATP`;
	}
	
	function parseOrderDetails(order) {
		try {
			// First try to use sales_items array (new format)
			if (order.sales_items && Array.isArray(order.sales_items) && order.sales_items.length > 0) {
				const firstItem = order.sales_items[0];
				const totalQty = order.sales_items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
				return {
					product_image: firstItem.img_url || '',
					product_name: firstItem.item_name || 'Product',
					product_price: firstItem.item_price || '0',
					quantity: totalQty || '1',
					total_items: order.sales_items.length,
					all_items: order.sales_items // Store all items for detailed display
				};
			}
			
			// Fallback to registration_details (old format)
			if (order.registration_details) {
				const details = typeof order.registration_details === 'string' 
					? JSON.parse(order.registration_details) 
					: order.registration_details;
				
				if (details.user && details.user.products) {
					const products = details.user.products;
					const productKeys = Object.keys(products);
					if (productKeys.length > 0) {
						const firstProduct = products[productKeys[0]];
						return {
							product_image: firstProduct.img_url || '',
							product_name: firstProduct.item_name || 'Product',
							product_price: firstProduct.item_price || '0',
							quantity: firstProduct.qty || '1',
							total_items: productKeys.length
						};
					}
				}
			}
		} catch (e) {
			console.error('Error parsing order details:', e);
		}
		return {
			product_image: '',
			product_name: 'Product',
			product_price: '0',
			quantity: '1',
			total_items: 1
		};
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
	
	function getTrackingSteps(status, orderDate) {
		const orderedDate = orderDate ? formatDate(orderDate) : 'N/A';
		const statusLower = status?.toLowerCase();
		
		// Determine which steps are completed based on status progression
		const isConfirmed = statusLower !== 'pending_confirmation';
		const isPaid = statusLower !== 'pending_confirmation' && statusLower !== 'pending_payment';
		const isProcessing = statusLower === 'processing' || statusLower === 'pending_delivery' || statusLower === 'sent' || statusLower === 'delivered' || statusLower === 'complete';
		const isShipped = statusLower === 'sent' || statusLower === 'pending_delivery' || statusLower === 'delivered' || statusLower === 'complete';
		const isDelivered = statusLower === 'delivered' || statusLower === 'complete';
		
		const steps = [
			{ id: 1, label: 'Order Confirmed', completed: isConfirmed, date: isConfirmed ? orderedDate : 'Awaiting' },
			{ id: 2, label: 'Payment Received', completed: isPaid, date: isPaid ? orderedDate : 'Awaiting' },
			{ id: 3, label: 'Processing', completed: isProcessing, date: isProcessing ? (statusLower === 'processing' ? 'In Progress' : orderedDate) : 'Awaiting' },
			{ id: 4, label: 'Shipped', completed: isShipped, date: isShipped ? (statusLower === 'sent' || statusLower === 'pending_delivery' ? 'Shipped' : orderedDate) : 'Awaiting' },
			{ id: 5, label: 'Delivered', completed: isDelivered, date: isDelivered ? 'Completed' : 'Awaiting' }
		];
		return steps;
	}
	
	function getUserInitials(username) {
		if (!username) return 'U';
		const parts = username.trim().split(/\s+/);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return username.substring(0, 2).toUpperCase();
	}
	
	function getMemberSince(dateString) {
		if (!dateString) return 'N/A';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
		} catch {
			return 'N/A';
		}
	}
	
	$: userInitials = getUserInitials(user.username || user.fullname || 'User');
	$: userAvatar = user.avatar || user.profile_image || '';
	$: userEmail = user.email || '';
	$: userName = user.fullname || user.username || 'User';
	$: userPhone = user.phone || user.phone_number || '-';
	$: memberSince = getMemberSince(user.created_at || user.inserted_at || user.member_since);
	$: memberPoints = eWallet.total || 0;
</script>

<div class="relative flex h-auto min-h-screen w-full flex-col bg-background-dark font-display">
	<div class="flex h-full grow flex-row">
		<!-- SideNavBar -->
		<aside class="flex h-screen min-h-[700px] w-64 flex-col justify-between bg-[#15202b] p-4 sticky top-0">
			<div class="flex flex-col gap-4">
				<div class="flex items-center gap-3 p-2">
					{#if userAvatar}
						<div 
							class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" 
							style="background-image: url('{userAvatar}');"
						></div>
					{:else}
						<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-primary flex items-center justify-center text-white font-bold">
							{userInitials}
						</div>
					{/if}
					<div class="flex flex-col">
						<h1 class="text-white text-base font-medium leading-normal">{userName}</h1>
						<p class="text-slate-400 text-sm font-normal leading-normal">{userEmail}</p>
					</div>
				</div>
				<nav class="flex flex-col gap-2 mt-4">
					<button 
						class="flex items-center gap-3 px-3 py-2 rounded-lg {activeTab === 'profile' ? 'bg-primary/30 text-primary' : 'text-slate-300 hover:bg-primary/20 hover:text-white'} transition-colors duration-200 w-full text-left" 
						type="button"
						on:click={() => activeTab = 'profile'}
					>
						<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' {activeTab === 'profile' ? 1 : 0};">person</span>
						<p class="text-sm font-medium leading-normal">Profile</p>
					</button>
					<button 
						class="flex items-center gap-3 px-3 py-2 rounded-lg {activeTab === 'orders' ? 'bg-primary/30 text-primary' : 'text-slate-300 hover:bg-primary/20 hover:text-white'} transition-colors duration-200 w-full text-left" 
						type="button"
						on:click={() => { activeTab = 'orders'; ordersSubTab = 'active'; }}
					>
						<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' {activeTab === 'orders' ? 1 : 0};">package_2</span>
						<p class="text-sm font-medium leading-normal">Orders</p>
					</button>
					<button 
						class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-primary/20 hover:text-white transition-colors duration-200 w-full text-left" 
						type="button"
					>
						<span class="material-symbols-outlined">settings</span>
						<p class="text-sm font-medium leading-normal">Settings</p>
					</button>
					<button 
						class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-primary/20 hover:text-white transition-colors duration-200 w-full text-left" 
						type="button"
					>
						<span class="material-symbols-outlined">help</span>
						<p class="text-sm font-medium leading-normal">Help</p>
					</button>
					<button 
					class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200" 
					on:click={logout}
				>
					<span class="material-symbols-outlined">logout</span>
					<p class="text-sm font-medium leading-normal">Log out</p>
				</button>
				</nav>
			</div>
			<div class="flex flex-col gap-1">
				<button 
					class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200" 
					on:click={logout}
				>
					<span class="material-symbols-outlined">logout</span>
					<p class="text-sm font-medium leading-normal">Log out</p>
				</button>
			</div>
		</aside>
		
		<!-- Main Content -->
		<main class="flex-1 p-8">
			<div class="max-w-7xl mx-auto">
				{#if activeTab === 'profile'}
					<!-- Profile Section -->
					<div class="flex flex-wrap justify-between gap-3 mb-8">
						<p class="text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">My Profile</p>
					</div>
					<div class="bg-[#15202b] border border-slate-700 rounded-xl p-6 md:p-8">
						<div class="flex items-center gap-6 mb-8 pb-8 border-b border-slate-700">
							{#if userAvatar}
								<div 
									class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 shrink-0" 
									style="background-image: url('{userAvatar}');"
								></div>
							{:else}
								<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 shrink-0 bg-primary flex items-center justify-center text-white font-bold text-2xl">
									{userInitials}
								</div>
							{/if}
							<div class="flex flex-col">
								<h2 class="text-2xl font-bold text-white">{userName}</h2>
								<p class="text-slate-400">Member since {memberSince}</p>
							</div>
						</div>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
							<div>
								<label class="block mb-2 text-sm font-medium text-slate-400" for="full-name">Full Name</label>
								<p class="py-2.5 px-4 block w-full bg-[#101922] border border-slate-600 rounded-lg text-white" id="full-name">{userName}</p>
							</div>
							<div>
								<label class="block mb-2 text-sm font-medium text-slate-400" for="phone-number">Phone Number</label>
								<p class="py-2.5 px-4 block w-full bg-[#101922] border border-slate-600 rounded-lg text-white" id="phone-number">{userPhone}</p>
							</div>
							<div class="md:col-span-2">
								<label class="block mb-2 text-sm font-medium text-slate-400" for="email">Email Address</label>
								<p class="py-2.5 px-4 block w-full bg-[#101922] border border-slate-600 rounded-lg text-white" id="email">{userEmail}</p>
							</div>
							<div class="md:col-span-2">
								<div class="block mb-2 text-sm font-medium text-slate-400">Active Token Balance</div>
								<div class="flex items-center gap-3 py-2.5 px-4 bg-primary/10 border border-primary/30 rounded-lg">
									<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">stars</span>
									<p class="text-white font-semibold text-lg">{memberPoints.toLocaleString()} TP</p>
								</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'orders'}
					<!-- Orders Section -->
					<div class="flex flex-wrap justify-between gap-3 mb-6">
						<p class="text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">My Orders</p>
					</div>
					
					<!-- Tabs -->
					<div class="pb-3">
						<div class="flex border-b border-slate-700 gap-8">
							<button 
								class="flex flex-col items-center justify-center border-b-[3px] {ordersSubTab === 'active' ? 'border-b-primary text-white' : 'border-b-transparent text-slate-400'} pb-[13px] pt-4 hover:text-white transition-colors"
								on:click={() => ordersSubTab = 'active'}
							>
								<p class="text-sm font-bold leading-normal tracking-[0.015em]">Active Orders</p>
							</button>
							<button 
								class="flex flex-col items-center justify-center border-b-[3px] {ordersSubTab === 'history' ? 'border-b-primary text-white' : 'border-b-transparent text-slate-400'} pb-[13px] pt-4 hover:text-white transition-colors"
								on:click={() => ordersSubTab = 'history'}
							>
								<p class="text-sm font-bold leading-normal tracking-[0.015em]">Order History</p>
							</button>
						</div>
					</div>
					
					{#if ordersSubTab === 'active'}
					<!-- Active Orders Section -->
					<div class="flex flex-col mt-6">
						<div class="flex flex-col gap-4">
							{#each activeOrders as order}
								{@const orderDetails = parseOrderDetails(order)}
								{@const statusBadge = getStatusBadge(order.status)}
								{@const trackingSteps = getTrackingSteps(order.status, order.inserted_at)}
								<details class="flex flex-col rounded-lg border border-slate-700 bg-[#15202b] px-5 py-3 group" open={order === activeOrders[0]}>
									<summary class="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
										<div class="flex items-center gap-4">
											<p class="text-white text-base font-bold leading-normal">Order #{order.id || 'N/A'}</p>
											<span class="inline-flex items-center rounded-full {statusBadge.class} px-3 py-1 text-xs font-medium">
												{statusBadge.text}
											</span>
										</div>
										<div class="flex items-center gap-6">
											<p class="text-slate-400 text-sm">Order Date: {formatDate(order.inserted_at || order.sale_date)}</p>
											<span class="material-symbols-outlined text-white group-open:rotate-180 transition-transform">expand_more</span>
										</div>
									</summary>
									<div class="border-t border-slate-700 mt-4 pt-4">
										<h3 class="text-lg font-semibold text-white mb-4">Tracking Details</h3>
										{#if orderDetails.all_items && orderDetails.all_items.length > 1}
											<!-- Multiple items display -->
											<div class="space-y-3 mb-4">
												{#each orderDetails.all_items as item}
													<div class="flex gap-4 items-center p-3 bg-[#101922] rounded-lg">
														{#if item.img_url}
															<img 
																class="w-16 h-16 object-cover rounded-lg" 
																src={PHX_HTTP_PROTOCOL + PHX_ENDPOINT + item.img_url} 
																alt={item.item_name || 'Product'}
															/>
														{:else}
															<div class="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
																<span class="material-symbols-outlined text-slate-500 text-sm">image</span>
															</div>
														{/if}
														<div class="flex-1">
															<p class="text-white font-medium">{item.item_name || 'Product'}</p>
															<p class="text-slate-400 text-sm">
																Qty: {item.qty || 1} × {formatPrice(item.item_price || 0)}
															</p>
														</div>
													</div>
												{/each}
											</div>
										{:else}
											<!-- Single item display -->
											<div class="flex gap-8">
												{#if orderDetails.product_image}
													<img 
														class="w-24 h-24 object-cover rounded-lg" 
														src={PHX_HTTP_PROTOCOL + PHX_ENDPOINT + orderDetails.product_image} 
														alt={orderDetails.product_name}
													/>
												{:else}
													<div class="w-24 h-24 bg-slate-700 rounded-lg flex items-center justify-center">
														<span class="material-symbols-outlined text-slate-500">image</span>
													</div>
												{/if}
												<div class="flex-1">
													<p class="text-white font-medium">{orderDetails.product_name}</p>
													<p class="text-slate-400 text-sm mt-1">
														Quantity: {orderDetails.quantity} × {formatPrice(orderDetails.product_price)}
													</p>
												</div>
											</div>
										{/if}
										<div class="mt-4">
											{#if order.shipping_ref}
												<p class="text-slate-400 text-sm mt-1">
													Shipping Ref: <span class="text-primary">{order.shipping_ref}</span>
												</p>
											{/if}
											<p class="text-slate-400 text-sm mt-1">
												Total: <span class="text-white font-semibold">{formatPrice(order.grand_total || order.subtotal)}</span>
											</p>
										</div>
										<!-- Progress Stepper -->
										<ol class="items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0 rtl:space-x-reverse mt-5">
											{#each trackingSteps as step, index}
												<li class="flex items-center {step.completed ? 'text-primary' : 'text-slate-500'} space-x-2.5 rtl:space-x-reverse">
													<span class="flex items-center justify-center w-8 h-8 border {step.completed ? 'border-primary bg-primary/20' : 'border-slate-600'} rounded-full shrink-0">
														{#if step.completed}
															<span class="material-symbols-outlined !text-base">check</span>
														{:else}
															<span class="text-sm">{step.id}</span>
														{/if}
													</span>
													<div>
														<h3 class="font-medium leading-tight {step.completed ? 'text-white' : ''}">{step.label}</h3>
														<p class="text-xs {step.completed ? 'text-slate-400' : 'text-slate-500'}">{step.date}</p>
													</div>
												</li>
											{/each}
										</ol>
									</div>
								</details>
							{:else}
								<div class="text-center py-20 border-2 border-dashed border-slate-700 rounded-xl mt-6">
									<span class="material-symbols-outlined text-5xl text-slate-500 mx-auto">local_mall</span>
									<h3 class="mt-4 text-xl font-semibold text-white">No Active Orders</h3>
									<p class="mt-1 text-sm text-slate-400">When you place an order, its tracking information will appear here.</p>
									<button 
										type="button" 
										class="mt-6 text-white bg-primary hover:bg-primary/90 font-medium rounded-lg text-sm px-5 py-2.5"
										on:click={() => goto('/shop')}
									>
										Start Shopping
									</button>
								</div>
							{/each}
						</div>
					</div>
					{:else if ordersSubTab === 'history'}
						<!-- Order History Section -->
					<div class="flex flex-col mt-12">
						<h2 class="text-white text-2xl font-bold leading-tight tracking-[-0.015em] mb-4">Order History</h2>
						<div class="relative overflow-x-auto rounded-lg border border-slate-700">
							<table class="w-full text-sm text-left text-slate-300">
								<thead class="text-xs text-slate-400 uppercase bg-[#15202b]">
									<tr>
										<th class="px-6 py-3" scope="col">Order ID</th>
										<th class="px-6 py-3" scope="col">Date</th>
										<th class="px-6 py-3" scope="col">Items</th>
										<th class="px-6 py-3" scope="col">Total</th>
										<th class="px-6 py-3" scope="col">Status</th>
										<th class="px-6 py-3" scope="col"><span class="sr-only">Actions</span></th>
									</tr>
								</thead>
								<tbody>
									{#each orderHistory as order}
										{@const orderDetails = parseOrderDetails(order)}
										{@const statusBadge = getStatusBadge(order.status)}
										<tr class="bg-[#15202b]/50 border-b border-slate-700 hover:bg-[#1f2937] transition-colors">
											<th class="px-6 py-4 font-medium text-white whitespace-nowrap" scope="row">
												#{order.id || 'N/A'}
											</th>
											<td class="px-6 py-4">{formatDate(order.inserted_at || order.sale_date)}</td>
											<td class="px-6 py-4">{orderDetails.quantity}x {orderDetails.product_name}</td>
											<td class="px-6 py-4">{formatPrice(order.grand_total || order.subtotal)}</td>
											<td class="px-6 py-4">
												<span class="inline-flex items-center rounded-full {statusBadge.class} px-3 py-1 text-xs font-medium">
													{statusBadge.text}
												</span>
											</td>
											<td class="px-6 py-4 text-right">
												<a 
													class="hidden font-medium text-primary hover:underline bg-transparent border-none p-0 cursor-pointer" 
													href="/sales/{order.id}/details"
													target="_blank"
													rel="noopener noreferrer"
												>
													View Details
												</a>
												<button on:click={() => goto(`/sales/${order.id}/details`)} class="font-medium text-primary hover:underline bg-transparent border-none p-0 cursor-pointer">
													View Details 
												</button>
											</td>
										</tr>
									{:else}
										<tr>
											<td colspan="6" class="px-6 py-8 text-center text-slate-400">
												No order history found
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
					{/if}
				{/if}
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

