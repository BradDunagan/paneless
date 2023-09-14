<!--
         1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
-->
<script lang="ts">

	import { onMount, beforeUpdate, onDestroy }	from 'svelte';
	import { tick }				from 'svelte';
	import clone 		from 'clone';	//	In tsconfig.json, "allowjs": true	
	import { cmn }		    	from './common';
	import FrameHeader 			from './frame-header.svelte';
	import FrameTransientHeader	from './frame-transient-header.svelte';
	import Pane					from './pane.svelte';
	import FrameFooter 			from './frame-footer.svelte';
	import Sizer 				from './sizer.svelte';
	import Icon 				from './icon.svelte';

	export let frameType		= '';
    export let frameId  		= 0;
    export let frameAs			= '';
    export let paneId   		= 0;
    export let left     		= '10px';
    export let top      		= '10px';
    export let width    		= '200px';
    export let height   		= '40px';
    export let appContentFnc: any	= null;
    export let clientFnc: any    	= null;
	export let appFrameFnc: any		= null;
	export let iconized: any		= null;
	export let hdrVisible		= true;
	export let ftrVisible		= false;
	export let frameName		= null;
	export let isCentered		= null;


	let	orgFrameName	= 'Paneless Frame - ' + frameId;

	const headerH		= 19;
	const footerH		= 19;
	
	const frameMinW 	= 100;
	const frameMinH 	=  60;

	function stringifyStyle ( style: any ): string {
		let s = '';
		for ( const p in style ) {
			s += p + ': ' + style[p] + '; '; };
		return s;
	}	//	stringifyStyle()

	let self = {
	//	state: iconized ? {
		state: false    ? {

			normalHeader:		hdrVisible,
			transientHeader:	! hdrVisible,
			
			transientHeaderBurger:		true,
			transientHeaderTitle:		true,
			transientHeaderIconize:		true,
			transientHeaderDestroy:		true,
			
			frameName:	  	frameName ? frameName
									  : orgFrameName,
			paneStyle:		{},
			ftrVisible:		ftrVisible,
			footerStyle: {
				top:	(parseInt ( height )
						 - (ftrVisible ? footerH : 0)) + 'px',
				display: ftrVisible ? null : 'none',
			},
			sizer:			false,
			contentRestoreIncomplete:	false,

			styleString:	'',
        } : {
			style:      { left:             left,
						  top:              top,
						  width:            width,
						  height:           height,
						  'border-color':	'black',
						  visibility:	    iconized ? 'hidden' 
						  							 : 'visible' },
			normalHeader:		hdrVisible,
			transientHeader:	! hdrVisible,
			
			transientHeaderBurger:		true,
			transientHeaderTitle:		true,
			transientHeaderIconize:		true,
			transientHeaderDestroy:		true,
			
			frameName:	  	frameName ? frameName
									  : orgFrameName,
			paneStyle: {
				width:	parseInt ( width ) + 'px',
				height:	(parseInt ( height )
							- (hdrVisible ? headerH : 0)
							- (ftrVisible ? footerH : 0)) + 'px',
				top:	(hdrVisible ? headerH : 0) + 'px',
				left:	'0px', 
			},
			ftrVisible:		ftrVisible,
			footerStyle: {
				top:	(parseInt ( height )
						 - (ftrVisible ? footerH : 0)) + 'px',
				display: ftrVisible ? null : 'none',
			},
			sizer:			true,
			contentRestoreIncomplete:	false,

			screen:			null,
			screenStyle:	null,
			screenMsg:		'',

			styleString:	'',
		},

		orgFrameName:	orgFrameName,

		sizeW0:		 	0,
		sizeH0:		 	0,
		sizeFtrTop0: 	0,

		iconized:		!! iconized,
		iconStyle: 	   (!! iconized) && cmn.isObject ( iconized.style )
			? iconized.style
			: { visibility:		'hidden', },

		notifies:		{},

		eleId: 			'paneless-frame-' + frameId,

		appFnc:			appFrameFnc,
		headerFnc:		null,
		footerFnc:		null,

		rootPaneFnc:	null,
		sizerFnc: 		null,
		iconFnc:		null,

		mouseInTopPaneButtonBar:	false,

		focusedPaneId:			0,
		paneFocusTimeoutId: 	0,
		isShowingBurgerMenu:	false,
		beingDestroyed:			false,

		moveX0:			0,
		moveY0:			0,

	zTop() {
		appContentFnc ( { do: 		'ensure-frame-z-is-top',
						  frameId:	frameId } );
	},	//	zTop()

	keyDown ( o: any ): boolean {
		let sW = 'Frame keyDown()';
	//	cmn.log ( sW, '  ' + o.ev.key );
	//	if ( self.state.iconized ) {
		if ( self.iconized ) {
			if ( o.ev.key === 'Enter' ) {
				self.clickIcon ( null ); 		//	Un-iconize.
				return true; }
			return false; }
	//	if ( o.ev.shiftKey && (o.ev.key === ' ') ) {
	//		self.doAll ( { do: 'frame-burger-click' } );
	//		return true; }
	//	I get this unitentionally too much
	//	The user can alt-B multiple times instead. Ok?

		return false;
	},	//	keyDown()

	mouseDown ( ev: any ) {
		let sW = 'Frame mouseDown()';
	//	cmn.log ( sW );
		appContentFnc ( { do:		'set-frame-focus',
						  frameAs:	frameAs,
						  frameId:	frameId } );
	},	//	mouseDown()

	isHeaderVisible(): boolean {
	//	let isHdrVisible = false;
	//	if ( self.headerFnc ) {
	//		isHdrVisible = self.headerFnc ( { do: 'is-visible' } ); }
	//	return isHdrVisible;
		return !! self.state.normalHeader;
	},	//	isHeaderVisible()

	isTransientHeaderVisible(): boolean {
		if ( self.isHeaderVisible() ) {
			return false; }
		let isHdrVisible = false;
		if ( cmn.isFunction ( self.headerFnc ) ) {
			isHdrVisible = self.headerFnc ( { do: 'is-visible' } ); }
		return isHdrVisible;
	},	//	isTransientHeaderVisible()

	getTransientHeaderStatus() {
		if ( self.isHeaderVisible() ) {
			return null; }
		if ( cmn.isFunction ( self.headerFnc ) ) {
			return self.headerFnc ( { do: 'get-status' } ); }
		return null;
	},	//	getTransientHeaderStatus()

	isFooterVisible() {
		let isFtrVisible = false;
		if ( self.iconized ) {
	//		isFtrVisible = self.state.iconized.ftrVisible; }
			isFtrVisible = self.state.ftrVisible; }
		else {
			if ( cmn.isFunction ( self.footerFnc ) ) {
				isFtrVisible = self.footerFnc ( { do: 'is-visible' } ); } }
		return isFtrVisible;
	},	//	isFooterVisible()

	burgerClick() {
		let sW = 'Frame burgerClick()';
	//	cmn.log ( sW );
		let fe = document.getElementById ( self.eleId );
		let r  = fe.getBoundingClientRect();
		let hdrVisible = self.isHeaderVisible();
		let itemTextHdr = hdrVisible ? 'Hide Header' : 'Show Header';
		let itemTestIdHdr = 'paneless-frame-menu-'
						  + (hdrVisible ? 'HideHeader' : 'ShowHeader');
		let ftrVisible = self.isFooterVisible();
		let itemTextFtr = ftrVisible ? 'Hide Footer' : 'Show Footer';
		let itemTestIdFtr = 'paneless-frame-menu-'
						  + (ftrVisible ? 'HideFooter' : 'ShowFooter');
		let menuItems = [ 
			{ type: 'item', 		text: 'Frame Name ...',
									testId: 'paneless-frame-menu-FrameName' },
			{ type: 'item', 		text: itemTextHdr,
									testId: itemTestIdHdr },
			{ type: 'item', 		text: itemTextFtr,
									testId: itemTestIdFtr} ];

		let clientItems = [];
		clientFnc( {
			do:			'append-menu-items',
			to:			'frame-burger',
			frameId:	frameId,
			menuItems:	clientItems } );
		if ( clientItems.length > 0 ) {
			if ( menuItems.length > 0 ) {
				menuItems.push ( {type: 'separator', 	text: '' } ); }
			menuItems = menuItems.concat ( clientItems ); }

		self.appFnc ( { 
			do: 		'show-menu',
			menuEleId:	self.eleId + '-burger-menu',
			menuX:		r.x,
			menuY:		r.y,
			menuItems:	menuItems,
			upFnc:		self.doAll,
			ctx:		{ what:		'frame burger',
						  dismiss:	'burger-menu-dismissed',
						  after:	'menu-item' }
		} );
		self.isShowingBurgerMenu = true;
	},	//	burgerClick()

	iconize ( o: any ) {
		let sW = frameId + ' Frame iconize()';
		if ( ! cmn.isFunction ( self.iconFnc ) ) {
			cmn.error ( sW, 'iconFnc not set' );
			return; }
	//	It seems contentState is obsolete.
	//	Anyway, trying to just make the frame invisible and remain active.
		self.state.style.visibility	= 'hidden';
		self.state.styleString = stringifyStyle ( self.state.style );
	//	tick();
		self.iconFnc ( { do:		'iconize',
						 start: {
							left:		self.state.style.left,
							top: 		self.state.style.top,
							width:		self.state.style.width,
							height:		self.state.style.height } } );
		self.iconized = true;
		for ( const k in self.notifies ) {
			let n = self.notifies[k];
			if ( cmn.isFunction ( n.fnc ) ) {
				n.fnc ( { do: 		'frame-is-iconized',
						  iconized:	self.iconized } ); } }

		clientFnc ( { do:	'set-state-changed',
					  what:	'frame-iconized' } );
	},	//	iconize()

	destroy ( o: any ) {
		const sW = frameId + ' Frame destroy()';
	//	cmn.log ( sW );
		self.beingDestroyed = true;
	//	appContentFnc ( { do:		'destroy-frame',
	//					  frameId:	frameId } );
		clientFnc( { do:		'destroy-frame',
					 frameId:	frameId } );
	},	//	destroy();

	clickIcon ( ev: any ) {
		let sW = frameId + ' Frame clickIcon()';
		if ( ! cmn.isFunction ( self.iconFnc ) ) {
			cmn.error ( sW, 'iconFnc not set' );
			return; }
		if ( ! self.iconized ) {
			cmn.error ( sW, 'not iconized' );
			return; }
		//	First, transition to the frame's position and size.
		let style 		= self.state.style;
		self.iconFnc ( { do: 'restore',
						 end: {
							 left:		style.left,
							 top:		style.top,
							 width:		style.width,
							 height:	style.height } } );
		//	Now, after a delay, restore the frame.
		window.setTimeout ( () => {
			self.state.style.visibility = 			'visible';
			self.state.contentRestoreIncomplete =	true;
			self.state.styleString = stringifyStyle ( self.state.style );
			tick().then ( () => {
			//	Possibly not necessary now that the frame is just simply
			//	made hidden and now visible again.
				self.iconized = false;
				for ( const k in self.notifies ) {
					let n = self.notifies[k];
					if ( cmn.isFunction ( n.fnc ) ) {
						n.fnc ( { do: 		'frame-is-iconized',
								  iconized:	self.iconized } ); } }
			} );
			clientFnc ( { do:	'set-state-changed',
						  what:	'frame-uniconized' } );
			appContentFnc ( { do:		'set-frame-focus',
							  frameAs:	frameAs,
							  frameId:	frameId } );
		}, 300 );
	},	//	clickIcon()

	nameFrame() {
		self.appFnc ( { do: 	'show-name-dlg',
						upFnc: 	self.doAll,
						ctx: 	{ title:	'Frame Name',
								  curName:	self.state.frameName,
								  after: 	'name-frame-name',
								  blankOk:	true } } );
	},	//	nameFrame()

	nameFrameName ( o: any ) {
		self.state.frameName = o.name;
		if ( cmn.isFunction ( self.headerFnc ) ) {
			self.headerFnc ( { do: 		'set-frame-name',
							   name:	o.name} ); }
		if ( cmn.isFunction ( self.iconFnc ) ) {
			self.iconFnc ( { do: 	'set-frame-name',
							 name:	o.name} ); }
	},	//	nameFrameName()

	setBorderColor ( color: string ) {
		let sW = frameId + ' paneless Frame setBorderColor() ' + color;
	//	cmn.log ( sW );
		if ( self.iconized ) {
			if ( ! cmn.isFunction ( self.iconFnc ) ) {
				cmn.error ( sW, 'iconFnc not set' ); }
			else {
				self.iconFnc ( { do: 		'set-border-color',
								 color:		color } ); } } 
		else {
			self.state.style['border-color'] = color; 
			self.state.styleString = stringifyStyle ( self.state.style ); }
	},	//	setBorderColor()

	startPaneFocusTimer() {
		if ( self.paneFocusTimeoutId ) {
			window.clearTimeout ( self.paneFocusTimeoutId ); }
		self.paneFocusTimeoutId = window.setTimeout ( () => {
			self.paneFocusTimeoutId = 0;
		}, 4000 );
	},	//	startPaneFocusTimer()

	cyclePaneFocus() {
		let panes = {};
		if ( cmn.isFunction ( self.rootPaneFnc ) ) {
			self.rootPaneFnc ( { do: 	'enum-panes',
								 panes:	panes } ); }
		else {
			return null; }

		let paneFnc, paneId, paneIds = Object.keys ( panes );
		if ( paneIds.length <   2 ) {	//	Not if just one pane.
			return null; }				//	The frame focus will be enough.
		let paneIdsSorted = [];
		paneIds.forEach ( ( x, i ) => { 
		//	paneIdsSorted[i] = parseInt ( x ) } );
			paneIdsSorted.push ( parseInt ( x ) ) } );
		paneIdsSorted.sort();

		function focus( i: number ) {
			paneId  = self.focusedPaneId = paneIdsSorted[i]
			paneFnc = panes[paneId];
			paneFnc ( { do: 'focus' } );
			self.startPaneFocusTimer();
			return paneFnc;
		}

		if ( self.focusedPaneId === 0 ) {
			if ( ! paneIdsSorted[0] ) {
				return null; }
			return focus ( 0 );
		}
		paneId = self.focusedPaneId;
		let i = paneIdsSorted.indexOf ( paneId );
		if ( i >= 0 ) {
			//	If the timeout has elapsed then show again which pane has 
			//	the focus, do not cycle. The user must repeat hitting the 
			//	keyboard key faster in order to cycle.
			if ( self.paneFocusTimeoutId === 0 ) {
				return focus ( i ); }
			panes[paneId] ( { do: 'not-focus' } ); 
			i++; 
			if ( i >= paneIdsSorted.length ) {
				i = 0; } }
		else {
			i = 0; }
		if ( paneIdsSorted[i] ) {
			return focus ( i );
		}
		return null;
	},	//	cyclePaneFocus()

	focusPane ( paneId: number ) {
		const sW = 'paneless Frame focusPane()';
		let panes = {};
		if ( ! cmn.isFunction ( self.rootPaneFnc ) ) {
			cmn.error ( sW, 'rootPaneFnc is not set' );
			return null; }

		self.rootPaneFnc ( { do: 	'enum-panes',
							panes:	panes } );

		let paneFnc = panes[paneId];
		if ( ! cmn.isFunction ( paneFnc ) ) {
			//	paneId might be that of a tab.
			let paneIds = Object.keys ( panes );
			for ( let i = 0; i < paneIds.length; i++ ) {
				paneFnc = panes[paneIds[i]] ( { do:		'is-tab-page-pane',
												paneId:	paneId } );
				if ( cmn.isFunction ( paneFnc ) ) {
					break; } }
			if ( ! cmn.isFunction ( paneFnc ) ) {
				return null; } }

		//	Don't show a focus on the pane if there is just one pane.
		//	The frame focus will be enough.
		let paneIds = Object.keys ( panes );
		if ( paneIds.length > 1 ) {
			paneFnc ( { do: 'focus' } ); 
			self.startPaneFocusTimer(); }
		self.focusedPaneId = paneId;
		return paneFnc;  
	},	//	focusPane()

	refocusPane() {
		const sW = 'Frame refocusPane()';
		let panes = {};
		if ( ! cmn.isFunction ( self.rootPaneFnc ) ) {
			cmn.error ( sW, 'rootPaneFnc is not set' );
			return null; }

		self.rootPaneFnc ( { do: 	'enum-panes',
							panes:	panes } );

		let paneFnc, paneId, paneIds = Object.keys ( panes );

		if ( self.focusedPaneId > 0 ) {
			let paneFnc = panes[self.focusedPaneId];
			if ( paneFnc ) {
				//	Don't show a focus on the pane if there is just one pane.
				//	The frame focus will be enough.
				if ( paneIds.length > 1 ) {
					paneFnc ( { do: 'focus' } ); 
					self.startPaneFocusTimer(); }
				return paneFnc; } } 

		let paneIdsSorted = [];
		paneIds.forEach ( ( x, i ) => { 
		//	paneIdsSorted[i] = parseInt ( x ) } );
			paneIdsSorted.push ( parseInt ( x ) ) } );
		paneIdsSorted.sort();
		paneId = self.focusedPaneId = paneIdsSorted[0];
		paneFnc = panes[paneId];
		if ( paneIdsSorted.length <   2 ) {	//	Not if just one pane.
		//	return null; }				//	The frame focus will be enough.
			return paneFnc; }			//	But return the pane.
		paneFnc ( { do: 'focus' } ); 
		self.startPaneFocusTimer();
		return paneFnc;
	},	//	refocusPane()

	unfocusPane() {
		if ( self.focusedPaneId === 0 ) {
			return; }
		let panes = {};
		if ( cmn.isFunction ( self.rootPaneFnc ) ) {
			self.rootPaneFnc ( { do: 	'enum-panes',
								 panes:	panes } ); }
		let paneFnc = panes[self.focusedPaneId];
		if ( cmn.isFunction ( paneFnc ) ) {
			paneFnc ( { do: 'not-focus' } ); }
	},	//	unfocusPane()

	keyBurgerMenu ( o: any ) {
		if ( self.isShowingBurgerMenu ) {
			appFrameFnc ( { do: 'menu-dismiss' } ); }
		let paneFnc = null;
		if ( self.focusedPaneId === 0 ) {
			paneFnc = self.refocusPane(); }
		else {
			let panes = {};
			self.rootPaneFnc ( { do: 	'enum-panes',
								panes:	panes } );
			paneFnc = panes[self.focusedPaneId]; }
		if ( cmn.isFunction ( paneFnc ) ) {
			paneFnc ( o ); }
	},	//	keyBurgerMenu()

	getPanes() {
		let panes = {};
		if ( cmn.isFunction ( self.rootPaneFnc ) ) {
			self.rootPaneFnc ( { do: 	'enum-panes',
								 panes:	panes } ); }
		else {
			return null; }
		return panes;
	},	//	getPanes()

	onePaneFnc ( o: any ) {
		//	Return when a pane returns something.
		let panes = self.getPanes();
		if ( ! panes ) {
			return null; }
		let paneIds = Object.keys ( panes );
		for ( let i = 0; i < paneIds.length; i++ ) {
			let paneFnc = panes[paneIds[i]];
			let d = paneFnc ( o );
			if ( d ) {
				return d; } }
		return null;
	},	//	onePaneFnc()

	allPaneFnc ( o: any ) {
		//	Call each pane.
		let panes = self.getPanes();
		if ( ! panes ) {
			return null; }
		let paneIds = Object.keys ( panes );
		for ( let i = 0; i < paneIds.length; i++ ) {
			let paneFnc = panes[paneIds[i]];
			paneFnc ( o ); }
		return null;
	},	//	allPaneFnc()

	maximizePane ( o: any ) {
		let panes = self.getPanes();
		if ( ! panes ) {
			return null; }
		let paneFnc = panes[o.paneId];
		if ( typeof paneFnc !== 'function' ) {
			return null; }
		paneFnc ( { do: 'maximize' } );
		return null;
	},	//	maximizePane()

	sizeRootPane ( dX: number, dY: number, noFrameSizing ) {
		const sW = 'Frame sizeRootPane()';
	//	cmn.log ( sW, 'dXY: ' + dX + ' ' + dY );
		let cmd = { do: 'size-start',
				 	dX:	0,
					dY:	0,
					noFrameSizing: false };
		self.doAll ( cmd );
		//	Note that 'size-start' probably added needed properties to cmd for 
		//	size. So use cmd again here ...
		cmd.do = 'size';
		cmd.dX = dX;
		cmd.dY = dY;
		if ( cmn.isBoolean ( noFrameSizing ) ) {
			cmd.noFrameSizing = noFrameSizing; }
		self.doAll ( cmd );
	},	//	sizeRootPane()

	setOtherPaneWidth ( o: any ) {
		const sW = 'Frame setOtherPaneWidth()';
		cmn.log ( sW );
		let panes = self.getPanes();
		if ( ! panes ) {
			return null; }
		let paneFnc = panes[o.paneId];
		if ( ! cmn.isFunction ( paneFnc ) ) {
			return null; }
		return paneFnc ( o );
	},	//	setOtherPaneWidth()

	widthDelta ( o: any ) {
		const sW = 'Frame widthDelta()';
	//	cmn.log ( sW, 'delta: ' + o.delta );
		if ( self.iconized ) {
			return null; }
		let cmd: any = { do: 'size-start' };
		self.doAll ( cmd );
		//	Note that 'size-start' probably added needed properties to
		//	cmd for size. So use cmd again here ...
		cmd.do = 'size';
		cmd.dX = o.delta;
		cmd.dY = 0;
		return self.doAll ( cmd );
	},	//	widthDelta()

	screen ( o: any ) {
		const sW = 'Frame screen()';
	//	cmn.log ( sW );
		let h = null;
		if ( cmn.isFunction ( self.rootPaneFnc ) ) {
			let s = self.rootPaneFnc ( { do: 'get-style' } );
			h = parseInt ( s.height ); }
		return new Promise ( ( res: any, rej: any ) => {
			self.state.screenStyle = cmn.isNumber ( h ) ? { height: h + 'px' } 
														: null;
			self.state.screenMsg = o.msg;
			self.state.screen = true;
			tick().then (  () => {
				res();
			} ); 
		} );
	},	//	screen()

	unscreen ( o ) {
		const sW = 'Frame unscreen()';
	//	cmn.log ( sW );
		self.state.screen = false;
		return null;
	},	//	unscreen()

	getInfo ( o: any ) {
		const sW = 'Frame getInfo()';
	//	cmn.log ( sW );
		let panesInfo = [];
		let panes = self.getPanes();
		if ( ! panes ) {
			return null; }
		for ( let pid in panes ) {
			let fnc = panes[pid];
			if ( cmn.isFunction ( fnc ) ) {
				panesInfo.push ( fnc ( { do: 'get-info' } ) ); } }
		return { id:		frameId,
				 name:		self.state.frameName,
				 iconized:	self.iconized,
				 fnc:		self.doAll,
				 panes:		panesInfo };
	},	//	getInfo()

	getPropertiesPane ( o: any ) {
		const sW = 'Frame getPropertiesPane()';
	//	cmn.log ( sW );
		let panesInfo = [];
		let panes = self.getPanes();
		if ( ! panes ) {
			return null; }
		for ( let pid in panes ) {
			let fnc = panes[pid];
			let id = fnc ( { do: 'identify' } );
			if ( cmn.isObject ( id ) && (id.name === 'properties') ) {
				id.paneFnc = fnc;
				return id; } }	
		return null;
	},	//	getPropertiesPane()

	relayout ( o: any ) {
		let why = o.do;
		let cmd: any = { do: 	'size-start',
						 why:	why };
		self.doAll ( cmd );

		//	Use the same  cmd  because doAll() just populated it with other
		//	stuff.
		cmd.do				= 'size';
		cmd.footerVisible	= o.isVisible;
		cmd.headerH			= o.headerH;
		cmd.visitedPanes	= {};
		self.rootPaneFnc ( cmd );
	},	//	relayout()

        doAll ( o: any ): any {
			let sW = frameId + ' paneless Frame doAll() ' + o.do;
			if ( o.to ) {
				sW += ' to ' + o.to; }
		//	cmn.log ( sW );
		function setCallDown ( o ) {
			if ( typeof o.to !== 'string' ) {
				cmn.error ( sW, 'o.to is not a string' );
				return; }
			if ( o.to === 'frame-header' ) {
				self.headerFnc = o.fnc;
				if ( self.beingDestroyed ) {
					return; }
				if ( ! cmn.isString ( self.eleId ) ) {		//	Destroyed?  Insane?
					return; }
				//	The normal frame header component comes and goes so we can
				//	use this signal to update the panes regarding the size of 
				//	their area.
				if ( self.rootPaneFnc ) {
					self.relayout ( { do: 			'header-updated',
									  isVisible:	cmn.isFunction ( o.fnc ),
									  headerH:		o.headerH } ); }
				return; }
			if ( o.to === 'frame-footer' ) {
				//	The footer dis/appears.  That is, the footer component always
				//	exists.  See 'footer-updated'.
				self.footerFnc = o.fnc;
				return; }
			if ( o.to === 'root-pane' ) {
				self.rootPaneFnc = o.fnc;
				return; }
			if ( o.to === 'client-content' ) {
				self.rootPaneFnc ( o );
				return }
			if ( o.to === 'sizer' ) {
				self.sizerFnc = o.sizerFnc;
				return; }
			if ( o.to === 'icon' ) {
				self.iconFnc = o.fnc;
				return; }
			cmn.error ( sW, 'unrecognized to - ' + o.to );
		}

	switch ( o.do ) {

		case ( 'set-call-down' ): {
			setCallDown ( o );
			return; 
		}
		case ( 'make-focused' ): {
			appContentFnc ( { do:		'set-frame-focus',
							  frameAs:	frameAs,
							  frameId:	frameId } );
			return; 
		}
		case ( 'z-top' ): {
			self.zTop();
			return;
		}
		case ( 'focus' ): {
			self.setBorderColor ( 'blue' );
			if ( cmn.isNumber ( o.paneId ) && (o.paneId > 0) ) {
				return self.focusPane ( o.paneId ); }
			return self.refocusPane();
		}
		case ( 'not-focus' ): {
			self.setBorderColor ( 'black' );
			self.unfocusPane();
			return;
		}
		case ( 'cycle-pane-focus' ): {
			return self.cyclePaneFocus();
		}
		case ( 'key-burger-menu' ): {
			self.keyBurgerMenu ( o );
			return;
		}
		case ( 'menu-dismiss' ): {
			appFrameFnc ( o );
			return;
		}
		case ( 'show-burger-menu' ): {
			if ( self.isShowingBurgerMenu ) {
				return; }
			self.burgerClick();
			return;
		}
		case ( 'keyboard-key-down' ): {
			return self.keyDown ( o );
		}
		case ( 'move-start' ): {
			isCentered  = false;
			let x = Number.parseInt ( self.state.style.left );
			if ( ! Number.isSafeInteger ( x ) ) {
			//	x = 0;
				let e = document.getElementById ( self.eleId );
				let r = e.getBoundingClientRect();
				x = r.left; }
			self.moveX0 = x;
			let y = Number.parseInt ( self.state.style.top );
			if ( ! Number.isSafeInteger ( y ) ) {
			//	y = 0; 
				let e = document.getElementById ( self.eleId );
				let r = e.getBoundingClientRect();
				y = r.top; }
			self.moveY0 = y;
			self.appFnc ( { do: 		'move-frame',
							frameFnc:	self.doAll,
							ev: 		o.ev } );
			return;
		}
		case ( 'move' ): {
			let x = self.moveX0 + o.dX;
			if ( ! Number.isSafeInteger ( x ) ) {
			//	x = 0; }
				let e = document.getElementById ( self.eleId );
				let r = e.getBoundingClientRect();
				x = r.left; }
			if ( x < 0 ) {
				x = 0; }
			self.state.style.left = x + 'px';
			let y = self.moveY0 + o.dY;
			if ( ! Number.isSafeInteger ( y ) ) {
			//	y = 0; }
				let e = document.getElementById ( self.eleId );
				let r = e.getBoundingClientRect();
				y = r.top; }
			if ( y < 0 ) {		//	for app header
				y = 0; }
			self.state.style.top  = y + 'px';
			self.state.styleString = stringifyStyle ( self.state.style );
			appContentFnc ( { do: 'update-app-size-dictator' } );
			return;
		}
		case ( 'size-start' ): {
			if ( ! cmn.isString ( self.eleId ) ) {
				return; }
			self.sizeW0		 = parseInt ( self.state.style.width );
			self.sizeH0		 = parseInt ( self.state.style.height );
			self.sizeFtrTop0 = parseInt ( self.state.footerStyle.top );
			let e = document.getElementById ( self.eleId );
			o.parentCW = e.clientWidth;
			o.parentCH = e.clientHeight
						 - (self.isHeaderVisible() ? headerH : 0)
						 - (self.isFooterVisible() ? footerH : 0);
			o.top  = self.isHeaderVisible() ? headerH : 0;
			o.left = 0;
			o.dX = 0;
			o.dY = 0;
			if ( self.rootPaneFnc ) {
				o.visitedPanes = {};
				self.rootPaneFnc ( o ); }
			if ( o.ev && ! o.bSplitterMoving ) {
				self.appFnc ( { do: 		'size-frame',
								frameFnc:	self.doAll,
								ev: 		o.ev } ); }
			return;
		}
		case ( 'size' ): {
		//	if ( isCentered ) {
		//		o.dX *= 2;
		//		o.dY *= 2; }
			let dX = o.dX;
			let dY = o.dY;
			let w = self.sizeW0 + dX;
			if ( w < frameMinW ) {
				dX = frameMinW - self.sizeW0;
				w  = frameMinW; }
			let h = self.sizeH0 + dY;
			if ( h < frameMinH ) {
				dY = frameMinH - self.sizeH0;
				h  = frameMinH; }
			if ( isCentered ) {
				dX *= 2;
				dY *= 2; }
			cmn.log ( sW, 'dX dY ' + dX + ' ' + dY + '   w h ' + w + ' ' + h );
			let sizingFrame = ! (   cmn.isBoolean ( o.noFrameSizing ) 
								 && o.noFrameSizing);
			function sizePane() {
				let e = <HTMLElement>document.getElementById ( self.eleId );
				o.parentCW = e.clientWidth;
				o.parentCH = e.clientHeight
							 - (self.isHeaderVisible() ? headerH : 0)
							 - (self.isFooterVisible() ? footerH : 0);
				o.top  = self.isHeaderVisible() ? headerH : 0;
				o.left = 0;
				let o2 = clone ( o );
				o2.dX = dX;
				o2.dY = dY;
				if ( sizingFrame && cmn.isFunction ( self.sizerFnc ) ) {
					self.sizerFnc ( o2 ); }
				if ( cmn.isFunction ( self.rootPaneFnc ) ) {
					self.rootPaneFnc ( o2 ); }
			}
			if ( ! sizingFrame ) {
				sizePane();
				return; }
		//	self.state.style.width  = (self.sizeW0 + o.dX) + 'px';
		//	self.state.style.height = (self.sizeH0 + o.dY) + 'px';
		//	self.state.footerStyle.top = (self.sizeFtrTop0 + o.dY) + 'px';
			self.state.style.width  = w + 'px';
			self.state.style.height = h + 'px';
			self.state.footerStyle.top = (self.sizeFtrTop0 + dY) + 'px';
			self.state.styleString = stringifyStyle ( self.state.style );
		//	appContentFnc ( { do: 'update-app-size-dictator' } );
		//	Do this at the end of the size. See AppFrame mouseUp().
			tick().then ( () => {
				sizePane();
			} );
			return;
		}
		case ( 'frame-burger-click' ): {
			self.burgerClick();
			return;
		}
		case ( 'iconize' ): {
			self.iconize ( o );
			return;
		}
		case ( 'un-iconize' ): {
			self.clickIcon ( null );
			return;
		}
		case ( 'is-iconized' ): {
			return !! self.iconized;
		}
		case ( 'register-notifyee' ): {
			self.notifies[o.paneId] = { fnc: o.fnc };
			return;
		}
		case ( 'destroy' ): {
			self.destroy ( o );
			return;
		}

		case ( 'get-state' ): {
			let frameName = self.state.frameName === self.orgFrameName
												  ?  null
												  :  self.state.frameName;
			self.rootPaneFnc ( o );		//	update pane's state in app store
			if ( self.iconized ) {
				return {
					hdrVisible:	!! self.state.normalHeader,
					ftrVisible:	self.isFooterVisible(),
					frameName:	frameName,
					frameType:	frameType,
					frameId:	frameId,
					paneId:		paneId,
					style:		clone ( self.state.style ),
			//		iconized:	true,
					iconized:	cmn.isFunction ( self.iconFnc ) 
								? { style : self.iconFnc ( { do: 'get-style' } ) } 
								: false }; }
			return {
				hdrVisible:	!! self.state.normalHeader,
				ftrVisible:	self.isFooterVisible(),
				frameName:	frameName,
				frameType:	frameType,
				frameId:	frameId,
				paneId:		paneId,
				style:	  	clone ( self.state.style ),
				iconized:	false };
		}
		case ( 'get-state-2' ): {
			let frameName = self.state.frameName === self.orgFrameName
												  ?  null
												  :  self.state.frameName;
			if ( self.iconized ) {
				cmn.error ( sW, 'frame is iconized' );
				return null; }

			return {
				hdrVisible:	!! self.state.normalHeader,
				ftrVisible:	self.isFooterVisible(),
				frameName:	frameName,
				frameType:	frameType,
				frameId:	frameId,
				paneId:		paneId,
				style:	  	clone ( self.state.style ),
				paneState:	self.rootPaneFnc ( o ) };
		}

		case ( 'set-state' ): {
			self.rootPaneFnc ( o );		//	set state from app store
			return;
		}
		case ( 'set-state-2' ): {
			self.rootPaneFnc ( { do:	o.do,
								 state:	o.state.paneState } );
			return;
		}

		case ( 'split-horz' ): {
			if ( self.rootPaneFnc ) {
				self.rootPaneFnc ( o );	}
			return;
		}
		case ( 'split-vert' ): {
			if ( self.rootPaneFnc ) {
				self.rootPaneFnc ( o ); }
			return;
		}
		case ( 'show-menu' ): {
			self.appFnc ( o );
			return;
		}
		case ( 'show-name-dlg' ): {
			self.appFnc ( o );
			return;
		}
		case ( 'append-menu-items' ): {
			appContentFnc ( o );
			return;
		}
		case ( 'burger-menu-dismissed' ): {
			self.isShowingBurgerMenu = false;
			return;
		}
		case ( 'menu-item' ): {
			if ( o.menuItemText === 'Frame Name ...' ) {
				self.nameFrame();
				return; }
			if ( o.menuItemText === 'Show Header' ) {
				self.state.normalHeader		= true;
				self.state.transientHeader	= false;
				tick().then ( () => {
					//	Move and resize the root pane to make room for the
					//	header.
					let cmd: any = { do:	'set-style', 
									 top: 	headerH };
					self.rootPaneFnc ( cmd ).then ( () => {
						self.sizeRootPane ( 0, -headerH, true );
					} ).catch ( (err: any) => {
						cmn.errorCatch ( sW, err );
					} );
				} );
				return; }
			if ( o.menuItemText === 'Hide Header' ) {
				self.state.normalHeader		= false;
				self.state.transientHeader	= true;
				tick().then ( () => {

					//	Move and resize the root pane to fill the space of the 
					//	header.
					let cmd = { do:	'set-style', 
								top: 0 };
					self.rootPaneFnc ( cmd ).then ( () => {
						self.sizeRootPane ( 0, headerH, true );
					} ).catch ( (err: any) => {
						cmn.errorCatch ( sW, err );
					} );
				} );
				return; }
			if ( o.menuItemText === 'Show Footer' ) {
				self.state.footerStyle.display = 'block';
				tick().then ( () => {
					//	Resize the root pane to make space for the footer.
					self.sizeRootPane ( 0, -footerH, true );
				} );
				return; }
			if ( o.menuItemText === 'Hide Footer' ) {
				self.state.footerStyle.display = 'none';
				tick().then ( () => {
					//	Resize the root pane to fill the space of the footer.
					self.sizeRootPane ( 0, footerH, true );
				} );
				return; }
			o.frameId = frameId;
			appContentFnc ( o );
			return;
		}
		case ( 'name-frame-name' ): {
			self.nameFrameName ( o );
			return; }
		case ( 'set-frame-name-part-2' ): {
			if ( self.headerFnc ) {
				self.headerFnc ( o ); }
			return; }
		case ( 'is-header-transient' ): {
			return !! self.state.transientHeader;
		}
		case ( 'is-header-visible' ): {
			return self.isHeaderVisible();
		}
		case ( 'is-transient-header-visible' ): {
			return self.isTransientHeaderVisible();
		}
		case ( 'get-transient-header-status' ): {
			return self.getTransientHeaderStatus();
		}
		case ( 'show-header' ): {
			if ( self.state.normalHeader ) {
				return true; }
			if ( ! self.headerFnc ) { 
				return false; }
			let wasVisible = self.isTransientHeaderVisible();
			if ( ! wasVisible ) {
				self.headerFnc ( { do: 'show' } ); }
			return wasVisible;
		}
		case ( 'hide-transient-header' ): {
			if ( ! self.headerFnc ) { 
				return; }
			if ( ! self.state.transientHeader ) {
				return true; }
			self.headerFnc ( { do: 'hide' } );
			return;
		}
		case ( 'mouse-entered-top-pane-button-bar' ): {
		//	cmn.log ( sW );
			self.mouseInTopPaneButtonBar = true;
			return;
		}
		case ( 'mouse-exited-top-pane-button-bar' ): {
		//	cmn.log ( sW );
			self.mouseInTopPaneButtonBar = false;
			return;
		}
		case ( 'is-mouse-in-any-top-pane-button-bar' ): {
		//	cmn.log ( sW );
			return self.mouseInTopPaneButtonBar;
		}
	//	case ( 'footer-updated' ): {
	//		//	Footer has dis/appeared - the size of area available for pane(s)
	//		//	has changed.
	//		if ( self.rootPaneFnc ) {
	//			self.relayout ( o ); }
	//		return; 
	//	}
		case ( 'get-control' ): {
		//	return self.getControl ( o ); 
			return self.onePaneFnc ( o );
		}
		case ( 'get-code' ): {
		//	return self.getCode ( o );
			return self.onePaneFnc ( o );
		}
		case ( 'disallow-pane-edits' ): {
			return self.allPaneFnc ( o ); 
		}
		case ( 'disallow-transient-header' ): {
			self.state.transientHeader = false;
			break;
		}
		case ( 'disallow-frame-sizing' ): {
			self.state.sizer = false;
			break;
		}
		case ( 'disallow-transient-header-burger' ): {
			self.state.transientHeaderBurger = false;
			break;
		}
		case ( 'disallow-transient-header-title' ): {
			self.state.transientHeaderTitle = false;
			break;
		}
		case ( 'disallow-transient-header-iconize' ): {
			self.state.transientHeaderIconize = false;
			break;
		}
		case ( 'disallow-transient-header-destroy' ): {
			self.state.transientHeaderDestroy= false;
			break;
		}
		case ( 'maximize-pane' ): {
			return self.maximizePane ( o ); 
		}
		case ( 'set-other-pane-width' ): {
			return self.setOtherPaneWidth ( o );
		}
		case ( 'width-delta' ): {
			return self.widthDelta ( o );
		}
		case ( 'screen' ): {
			return self.screen ( o );
		}
		case ( 'unscreen' ): {
			return self.unscreen ( o );
		}
		case ( 'get-info' ): {
			return self.getInfo ( o );
		}
		case ( 'get-properties-pane' ): {
			return self.getPropertiesPane ( o );
		}
		case ( 'get-style' ) : {
			return self.state.style;
		}
		case ( 'show-name-dlg' ) : {
			return self.appFnc ( o );
		}
	}	//	switch
        },  //  doAll()

    };  //  self

	self.state.styleString	= stringifyStyle ( self.state.style );

	onMount ( () => {
		const sW = frameId + ' paneless Frame onMount()';
	//	cmn.log ( sW );

		clientFnc ( { do: 		'set-call-down',
					  to:		'frame',
					  frameId:	frameId,
					  paneId:	paneId,
					  frameFnc:	self.doAll } );
			//		  iconized:	!! self.iconized } );

		appContentFnc ( { do: 		'set-call-down',
						  to:		'frame',
						  frameId:	frameId,
						  frameFnc:	self.doAll } );
		
		if ( frameAs === 'dialog' ) {
			appContentFnc ( { do:		'set-frame-focus',
							  frameAs:	frameAs,
							  frameId:	frameId } ); }
	} ) //  onMount()


	beforeUpdate ( () => {
	//	const sW = frameId + ' paneless Frame beforeUpdate()';
	//	cmn.log ( sW );
	} );	//	beforeUpdate()

	onDestroy ( () => {
		const sW = frameId + ' paneless Frame onDestroy()';
	//	cmn.log ( sW );
		if ( self.beingDestroyed ) {
			clientFnc ( { do:		'frame-destroyed',
						  frameId:	frameId } ); }

		self.eleId			= null;
		self.rootPaneFnc	= null;
	} )	//	onDestroy()

