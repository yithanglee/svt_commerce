<script>
	import { Toast, DarkMode, Button } from 'flowbite-svelte';
	import { PHX_COOKIE } from '$lib/constants';
	import { session } from '$lib/stores/session';
	import { isToastOpen } from '$lib/stores/toast';
	import { Icon } from 'flowbite-svelte-icons';
	import '../app.postcss';
	import { goto } from '$app/navigation';
	import {
		Dropdown,
		DropdownItem,
		Alert
	} from 'flowbite-svelte';
	import { onDestroy, onMount } from 'svelte';
	import Cookies from 'js-cookie';
	import { MENUS } from '$lib/constants';
	import { pageTitle, pageHref} from '$lib/stores/pageTitle'; // Import the shared store
	import { cartItems } from '$lib/stores/cart';
	import { page } from '$app/stores';

	/** @type {import('./$types').LayoutData} */
	export let data;

	let open = true,
		username = 'Svelte Admin',
		toastMessage = '',
		nav_class = 'hidden',
		loggedIn = 'false',
		app_routes = [],
		cartCount = 0,
		mobileMenuOpen = false;

	$: cartCount = $cartItems.reduce((sum, item) => sum + item.qty, 0);
	$: isHomePage = $page.url.pathname === '/';

	function logOut() {
		session.logout();
		loggedIn = 'false';
		Cookies.remove('user');
		Cookies.remove(PHX_COOKIE);
		goto('/');
	}

	function appendClass(existing_class) {
		return 'cursor-pointer ' + existing_class;
	}

	function goToCart() {
		goto('/cart');
	}

	function goToProfile() {
		if (loggedIn === 'true' || $session?.loggedIn) {
			// Navigate to merchant profile page
			if ($session?.user?.merchant_id) {
				goto(`/merchants/${$session.user.merchant_id}/profile`);
			} else {
				goto('/');
			}
		} else {
			goto('/login');
		}
	}

	onMount(() => {});

	session.subscribe((value) => {
		if (value && value.loggedIn) {
			nav_class = '';
			app_routes = value.user.role_app_routes;
			username = value.user.username;
			loggedIn = 'true';
		}
		if (value.loggedIn == false) {
			nav_class = 'hidden';
			loggedIn = 'false';
		}
	});

	let unsub = isToastOpen.subscribe((v) => {
		open = v.open;
		toastMessage = v.message;
	});

	onDestroy(() => {
		unsub();
	});

	function handleDropdownItemClick(title, href) {
		document.title = title
		pageTitle.set(title); // Update the shared store
		pageHref.set(href)
		mobileMenuOpen = false; // Close mobile menu after navigation
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
</script>

<div class="fixed w-full" style="z-index: 100;">
	<Toast color="green" position="top-right" bind:open>
		<Icon
			slot="icon"
			name="check-circle-solid"
			class="w-5 h-5 text-green-500 transition duration-75 dark:text-green-400 group-hover:text-green-900 dark:group-hover:text-white"
		/>
		{toastMessage}
	</Toast>
</div>

{#if !isHomePage}
<!-- Top Navigation Bar -->
<header class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
	<nav class="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200/20 dark:border-white/10 px-6 sm:px-10 py-3">
		<!-- Logo and Brand -->
		<a href="/shop" class="flex items-center gap-4 text-gray-800 dark:text-white hover:opacity-80 transition-opacity">
			<div class="h-6 w-6">
				<svg fill="currentColor" viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
					<path clip-rule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill-rule="evenodd"></path>
					<path clip-rule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill-rule="evenodd"></path>
				</svg>
			</div>
			<h2 class="text-lg font-bold tracking-[-0.015em]">Netsphere Barter Marketplace</h2>
		</a>

		<!-- Desktop Navigation -->
		<div class="hidden md:flex items-center gap-4">
			<!-- Navigation Links -->
			<div class="flex items-center gap-6">
				{#if $session?.user?.merchant_id}
					<a href="/merchants/{$session.user.merchant_id}/profile" class="text-sm font-medium text-gray-800 dark:text-white hover:text-primary transition-colors">Profile</a>
				{/if}
				<a href="/shop" class="text-sm font-medium text-gray-800 dark:text-white hover:text-primary transition-colors">Shop</a>
				<a href="/cart" class="text-sm font-medium text-gray-800 dark:text-white hover:text-primary transition-colors">Cart</a>
				{#each MENUS as menu}
					{#if !menu.hidden}
						{#if menu.children}
							{#if app_routes.some((app_route) => app_route.name === menu.title)}
								<div class="relative group">
									<button class="text-sm font-medium text-gray-800 dark:text-white hover:text-primary transition-colors" id="menu-{menu.title}">
										{menu.title}
									</button>
									<Dropdown triggeredBy="#menu-{menu.title}" class="w-44 z-20">
										{#each menu.children as child}
											{#if app_routes.some((app_route) => app_route.route === child.path)}
												<DropdownItem href={child.path} on:click={() => handleDropdownItemClick(child.title, child.path)}>
													{child.title}
												</DropdownItem>
											{/if}
										{/each}
									</Dropdown>
								</div>
							{/if}
						{:else if app_routes.some((app_route) => app_route.route === menu.path)}
							<a href={menu.path} class="text-sm font-medium text-gray-800 dark:text-white hover:text-primary transition-colors" on:click={() => handleDropdownItemClick(menu.title, menu.path)}>
								{menu.title}
							</a>
						{/if}
					{/if}
				{/each}
				{#if loggedIn === 'true' || $session?.loggedIn}
					<button on:click={logOut} class="text-sm font-medium text-gray-800 dark:text-white hover:text-primary transition-colors">Logout</button>
				{/if}
			</div>

			<!-- Action Buttons -->
			<div class="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200/20 dark:border-white/10">
				<!-- Profile Icon -->
				<button
					on:click={goToProfile}
					class="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
					aria-label="Profile"
				>
					<Icon name="user-circle-solid" class="w-6 h-6" />
				</button>
				
				<!-- Cart Icon with Badge -->
				<button
					on:click={goToCart}
					class="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
					aria-label="Shopping Cart"
				>
					<Icon name="shopping-cart-solid" class="w-6 h-6" />
					{#if cartCount > 0}
						<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
							{cartCount}
						</span>
					{/if}
				</button>
				
				<DarkMode />
			</div>
		</div>

		<!-- Mobile Menu Button -->
		<div class="md:hidden flex items-center gap-3">
			<!-- Cart Icon with Badge -->
			<button
				on:click={goToCart}
				class="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
				aria-label="Shopping Cart"
			>
				<Icon name="shopping-cart-solid" class="w-6 h-6" />
				{#if cartCount > 0}
					<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
						{cartCount}
					</span>
				{/if}
			</button>
			
			<DarkMode />
			
			<!-- Hamburger Menu Button -->
			<button
				on:click={toggleMobileMenu}
				class="p-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
				aria-label="Menu"
			>
				{#if mobileMenuOpen}
					<!-- Close icon (X) -->
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<!-- Hamburger icon -->
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>
		</div>
	</nav>

	<!-- Mobile Menu -->
	{#if mobileMenuOpen}
		<div class="md:hidden border-b border-solid border-gray-200/20 dark:border-white/10 px-6 py-4 space-y-3">
			{#if $session?.user?.merchant_id}
				<a href="/merchants/{$session.user.merchant_id}/profile" class="block text-sm font-medium text-gray-800 dark:text-white hover:text-primary transition-colors" on:click={toggleMobileMenu}>Profile</a>
			{/if}
			<a href="/shop" class="block text-sm font-medium text-gray-800 dark:text-white hover:text-primary transition-colors" on:click={toggleMobileMenu}>Shop</a>
			<a href="/cart" class="block text-sm font-medium text-gray-800 dark:text-white hover:text-primary transition-colors" on:click={toggleMobileMenu}>Cart</a>
			{#each MENUS as menu}
				{#if !menu.hidden}
					{#if menu.children}
						{#if app_routes.some((app_route) => app_route.name === menu.title)}
							<div class="space-y-2">
								<div class="text-sm font-medium text-gray-800 dark:text-white">{menu.title}</div>
								<div class="pl-4 space-y-2">
									{#each menu.children as child}
										{#if app_routes.some((app_route) => app_route.route === child.path)}
											<a href={child.path} class="block text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors" on:click={() => handleDropdownItemClick(child.title, child.path)}>
												{child.title}
											</a>
										{/if}
									{/each}
								</div>
							</div>
						{/if}
					{:else if app_routes.some((app_route) => app_route.route === menu.path)}
						<a href={menu.path} class="block text-sm font-medium text-gray-800 dark:text-white hover:text-primary transition-colors" on:click={() => handleDropdownItemClick(menu.title, menu.path)}>
							{menu.title}
						</a>
					{/if}
				{/if}
			{/each}
			{#if loggedIn === 'true' || $session?.loggedIn}
				<button on:click={() => { logOut(); toggleMobileMenu(); }} class="block w-full text-left text-sm font-medium text-gray-800 dark:text-white hover:text-primary transition-colors">Logout</button>
			{/if}
		</div>
	{/if}
</header>
{/if}

<div id="alert" class="p-8 hidden">
	<Alert>
		<span class="font-medium">Info alert!</span>
		Change a few things up and try submitting again.
	</Alert>
</div>

<slot />
