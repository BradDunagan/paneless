<script lang="ts">

	import iconize_img		from  "./images/gimp_d.png";

	export let frameId			= 0;
	export let frameFnc: any	= null;

	const eleId 		= 'frame-iconize-' + frameId;

let self = {

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
		frameFnc ( { do: 'iconize' } );
	}	//	click()

}

</script>

<frame-iconize>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<img alt = 'frame iconize'
		id			= { eleId }
		src			= { iconize_img }
		on:mousedown	= { self.mouseDown }
		on:mouseup		= { self.mouseUp }
		on:mousemove	= { self.mouseMove }
		on:click		= { self.click } />


</frame-iconize>


<style>

	frame-iconize {
		margin-right:		4px;
		width: 				15px;
		height:				16px;
		flex:				0 1 auto;
		cursor: 			default;
		padding-top:		1px;
		padding-right:		0px;
		padding-bottom:		1px;
		padding-left:		4px;
		background-color:	inherit;
	}

	frame-iconize:hover {
		background-color:	gainsboro;
	}

    img {
        margin-right:	1px;
        width: 			18px;
        float: 			right;
        cursor: 		pointer;
    }

</style>