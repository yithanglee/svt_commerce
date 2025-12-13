<script>
	import { Toast, Alert } from 'flowbite-svelte';
	import { PHX_COOKIE } from '$lib/constants';
	import { session } from '$lib/stores/session';
	import { isToastOpen } from '$lib/stores/toast';
	import { Icon } from 'flowbite-svelte-icons';
	import '../app.postcss';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import Cookies from 'js-cookie';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';

	/** @type {import('./$types').LayoutData} */
	export let data;

	let open = true,
		toastMessage = '';

	const navigationItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Shop', href: '/shop' },
		{ label: 'Sell', href: '/merchants/apply' },
		{ label: 'Community', href: '/merchants' }
	];

	$: isHomePage = $page.url.pathname === '/';

	function logOut() {
		session.logout();
		Cookies.remove('user');
		Cookies.remove(PHX_COOKIE);
		goto('/');
	}

	let unsub = isToastOpen.subscribe((v) => {
		open = v.open;
		toastMessage = v.message;
	});

	onDestroy(() => {
		unsub();
	});
</script>

<div class="fixed w-full" style="z-index: 100;">
	<Toast color="green" position="top-right" bind:open>
		<Icon
			slot="icon"
			name="check-circle-solid"
			class="w-5 h-5 text-green-500 transition duration-75 dark:text-green-400 group-hover:text-green-900 dark:group-hover:"
		/>
		{toastMessage}
	</Toast>
</div>

{#if !isHomePage}
	<Header 
		showSearch={true}
		showWishlist={true}
		showApplyMerchant={true}
		{navigationItems}
		logoText="Netsphere Barter Marketplace"
		logoHref="/"
	/>
{/if}

<div id="alert" class="p-8 hidden">
	<Alert>
		<span class="font-medium">Info alert!</span>
		Change a few things up and try submitting again.
	</Alert>
</div>

<slot />
