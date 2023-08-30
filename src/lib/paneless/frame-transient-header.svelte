<script lang="ts">
	import { onMount, onDestroy }	from 'svelte';
	import { cmn }    	from './common';
	import FrameBurgerMenu		from './frame-burger-menu.svelte';
	import FrameTitle 			from './frame-title.svelte';
	import FrameIconize 		from './frame-iconize.svelte';	
	import FrameDestroy 		from './frame-destroy.svelte';
	import FrameTransientMover	from './frame-transient-mover.svelte';	


	export let prpFrameId		= 0;
	export let prpFrameName		= '';
	export let prpFrameFnc		= null;
	export let prpFrameBurger	= true;
	export let prpFrameTitle	= true;
	export let prpFrameIconize	= true;
	export let prpFrameDestroy	= true;

	function stringifyStyle ( style: any ): string {
		let s = '';
		for ( const p in style ) {
			s += p + ': ' + style[p] + '; '; };
		return s;
	}	//	stringifyStyle()

let self = {

		state: {
			frameName:	prpFrameName,
			class:	    "transient-title-bar",
			isVisible:  false,
			style:	    {
				'background-color':	'transparent',
				'border-bottom':    'solid 1px transparent',
				opacity:			'0.0',
				cursor:				'default',
				'pointer-events':	'unset',
				'justify-content':	'unset'
			},
			styleString:	'',
		},

		mouseIn:	false,

	show() {
		let bTransientMover = ! (   prpFrameBurger
								 || prpFrameTitle
								 || prpFrameIconize
								 || prpFrameDestroy);
		self.state.isVisible = true;
		self.state.style = {
			'background-color':	bTransientMover ? 'transparent' : 'white',
			'border-bottom':	'solid 1px gray',
			opacity:			'1.0',
			cursor:				bTransientMover ? 'default' : 'move',
			'pointer-events':	bTransientMover ? 'none' : 'unset',
			'justify-content':	bTransientMover ? 'center' : 'unset'
		};
		self.state.styleString = stringifyStyle ( self.state.style );
	},	//  show()

	hide() {
		if ( ! self.state.isVisible ) {
			return; }
		self.state.isVisible = false;
		self.state.style = {
			'background-color':	'transparent',
			'border-bottom':	'solid 1px transparent',
			opacity:			'0.0',
			cursor:				'default',
			'pointer-events':	'unset',
			'justify-content':	'unset'
		};
		self.state.styleString = stringifyStyle ( self.state.style );
	},	//  hide()

	mouseEnter ( ev ) {
		let sW = 'FrameTransientHeader mouseEnter()';
	//	cmn.log ( sW );
		self.mouseIn = true;
		if ( self.state.isVisible ) {
			return; }
		self.show();
	},	//	mouseEnter()
	
	mouseLeave ( ev ) {
		let sW = 'FrameTransientHeader mouseLeave()';
	//	cmn.log ( sW );

		self.mouseIn = false;

		let bTransientMover = ! (   prpFrameBurger
								 || prpFrameTitle
								 || prpFrameIconize
								 || prpFrameDestroy);
		if ( ! bTransientMover ) {
			self.hide();
			return; }

		window.setTimeout ( () => {
			let msInAnyBB = prpFrameFnc ( { 
				do: 'is-mouse-in-any-top-pane-button-bar' } );
			if ( msInAnyBB ) {
				return;	}
			self.hide();
		}, 100 );
	},	//	mouseLeave()
	
	mouseDown ( ev ) {
		let sW = 'mouseDown()';
	//	cmn.log ( sW );
		prpFrameFnc ( { do: 	'move-start',
								ev: 	ev } );
	},	//	mouseDown()

	doAll ( o ) {
		let sW = 'FrameTransientHeader doAll()';
		if ( o.do === 'is-visible' ) {
		//	cmn.log ( sW, ' do is-visible: ' + self.state.isVisible );
			return self.state.isVisible; }
		if ( o.do === 'show' ) {
			if ( self.state.isVisible ) {
				return; }
			self.show();
			return;	}
		if ( o.do === 'hide' ) {
		//	cmn.log ( sW, ' do hide' );
			self.hide();
			return;	}
		if ( o.do === 'get-status' ) {
			return { visible: self.state.isVisible,
					 mouseIn: self.mouseIn };
		}
		if ( o.do === 'set-frame-name' ) {
			self.state.frameName = o.name;
			return; }
		if ( o.do === 'mouse-enter' ) {
			self.mouseEnter ( o.ev );
			return; }
		if ( o.do === 'mouse-leave' ) {
			self.mouseLeave ( o.ev );
			return; }
		if ( o.do === 'mouse-down' ) {
			self.mouseDown ( o.ev );
			return; }
	},	//	doAll()

}

	self.state.styleString = stringifyStyle ( self.state.style );

	let bTransientMover = ! (   prpFrameBurger
							 || prpFrameTitle
							 || prpFrameIconize
							 || prpFrameDestroy);

	onMount ( () => {
		prpFrameFnc ( { do: 	'set-call-down',
						to:		'frame-header',
						fnc:	self.doAll } );
	} )	//	onMount()

	onDestroy ( () => {
		prpFrameFnc ( { do: 	'set-call-down',
						to:		'frame-header',
						fnc:	null } );
	} )	//	onDestroyg()

</script>

<frame-transient-header>

	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class			= { self.state.class }
		 style			= { self.state.styleString } 
		 on:mouseenter	= { self.mouseEnter }
		 on:mouseleave	= { self.mouseLeave }
		 on:mousedown	= { self.mouseDown } >
		{#if prpFrameBurger }
			<FrameBurgerMenu frameId	= { prpFrameId }
							 frameFnc 	= { prpFrameFnc } />
		{/if}
		{#if prpFrameTitle }
			<FrameTitle frameId		= { prpFrameId }
						titleText	= { self.state.frameName } />
		{/if}
		{#if prpFrameIconize }
			<FrameIconize frameId	= { prpFrameId }
						  frameFnc 	= { prpFrameFnc } />
		{/if}
		{#if prpFrameDestroy }
			<FrameDestroy frameId	= { prpFrameId }
						  frameFnc 	= { prpFrameFnc } />
		{/if}
		{#if ! (   prpFrameBurger
				|| prpFrameTitle
				|| prpFrameIconize
				|| prpFrameDestroy) }
			<FrameTransientMover frameId	= { prpFrameId }
						  		 frameFnc 	= { prpFrameFnc }
								 transientHeaderFnc = { self.doAll } />
		{/if}
	</div>

</frame-transient-header>


<style>

	.transient-title-bar {
		position:               absolute;
		display:				flex;
		flex-direction:			row;
		align-items: 			flex-start;
		width:					100%;
		height:					18px;
		cursor:                 move;
		transition-property:    background-color, opacity, border-bottom;
		transition-duration:    300ms;
	}

</style>