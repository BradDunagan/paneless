
<script lang="ts">

	import AppHeaderTitle 			from './app-header-title.svelte';
	import AppHeaderItem 			from './app-header-item.svelte';
	import AppHeaderSignIn			from './app-header-sign-in.svelte';
	import type { Item }			from './interfaces.ts';

	export let prpClientFnc: any		= null;
	export let appTitle: null | string	= null;
	export let items: Item[]			= [];
	export let onClickTitle: (e: any) => void;
</script>

<app-header>
	<AppHeaderTitle
		appTitle		= { appTitle ? appTitle : 'App Title' }
		onClickTitle	= { onClickTitle }
	/>
	{#each items as item}
		<AppHeaderItem
		 	prpClientFnc		= { prpClientFnc }
			prpItemName			= { item.name }
			prpItemSelection	= { item.selection }
			prpEnabled			= { item.enabled } 
			prpOnClick			= { item.onClick } />
	{/each}
	<AppHeaderSignIn
		prpClientFnc		= { prpClientFnc }
	/>
</app-header>

<style>
	app-header {
		display:				grid;
		grid-template-columns:	22% 22% 22% 12% 22%;
	}
</style>

