<script lang="ts">

	import burger_img	from  "./images/gimp_c.png";

	import { cmn }    	from './common';
	
	export let prpEleId			= '';
	export let prpStyle			= {};
//	export let prpBbFnc			= null;
	export let prpPaneFnc: any	= null;

    function stringifyStyle ( style: any ): string {
        let s = '';
        for ( const p in style ) {
            s += p + ': ' + style[p] + '; '; };
        return s;
    }	//	stringifyStyle()

let self = {

	styleString:	'',

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
		prpPaneFnc ( { do: 'pane-burger-click' } );
	},	//	click()

	doAll ( o ) {
	//	if ( o.do === 'set-pane-fnc' ) {
	//		this.paneFnc = o.paneFnc;
	//		return;
	//	}
	},	//	doAll()

};	//	self

	self.styleString = stringifyStyle ( prpStyle );

</script>

<btn-burger>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<img alt			= 'pane burger button'
		 id				= { prpEleId }
		 class			= "rr-btn-burger"
		 style			= { self.styleString }
		 src			= { burger_img }
		 on:mousedown 	= { self.mouseDown }
		 on:mouseup		= { self.mouseUp }
		 on:mousemove	= { self.mouseMove }
		 on:click		= { self.click } />

</btn-burger>

<style>

	.rr-btn-burger {
		width: 				16px;
		height:				15px;
		padding:			3px 3px 2px 2px;
	/*	margin-left:		1px;
		margin-right:		4px;	*/
		float: 				left;
		cursor: 			default;
	}

	.rr-btn-burger:hover {
		background-color:	gainsboro;
	}

</style>
