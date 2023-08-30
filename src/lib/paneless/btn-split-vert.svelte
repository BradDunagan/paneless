<script lang="ts">

	import split_vert_img	from  "./images/gimp_g.png";

	export let prpEleId			= '';
	export let prpContainerFnc	= null; 
	export let prpBbFnc: any	= null;
	export let prpPaneFnc: any	= null
	export let prpStyle 		= { };

    function stringifyStyle ( style: any ): string {
        let s = '';
        for ( const p in style ) {
            s += p + ': ' + style[p] + '; '; };
        return s;
    }	//	stringifyStyle()

let self = {

	styleString:		'',

	doAll ( o ) {
	},

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
	//	if ( self.frameFnc ) {
	//		self.frameFnc ( { do: 			'split-vert',
	//						  contentId:	prpcontentId } ); }
		if ( prpContainerFnc ) {
			//	Do the split call through the container because the container
			//	will remove the button bar this button is on.
			//	Got to go through the button bar to tell the container which
			//	button bar to remove.
			prpBbFnc ( { do: 'split-vert' } );
		} else {
			if ( prpPaneFnc ) {
			prpPaneFnc ( { do: 'split-vert' } ); } 
		}
	},	//	click()

}   //  self

	self.styleString = stringifyStyle ( prpStyle );

</script>

<btn-split-vert>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<img alt			= 'button split vertical'
		 id				= { prpEleId }
		 class			= "btn-split-vert"
		 style			= { self.styleString }
		 src			= { split_vert_img }
		 on:mousedown 	= { self.mouseDown }
		 on:mouseup		= { self.mouseUp }
		 on:mousemove	= { self.mouseMove }
		 on:click		= { self.click } />

</btn-split-vert>

<style>

	.btn-split-vert {
		width: 				15px;
		height:				17px;
		padding:			2px 3px 1px 3px;
		cursor: 			default;
	}

	.btn-split-vert:hover {
		background-color:	gainsboro;
	}

</style>
