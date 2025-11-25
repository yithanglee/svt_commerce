<script>
	/** @type {import('./$types').LayoutData} */
	export let data;
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT, PHX_COOKIE } from '$lib/constants';

	import { postData } from '$lib/index.js';

	import { session } from '$lib/stores/session';
	import { page } from '$app/stores';
	import { pageTitle, pageHref } from '$lib/stores/pageTitle'; // Import the shared store

	import { MENUS } from '$lib/constants';
	import {
		Breadcrumb,
		BreadcrumbItem,
		CloseButton,
		Button,
		Drawer,
		SidebarDropdownWrapper,
		SidebarDropdownItem,
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper
	} from 'flowbite-svelte';
	import { Icon } from 'flowbite-svelte-icons';
	import { sineIn } from 'svelte/easing';
	import Cookies from 'js-cookie';
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let styles = ['sidebar', 'drawer'],
		display_title = 'Profile',
		style = styles[1],
		app_routes = [],
		loggedIn = false,
		spanClass = 'flex-1 ml-3 whitespace-nowrap',
		hidden2 = true,
		menus = MENUS,
		transitionParams = {
			x: -320,
			duration: 200,
			easing: sineIn
		};
	
	// Compute profile route based on merchant_id from session
	$: profileRoute = $session?.user?.merchant_id 
		? `/merchants/${$session.user.merchant_id}/profile` 
		: '/';
	$: display_href = profileRoute;

	function logout() {
		session.logout();
		Cookies.remove('user');
		Cookies.remove(PHX_COOKIE);

		setTimeout(() => {
			goto('/');
		}, 200);
	}

	function relogin() {
		logout();
	}
	async function syncMenusToServer() {
		console.info(MENUS);
		await postData(MENUS, {
			endpoint: PHX_HTTP_PROTOCOL + PHX_ENDPOINT + '/svt_api/webhook?scope=sync_menu',
			successCallback: () => {
				// isLoading = false;
				// isTableReloaded.activate();
			}
		});
	}

	let user = { username: 'Guest' };

	onMount(async () => {
		console.log(data.app_routes);
		if (data.needLogin) {
			relogin();
		} else {
			loggedIn = true;
			app_routes = data.app_routes;
		}
	});
	onDestroy(() => {});
	$: navData = $page;
	// Function to update the display title
	function updateTitle(title) {
		display_title = title;
	}
	// Subscribe to the pageTitle store to update display_title
	pageTitle.subscribe((value) => {
		display_title = value;
	});
	pageHref.subscribe((value) => {
		display_href = value;
	});
</script>

