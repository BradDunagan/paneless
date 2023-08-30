<script lang="ts">

	import { onMount, onDestroy }	from 'svelte';
	import { cmn }		    	from './common';
	import FrameBurgerMenu		from './frame-burger-menu.svelte';
	import FrameTitle 			from './frame-title.svelte';
	import FrameIconize 		from './frame-iconize.svelte';	
	import FrameDestroy 		from './frame-destroy.svelte';

	export let frameEleId		= '';
	export let frameId      	= 0;
	export let frameName		= '';
	export let frameFnc: any	= null;

let self = {

    state:      {
		frameName:		frameName,
		frameNamePart2:	"",
		class:			"title-bar",
		style:			<any>null
    },
    
	eleId:			frameEleId + '-header',

    height:			0,

	mouseDown ( ev ) {
		let sW = 'paneless FrameHeader mouseDown()';
	//	cmn.log ( sW );
		frameFnc ( { do: 	'move-start',
					 ev: 	ev } );
	},	//	mouseDown()

	title() {
		let title = self.state.frameName;
		let part2 = self.state.frameNamePart2;
		if ( (typeof part2 === 'string') && (part2.length > 0) ) {
			title += " - " + part2; }
		return title;
	},

	doAll ( o: any ) {
		let sW = frameId + ' paneless FrameHeader doAll() ' + o.do;
		if ( o.to ) {
			sW += ' to ' + o.to; }
	//	cmn.log ( sW );
		switch ( o.do ) {
		case ( 'is-visible' ): {
			if ( (! self.state.style) || (! self.state.style.display) ) {
				return true; }
			return self.state.style.display !== 'none'; }
		case ( 'show' ): {
			self.state.class = 'title-bar';
			return;	}
		case ( 'hide' ): {
			self.state.class = 'transient-title-bar';
			return;	}
		case ( 'set-frame-name' ): {
			self.state.frameName = o.name;
			return; }
		case ( 'set-frame-name-part-2' ): {
			self.state.frameNamePart2 = o.namePart2;
			return; }
		default:
			cmn.error ( sW, 'unrecognized do' );
		}	//	switch
	}	//	doAll()

}

	onMount( () => {
		const sW = 'paneless FrameHeader onMount()';
		let e = document.getElementById ( self.eleId );
		if ( ! e ) {
			cmn.log ( sW, ' Error: no element' ); }
		else {
			self.height = e.offsetHeight; };

		frameFnc ( { do: 		'set-call-down',
					 to:		'frame-header',
					 headerH:	self.height,
					 fnc:		self.doAll } );
	} )	//	onMount()

	onDestroy( () => {
		frameFnc( { do:		 	'set-call-down',
					 to:		'frame-header',
					 headerH:	self.height,
					 fnc:		null } );
	} )	//	componentWillUnmount()

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<frame-header
	id				= { self.eleId }
	class			= { self.state.class }
	style 			= { self.state.style }
	on:mousedown	= { self.mouseDown } >
	<FrameBurgerMenu 
		frameId		= { frameId }
		frameFnc 	= { frameFnc } />
	<FrameTitle 
		frameId		= { frameId }
		titleText	= { self.title() } />
	<FrameIconize 
		frameId		= { frameId }
		frameFnc 	= { frameFnc } />
	<FrameDestroy 
		frameId		= { frameId }
		frameFnc 	= { frameFnc } />
</frame-header>


<style>
	.title-bar {
		display:			flex;
		flex-direction:		row;
		align-items: 		flex-start;
		width:				100%;
		height:				18px;
		min-height:			18px;
		border-bottom:      solid 1px gray;
		overflow-x: 		hidden;
	}

	.transient-title-bar {
		position:               absolute;
		display:				flex;
		flex-direction:			row;
		align-items: 			flex-start;
		width:					100%;
		height:					18px;
		cursor:                 default;
		transition-property:    background-color, opacity, border-bottom;
		transition-duration:    300ms;
	}

</style>