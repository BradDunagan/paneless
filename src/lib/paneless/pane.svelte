
<script lang="ts">
	import { onMount, onDestroy, afterUpdate }	from 'svelte';
	import { tick }		from 'svelte';
	import clone 		from 'clone';	//	In tsconfig.json, "allowjs": true	
	import { cmn }    	from './common';
	import { getPaneId }	from './pane-id';
	import PaneContent		from './pane-content.svelte';
	import PaneButtonBar	from './pane-button-bar.svelte';
	import BtnSplitRestore 	from './btn-split-restore.svelte';
	import PaneSplitter 	from './pane-splitter.svelte';

	export let prpFrameId		= 0;
	export let prpPaneId		= 0;
	export let prpFrameFnc		= null;
	export let prpTabs			= false;
	export let prpAtFrameTop	= true;
	export let prpAppContentFnc	= null;
	export let prpClientFnc		= null;
	export let prpStyle			= null;

	export let prpEleId			= null;
	export let prpTabId			= null;
	export let prpClass			= null;
	export let prpContentStyle	= '';
	export let prpClientContent	= null;
	export let prpParentFnc		= null;
	export let prpTabsFnc		= null;


	//	Helper function determines which prefixes of CSS calc we need.
	//	We only need to do this once on startup, when this anonymous function 
	//	is called.
	//
	//	Tests -webkit, -moz and -o prefixes. Modified from StackOverflow:
	//	http://stackoverflow.com/questions/16625140/js-feature-detection-to-detect-the-usage-of-webkit-calc-over-calc/16625167#16625167
	const calc = `${['', '-webkit-', '-moz-', '-o-']
		.filter(prefix => {
			const el = document.createElement('div')
			el.style.cssText = `width:${prefix}calc(9px)`
			return !!el.style.length
		})
		.shift()}calc`

	function stringifyStyle ( style: any ): string {
		let s = '';
		for ( const p in style ) {
			s += p + ': ' + style[p] + '; '; };
		return s;
	}	//	stringifyStyle()

const paneMinW 		= 1;
const paneMinH 		= 1;

