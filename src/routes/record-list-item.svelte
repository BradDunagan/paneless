<script lang="ts">

	import { cmn }				from '$lib/paneless/common';

	export let prpIdx 			= 0;
	export let prpStyleString	= '';
	export let prpName			= '';
	export let prpList: any		= null;

	function onClick ( e ) {
		prpList ( { do: 'select', idx: prpIdx } );
	}

	let styleString = prpStyleString;

	function setStyle ( style ) {
		styleString = cmn.stringifyStyle ( style );
	}

	prpList ( { do: 'set-item-style-fnc', idx: prpIdx, fnc: setStyle } );
	
</script>

<record-name>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<li style		= { styleString }
		on:click	= { onClick }>
		{ prpName }
	</li>

</record-name>

<style>
	
	li {
		padding-left:		3px;
		padding-top:		3px;
		padding-bottom: 	0px;
		font-family: 		consolas;
		color:				black;
		cursor:				pointer;
	}


</style>
