<script>
	import { onMount } from 'svelte';
	import { Button } from 'flowbite-svelte';
	export let banners = [];
	let idx = 0;
	let intervalId;
	onMount(() => {
		if (banners.length > 1) {
			intervalId = setInterval(() => {
				idx = (idx + 1) % banners.length;
			}, 4000);
			return () => clearInterval(intervalId);
		}
	});
	function prev() {
		idx = (idx - 1 + banners.length) % banners.length;
	}
	function next() {
		idx = (idx + 1) % banners.length;
	}
</script>

{#if banners.length > 0}
	<div class="relative w-full">
		<img class="w-full h-56 md:h-72 object-cover rounded" src={banners[idx].image_url} alt={banners[idx].title || 'Banner'} />
		{#if banners[idx].title}
			<div class="absolute bottom-3 left-3 bg-black/50 text-white px-3 py-1 rounded">{banners[idx].title}</div>
		{/if}
		<div class="absolute inset-y-0 left-0 flex items-center">
			<Button size="xs" color="light" on:click={prev}>&lt;</Button>
		</div>
		<div class="absolute inset-y-0 right-0 flex items-center">
			<Button size="xs" color="light" on:click={next}>&gt;</Button>
		</div>
	</div>
{:else}
	<div class="w-full h-56 bg-gray-100 rounded" />
{/if}