let self = {

	eleId:	prpEleId ? prpEleId
					 : (prpTabId ? 'paneless-tab-' + prpTabId + '-pane'
							     : 'paneless-frame-' + prpFrameId + '-pane'),
	contentEleId:	'',
	className:		prpClass ? prpClass : 'pane',


	state:	{
		paneName:		'',
		style: 			prpStyle ? prpStyle : { },
		styleString:	'',

		contentStyle:	prpContentStyle,
		clientContent:	prpClientContent,

		containerStyle:		null,
		containerStyleString:	'',
		containerH0: 		0,
		splitHorz: 			null,
		shLftStyle:			null,
		shLftStyleString:	'',
		shSplitterStyle:	null,
		shSplitterStyleString:	'',
		shRgtStyle:			null,
		shRgtStyleString:	'',
		splitVert:			null,
		svTopStyle:			null,
		svTopStyleString:	'',
		svSplitterStyle:	null,
		svSplitterStyleString:	'',
		svBotStyle:			null,
		svBotStyleString:	'',

		tabs:			prpTabs ? true : false,

		hasFocus:		false,
		focusClass:		null,
	},

	mounted: 		false,

	tabsFnc: 		null,
	tabPagePanes:	{},		//	keyed by tab ID

	paneContentFnc: 		null,
	correctPaneContentFnc:	null,

	ccFnc:		null,
	ccState:	null,

	bbFnc:		null,
//	bsrFnc:		null,
	bbbFnc:		null,

	isShowingBurgerMenu: false,

	focusTimeoutId: 0,

	w0:			0,
	lftW0:		0,
	h0:			0,
	topH0:		0,
	prevCW: 	0,
	prevCH:		0,

	splitX0:	0,
	splitLft0:	0,
	splitY0:	0,
	splitTop0:	0,
	splitParentCH:	0,
	
	splitterFnc:	null,

//	vsH:		6,
//	hsW:		6,

	bPaneEditsAllowed:	true,

	//	Data associated with any element.  Keys are the elements' id.
	eleData:	{},
	
	bRelayoutAfterMount:	false,

	burgerClick ( o: any ) {
		let sW = 'paneless Pane burgerClick()';
	//	cmn.log ( sW );
		let menuItems: any[] = [];

		if (   (! self.ccFnc) 
			|| (! self.ccFnc ( { do: 'is-content-installed' } )) ) {
			menuItems.push ( { type: 'item',	text: 'Tabs' } ); }

		if ( prpTabId ) {
			menuItems.push ( { type: 'item',	text: 'Tab Name ...' } ); }

		menuItems.push ( { type: 'item',	text: 'Pane Name ...' } );

		if ( ! self.ccFnc ) {
			if ( menuItems.length > 0 ) {
				menuItems.push ( {type: 'separator', 	text: '' } ); }
			prpFrameFnc ( {
				do:			'append-menu-items',
				to:			'pane-burger',
				menuItems:	menuItems
			} ); }
		else {
			let ccMenuItems = [];
			self.ccFnc ( {
				do:			'append-menu-items',
				to:			'pane-burger',
				menuItems:	ccMenuItems
			} );
			if ( ccMenuItems.length > 0 ) {
				if ( menuItems.length > 0 ) {
					menuItems.push ( {type: 'separator', 	text: '' } ); }
				menuItems = menuItems.concat ( ccMenuItems );
			} }

		if ( prpParentFnc && ! prpTabId ) {	//	If a pane of a split ...
			if ( menuItems.length > 0 ) {
				menuItems.push ( {type: 'separator', 	text: '' } ); }
			menuItems.push ( { type: 'item',	text: 'Empty Pane' } ); 
			menuItems.push ( { type: 'item',	text: 'Remove Pane' } ); }

		let misi: null | number = null;
		if ( cmn.isString ( o.hotKey ) ) {
			misi = menuItems.findIndex ( mi => mi.hotKey === o.hotKey ); }
		let pe = document.getElementById ( self.eleId );
		let r  = pe.getBoundingClientRect();
		let pms = prpFrameFnc ( { 
            do: 		'show-menu',
            menuEleId:	self.eleId + '-burger-menu',
            menuX:		r.x - 1,
            menuY:		r.y - 1,
            menuItems:	menuItems,
			menuSelectedItemIndex:	misi,
            upFnc:		self.doAll,
            ctx:		{ what:		'pane burger',
						  dismiss:	'burger-menu-dismissed',
						  after:	'menu-item', }
		} );

		self.isShowingBurgerMenu = true;
		return pms;
	},	//	burgerClick()

	myElementStyleFnc ( dim, size, gutSize ) {
		const sW = 'myElementStyleFnc()';
	//	cmn.log ( sW, '  dim: ' + dim + '  size: ' + size );
		// Helper function checks if its argument is a string-like type
		function isString ( v ) {
			return (typeof v === 'string') || (v instanceof String);
		} 

		const style = {};
		if ( ! isString ( size ) ) {
				style[dim] = `${calc}(${size}% - ${gutSize}px)`;
		} else {
			style[dim] = size;
		}
		return style;
	},	//	myElementStyleFnc()

	splitDrag ( dX, x, w, dY, y, h ) {
		const sW = 'paneless Pane ' + prpPaneId + ' splitDrag()';
	//	cmn.log ( sW );
	//	cmn.log ( sW, 'dX ' + dX + '  x ' + x + '  w ' + w
	//			  + '  dY ' + dY + '  y ' + y + '  h ' + h )
		let rtn: { left:	null | any;
				   right:	null | any;
				   top:		null | any;
				   bottom:	null | any; }
				= { left:	null,
					right:	null,
					bottom:	null,
					top:	null };
		let cmd: any = { do:			'size', 
						 dX:			dX,
					 	 dY:			dY,
						 visitedPanes:	{} };
		let sh = self.state.splitHorz;
		if ( sh ) {
			if ( sh.left.paneFnc ) {
			//	cmn.log ( sW, 'sh - calling left.paneFnc()' );
				cmd.top   = 0;
				cmd.left  = 0;
				if ( x < paneMinW ) {
					x = paneMinW; }
				cmd.width = x;
				rtn.left = sh.left.paneFnc ( cmd ); }
			if ( sh.right.paneFnc ) {
			//	cmn.log ( sW, 'sh - calling right.paneFnc()' );
				cmd.top   = 0;
				cmd.left  = x + cmn.hsW;
				if ( w < paneMinW ) {
					w = paneMinW; }
				cmd.width = w;
				rtn.right = sh.right.paneFnc ( cmd ); }
			return rtn;
		}
		let sv = self.state.splitVert;
		if ( sv ) {
			if ( sv.top.paneFnc ) {
			//	cmn.log ( sW, 'sv - calling top.paneFnc()' );
				cmd.top    = 0;
				cmd.left   = 0;
				if ( y < paneMinH ) {
					y = paneMinH; }
				cmd.height = y;
				cmd.splitTop0 = self.splitTop0;
				rtn.top = sv.top.paneFnc ( cmd ); }
			if ( sv.bottom.paneFnc ) {
			//	cmn.log ( sW, 'sv - calling bottom.paneFnc()' );
				cmd.top    = y + cmn.vsH;
				cmd.left   = 0;
				if ( h < paneMinH ) {
					h = paneMinH; }
				cmd.height = h;
				cmd.splitTop0 = self.splitTop0;
				rtn.bottom = sv.bottom.paneFnc ( cmd ); }
			return rtn;
		}
		return rtn;
	},	//	splitDrag()

	splitPrep ( o ) {
		let sp: any = {};

		//  Get the content element
		sp.pe = document.getElementById ( self.contentEleId );

		//  Copy the current contents.
	//	sp.pet = sp.pe.textContent.trim()
	//	sp.pec = Array.from ( sp.pe.children );

		//  Delete the current contents.
		sp.pe.textContent = '';

		return sp;
	},	//	splitPrep()

	splitHorz ( o ) {
		let sW = 'paneless Pane ' + prpPaneId + ' splitHorz()';
	//	diagsFlush();
	//	diagsPrint ( sW, [2, 3], 2000 );
	//	diag ( 2, sW );
	//	cmn.log ( sW );

		prpFrameFnc ( { do: 'hide-transient-header' } );

		self.doAll ( { do: 'get-state' } );

		let sp = self.splitPrep ( o );
		
		let lftPaneId = getPaneId();
		let rgtPaneId = getPaneId();
		prpClientFnc ( {
			do:			'fix-pane-id',
			curPaneId:	prpPaneId,
			newPaneId:	lftPaneId,
			reason:		'split',
			frameId:	prpFrameId
		} );
		prpClientFnc ( {
			do:			'define-pane-content',
			frameId:	prpFrameId,
			paneId:		rgtPaneId
		} );

		let w  = parseInt ( self.state.style.width );
		let h  = parseInt ( self.state.style.height );
		let w2 = Math.round ( w / 2 );

		//	If you see red then something is wrong.
		self.state.style['background-color'] = 'red';
		self.state.styleString = stringifyStyle ( self.state.style );
		self.state.containerStyle = { width:	'100%',
									  height:	'100%' };
		self.state.containerStyleString = 
								stringifyStyle ( self.state.containerStyle );
		self.state.splitHorz = { 
			left: {
				eleId: 			self.eleId + '-lft-' + lftPaneId,
				class: 			'pane',
				paneId:			lftPaneId,
				paneFnc: 		null,
				contentState: 	null
			},
			right: {
				eleId: 			self.eleId + '-rgt-' + rgtPaneId,
				class: 			'pane',	
				paneId:			rgtPaneId,
				paneFnc: 		null,
			},
			incomplete: 	true };

		self.state.shLftStyle =	{ top:		'0px',
								  left:		'0px',
								  width:	w2 + 'px',
								  height:	h + 'px' };
		self.state.shLftStyleString = stringifyStyle ( self.state.shLftStyle );

		self.state.shSplitterStyle = { top:		'0px',
									   left:	w2 + 'px',
									   width:	cmn.hsW + 'px',
									   height:	'100%' };
		self.state.shSplitterStyleString = 
								stringifyStyle ( self.state.shSplitterStyle );

		self.state.shRgtStyle =	{ top:		'0px',
								  left:		w2 + cmn.hsW + 'px',
								  width:	(w - w2 - cmn.hsW) + 'px',
								  height:	h + 'px' };
		self.state.shRgtStyleString = stringifyStyle ( self.state.shRgtStyle );


		return { lftPaneId: lftPaneId,
				 rgtPaneId: rgtPaneId };
	},	//	splitHorz()

	splitVert ( o ) {
		let sW = 'paneless Pane ' + prpPaneId + '  splitVert()';
	//	diagsFlush();
	//	diagsPrint ( sW, [2, 3], 2000 );
	//	diag ( 2, sW );
	//	cmn.log ( sW );

		prpFrameFnc ( { do: 'hide-transient-header' } );

		self.doAll ( { do: 'get-state' } );

		let sp = self.splitPrep ( o );
		
		let topPaneId = getPaneId();
		let botPaneId = getPaneId();
		prpClientFnc ( {
			do:			'fix-pane-id',
			curPaneId:	prpPaneId,
			newPaneId:	topPaneId,
			reason:		'split',
			frameId:	prpFrameId
		} );
		prpClientFnc ( {
			do:			'define-pane-content',
			frameId:	prpFrameId,
			paneId:		botPaneId
		} );

		let w  = parseInt ( self.state.style.width );
		let h  = parseInt ( self.state.style.height );
		let h2 = Math.round ( h / 2 );

		//	If you see red then something is wrong.
		self.state.style['background-color'] = 'red';
		self.state.styleString = stringifyStyle ( self.state.style );

		self.state.containerStyle = {
			width:				'100%',
			height:				'100%' };
		self.state.containerStyleString = 
								stringifyStyle ( self.state.containerStyle );

		self.state.splitVert = { 
			top: {
				eleId: 			self.eleId + '-top-' + topPaneId,
				class: 			'pane',
				paneId:			topPaneId,
				paneFnc: 		null,
				contentState: 	null
			},
			bottom: {
				eleId: 			self.eleId + '-bot-' + botPaneId,
				class: 			'pane',	
				paneId:			botPaneId,
				paneFnc: 		null,
			},
			incomplete: 	true, };

		self.state.svTopStyle =	{ top:		'0px',
								  left:		'0px',
								  width:	w + 'px',
								  height:	h2 + 'px' };
		self.state.svTopStyleString = stringifyStyle ( self.state.svTopStyle );

		self.state.svSplitterStyle = { top:		h2 + 'px',
									   left:	'0px',
									   width:	'100%',
									   height:	cmn.vsH + 'px' };
		self.state.svSplitterStyleString = 
								stringifyStyle ( self.state.svSplitterStyle );

		cmn.log ( sW, 'setting top: ' + h2 + cmn.vsH + 'px' );

		self.state.svBotStyle =	{ top:		h2 + cmn.vsH + 'px',
								  left:		'0px',
								  width:	w + 'px',
								  height:	(h - h2 - cmn.vsH) + 'px' };
		self.state.svBotStyleString = stringifyStyle ( self.state.svBotStyle );


		return { topPaneId: topPaneId,
				 botPaneId: botPaneId };
	},	//	splitVert()

	dlgPaneName() {
		const sW = 'paneless Pane dlgPaneName()';
		cmn.log ( sW );
		prpFrameFnc ( { do: 	'show-name-dlg',
						upFnc: 	self.doAll,
						ctx: 	{ title:	'Pane Name',
								  curName:	self.state.paneName,
								  after: 	'name-pane-name' } } );
	},	//	dlgPaneName()

	namePaneName ( o ) {
		const sW = 'paneless Pane paneNamePane()';
		cmn.log ( sW );

		self.state.paneName = o.name;
		prpClientFnc ( { do:		'set-pane-name',
						 paneId:	prpPaneId,
						 name:		o.name } );
		
		//	Call the content to update any connections made with other panes.

	},	//	namePaneName()

	empty() {
		const sW = 'paneless Pane empty()';
		cmn.log ( sW );

		prpClientFnc ( { do:		'empty-pane',
						 paneId:	prpPaneId } );

	},	//	empty()

	remove() {
		const sW = 'paneless Pane remove()';
		cmn.log ( sW );

		prpParentFnc ( { do:			'unsplit',
						 removePaneId:	prpPaneId } );

	},	//	remove()

	unsplit ( o ) {
		const sW = 'paneless Pane unsplit()';
		cmn.log ( sW );

		//	One of the this pane's child panes is being removed. We keep its
		//	sibling and make this pane that sibling.
		
		let keepPaneId  = 0;
		let keepPaneFnc = null;

		let s = self.state;

		while ( s.splitHorz ) {
			let sh = s.splitHorz;
			if ( sh.left.paneId === o.removePaneId ) {
				keepPaneId  = sh.right.paneId;
				keepPaneFnc = sh.right.paneFnc; 
				break; }
			if ( sh.right.paneId === o.removePaneId ) {
				keepPaneId  = sh.left.paneId;
				keepPaneFnc = sh.left.paneFnc; 
				break; }
			cmn.error ( sW, 'can not find left or right pane to keep' );
			return; }

		while ( s.splitVert ) {
			let sv = s.splitVert;
			if ( sv.top.paneId === o.removePaneId ) {
				keepPaneId  = sv.bottom.paneId;
				keepPaneFnc = sv.bottom.paneFnc; 
				break; }
			if ( sv.bottom.paneId === o.removePaneId ) {
				keepPaneId  = sv.top.paneId;
				keepPaneFnc = sv.top.paneFnc; 
				break; }
			cmn.error ( sW, 'can not find top or bottom pane to keep' );
			return; }


		if ( ! cmn.isFunction ( keepPaneFnc ) ) {
			cmn.error ( sW, 'keepPaneFnc is not set' );
			return; }

		let keepState = keepPaneFnc ( { do: 'get-state' } );

		prpClientFnc ( { do:		'fix-pane-id',
						 curPaneId:	keepPaneId,
						 newPaneId:	prpPaneId,
						 reason:	'un-split',
						 frameId:	prpFrameId } );
		
		//	First, clear this pane.
		let ss = self.state;
		ss.containerStyle =		null;
		ss.containerStyleString = '';

	//	ss.splitHorz =			null;
		//	To get a reaction ...
		self.state.splitHorz =	null;

		ss.shLftStyle =			null;
		ss.shLftStyleString = '';
		ss.shSplitterStyle =	null;
		ss.shSplitterStyleString = '';
		ss.shRgtStyle =			null;
		ss.shRgtStyleString = '';

	//	ss.splitVert =			null;
		//	To get a reaction ...
		self.state.splitVert =	null;
		
		ss.svTopStyle =			null;
		ss.svTopStyleString = '';
		ss.svSplitterStyle =	null;
		ss.svSplitterStyleString = '';
		ss.svBotStyle =			null;
		ss.svBotStyleString = '';

		tick().then ( () => {
			cmn.log ( sW, 'setState cb 1st' );

			//	Now set this pane to what is being kept.
			if ( keepState.splitHorz ) {
				cmn.log ( sW, 'keepState.splitHorz' );
				let h  = parseInt ( self.state.style.height );
				let shLftStyle = clone ( keepState.shLftStyle );
					shLftStyle.height = h + 'px';
				let shRgtStyle = clone ( keepState.shRgtStyle );
					shRgtStyle.height = h + 'px';
				let kh = keepState.splitHorz;

				ss.containerStyle = {
						width:				'100%',
						height:				'100%' };
				ss.containerStyleString = stringifyStyle ( ss.containerStyle );
				ss.splitHorz = { 
						left: {
							eleId: 			kh.left.eleId,
							class: 			'pane',
							paneId:			kh.left.paneId,
							paneFnc: 		kh.left.paneFnc,
							contentState: 	null
						},
						right: {
							eleId: 			kh.right.eleId,
							class: 			'pane',	
							paneId:			kh.right.paneId,
							paneFnc: 		kh.right.paneFnc,
						},
						incomplete: 	true };
				ss.shLftStyle =	shLftStyle;
				ss.shLftStyleString = stringifyStyle ( ss.shLftStyle );
				ss.shSplitterStyle = keepState.shSplitterStyle;
				ss.shSplitterStyleString = 
										stringifyStyle ( ss.shSplitterStyle );
				ss.shRgtStyle = shRgtStyle;
				ss.shRgtStyleString = stringifyStyle ( ss.shRgtStyle ); }
			else
			if ( keepState.splitVert ) {
				cmn.log ( sW, 'keepState.splitVert' );
				let w  = parseInt ( self.state.style.width );
				let svTopStyle = clone ( keepState.svTopStyle );
					svTopStyle.width = w + 'px';
				let svBotStyle = clone ( keepState.svBotStyle );
					svBotStyle.width = w + 'px';
				let kv = keepState.splitVert;

				ss.containerStyle = {
						width:				'100%',
						height:				'100%' };
				ss.splitVert = { 
						top: {
							eleId: 			kv.top.eleId,
							class: 			'pane',
							paneId:			kv.top.paneId,
							paneFnc: 		kv.top.paneFnc,
							contentState: 	null
						},
						bottom: {
							eleId: 			kv.bottom.eleId,
							class: 			'pane',	
							paneId:			kv.bottom.paneId,
							paneFnc: 		kv.bottom.paneFnc,
						},
						incomplete: 	true };
				ss.svTopStyle =	svTopStyle;
				ss.svTopStyleString = stringifyStyle ( ss.svTopStyle );
				ss.svSplitterStyle = keepState.svSplitterStyle;
				ss.svSplitterStyleString = 
									stringifyStyle ( ss.svSplitterStyle );
				ss.svBotStyle =	svBotStyle;
				ss.svBotStyleString = stringifyStyle ( ss.svBotStyle ); }
			else {
				cmn.log ( sW, 'not keeping anything' );
				return; }
			tick().then (  () => {
				cmn.log ( sW, 'setState cb 2nd' );
			} );
		} );
	},	//	unsplit()

	hsplitterPointerDown ( ev, locked ) {
		const sW = 'paneless Pane hsplitterPointerDown()';
	//	cmn.log ( sW );

		//	To test, comment these three lines.
		let e = document.getElementById ( self.eleId + '-hsplitter' );
		e.onpointermove = self.hsplitterSlide;
		e.setPointerCapture ( ev.pointerId );

		self.splitX0   = ev.pageX;
		self.splitLft0 = parseFloat ( self.state.shSplitterStyle.left );
		prpFrameFnc ( { do: 				'size-start',
						ev: 				ev,
						bSplitterMoving:	true } );

		//	To test.
	//	self.hsplitterSlide ( { pageX: self.splitX0 + 13 } );

	},	//	hsplitterPointerDown()

	vsplitterPointerDown ( ev, locked ) {
		const sW = 'paneless Pane vsplitterPointerDown()';
	//	cmn.log ( sW );

		//	To test, comment these three lines.
		let e = document.getElementById ( self.eleId + '-vsplitter' );
		e.onpointermove = self.vsplitterSlide;
		e.setPointerCapture ( ev.pointerId );

		self.splitY0	= ev.pageY;
		self.splitTop0	= parseFloat ( self.state.svSplitterStyle.top );
		prpFrameFnc ( { do: 				'size-start',
						ev: 				ev,
						bSplitterMoving:	true } );

		//	To test.
	//	self.vsplitterSlide ( { pageY: self.splitY0 + 3 } );

	},	//	vsplitterPointerDown()

	hsplitterPointerUp ( ev, locked ) {
		const sW = 'paneless Pane hsplitterPointerUp()';
	//	cmn.log ( sW );
		let e = document.getElementById ( self.eleId + '-hsplitter' );
		e.onpointermove = null;
		e.releasePointerCapture ( ev.pointerId );
	},	//	hsplitterPointerUp()

	vsplitterPointerUp ( ev, locked ) {
		const sW = 'paneless Pane vsplitterPointerUp()';
	//	cmn.log ( sW );
		let e = document.getElementById ( self.eleId + '-vsplitter' );
		e.onpointermove = null;
		e.releasePointerCapture ( ev.pointerId );
	},	//	vsplitterPointerUp()

	hsplitterSlide ( ev ) {
		const sW = 'paneless Pane hsplitterSlide()';

		let w = parseInt ( self.state.style.width );
		let shSS = clone ( self.state.shSplitterStyle );
		let dX   = Math.round ( ev.pageX - self.splitX0 );
		let lftW = self.splitLft0 + dX;
		if ( lftW < paneMinW ) {
			lftW = paneMinW; }
		let maxW = w - cmn.hsW - paneMinW;
		if ( lftW > maxW ) {
			lftW = maxW; }
	//	cmn.log ( sW, 'dX ' + dX + '   lftW ' + lftW );
		shSS.left = lftW + 'px';
		self.state.shSplitterStyle = shSS;
		self.state.shSplitterStyleString = 
							stringifyStyle ( self.state.shSplitterStyle );
		tick().then ( () => {
			let rgtW = w - lftW - cmn.hsW;
			let r = self.splitDrag ( dX, lftW, rgtW, 0, 0, 0 ); 
			if ( r ) {
				let e  = <HTMLElement>document.getElementById ( self.eleId );
				let cr = e.getBoundingClientRect();
				let	prevRatio = self.splitLft0 / cr.width;
				if ( r.left && r.left.bMinimized ) {
					self.splitterFnc ( { do: 		'set-minimized',
										 minimized:	'left',
										 prevRatio:	prevRatio } ); }
				else
				if ( r.right && r.right.bMinimized ) {
					self.splitterFnc ( { do: 		'set-minimized',
										 minimized:	'right',
										 prevRatio:	prevRatio } ); }
				else
					self.splitterFnc ( { do: 		'set-minimized',
										 minimized:	false } ); 
			} 
		 } );
	},	//	hsplitterSlide()

	vsplitterSlide ( ev ) {
		const sW = 'paneless Pane vsplitterSlide()';

		let h = parseInt ( self.state.style.height );
		let svSS = clone ( self.state.svSplitterStyle );
		let dY   = Math.round ( ev.pageY - self.splitY0 );
		let topH = self.splitTop0 + dY;
		if ( topH < paneMinH ) {
			topH = paneMinH; }
		let maxH = h - cmn.vsH - paneMinH;
		if ( topH > maxH ) {
			topH = maxH; }
	//	cmn.log ( sW, 'dY ' + dY + '   topH ' + topH );
		svSS.top    = topH + 'px';
		self.state.svSplitterStyle = svSS;
		self.state.svSplitterStyleString = 
							stringifyStyle ( self.state.svSplitterStyle );
		tick().then ( () => {
			let botH = h - topH - cmn.vsH;
			let r = self.splitDrag ( 0, 0, 0, dY, topH, botH ); 
			if ( r ) {
				let e  = <HTMLElement>document.getElementById ( self.eleId );
				let cr = e.getBoundingClientRect();
				let	prevRatio = self.splitTop0 / cr.height;
				if ( r.top && r.top.bMinimized ) {
					self.splitterFnc ( { do: 		'set-minimized',
										 minimized:	'top',
										 prevRatio:	prevRatio } ); }
				else
				if ( r.bottom && r.bottom.bMinimized ) {
					self.splitterFnc ( { do: 		'set-minimized',
										 minimized:	'bottom',
										 prevRatio:	prevRatio } ); }
				else
					self.splitterFnc ( { do: 		'set-minimized',
										 minimized:	false } ); 
			} 
		 } );
	},	//	vsplitterSlide()

	isBottomOfSplit ( o?: any ) {
		if ( o && o.paneId ) {
			let sv = self.state.splitVert;
			if ( ! sv ) {
				return false; }
			return sv.bottom.paneId === o.paneId; }
		if ( ! prpParentFnc ) {
			return false; }
		return prpParentFnc ( { do: 	'is-bottom-pane',
								paneId:	prpPaneId } );
	},	//	isBottomOfSplit()

	isRightOfSplit ( o?: any ) {
		if ( o && o.paneId ) {
			let sh = self.state.splitHorz;
			if ( ! sh ) {
				return false; }
			return sh.right.paneId === o.paneId; }
		if ( ! prpParentFnc ) {
			return false; }
		return prpParentFnc ( { do: 	'is-right-pane',
								paneId:	prpPaneId } );
	},	//	isRightOfSplit()

	propagateDown_SizeOp ( o ) {
		const sW = 'paneless Pane ' + prpPaneId + ' propagateDown_SizeOp() ' 
				   + self.eleId + '  ' + o.do;
	//	cmn.log ( sW );
		let rtn = { bError:		true,
					bMinimized:	false };
		if ( ! self.mounted ) {
			cmn.error ( sW, 'not mounted' );
			return rtn; }
		let e = document.getElementById ( self.eleId );
		if ( ! e ) {
			cmn.error ( sW, 'no element' );
			return rtn; }
	//	let info = '';
	//	if ( cmn.isNumber ( o.parentCW ) && cmn.isNumber ( o.parentCH ) ) {
	//		info += '  pcWH ' + o.parentCW + ' ' + o.parentCH; }
	//	info += '  cWH ' + e.clientWidth + ' ' + e.clientHeight;
	//	if ( cmn.isNumber ( o.dX ) && cmn.isNumber ( o.dY ) ) {
	//		info += '  dXY ' + o.dX + ' ' + o.dY; }
	//	if ( cmn.isNumber ( o.width ) ) {
	//		info += '  width ' + o.width; }
	//	if ( cmn.isNumber ( o.height ) ) {
	//		info += '  height ' + o.height; }
	//	cmn.log ( sW + info );

		let sh = self.state.splitHorz;
		if ( sh ) {
			let locked = self.splitterFnc 
								? self.splitterFnc ( { do: 'get-locked' } )
								: false;
			let minimized = self.splitterFnc 
								? self.splitterFnc ( { do: 'get-minimized' } )
								: false;
			while ( o.do === 'size-start' ) {
				self.w0    = parseFloat ( self.state.style.width );
				self.h0    = parseFloat ( self.state.style.height );
				self.lftW0 = parseFloat ( self.state.shSplitterStyle.left );
				sh.left.paneFnc ( o );
				sh.right.paneFnc ( o ); 
				break; }
			while ( o.do === 'size' ) {
				let w = null, h = null;
			//	if ( locked === 'left' ) {
			//		break; }

				let bos = self.isBottomOfSplit();
				let ros = self.isRightOfSplit();

				if ( cmn.isNumber ( o.width ) ) {
					w = o.width; }
				else {
					w = self.w0 + (ros ? -o.dX : o.dX); }

				if ( cmn.isNumber ( o.height ) ) {
					h = o.height; }
				else {
					h = self.h0 + o.dY; }

				if ( 	((w <= paneMinW) || (h <= paneMinH))
					 && ! o.minimized ) {
					rtn.bMinimized = true;
				}

				let lftW;
				if ( locked === 'right' ) {
					if ( typeof o.dX === 'undefined' ) {
						break; }
					lftW = self.lftW0 + o.dX; }
				//	cmn.log ( sW, 'dX ' + o.dX 
				//				+ '  lftW ' + lftW ); }
				else {
				if ( locked === 'left' ) {
					lftW = self.lftW0; }
				else {
				if ( minimized === 'left' ) {
					lftW = paneMinW; }
				else {
				if ( minimized === 'right' ) {
					lftW = self.prevCW - cmn.hsW - paneMinW; }
				else {
					let wp = self.lftW0 / self.w0;
					lftW = Math.round ( w * wp ); } } } }
				//	cmn.log ( sW, 'w ' + w 
				//				+ '  wp ' + wp 
				//				+ '  lftW ' + lftW ); } }
				if ( ! Number.isSafeInteger ( lftW ) ) {
					break; }


				let s = clone ( self.state.style );
					if ( ros ) {
						s.left = parseInt ( o.left ) + 'px'; }
					if ( bos ) {
						s.top  = parseInt ( o.top ) + 'px'; }
					s.width  = w + 'px';
					s.height = h + 'px';

				self.state.style = s;
				self.state.styleString = stringifyStyle ( self.state.style );

				self.state.shSplitterStyle.left = parseInt ( lftW ) + 'px';
				self.state.shSplitterStyleString =
								stringifyStyle ( self.state.shSplitterStyle );

				tick().then ( () => { 
					o.dX	 = lftW - self.lftW0;
					o.dY	 = h - self.h0;
					o.width  = null;
					o.height = h;
					sh.left.paneFnc ( o );

					o.dX	 = -o.dX;
					o.dY	 = h - self.h0;
					o.left   = lftW + cmn.hsW;
					o.width  = w - o.left;
					o.height = h;
					sh.right.paneFnc ( o ); 
				} );

				self.prevCW = w;
				break; }
		//	sh.left.paneFnc ( o );
		//	sh.right.paneFnc ( o );	
		}

		let sv = self.state.splitVert;

		if ( sv ) {
			let locked = self.splitterFnc 
								? self.splitterFnc ( { do: 'get-locked' } )
								: false;
			let minimized = self.splitterFnc 
								? self.splitterFnc ( { do: 'get-minimized' } )
								: false;
			while ( o.do === 'size-start' ) {
				self.w0    = parseFloat ( self.state.style.width );
				self.h0    = parseFloat ( self.state.style.height );
				self.topH0 = parseFloat ( self.state.svSplitterStyle.top );
				sv.top.paneFnc ( o );
				sv.bottom.paneFnc ( o ); 
				break; }
			while ( o.do === 'size' ) {
				let w = null, h = null;

				let ros = self.isRightOfSplit();
				let bos = self.isBottomOfSplit();

				if ( cmn.isNumber ( o.width ) ) {
					w = o.width; }
				else {
					w = self.w0 + (ros ? -o.dX : o.dX); }

				if ( cmn.isNumber ( o.height ) ) {
					h = o.height; }
				else {
					h = self.h0 + (bos ? -o.dY : o.dY); }

				if ( 	((w <= paneMinW) || (h <= paneMinH))
					 && ! o.minimized ) {
					rtn.bMinimized = true;
				}

				let topH;
				if ( locked === 'bottom' ) {
					let dY = o.dY;
					if ( 	(o.why === 'footer-updated')
						 ||	(o.why === 'header-updated') ) {
						if ( 	(typeof self.prevCH !== 'number')
							 ||	(       self.prevCH  <= 0       ) ) {
							break; }
						dY = h - self.prevCH; }
					if ( typeof dY === 'undefined' ) {
						break; }
					topH = self.topH0 + dY; }
				//	cmn.log ( sW, 'dY ' + dY 
				//				+ '  topH ' + topH ); }
				else {
				if ( locked === 'top' ) {
					topH = self.topH0; }
				else {
				if ( minimized === 'top' ) {
					topH = paneMinH; }
				else {
				if ( minimized === 'bottom' ) {
					topH = self.prevCH - cmn.vsH - paneMinH; }
				else {
					let hp = self.topH0 / self.h0;
					topH = Math.round ( h * hp );  } } } } 
				//	cmn.log ( sW, 'h ' + h 
				//				+ '  hp ' + hp 
				//				+ '  topH ' + topH ); } }
				if ( ! Number.isSafeInteger ( topH ) ) {
					break; }

				let s = clone ( self.state.style );
					if ( ros ) {
						s.left = parseInt ( o.left ) + 'px'; }
					if ( bos ) {
						s.top = parseInt ( o.top ) + 'px'; }
					s.width  = w + 'px';
					s.height = h + 'px';

			//	cmn.log ( sW, 'top ' + s.top + '  h ' + s.height );

				self.state.style = s;
				self.state.styleString = stringifyStyle ( self.state.style );

				self.state.svSplitterStyle.top = parseInt ( topH ) + 'px';
				self.state.svSplitterStyleString =
								stringifyStyle ( self.state.svSplitterStyle );
				
				tick().then ( () => { 
					o.minimized = minimized;

					o.dY	 = topH - self.topH0;
					o.width  = w;
					o.height = null;
					sv.top.paneFnc ( o );

					o.dY	 = -o.dY;
					o.top	 = topH + cmn.vsH;
					o.width  = w;
					o.height = h - o.top;
					sv.bottom.paneFnc ( o ); 
				} );

				self.prevCH = h;
				break; }
		//	sv.top.paneFnc ( o );
		//	sv.bottom.paneFnc ( o ); 
		}

		let w: null | number = null, 
			h: null | number = null;
		while ( ((! sh) && (! sv)) || prpTabId ) {

			let ch = e.clientHeight;
			while ( o.do === 'size-start' ) {
				self.w0  = e.clientWidth;
				self.h0  = e.clientHeight;
				if ( o.bSplitterMoving ) {
					self.splitParentCH = o.parentCH; }
				break; }
		//	while ( o.do === 'size' ) {
			while (    (o.do === 'size')
					|| (o.do === 'splitter-dragged') ) {

		//		cmn.log ( sW, 'prevCH ' + self.prevCH 
		//					+ '  ch ' + ch
		//					+ '  dY ' + o.dY );

				let ros = self.isRightOfSplit();
				let bos = self.isBottomOfSplit();

				if ( cmn.isNumber ( o.width ) ) {
					w = o.width; }
				else {
					w = self.w0 + (ros ? -o.dX : o.dX); }

				if ( cmn.isNumber ( o.height ) ) {
					h = o.height; }
				else {
					let dY = o.dY;
			//		if ( 	(o.why === 'footer-updated')
			//			 ||	(o.why === 'header-updated') ) {
			//			if ( 	(typeof self.prevCH !== 'number')
			//				 ||	(       self.prevCH  <= 0       ) ) {
			//				break; }
			//			dY = ch - self.prevCH; }
					if ( o.why === 'header-updated' ) {
						dY = o.headerVisible ? -o.headerH : o.headerH; }
					if ( o.why === 'footer-updated' ) {
						dY = o.footerVisible ? -o.footerH : o.footerH; }
				//	if ( typeof dY === 'undefined' ) {
					if ( ! cmn.isNumber ( dY ) ) {
						break; }

					h = self.h0 + (bos ? -o.dY : o.dY); }

				if ( h === null ) {
					cmn.error ( sW, 'h is null' );
					break; }

				if ( w < paneMinW ) {
					w = paneMinW; }
				if ( h < paneMinH ) {
					h = paneMinH; }

				let s = clone ( self.state.style );
					s.width  = w + 'px';
					s.height = h + 'px';
				//	s.left   = o.left;
					if ( ros ) {
						s.left = parseInt ( o.left ) + 'px'; }
				//	s.top    = o.top;
					if ( bos ) {
						s.top = parseInt ( o.top ) + 'px'; }
					if ( parseInt ( s.top ) < 0 ) {
						cmn.error ( sW, 'top < 0' ); }

			//	cmn.log ( sW, 'top ' + s.top 
			//				+ '  h ' + s.height 
			//				+ '  w ' + s.width);
				
				if ( 	((w <= paneMinW) || (h <= paneMinH))
					 && ! o.minimized ) {
					if ( 	self.bPaneEditsAllowed 
						 && cmn.isFunction ( self.bbFnc ) ) {
						self.bbFnc ( { do:	'disallow-pane-edits' } ); }
					rtn.bMinimized = true;
				}
				else {
				if ( ! o.minimized ) {
					if ( 	self.bPaneEditsAllowed 
						 && cmn.isFunction ( self.bbFnc ) ) {
						self.bbFnc ( { do:	'allow-pane-edits' } ); }
				} }

				self.state.style = s;
				self.state.styleString = stringifyStyle ( self.state.style );

				tick().then ( () => { 
					if ( self.ccFnc ) {
						o.paneW = w;
						o.paneH = h;
						self.ccFnc ( o ); }
				} );
				break; }
		//	if ( o.do !== 'size-start' ) {
		//	//	self.prevCH = ch; }
		//		self.prevCH += h - ch; }
		break; }

	//	if ( self.tabPagesFnc ) {
	//		self.tabPagesFnc ( o ); }
		if ( cmn.isFunction ( self.tabsFnc ) ) {
			let wh = self.tabsFnc ( { do: 'get-tab-names-wh' } );
			o.width  = w;
		//	o.height = h - wh.height - 1;
			o.height = h - wh.height;
			self.tabsFnc ( o );							//	update page props
			for ( var tabId in self.tabPagePanes ) {
				let pagePane = self.tabPagePanes[tabId];
				//	One tab pane active at a time, so, all but one page's pane 
				//	fnc will (might?) be null.
				if ( pagePane.paneFnc ) {
					pagePane.paneFnc ( o );	} } 
			delete o.width;
			delete o.height; }

	//	if ( self.ccFnc ) {
	//		o.paneW = e.clientWidth;
	//		o.paneH = e.clientHeight;
	//		self.ccFnc ( o ); }
		
		rtn.bError = false;
		return rtn;
	},	//	propagateDown_SizeOp()

	enumPanes ( o ) {
		let sh = self.state.splitHorz;
		if ( sh && cmn.isFunction ( sh.left.paneFnc ) 
				&& cmn.isFunction ( sh.right.paneFnc )) {
			sh.left.paneFnc ( o );
			sh.right.paneFnc ( o );	
			return; }
		let sv = self.state.splitVert;
		if ( sv && cmn.isFunction ( sv.top.paneFnc )
				&& cmn.isFunction ( sv.bottom.paneFnc ) ) {
			sv.top.paneFnc ( o );
			sv.bottom.paneFnc ( o ); 
			return; }
		o.panes[prpPaneId] = self.doAll; 
	},	//	enumPanes()

	keyBurgerMenu ( o ) {
		if ( self.tabsFnc ) {
			self.tabsFnc ( o );
			return; }
		if ( self.isShowingBurgerMenu ) {
			prpFrameFnc ( { do: 'menu-dismiss' } );
			prpFrameFnc ( { do: 'show-burger-menu' } );
			return;
		}
		self.burgerClick ( o );
	},	//	keyBurgerMenu()

	focus ( o ) {
		const sW = 'paneless Pane ' + prpPaneId + ' focus()';
		cmn.log ( sW );
		if ( self.focusTimeoutId ) {
			window.clearTimeout ( self.focusTimeoutId );
			self.focusTimeoutId = 0; }

	//	self.state.hasFocus		= true;
	//	self.state.focusClass	= 'pane-focused-rect';
	//	self.focusTimeoutId = window.setTimeout ( () => {
	//		self.state.hasFocus		= true;
	//		self.state.focusClass	= 'pane-focused-rect-transition';
	//	}, 1000 );
	//	Turning this focus indicator off for now.  This should be a user 
	//	preference.

		if ( self.ccFnc ) {
			self.ccFnc ( o ); }
	},	//	focus()

	focusNot ( o ) {
		const sW = 'paneless Pane ' + prpPaneId + ' focusNot()';
	//	cmn.log ( sW );
		if ( self.focusTimeoutId ) {
			window.clearTimeout ( self.focusTimeoutId );
			self.focusTimeoutId = 0; }
		self.state.hasFocus = false;
		if ( self.ccFnc ) {
			self.ccFnc ( o ); }
	},	//	focusNot()

	doGetState ( o ) {
		const sW = 'paneless Pane ' + prpPaneId + ' doGetState()';
		let pe = document.getElementById ( self.eleId );
		let state: any = clone ( self.state );
		let sh = state.splitHorz;
		let sv = state.splitVert;
		if ( o.do === 'get-state-2' ) {
			o = clone ( o );
			o.do = 'get-state'; }
		if ( sh ) {
			sh.left.contentState = sh.left.paneFnc ( o );
			sh.right.contentState = sh.right.paneFnc ( o );
			sh.properties = self.splitterFnc 
								? self.splitterFnc ( { do: 'get-state' } )
								: null;
			state.shLftStyle      = sh.left.paneFnc ( { do: 'get-style' } );
			state.shSplitterStyle = self.splitterFnc ( { do: 'get-style' } );
			state.shRgtStyle      = sh.right.paneFnc ( { do: 'get-style' } );
			sh.left.paneFnc  = null;
			sh.right.paneFnc = null; 
		}
		if ( sv ) {
			sv.top.contentState = sv.top.paneFnc ( o );
			sv.bottom.contentState = sv.bottom.paneFnc ( o );
			sv.properties = self.splitterFnc 
								? self.splitterFnc ( { do: 'get-state' } )
								: null;
			state.svTopStyle      = sv.top.paneFnc ( { do: 'get-style' } );
			state.svSplitterStyle = self.splitterFnc ( { do: 'get-style' } );
			state.svBotStyle      = sv.bottom.paneFnc ( { do: 'get-style' } );
			sv.top.paneFnc    = null;
			sv.bottom.paneFnc = null; 
		}
		if ( (! sh) && (! sv) && self.ccFnc ) {
			state.ccState = self.ccFnc ( o );
		} else {
			state.ccState = null; }
		if ( self.state.tabs ) {
			state.tabsState = self.tabsFnc ( o );
		//	cmn.log ( 'got tabsState' );
		} else {
			state.tabsState = false; }

		return state;
	},	//	doGetState()

	doSetState ( state: any, bNotCC? : boolean ) {
		const sW = 'paneless Pane ' + prpPaneId + ' doSetState()';
		self.state.paneName = cmn.isString ( state.paneName )
									? state.paneName
									: '';
		let sh = state.splitHorz;
		let sv = state.splitVert;
		if ( (! prpParentFnc) && (sh || sv) ) {
		//	cmn.log ( sW, 'top pane' );
			prpFrameFnc ( { do: 'clear-pane-btn-bars' } ); }

		if ( sh ) {
			sh.incomplete			= true; }
		if ( sv ) {
			sv.incomplete			= true; }
	//	2022-Jun-09		Viewport2 - when the app is restored -
	//	'set-state' is invoked twice -
	//	-	Viewport2's onMount(), 'set-call-down', 'client-content'.
	//		and
	//	-	And this (what is commented out above), in afterUpdate() (below)
	//		'set-state' is called directly.

		while ( (! sh) && (! sv) && state.ccState ) {
			if ( cmn.isBoolean ( bNotCC ) && bNotCC ) {
				break; }
			if ( self.ccFnc ) {
			//	cmn.log ( sW, ' set-state: self.ccFnc is set' );
				self.ccFnc ( { do: 		'set-state',
							   state:	state.ccState } );
			} else {
				//	Set client content state when we get the ccFnc.
				self.ccState = state.ccState;
			}
			delete state.ccState; 
			break; }
			
		let tabsState = state.tabsState;
		delete state.tabsState;

	//	cmn.error ( sW, '   mocking   state.style  for sign-in dialog' );
	//	state.style = { width:  '449px',
	//					height: '282px',
	//					top:	'0px',
	//					left:	'0px' };
		/*
		if ( cmn.isObject ( self.state.style ) ) {
			cmn.log ( sW, '  ignoring state style  ' );
			state.style = clone ( self.state.style );
			state.splitVert = null;
			state.svTopStyle      = null;
			state.svSplitterStyle = null;
			state.svBotStyle      = null;
			state.splitHorz = null;
			state.shLftStyle      = null;
			state.shSplitterStyle = null;
			state.shRgtStyle      = null; } 
		*/
	//	if (    state.splitVert 
	//		 && state.svBotStyle.flex && state.svTopStyle.flex ) {
		if (    state.splitVert ) {
		//	cmn.log ( sW, '  ignoring state style, removing flex  ' );
		//	state.style = clone ( self.state.style );
			self.state.containerStyle = { width:	'100%',
										  height:	'100%' };
			self.state.containerStyleString = 
								stringifyStyle ( self.state.containerStyle );

			let w = parseInt ( self.state.style.width );
			let h = parseInt ( self.state.style.height );
			let ts = state.svTopStyle;
			let topH = parseInt ( cmn.isString ( ts.minHeight ) ? ts.minHeight
																: ts.height );
			self.state.svTopStyle = { top:		'0px',
									  left:		'0px',
									  width:	w + 'px',
									  height:	topH + 'px' };
			self.state.svTopStyleString = 
								stringifyStyle ( self.state.svTopStyle );

			self.state.svSplitterStyle = { top:		topH + 'px',
										   left:	'0px',
										   width:	'100%',
										   height:	cmn.vsH + 'px' };
			self.state.svSplitterStyleString =
								stringifyStyle ( self.state.svSplitterStyle );

			self.state.svBotStyle = { top:		topH + cmn.vsH + 'px',
									  left:		'0px',
									  width:	w + 'px',
									  height:	(h - topH - cmn.vsH) + 'px' };
			self.state.svBotStyleString = 
								stringifyStyle ( self.state.svBotStyle );
		}
		else {
		//	if (	state.splitHorz 
		//	 	 && state.shRgtStyle.flex && state.shLftStyle.flex ) {
			if (	state.splitHorz ) { 
			//	cmn.log ( sW, '  ignoring state style, removing flex  ' );
			//	state.style = clone ( self.state.style );
				self.state.containerStyle = { width:	'100%',
											  height:	'100%' };
				self.state.containerStyleString =
								stringifyStyle ( self.state.containerStyle );

				let w = parseInt ( self.state.style.width );
				let h = parseInt ( self.state.style.height );
				let ls = state.shLftStyle;
				let lftW = parseInt ( cmn.isString ( ls.minWidth ) ? ls.minWidth
																   : ls.width );
				self.state.shLftStyle = { top:		'0px',
										  left:		'0px',
										  width:	lftW + 'px',
										  height:	h + 'px' };
				self.state.shLftStyleString =
								stringifyStyle ( self.state.shLftStyle );

				self.state.shSplitterStyle = { top:		'0px',
											   left:	lftW + 'px',
											   width:	cmn.hsW + 'px',
											   height:	'100%' };
				self.state.shSplitterStyleString =
								stringifyStyle ( self.state.shSplitterStyle );

				self.state.shRgtStyle = { top:		'0px',
										  left:		lftW + cmn.hsW + 'px',
										  width: (w - lftW - cmn.hsW) + 'px',
										  height:	h + 'px' };
				self.state.shRgtStyleString =
								stringifyStyle ( self.state.shRgtStyle );
			} }
		//	else {
		//		if ( cmn.isObject ( self.state.style ) ) {
		//			cmn.log ( sW, '  ignoring state style  ' );
		//			state.style = clone ( self.state.style ); } } }
			if ( state.splitVert ) {
				self.state.splitVert = clone ( state.splitVert ); }
			if ( state.splitHorz ) {
				self.state.splitHorz = clone ( state.splitHorz ); }
		
			self.state.tabs = state.tabs;
		//	self.setState ( state, () => {
			tick().then ( () => {
				self.afterUpdate();
				if ( ! tabsState ) {
					return; }
				if ( ! cmn.isFunction ( self.tabsFnc ) ) {
					return; }
				self.tabsFnc ( { do: 	'set-state',
								state:	tabsState } );
		} );
		return (!!sh) || (!!sv);
	},	//	doSetState()

	disallowPaneEdits ( o ) {
		const sW = 'paneless Pane disallowPaneEdits()';
	//	cmn.log ( sW );

		self.bPaneEditsAllowed = false;

		if ( self.ccFnc ) {
			self.ccFnc ( o ); }

		if ( self.bbFnc ) {
			self.bbFnc ( o ); }

	},	//	disallowPaneEdits()

	maximize ( o ) {
		const sW = 'paneless Pane maximize()';
	//	cmn.log ( sW );
		if ( typeof prpParentFnc !== 'function' ) {
			cmn.error ( sW, 'no parentFnc' );
			return null; }

		return prpParentFnc ( { do: 			'maximize-child-pane',
								childPaneId:	prpPaneId } );
	},	//	maximize()

	getLeftMaxWidth() {
		let e = document.getElementById ( self.eleId + '-hsplitter' );
		let lftMaxWidth =   e.parentElement.clientWidth 
						  - e.offsetWidth;
		return lftMaxWidth;
	},	//	getLeftMaxWidth()

	maximizeChildPane ( o ) {
		const sW = 'paneless Pane maximizeChildPane()';
		cmn.log ( sW );

		let sh = self.state.splitHorz; if ( ! sh ) { return; }

		if ( sh.left.paneId !== o.childPaneId ) {
			return }
	
		self.splitX0   = 0;
		self.splitLft0 = parseFloat ( self.state.shSplitterStyle.left );
		prpFrameFnc ( { do: 				'size-start',
						ev: 				null,
						bSplitterMoving:	true } );
		
		let w = parseInt ( self.state.style.width );
		let shSS = clone ( self.state.shSplitterStyle );
		let lftW = w - cmn.hsW;	

		if ( lftW < paneMinW ) {
			lftW = paneMinW; }
		let maxW = w - cmn.hsW - paneMinW;
		if ( lftW > maxW ) {
			lftW = maxW; }

		let dX   = lftW - parseInt ( shSS.left );
	//	cmn.log ( sW, '   lftW ' + lftW );
		shSS.left = lftW + 'px';

		self.state.shSplitterStyle = shSS;
		self.state.shSplitterStyleString = 
								stringifyStyle ( self.state.shSplitterStyle );
		tick().then ( () => {
			window.setTimeout ( () => {
				let rgtW = w - lftW - cmn.hsW;
				self.splitDrag ( dX, lftW, rgtW, 0, 0, 0 ); }, 0 );
		 } );
	},	//	maximizeChildPane()

	setOtherPaneWidth ( o ) {
		const sW = 'paneless Pane ' + prpPaneId + ' setOtherPaneWidth()';
	//	cmn.log ( sW, 'paneId ' + o.paneId );

		if ( prpPaneId === o.paneId ) {
			if ( typeof prpParentFnc !== 'function' ) {
				cmn.error ( sW, 'no parentFnc' );
				return null; }

			return prpParentFnc ( o ); }

		let sh = self.state.splitHorz;
		if ( ! sh ) {
			return null; }

		if ( sh.left.paneId !== o.paneId ) {
			return null; }

	
		self.splitX0   = 0;
		self.splitLft0 = parseFloat ( self.state.shSplitterStyle.left );
		prpFrameFnc ( { do: 				'size-start',
				 		ev: 				null,
						bSplitterMoving:	true } );
		
		let w = parseInt ( self.state.style.width );
		let shSS = clone ( self.state.shSplitterStyle );
		let maxW = w - cmn.hsW;
		let rgtW = o.width;
		if ( rgtW > maxW ) {
			rgtW = maxW; }
	//	cmn.log ( sW, '   rgtW ' + rgtW );
		let lftW = w - cmn.hsW - rgtW;
		shSS.left = lftW + 'px';

		self.state.shSplitterStyle = shSS;
		self.state.shSplitterStyleString = 
								stringifyStyle ( self.state.shSplitterStyle );
	//	cmn.log ( sW, '  lftW ' + lftW + '  rgtW ' + rgtW );
		tick().then ( () => {
	//		cmn.log ( sW, 'after tick()' );
			let cmd: any = { do:			'size', 
							 dX:			0,
							 dY:			0,
							 visitedPanes:	{} };
			if ( sh.left.paneFnc ) {
	//			cmn.log ( sW, 'sh - calling left.paneFnc()' );
				cmd.top   = 0;
				cmd.left  = 0;
				cmd.width = lftW;
				sh.left.paneFnc ( cmd ); }
			if ( sh.right.paneFnc ) {
	//			cmn.log ( sW, 'sh - calling right.paneFnc()' );
				cmd.top   = 0;
				cmd.left  = lftW + cmn.hsW;
				cmd.width = rgtW;
				sh.right.paneFnc ( cmd ); }
		 } );
		return null;
	},	//	setOtherPaneWidth()

	splitterRestore ( o ) {
		const sW = 'paneless Pane ' + prpPaneId + ' splitterRestore()';
		cmn.log ( sW, '  ratio ' + o.ratio  );

		self.splitterFnc ( { do:		'set-minimized',
							 minimized:	false } );

		prpFrameFnc ( { do: 				'size-start',
						ev: 				null,
						bSplitterMoving:	true } );

		if ( self.state.splitHorz ) {
			let w = parseInt ( self.state.style.width );
			let w2 = Math.round ( w * o.ratio );

			let shSS = clone ( self.state.shSplitterStyle );
			let dX   = w2 - parseInt ( shSS.left );
			let lftW = w2;
			if ( lftW < paneMinW ) {
				lftW = paneMinW; }
			let maxW = w - cmn.hsW - paneMinW;
			if ( lftW > maxW ) {
				lftW = maxW; }
			shSS.left = lftW + 'px';
			self.state.shSplitterStyle = shSS;
			self.state.shSplitterStyleString = 
								stringifyStyle ( self.state.shSplitterStyle );
			tick().then ( () => {
				let rgtW = w - lftW - cmn.hsW;
				self.splitDrag ( dX, lftW, rgtW, 0, 0, 0 ); 
			} );
			return; }

		if ( self.state.splitVert ) {
			let h  = parseInt ( self.state.style.height );
			let h2 = Math.round ( h * o.ratio );

			let svSS = clone ( self.state.svSplitterStyle );
			let dY   = h2 - parseInt ( svSS.top );
			let topH = h2;
			if ( topH < paneMinH ) {
				topH = paneMinH; }
			let maxH = h - cmn.vsH - paneMinH;
			if ( topH > maxH ) {
				topH = maxH; }
			svSS.top = topH + 'px';
			self.state.svSplitterStyle = svSS;
			self.state.svSplitterStyleString = 
								stringifyStyle ( self.state.svSplitterStyle );
			tick().then ( () => {
				let botH = h - topH - cmn.vsH;
				self.splitDrag ( 0, 0, 0, dY, topH, botH ); 
			} );
			return; }

		cmn.error ( sW, 'not split' );
	},	//	splitterRestore()

	getInfo ( o ) {
		let sW = 'paneless Pane ' + prpPaneId + ' getInfo()';
	//	cmn.log ( sW );
		let ccInfo = null;
		if ( cmn.isFunction ( self.ccFnc ) ) {
			ccInfo = self.ccFnc ( { do: 'get-info' } ); }
		return { paneId:		prpPaneId,
				 paneFnc:		self.doAll,
				 ccInfo:		ccInfo,
				 paneWidth:		parseInt ( self.state.style.width ),
				 paneHeight:	parseInt ( self.state.style.height ) };
	},	//	getInfo()

	doAll ( o ) {
		let sW = 'paneless Pane ' + prpPaneId + ' doAll() ' + o.do;
		if ( o.to ) {
			sW += ' to ' + o.to; }
	//	cmn.log ( sW );
		switch ( o.do ) {
		case 'set-call-down': {
			if ( o.to === 'pane-content' ) {
				self.paneContentFnc = o.fnc;
				return;
			}
			if ( o.to === 'child-pane' ) {
				let sh = self.state.splitHorz;
				if ( sh ) {
					if ( sh.left.paneId === o.childPaneId ) {
					//	cmn.log ( sW, ' left.paneFnc' );
						sh.left.paneFnc = o.fnc; 
					//	sh.left.paneFnc ( { do:	'set-at-frame-top',
					//					    is:	self.isAtFrameTop } ); 
					}
					if ( sh.right.paneId === o.childPaneId ) {
					//	cmn.log ( sW, ' right.paneFnc' );
						sh.right.paneFnc = o.fnc; 
					//	sh.right.paneFnc ( { do: 'set-at-frame-top',
					//					     is: self.isAtFrameTop } ); 
					} 
				}
				let sv = self.state.splitVert;
				if ( sv ) {
					if ( sv.top.paneId === o.childPaneId ) {
						sv.top.paneFnc = o.fnc; 
					//	sv.top.paneFnc ( { do: 'set-at-frame-top',
					//					   is:  self.isAtFrameTop } ); 
					}
					if ( sv.bottom.paneId === o.childPaneId ) {
						sv.bottom.paneFnc = o.fnc; } }
			}
			if ( o.to === 'tabs' ) {
				cmn.log ( sW, 'setting tabsFnc' );
				self.tabsFnc = o.tabsFnc;
				return;
			}
		//	if ( o.to === 'tab-pages' ) {
		//		self.tabPagesFnc = o.tabPagesFnc;
		//	}
			if ( o.to === 'tab-page-pane' ) {
			//	cmn.log ( sW, 'setting tabPagesPane[' + o.tabId + ']' );
				self.tabPagePanes[o.tabId] = { paneFnc:	o.tabPaneFnc };
				if ( self.mounted && cmn.isFunction ( o.tabPaneFnc ) ) {
					prpFrameFnc ( { do: 'relayout' } ); }
				else {
					self.bRelayoutAfterMount = true; }
				return;
			}
			if ( o.to === 'empty-client-content' ) {
				if ( o.paneId === prpPaneId ) {
					self.ccFnc = o.fnc; } 		//	Client Content (empty)
				else {
					cmn.error ( sW, 'bad/unrecognized o.paneId' ); }
			}
			if ( o.to === 'client-content' ) {
				if ( o.paneId === prpPaneId ) {
					self.ccFnc = o.fnc; 		//	Client Content
					prpClientFnc ( o );	//	Give the app o.fnc.
					//	If we have already gotten the client content state ...
					if ( self.ccState ) {
						self.ccFnc ( { do: 		'set-state',
									   state:	self.ccState } );
						self.ccState = null; }
					else {
						let state = prpClientFnc ( { 
										do: 	'load-pane-state',
										paneId:	prpPaneId } );
						if ( state && state.ccState ) {
							self.ccFnc ( { do: 		'set-state',
										   state:	state.ccState } ); } }
					let style = self.state.style;
					self.ccFnc ( { do: 		'size',
								   paneW:	parseInt ( style.width ),
								   paneH:	parseInt ( style.height ) } );
				}
				else {
					let sh = self.state.splitHorz;
					if ( sh ) {
						if ( sh.left.paneFnc ) {
							sh.left.paneFnc ( o ); }
						if ( sh.right.paneFnc ) {
							sh.right.paneFnc ( o ); }
						return;
					}
					let sv = self.state.splitVert;
					if ( sv ) {
						if ( sv.top.paneFnc ) {
							sv.top.paneFnc ( o ); }
						if ( sv.bottom.paneFnc ) {
							sv.bottom.paneFnc ( o ); }
						return;
					}
					for ( let tabId in self.tabPagePanes ) {
						let pagePane = self.tabPagePanes[tabId];
						//	One tab pane active at a time, so, all but one
						//	page's pane fnc will (might?) be null.
						if ( pagePane.paneFnc ) {
							pagePane.paneFnc ( o );	}
					}
				}
				return;
			}
			if ( o.to === 'button-bar' ) {
				self.bbFnc = o.bbFnc;
				return;
			}
		//	if ( o.to === 'btn-split-restore' ) {
		//		self.bsrFnc = o.bsrFnc;
		//		return;
		//	}
			if ( o.to === 'bottom-btn-bar' ) {
				self.bbbFnc = o.bbbFnc;
				return;
			}
			if ( o.to === 'splitter' ) {
				self.splitterFnc = o.splitterFnc;
				return;
			}
			return;
		}	//	if ( o.do === 'set-call-down' ) 
		case 'set-call-down-correct': {
			if ( o.to === 'pane-content' ) {
				//	Getting the doAll() of the content - But - should not
				//	call until  * this *  component is mounted.  Got that?
				//	I.e., we know now that PaneContent is mounted. But we
				//	know nothing about its client content - so we can not
				//	set its state, for example.
				//	So what?  When can the content's state be set?
				//	The client content will command this 'client-content'.
				self.correctPaneContentFnc = o.fnc;
				return;
			}
		}	//	if ( o.do === 'set-call-down-correct' ) 
		case 'pane-burger-click': {
			return self.burgerClick ( o );
		}
		case 'split-horz': {
			return self.splitHorz ( o );
		}
		case 'split-vert': {
			if ( o.paneId ) {
				//	How to find the pane to split?

				return;
			}
			return self.splitVert ( o );
		}
		case 'size-start': {
			if ( ! o.visitedPanes[prpPaneId] ) {
			//	let cs = self.state.containerStyle;
			//	if ( cs ) {
			//		self.containerH0 = Number.parseInt ( cs.height ); }
				o.visitedPanes[prpPaneId] = true; }
			return self.propagateDown_SizeOp ( o );
		}
		case 'size': {
			if ( ! cmn.isObject ( o.visitedPanes ) ) {
				cmn.error ( sW, 'expected o.visitedPanes' );
				return; }
			if ( ! o.visitedPanes[prpPaneId] ) {

				o.visitedPanes[prpPaneId] = true; }

			return self.propagateDown_SizeOp ( o );
		}
		case 'splitter-dragged': {
			return self.propagateDown_SizeOp ( o );
		}
		case 'splitter-restore': {
			return self.splitterRestore ( o );
		}
		case 'enum-panes': {
			self.enumPanes ( o );
			return;
		}
		case 'focus': {
			if ( self.tabsFnc ) {
				return self.tabsFnc ( o ); }
			self.focus ( o );
			return;
		}
		case 'not-focus': {
			if ( self.tabsFnc ) {
				return self.tabsFnc ( o ); }
			self.focusNot ( o );
			return;
		}
		case 'key-burger-menu': {
			self.keyBurgerMenu ( o );
			return;
		}
		case 'cycle-tab-focus': {
			if ( self.tabsFnc ) {			//	this pane holds the tabs ...
				return self.tabsFnc ( o ); }
			if ( prpTabsFnc ) {		//	this pane is that of a tab ...
				return prpTabsFnc ( o ); }
			return self.doAll;
		}
		case 'keyboard-key-down': {
			if ( self.ccFnc ) {
				return self.ccFnc ( o ); }
			return false;
		}
		case 'get-state': {
			let state = self.doGetState ( o );
			prpClientFnc ( { do: 		'store-pane-state',
							 paneId: 	prpPaneId,
							 state:		state } );
		//	if ( state.tabsState ) {
		//		return state; }
		//	return null;
			return state;
		}
		case 'set-state': {
		//	cmn.log ( sW );
			let state = prpClientFnc ( { 
							do: 	'load-pane-state',
							paneId:	prpPaneId } );
			if ( ! state ) {
				return; }
			return self.doSetState ( state, o.bNotCC );
		}
		case 'get-state-2': {
			return self.doGetState ( o );
		}
		case 'set-state-2': {
		//	cmn.log ( sW );
			return self.doSetState ( o.state, o.bNotCC );
		}
		case 'burger-menu-dismissed': {
			self.isShowingBurgerMenu = false;
			if ( cmn.isFunction ( self.ccFnc ) ) {
				self.ccFnc ( o ); }
			return;
		}

		case 'menu-item': {
			if ( self.ccFnc && self.ccFnc ( o ) ) {
				return; }
			if ( o.menuItemText === 'Tabs' ) {
			//	self.setState ( { tabs: true } );
				self.state.tabs = true;
				return;	}
			if ( prpTabId && (o.menuItemText === 'Tab Name ...' ) ) {
				prpTabsFnc ( { do: 		'name-tab',
							   tabId:	prpTabId } );
				return; }
			if ( o.menuItemText === 'Pane Name ...' ) {
				self.dlgPaneName();
				return; }
			if ( o.menuItemText === 'Empty Pane' ) {
				self.empty();
				return;	}
			if ( o.menuItemText === 'Remove Pane' ) {
				self.remove();
				return;	}
			o.paneId		 = prpPaneId;
			o.paneFnc 		 = self.doAll;
		//	o.paneContentFnc = self.paneContentFnc;
			o.paneContentFnc = self.correctPaneContentFnc;
			prpFrameFnc ( o );
			return;
		}

		case 'unsplit': {
			self.unsplit ( o );
			return;
		}

		case 'add-tab': {
			if ( ! self.tabsFnc ) {
				cmn.error ( sW, 'tabsFnc not set' );
				return; }
			return self.tabsFnc ( o );
		}

		case 'set-initial-tab-text': {
			if ( (! prpTabId) || (! prpTabsFnc) ) {
				return; }
			prpTabsFnc ( { do:		'name-tab-name',
								   initialTabName:	true,
								   ctx:		{ tabId: prpTabId },
								   name: 	o.initialTabText } );
			return;
		}
		case 'disallow-pane-edits': {
			return self.disallowPaneEdits ( o ); }
		case 'maximize': {
			return self.maximize ( o ); }
		case 'maximize-child-pane': {
			return self.maximizeChildPane ( o ); }
		case 'set-other-pane-width': {
			return self.setOtherPaneWidth ( o ); }
		case 'get-info': {
			return self.getInfo ( o ); }
		case 'is-bottom-pane': {
			return self.isBottomOfSplit ( o ); }
		case 'is-right-pane': {
			return self.isRightOfSplit ( o ); }
		case 'get-style': {
			return clone ( self.state.style ); }
		case 'set-style': {
			return new Promise ( ( res, rej ) => {
				if ( cmn.isNumber ( o.top ) ) {
					self.state.style.top = o.top + 'px'; }
				if ( cmn.isNumber ( o.left ) ) {
					self.state.style.left = o.left + 'px'; }
				if ( cmn.isNumber ( o.width ) ) {
					self.state.style.width = o.width + 'px'; }
				if ( cmn.isNumber ( o.height ) ) {
					self.state.style.height = o.height + 'px'; }
				self.state.styleString = stringifyStyle ( self.state.style );
				tick().then ( () => {
					res ( 'ok' ); } );
			} ); }
		case 'is-properties-pane': {
			if ( ! cmn.isFunction ( self.ccFnc ) ) {
				cmn.error ( sW, 'ccFnc is not set' );
				return false; }
			return !! (self.ccFnc ( { do: 'identify' } ) === 'Properties'); }
		case 'is-tab-page-pane': {
			if ( ! cmn.isFunction ( self.tabsFnc ) ) {
				return null; }
			return self.tabsFnc ( o ); }
		case ( 'name-pane-name' ): {
			self.namePaneName ( o );
			return; }
		}	//	switch

		if ( self.ccFnc ) {
			return self.ccFnc ( o ); }

		switch ( o.do ) {
		case 'get-code':
			return null; 
		}

		cmn.error ( sW, 'unrecognized' );
		return null;
	},	//  doAll()

	afterUpdate() {
		const sW = 'paneless Pane ' + prpPaneId + ' afterUpdate()';
	//	cmn.log ( sW );

		let sh = self.state.splitHorz;
		if ( sh && sh.incomplete ) {
			self.propagateDown_SizeOp ( { do: 'splitter-dragged' } );

			//	Note that the client state is not set here (bNotCC: true)
			//	because the client gets its state with/during 'set-call-down' 
			//	(when the client is created).
			sh.left.paneFnc ( { do:		'set-state',
								bNotCC:	true } );
			sh.right.paneFnc ( { do:		'set-state',
								 bNotCC:	true } );

			if ( self.splitterFnc && sh.properties ) {
				self.splitterFnc ( { do: 			'set-state',
									 properties:	sh.properties } ); }

			sh.incomplete = false
		}
		let sv = self.state.splitVert;
		if ( sv && sv.incomplete ) {

			//	Note that the client state is not set here (bNotCC: true)
			//	because the client gets its state with/during 'set-call-down' 
			//	(when the client is created).
			sv.top.paneFnc ( { do:		'set-state',
							   bNotCC:	true } );
			sv.bottom.paneFnc ( { do:		'set-state',
								  bNotCC:	true } );

			if ( self.splitterFnc && sv.properties ) {
				self.splitterFnc ( { do: 			'set-state',
									 properties:	sv.properties } ); }

			sv.incomplete = false
		}
	}	//	afterUpdate()

};	//	self

	self.contentEleId =	self.eleId + '-content';

	self.state.styleString = stringifyStyle ( self.state.style );

	if ( cmn.isFunction ( prpParentFnc ) ) {
		prpParentFnc ( { do:  			'set-call-down',
						 to: 			'child-pane',
						 childPaneId:	prpPaneId,
						 fnc: 			self.doAll } );
		if ( prpTabId ) {
			prpParentFnc ( { do:			'set-call-down',
							 to:			'tab-page-pane',
						 	 tabId:			prpTabId,
						 	 tabPaneFnc:	self.doAll } ); 
			prpTabsFnc ( { do:			'set-call-down',
						   to:			'tab-page-pane',
						   tabId:		prpTabId,
						   tabPaneFnc:	self.doAll } ); }
	}

	onMount ( () => {
		const sW = 'paneless Frame ' + prpFrameId + '  '
				 + 'Pane ' + prpPaneId + ' onMount()';
	//	cmn.log ( sW );
		prpClientFnc ( { do: 'check-content', sW: sW  + ' top' } );
		let e    = document.getElementById ( self.eleId );
		if ( ! e ) {
			cmn.error ( sW, 'no element' ); 
			return; }

		if ( ! prpParentFnc ) {
			prpFrameFnc ( { do:		'set-call-down',
							to:		'root-pane',
							fnc:	self.doAll } ); }
		
		self.prevCW  = e.clientWidth;
		self.prevCH  = e.clientHeight; 
	
		self.mounted = true;
		prpClientFnc ( { do: 'check-content', sW: sW  + ' bot' } );
				
		if ( self.bRelayoutAfterMount ) {
			prpFrameFnc ( { do: 'relayout' } ); }
	} )	//	onMount()

	afterUpdate ( self.afterUpdate );
