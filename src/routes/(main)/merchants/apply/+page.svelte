<script>
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
    import { Alert } from "flowbite-svelte";
	import { postData } from '$lib/index.js';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';
	import { onMount } from 'svelte';

	/** @type {import('./$types').PageData} */
	export let data;
    const user_id = data?.user_id || 0;
	const navigationItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Shop', href: '/shop' },
		{ label: 'Sell', href: '/merchants/apply' },
		{ label: 'Community', href: '#' }
	];

	// Check if merchant already exists (non-reactive, just for checking)
	const merchant = data?.merchant || {};
    console.log('merchant', merchant);
	

	// Form state - initialize with empty values
	let formData = {
		name: '',
		company_address: '',
		company_email: '',
		company_phone: '',
		company_reg_no: '',
		company_ssm_image: null,
		commission_perc: '',
		description: '',
		img_url: null, // Logo
		bank_name: '',
		bank_account_no: '',
		bank_account_holder: '',
		termsAccepted: false
	};

	// Initialize formData once when component mounts with merchant data (if available)
	onMount(() => {
		if (merchant) {
			console.log('Initializing form with merchant data:', merchant);
			formData.name = merchant.name || '';
			formData.company_address = merchant.company_address || '';
			formData.company_email = merchant.company_email || '';
			formData.company_phone = merchant.company_phone || '';
			formData.company_reg_no = merchant.company_reg_no || '';
			formData.commission_perc = merchant.commission_perc || '';
			formData.description = merchant.description || '';
			formData.bank_name = merchant.bank_name || '';
			formData.bank_account_no = merchant.bank_account_no || '';
			formData.bank_account_holder = merchant.bank_account_holder || '';
		}
	});
    let module = 'Merchant';
	let uploadedLogoFileName = '';
	let uploadedSSMFileName = '';
	let isSubmitting = false;
	let errors = {};

	function validateFile(file, fieldName) {
		// Validate file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			errors[fieldName] = 'File size must be less than 5MB';
			return false;
		}
		// Validate file type
		const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
		if (!validTypes.includes(file.type)) {
			errors[fieldName] = 'File must be JPG or PNG';
			return false;
		}
		return true;
	}

	function handleLogoChange(event) {
		const file = event.target.files[0];
		if (file) {
			if (validateFile(file, 'img_url')) {
				formData.img_url = file;
				uploadedLogoFileName = file.name;
				errors.img_url = '';
			}
		}
	}

	function handleSSMImageChange(event) {
		const file = event.target.files[0];
		if (file) {
			if (validateFile(file, 'company_ssm_image_url')) {
				formData.company_ssm_image = file;
				uploadedSSMFileName = file.name;
				errors.company_ssm_image_url = '';
			}
		}
	}

	function validateForm() {
		errors = {};
		let isValid = true;

		// Required fields
		if (!formData.name.trim()) {
			errors.name = 'Name is required';
			isValid = false;
		}

		if (!formData.company_address.trim()) {
			errors.company_address = 'Company address is required';
			isValid = false;
		}

		if (!formData.company_email.trim()) {
			errors.company_email = 'Company email is required';
			isValid = false;
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)) {
			errors.company_email = 'Please enter a valid email address';
			isValid = false;
		}

		if (!formData.company_reg_no.trim()) {
			errors.company_reg_no = 'Company registration number is required';
			isValid = false;
		}

		if (!formData.description.trim()) {
			errors.description = 'Description is required';
			isValid = false;
		}

		if (!formData.img_url) {
			errors.img_url = 'Logo is required';
			isValid = false;
		}

		if (!formData.company_ssm_image) {
			errors.company_ssm_image_url = 'SSM image is required';
			isValid = false;
		}

		if (!formData.termsAccepted) {
			errors.termsAccepted = 'You must accept the terms and conditions';
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
         
			// Get form element and create FormData
			const form = document.getElementById('merchant-application-form');
			const formDataToSubmit = new FormData(form);

			// Submit application via HTTP form
			const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
			await postData(formDataToSubmit, {
				isFormData: true,
				endpoint: url + `/svt_api/${module}`,
				successCallback: () => {
					// Success - redirect to home
					goto('/merchants/apply');
				}
			});
		} catch (error) {
			console.error('Error submitting application:', error);
			alert('There was an error submitting your application. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		if (confirm('Are you sure you want to cancel? Your progress will be lost.')) {
			goto('/');
		}
	}

	function goToHome() {
		goto('/');
	}
