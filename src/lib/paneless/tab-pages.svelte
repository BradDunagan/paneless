<script lang="ts">

	import { beforeUpdate, afterUpdate }	from 'svelte';
	
	export let prpEleId			= null;
	export let prpPageKey		= 0;
	export let prpPage: any		= null;

	import { cmn }    			from './common';

let self = {

	state: {
		page:		null,
	},

	doAll ( o ) {
		const sW = 'paneless TabPages doAll()'
		cmn.error ( sW, 'not implemented' );
	}

};

	cmn.log ( 'paneless TabPages', 'prpPageKey ' + prpPageKey );

	beforeUpdate ( () => {
		const sW = 'paneless TabPages beforeUpdate()';
	//	cmn.log ( sW, 'prpPageKey ' + prpPageKey 
	//				+ (prpPage 
	//					? '  prpTabId ' + prpPage.props.prpTabId : '') );

	//	if ( prpPage ) {
	//	//	if ( self.state.page ) {
	//	//		self.state.page.comp  = null;
	//	//		self.state.page.props = null; }
	//		self.state.page = null;
	//		self.state.page = prpPage; }
	//	//	self.state.page.comp  = prpPage.comp;
	//	//	self.state.page.props = prpPage.props; }
	} )	//	beforeUpdate()

	afterUpdate ( () => {
		const sW = 'paneless TabPages afterUpdate()';
	//	cmn.log ( sW, 'prpPageKey ' + prpPageKey );
	} )	//	afterUpdate()

/*
		 {#if self.state.page }
		 	<svelte:component this = { self.state.page.comp } 
			 						 { ...self.state.page.props } />
*/
/*
		 	<div>
		 		{ prpPageKey } { prpPage.props.prpTabId }
			</div>
*/
</script>

<tab-pages>

	<div id		= { prpEleId }
		 class	= 'tab-pages' >
		 {#if prpPage}
		 	<svelte:component this = { prpPage.comp } { ...prpPage.props } />
		 {:else}
			<div class = 'no-content'>
				click + to add tab pages
			</div>
		 {/if}
	</div>

</tab-pages>

<style>

	.tab-pages {
		background-color:	red;	/*	pane should cover the page - if you see
										red then something is wrong		*/
		border-bottom:		solid 1px black;
		height: 			100%;
	}

	.no-content {
		height:				100%;
		background-color:	white;;
		display:            grid;
		align-items:        center;
		justify-items:		center;
		color:				lightgray;
	}

</style>