/*
	afterUpdate ( () => {
		const sW = 'paneless Pane ' + prpPaneId + '  componentDidUpdate()';
		cmn.log ( sW );
		let sh = self.state.splitHorz;
		if ( sh && sh.incomplete ) {
			self.propagateDown_SizeOp ( { do: 'splitter-dragged' } );

			sh.left.paneFnc ( { do: 'set-state'} )

			sh.right.paneFnc ( { do: 'set-state'} )

			if ( self.splitterFnc && sh.properties ) {
				self.splitterFnc ( { do: 			'set-state',
									 properties:	sh.properties } ); }

			sh.incomplete = false
		}
		let sv = self.state.splitVert;
		if ( sv && sv.incomplete ) {
			sv.top.paneFnc ( { do:	'set-state'} )

			sv.bottom.paneFnc ( { do:	'set-state'} )

			if ( self.splitterFnc && sv.properties ) {
				self.splitterFnc ( { do: 			'set-state',
									 properties:	sv.properties } ); }

			sv.incomplete = false
		}
	} )	//	didUpdate()
*/

	onDestroy ( () => {
		const sW = 'paneless Pane ' + prpPaneId + ' componentWillUnmount()';
	//	cmn.log ( sW );
		if ( prpTabId ) {
			prpParentFnc ( { do:			'set-call-down',
							 to:			'tab-page-pane',
							 tabId:			prpTabId,
							 tabPaneFnc:	null } ); 
			prpTabsFnc ( { do:			'set-call-down',
						   to:			'tab-page-pane',
						   tabId:		prpTabId,
						   tabPaneFnc:	null } ); 
		}
	} )	//	onDestroy()

