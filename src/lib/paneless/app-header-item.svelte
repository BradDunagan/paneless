
<script lang="ts">

	import { onMount }		from 'svelte';
	import { cmn }			from '$lib/paneless/common';

    export let prpClientFnc:	any							= null;
    export let prpItemName									= 'Item Name';
    export let prpItemSelection 							= 'Item Selection';
	export let prpEnabled: boolean 							= true;
	export let prpOnClick:		null | ((e: any) => void)	= null;

    let itemSelection = prpItemSelection;

	function doAll ( o ) {
		const sW = 'AppHeaderItem doAll() - ' + prpItemName 
					+ ' do: ' + o.do;
		cmn.log ( sW );
		switch ( o.do ) {
			case 'set-selection': {
				itemSelection = o.selection;
				return;
			}
			default:
				cmn.error ( sW, 'unrecognized do' );
		}
	}	//	doAll()

	onMount ( () => {
		prpClientFnc ( { do: 	'set-call-down',
						 to: 	'hdr-item-' + prpItemName,
						 fnc:	doAll } );
	} )
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<app-header-item on:click = { prpOnClick } >
	{#if prpEnabled}
		<span class = "item-name">
    		{ prpItemName }
		</span>
		<span class = "item-name-selection">
			{ itemSelection }
		</span>
	{:else}
		<span class = "item-name-disabled">
    		{ prpItemName }
		</span>
		<span class = "item-name-selection-disabled">
			{ itemSelection }
		</span>
	{/if}
</app-header-item>

<style>
    app-header-item {
        justify-self:	center;
        padding-top:    6px;
        padding-right:  5px;
    }
	.item-name {
		cursor: 		pointer;
	}
	.item-name-disabled {
		color:			lightgray;
		cursor: 		default;
	}
    .item-name-selection {
        padding-left:	8px;
        font-weight:	500;
        cursor:         pointer;    
    }
    .item-name-selection-disabled {
        padding-left:	8px;
        font-weight:	500;
        cursor:         default;    
		color:  		lightgray;
    }
</style>