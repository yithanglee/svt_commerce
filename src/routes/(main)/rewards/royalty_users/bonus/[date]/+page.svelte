<script>
    /** @type {import('./$types').PageData} */
    export let data;
    import SimpleTable from '$lib/components/SimpleTable.svelte';
	
</script>


<SimpleTable
	title="Royalty Bonus for "
	description={'' + data.date}
 
	data={{
		apiData: { date: data.date},
		buttons: [],
		scope: 'royalty_bonus',
		columns: [

			{ label: 'id', data: 'id' },
            { label: 'Referal Group Sales Amount (PV)', data: 'amount' },
            { label: 'Qualifier', data: 'username', through: ['user'] },
			
		
		]
	}}
/>