</script>

<pane>
	{#if  self.state.splitVert }
		<div id		= { self.eleId }
			 class 	= { self.className }
			 style	= { self.state.styleString } >
			<div style = { self.state.containerStyleString } >
				<svelte:self
					prpFrameId 			= { prpFrameId }
					prpPaneId			= { self.state.splitVert.top.paneId }
					prpEleId 			= { self.eleId 
											+ '-top-' 
											+ self.state.splitVert.top.paneId }
					prpStyle			= { self.state.svTopStyle }
					prpClass 			= { self.state.splitVert.top.class }
					prpAppContentFnc	= { prpAppContentFnc }
					prpFrameFnc			= { prpFrameFnc } 
					prpParentFnc 		= { self.doAll } 
					prpAtFrameTop		= { prpAtFrameTop }
					prpClientFnc		= { prpClientFnc } />
				<svelte:self
					prpFrameId	 		= { prpFrameId }
					prpPaneId		= { self.state.splitVert.bottom.paneId }
					prpEleId 		= { self.eleId 
										+ '-bot-' 
										+ self.state.splitVert.bottom.paneId }
					prpStyle			= { self.state.svBotStyle }
					prpClass		= { self.state.splitVert.bottom.class }
					prpAppContentFnc	= { prpAppContentFnc }
					prpFrameFnc			= { prpFrameFnc } 
					prpParentFnc 		= { self.doAll } 
					prpAtFrameTop		= { false } 
					prpClientFnc		= { prpClientFnc } />
				<PaneSplitter
					prpFrameId			= { prpFrameId }
					prpPaneId			= { prpPaneId }
					prpPaneFnc			= { self.doAll }
					prpClientFnc		= { prpClientFnc }
					prpPaneEleId		= { self.eleId }
					prpHV				= 'v'
					prpStyle			= { self.state.svSplitterStyle }
					prpOnPointerDown	= { self.vsplitterPointerDown }
					prpOnPointerUp		= { self.vsplitterPointerUp } />
			</div>
		</div>
	{:else if self.state.splitHorz }
		<div id 	= { self.eleId }
				class 	= { self.className }
				style 	= { self.state.styleString } >
			<div style = { self.state.containerStyleString } >
				<svelte:self 
					prpFrameId 			= { prpFrameId }
					prpPaneId			= { self.state.splitHorz.left.paneId }
					prpEleId		= { self.eleId 
										+ '-lft-' 
										+ self.state.splitHorz.left.paneId }
					prpStyle		= { self.state.shLftStyle }
					prpClass 		= { self.state.splitHorz.left.class }
					prpAppContentFnc	= { prpAppContentFnc }
					prpFrameFnc			= { prpFrameFnc } 
					prpParentFnc 		= { self.doAll } 
					prpAtFrameTop		= { prpAtFrameTop }
					prpClientFnc		= { prpClientFnc } />
				<svelte:self 
					prpFrameId 			= { prpFrameId }
					prpPaneId			= { self.state.splitHorz.right.paneId }
					prpEleId		= { self.eleId 
										+ '-rgt-' 
										+ self.state.splitHorz.right.paneId }
					prpStyle		= { self.state.shRgtStyle }
					prpClass	 	= { self.state.splitHorz.right.class }
					prpAppContentFnc	= { prpAppContentFnc }
					prpFrameFnc			= { prpFrameFnc } 
					prpParentFnc	 	= { self.doAll } 
					prpAtFrameTop		= { prpAtFrameTop } 
					prpClientFnc		= { prpClientFnc } />
				<PaneSplitter
					prpFrameId			= { prpFrameId }
					prpPaneId			= { prpPaneId }
					prpPaneFnc			= { self.doAll }
					prpClientFnc		= { prpClientFnc }
					prpPaneEleId		= { self.eleId }
					prpHV				= 'h'
					prpStyle			= { self.state.shSplitterStyle }
					prpOnPointerDown	= { self.hsplitterPointerDown }
					prpOnPointerUp		= { self.hsplitterPointerUp } />
			</div>
		</div>
	{:else if prpParentFnc }
		{#if prpAtFrameTop}
			{#if self.state.tabs}
				<!-- got parent, at top, tabs -->
				<div id		= { self.eleId }
					class	= { self.className }
					style	= { self.state.styleString } >
					<PaneContent prpEleId 		= { self.contentEleId } 
								 prpFrameId 	= { prpFrameId }
								 prpPaneId		= { prpPaneId }
								 prpPaneFnc		= { self.doAll }
								 prpFrameFnc 	= { prpFrameFnc }
								 prpAppContentFnc	
										= { prpAppContentFnc }
								 prpClientFnc	= { prpClientFnc } 
								 prpTabs 		= { true } />
					{#if self.state.hasFocus}
						<div class = { self.state.focusClass }/> 
					{/if}
				</div>
			{:else}
				<!-- got parent, at top -->
				<div id		= { self.eleId }
					 class	= { self.className }
					 style	= { self.state.styleString } >
					<PaneContent prpEleId 		= { self.contentEleId }
								 prpFrameId 	= { prpFrameId }
								 prpPaneId		= { prpPaneId }
								 prpPaneFnc		= { self.doAll }
								 prpFrameFnc 	= { prpFrameFnc } 
								 prpAppContentFnc	
											= { prpAppContentFnc }
								 prpClientFnc	= { prpClientFnc } />
			<!--	<BtnSplitRestore prpAtFrameTop	= { prpAtFrameTop } 
								     prpBsrId		= { prpPaneId }
								     prpPaneFnc		= { self.doAll } 
								     prpFrameFnc	= { prpFrameFnc } />
			-->
					<PaneButtonBar prpAtFrameTop	= { prpAtFrameTop } 
								   prpBbId			= { prpPaneId }
								   prpPaneFnc		= { self.doAll } 
								   prpFrameFnc		= { prpFrameFnc } />
					{#if self.state.hasFocus}
						<div class = { self.state.focusClass }/> 
					{/if}
				</div>
			{/if}
		{:else}
		 	{#if self.state.tabs}
				<!-- got parent, not at top, tabs -->
				<div id		= { self.eleId }
					 class 	= { self.className }
					 style	= { self.state.styleString } >
					<PaneContent prpEleId 		= { self.contentEleId } 
								 prpFrameId 	= { prpFrameId }
								 prpPaneId		= { prpPaneId }
								 prpPaneFnc		= { self.doAll }
								 prpFrameFnc 	= { prpFrameFnc }
								 prpAppContentFnc	
										= { prpAppContentFnc }
								 prpClientFnc	= { prpClientFnc } 
								 prpTabs 		= { true } />
					{#if self.state.hasFocus }
						<div class = { self.state.focusClass }/> }
					{/if}
				</div>
			{:else}
				<!-- got parent, not at top -->
				<div id		= { self.eleId }
					 class 	= { self.className }
					 style	= { self.state.styleString } >
					<PaneContent prpEleId 		= { self.contentEleId }
								 prpFrameId 	= { prpFrameId }
								 prpPaneId		= { prpPaneId }
								 prpPaneFnc		= { self.doAll }
								 prpFrameFnc 	= { prpFrameFnc } 
								 prpAppContentFnc	
											= { prpAppContentFnc }
								 prpClientFnc	= { prpClientFnc } />
			<!--	<BtnSplitRestore prpAtFrameTop	= { prpAtFrameTop } 
								     prpBsrId		= { prpPaneId }
								     prpPaneFnc		= { self.doAll } 
								     prpFrameFnc	= { prpFrameFnc } />
			-->
					<PaneButtonBar prpAtFrameTop	= { prpAtFrameTop } 
								   prpBbId			= { prpPaneId }
								   prpPaneFnc		= { self.doAll } 
								   prpFrameFnc		= { prpFrameFnc } />
					{#if self.state.hasFocus }
						<div class = { self.state.focusClass }/> 
					{/if}
				</div>
			{/if}
		{/if}
	{:else}
		<!-- no split, no parent -->
		{#if  self.state.tabs }
			<div id 		= { self.eleId }
				 class		= { self.className }
				 style 		= { self.state.styleString } >
				<PaneContent prpEleId 			= { self.contentEleId } 
							 prpAtFrameTop		= { prpAtFrameTop }
							 prpFrameId 		= { prpFrameId }
							 prpPaneId			= { prpPaneId }
							 prpPaneFnc			= { self.doAll }
							 prpFrameFnc 		= { prpFrameFnc }
							 prpAppContentFnc	= { prpAppContentFnc }
							 prpClientFnc		= { prpClientFnc } 
							 prpTabs 			= { true } />
			</div>
		{:else}
			<div id		= { self.eleId }
				 class 	= { self.className }
				 style 	= { self.state.styleString } >
				<PaneContent prpEleId 			= { self.contentEleId } 
							 prpAtFrameTop		= { prpAtFrameTop }
							 prpFrameId 		= { prpFrameId }
							 prpPaneId			= { prpPaneId }
							 prpPaneFnc			= { self.doAll }
							 prpFrameFnc 		= { prpFrameFnc } 
							 prpAppContentFnc	= { prpAppContentFnc }
							 prpClientFnc		= { prpClientFnc }
							 prpTabs			= { false } />
				<PaneButtonBar prpAtFrameTop	= { prpAtFrameTop } 
							   prpBbId			= { prpPaneId }
							   prpPaneFnc		= { self.doAll } 
							   prpFrameFnc		= { prpFrameFnc } />
				{#if self.state.hasFocus }
					<div class = { self.state.focusClass }/> 
				{/if}
			</div>
		{/if}

	{/if}

</pane>

<style>
	.pane {
		background-color: 	lightblue;
		position:			absolute;
	}

	.pane-focused-rect {
		position: 			absolute;
		left:				0px;
		top:				0px;
		width: 				calc(100% - 4px);
		height: 			calc(100% - 4px);
		margin: 			1px;
		background-color: 	transparent;
		pointer-events: 	none;
		border:				solid 1px;
		border-color:		rgba(0,0,255,255);
	}

	.pane-focused-rect-transition {
		position: 					absolute;
		left:						0px;
		top:						0px;
		width: 						calc(100% - 4px);
		height: 					calc(100% - 4px);
		margin: 					1px;
		background-color: 			transparent;
		pointer-events: 			none;
		border:						solid 1px;
		border-color:				rgba(0,0,255,0);
		transition-property:		border-color;
		transition-timing-function: ease-in-out;
		transition-duration:		3.0s;
	}

</style>
