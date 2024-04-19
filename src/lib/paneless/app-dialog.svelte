<script lang="ts">

	import { onMount, onDestroy }	from 'svelte';
	import { cmn }		from './common';
	import Frame		from "./frame.svelte";
	import BurgerMenu 	from "./burger-menu.svelte";
	import DlgName 		from "./dlg-name.svelte";

	export let prpFrame: any			= null;
	export let prpOtherData: any		= null;
	export let prpAppFrameFnc: any		= null;
	export let prpAppContentFnc: any	= null;
	export let prpClientFnc: any		= null;
	export let prpUpFnc: any			= null;
	export let prpCtx: any				= null;
	export let prpDlg: any				= null;
	export let prpMnu: any				= null;
	export let prpRes: any 				= null;
	export let prpRej: any 				= null;
	export let prpComp: any				= null;
	export let prpScreenClass : any		= null;


/*
*/

let	frames					= <any> [];

let otherFrameId: number	= 0;

function makeOtherProps ( frm ) {
	otherFrameId = frm.frameId;
	return { props:  { hdrVisible:		frm.hdrVisible,
						ftrVisible:		frm.ftrVisible,
						frameName:		frm.frameName,
						frameType:		frm.frameType,
						frameId: 		frm.frameId,
						paneId:			frm.paneId,
						appFrameFnc:	prpAppFrameFnc, 
						appContentFnc:	prpAppContentFnc,
						left: 			frm.style.left,
						top:			frm.style.top,
						width: 			frm.style.width,
						height:			frm.style.height,
						iconized:		frm.iconized,
						clientFnc:		prpClientFnc } };
}	//	makeOtherProps()

if ( prpFrame ) {
	//	Displaying a frame.  Probably a modal dialog.
	//	It is displayed in front of a "screen" that covers the entire app and 
	//	thereby prevents the user from doing anything else but interact with
	//	the dialog.
	//	However the user might need Help. In that case the Help frame is also
	//	displayed in front of the screen ...
	//	Initially ...
	if ( prpOtherData ) {		//	I.e., Help?
		//	Put it behind the dialog.
		frames.push ( makeOtherProps ( prpOtherData.frame ) ); }
	//	Show dialog at front.
	frames.push ( {
		props: { hdrVisible:	prpFrame.hdrVisible,
				 ftrVisible:	prpFrame.ftrVisible,
				 frameName:		prpFrame.frameName,
				 frameType:		prpFrame.frameType,
				 frameAs:		'dialog',
				 frameId: 		prpFrame.frameId,
				 paneId:		prpFrame.paneId,
				 appFrameFnc:	prpAppFrameFnc,
				 appContentFnc:	prpAppContentFnc,
				 left: 			null,
				 top:			null,
				 width: 		prpFrame.style.width,
				 height:		prpFrame.style.height,
				 iconized:		null,
				 clientFnc:		prpClientFnc,
				 isCentered:	true }
	} );
}	//	if ( prpFrame )

