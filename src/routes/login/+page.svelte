<script>
	import { goto } from '$app/navigation';
	import { postData } from '$lib/index.js';
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT , PHX_COOKIE } from '$lib/constants';
	import { session } from '$lib/stores/session';
	import { requestNotificationPermission } from '$lib/firebaseConfig.js';
	import Cookies from 'js-cookie';
	
	let username = '', 
		email = '',
		password = '';
	let showPassword = false;
	let passwordInput;

	function togglePasswordVisibility() {
		showPassword = !showPassword;
		if (passwordInput) {
			passwordInput.type = showPassword ? 'text' : 'password';
		}
	}

	async function handleLogin() {
		var url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
		const map = { id: 0, username: username, password: password, scope: 'merchant_sign_in' };
		var res = await postData(map, {
			endpoint: url + '/svt_api/webhook'
		});
		console.log(res);
	
		if (res.status == 'ok') {
			// Set user session/token/cookie
			await Cookies.set(PHX_COOKIE, res.res , { sameSite: 'Lax' });

			// Redirect to merchant profile
			console.log('login user');
			session.login({
				username: username,
				token: JSON.stringify(res.res),
				role_app_routes: res.role_app_routes,
				id: res.id 
			});
			// Request notification permission and register FCM token after successful login
			try {
				await requestNotificationPermission();
			} catch (e) {
				console.error('FCM permission/token error:', e);
			}
			let cookieToken = await Cookies.get(PHX_COOKIE);
			console.log("check cookite js")
			console.log(cookieToken);
			// Redirect to merchant profile page if merchant_id is available
			if (res.id) {
				goto(`/users/${res.id}/profile`);
			} else {
				goto('/');
			}
		} else if (res.status == 'error') {
			session.logout();
			Cookies.remove('user');
			Cookies.remove(PHX_COOKIE);
			await Cookies.remove(PHX_COOKIE)
			// Stay on login page on error
		}
	}
</script>



<div class="relative flex min-h-screen w-full flex-col items-center">

	
	<!-- Main Content -->
	<main class="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
		<div class="w-full max-w-md space-y-8">
			<!-- Page Heading -->
			<div>
				<h1 class="text-center text-4xl font-black leading-tight tracking-[-0.033em]">Sign In to Your Account</h1>
			</div>
			
			<!-- Form Card -->
			<div class="flex w-full flex-col gap-6 rounded-xl bg-white/5 p-8 backdrop-blur-sm border border-gray-200/20 dark:border-white/10">
				<form on:submit|preventDefault={handleLogin} class="space-y-6" method="POST">
					<!-- Email/Username Field -->
					<div class="flex flex-col">
						<label class="text-base font-medium leading-normal pb-2" for="email-username">Email or Username</label>
						<input 
							autocomplete="username" 
							class="form-input w-full resize-none overflow-hidden rounded-lg h-14 p-4 text-base font-normal bg-white/10 dark:bg-gray-800 border border-gray-300 dark:border-blue-700 focus:ring-2 focus:ring-inset focus:ring-blue-600 focus:border-blue-600" 
							id="email-username" 
							name="email-username" 
							placeholder="Enter your email or username" 
							required="" 
							type="text"
							bind:value={username}
						/>
					</div>
					
					<!-- Password Field -->
					<div class="flex flex-col">
						<label class="text-base font-medium leading-normal pb-2" for="password">Password</label>
						<div class="relative">
							<input 
								autocomplete="current-password" 
								class="form-input w-full resize-none overflow-hidden rounded-lg h-14 p-4 pr-12 text-base font-normal bg-white/10 dark:bg-gray-800 border border-gray-300 dark:border-blue-700 focus:ring-2 focus:ring-inset focus:ring-blue-600 focus:border-blue-600" 
								id="password" 
								name="password" 
								placeholder="Enter your password" 
								required="" 
								type="password"
								bind:this={passwordInput}
								bind:value={password}
							/>
							<button 
								class="absolute inset-y-0 right-0 flex items-center pr-4" 
								type="button"
								on:click={togglePasswordVisibility}
							>
								<span class="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
							</button>
						</div>
					</div>
					
					<!-- Forgot Password Link -->
					<div class="flex items-center justify-end">
						<a class="text-sm font-normal hover:underline" href="/forgot-password">Forgot Password?</a>
					</div>
					
					<!-- Sign In Button -->
					<div>
						<button 
							class="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors" 
							type="submit"
						>
							Sign In
						</button>
					</div>
				</form>
				
				<!-- Create Account Link -->
				<div class="text-center">
					<p class="text-sm">
						Don't have an account?
						<a class="font-bold hover:underline" href="/signup">Create one</a>
					</p>
				</div>
			</div>
		</div>
	</main>
</div>

