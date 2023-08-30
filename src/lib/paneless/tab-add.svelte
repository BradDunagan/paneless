<script lang="ts">

	import { cmn }    			from './common';

	export let prpEleId		 	= '';
	export let prpTabsFnc: any	= null;

let self = {

	click ( ev ) {
		prpTabsFnc ( { do: 		'add-tab' } );
	},	//	click()

	doAll ( o ) {
		const sW = 'paneless TabAdd doAll()'
		cmn.error ( sW, 'not implemented' );
	},	//	doAll()

};	//	self

</script>

<tab-add>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div id			= { prpEleId }
		 class		= 'tab-page-name'
		 on:click	= { self.click } >
		+
	</div>

</tab-add>

<style>

	.tab-page-name {
		margin-top:			-1px;
		padding-left:		8px;
		padding-right:		8px;
		padding-top:		4px;
		padding-bottom:		4px;
		border-right:		solid 1px gray;
		cursor:				pointer;
	}

</style>
