<script lang="ts">

	export let frameId      			= 0;
	export let frameFnc: any     		= null;
	export let transientHeaderFnc: any	= null;

	const eleId 		= 'frame-transient-mover-' + frameId;

let self = {

	mouseEnter ( ev ) {
		let sW = 'FrameTransientMover mouseEnter()';
	//	cmn.log ( sW );
		transientHeaderFnc ( { do: 'mouse-enter', ev: ev } );
	},	//	mouseEnter()
	
	mouseLeave ( ev ) {
		let sW = 'FrameTransientMover mouseLeave()';
	//	cmn.log ( sW );
		transientHeaderFnc ( { do: 'mouse-leave', ev: ev } );
	},	//	mouseLeave()

	mouseDown ( ev ) {
		let sW = 'FrameTransientMover mouseDown()';
	//	cmn.log ( sW );
	//	ev.stopPropagation();
		transientHeaderFnc ( { do: 'mouse-down', ev: ev } );
	},	//	mouseDown()

	mouseUp ( ev ) {
		let sW = 'FrameTransientMover mouseUp()';
	//	cmn.log ( sW );
	//	ev.stopPropagation();
	//	transientHeaderFnc ( { do: 'mouse-up' } );
	},	//	mouseUp()

	mouseMove ( ev ) {
		let sW = 'FrameTransientMover mouseMove()';
	//	cmn.log ( sW );
	//	ev.stopPropagation();
	//	transientHeaderFnc ( { do: 'mouse-move' } );
	},	//	mouseMove()

	click ( ev ) {
		let sW = 'FrameTransientMover click()';
	//	cmn.log ( sW );
	//	ev.stopPropagation();
	//	frameFnc ( { do: 'iconize' } );
	}	//	click()

}

frameFnc = frameFnc;	//	rid of the warning

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<frame-transient-mover
	on:mouseenter	= { self.mouseEnter }
	on:mouseleave	= { self.mouseLeave }
	on:mousedown	= { self.mouseDown }
	on:mouseup		= { self.mouseUp }
	on:mousemove	= { self.mouseMove }
	on:click		= { self.click } 

/>

<style>

	frame-transient-mover {
		width: 				80%;
		height:				18px;
		flex:				0 1 auto;
		cursor: 			move;
		background-color:	white;
		pointer-events:  	all;
	}

</style>