</script>

<paneless-frame
	style	= "display: contents">

    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        id              = { self.eleId }
		data-testid 	= "paneless-frame"
		class			= "frame-div"
		style 			= { self.state.styleString }
		on:mousedown	= { self.mouseDown } >
		{#if self.state.normalHeader }
			<FrameHeader 
				frameEleId	= { self.eleId }
				frameId 	= { frameId }
				frameName	= { self.state.frameName }
				frameFnc	= { self.doAll } />
		{/if}
		<Pane prpFrameId		= { frameId }
			  prpPaneId			= { paneId }
			  prpFrameFnc		= { self.doAll }
			  prpTabs			= { false } 
			  prpAtFrameTop		= { true } 
			  prpAppContentFnc	= { appContentFnc }
			  prpClientFnc		= { clientFnc } 
			  prpStyle			= { self.state.paneStyle } />
		<FrameFooter 
			frameEleId	= { self.eleId }
			style		= { self.state.footerStyle }
			frameFnc 	= { self.doAll } />
		{#if self.state.sizer }
			<Sizer
				frameId 	= { frameId }
				frameEleId 	= { self.eleId }
				frameFnc	= { self.doAll }  />
		{/if}

		{#if self.state.transientHeader }
			<FrameTransientHeader 
				prpFrameId		= { frameId }
				prpFrameName	= { self.state.frameName }
				prpFrameFnc		= { self.doAll }
				prpFrameBurger	= { self.state.transientHeaderBurger }
				prpFrameTitle	= { self.state.transientHeaderTitle }
				prpFrameIconize	= { self.state.transientHeaderIconize }
				prpFrameDestroy = { self.state.transientHeaderDestroy } />
		{/if}
	</div>

	{#if self.state.screen }
		<div 
			class	= "screen-div"
			style   = { self.state.screenStyle } >
			{ self.state.screenMsg }
		  </div>
	{/if}
	<Icon	prpEleId 			= { self.eleId + '-icon' }
			prpStyle			= { self.iconStyle }
			prpAppFnc			= { self.appFnc }
			prpAppContentFnc	= { appContentFnc }
			prpFrameFnc			= { self.doAll } 
			prpFrameId			= { frameId }
			prpFrameName		= { self.state.frameName } />

</paneless-frame>

<style>
    paneless-frame {
        display:        contents;
    }
    .frame-div {
        position:           absolute;
        border:             solid 1px black;
        background-color:   white;
    }
	.screen-div {
		position:			absolute;
		width:				100%;
		height:				100%;
		background-color:	rgba(255,255,255,0.9);
		display:			grid;
		align-items:		center;
		justify-items:		center;
	}
</style>