let self = {

    state: {
	    menus:      <any> [],
    },

	click ( ev ) {
		prpAppFrameFnc ( { do: 'menu-dismiss' } );
	},	//	click()

	setPaneFocus ( o: any ): any {
		let sW = 'AppDialog setPaneFocus()';
		//	Maybe see AppContent setPaneFocus().
		//	Here, for now, we only change the frames' z-order.
	 	if ( frames.length < 2 ) {
			return; }
		if ( frames[0].props.frameId === o.frameId ) {
			let fa = [frames[1], frames[0]];
			frames = fa; 
			return; }
	},	//	setPaneFocus()

	doAll ( o ) {
		const sW = 'AppDialog doAll()  do ' + o.do;
		if ( o.do === 'menu-dismiss' ) {
			prpAppFrameFnc ( o );
			return;	}
		if ( o.do === 'push-sub-menu' ) {
			let m: any [] = self.state.menus;
			m.push ( { key:		o.menuEleId,
				 	   comp:	BurgerMenu,
					   props:	{ prpEleId:	o.menuEleId,
								  prpStyle:	{ left:	o.menuX + 'px',
											  top: 	o.menuY + 'px' },
								  prpItems:			o.menuItems,
								  prpAppFrameFnc:	prpAppFrameFnc,
								  prpScreenFnc: 	self.doAll,
								  prpUpFnc:			o.upFnc,
								  prpCtx:			o.ctx,
								  prpIsSubMenu:		true } } );
			self.state.menus = m;
			return; }
		if ( o.do === 'pop-sub-menu' ) {
			self.state.menus.pop();
			return; }
	
		if ( o.do === 'set-other-frame' ) {

			let fa = [frames[0]];
			fa.push ( makeOtherProps ( o.otherData.frame ) );
			frames = fa; 
			return;	}

		if ( o.do === 'extract-other-frame' ) {
			return Promise.resolve ( null ); }

		if ( o.do === 'get-other-frame-name' ) {
			if ( ! prpOtherData ) {
				return null; }
			return prpOtherData.name; }

		if ( o.do === 'set-pane-focus' ) {
			return self.setPaneFocus ( o );	}
	
		if ( o.do === 'destroy-frame' ) {
			if ( o.frameId !== otherFrameId ) {
				return false; }
			let fa = <any> [];
			if ( o.frameId === frames[0].props.frameId ) {
				if ( frames.length > 1 ) {
					fa.push ( frames[1] ); }
			}
			else
			if ( o.frameId === frames[1].props.frameId ) {
				fa.push ( frames[0] ); }
			if ( fa.length > 0 ) {
				otherFrameId = 0;
				frames = fa;
				return true; }
			return false; }

		if ( o.do = 'get-other-frame-id' ) {
			return otherFrameId; }
	},	//	doAll()

};	//	self

	if ( prpMnu ) {
		self.state.menus.push ( { key:      prpMnu.menuEleId,
								  comp:     BurgerMenu,
					props:    {
						prpEleId: 		prpMnu.menuEleId,
						prpStyle: 		{ left:	prpMnu.menuX + 'px',
										  top: 	prpMnu.menuY + 'px' },
						prpItems:		prpMnu.menuItems,
						prpAppFrameFnc:	prpAppFrameFnc,
						prpScreenFnc: 	self.doAll,
						prpUpFnc:		prpMnu.upFnc,
						prpCtx:			prpMnu.ctx,
						prpRes:			prpRes,
						prpRej:			prpRej,
				prpSelectedItemIndex:	prpMnu.menuSelectedItemIndex } } ); }

	onMount ( () => {
		if ( ! cmn.isFunction ( prpClientFnc ) ) {
			return; }
		prpClientFnc ( { do:	'app-dialog-up',
						 fnc:	self.doAll } );
	} );

	onDestroy ( () => {
		if ( ! cmn.isFunction ( prpClientFnc ) ) {
			return; }
		prpClientFnc ( { do:	'app-dialog-down',
						 fnc:	null } );
	} );

</script>

<app-dialog>

	{#if  prpFrame }
		<div class	= "app-screen-dialog" >
			{#each frames as f ( f.props.frameId ) }
				<Frame {...f.props}/>
			{/each}
		</div>
	{/if}
	{#if prpComp }
		{#if prpScreenClass }
			<div class	= { prpScreenClass } >
				<svelte:component this = { prpComp.comp } { ...prpComp.props }/>
			</div> 
		{:else}
			<div class	= "app-screen-dialog" >
				<svelte:component this = { prpComp.comp } { ...prpComp.props }/>
			</div> 
		{/if}
	{/if}
	{#if prpDlg === 'dlg-name' }
		<div class	= "app-screen-dialog" >
			<DlgName prpAppFrameFnc =	{ prpAppFrameFnc }
					 prpUpFnc = 		{ prpUpFnc }
					 prpCtx = 			{ prpCtx } />
		</div>
	{/if}
	{#if prpDlg === 'menu' }
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class = "app-screen-dialog"
				on:click	= { self.click } >
			{#each self.state.menus as m ( m.key ) }
				<svelte:component this = { m.comp } { ...m.props }/>
			{/each}
		</div>
	{/if}

</app-dialog>

<style>

	app-dialog {
		position:			absolute;
		width:				100%;
		height: 			100%;
	}

	.app-screen-dialog {
		position:           absolute;
		left:               0px;
		top:                0px;
		width:              100%;
		height:             100%;
		background-color:   rgba(255,255,255,0.7);
		display:            grid;
		align-items:        center;
		justify-items:		center;
	}

</style>
