<script lang="ts">

	import { onMount, onDestroy, afterUpdate }	from 'svelte';
	import clone 		from 'clone';	//	In tsconfig.json, "allowjs": true	
	import { cmn }    	from './common';
	import BtnBurger 	from './btn-burger.svelte';
	import BtnSplitHorz from './btn-split-horz.svelte';
	import BtnSplitVert from './btn-split-vert.svelte';

	export let prpAtFrameTop	= false;
	export let prpBbId			= 0;        //  button bar id
	export let prpPaneFnc: any		= null; 
	export let prpFrameFnc: any		= null;
	export let prpContainerFnc: any	= null;

    function stringifyStyle ( style: any ): string {
        let s = '';
        for ( const p in style ) {
            s += p + ': ' + style[p] + '; '; };
        return s;
    }	//	stringifyStyle()

let self = {

	eleId:			'rr-pane-button-bar-' + prpBbId,

	//	The frame may not be able to answer this question yet.
	//	Assume, for now, true.
	isHdrVisible:	true,

	state:	{
		style: {
			display:			'null',
			left:				'0px',
			top:				'0px',
//			width:				'0px',
			height:				'20px',
			'background-color':		'transparent',
			'border-bottom-color':	'transparent',
			opacity:			'0.0',
			'transition-property':	'none',
		},

		styleString:		'',
	},

	isFrameHeaderTransient:		false,

	bshFnc:				null,
	bsvFnc:				null,

	frameHdrWasHidden:	true,
	disallowShow:		false,

	show() {
		if ( self.disallowShow ) {
			return; }
		let style: any = {
			height:					'20px',
			'background-color':		'white',
			'border-bottom-color':	'gainsboro',
			opacity:                '0.9' };
		prpFrameFnc ( { do: 'mouse-entered-top-pane-button-bar' } );
		let isFrameHeaderTransient =
			prpFrameFnc ( { do: 'is-header-transient' } );
		if ( prpAtFrameTop && isFrameHeaderTransient ) {
			style.top = '18px'; }
		if ( prpAtFrameTop ) {
			prpFrameFnc ( { do: 'show-header' } ); } 

		self.state.style = style;
		self.state.styleString = stringifyStyle ( self.state.style );
	},	//	show()

	mouseEnter ( ev ) {
		let sW = 'PaneButtonBar mouseEnter()';
	//	cmn.log ( sW );
		if ( self.disallowShow ) {
			return; }
		self.show();
	},	//	mouseEnter()
	
	mouseLeave ( ev ) {
		let sW = 'PaneButtonBar mouseLeave()';
	//	cmn.log ( sW );
		
		if ( self.disallowShow ) {
			return; }

		prpFrameFnc ( { do: 'mouse-exited-top-pane-button-bar' } );

		function hide() {
			let style: any = {
				height:				'20px',
				'background-color':		'transparent',
				'border-bottom-color':	'transparent',
				opacity:			'0.0',
			};
			let isFrameHeaderTransient =
				prpFrameFnc ( { do: 'is-header-transient' } );
			if ( prpAtFrameTop && isFrameHeaderTransient ) {
				style.top = '18px'; }

			self.state.style = style;
			self.state.styleString = stringifyStyle ( self.state.style );
		}	//	hide()

	//	if ( ! prpAtFrameTop ) {
	//		hide();
	//		return; }
	//	Regardless, see below.

		window.setTimeout ( () => {
			//	If the mouse didn't move into the header ...
			let s = prpFrameFnc ( { 
				do: 'get-transient-header-status' } );
			if ( ! s ) {
				return; }
			if ( (! s.visible) || (! s.mouseIn ) ) {
			//	hide();
			//	Regardless, see below.
				let msInAnyBB = prpFrameFnc ( { 
					do: 'is-mouse-in-any-top-pane-button-bar' } );
				if ( s.visible && ! msInAnyBB ) {
					prpFrameFnc ( { do: 'hide-transient-header' } ); }
			}
		}, 100 );
		
		//	Regardless, when the mouse leaves the button bar, hide the
		//	button bar.
		hide();

	},	//	mouseLeave()
	
	doAll ( o: any ) {
		let sW = 'PaneButtonBar doAll() ' + o.do;
		if ( o.to ) {
			sW += ' to ' + o.to; }
		if ( o.do === 'set-call-down' ) {
			if ( o.to === 'btn-split-horz' ) {
				self.bshFnc = o.bshFnc; 
			}
			if ( o.to === 'btn-split-vert' ) {
				self.bsvFnc = o.bsvFnc;
			}
			return;
		}
		if ( (o.do === 'split-horz') || (o.do === 'split-vert') ) {
			if ( prpContainerFnc ) {
				o.bbEleId = self.eleId;
				o.paneFnc = prpPaneFnc;
				prpContainerFnc ( o );
			} else {
			//	paneFnc ( o );	}
				prpPaneFnc ( o );	}
			return;
		}
		if ( o.do === 'set-left-and-width' ) {
			//	This command implies this button bar is part of the
			//	transient title bar at the top of the frame.  I.e., the top 
			//	of the pane borders the top of the frame.
			let sss: any = self.state.style;
			sss.left				= o.left  + 'px';
			sss.width				= o.width + 'px';
			sss.opacity			 	= '1.0';
			sss['transition-property']  = 'none';
			self.state.styleString = stringifyStyle ( self.state.style );
			return;
		}
		if ( o.do === 'get-left-and-width' ) {
			let style: any = self.state.style;
			if ( style && style.left && style.width ) {
				return { left: 	Number.parseInt ( style.left ),
						 width:	Number.parseInt ( style.width ) }; }
			return null;
		}
		if ( o.do === 'key-show' ) {
			self.show();
			return;
		}
		if ( o.do === 'disallow-pane-edits' ) {
			self.disallowShow = true; 
			let style = clone ( self.state.style );
			style.display = 'none';

			self.state.style = style;
			self.state.styleString = stringifyStyle ( self.state.style );
			return;
		}
	},	//	doAll()

};

	self.isFrameHeaderTransient =
		prpFrameFnc ( { do: 'is-header-transient' } );

	if ( prpAtFrameTop && self.isFrameHeaderTransient ) {
		self.state.style.top = '18px'; }

	self.state.styleString = stringifyStyle ( self.state.style );

	onMount ( () => {
		const sW = 'paneless PaneButtonBar  onMount()';
	//	cmn.log ( sW );
		if ( prpContainerFnc ) {
			prpContainerFnc ( { do: 			'set-call-down',
								to:				'button-bar',
								bbEleId:		self.eleId,
								bbFnc:			self.doAll  } ); }

		prpPaneFnc ( { do: 		'set-call-down',
					   to:		'button-bar',
					   bbEleId:	self.eleId,
					   bbFnc:	self.doAll } );	
	} )	//	onMount()

