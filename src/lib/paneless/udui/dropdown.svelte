<script lang="ts">
/*
		 1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/
	import { onMount, onDestroy, afterUpdate }	from 'svelte';
//	import { tick }				from 'svelte';
	import * as d3 				from 'd3';
 
	import { cmn }				from '../common';
	import { uc } 				from './udui-common';
	import { uPanel } 			from './udui-panel-f';
	import { uShiftClick } 		from './udui-shift-click-a';

//	export let prpEleId: string 		= 'rr-dropdown';
//	export let prpAppFrameFnc: any		= null;
	export let prpClientAppFnc: any 	= null;
//	export let prpAppContentFnc: any 	= null;
	export let prpFrameId: number 		= 0;
	export let prpPaneId: number		= 0;
	export let prp_x: number			= 0;
	export let prp_y: number			= 0;
	export let prp_w: number			= 0;
	export let prpItemClick: any		= null; 
	export let prpItems: any			= null;
	export let prp_bAsTree: boolean		= false;
	export let prp_cbPopulated: any		= null;
	export let prp_selectedParentId: number = 0;
	export let prp_selectedItemId: number 	= 0;

class ClassDropdown {

	state: {
	};
	svgId:					number;
	svg: {
		eleId:					string;
	};
	uduiFnc:				null;
	rpd:					any;
	rootPanel:				any;
	bGotResizeFactors:		boolean;
	resizeFactorsTimeOut:	null | number;
	board:					any;
//	prpsOfCtrlD:			null;
//	prpsTitle:				string;
	showCtrlD:				null;
	showTitle:				string;
	

	constructor() {

		this.state = {
		};

		this.svgId = uc.getUduiSvgEleId();

		this.svg = {
			eleId:		'rr-udui-svg-' + this.svgId
		};

		this.unsetResizeFactors	= this.unsetResizeFactors.bind ( this );
		this.setRootPanelWH		= this.setRootPanelWH.bind ( this );
		this.createRootPanel	= this.createRootPanel.bind ( this );
		this.dropdown			= this.dropdown.bind ( this );

		this.doAll 				= this.doAll.bind ( this );

		this.rpd 		= null;
		this.rootPanel 	= null;		//	Know that rootPanel.data.rpd is null.

		this.bGotResizeFactors 		= false;
		this.resizeFactorsTimeOut	= null;

	}	//	constructor()

	unsetResizeFactors() {
		var sW = 'Dropdown unsetResizeFactors()';
	//	cmn.log ( sW );
		this.bGotResizeFactors = false;
	}

	setRootPanelWH() {
		const sW = 'Dropdown setRootPanelWH()  pane ' + prpPaneId;
		let e = document.getElementById ( this.svg.eleId );
		if ( ! e ) {
			return; }
		let w = e.clientWidth;
		let h = e.clientHeight;
		let rpd = this.rpd;
		let bd  = rpd.baseData[0];
		let bWasPercent = (rpd.w === '100%' && rpd.h === '100%');
		if ( bWasPercent ) {
			rpd.w = w;
			rpd.h = h;
			bd.w = w;
			bd.h = h;
			rpd.onSize ( rpd, -1, null, 0, 0 );
			return;
		}

		//	Need rpd.lpwf, tphf ...
		//		calculated when size-change starts
		if ( ! this.bGotResizeFactors ) {
			rpd.onSizeStart ( rpd, -1, null );
			if ( this.resizeFactorsTimeOut )
				window.clearTimeout ( this.resizeFactorsTimeOut );
			this.resizeFactorsTimeOut = 
				window.setTimeout ( this.unsetResizeFactors, 3000 );
		}
		//
		//	Maybe instead of that -
		//		Calculate the lpwf and tphf when the user manually  moves the
		//		splitter.

		let dx = w - rpd.w;
		let dy = h - rpd.h;
	//	cmn.log ( sW, rpd.eleId + '  dx ' + dx + '  dy ' + dy );
		rpd.onSize ( rpd, -1, null, dx, dy );
	}	//	setRootPanelWH()

	createRootPanel ( svg ) {
		let self = this;

		function click() {
			prpClientAppFnc ( { do: 'remove-dropdown-screen' } ); 
		}
		
		let w = '100%';
		let h = '100%';
		let uduiId = uc.getUduiId();
		let rpd = uPanel.createAppPanelData ( { 
			rpd:			null,		//	the rpd's rpd is null
			uduiId:			uduiId,
			x: 				0, 
			y: 				0, 
			w: 				w, 
			h: 				h, 
			name: 			uc.APP_CLIENT_ROOT_PANEL_NAME, 
			clickCB: 		click,
			shiftClickCB:	null,
			storeId: 		uc.APP_CLIENT_ROOT_PANEL_STORE_ID,
			storeName: 		uc.APP_CLIENT_ROOT_PANEL_STORE_NAME,
			hasBorder: 		false,
		//	bW100Pct: 		true,		default is false
			bMoveRect: 		false,
			bSizeRect: 		false,
			bVertSB: 		false,
			bHorzSB: 		false,
			hostFnc:		this.doAll,
			baseClass:		'u34-panel-rect-transparent' } );

		rpd.uduiId 			= uduiId;
		rpd.svg 			= svg;
		rpd.rootData 		= {		
			nextId: 	0,		//	Each item in data[] must have a unique Id.  Set by
			data: 		[] };	//	the panel service - uPanel.
		rpd.appScreenPanels = [];
		rpd.nextClipPathId	= 0;
		rpd.clipPathsData 	= [];

		//	Normally the parent panel sets this.  Since this is the "root" 
		//	panel (it has no parent udui element) we do it here.
		rpd.eleId = 'rr-udui-root-panel-' + this.svgId;

		rpd.paneId = prpPaneId;

		rpd.rootData.data.push ( rpd );
		this.rpd 		= rpd;
		this.rootPanel 	= uPanel.createPanel ( rpd.svg, rpd.rootData, true );
		this.setRootPanelWH();
	}	//	createRootPanel()
	
	dropdown() {
		const sW = 'Dropdown dropdown()';

		uShiftClick.createMenu ( { sW: 			sW, 
				 				   evt:			null,
								   rpd: 		this.rpd, 
								   x:			prp_x,
								   y:			prp_y,
								   w:			prp_w,
								   itemClick: 	prpItemClick, 
								   items: 		prpItems,
								   bAsTree:		prp_bAsTree,
								   cbPopulated:	prp_cbPopulated,
								   selectedParentId:	prp_selectedParentId,
								   selectedItemId:		prp_selectedItemId,
								   panel:		this.rootPanel } );
	}	//	dropdown()

	doAll ( o ) {
		let sW = 'Dropdown doAll() ' + o.do;
	//	cmn.log ( sW );
		if ( o.do === 'identify' ) {
			return { name:		'Dropdown',
					 fnc:		this.doAll,
					 frameId:	prpFrameId,
					 paneId:	prpPaneId }; }

		if ( o.do === 'click-focus' ) {
			return true; }

		cmn.error ( sW, 'unrecognized do: ' + o.do );
		return null;
	}	//	doAll()

}   //  class ClassDropdown

	let self = new ClassDropdown();

	onMount ( () => {
		const sW = 'Dropdown onMount()';
		cmn.log ( sW );

		//	Set up SVG defs, create this Dropdown's root pane.
		let svg = d3.select ( '#' + self.svg.eleId );
		svg.append ( 'defs' );			//	2017-Aug
		self.createRootPanel ( svg );

		self.dropdown();
	} )	//	onMount()

	onDestroy ( () => {
		const sW = 'Dropdown onDestroy()';
		cmn.log ( sW );
	} )	//	onDestroy()

	afterUpdate ( () => {
		const sW = 'Dropdown afterUpdate()';
		cmn.log ( sW );
	} )	//	afterUpdate()

</script>

<dropdown>
	<svg id			= { self.svg.eleId }
		version		= "1.1"
		baseProfile	= "full"
		width		= "100%" 
		height		= "100%"
		xmlns		= "http://www.w3.org/2000/svg">
	</svg>
</dropdown>

<style>
	dropdown {
		position:           absolute;
		left:               0px;
		top:                0px;
		width:              100%;
		height:             100%;
		background-color:   transparent;
		display:            flex;
		flex-direction:     row;
		align-items:        center;
		justify-content:    center;
	}
</style>
