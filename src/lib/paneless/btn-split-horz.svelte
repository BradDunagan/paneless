<script lang="ts">

	import { onMount, onDestroy, afterUpdate }	from 'svelte';
	import split_horz_img		from  "./images/gimp_f.png";

	export let prpEleId				= '';
	export let prpContainerFnc: any	= null;
	export let prpBbFnc: any		= null;
	export let prpPaneFnc: any		= null;
	export let prpStyle 			= { }; 

    function stringifyStyle ( style: any ): string {
        let s = '';
        for ( const p in style ) {
            s += p + ': ' + style[p] + '; '; };
        return s;
    }	//	stringifyStyle()

let self = {

	styleString:		'',

	mouseDown ( ev ) {
		let sW = 'mouseDown()';
	//	cmn.log ( sW );
		ev.stopPropagation();
	},	//	mouseDown()

	mouseUp ( ev ) {
		let sW = 'mouseUp()';
	//	cmn.log ( sW );
		ev.stopPropagation();
	},	//	mouseUp()

	mouseMove ( ev ) {
		let sW = 'mouseMove()';
	//	cmn.log ( sW );
		ev.stopPropagation();
	},	//	mouseMove()

	click ( ev ) {
		let sW = 'click()';
	//	cmn.log ( sW );
		ev.stopPropagation();
		if ( prpContainerFnc ) {
			//	Do the split call through the container because the container
			//	will remove the button bar this button is on.
			//	Got to go through the button bar to tell the container which
			//	button bar to remove.
			prpBbFnc ( { do: 'split-horz' } );
		} else {
			if ( prpPaneFnc ) {
				prpPaneFnc ( { do: 'split-horz' } ); }
		}
	},	//	click()

	doAll ( o ) {
	},	//	doAll()

}   //  self

	self.styleString = stringifyStyle ( prpStyle );

	onMount ( () => {
		prpBbFnc ( { do: 		'set-call-down',
					 to:		'btn-split-horz',
					 bshFnc:	self.doAll } );
	} )	//	componentDidMount()

</script>

<btn-split-horz>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<img alt			= 'button split horizontal'
		 id				= { prpEleId }
		 class			= "btn-split-horz"
		 style			= { self.styleString } 
		 src			= { split_horz_img }
		 on:mousedown 	= { self.mouseDown }
		 on:mouseup		= { self.mouseUp }
		 on:mousemove	= { self.mouseMove }
		 on:click		= { self.click } />

</btn-split-horz>

<style>

	.btn-split-horz {
		width: 				17px;
		height:				15px;
		padding:			3px 3px 2px 3px;
		cursor: 			default;
	}

	.btn-split-horz:hover {
		background-color:	gainsboro;
	}

</style>