</script>

<pane-button-bar>

	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div id				= { self.eleId }
		 class			= 'rr-pane-button-bar' 
		 style 			= { self.state.styleString } 
		 on:mouseenter	= { self.mouseEnter }
		 on:mouseleave	= { self.mouseLeave }>
		<BtnBurger prpEleId		= { 'rr-bgr-' + prpBbId }
				   prpStyle		= { { position: 'absolute',
									  left:		'0px' } }
				   prpPaneFnc	= { prpPaneFnc } />
		<BtnSplitHorz prpEleId			= { 'rr-sh-' + prpBbId }
					  prpContainerFnc	= { prpContainerFnc }
					  prpBbFnc			= { self.doAll }
					  prpPaneFnc		= { prpPaneFnc } 
					  prpStyle 			= { {} } />
		<BtnSplitVert prpEleId			= { 'rr-sv-' + prpBbId }
					  prpContainerFnc	= { prpContainerFnc }
					  prpBbFnc			= { self.doAll }
					  prpPaneFnc		= { prpPaneFnc } 
					  prpStyle 			= { {} } />
	</div>

</pane-button-bar>

<style>

	.rr-pane-button-bar {
		position:               absolute;
		top:					0px;
		width:					100%;
		border-bottom: 			solid 1px;
		text-align:				center;
		cursor:					default;
		transition-property:    background-color, border-bottom-color, opacity;
		transition-duration:    300ms;
	}
</style>

