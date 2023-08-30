<script lang="ts">

	import burger_img	from  "./images/gimp_c.png";

	export let frameId			= 0;
	export let frameFnc: any	= null;

let self = {

	eleId: 		'paneless-frame-burger-menu-' + frameId,
	
	doAll ( o:any ) {
	},

	mouseDown ( ev:any ) {
		let sW = 'paneless frame-burger-menu mouseDown()';
	//	cmn.log ( sW );
		ev.stopPropagation();
	},  //	mouseDown()

	mouseUp ( ev:any ) {
		let sW = 'paneless frame-burger-menu mouseUp()';
	//	cmn.log ( sW );
		ev.stopPropagation();
	},	//	mouseUp()

	mouseMove ( ev:any ) {
		let sW = 'paneless frame-burger-menu mouseMove()';
	//	cmn.log ( sW );
		ev.stopPropagation();
	},	//	mouseMove()

	click ( ev:any ) {
		let sW = 'paneless frame-burger-menu click()';
	//	cmn.log ( sW );
		frameFnc ( { do: 'frame-burger-click' } );
		ev.stopPropagation();
	},	//	click()

}   //  self


</script>

<frame-burger-menu>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <img alt            = "burger menu"
         id			    = { self.eleId }
         src		    = { burger_img }
         on:mousedown   = { self.mouseDown }
         on:mouseup     = { self.mouseUp }
         on:mousemove   = { self.mouseMove }
         on:click       = { self.click } />
</frame-burger-menu>


<style>

    frame-burger-menu {
		width: 			16px;
		height:			15px;
		padding:		1px 3px 2px 2px;
		flex:			0 1 auto;
		left:			1px;
		top: 			0px;
		cursor: 		default;
	}

	frame-burger-menu:hover {
		background-color:	gainsboro;
	}

    img {
        width: 			18px;
        position: 		absolute;
        left:			1px;
        top: 			1px;
        cursor: 		pointer;
    }

</style>