{#if loggedIn}
	{#if style == 'sidebar'}
		<div class="mx-auto flex flex-wrap justify-between items-center container">
			<div class="w-full grid grid-cols-12">
				<div class="col-span-12 sm:col-span-3 hidden sm:grid">
					<Sidebar>
						<SidebarWrapper>
							<SidebarGroup>
								<SidebarItem label="Good day, {user.username}">
									<svelte:fragment slot="icon">
										<Icon
											name="user-solid"
											class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
										/>
									</svelte:fragment>
								</SidebarItem>
								<SidebarItem
									label="Profile"
									href={profileRoute}
									on:click={() => updateTitle('Profile')}
								>
									<svelte:fragment slot="icon">
										<Icon
											name="chart-pie-solid"
											class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
										/>
									</svelte:fragment>
								</SidebarItem>
								<SidebarItem
									label="Sync Menus"
									on:click={() => {
										syncMenusToServer();
										updateTitle('Sync Menus');
									}}
								>
									<svelte:fragment slot="icon">
										<Icon
											name="chart-pie-solid"
											class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
										/>
									</svelte:fragment>
								</SidebarItem>

								{#each menus as menu}
									{#if !menu.hidden}
										{#if menu.children}
											{#if app_routes.some((app_route) => app_route.name === menu.title)}
												<SidebarDropdownWrapper label={menu.title}>
													<svelte:fragment slot="icon">
														<Icon
															name="clipboard-solid"
															class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
														/>
													</svelte:fragment>
													{#each menu.children as child}
														{#if app_routes.some((app_route) => app_route.route === child.path)}
															<SidebarDropdownItem
																label={child.title}
																href={child.path}
																on:click={() => updateTitle(child.title)}
															/>
														{/if}
													{/each}
												</SidebarDropdownWrapper>
											{/if}
										{:else if app_routes.some((app_route) => app_route.route === menu.path)}
											<SidebarItem
												label={menu.title}
												{spanClass}
												href={menu.path}
												on:click={() => updateTitle(menu.title)}
											>
												<svelte:fragment slot="icon">
													<Icon
														name={menu.icon == null ? 'users-solid' : menu.icon}
														class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
													/>
												</svelte:fragment>
											</SidebarItem>
										{/if}
									{/if}
								{/each}

								<SidebarItem label={loggedIn ? 'Sign Out' : 'Sign In'} on:click={logout} href="#">
									<svelte:fragment slot="icon">
										<Icon
											name="arrow-right-to-bracket-solid"
											class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
										/>
									</svelte:fragment>
								</SidebarItem>
							</SidebarGroup>
						</SidebarWrapper>
					</Sidebar>
				</div>
				<div class="col-span-12 sm:col-span-8 py-4 sm:py-0">
					<slot />
				</div>
			</div>
		</div>
	{/if}
	{#if style == 'drawer'}
		<Drawer transitionType="fly" {transitionParams} bind:hidden={hidden2} id="sidebar2">
			<div class="flex items-center">
				<h5
					id="drawer-navigation-label-3"
					class="text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
				>
					Menu
				</h5>
				<CloseButton on:click={() => (hidden2 = true)} class="mb-4 dark:text-white" />
			</div>
			<Sidebar>
				<SidebarWrapper>
					<SidebarGroup>
						<SidebarItem label="Good day, {user.username}">
							<svelte:fragment slot="icon">
								<Icon
									name="user-solid"
									class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
								/>
							</svelte:fragment>
						</SidebarItem>
						<SidebarItem
							label="Profile"
							href={profileRoute}
							on:click={() => updateTitle('Profile')}
						>
							<svelte:fragment slot="icon">
								<Icon
									name="chart-pie-solid"
									class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
								/>
							</svelte:fragment>
						</SidebarItem>
						<SidebarItem
							label="Sync Menus"
							on:click={() => {
								syncMenusToServer();
								updateTitle('Sync Menus');
							}}
						>
							<svelte:fragment slot="icon">
								<Icon
									name="chart-pie-solid"
									class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
								/>
							</svelte:fragment>
						</SidebarItem>

						{#each menus as menu}
							{#if !menu.hidden}
								{#if menu.children}
									{#if app_routes.some((app_route) => app_route.name === menu.title)}
										<SidebarDropdownWrapper label={menu.title}>
											<svelte:fragment slot="icon">
												<Icon
													name="clipboard-solid"
													class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
												/>
											</svelte:fragment>
											{#each menu.children as child}
												{#if app_routes.some((app_route) => app_route.route === child.path)}
													<SidebarDropdownItem
														label={child.title}
														href={child.path}
														on:click={() => updateTitle(child.title)}
													/>
												{/if}
											{/each}
										</SidebarDropdownWrapper>
									{/if}
								{:else if app_routes.some((app_route) => app_route.route === menu.path)}
									<SidebarItem
										label={menu.title}
										{spanClass}
										href={menu.path}
										on:click={() => updateTitle(menu.title)}
									>
										<svelte:fragment slot="icon">
											<Icon
												name={menu.icon == null ? 'users-solid' : menu.icon}
												class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
											/>
										</svelte:fragment>
									</SidebarItem>
								{/if}
							{/if}
						{/each}

						<SidebarItem label={loggedIn ? 'Sign Out' : 'Sign In'} on:click={logout} href="#">
							<svelte:fragment slot="icon">
								<Icon
									name="arrow-right-to-bracket-solid"
									class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
								/>
							</svelte:fragment>
						</SidebarItem>
					</SidebarGroup>
				</SidebarWrapper>
			</Sidebar>
		</Drawer>

		<div class="mx-auto flex flex-wrap justify-between items-center container">
			<Button on:click={() => (hidden2 = false)} class="!p-2 mb-4 mt-0 opacity-25">Menu</Button>
			<div class="w-full grid grid-cols-12 shadow-lg p-4 rounded">
				<div class="col-span-12 py-4 sm:py-0" style="padding: 0 2vw;">
					<div class="py-4">
						<Breadcrumb aria-label="Default breadcrumb example ">
							<BreadcrumbItem href={profileRoute} home>Home</BreadcrumbItem>
							<BreadcrumbItem href={display_href}>{display_title}</BreadcrumbItem>
						</Breadcrumb>

						<h1
							class=" mt-4 w-full text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl"
						>
							{display_title}
						</h1>
					</div>
					<slot />
				</div>
			</div>
		</div>
	{/if}
{/if}
