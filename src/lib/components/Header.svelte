<script>
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session';
	import { cartItems } from '$lib/stores/cart';
	import { Icon } from 'flowbite-svelte-icons';
	import { DarkMode, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { pageTitle, pageHref } from '$lib/stores/pageTitle';

	export let showSearch = false;
	export let showWishlist = false;
	export let showApplyMerchant = false;
	export let showDarkMode = false;
	export let showMobileMenu = false;
	export let navigationItems = []; // Simple navigation items: [{ label: 'Home', href: '/' }, ...]
	export let menus = []; // MENUS array for dynamic navigation
	export let appRoutes = []; // app_routes array for dynamic navigation
	export let logoText = 'ReCrafted';
	export let logoHref = '/';
	export let onLogout = null; // Callback function for logout

	let searchQuery = '';
	let mobileMenuOpen = false;
	let cartCount = 0;
	let isLoggedIn = false;
	let user = null;
	let userInitials = '';
	let loggedIn = 'false';

	$: cartCount = $cartItems.reduce((sum, item) => sum + item.qty, 0);
	$: isLoggedIn = $session?.loggedIn || false;
	$: user = $session?.user || null;
	$: loggedIn = isLoggedIn ? 'true' : 'false';
	$: hasMenus = menus.length > 0 && appRoutes.length > 0;
	$: hasNavigationItems = navigationItems.length > 0;

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



	function goToLogin() {
		goto('/login');
	}

	function goToCart() {
		goto('/cart');
	}




	function goToProfile() {
		if (isLoggedIn && user?.id) {
			goto(`/users/${user.id}/profile`);
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

	function handleDropdownItemClick(title, href) {
		document.title = title;
		pageTitle.set(title);
		pageHref.set(href);
		mobileMenuOpen = false;
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function logOut() {
		if (onLogout) {
			onLogout();
		} else {
			session.logout();
			goto('/');
		}
		mobileMenuOpen = false;
	}

	// Root header styling (applied to all pages)
	const headerClass =
		'bg-[#101623] flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#212f4a] px-10 py-3';
	const navLinkClass =
		'text-white text-sm font-medium leading-normal hover:text-[#8ea3cc] transition-colors cursor-pointer bg-transparent border-none';
	const searchInputClass =
		'form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#212f4a] focus:border-none h-full placeholder:text-[#8ea3cc] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal';
	const buttonClass =
		'flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#212f4a] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-[#2a3d5a] transition-colors';
	const iconButtonClass = 'relative p-2 text-white hover:text-[#8ea3cc] transition-colors';
	const mobileMenuClass = 'md:hidden border-b border-solid border-b-[#212f4a] px-6 py-4 space-y-3';
	const mobileLinkClass =
		'block text-sm font-medium text-white hover:text-[#8ea3cc] transition-colors';
</script>

<header class={headerClass}>
	<div class="flex items-center gap-8">
		<a
			href={logoHref}
			class="flex items-center gap-4 text-white hover:opacity-80 transition-opacity"
		>
			<div class="size-4">
				<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
						fill="currentColor"
					/>
				</svg>
			</div>
			<h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em]">{logoText}</h2>
		</a>

		<!-- Desktop Navigation -->
		<div class="hidden md:flex items-center gap-9">
			{#if hasNavigationItems}
				<!-- Simple Navigation Items -->
				{#each navigationItems as item}
					<button class={navLinkClass} on:click={() => goto(item.href)}>
						{item.label}
					</button>
				{/each}
			{/if}
		</div>
	</div>

	<div class="flex flex-1 justify-end gap-8">
		{#if showSearch}
			<label class="flex flex-col min-w-40 !h-10 max-w-64">
				<div class="flex w-full flex-1 items-stretch rounded-lg h-full">
					<div
						class="text-[#8ea3cc] flex border-none bg-[#212f4a] items-center justify-center pl-4 rounded-l-lg border-r-0"
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
						class={searchInputClass}
						placeholder="Search"
						bind:value={searchQuery}
						on:keydown={handleSearch}
					/>
				</div>
			</label>
		{/if}

		{#if showApplyMerchant && !isLoggedIn}
			<button
				class="text-white text-sm font-medium leading-normal flex items-center px-4 py-2 rounded-lg hover:bg-[#212f4a] transition-colors cursor-pointer bg-transparent border-none"
				on:click={() => goto('/merchants/apply')}
			>
				Apply as Merchant
			</button>
		{/if}

		<div class="flex gap-2">
			{#if showWishlist}
				<button class={buttonClass}>
					<div class="text-white">
						<svg
							fill="currentColor"
							height="20px"
							viewBox="0 0 256 256"
							width="20px"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z"
							/>
						</svg>
					</div>
				</button>
			{/if}

			<div class="relative">
				{#if cartCount > 0}
					<span
						class="absolute -top-1 -right-1 bg-[#1f68f9] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
					>
						{cartCount}
					</span>
				{/if}
				<button class={buttonClass} on:click={goToCart}>
					<div class="text-white">
						<svg
							fill="currentColor"
							height="20px"
							viewBox="0 0 256 256"
							width="20px"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z"
							/>
						</svg>
					</div>
				</button>
			</div>
		</div>

		<!-- Desktop Action Buttons -->
		<div class="hidden md:flex items-center gap-3">
			{#if hasMenus}
				<!-- Profile Icon (for pages with menus) -->
				<button on:click={goToProfile} class={iconButtonClass} aria-label="Profile">
					<Icon name="user-circle-solid" class="w-6 h-6" />
				</button>
			{/if}

			{#if showDarkMode}
				<DarkMode />
			{/if}
		</div>

		<!-- Mobile Action Buttons -->
		{#if showMobileMenu}
			<div class="md:hidden flex items-center gap-3">
				<!-- Cart Icon with Badge -->
				<button on:click={goToCart} class={iconButtonClass} aria-label="Shopping Cart">
					<Icon name="shopping-cart-solid" class="w-6 h-6" />
					{#if cartCount > 0}
						<span
							class="absolute -top-1 -right-1 bg-[#1f68f9] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
						>
							{cartCount}
						</span>
					{/if}
				</button>

				{#if showDarkMode}
					<DarkMode />
				{/if}

				<!-- Mobile Menu Button -->
				<button on:click={toggleMobileMenu} class={iconButtonClass} aria-label="Menu">
					{#if mobileMenuOpen}
						<!-- Close icon (X) -->
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					{:else}
						<!-- Hamburger icon -->
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					{/if}
				</button>
			</div>
		{/if}

		{#if isLoggedIn && user && !hasMenus}
			<!-- User Avatar (for pages without menus) -->
			<button
				class="px-3 bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 flex items-center justify-center text-white font-semibold text-sm bg-[#1f68f9] hover:bg-[#1a5ae0] transition-colors cursor-pointer"
				on:click={goToProfile}
				title={user.username}
			>
				{userInitials}
			</button>
		{:else if !hasMenus && !showMobileMenu}
			<!-- Login Button (for pages without menus, desktop only) -->
			<button
				class="hidden md:block px-3 bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-[#212f4a] flex items-center justify-center cursor-pointer hover:bg-[#2a3d5a] transition-colors border-none"
				on:click={goToLogin}
				aria-label="Sign in"
			>
				<Icon name="user-circle-solid" class="size-5 text-[#8ea3cc]" />
			</button>
		{/if}
	</div>
</header>

<!-- Mobile Menu -->
{#if showMobileMenu && mobileMenuOpen}
	<div class={mobileMenuClass}>
		{#if $session?.user?.merchant_id}
			<a
				href="/merchants/{$session.user.merchant_id}/profile"
				class={mobileLinkClass}
				on:click={toggleMobileMenu}>Profile</a
			>
		{/if}
		<a href="/shop" class={mobileLinkClass} on:click={toggleMobileMenu}>Shop</a>
		<a href="/cart" class={mobileLinkClass} on:click={toggleMobileMenu}>Cart</a>
		{#each menus as menu}
			{#if !menu.hidden}
				{#if menu.children}
					{#if appRoutes.some((app_route) => app_route.name === menu.title)}
						<div class="space-y-2">
							<div class="text-sm font-medium text-white">{menu.title}</div>
							<div class="pl-4 space-y-2">
								{#each menu.children as child}
									{#if appRoutes.some((app_route) => app_route.route === child.path)}
										<a
											href={child.path}
											class="block text-sm text-[#8ea3cc] hover:text-white transition-colors"
											on:click={() => handleDropdownItemClick(child.title, child.path)}
										>
											{child.title}
										</a>
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				{:else if appRoutes.some((app_route) => app_route.route === menu.path)}
					<a
						href={menu.path}
						class={mobileLinkClass}
						on:click={() => handleDropdownItemClick(menu.title, menu.path)}
					>
						{menu.title}
					</a>
				{/if}
			{/if}
		{/each}
		{#if loggedIn === 'true' || $session?.loggedIn}
			<button on:click={logOut} class="block w-full text-left {mobileLinkClass}">Logout</button>
		{/if}
	</div>
{/if}
