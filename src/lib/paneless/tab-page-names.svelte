<script lang="ts">

    import TabAdd				from './tab-add.svelte';
    import { getNextTabId }	    from './tab-next-id';
	import { cmn }    			from './common';

	export let prpEleId		= '';
	export let prpTabsFnc	= null;
	export let prpNames		= null;

let self = {

	state:	{
	},
	
	addEleId:	'tab-add-' + getNextTabId(),

	doAll ( o ) {
		const sW = 'paneless TabPageNames doAll()'
		cmn.error ( sW, 'not implemented' );
	}

};

	prpTabsFnc ( { do:			'set-call-down',
				   to:			'tab-page-names',
				   namesFnc:	self.doAll } );
</script>

<tab-page-names>

	<div id		= { prpEleId }
		 class	= 'tab-page-names' >
		{#each prpNames as n ( n.key ) }
			<svelte:component this = { n.comp } { ...n.props } />
		{/each}
		<TabAdd prpEleId 	= { self.addEleId }
				prpTabsFnc	= { prpTabsFnc } />
	</div>


</tab-page-names>

<style>

	.tab-page-names {
		display:			flex;
		flex-direction:		row;
		flex:				1 1 auto;
	}
	
</style>

