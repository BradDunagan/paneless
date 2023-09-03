<script lang="ts">
/*
		 1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/
	import { onMount, onDestroy, afterUpdate }	from 'svelte';
	import { tick }				from 'svelte';
	import * as d3 				from 'd3';
 
	import { cmn }				from '../common';
	import { uc } 				from './udui-common';
	import { uPanel } 			from './udui-panel-f';
	import { uShiftClick } 		from './udui-shift-click-a';

	export let prpAppFrameFnc: any		= null;
	export let prpClientAppFnc: any 	= null;
	export let prpAppContentFnc: any 	= null;
	export let prpFrameId: number 		= 0;
	export let prpPaneId: number		= 0;

	let lastPropertiesSvgEleId	= 0

	let title 					= '';
	let titleStyleString		= '';


class Properties {

	state: {
		title:					string;
		titleStyle:				any;
	};
	svgId:					number;
	svg: {
		eleId:					string;
	};
	regSpec:				any;
	bRegistered:			boolean;
//	uduiFnc:				null;

	callees:				any;		//	registered panes called from 
										//	here
	
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
			title:			'Properties',
			titleStyle:		null,
		};

		this.svgId = ++lastPropertiesSvgEleId;

		this.svg = {
			eleId:		'rr-properties-svg-' + this.svgId
		};

		this.regSpec = { frame:		"Properties",
						 pane:		"Properties",
						 rcvFm: {
							udui: {
								pane:  	'UDUI' },
						 },
						 sndTo: {
							udui: {
								pane:	'UDUI' },
						 } };

		this.bRegistered	= false;

	//	this.uduiFnc = null;	//	UDUI of which control's properties are set.
		this.callees = {};


		this.unsetResizeFactors	= this.unsetResizeFactors.bind ( this );
		this.setRootPanelWH		= this.setRootPanelWH.bind ( this );
		this.createRootPanel	= this.createRootPanel.bind ( this );
		this.changeTitle		= this.changeTitle.bind ( this );
		this.setTitle			= this.setTitle.bind ( this );
		this.updateRegistration	= this.updateRegistration.bind ( this );
		this.paneRegistration	= this.paneRegistration.bind ( this );
		this.doAll              = this.doAll.bind ( this );

		this.rpd 		= null;
		this.rootPanel 	= null;		//	Know that rootPanel.data.rpd is null.

		this.bGotResizeFactors 		= false;
		this.resizeFactorsTimeOut	= null;

		this.board 			= null;
	//	this.prpsOfCtrlD	= null;
	//	this.prpsTitle		= '';
		this.showCtrlD 		= null;
		this.showTitle		= '';

	}	//	constructor()

	unsetResizeFactors() {
		var sW = 'UDUI unsetResizeFactors()';
		cmn.log ( sW );
		this.bGotResizeFactors = false;
	}

	setRootPanelWH() {
		const sW = 'Properties setRootPanelWH()';

		let rpd = this.rpd;
		if ( ! rpd ) {
			return; }
		let e = document.getElementById ( this.svg.eleId );
		if ( ! e ) {
			return; }
		let w = e.clientWidth;
		let h = e.clientHeight;
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
		rpd.onSize ( rpd, -1, null, dx, dy );
	}	//	setRootPanelWH()

	createRootPanel ( svg ) {
		let w = '100%';
		let h = '100%';
		let uduiId = uc.getUduiId();
		let rpd = uPanel.createAppPanelData ( { 
			rpd:		null,		//	the rpd's rpd is null
			uduiId:		uduiId,
			x: 			0, 
			y: 			0, 
			w: 			w, 
			h: 			h, 
			name: 		uc.APP_CLIENT_ROOT_PANEL_NAME, 
			clickCB: 	uShiftClick.shiftClickPanel, 
			storeId: 	uc.APP_CLIENT_ROOT_PANEL_STORE_ID,
			storeName: 	uc.APP_CLIENT_ROOT_PANEL_STORE_NAME,
			hasBorder: 	false,
		//	bW100Pct: 	true,		default is false
			bMoveRect: 	false,
			bSizeRect: 	false,
			bVertSB: 	false,
			bHorzSB: 	false } );

		rpd.uduiId 			= uduiId;
		rpd.svg 			= svg;
		rpd.rootData 		= {		
			nextId: 	0,		//	Each item in data[] must have a unique Id.  Set by
			data: 		[] };	//	the panel service - uPanel.
		rpd.appScreenPanels = [];
		rpd.clipPathsData 	= [];

		//	Normally the parent panel sets this.  Since this is the "root" 
		//	panel (it has no parent udui element) we do it here.
		rpd.eleId = 'rr-properties-root-panel-' + this.svgId;

		rpd.rootData.data.push ( rpd );
		this.rpd 		= rpd;
		this.rootPanel	= uPanel.createPanel ( rpd.svg, rpd.rootData, true );
		this.setRootPanelWH();
	}	//	createRootPanel()

	changeTitle ( o ) {
		prpAppFrameFnc ( { 
			do: 	'show-name-dlg',
			upFnc: 	this.doAll,
			ctx: 	{ title:		'Properties Title',
					  nameLabel:	'Title:',
					  curName:		this.state.title,
					  after: 		'set-title' } } );
	}	//	changeTitle()

	setTitle ( o ) {
		this.state.title = o.name;
		title = this.state.title
	}	//	setTitle()
	
	updateRegistration ( newRegSpec ) {

		if ( this.bRegistered ) {
			prpClientAppFnc ( { do: 		'unregister',
								frameId:	prpFrameId,
								paneId:		prpPaneId,
								fnc:		this.doAll,
								paneKind:	'properties',
								regSpec: 	this.regSpec } ); 
			this.bRegistered = false; }
		
		this.regSpec = newRegSpec;
		
		prpClientAppFnc ( { do: 		'register',
							frameId:	prpFrameId,
							paneId:		prpPaneId,
							fnc:		this.doAll,
							paneKind:	'properties',
							regSpec: 	this.regSpec } ); 
		this.bRegistered = true;

	}	//	updateRegistration()
	
	paneRegistration() {
		const sW = 'Properties paneRegistration()';
		cmn.log ( sW );

		function checkRegSpec ( rs ) {
			cmn.checkRegSpec ( rs, ['udui'], 
								   ['udui'] );
		}	//	checkRegSpec()

		//	Dialog to edit long text.
		function onOK ( a ) {
			cmn.log ( sW, ' onOK()' );

			//	Set regSpec property.
			try {
				let regSpec = JSON.parse ( a.text ); 
				checkRegSpec ( regSpec );
				
				self.updateRegistration ( regSpec );
				
				prpClientAppFnc ( { do:			'set-state-changed',
									bSaveNow:	true } ); }
			catch ( err ) {
				cmn.error ( sW + ' onOK()', err ); }
		}	//	onOK()
	
		let title = 'Properties Registration Spec';
		let text  = JSON.stringify ( this.regSpec, null, '    ' );
		prpClientAppFnc( { do:		'long-text-dialog',
						   title:	title,
						   onOK:	onOK,
						   text:	text } );

	}	//	paneRegistration()

	doAll ( o ) {
		let sW = 'Properties doAll() ' + o.do;
	//	cmn.log ( sW );
		if ( o.do === 'identify' ) {
			return { name:		'Properties',
					 fnc:		this.doAll  }; }
				//	 uduiFnc:	this.uduiFnc }; }
		if ( o.do === 'set-registered-callee' ) {
			if ( ! cmn.isObject ( this.regSpec ) ) {
				cmn.error ( sW, 'this.regSpec is not set' );
				return; }
		//	if ( o.pane === this.regSpec.sndTo['udui'].pane ) {
		//		this.uduiFnc = o.fnc;
		//		return; }
			cmn.setRegisteredCallee ( sW, this.regSpec, this.callees, o );
			return;
		}
		if ( o.do === 'unset-registered-callee' ) {
			if ( ! cmn.isObject ( this.regSpec ) ) {
				cmn.error ( sW, 'this.regSpec is not set' );
				return; }
		//	if ( o.pane === this.regSpec.sndTo['udui'].pane ) {
		//		this.uduiFnc = null;
		//		return; }
			cmn.unsetRegisteredCallee ( sW, this.regSpec, this.callees, o );
			return;
		}
		if ( o.do === 'get-state' ) {
			return { 
				state: 	{
					regSpec:	this.regSpec
				}
			};
		}
		if ( o.do === 'set-state' ) {
			if ( ! cmn.isObject ( o.state ) ) {
				return; }
			if ( cmn.isObject ( o.state.regSpec ) ) {
				this.updateRegistration ( o.state.regSpec ); }
			return;
		}
		if ( (o.do === 'size') || (o.do === 'splitter-dragged') ) {
			this.setRootPanelWH();
			return; }
		if ( o.do === 'append-menu-items' ) {
			let a = o.menuItems;
			let bShowTitle = this.state.titleStyle && (this.state.titleStyle.display === 'none');
			a.push ( { type: 'item', 		text: 'Title ...' } );
			a.push ( { type: 'item', 		text: bShowTitle ? 'Show Title' : 'Hide Title' } );

			a.push ( { type: 		'separator',	
					   text: 		'' } );

			a.push ( { type: 		'item',		
					   text: 		'Pane Registration ...',
					   fnc: 		this.paneRegistration })
			return;
		}
		if ( o.do === 'menu-item' ) {
			//	Return true if the menu item is handled here.
			if ( o.menuItemText === 'Title ...' ) {
				this.changeTitle ( o );
				return true;
			}
			if ( o.menuItemText === 'Show Title' ) {
				this.state.titleStyle = null;
				titleStyleString = cmn.stringifyStyle ( this.state.titleStyle );
				tick().then ( () => {
					this.setRootPanelWH();
				} );
				return true;
			}
			if ( o.menuItemText === 'Hide Title' ) {
				this.state.titleStyle = { display: 'none' };
				titleStyleString = cmn.stringifyStyle ( this.state.titleStyle );
				tick().then ( () => {
					this.setRootPanelWH();
				} );
				return true;
			}
			return false;
		}
		if ( o.do === 'set-title' ) {
			this.setTitle ( o );
			return;
		}
		if ( o.do === 'properties-of-control' ) {
		//	this.prpsOfFrameId	= o.frameId;
		//	this.prpsOfPaneId	= o.paneId;
		//	this.prpsOfCtrlD 	= o.ctrlD;
		//	this.prpsTitle		= o.title;
			this.showCtrlD		= o.ctrlD;
			this.showTitle		= o.title;
			if ( this.board ) {
				this.board.showProperties ( { sC: 		sW,
											  ofFrameId:	o.frameId,
											  ofPaneId:		o.paneId,
											  ofCtrlD: 		o.ctrlD,
											  title:		o.title } ); }
			return; 
		}
		if ( o.do === 'properties-of-pane-splitter' ) {
		//	this.prpsOfFrameId	= o.frameId;
		//	this.prpsOfPaneId	= o.paneId;
		//	this.prpsOfCtrlD	= null;
		//	this.prpsTitle		= o.title;
			this.showCtrlD		= null;
			this.showTitle		= o.title;
			if ( this.board ) {
				this.board.showSplitterProperties ( 
					{ sC: 			sW,
					  ofFrameId:	o.frameId,
					  ofPaneId:		o.paneId,
					  properties:	o.properties,
					  title:		o.title,
					  splitterFnc:	o.shFnc } ); }
			return true;
		}
		if ( o.do === 'keyboard-key-down' ) {
			return false; }
		cmn.log ( sW, ' Error: Unrecognized o.do ' + o.do );
	}	//	doAll()

}   //  Properties

	let self = new Properties();

	onMount ( () => {
		const sW = 'Properties onMount()';
		prpAppContentFnc ( { do:        'set-call-down',
							 to:        'client-content',
							 frameId:   prpFrameId,
							 paneId:	prpPaneId,
							 fnc:       self.doAll } );

	//	prpClientAppFnc ( { do: 		'register',
	//						what:		'Properties',
	//						frameId:	prpFrameId,
	//						paneId:		prpPaneId,
	//						fnc:		self.doAll,
	//						rcvFm:		[ 
	//							{ what: 	'UDUI',
	//							  frameId:	0,
	//							  paneId:	0 } ],
	//						sndTo:		[ 
	//							{ what: 	'UDUI',
	//							  frameId:	0,
	//							  paneId:	0 } ] } );
		prpClientAppFnc ( { do: 		'register',
						//	what:		'Properties',
							frameId:	prpFrameId,
							paneId:		prpPaneId,
							fnc:		self.doAll,
							paneKind:	'properties',
							regSpec:	self.regSpec } );
		self.bRegistered = true;

		//	Set up SVG defs, create this UDUI's root pane.
		let svg = d3.select ( '#' + self.svg.eleId );
		svg.append ( 'defs' );				//	2017-Aug
		self.createRootPanel ( svg );

		//	Create the properties table.
		let pd = self.rootPanel.data;
		self.board = pd.createBoard ( 'properties', 	//	board type
									  -1, 				//	x
									  -1,				//	y
									  false );			//	hasBorder
		pd.filledBy = self.board.spec.panel;
		pd.onSize ( pd, -1, null, 0, 0 );	//	will size ctrl to fill the panel
		if ( self.showCtrlD ) {
			self.board.showProperties ( { sC: 		sW,
										  ofCtrlD: 	self.showCtrlD,
										  title: 	self.showTitle } ); }
	} )	//	onMount()

	onDestroy ( () => {
		const sW = 'Properties onDestroy()';
	//	prpClientAppFnc ( { do: 		'unregister',
	//						what:		'Properties',
	//						frameId:	prpFrameId,
	//						paneId:		prpPaneId,
	//						fnc:		self.doAll,
	//						rcvFm:		[ 
	//							{ what: 	'UDUI',
	//							  frameId:	0,
	//							  paneId:	0 } ],
	//						sndTo:		[ 
	//							{ what: 	'UDUI',
	//							  frameId:	0,
	//							  paneId:	0 } ] } );
		if ( self.bRegistered ) {
			prpClientAppFnc ( { do: 		'unregister',
							//	what:		'Properties',
								frameId:	prpFrameId,
								paneId:		prpPaneId,
								fnc:		self.doAll,
								paneKind:	'properties',
								regSpec:	self.regSpec } ); }
		self.bRegistered = false;
	} )	//	onDestroy()

	titleStyleString = cmn.stringifyStyle ( self.state.titleStyle );
	
</script>


<properties class = "rr-properties-container">
	<div class = "rr-properties-title"
		 style 		= { titleStyleString }>
		{ title }
	</div>
	<svg id			= { self.svg.eleId }
		version		= "1.1"
		baseProfile	= "full"
		width		= "100%" 
		height		= "100%"
		xmlns		= "http://www.w3.org/2000/svg">
	</svg>
</properties>


<style>

	.rr-properties-container {
		display:			grid;
		grid-template-rows:	19px auto;
		width:              100%;
		height:				100%;
	}

	.rr-properties-title {
		font-family:        Arial, Helvetica, sans-serif;
		font-size:          12px;
		padding-bottom:     1px;
		cursor:				default;
		text-align: 		center;
		border-bottom: 		dotted 1px #d2d2d2;
	}

</style>


	