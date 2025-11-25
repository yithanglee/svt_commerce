<script>
	import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

	import { Badge, Button, Img, Modal } from 'flowbite-svelte';
	export let item;
	export let col;
	let img_url,
		previewModal = false,
		url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	function badgeColor(value, conditionList) {
		var resultList = conditionList.filter((v, i) => {
			return v.key == value;
		});

		if (resultList.length > 0) {
			return resultList[0].value;
		} else {
			return 'pink';
		}
	}

	function checkAssoc(data, val, through) {
		try {
			if (data[through[0]]) {
				return data[through[0]][val];
			} else {
				return '';
			}
		} catch (e) {
			return '';
		}
	}
	function formatDateTime(data, key, offset) {
		offset = offset == null ? 0 : offset;
		var str = data[key];
		str = Date.parse(str);
		var dt = new Date(str);
		dt.setTime(dt.getTime() + offset * 60 * 60 * 1000);
		var edate = dt.toGMTString().split(',')[1].split(' ').splice(0, 4).join(' ');
		var etime = dt.toLocaleTimeString();
		return edate + ' ' + etime;
	}
	function showPreview(data, key) {
		return data[key];
	}
	function showPrefix(data){
		console.info(data.toString().includes("-"))
		return data.toString().includes("-") ? data : "+" + data ;
	}
</script>

{#if col.subtitle != null}
	{item[col.data]}
	<br />
	<small class="font-extralight dark:text-white">
		{item[col.subtitle.data]}
	</small>
{:else if col.showPreview}
	{#if item[col.data] != null}
		<Button
			on:click={() => {
				img_url = item[col.data];
				previewModal = true;
			}}>Preview</Button
		>
	{:else}
		<Button disabled>Preview</Button>
	{/if}

	<!-- {showPreview(item, col.data)} -->
{:else if col.formatDateTime}
	{formatDateTime(item, col.data, col.offset)}
{:else if col.through != null}
	{checkAssoc(item, col.data, col.through)}
{:else if col.color != null}
	<Badge class="capitalize" color={badgeColor(item[col.data], col.color)}>{item[col.data]}</Badge>
{:else if col.showPrefix }
	<div>{showPrefix(item[col.data])}</div>
{:else if col.showImg != null}
	<div style="width: 80px;">
		<Img class="rounded-lg" src="{url}{item[col.data]}" />
	</div>
{:else if col.isBadge}
	<Badge class="capitalize" color="pink"
		>{item[col.data] == null
			? ''
			: item[col.data]
					.split('_')
					.map((v, i) => {
						return v;
					})
					.join(' ')}</Badge
	>
{:else}
	{item[col.data] == null ? '' : item[col.data]}
{/if}
<Modal title="Preview" bind:open={previewModal} autoclose outsideclose>
	{#if img_url != null}
		<Img src="{url}{img_url}" alt="sample 1" />
	{/if}

	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400" />
	<svelte:fragment slot="footer">
		<Button color="red" on:click={() => {}}>Confirm</Button>
	</svelte:fragment>
</Modal>
