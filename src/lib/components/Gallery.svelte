<script>
	import { Input, Button } from 'flowbite-svelte';
	/** @type {import('./$types').PageData} */
	export let data, input, name, module, child;

	let count = 0,
		inputs = [0];

	function appendNewInput() {
		count = count + 1;
		inputs = [...inputs, count];
	}
	function appendName(name, count) {
		return module + '[' + name + ']' + '[][' + child + ']';
	}
</script>

<div>
	{#each inputs as input}
		<Input type="file" class="my-2" multiple id={input.key} name={appendName(name, count)} />
	{/each}

	<Button on:click={appendNewInput}>Add</Button>
</div>