</script>

<div class="relative flex h-auto min-h-screen w-full flex-col  bg-gray-900 dark:bg-background-dark group/design-root overflow-x-hidden" style='font-family: Manrope, "Noto Sans", sans-serif;'>
	<div class="layout-container flex h-full grow flex-col">
		<div class="px-4 sm:px-8 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
			<div class="layout-content-container flex flex-col max-w-[960px] flex-1">
				
				<main class="flex flex-col gap-8 py-10">
					<div class="flex flex-wrap justify-between gap-3 p-4">
						<p class="text-4xl font-black text-white leading-tight tracking-[-0.033em] min-w-72">Become a Merchant</p>
					</div>
                    {#if merchant && merchant.is_approved == false }
                   
                        <Alert color="yellow">
                            <span class="font-medium">Your application is pending review. Please wait for approval.</span>
                        </Alert>
                      {/if}

					<div class="bg-black/10 dark:bg-gray-800/50 rounded-xl p-4 sm:p-8">
						<form id="merchant-application-form" class="flex flex-col gap-6" on:submit={handleSubmit}>
							<input type="hidden" name="model" value={module} />
                            <input type="hidden" name="Merchant[user_id]" value={user_id} />
                            {#if merchant.id}
                                <input type="hidden" name={module}[id] value={merchant.id} />
                            {:else}
                                <input type="hidden" name={module}[id] value={0} />
                            {/if}
                            <section>
								<h2 class="text-[22px] font-bold text-white leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Company Information</h2>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
									<label class="flex flex-col min-w-40 flex-1">
										<p class="text-base text-white font-medium leading-normal pb-2">Name <span class="text-red-500">*</span></p>
										<input
											name={module}[name]
											class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border {errors.name ? 'border-red-500' : 'border-blue-700'} bg-gray-800 focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
											placeholder="Company Name"
											bind:value={formData.name}
											type="text"
										/>
										{#if errors.name}
											<p class="text-red-500 text-sm mt-1">{errors.name}</p>
										{/if}
									</label>
									<label class="flex flex-col min-w-40 flex-1">
										<p class="text-base text-white font-medium leading-normal pb-2">Company Email <span class="text-red-500">*</span></p>
										<input
											name="Merchant[company_email]"
											class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border {errors.company_email ? 'border-red-500' : 'border-blue-700'} bg-gray-800 focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
											placeholder="company@example.com"
											type="email"
											bind:value={formData.company_email}
										/>
										{#if errors.company_email}
											<p class="text-red-500 text-sm mt-1">{errors.company_email}</p>
										{/if}
									</label>
									<label class="flex flex-col min-w-40 flex-1">
										<p class="text-base text-white font-medium leading-normal pb-2">Company Phone</p>
										<input
											name="Merchant[company_phone]"
											class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-gray-800 focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
											placeholder="+1 (555) 000-0000"
											type="tel"
											bind:value={formData.company_phone}
										/>
									</label>
									<label class="flex flex-col min-w-40 flex-1">
										<p class="text-base text-white font-medium leading-normal pb-2">Company Registration Number <span class="text-red-500">*</span></p>
										<input
											name="Merchant[company_reg_no]"
											class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border {errors.company_reg_no ? 'border-red-500' : 'border-blue-700'} bg-gray-800 focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
											placeholder="Registration Number"
											bind:value={formData.company_reg_no}
										/>
										{#if errors.company_reg_no}
											<p class="text-red-500 text-sm mt-1">{errors.company_reg_no}</p>
										{/if}
									</label>
									<label class="flex flex-col min-w-40 flex-1 md:col-span-2">
										<p class="text-base text-white font-medium leading-normal pb-2">Company Address <span class="text-red-500">*</span></p>
										<textarea
											name="Merchant[company_address]"
											class="form-textarea text-white flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border {errors.company_address ? 'border-red-500' : 'border-blue-700'} bg-gray-800 focus:border-blue-600 min-h-[100px] p-[15px] text-base font-normal leading-normal"
											placeholder="Enter company address"
											bind:value={formData.company_address}
										></textarea>
										{#if errors.company_address}
											<p class="text-red-500 text-sm mt-1">{errors.company_address}</p>
										{/if}
									</label>
									<label class="flex flex-col min-w-40 flex-1 md:col-span-2">
										<p class="text-base text-white font-medium leading-normal pb-2">Description <span class="text-red-500">*</span></p>
										<textarea
											name="Merchant[description]"
											class="form-textarea  text-white flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border {errors.description ? 'border-red-500' : 'border-blue-700'} bg-gray-800 focus:border-blue-600 min-h-[120px] p-[15px] text-base font-normal leading-normal"
											placeholder="Describe your business..."
											bind:value={formData.description}
										></textarea>
										{#if errors.description}
											<p class="text-red-500 text-sm mt-1">{errors.description}</p>
										{/if}
									</label>
								
								</div>
							</section>
							<div class="border-b border-solid border-white/10 dark:border-b-blue-800 my-4"></div>
							<section>
								<h2 class="text-[22px] font-bold text-white leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Banking Information</h2>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
									<label class="flex flex-col min-w-40 flex-1">
										<p class="text-base text-white font-medium leading-normal pb-2">Bank Name</p>
										<input
											name="Merchant[bank_name]"
											class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-gray-800 focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
											placeholder="Bank Name"
											bind:value={formData.bank_name}
										/>
									</label>
									<label class="flex flex-col min-w-40 flex-1">
										<p class="text-base text-white font-medium leading-normal pb-2">Account Number</p>
										<input
											name="Merchant[bank_account_no]"
											class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-gray-800 focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
											placeholder="Account Number"
											bind:value={formData.bank_account_no}
										/>
									</label>
									<label class="flex flex-col min-w-40 flex-1 md:col-span-2">
										<p class="text-base text-white font-medium leading-normal pb-2">Account Holder Name</p>
										<input
											name="Merchant[bank_account_holder]"
											class="form-input text-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-blue-600/50 border border-blue-700 bg-gray-800 focus:border-blue-600 h-14 p-[15px] text-base font-normal leading-normal"
											placeholder="Account Holder Name"
											bind:value={formData.bank_account_holder}
										/>
									</label>
								</div>
							</section>
							<div class="border-b border-solid border-white/10 dark:border-b-blue-800 my-4"></div>
							<section>
								<h2 class="text-[22px] font-bold text-white leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Logo Upload</h2>
								<div class="p-4">
									<label
										class="flex flex-col items-center justify-center w-full h-64 border-2 {errors.img_url ? 'border-red-500' : 'border-blue-700'} border-dashed rounded-lg cursor-pointer bg-black/20 dark:bg-gray-800 hover:bg-black/30 dark:hover:bg-blue-800/60 transition-colors"
										for="logo-upload"
									>
										<div class="flex flex-col items-center justify-center pt-5 pb-6">
											<span class="material-symbols-outlined text-4xl mb-4 text-white	">cloud_upload</span>
											{#if uploadedLogoFileName}
												<p class="mb-2 text-sm font-semibold text-white">{uploadedLogoFileName}</p>
											{:else}
												<p class="mb-2 text-sm text-white">
													<span class="font-semibold ">Click to upload</span> or drag and drop
												</p>
											{/if}
											<p class="text-xs text-white">JPG or PNG (MAX. 5MB)</p>
										</div>
										<input
											name="Merchant[img_url]"
											class="hidden"
											id="logo-upload"
											type="file"
											accept=".jpg,.jpeg,.png"
											on:change={handleLogoChange}
										/>
									</label>
									{#if errors.img_url}
										<p class="mt-2 text-sm text-red-500">{errors.img_url}</p>
									{:else}
										<p class="mt-2 text-sm text-white">Please upload your company logo.</p>
									{/if}
								</div>
							</section>
							<div class="border-b border-solid border-white/10 dark:border-b-blue-800 my-4"></div>
							<section>
								<h2 class="text-[22px] font-bold text-white leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">SSM Document Upload</h2>
								<div class="p-4">
									<label
										class="flex flex-col items-center justify-center w-full h-64 border-2 {errors.company_ssm_image_url ? 'border-red-500' : 'border-blue-700'} border-dashed rounded-lg cursor-pointer bg-black/20 dark:bg-gray-800 hover:bg-black/30 dark:hover:bg-blue-800/60 transition-colors"
										for="ssm-upload"
									>
										<div class="flex flex-col items-center justify-center pt-5 pb-6">
											<span class="material-symbols-outlined text-4xl mb-4 text-white">cloud_upload</span>
											{#if uploadedSSMFileName}
												<p class="mb-2 text-sm font-semibold">{uploadedSSMFileName}</p>
											{:else}
												<p class="mb-2 text-sm text-white">
													<span class="font-semibold">Click to upload</span> or drag and drop
												</p>
											{/if}
											<p class="text-xs text-white">JPG or PNG (MAX. 5MB)</p>
										</div>
										<input
											name="Merchant[company_ssm_image_url]"
											class="hidden"
											id="ssm-upload"
											type="file"
											accept=".jpg,.jpeg,.png"
											on:change={handleSSMImageChange}
										/>
									</label>
									{#if errors.company_ssm_image_url}
										<p class="mt-2 text-sm text-red-500">{errors.company_ssm_image_url}</p>
									{:else}
										<p class="mt-2 text-sm text-white">Please upload a copy of your SSM document for verification.</p>
									{/if}
								</div>
							</section>
							<div class="px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-solid border-white/10 dark:border-t-[#223649] mt-6">
								<div class="flex items-start">
									<div class="flex items-center h-5">
										<input
											name="Merchant[terms_accepted]"
											aria-describedby="terms"
											class="w-4 h-4 border {errors.termsAccepted ? 'border-red-500' : 'border-blue-700'} rounded bg-gray-800 focus:ring-3 focus:ring-blue-600/50"
											id="terms"
											type="checkbox"
											bind:checked={formData.termsAccepted}
										/>
									</div>
									<div class="ml-3 text-sm text-white	">
										<label class="font-light" for="terms">
											I accept the
											<button type="button" class="font-medium hover:underline bg-transparent border-none cursor-pointer p-0">Terms and Conditions</button>
										</label>
									</div>
								</div>
								{#if errors.termsAccepted}
									<p class="text-red-500 text-sm">{errors.termsAccepted}</p>
								{/if}
								<div class="flex gap-4 text-white">
									<button
										class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-transparent border border-blue-700 hover:bg-blue-800 text-base font-bold leading-normal tracking-[0.015em] transition-colors"
										type="button"
										on:click={handleCancel}
										disabled={isSubmitting}
									>
										<span class="truncate">Cancel</span>
									</button>
									<button
										class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-blue-600 text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										type="submit"
										disabled={isSubmitting}
									>
										<span class="truncate">{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
									</button>
								</div>
							</div>
						</form>
					</div>
				</main>
			</div>
		</div>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap');
	@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

	.material-symbols-outlined {
		font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
	}
</style>
