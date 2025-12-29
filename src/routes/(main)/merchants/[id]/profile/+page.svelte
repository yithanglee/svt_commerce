<script>
	import { goto, invalidateAll, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Modal, Button, Label, Input, Textarea } from 'flowbite-svelte';
	import { session } from '$lib/stores/session';
	import { PHX_COOKIE, PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { postData, api_get } from '$lib/index.js';
	import Cookies from 'js-cookie';
	/** @type {import('./$types').PageData} */
	export let data;
	const merchant = data.merchant || {};
	let products = data.products || [];
	const merchantProductCategories = data.merchant_product_categories || [];
	$: stats = data.stats || { activeListings: 0, pendingOrders: 0, totalSales: 0, earnings: '0.00' };

	const phxBaseUrl = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;

	function getProductConditionLabel(value) {
		const v = String(value || '').toLowerCase();
		if (v === 'new') return 'New';
		if (v === 'like_new') return 'Like new';
		if (v === 'used') return 'Used';
		return v ? v.replaceAll('_', ' ') : '-';
	}

	function getMerchantProductCategoryName(product) {
		const id = product?.merchant_product_category_id;
		if (id != null && Array.isArray(merchantProductCategories)) {
			const hit = merchantProductCategories.find((c) => String(c.id) === String(id));
			if (hit?.name) return hit.name;
		}
		return product?.merchant_product_category?.name || product?.category_name || '-';
	}

	let activeTab = 'dashboard';
	let searchQuery = '';
	let statusFilter = 'All';
	let showProductModal = false;
	let isEditMode = false;
	let isSubmitting = false;
	let isLoadingProducts = false;
	let errors = {};
	let module = 'MerchantProduct';
	let selectedProduct = null;
	const merchant_id = data.merchant_id;
	let isInitialLoad = true;
	$: orders = data.orders || [];
	$: activeOrders = data.activeOrders || [];
	$: orderHistory = data.orderHistory || [];
	let orderStatusFilter = 'All';
	let isUpdatingStatus = false;

	// Merchant Profile form state (crypto wallet + social contact)
	let merchantProfileSubmitting = false;
	let merchantProfileError = '';
	const merchantModule = 'Merchant';
	let merchantProfileUploadedImageName = '';
	let merchantProfileImageError = '';
	let merchantProfileImagePreviewUrl = '';
	let merchantProfileImagePreviewObjectUrl = '';
	let merchantProfileForm = {
		img_url: null,
		bank_name: '',
		bank_account_no: '',
		bank_account_holder: '',
		line_id: '',
		facebook_url: '',
		instagram_id: '',
		twitter_url: '',
		youtube_url: '',
		tiktok_url: '',
		pinterest_url: '',
		linkedin_url: '',
		github_url: '',
		whatsapp_number: '',
		wechat_number: ''
	};

	function getAbsoluteImageUrl(imgUrl) {
		if (!imgUrl) return '';
		if (String(imgUrl).startsWith('http')) return String(imgUrl);
		return phxBaseUrl + String(imgUrl);
	}

	function getMerchantAvatarUrl() {
		// Some pages use `merchant.logo`, others use `merchant.img_url` (DB field).
		return getAbsoluteImageUrl(merchant?.logo || merchant?.img_url || '');
	}

	function validateMerchantProfileImage(file) {
		if (!file) return false;
		if (file.size > 5 * 1024 * 1024) {
			merchantProfileImageError = 'File size must be less than 5MB';
			return false;
		}
		const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
		if (!validTypes.includes(file.type)) {
			merchantProfileImageError = 'File must be JPG or PNG';
			return false;
		}
		return true;
	}

	function handleMerchantProfileImageChange(event) {
		const file = event?.target?.files?.[0];
		merchantProfileImageError = '';

		if (!file) return;
		if (!validateMerchantProfileImage(file)) return;

		merchantProfileForm.img_url = file;
		merchantProfileUploadedImageName = file.name;

		// Preview selected image
		if (merchantProfileImagePreviewObjectUrl) {
			try {
				URL.revokeObjectURL(merchantProfileImagePreviewObjectUrl);
			} catch {
				// ignore
			}
		}
		merchantProfileImagePreviewObjectUrl = URL.createObjectURL(file);
		merchantProfileImagePreviewUrl = merchantProfileImagePreviewObjectUrl;
	}

	// Form state
	let formData = {
		name: '',
		brand_name: '',
		description: '',
		short_desc: '',
		retail_price: '',
		product_condition: 'new',
		point_value: '',
		override_pv: '',
		merchant_product_category_id: '',
		category_id: '',
		category_name: '',
		img_url: null,
		img_url2: null,
		img_url3: null,
		img_url4: null
	};

	let uploadedFileNames = {
		img_url: '',
		img_url2: '',
		img_url3: '',
		img_url4: ''
	};

	// Fetch products from API with search and filter
	async function fetchProducts() {
		isLoadingProducts = true;
		try {
			const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
			const searchConditions = [
				{ column: 'merchant_id', value: merchant_id, prefix: 'a', operator: '' }
			];

			// Add search query condition if provided
			if (searchQuery && searchQuery.trim()) {
				searchConditions.push({
					column: 'name',
					value: searchQuery.trim(),
					prefix: 'a',
					operator: 'ilike'
				});
			}

			// Add status filter condition if not 'All'
			if (statusFilter !== 'All') {
				const isActiveValue = statusFilter === 'Active' ? true : false;
				searchConditions.push({
					column: 'is_active',
					value: isActiveValue,
					prefix: 'a',
					operator: ''
				});
			}

			const allProducts = await api_get(url, {
				scope: 'datatable',
				model: 'MerchantProduct',
				limit: 100,
				additional_search: JSON.stringify(searchConditions)
			});

			products = Array.isArray(allProducts?.data) ? allProducts.data : [];

			// Recalculate stats
			const activeListings = products.filter((p) => p.is_active !== false).length;
			const totalSales = products.length;
			const pendingOrders = 0;
			const earnings = products.reduce((sum, p) => sum + (parseFloat(p.retail_price) || 0), 0);

			stats = {
				activeListings,
				pendingOrders,
				totalSales,
				earnings: earnings.toFixed(2)
			};
		} catch (error) {
			console.error('Error fetching products:', error);
		} finally {
			isLoadingProducts = false;
		}
	}


	async function deleteProduct(productId) {
		try {
			const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
			await postData({ id: productId }, {method: 'DELETE',
				endpoint: url + `/svt_api/MerchantProduct/${productId}`,
				successCallback: async () => {
					// Refresh products
					await invalidate('/merchants/' + merchant_id + '/profile');
					// Reload page data
					await invalidateAll();
					await fetchProducts();
				}
			});	
		} catch (error) {
			console.error('Error deleting product:', error);
			alert('Failed to delete product. Please try again.');
		}
	}

	// Debounce search query to avoid too many API calls
	let searchTimeout;
	$: if (activeTab === 'dashboard' && !isInitialLoad) {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			fetchProducts();
		}, 300);
	}

	// Watch status filter changes
	$: if (activeTab === 'dashboard' && statusFilter && !isInitialLoad) {
		fetchProducts();
	}

	// Mark initial load as complete after component mounts
	onMount(() => {
		isInitialLoad = false;

		console.log('merchant', merchant);

		// Initialize merchant profile form from loaded merchant record
		merchantProfileForm.bank_name = merchant.bank_name || '';
		merchantProfileForm.bank_account_no = merchant.bank_account_no || '';
		merchantProfileForm.bank_account_holder = merchant.bank_account_holder || '';
		merchantProfileForm.line_id = merchant.line_id || '';
		merchantProfileForm.facebook_url = merchant.facebook_url || '';
		merchantProfileForm.instagram_id = merchant.instagram_id || '';
		merchantProfileForm.twitter_url = merchant.twitter_url || '';
		merchantProfileForm.youtube_url = merchant.youtube_url || '';
		merchantProfileForm.tiktok_url = merchant.tiktok_url || '';
		merchantProfileForm.pinterest_url = merchant.pinterest_url || '';
		merchantProfileForm.linkedin_url = merchant.linkedin_url || '';
		merchantProfileForm.github_url = merchant.github_url || '';
		merchantProfileForm.whatsapp_number = merchant.whatsapp_number || '';
		merchantProfileForm.wechat_number = merchant.wechat_number || '';

		// Show current image label (if any). Preview uses `merchant.img_url` directly in template.
		if (merchant?.img_url || merchant?.logo) {
			merchantProfileUploadedImageName = 'Current image';
		}
	});

	// Use products directly (no client-side filtering needed since API handles it)
	$: filteredProducts = products;

	function formatDate(dateString) {
		if (!dateString) return '-';
		try {
			const date = new Date(dateString);
			return date.toISOString().split('T')[0];
		} catch {
			return dateString;
		}
	}
	function logout() {
		session.logout();
		Cookies.remove('user');
		Cookies.remove(PHX_COOKIE);
		setTimeout(() => {
			goto('/login');
		}, 200);
	}

	function formatPrice(price) {
		if (!price) return '0 NST';
		return `${parseFloat(price).toFixed(2)} NST`;
	}

	function getStatusBadgeClass(status) {
		const statusLower = status?.toLowerCase() || '';
		switch (statusLower) {
			case 'pending_confirmation':
			case 'pending_payment':
				return 'bg-yellow-900 text-yellow-300';
			case 'processing':
			case 'preparing':
				return 'bg-blue-900 text-blue-300';
			case 'pending_delivery':
				return 'bg-purple-900 text-purple-300';
			case 'sent':
			case 'complete':
				return 'bg-green-900 text-green-300';
			case 'cancelled':
			case 'refund':
				return 'bg-red-900 text-red-300';
			default:
				return 'bg-gray-700 text-gray-300';
		}
	}

	function getStatusDisplayName(status) {
		const statusLower = status?.toLowerCase() || '';
		switch (statusLower) {
			case 'pending_confirmation':
				return 'Pending Confirmation';
			case 'pending_payment':
				return 'Pending Payment';
			case 'processing':
				return 'Processing';
			case 'preparing':
				return 'Preparing';
			case 'pending_delivery':
				return 'Pending Delivery';
			case 'sent':
				return 'Sent';
			case 'complete':
				return 'Complete';
			case 'cancelled':
				return 'Cancelled';
			case 'refund':
				return 'Refunded';
			default:
				return status || 'Unknown';
		}
	}

	function getNextStatusOptions(currentStatus) {
		const statusLower = currentStatus?.toLowerCase() || '';
		switch (statusLower) {
			case 'processing':
				return ['pending_delivery'];
			case 'pending_delivery':
				return ['sent'];
			default:
				return [];
		}
	}

	async function updateOrderStatus(orderId, newStatus) {
		if (isUpdatingStatus) return;

		isUpdatingStatus = true;
		try {
			const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
			await postData(
				{ scope: 'mark_merchant_do', id: orderId, status: newStatus },
				{
					endpoint: url + '/svt_api/webhook',
					successCallback: async () => {
						// Refresh orders
						await invalidate('/merchants/' + merchant_id + '/profile');
						// Reload page data
						await invalidateAll();
					}
				}
			);
		} catch (error) {
			console.error('Error updating order status:', error);
			alert('Failed to update order status. Please try again.');
		} finally {
			isUpdatingStatus = false;
		}
	}

	$: filteredOrders =
		orderStatusFilter === 'All'
			? orders
			: orderStatusFilter === 'Active'
			? activeOrders
			: orderHistory;

	function getStatus(product) {
		// Assuming products have a status field, or use is_active
		if (product.status) return product.status;
		return product.is_active !== false ? 'Active' : 'Inactive';
	}

	function setActiveTab(tab) {
		activeTab = tab;
		// Listings are shown in the dashboard. When switching back, refresh if search/filter is active.
		if (tab === 'dashboard' && ((searchQuery && searchQuery.trim()) || statusFilter !== 'All')) {
			fetchProducts();
		}
	}

	function getLoggedInUserRankName() {
		// Prefer rank coming from the loaded merchant profile (most accurate for this page),
		// but fall back to session / cookie if needed.
		const merchantRank =
			merchant?.rank_name ??
			merchant?.ranking ??
			merchant?.tier_name ??
			merchant?.tier ??
			merchant?.rank?.name ??
			merchant?.rank?.title ??
			merchant?.rank;
		const sessionRank =
			$session?.user?.rank_name ??
			$session?.user?.ranking ??
			$session?.user?.tier_name ??
			$session?.user?.tier ??
			$session?.user?.rank?.name ??
			$session?.user?.rank?.title ??
			$session?.user?.rank;

		console.log('sessionRank', sessionRank);
		let cookieRank = null;
		try {
			const cookieRaw = Cookies.get(PHX_COOKIE);
			if (cookieRaw) {
				const cookieObj = typeof cookieRaw === 'string' ? JSON.parse(cookieRaw) : cookieRaw;
				cookieRank =
					cookieObj?.rank_name ??
					cookieObj?.ranking ??
					cookieObj?.tier_name ??
					cookieObj?.tier ??
					cookieObj?.rank?.name ??
					cookieObj?.rank?.title ??
					cookieObj?.rank ??
					cookieObj?.user?.rank_name ??
					cookieObj?.user?.rank?.name ??
					cookieObj?.merchant?.rank_name ??
					cookieObj?.merchant?.rank?.name;
			}
		} catch {
			// ignore cookie parsing errors
		}

		const rank = merchantRank ?? sessionRank ?? cookieRank;
		return rank == null ? null : String(rank);
	}

	function getProductLimitForRank(rankName) {
		if (!rankName) return null;
		const v = String(rankName).toLowerCase().trim();
		if (v === 'bronze' || v.includes('bronze')) return 3;
		if (v === 'silver' || v.includes('silver')) return 6;
		if (v === 'gold' || v.includes('gold')) return 30;
		return null; // unknown/other ranks => unlimited
	}

	function openAddProductModal() {
		const rankName = getLoggedInUserRankName();
		const limit = getProductLimitForRank(rankName);

		const productCount = Array.isArray(products) ? products.length : 0;

		if (limit != null && productCount >= limit) {
			alert(
				`${
					rankName || 'Your'
				} rank can only upload up to ${limit} products. Please upgrade your rank to add more listings.`
			);
			return;
		}

		isEditMode = false;
		selectedProduct = null;
		showProductModal = true;
		// Reset form
		formData = {
			name: '',
			brand_name: '',
			description: '',
			short_desc: '',
			retail_price: '',
			product_condition: 'new',
			point_value: '',
			override_pv: '',
			merchant_product_category_id: '',
			category_id: '',
			category_name: '',
			img_url: null,
			img_url2: null,
			img_url3: null,
			img_url4: null
		};
		uploadedFileNames = {
			img_url: '',
			img_url2: '',
			img_url3: '',
			img_url4: ''
		};
		errors = {};
	}

	function closeProductModal() {
		showProductModal = false;
		isEditMode = false;
		selectedProduct = null;
		errors = {};
	}

	function openEditProductModal(product) {
		isEditMode = true;
		selectedProduct = product;
		showProductModal = true;
		// Initialize form with product data
		formData = {
			name: product.name || '',
			brand_name: product.brand_name || '',
			merchant_product_category_id: product.merchant_product_category_id || '',
			category_name: product.category_name || '',
			description: product.description || '',
			short_desc: product.short_desc || '',
			retail_price: product.retail_price || '',
			product_condition: String(product.product_condition || 'new'),
			point_value: product.point_value || '',
			override_pv: product.override_pv || '',
			category_id: product.category_id || '',
			img_url: null, // Keep as null for edit - existing image URL will be in img_url field
			img_url2: null,
			img_url3: null,
			img_url4: null
		};
		uploadedFileNames = {
			img_url: product.img_url ? 'Current image' : '',
			img_url2: product.img_url2 ? 'Current image' : '',
			img_url3: product.img_url3 ? 'Current image' : '',
			img_url4: product.img_url4 ? 'Current image' : ''
		};
		errors = {};
	}

	function validateFile(file, fieldName) {
		if (file.size > 5 * 1024 * 1024) {
			errors[fieldName] = 'File size must be less than 5MB';
			return false;
		}
		const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
		if (!validTypes.includes(file.type)) {
			errors[fieldName] = 'File must be JPG or PNG';
			return false;
		}
		return true;
	}

	function handleImageChange(event, fieldName) {
		const file = event.target.files[0];
		if (file) {
			if (validateFile(file, fieldName)) {
				formData[fieldName] = file;
				uploadedFileNames[fieldName] = file.name;
				errors[fieldName] = '';
			}
		}
	}

	function validateForm() {
		errors = {};
		let isValid = true;

		if (!formData.name.trim()) {
			errors.name = 'Product name is required';
			isValid = false;
		}

		if (!formData.description.trim()) {
			errors.description = 'Description is required';
			isValid = false;
		}

		if (!formData.retail_price || parseFloat(formData.retail_price) <= 0) {
			errors.retail_price = 'Retail price is required and must be greater than 0';
			isValid = false;
		}

		// Only require image for new products, not when editing
		if (!isEditMode && !formData.img_url) {
			errors.img_url = 'At least one product image is required';
			isValid = false;
		}

		return isValid;
	}

	async function handleSubmit(event) {
		event.preventDefault();

		if (!validateForm()) {
			return;
		}

		isSubmitting = true;

		try {
			const form = document.getElementById('product-form');
			const formDataToSubmit = new FormData(form);

			// If editing and no new image uploaded, keep existing image URL
			if (isEditMode && selectedProduct && !formData.img_url) {
				formDataToSubmit.set('MerchantProduct[img_url]', selectedProduct.img_url || '');
			}

			const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
			await postData(formDataToSubmit, {
				isFormData: true,
				endpoint: url + `/svt_api/${module}`,
				successCallback: async () => {
					showProductModal = false;
					isEditMode = false;
					selectedProduct = null;
					// Invalidate the page data to refetch products
					await invalidate('/merchants/' + merchant_id + '/profile');
					// Also refetch products directly
					await fetchProducts();
				}
			});
		} catch (error) {
			console.error('Error submitting product:', error);
			alert(
				`There was an error ${
					isEditMode ? 'updating' : 'submitting'
				} your product. Please try again.`
			);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleMerchantProfileSubmit(event) {
		event.preventDefault();
		merchantProfileSubmitting = true;
		merchantProfileError = '';

		try {
			const form = document.getElementById('merchant-profile-form');
			const formDataToSubmit = new FormData(form);
			const url = phxBaseUrl;

			await postData(formDataToSubmit, {
				isFormData: true,
				endpoint: url + `/svt_api/${merchantModule}`,
				successCallback: async () => {
					await invalidate('/merchants/' + merchant_id + '/profile');
					await invalidateAll();
				}
			});
		} catch (error) {
			console.error('Error updating merchant profile:', error);
			merchantProfileError = 'Failed to update profile. Please try again.';
		} finally {
			merchantProfileSubmitting = false;
		}
	}
</script>

<div
	class="relative flex h-auto min-h-screen w-full flex-col bg-[#101a23] dark group/design-root overflow-x-hidden"
	style="font-family: Manrope, 'Noto Sans', sans-serif;"
>
	<div class="layout-container flex h-full grow flex-col">
		<div class="gap-1 px-6 flex flex-1 justify-center py-5">
			<!-- Sidebar -->
			<div class="layout-content-container flex flex-col w-80">
				<div class="flex h-full min-h-[700px] flex-col justify-between bg-[#101a23] p-4">
					<div class="flex flex-col gap-4">
						<div class="flex gap-3">
							{#if getMerchantAvatarUrl()}
								<div
									class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
									style="background-image: url('{getMerchantAvatarUrl()}');"
								/>
							{:else}
								<div
									class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gray-600"
								/>
							{/if}
							<h1 class="text-white text-base font-medium leading-normal">
								{merchant.name || 'Merchant'}
							</h1>
						</div>
						<div class="flex flex-col gap-2">
							<button
								on:click={() => setActiveTab('dashboard')}
								class="flex items-center gap-3 px-3 py-2 rounded-lg {activeTab === 'dashboard'
									? 'bg-[#223649]'
									: ''} hover:bg-[#223649] transition-colors cursor-pointer"
							>
								<div class="text-white" data-icon="House" data-size="24px" data-weight="fill">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24px"
										height="24px"
										fill="currentColor"
										viewBox="0 0 256 256"
									>
										<path
											d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"
										/>
									</svg>
								</div>
								<p class="text-white text-sm font-medium leading-normal">Dashboard</p>
							</button>
							<button
								on:click={() => setActiveTab('orders')}
								class="flex items-center gap-3 px-3 py-2 rounded-lg {activeTab === 'orders'
									? 'bg-[#223649]'
									: ''} hover:bg-[#223649] transition-colors cursor-pointer"
							>
								<div
									class="text-white"
									data-icon="ShoppingCart"
									data-size="24px"
									data-weight="regular"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24px"
										height="24px"
										fill="currentColor"
										viewBox="0 0 256 256"
									>
										<path
											d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z"
										/>
									</svg>
								</div>
								<p class="text-white text-sm font-medium leading-normal">Orders</p>
							</button>
							<button
								on:click={() => setActiveTab('analytics')}
								class="flex items-center gap-3 px-3 py-2 rounded-lg {activeTab === 'analytics'
									? 'bg-[#223649]'
									: ''} hover:bg-[#223649] transition-colors cursor-pointer"
							>
								<div class="text-white" data-icon="ChartBar" data-size="24px" data-weight="regular">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24px"
										height="24px"
										fill="currentColor"
										viewBox="0 0 256 256"
									>
										<path
											d="M224,200h-8V40a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8V80H96a8,8,0,0,0-8,8v40H48a8,8,0,0,0-8,8v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16ZM160,48h40V200H160ZM104,96h40V200H104ZM56,144H88v56H56Z"
										/>
									</svg>
								</div>
								<p class="text-white text-sm font-medium leading-normal">Analytics</p>
							</button>
							<button
								on:click={() => setActiveTab('settings')}
								class="flex items-center gap-3 px-3 py-2 rounded-lg {activeTab === 'settings'
									? 'bg-[#223649]'
									: ''} hover:bg-[#223649] transition-colors cursor-pointer"
							>
								<div class="text-white" data-icon="Gear" data-size="24px" data-weight="regular">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24px"
										height="24px"
										fill="currentColor"
										viewBox="0 0 256 256"
									>
										<path
											d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"
										/>
									</svg>
								</div>
								<p class="text-white text-sm font-medium leading-normal">Merchant Profile</p>
							</button>
							<!--- logout button --->
							<button
								class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200"
								on:click={logout}
							>
								<span class="material-symbols-outlined">logout</span>
								<p class="text-sm font-medium leading-normal">Log out</p>
							</button>
						</div>
					</div>
					<div class="flex flex-col gap-1">
						<button
							on:click={() => setActiveTab('help')}
							class="flex items-center gap-3 px-3 py-2 rounded-lg {activeTab === 'help'
								? 'bg-[#223649]'
								: ''} hover:bg-[#223649] transition-colors cursor-pointer"
						>
							<div class="text-white" data-icon="Question" data-size="24px" data-weight="regular">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24px"
									height="24px"
									fill="currentColor"
									viewBox="0 0 256 256"
								>
									<path
										d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
									/>
								</svg>
							</div>
							<p class="text-white text-sm font-medium leading-normal">Help and Support</p>
						</button>
					</div>
				</div>
			</div>

			<!-- Main Content -->
			<div class="layout-content-container flex flex-col max-w-[960px] flex-1">
				{#if activeTab === 'dashboard'}
					<div class="flex flex-wrap justify-between gap-3 p-4">
						<div class="flex min-w-72 flex-col gap-3">
							<p class="text-white tracking-light text-[32px] font-bold leading-tight">
								Seller Dashboard
							</p>
							<p class="text-[#90adcb] text-sm font-normal leading-normal">
								Manage your listings, orders, and track your sales performance.
							</p>
						</div>
					</div>

					<!-- Overview Cards -->
					<h2
						class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5"
					>
						Overview
					</h2>
					<div class="flex flex-wrap gap-4 p-4">
						<div class="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#223649]">
							<p class="text-white text-base font-medium leading-normal">Active Listings</p>
							<p class="text-white tracking-light text-2xl font-bold leading-tight">
								{stats.activeListings}
							</p>
						</div>
						<div class="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#223649]">
							<p class="text-white text-base font-medium leading-normal">Pending Orders</p>
							<p class="text-white tracking-light text-2xl font-bold leading-tight">
								{stats.pendingOrders}
							</p>
						</div>
						<div class="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#223649]">
							<p class="text-white text-base font-medium leading-normal">Total Sales</p>
							<p class="text-white tracking-light text-2xl font-bold leading-tight">
								{stats.totalSales}
							</p>
						</div>
						<div class="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#223649]">
							<p class="text-white text-base font-medium leading-normal">Earnings</p>
							<p class="text-white tracking-light text-2xl font-bold leading-tight">
								{stats.earnings} NST
							</p>
						</div>
					</div>

					<!-- Listings (moved from the old Listings tab) -->
					<div class="flex flex-col gap-4 p-4">
						<p class="text-white tracking-light text-[32px] font-bold leading-tight">My Listings</p>
						<p class="text-[#90adcb] text-sm font-normal leading-normal">
							View and manage all your active and inactive product listings.
						</p>
					</div>
					<div class="flex flex-wrap items-center justify-between gap-4 p-4">
						<div class="flex items-center gap-2 w-full sm:w-auto">
							<div class="relative w-full sm:w-80">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									{#if isLoadingProducts}
										<svg
											class="animate-spin h-5 w-5 text-gray-400"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											/>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
									{:else}
										<svg
											class="h-5 w-5 text-gray-400"
											fill="currentColor"
											height="1em"
											viewBox="0 0 20 20"
											width="1em"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												clip-rule="evenodd"
												d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
												fill-rule="evenodd"
											/>
										</svg>
									{/if}
								</div>
								<input
									class="block w-full rounded-lg border border-[#314d68] bg-[#182634] p-2 pl-10 pr-10 text-sm text-white placeholder-gray-400 focus:border-[#0d80f2] focus:ring-[#0d80f2]"
									placeholder="Search by item name..."
									type="text"
									bind:value={searchQuery}
									disabled={isLoadingProducts}
									on:keydown={(e) => {
										if (e.key === 'Enter') {
											fetchProducts();
										}
									}}
								/>
							</div>
							<button
								class="flex items-center justify-center gap-2 rounded-lg bg-[#0d80f2] px-4 py-2 h-[42px] text-sm font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
								on:click={fetchProducts}
								disabled={isLoadingProducts}
							>
								<svg
									class="h-5 w-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
								<span>Search</span>
							</button>
						</div>
						<div class="flex items-center gap-4">
							<div class="flex items-center gap-2">
								<label class="text-sm font-medium text-white" for="status-filter">Status:</label>
								<select
									class="rounded-lg border border-[#314d68] bg-[#182634] pr-8 text-sm text-white focus:border-[#0d80f2] focus:ring-[#0d80f2]"
									id="status-filter"
									bind:value={statusFilter}
									disabled={isLoadingProducts}
								>
									<option selected="">All</option>
									<option>Active</option>
									<option>Inactive</option>
								</select>
							</div>
							<button
								class="flex items-center justify-center gap-2 rounded-lg bg-[#0d80f2] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-600"
								on:click={openAddProductModal}
							>
								<span>Add New Listing</span>
							</button>
						</div>
					</div>
					<div class="px-4 py-3 @container">
						<div class="flex overflow-hidden rounded-lg border border-[#314d68] bg-[#101a23]">
							<table class="w-full flex-1">
								<thead>
									<tr class="bg-[#182634]">
										<th
											class="table-listings-column-120 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-white w-[40%]"
											>Item Name</th
										>
										<th
											class="table-listings-column-240 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-white"
											>Condition</th
										>
										<th
											class="table-listings-column-360 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-white"
											>Category</th
										>
										<th
											class="table-listings-column-480 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-white"
											>Price</th
										>
										<th
											class="table-listings-column-600 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-white"
											>Image Preview</th
										>
										<th
											class="table-listings-column-720 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-white"
											>Actions</th
										>
									</tr>
								</thead>
								<tbody>
									{#each filteredProducts as product}
										<tr class="border-t border-t-[#314d68]">
											<td
												class="table-listings-column-120 px-4 py-3 text-sm font-normal leading-normal text-white"
											>
												{product.name || '-'}
											</td>
											<td
												class="table-listings-column-240 px-4 py-3 text-sm font-normal leading-normal"
											>
												<span
													class="inline-flex items-center rounded-full bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-200"
												>
													{getProductConditionLabel(product.product_condition)}
												</span>
											</td>
											<td
												class="table-listings-column-360 px-4 py-3 text-sm font-normal leading-normal text-[#90adcb]"
											>
												{getMerchantProductCategoryName(product)}
											</td>
											<td
												class="table-listings-column-480 px-4 py-3 text-sm font-normal leading-normal text-[#90adcb]"
											>
												{formatPrice(product.retail_price)}
											</td>
											<td class="table-listings-column-600 px-4 py-3">
												{#if product.img_url}
													<img
														src={product.img_url.startsWith('http')
															? product.img_url
															: PHX_HTTP_PROTOCOL + PHX_ENDPOINT + product.img_url}
														alt={product.name || 'Product image'}
														class="w-16 h-16 object-cover rounded-lg border border-[#314d68]"
													/>
												{:else}
													<div
														class="w-16 h-16 bg-gray-700 rounded-lg border border-[#314d68] flex items-center justify-center"
													>
														<span class="text-gray-500 text-xs">No image</span>
													</div>
												{/if}
											</td>
											<td
												class="table-listings-column-720 px-4 py-3 text-sm font-medium leading-normal"
											>
												<div class="flex items-center gap-4">
													<button
														class="text-[#0d80f2] hover:underline cursor-pointer bg-transparent border-none p-0"
														on:click={() => window.open(`/products/${product.id}`, '_blank')}
													>
														View
													</button>
													<button
														class="text-[#0d80f2] hover:underline cursor-pointer bg-transparent border-none p-0"
														on:click={() => openEditProductModal(product)}
													>
														Edit
													</button>
													<button
														class="text-red-500 hover:underline cursor-pointer bg-transparent border-none p-0"
														on:click={() => {
															deleteProduct(product.id);
														}}
													>
														Delete
													</button>
												</div>
											</td>
										</tr>
									{:else}
										<tr>
											<td colspan="6" class="px-4 py-8 text-center text-[#90adcb] text-sm"
												>No listings found</td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						<style>
							@container (max-width:120px) {
								.table-listings-column-120 {
									display: none;
								}
							}
							@container (max-width:240px) {
								.table-listings-column-240 {
									display: none;
								}
							}
							@container (max-width:360px) {
								.table-listings-column-360 {
									display: none;
								}
							}
							@container (max-width:480px) {
								.table-listings-column-480 {
									display: none;
								}
							}
							@container (max-width:600px) {
								.table-listings-column-600 {
									display: none;
								}
							}
							@container (max-width:720px) {
								.table-listings-column-720 {
									display: none;
								}
							}
						</style>
					</div>
				{:else if activeTab === 'orders'}
					<div class="flex flex-wrap justify-between gap-3 p-4">
						<div class="flex min-w-72 flex-col gap-3">
							<p class="text-white tracking-light text-[32px] font-bold leading-tight">Orders</p>
							<p class="text-[#90adcb] text-sm font-normal leading-normal">
								View and manage your orders.
							</p>
						</div>
					</div>

					<!-- Order Filter -->
					<div class="flex items-center gap-4 px-4 pb-3">
						<div class="flex items-center gap-2">
							<label class="text-sm font-medium text-white" for="order-status-filter">Filter:</label
							>
							<select
								class="rounded-lg border border-[#314d68] bg-[#182634] pr-8 text-sm text-white focus:border-[#0d80f2] focus:ring-[#0d80f2]"
								id="order-status-filter"
								bind:value={orderStatusFilter}
							>
								<option value="All">All Orders</option>
								<option value="Active">Active Orders</option>
								<option value="History">Order History</option>
							</select>
						</div>
					</div>

					<!-- Orders Table -->
					<div class="px-4 py-3 @container">
						<div class="flex overflow-hidden rounded-lg border border-[#314d68] bg-[#101a23]">
							<table class="w-full flex-1">
								<thead>
									<tr class="bg-[#182634]">
										<th class="px-4 py-3 text-left text-sm font-medium text-white">Order ID</th>
										<th class="px-4 py-3 text-left text-sm font-medium text-white">Customer</th>
										<th class="px-4 py-3 text-left text-sm font-medium text-white">Items</th>
										<th class="px-4 py-3 text-left text-sm font-medium text-white">Total</th>
										<th class="px-4 py-3 text-left text-sm font-medium text-white">Status</th>
										<th class="px-4 py-3 text-left text-sm font-medium text-white">Date</th>
										<th class="px-4 py-3 text-left text-sm font-medium text-white">Actions</th>
									</tr>
								</thead>
								<tbody>
									{#each filteredOrders as order}
										<tr class="border-t border-t-[#314d68]">
											<td class="px-4 py-3 text-sm font-normal text-white">
												#{order.id}
											</td>
											<td class="px-4 py-3 text-sm font-normal text-white">
												{order.user?.fullname || order.user?.email || order.user?.username || 'N/A'}
											</td>
											<td class="px-4 py-3 text-sm font-normal text-[#90adcb]">
												{#if order.sales_items && order.sales_items.length > 0}
													{order.sales_items.length} item{order.sales_items.length !== 1 ? 's' : ''}
												{:else}
													-
												{/if}
											</td>
											<td class="px-4 py-3 text-sm font-normal text-[#90adcb]">
												{formatPrice(order.grand_total)}
											</td>
											<td class="px-4 py-3 text-sm font-normal">
												<span
													class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusBadgeClass(
														order.status
													)}"
												>
													{getStatusDisplayName(order.status)}
												</span>
											</td>
											<td class="px-4 py-3 text-sm font-normal text-[#90adcb]">
												{formatDate(order.inserted_at)}
											</td>
											<td class="px-4 py-3 text-sm font-medium">
												<div class="flex items-center gap-2">
													{#if getNextStatusOptions(order.status).length > 0}
														<select
															class="rounded-lg border border-[#314d68] bg-[#182634] text-xs text-white focus:border-[#0d80f2] focus:ring-[#0d80f2]"
															disabled={isUpdatingStatus}
															on:change={(e) => {
																if (e.target.value) {
																	updateOrderStatus(order.id, e.target.value);
																	e.target.value = '';
																}
															}}
														>
															<option value="">Update Status</option>
															{#each getNextStatusOptions(order.status) as statusOption}
																<option value={statusOption}
																	>{getStatusDisplayName(statusOption)}</option
																>
															{/each}
														</select>
													{/if}
													<button
														class="text-[#0d80f2] hover:underline cursor-pointer bg-transparent border-none p-0 text-xs"
														on:click={() => window.open(`/sales/${order.id}/details`, '_blank')}
													>
														View
													</button>
												</div>
											</td>
										</tr>
									{:else}
										<tr>
											<td colspan="7" class="px-4 py-8 text-center text-[#90adcb] text-sm"
												>No orders found</td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{:else if activeTab === 'analytics'}
					<div class="flex flex-wrap justify-between gap-3 p-4">
						<div class="flex min-w-72 flex-col gap-3">
							<p class="text-white tracking-light text-[32px] font-bold leading-tight">Analytics</p>
							<p class="text-[#90adcb] text-sm font-normal leading-normal">
								Track your sales performance and insights.
							</p>
						</div>
					</div>
					<div class="flex items-center justify-center p-8">
						<p class="text-[#90adcb] text-base">Analytics content placeholder</p>
					</div>
				{:else if activeTab === 'settings'}
					<div class="flex flex-wrap justify-between gap-3 p-4">
						<div class="flex min-w-72 flex-col gap-3">
							<p class="text-white tracking-light text-[32px] font-bold leading-tight">
								Merchant Profile
							</p>
							<p class="text-[#90adcb] text-sm font-normal leading-normal">
								Update your crypto wallet address and social contact details.
							</p>
						</div>
					</div>
					<div class="p-4">
						<div class="bg-[#223649] rounded-xl p-4 sm:p-8">
							{#if merchantProfileError}
								<p class="text-red-400 text-sm mb-4">{merchantProfileError}</p>
							{/if}

							<form
								id="merchant-profile-form"
								class="flex flex-col gap-6"
								on:submit={handleMerchantProfileSubmit}
							>
								<input type="hidden" name="model" value={merchantModule} />
								<input type="hidden" name="Merchant[id]" value={merchant.id || merchant_id || 0} />
								{#if merchant.user_id}
									<input type="hidden" name="Merchant[user_id]" value={merchant.user_id} />
								{/if}

								<section>
									<h2
										class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-2 pb-3 pt-2"
									>
										Merchant Image
									</h2>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div class="md:col-span-2">
											{#if merchantProfileImageError}
												<p class="text-red-400 text-sm mb-2">{merchantProfileImageError}</p>
											{/if}

											{#if merchantProfileImagePreviewUrl}
												<div class="mb-3">
													<p class="text-xs text-[#90adcb] mb-2">Preview:</p>
													<img
														src={merchantProfileImagePreviewUrl}
														alt="Selected merchant"
														class="w-24 h-24 object-cover rounded-lg border border-[#314d68]"
													/>
												</div>
											{:else if merchant?.img_url || merchant?.logo}
												<div class="mb-3">
													<p class="text-xs text-[#90adcb] mb-2">Current image:</p>
													<img
														src={getAbsoluteImageUrl(merchant?.img_url || merchant?.logo)}
														alt="Current merchant"
														class="w-24 h-24 object-cover rounded-lg border border-[#314d68]"
													/>
												</div>
											{/if}

											<label
												class="flex flex-col items-center justify-center w-full h-40 border-2 border-[#314d68] border-dashed rounded-lg cursor-pointer bg-[#101a23] hover:bg-[#182634] transition-colors"
												for="merchant-img-upload"
											>
												<div class="flex flex-col items-center justify-center pt-2 pb-2">
													<span class="material-symbols-outlined text-2xl text-gray-400 mb-2"
														>cloud_upload</span
													>
													{#if merchantProfileUploadedImageName}
														<p class="mb-1 text-xs text-white font-semibold">
															{merchantProfileUploadedImageName}
														</p>
													{:else}
														<p class="mb-1 text-xs text-gray-400">Click to upload</p>
													{/if}
													<p class="text-xs text-gray-500">JPG or PNG (MAX. 5MB)</p>
												</div>
												<input
													name="Merchant[img_url]"
													class="hidden"
													id="merchant-img-upload"
													type="file"
													accept=".jpg,.jpeg,.png"
													on:change={handleMerchantProfileImageChange}
												/>
											</label>
										</div>
									</div>
								</section>

								<div class="border-b border-solid border-white/10 my-2" />

								<section>
									<h2
										class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-2 pb-3 pt-2"
									>
										Crypto Wallet Address
									</h2>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
									
									
										<label class="flex flex-col min-w-40 flex-1 md:col-span-2">
										
											<input
												name="Merchant[bank_account_no]"
												class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-[#101a23] focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
												placeholder="Wallet address"
												type="text"
												bind:value={merchantProfileForm.bank_account_no}
											/>
										</label>
									</div>
								</section>

								<div class="border-b border-solid border-white/10 my-2" />

								<section>
									<h2
										class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-2 pb-3 pt-2"
									>
										Social Contact (Optional)
									</h2>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
										<label class="flex flex-col min-w-40 flex-1">
											<p class="text-base text-white font-medium leading-normal pb-2">LINE ID</p>
											<input
												name="Merchant[line_id]"
												class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-[#101a23] focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
												placeholder="line_id"
												type="text"
												bind:value={merchantProfileForm.line_id}
											/>
										</label>
										<label class="flex flex-col min-w-40 flex-1">
											<p class="text-base text-white font-medium leading-normal pb-2">
												Facebook URL
											</p>
											<input
												name="Merchant[facebook_url]"
												class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-[#101a23] focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
												placeholder="https://facebook.com/..."
												type="url"
												bind:value={merchantProfileForm.facebook_url}
											/>
										</label>
										<label class="flex flex-col min-w-40 flex-1">
											<p class="text-base text-white font-medium leading-normal pb-2">
												Instagram ID
											</p>
											<input
												name="Merchant[instagram_id]"
												class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-[#101a23] focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
												placeholder="instagram_id"
												type="text"
												bind:value={merchantProfileForm.instagram_id}
											/>
										</label>
										<label class="flex flex-col min-w-40 flex-1">
											<p class="text-base text-white font-medium leading-normal pb-2">
												Twitter/X URL
											</p>
											<input
												name="Merchant[twitter_url]"
												class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-[#101a23] focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
												placeholder="https://x.com/..."
												type="url"
												bind:value={merchantProfileForm.twitter_url}
											/>
										</label>
										<label class="flex flex-col min-w-40 flex-1">
											<p class="text-base text-white font-medium leading-normal pb-2">
												YouTube URL
											</p>
											<input
												name="Merchant[youtube_url]"
												class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-[#101a23] focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
												placeholder="https://youtube.com/..."
												type="url"
												bind:value={merchantProfileForm.youtube_url}
											/>
										</label>
										<label class="flex flex-col min-w-40 flex-1">
											<p class="text-base text-white font-medium leading-normal pb-2">TikTok URL</p>
											<input
												name="Merchant[tiktok_url]"
												class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-[#101a23] focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
												placeholder="https://tiktok.com/@..."
												type="url"
												bind:value={merchantProfileForm.tiktok_url}
											/>
										</label>
										<label class="flex flex-col min-w-40 flex-1">
											<p class="text-base text-white font-medium leading-normal pb-2">
												Pinterest URL
											</p>
											<input
												name="Merchant[pinterest_url]"
												class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-[#101a23] focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
												placeholder="https://pinterest.com/..."
												type="url"
												bind:value={merchantProfileForm.pinterest_url}
											/>
										</label>
										<label class="flex flex-col min-w-40 flex-1">
											<p class="text-base text-white font-medium leading-normal pb-2">
												LinkedIn URL
											</p>
											<input
												name="Merchant[linkedin_url]"
												class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-[#101a23] focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
												placeholder="https://linkedin.com/in/..."
												type="url"
												bind:value={merchantProfileForm.linkedin_url}
											/>
										</label>
										<label class="flex flex-col min-w-40 flex-1">
											<p class="text-base text-white font-medium leading-normal pb-2">GitHub URL</p>
											<input
												name="Merchant[github_url]"
												class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-[#101a23] focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
												placeholder="https://github.com/..."
												type="url"
												bind:value={merchantProfileForm.github_url}
											/>
										</label>
										<label class="flex flex-col min-w-40 flex-1">
											<p class="text-base text-white font-medium leading-normal pb-2">
												WhatsApp Number
											</p>
											<input
												name="Merchant[whatsapp_number]"
												class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-[#101a23] focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
												placeholder="+6012..."
												type="tel"
												bind:value={merchantProfileForm.whatsapp_number}
											/>
										</label>
										<label class="flex flex-col min-w-40 flex-1">
											<p class="text-base text-white font-medium leading-normal pb-2">
												WeChat Number
											</p>
											<input
												name="Merchant[wechat_number]"
												class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-[#101a23] focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
												placeholder="wechat_number"
												type="text"
												bind:value={merchantProfileForm.wechat_number}
											/>
										</label>
									</div>
								</section>

								<div class="flex justify-end pt-2">
									<button
										type="submit"
										disabled={merchantProfileSubmitting}
										class="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#0d80f2] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#0b6fd1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										<span class="truncate"
											>{merchantProfileSubmitting ? 'Saving...' : 'Save Changes'}</span
										>
									</button>
								</div>
							</form>
						</div>
					</div>
				{:else if activeTab === 'help'}
					<div class="flex flex-wrap justify-between gap-3 p-4">
						<div class="flex min-w-72 flex-col gap-3">
							<p class="text-white tracking-light text-[32px] font-bold leading-tight">
								Help and Support
							</p>
							<p class="text-[#90adcb] text-sm font-normal leading-normal">
								Get help and support for your merchant account.
							</p>
						</div>
					</div>
					<div class="flex items-center justify-center p-8">
						<p class="text-[#90adcb] text-base">Help and Support content placeholder</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Add/Edit Product Modal -->
<Modal
	bind:open={showProductModal}
	size="xl"
	autoclose={false}
	class="w-full bg-black "
	color="black"
	outsideclose
>
	<div slot="header" class="text-white text-xl font-bold">
		{isEditMode ? 'Edit Product Listing' : 'Add New Product Listing'}
	</div>

	<form id="product-form" class="flex flex-col gap-6" on:submit={handleSubmit}>
		<input type="hidden" name="model" value={module} />
		<input type="hidden" name="MerchantProduct[merchant_id]" value={data.merchant_id} />
		<!-- Hidden fields (UI removed, but keep values stable on submit) -->
		<input type="hidden" name="MerchantProduct[brand_name]" value={formData.brand_name} />
		<input type="hidden" name="MerchantProduct[point_value]" value={formData.point_value} />
		<input type="hidden" name="MerchantProduct[override_pv]" value={formData.override_pv} />
		{#if isEditMode && selectedProduct}
			<input type="hidden" name="MerchantProduct[id]" value={selectedProduct.id} />
		{:else}
			<input type="hidden" name="MerchantProduct[id]" value="0" />
		{/if}

		<!-- Product Name -->
		<div>
			<Label for="name" class="text-white mb-2"
				>Product Name <span class="text-red-500">*</span></Label
			>
			<Input
				id="name"
				name="MerchantProduct[name]"
				type="text"
				placeholder="Enter product name"
				bind:value={formData.name}
				color={errors.name ? 'red' : 'base'}
				class="w-full"
			/>
			{#if errors.name}
				<p class="text-red-500 text-sm mt-1">{errors.name}</p>
			{/if}
		</div>

		<!-- Category -->
		<div>
			<Label for="merchant_product_category_id" class="text-white mb-2">Category</Label>
			<select
				id="merchant_product_category_id"
				name="MerchantProduct[merchant_product_category_id]"
				bind:value={formData.merchant_product_category_id}
				class="block w-full rounded-lg border border-[#314d68] bg-[#182634] p-2 text-sm text-white placeholder-gray-400 focus:border-[#0d80f2] focus:ring-[#0d80f2]"
			>
				<option value="">Select a category</option>
				{#each merchantProductCategories as category}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
		</div>

		<!-- Product Condition -->
		<div>
			<Label for="product_condition" class="text-white mb-2">Product Condition</Label>
			<select
				id="product_condition"
				name="MerchantProduct[product_condition]"
				bind:value={formData.product_condition}
				class="block w-full rounded-lg border border-[#314d68] bg-[#182634] p-2 text-sm text-white placeholder-gray-400 focus:border-[#0d80f2] focus:ring-[#0d80f2]"
			>
				<option value="new">New</option>
				<option value="like_new">Like new</option>
				<option value="used">Used</option>
			</select>
		</div>

		<!-- Description -->
		<div>
			<Label for="description" class="text-white mb-2"
				>Description <span class="text-red-500">*</span></Label
			>
			<Textarea
				id="description"
				name="MerchantProduct[description]"
				placeholder="Enter product description"
				bind:value={formData.description}
				color={errors.description ? 'red' : 'base'}
				class="w-full"
				rows="4"
			/>
			{#if errors.description}
				<p class="text-red-500 text-sm mt-1">{errors.description}</p>
			{/if}
		</div>

		<!-- Short Description -->
		<div>
			<Label for="short_desc" class="text-white mb-2">Short Description</Label>
			<Textarea
				id="short_desc"
				name="MerchantProduct[short_desc]"
				placeholder="Enter short description"
				bind:value={formData.short_desc}
				class="w-full"
				rows="2"
			/>
		</div>

		<!-- Price and Point Value -->
		<div class="grid grid-cols-1 gap-4">
			<div>
				<Label for="retail_price" class="text-white mb-2"
					>Retail Price <span class="text-red-500">*</span></Label
				>
				<Input
					id="retail_price"
					name="MerchantProduct[retail_price]"
					type="number"
					step="0.01"
					placeholder="0.00"
					bind:value={formData.retail_price}
					color={errors.retail_price ? 'red' : 'base'}
					class="w-full"
				/>
				{#if errors.retail_price}
					<p class="text-red-500 text-sm mt-1">{errors.retail_price}</p>
				{/if}
			</div>
		</div>

		<!-- Product Images -->
		<div>
			<Label class="text-white mb-2"
				>Product Images {#if !isEditMode}<span class="text-red-500">*</span>{/if}</Label
			>
			<div class="grid grid-cols-2 gap-4">
				<!-- Image 1 (Required for new products) -->
				<div>
					<Label for="img_url" class="text-white text-sm mb-2"
						>Main Image {#if !isEditMode}<span class="text-red-500">*</span>{/if}</Label
					>
					{#if isEditMode && selectedProduct?.img_url}
						<div class="mb-2">
							<p class="text-xs text-gray-400 mb-1">Current image:</p>
							<img
								src={selectedProduct.img_url.startsWith('http')
									? selectedProduct.img_url
									: PHX_HTTP_PROTOCOL + PHX_ENDPOINT + selectedProduct.img_url}
								alt="Current"
								class="w-20 h-20 object-cover rounded-lg border border-[#314d68]"
							/>
						</div>
					{/if}
					<label
						class="flex flex-col items-center justify-center w-full h-32 border-2 {errors.img_url
							? 'border-red-500'
							: 'border-gray-600'} border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors"
						for="img_url"
					>
						<div class="flex flex-col items-center justify-center pt-2 pb-2">
							<span class="material-symbols-outlined text-2xl text-gray-400 mb-2">cloud_upload</span
							>
							{#if uploadedFileNames.img_url}
								<p class="mb-1 text-xs text-white font-semibold">{uploadedFileNames.img_url}</p>
							{:else}
								<p class="mb-1 text-xs text-gray-400">Click to upload</p>
							{/if}
							<p class="text-xs text-gray-500">JPG or PNG (MAX. 5MB)</p>
						</div>
						<input
							name="MerchantProduct[img_url]"
							class="hidden"
							id="img_url"
							type="file"
							accept=".jpg,.jpeg,.png"
							on:change={(e) => handleImageChange(e, 'img_url')}
						/>
					</label>
					{#if errors.img_url}
						<p class="text-red-500 text-sm mt-1">{errors.img_url}</p>
					{/if}
				</div>

				<!-- Image 2 -->
				<div>
					<Label for="img_url2" class="text-white text-sm mb-2">Image 2</Label>
					<label
						class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors"
						for="img_url2"
					>
						<div class="flex flex-col items-center justify-center pt-2 pb-2">
							<span class="material-symbols-outlined text-2xl text-gray-400 mb-2">cloud_upload</span
							>
							{#if uploadedFileNames.img_url2}
								<p class="mb-1 text-xs text-white font-semibold">{uploadedFileNames.img_url2}</p>
							{:else}
								<p class="mb-1 text-xs text-gray-400">Click to upload</p>
							{/if}
							<p class="text-xs text-gray-500">JPG or PNG (MAX. 5MB)</p>
						</div>
						<input
							name="MerchantProduct[img_url2]"
							class="hidden"
							id="img_url2"
							type="file"
							accept=".jpg,.jpeg,.png"
							on:change={(e) => handleImageChange(e, 'img_url2')}
						/>
					</label>
				</div>

				<!-- Image 3 -->
				<div>
					<Label for="img_url3" class="text-white text-sm mb-2">Image 3</Label>
					<label
						class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors"
						for="img_url3"
					>
						<div class="flex flex-col items-center justify-center pt-2 pb-2">
							<span class="material-symbols-outlined text-2xl text-gray-400 mb-2">cloud_upload</span
							>
							{#if uploadedFileNames.img_url3}
								<p class="mb-1 text-xs text-white font-semibold">{uploadedFileNames.img_url3}</p>
							{:else}
								<p class="mb-1 text-xs text-gray-400">Click to upload</p>
							{/if}
							<p class="text-xs text-gray-500">JPG or PNG (MAX. 5MB)</p>
						</div>
						<input
							name="MerchantProduct[img_url3]"
							class="hidden"
							id="img_url3"
							type="file"
							accept=".jpg,.jpeg,.png"
							on:change={(e) => handleImageChange(e, 'img_url3')}
						/>
					</label>
				</div>

				<!-- Image 4 -->
				<div>
					<Label for="img_url4" class="text-white text-sm mb-2">Image 4</Label>
					<label
						class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors"
						for="img_url4"
					>
						<div class="flex flex-col items-center justify-center pt-2 pb-2">
							<span class="material-symbols-outlined text-2xl text-gray-400 mb-2">cloud_upload</span
							>
							{#if uploadedFileNames.img_url4}
								<p class="mb-1 text-xs text-white font-semibold">{uploadedFileNames.img_url4}</p>
							{:else}
								<p class="mb-1 text-xs text-gray-400">Click to upload</p>
							{/if}
							<p class="text-xs text-gray-500">JPG or PNG (MAX. 5MB)</p>
						</div>
						<input
							name="MerchantProduct[img_url4]"
							class="hidden"
							id="img_url4"
							type="file"
							accept=".jpg,.jpeg,.png"
							on:change={(e) => handleImageChange(e, 'img_url4')}
						/>
					</label>
				</div>
			</div>
		</div>
	</form>

	<svelte:fragment slot="footer">
		<div class="flex justify-end gap-3">
			<Button color="gray" on:click={closeProductModal} disabled={isSubmitting}>Cancel</Button>
			<Button
				color="blue"
				disabled={isSubmitting}
				on:click={() => {
					const form = document.getElementById('product-form');
					if (form) {
						form.requestSubmit();
					}
				}}
			>
				{isSubmitting
					? isEditMode
						? 'Saving...'
						: 'Submitting...'
					: isEditMode
					? 'Save Changes'
					: 'Submit Product'}
			</Button>
		</div>
	</svelte:fragment>
</Modal>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

	.material-symbols-outlined {
		font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
	}
</style>
