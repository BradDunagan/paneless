<script lang="ts">

	import { onMount, onDestroy, afterUpdate }	from 'svelte';
	import { tick }				from 'svelte';
	import * as d3 				from 'd3';
 
	import { cmn }				from '../common';
	import { uc } 				from './udui-common';
	import { uPanel } 			from './udui-panel-f';
	import { uShiftClick } 		from './udui-shift-click-a';
	import { uButton } 			from './udui-button-e';
	import { uGraph }			from './udui-graph-a';
	import { uLabel }			from './udui-label-b';
	import { uCheckbox }		from './udui-checkbox-b';
	import { uList }			from './udui-list-b';
	import { uTree }			from './udui-tree-a';
	import { uInput }			from './udui-input-b';
	import { uTable }			from './udui-table-a';
	import { uTabs }			from './udui-tabs-a';
	import { uTextarea }		from './udui-textarea-a';
	import { uEditor }			from './udui-editor-a';
	import { uCanvas,
			 type BytePixels }	from './udui-canvas-a';
	import { uSL }				from './udui-store-load-a';

	import uDsrcGraph			from './udui-dsrc-graph-a';

	export let prpAppFrameFnc: any		= null;
	export let prpClientAppFnc: any 	= null;
//	export let prpAppContentFnc: any 	= null;
	export let prpFrameId: number 		= 0;
	export let prpPaneId: number		= 0;
	export let prpEleId: string 		= '';
	export let prpCommand: boolean		= true;
	export let prpState: any   			= null;


let title = prpCommand ? 'UDUI - Command Controls' : 'UDUI';

let styleString		 = '';
let titleStyleString = '';

class ClassUDUI {

	state:	{
		style:				any,
	//	styleString:		string,
		titleStyle:			any,
	//	titleStyleString:	string,
	};

	titleH:			number;

	svgId:			number;

	svg:	{
		eleId:		string;
	};
	
	regSpec:			any;
	bUDUIRegistered:	boolean;
	bRPDRegistered:		boolean;

//	peFnc:			any;
//	vpFnc:			any;
//	prpsFnc:		any;
	prpsCtrlD:		any;
//	notifyGotVPFnc:	any;

	callees:		any;				//	registered panes called from 
										//	here
	
	rpd:			any;
	rootPanel:		any;

	bGotResizeFactors:		boolean;
	resizeFactorsTimeOut:	any;

	oState:			any;
	stateSet:		boolean;
	
	focusedPanelDataStack:	any[];
	focusedWH:				boolean;

	willUnmount:	boolean;

	constructor() {

		this.titleH	= 16;

		this.state = {
			style:			{ 'grid-template-rows': this.titleH + 'px auto' },
		//	styleString:	'',
			titleStyle:		{ display: 'block' },
		//	titleStyleString:	'',
		};

		styleString		= cmn.stringifyStyle ( this.state.style );
		titleStyleString = cmn.stringifyStyle ( this.state.titleStyle );

	//	this.svgId = ++lastUduiSvgEleId;
		this.svgId = uc.getUduiSvgEleId();

		this.svg = {
			eleId:		'rr-udui-svg-' + this.svgId
		};


		//	Default reg spec.  Note that this is for the UDUI.  The controls
		//	hosted here may have a separate/additional regSpec - it is
		//	this.rpd.regSpec.
	//	this.regSpec	= JSON.stringify ( o, null, '    ' );
	//	this.rs			= null;		//	pane registration spec

	//	this.regSpec	= null;		//	There is also this.rpd.regSpec.
		//	The default reg spec.  Note that regSpec is psersistent. 
		//	This only holds for new panes and until the user specifies 
		//	something or regSpec is set from state.
		this.regSpec = { pane:	"UDUI",
						 rcvFm: {
							properties: {
								frame:	'Properties',
								pane:  	'Properties' },
						 },
						 sndTo: {
							properties: {
								frame:	'Properties',
								pane: 'Properties' }
						 } };
		this.bUDUIRegistered	= false;
		this.bRPDRegistered 	= false;

	//	this.peFnc		= null;		//	PE	(Process Element)
	//	this.vpFnc		= null;		//	Viewport 
	//	this.prpsFnc 	= null;		//	Properties
		this.prpsCtrlD 	= null;		//	Which control's properties are being 
									//	edited.
	//	this.notifyGotVPFnc	= null;	//	To notify others when a Viewport is 
									//	connected.
		
		this.callees 	= {};

		this.unsetResizeFactors	= this.unsetResizeFactors.bind ( this );
		this.setRootPanelWH		= this.setRootPanelWH.bind ( this );
		this.createRootPanel	= this.createRootPanel.bind ( this );
		this.changeTitle		= this.changeTitle.bind ( this );
		this.setTitle			= this.setTitle.bind ( this );
		this.maybeExecute		= this.maybeExecute.bind ( this );
		this.dropdown			= this.dropdown.bind ( this );
		this.btnCallback		= this.btnCallback.bind ( this );
		this.chkCallback		= this.chkCallback.bind ( this );
		this.edtInputCallback	= this.edtInputCallback.bind ( this );
		this.edtChangeCallback	= this.edtChangeCallback.bind ( this );
		this.lstCallback		= this.lstCallback.bind ( this );
		this.grfCallback		= this.grfCallback.bind ( this );
		this.lblCallback		= this.lblCallback.bind ( this );
		this.getCode			= this.getCode.bind ( this );
		this.treCallback		= this.treCallback.bind ( this );
		this.treItemExpandCallBack
								= this.treItemExpandCallBack.bind ( this );
		this.treItemCollapseCallback
								= this.treItemCollapseCallback.bind ( this );
		this.pnlCallback		= this.pnlCallback.bind ( this );
		this.tbsCallback		= this.tbsCallback.bind ( this );
		this.tblChangeCallback	= this.tblChangeCallback.bind ( this );
		this.txtChangeCallback	= this.txtChangeCallback.bind ( this );
		this.shiftClickCB		= this.shiftClickCB.bind ( this );
		this.click				= this.click.bind ( this );
		this.onProperties		= this.onProperties.bind ( this );
		this.properties			= this.properties.bind ( this );
		this.updateUDUIRegistration
								= this.updateUDUIRegistration.bind ( this );
		this.paneUDUIRegistration	
								= this.paneUDUIRegistration.bind ( this );
		this.updateRPDRegistration
								= this.updateRPDRegistration.bind ( this );
		this.paneCodeRegistration	
								= this.paneCodeRegistration.bind ( this );
		this.subMenu			= this.subMenu.bind ( this );
		this.loadChildren		= this.loadChildren.bind ( this );
		this.get_fPD			= this.get_fPD.bind ( this );
		this.remove_fPD			= this.remove_fPD.bind ( this );
		this.clickFocus			= this.clickFocus.bind ( this );
		this.edtFocusCallBack	= this.edtFocusCallBack.bind ( this );
		this.setupControl		= this.setupControl.bind ( this );
		this.keyDown			= this.keyDown.bind ( this );
		this.doScript			= this.doScript.bind ( this );
		this.doScriptCmd		= this.doScriptCmd.bind ( this );
		this.addControl			= this.addControl.bind ( this );
		this.enable				= this.enable.bind ( this );
		this.setChecked			= this.setChecked.bind ( this );
		this.listAddItem		= this.listAddItem.bind ( this );
		this.listClear			= this.listClear.bind ( this );
		this.setText			= this.setText.bind ( this );
		this.getText			= this.getText.bind ( this );
		this.getSelected		= this.getSelected.bind ( this );
		this.prepCanvasOp		= this.prepCanvasOp.bind ( this );
		this.getCanvasContext	= this.getCanvasContext.bind ( this );
		this.canvasSetFillstyle	= this.canvasSetFillstyle.bind ( this );
		this.canvasFillRect		= this.canvasFillRect.bind ( this );
		this.canvasSize 		= this.canvasSize.bind ( this );
		this.canvasEnlarge		= this.canvasEnlarge.bind ( this );
		this.canvasTranslate	= this.canvasTranslate.bind ( this );
		this.canvasRotate 		= this.canvasRotate.bind ( this );
		this.canvasGetImageData	= this.canvasGetImageData.bind ( this );
		this.canvasEdge			= this.canvasEdge.bind ( this );
		this.showJointValues	= this.showJointValues.bind ( this );
		this.jsonizeRPD			= this.jsonizeRPD.bind ( this );
		this.save				= this.save.bind ( this );
		this.load				= this.load.bind ( this );
		this.insertNameInTopEleIds		
								= this.insertNameInTopEleIds.bind ( this );
		this.instantiateCode	= this.instantiateCode.bind ( this );
		this.doSetState			= this.doSetState.bind ( this );
		this.getControl			= this.getControl.bind ( this );
		this.disallowPaneEdits	= this.disallowPaneEdits.bind ( this );
		this.gotProperties		= this.gotProperties.bind ( this );
		this.getInfo			= this.getInfo.bind ( this );
		this.doAll 				= this.doAll.bind ( this );

		this.rpd 		= null;
		this.rootPanel 	= null;		//	Know that rootPanel.data.rpd is null.

		this.bGotResizeFactors 		= false;
		this.resizeFactorsTimeOut	= null;

		this.oState		= null;
		this.stateSet	= false;
	
		//	Each object in the focusedPanelDataStack is like -
		//		{ pd:				<panel data>,
		//		  focusedChildId:   <control Id>  }
		this.focusedPanelDataStack	= [];
		this.focusedWH				= false;

		this.willUnmount = false;

	}	//	constructor()

	unsetResizeFactors() {
		var sW = 'UDUI unsetResizeFactors()';
	//	cmn.log ( sW );
		this.bGotResizeFactors = false;
	}

	setRootPanelWH() {
		const sW = 'UDUI setRootPanelWH()  pane ' + prpPaneId;
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
		if ( rpd.propCB ) {			//	update the properties board?
			rpd.propCB ( 'w', rpd.w );
			rpd.propCB ( 'h', rpd.h );
		}
	}	//	setRootPanelWH()

	createRootPanel ( svg ) {
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
			clickCB:		this.click,
		//	shiftClickCB:	this.onProperties,
			shiftClickCB:	this.shiftClickCB,
			onProperties:	this.onProperties,
			storeId: 		uc.APP_CLIENT_ROOT_PANEL_STORE_ID,
			storeName: 		uc.APP_CLIENT_ROOT_PANEL_STORE_NAME,
			hasBorder: 		false,
		//	bW100Pct: 		true,		default is false
			bMoveRect: 		false,
			bSizeRect: 		false,
			bVertSB: 		false,
			bHorzSB: 		false,
			hostFnc:		this.doAll } );

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

	changeTitle ( o ) {
		prpAppFrameFnc ( { 
			do: 	'show-name-dlg',
			upFnc: 	this.doAll,
			ctx: 	{ title:		'Controls Title',
					  nameLabel:	'Title:',
					  curName:		title,
					  after: 		'set-title' } } );
	}	//	changeTitle()

	setTitle ( o ) {
	//	this.setState ( { title: o.name } );
		title = o.name;
	}	//	setTitle()

	maybeExecute ( d, i, ele ) {
		let sW = 'UDUI maybeExecute()';
	//	cmn.log ( sW, d.name );
		if ( (typeof d.execute !== 'string') || (d.execute === '') ) {
			return false; }

		if ( ! prpCommand ) {
			return false ; }
		
	//	if ( ! this.peFnc ) {
	//		cmn.log ( sW, 'peFnc is not set' );
	//		return false; }
	//	this.peFnc ( { do: 	'execute',
	//				   cmd:	d.execute } )
		let exeFnc = d.execute;
		//	d.execute like [<pane-name>:]<fnc-name>?
		let e = d.execute.split ( ':' );
		if ( e.length > 1 ) {
			exeFnc = e[1]; }
		let paneFnc = cmn.oneCallee ( sW, this.callees, 'pe', false );
		if ( ! cmn.isFunction ( paneFnc ) ) {
			if ( e.length < 2 ) {
				return false; }
			let o = prpClientAppFnc ( { do: 'find-pane-by-name',
										name:	e[0] } );
			if ( ! o ) {
				return false; }						
			paneFnc = o.paneFnc; }

		//	Prevent ("disable") any other event on the panel while executing.
		let pp = d.parentPanel
		pp.screen();

		paneFnc ( { do: 	'execute',
					cmd:	exeFnc } )
			.then ( () => {
				pp.unscreen();
				cmn.log ( sW, 'PE execute completed' );
			} )
			.catch ( () => {
				cmn.log ( sW, 'PE execute failed' );
			} ); 
		return true;
	}	//	maybeExecute()

	dropdown ( d, i, ele ) {
		const sW = 'UDUI dropdown()';
		if ( ! (uc.isBoolean ( d.bDropdown ) && d.bDropdown) ) {
			return false; }

		let self		= this;
		let items		= null;
		let bAsTree		= true;
		let cbPopulated	= null;
		let selectedParentId	= 0;
		let selectedItemId		= 0;

		let code = this.getCode();
		if ( code && cmn.isFunction ( code.dropDown ) ) {
			let rsp = code.dropDown ( d, i, ele ); 
			if ( ! rsp ) {
				return false; }
			if ( cmn.isPromise ( rsp.promise ) ) {
				items = rsp.promise; }
			else {
				items = rsp.items; }
			bAsTree = rsp.bAsTree; 
			cbPopulated = cmn.isFunction ( rsp.cbPopulated ) ? rsp.cbPopulated
															 : null; 
			selectedParentId = cmn.isNumber ( rsp.selectedParentId ) 
										? rsp.selectedParentId
										: 0;
			selectedItemId = cmn.isNumber ( rsp.selectedItemId ) 
										? rsp.selectedItemId
										: 0;
		}
		else {
			if ( ! (uc.isString ( d.menu ) && (d.menu.length > 0)) ) {
				return false; }
			try {
				items = JSON.parse ( d.menu );
			} catch ( e: any ) {
				cmn.error ( sW, ' failed to parse d.menu, ' + e.message ); 
				return false; } }

		function itemClick ( evt, itemData ) {
			evt.stopPropagation();

			cmn.log ( sW, itemData.textId + '  ' + itemData.text );

			function closeDropdown() {
				prpClientAppFnc ( { do: 'remove-dropdown-screen' } );
			}

			if ( code && cmn.isFunction ( code.dropDownClick ) ) {
				let rsp = code.dropDownClick ( d, itemData, i, ele );
				if ( rsp ) {
					if ( cmn.isBoolean ( rsp.close ) ) {
						if ( rsp.close ) {
							closeDropdown(); } }
					else {
						closeDropdown(); }
					return; } }
			closeDropdown();
			self.maybeExecute ( itemData, i, ele );
		}	//	itemClick()

		let p = this.rpd.svg.node().parentElement;
		let r = p.getBoundingClientRect();
		let x = d.x           + r.x;
		let y = d.y + d.h + 1 + r.y;

		let bTitleShowing =      this.state.titleStyle 
							 && (this.state.titleStyle.display !== 'none');

		if ( bTitleShowing ) {
			let t = <HTMLElement>
					document.getElementById ( prpEleId + '-title' );
			y += t.offsetHeight; }

		prpClientAppFnc ( { do:				'show-dropdown-screen',
							x:				x,
							y:				y,
							w:				d.w,
							itemClick: 		itemClick, 
							items: 			items,
							bAsTree:		bAsTree,
							cbPopulated:	cbPopulated,
							selectedParentId:	selectedParentId,
							selectedItemId:		selectedItemId } );

		return true;
	}	//	dropdown()

	btnCallback ( d, i, ele ) {
		let sW = 'UDUI btnCallback()';
		cmn.log ( sW, d.name );
		if ( this.maybeExecute ( d, i, ele ) ) {
			return; }
		let code = this.getCode();
		if ( this.dropdown ( d, i, ele ) ) {
			return; }
		if ( code ) {
		  	if ( cmn.isFunction ( code.btnClick ) ) {
				if ( code.btnClick ( d, i, ele ) ) {
					return; } } } 
		while ( (typeof d.onclick === 'object') && (d.onclick !== null) ) {
			let o = d.onclick;
			if ( o.to === 'viewport' ) {
			//	if ( ! this.vpFnc ) {
			//		cmn.log ( sW, 'vpFnc is not set' );
			//		return; }
			//	this.vpFnc ( { do: o.cmd, what: o.what } );
				let fnc = cmn.oneCallee ( sW, this.callees, 'viewport' );
				if ( ! cmn.isFunction ( fnc ) ) {
					return false; }
				fnc ( { do: o.cmd, what: o.what } );
				break; } 
			cmn.log ( sW, 'unrecognized d.onclick.to "' + o.to + '"' );
			return false;
		}
		return true;
	}	//	btnCallback()

	chkCallback ( d, i, ele ) {
		let sW = 'UDUI chkCallback()';
		cmn.log ( sW, d.name );
		if ( this.maybeExecute ( d, i, ele ) ) {
			return; }
		let code = this.getCode();
		if ( code ) {
		  	if ( cmn.isFunction ( code.chkClick ) ) {
				if ( code.chkClick ( d, i, ele ) ) {
					return; } } } 
	}	//	chkCallback()

	edtInputCallback ( evt, d ) {
		let sW = 'UDUI edtInputCallback()';
		//	Called when input's value changes - key press, delete, paste, etc..
		let ele = [evt.target];
	//	cmn.log ( sW, d.name + '  eleId: ' + d.eleId + '  ' 
	//				+ ele[0].value );
		let code = this.getCode();
		if ( code ) {
		  	if ( cmn.isFunction ( code.edtInput ) ) {
				if ( code.edtInput ( d, 0, ele ) ) {
					return; } } } 
	}	//	edtInputCallback()

	edtChangeCallback ( evt, d ) {
		let sW = 'UDUI edtChangeCallback()';
		//	Called when input focus is lost or when Enter key is pressed.
		cmn.log ( sW, d.name + '  value: ' + d.value );
		let ele = [evt.target];
		if ( this.maybeExecute ( d, 0, ele ) ) {
			return; }
		let code = this.getCode();
		if ( code ) {
		  	if ( cmn.isFunction ( code.edtChange ) ) {
				if ( code.edtChange ( d, 0, ele ) ) {
					return; } } } 
		let a = d.onchange;
		if ( ! Array.isArray ( a ) ) {		//	Try 'on-change'?
			a = d['on-change']; }
		if ( Array.isArray ( a ) ) {
			for ( let i = 0; i < a.length; i++ ) {
				let o = a[i];
				if ( o.to === 'viewport' ) {
				//	if ( ! this.vpFnc ) {
				//		cmn.error ( sW, 'vpFnc is not set' );
				//		return; }
					let fnc = cmn.oneCallee ( sW, this.callees, 'viewport' );
					if ( ! cmn.isFunction ( fnc ) ) {
						return; }
					o.cmd.value = d.value;
				//	this.vpFnc ( o.cmd );
					fnc ( o.cmd );
					return; } 
				cmn.error ( sW, 'unrecognized d.onchange.to "' + o.to + '"' );
				return; } }
	//	if ( d.name === 'edtJ1' ) {
	//		if ( this.vpFnc ) {
	//			this.vpFnc ( { do: 'set-joint', joint: 'J1', value: d.value } ); } 
	//		return; }
	//	if ( d.name === 'edtJ2' ) {
	//		if ( this.vpFnc ) {
	//			this.vpFnc ( { do: 'set-joint', joint: 'J2', value: d.value } ); } 
	//		return; }
	//	if ( d.name === 'edtJ3' ) {
	//		if ( this.vpFnc ) {
	//			this.vpFnc ( { do: 'set-joint', joint: 'J3', value: d.value } ); } 
	//		return; }
	//	if ( d.name === 'edtJ4' ) {
	//		if ( this.vpFnc ) {
	//			this.vpFnc ( { do: 'set-joint', joint: 'J4', value: d.value } ); } 
	//		return; }
	//	if ( d.name === 'edtJ5' ) {
	//		if ( this.vpFnc ) {
	//			this.vpFnc ( { do: 'set-joint', joint: 'J5', value: d.value } ); } 
	//		return; }
	//	if ( d.name === 'edtJ6' ) {
	//		if ( this.vpFnc ) {
	//			this.vpFnc ( { do: 'set-joint', joint: 'J6', value: d.value } ); } 
	//		return; }
	//	if ( d.name === 'edtJ7' ) {
	//		if ( this.vpFnc ) {
	//			this.vpFnc ( { do: 'set-joint', joint: 'J7', value: d.value } ); } 
	//		return; }
	//	Need more for that. E.g., which arm?
		
	}	//	edtChangeCallback()

	lstCallback ( evt, d ) {
		let sW = 'UDUI lstCallback()';
		//	d is the list item data
	//	cmn.log ( sW, '  list: ' + d.ld.name + '  item: ' + d.text );
		
		if ( this.maybeExecute ( d.ld, -1, evt.target ) ) {
			return; }

		let code = this.getCode();
		if ( code ) {
		  	if ( cmn.isFunction ( code.lstClick ) ) {
				if ( code.lstClick ( d, -1, evt.target) ) {
					return; } } }

		while ( uc.isObject ( d.onselect ) ) {
			let o = d.onselect;
			if ( o.to === 'viewport' ) {
			//	if ( ! this.vpFnc ) {
			//		cmn.error ( sW, 'vpFnc is not set' );
			//		return; }
				let fnc = cmn.oneCallee ( sW, this.callees, 'viewport' );
				if ( ! cmn.isFunction ( fnc ) ) {
					return; }
				if (	(o.cmd  === 'select') 
					 && (o.what === 'selected-object') ) {
				//	this.vpFnc ( { do: 'select', what: d.ld.name } );
					fnc ( { do: 'select', what: d.ld.name } );
					break; }
				cmn.log ( sW, 'unrecognized d.onselect.cmd "' 
							+ o.cmd + '"' );
				return; } 
			cmn.error ( sW, 'unrecognized d.onselect.to "' 
						  + o.to + '"' );
			return; }
	}	//	lstCallback()

	grfCallback ( evt, d ) {
		let sW = 'UDUI ' + prpPaneId + ' grfCallback()';
		cmn.log ( sW, '  graph: ' + d.name );
		
		if ( this.maybeExecute ( d, -1, evt.target ) ) {
			return; }
		let code = this.getCode();
		if ( code ) {
		  	if ( cmn.isFunction ( code.grfClick ) ) {
				if ( code.grfClick ( d, -1, evt.target) ) {
					return; } } }
	}	//	grfCallback()

	lblCallback ( evt, d ) {
		let sW = 'UDUI lblCallback()';
		cmn.log ( sW, '  label: ' + d.name );
		
		if ( this.maybeExecute ( d, -1, evt.target ) ) {
			return; }
		let code = this.getCode();
		if ( code ) {
		  	if ( cmn.isFunction ( code.lblClick ) ) {
				if ( code.lblClick ( d, -1, evt.target ) ) {
					return; } } }
	}	//	lblCallback()

	getCode ( codeName?: string ) {
		//	If a specific codeName is specified then do not search
		//	elsewhere in the frame.
		if ( (typeof codeName === 'string') && (codeName.length > 0) ) {
			if ( 	this.rpd 
				 &&	cmn.isObject ( this.rpd.code )
				 && (this.rpd.code.codeName === codeName) ) {
				return this.rpd.code; }
			else {		//	do not search elsewhere in the frame
				return null; } }
		if ( this.rpd && cmn.isObject ( this.rpd.code ) ) {
			return this.rpd.code; }
	//	if ( 	(! cmn.isString ( this.rpd.codName ))
	//		 || (this.rpd.codeName.length < 1)        ) {
	//		return null; }
	//	//	It may be that this UDUI is part of a multi-pane frame.  Got
		//	to get the code from the UDUI that was assigned it.
		let frame = prpClientAppFnc ( { 
				do: 		'get-frame',
				frameId:	prpFrameId } );
		if ( ! cmn.isObject ( frame ) ) {
			return null; }
		let code = frame.frameFnc ( { do: 'get-code' } );
		return code;
	}	//	getCode()

	treCallback ( evt, d ) {
		let sW = 'UDUI treCallback()';
		//	d is the tree item data
		//	td is the tree data
		cmn.log ( sW, '  tree: ' + d.td.name + '  item: ' + d.text );
		
		if ( this.maybeExecute ( d.td, -1, evt.target ) ) {
			return; }
		let code = this.getCode();
		if ( code ) {
		  	if ( cmn.isFunction ( code.treClick ) ) {
				if ( code.treClick ( d, -1, evt.target ) ) {
					return; } } }
	}	//	treCallback()

	treItemExpandCallBack ( d, i, e ) {
		let sW = 'UDUI treItemExpandCallback()';
		//	d is the tree item data
		//	td is the tree data
		cmn.log ( sW, '  tree: ' + d.td.name + '  item: ' + d.text );

		//	The tree calls this callback after it does the expansion.
		
		let code = this.getCode();
		if ( code ) {
		  	if ( cmn.isFunction ( code.treItemExpand ) ) {
				if ( code.treItemExpand ( d, i, e ) ) {
					return; } } }
	}	//	treItemExpandCallBack()

	treItemCollapseCallback ( d, i, e ) {
		let sW = 'UDUI treItemCollapseCallback()';
		//	d is the tree item data
		//	td is the tree data
		cmn.log ( sW, '  tree: ' + d.td.name + '  item: ' + d.text );

		//	The tree calls this callback after it does the collapse.
		//	So, if an item was selected that was a child of the item 
		//	collapsed then it probably is no longer selected - that is,
		//	d.td.itemSelected is probably now null.
		
		let code = this.getCode();
		if ( code ) {
		  	if ( cmn.isFunction ( code.treItemCollapse) ) {
				if ( code.treItemCollapse ( d, i, e ) ) {
					return; } } }
	}	//	treItemCollapseCallback()

	pnlCallback ( d, x, y ) {
		let sW = 'UDUI pnlCallback()';
		cmn.log ( sW, d.name );
		
	}	//	pnlCallback()

	tbsCallback ( evt, d ) {				//	Tabs (e.g., click on a tab)
		let sW = 'UDUI tbsCallback()';
		//	d is the tab data.
		//	d.tabs is the Tabs control and d.tabs.data is the TabsData.
		cmn.log ( sW, '  tab: ' + d.text );
		
		if ( this.maybeExecute ( d, -1, evt.target ) ) {
			return; }
		let code = this.getCode();
		if ( code && cmn.isFunction ( code.tbsClick ) ) {
			if ( code.tbsClick ( d, -1, evt.target ) ) {
				return; } }
	}	//	tbsCallback()

	tblChangeCallback ( d ) {
		let sW = 'UDUI tblChangeCallback()';
		cmn.log ( sW, ' cell name: ' + d.name + '  cell value: ' + d.value );
		
	}	//	tblChangeCallback()

	txtChangeCallback ( d ) {
		let sW = 'UDUI txtChangeCallback()';
		cmn.log ( sW, ' name: ' + d.name );
		
	}	//	txtChangeCallback()

	shiftClickCB ( evt, d, otherMenuItems, ms ) {
		const sW = 'UDUI shiftClickCB()';
		cmn.log ( sW, d.name );

		let self = this;

		function createMenu ( o ) {
			let items = o.items;
			if ( otherMenuItems ) {
				items = items.concat ( otherMenuItems ); }
			prpClientAppFnc ( { do: 	'show-menu',
								x:		o.x,
								y:		o.y,
								items:	items } );
		}	//	createMenu()

		if ( ms ) {		//	Multiple Select?
			uShiftClick.shiftClickControls ( evt, 
											 ms.ctrlsData, d.panelData.rpd, 
											 ms.x, ms.y, ms.h, 
											 createMenu ); }
		else {
			uShiftClick.shiftClickControl ( evt, d, createMenu ); }

	}	//	shiftClickCB()

	click ( evt, d ) {
		const sW = 'UDUI click()';
		cmn.log ( sW );
		this.clickFocus ( { paneId: d.getPaneId() } );
	}	//	click()

	onProperties ( d, bNoFncOk? : boolean ) {
		let sW = 'UDUI onProperties()';
		cmn.log ( sW, d.name );
	//	if ( ! this.prpsFnc ) {
	//		return; }
		let bCritical = cmn.isBoolean ( bNoFncOk ) ? ! bNoFncOk 
												   : true;
		let fnc = cmn.oneCallee ( sW, this.callees, 'properties', bCritical );
		if ( ! cmn.isFunction ( fnc ) ) {
			return; }
		let title = 'Properties';
		switch ( d.type ) {
			case uc.TYPE_BUTTON:	title = 'Button Properties';	break;
			case uc.TYPE_CHECKBOX:	title = 'Checkbox Properties';	break;
			case uc.TYPE_INPUT:		title = 'Edit Properties';		break;
			case uc.TYPE_LABEL:		title = 'Label Properties';		break;
			case uc.TYPE_LIST:		title = 'List Properties';		break;
			case uc.TYPE_GRAPH:		title = 'Graph Properties';		break;
			case uc.TYPE_PANEL:		title = 'Panel Properties';		break;
			case uc.TYPE_TABLE:		title = 'Table Properties';		break;
			case uc.TYPE_TABS:		title = 'Tabs Properties';		break;
			case uc.TYPE_TEXTAREA:	title = 'Text Area Properties';	break;
			case uc.TYPE_TREE:		title = 'Tree Properties';		break;
			case uc.TYPE_EDITOR:	title = 'Editor Properties';	break;
			case uc.TYPE_CANVAS:	title = 'Canvas Properties';	break;
			default:
				cmn.error ( sW, 'unrecognized control type '
							  + '(uc.TYPE_XXXXX ' + d.type + ')' ); }
		this.prpsCtrlD = d;
	//	this.prpsFnc ( { do: 		'properties-of-control',
				 fnc ( { do: 		'properties-of-control',
						 frameId:	prpFrameId,
						 paneId:	prpPaneId,
						 ctrlD:		d,
						 title:		title } );
	}	//	onProperties()

	properties() {				//	menu item click
		let sW = 'UDUI properties()';
	//	if ( ! cmn.isFunction ( this.prpsFnc ) ) {
		let fnc = cmn.oneCallee ( sW, this.callees, 'properties' );
		if ( ! cmn.isFunction ( fnc ) ) {

			//	Which properties frame/pane?
			//	-	If this frame does not have properties pane then use
			//		the one in its own frame.
			//	-	If a dedicated pane-frame does noe exist then create
			//		it.
			prpClientAppFnc ( { do:		 'get-properties-pane',
								frameId: prpFrameId  } );

			return; }

	}	//	properties()

	updateUDUIRegistration ( newRegSpec ) {
		if ( this.bUDUIRegistered ) {
			prpClientAppFnc ( { do: 		'unregister',
								frameId:	prpFrameId,
								paneId:		prpPaneId,
								fnc:		this.doAll,
								paneKind:	'udui',
								regSpec: 	this.regSpec } ); 
			this.bUDUIRegistered = false; }
		
		this.regSpec = newRegSpec;
		
		prpClientAppFnc ( { do: 		'register',
							frameId:	prpFrameId,
							paneId:		prpPaneId,
							fnc:		this.doAll,
							paneKind:	'udui',
							regSpec: 	this.regSpec } ); 
		this.bUDUIRegistered = true;
	}	//	updateUDUIRegistration()

	paneUDUIRegistration() {
		const sW = 'UDUI paneUDUIRegistration()';
		let self = this;
		if ( ! cmn.isObject ( this.rpd ) ) {
			cmn.error ( sW, 'rpd is not set' ); 
			return; }

		function checkRegSpec ( rs ) {
			cmn.checkRegSpec ( rs, ['pe', 'vp', 'properties'], 
								   ['pe', 'properties'] );
		}	//	checkRegSpec()

		//	Dialog to edit long text.
		function onOK ( a ) {
			cmn.log ( sW, ' onOK()' );

			//	Set regSpec property.
			try {
				let regSpec = JSON.parse ( a.text ); 
				checkRegSpec ( regSpec );
				
				self.updateUDUIRegistration ( regSpec );
				
				prpClientAppFnc ( { do:			'set-state-changed',
									bSaveNow:	true } ); }
			catch ( err ) {
				cmn.error ( sW + ' onOK()', err ); }
		}	//	onOK()
	
		let title = 'Pane UDUI Registration Spec';
		let text  = JSON.stringify ( this.regSpec, null, '    ' );
		prpClientAppFnc( { do:		'long-text-dialog',
						   title:	title,
						   onOK:	onOK,
						   text:	text } );
	}	//	paneUDUIRegistration()


	updateRPDRegistration ( newRegSpec ) {
		if ( this.bRPDRegistered ) {
			prpClientAppFnc ( { do: 		'unregister',
								frameId:	prpFrameId,
								paneId:		prpPaneId,
								fnc:		this.doAll,
								paneKind:	'udui',
								regSpec: 	this.rpd.regSpec } ); 
			this.bRPDRegistered = false; }
		
		this.rpd.regSpec = newRegSpec;
		
		prpClientAppFnc ( { do: 		'register',
							frameId:	prpFrameId,
							paneId:		prpPaneId,
							fnc:		this.doAll,
							paneKind:	'udui',
							regSpec: 	this.rpd.regSpec } ); 
		this.bRPDRegistered = true;
	}	//	updateRPDRegistration()

	paneCodeRegistration() {
		const sW = 'UDUI paneCodeRegistration()';
		let self = this;
		if ( ! cmn.isObject ( this.rpd ) ) {
			cmn.error ( sW, 'rpd is not set' ); 
			return; }
		let code = self.getCode();
		//	Dialog to edit long text.
		function onOK ( a ) {
			cmn.log ( sW, ' onOK()' );

			//	Set regSpec property.
			try {
				let o = JSON.parse ( a.text );	//	just checking
				if ( code && cmn.isFunction ( code.checkRegSpec ) ) {
					code.checkRegSpec ( o ) }
				if ( ! code ) {
					self.updateRPDRegistration ( o ); }
				else {
					self.rpd.regSpec = o;
					if ( cmn.isFunction ( code.updateRegistration ) ) {
						code.updateRegistration ( self.rpd.regSpec ); }
					else {
						cmn.error ( sW, 'code has no updateRegistration()' ); } }
				prpClientAppFnc ( { do:			'set-state-changed',
									bSaveNow:	true } ); }
			catch ( err ) {
				cmn.error ( sW + ' onOK()', err ); }
		}	//	onOK()
	
		let title = 'Pane Code Registration Spec';
		if ( code  && cmn.isString ( this.rpd.codeName ) ) {
			title = this.rpd.codeName + ' ' + title; }
		else {
			title = 'Pane Registration Spec'; }
		let text = cmn.isString ( this.rpd.regSpec ) 
						? this.rpd.regSpec
						: JSON.stringify ( this.rpd.regSpec, null, '    ' );
		prpClientAppFnc( { do:		'long-text-dialog',
						   title:	title,
						   onOK:	onOK,
						   text:	text } );
	}	//	paneCodeRegistration()


	subMenu ( item ) {
		let sW = 'UDUI subMenu()';
		cmn.log ( sW, item.text );
		let mnu: any = [];
		mnu.push ( { type: 'item', 	text: 'Button' } );
		mnu.push ( { type: 'item',	text: 'Checkbox' } );
		mnu.push ( { type: 'item',	text: 'Input' } );
		mnu.push ( { type: 'item', 	text: 'Label' } );
		mnu.push ( { type: 'item',	text: 'List' } );
		mnu.push ( { type: 'item',  text: 'Graph' } );
		mnu.push ( { type: 'item',	text: 'Panel' } );
		mnu.push ( { type: 'item',  text: 'Table' } );
		mnu.push ( { type: 'item',  text: 'Tabs' } );
		mnu.push ( { type: 'item',  text: 'Text' } );
		mnu.push ( { type: 'item',	text: 'Tree' } );
		mnu.push ( { type: 'item',	text: 'Editor' } );
		mnu.push ( { type: 'item',	text: 'Canvas' } );
		return mnu;
	}	//	subMenu()

	get_fPD() {
		let n = this.focusedPanelDataStack.length;
		if ( n > 0 ) {
			return this.focusedPanelDataStack[n-1]; }
		return null;
	}	//	get_fPD()

	remove_fPD ( panelId ) {
		let i = this.focusedPanelDataStack.findIndex ( fPD => {
			return fPD.pd.id === panelId } );
		if ( i < 0 ) {
			return false; }
		this.focusedPanelDataStack.splice ( i );
		if ( i > 0 ) {
			this.focusedPanelDataStack[i - 1].focusedChildId = 0; }
		return true;
	}	//	remove_fPD()

	clickFocus ( o ) {
		//	If o is set then
		//		focus on a control because it was clicked on
		const sW = 'UDUI ' + prpPaneId + ' clickFocus()';
		cmn.log ( sW );
		let self = this;
		function pushPanels ( d ) {
			let ppd = d.panel ? d.panel.data 
							  : (d.parentPanel ? d.parentPanel.data : null);
			if ( ! ppd ) {
				return; }
			if ( ppd.id !== self.rpd.id ) {
				pushPanels ( ppd ); }
			self.focusedPanelDataStack.push ( { pd:				ppd,
												focusedChildId:	d.id } );
		}	//	pushPanels()

		//	If focus is set on something - 
		//		unfocus
		//		clear focusedPanelDataStack
		let fPD = this.get_fPD();
	//	if ( fPD && (fPD.focusedChildId > 0) ) {
	//		if ( 	cmn.isObject ( o.ctrlD )
	//			 && (fPD.focusedChildId === o.ctrlD.id) ) {	//	Already focused?
	//			return; }
	//	Instead of just returning when the control is already focused redraw 
	//	the indicator (to give the user some acknowledgement).
		while ( fPD && (fPD.focusedChildId > 0) ) {
			if ( 	cmn.isObject ( o.ctrlD )
				 && (fPD.focusedChildId === o.ctrlD.id) ) {	//	Already focused?
				//	Redraw the focus indicator.
				break; }
			let cd = fPD.pd.getControlById ( fPD.focusedChildId );
			if ( cd ) {
				cd.unfocus(); } 
			break; }
		this.focusedPanelDataStack = [];

	//	if ( !	(   cmn.isObject ( o.ctrlD )
	//			 && cmn.isString ( o.frameAs )) ) {
	//		return; }

	//	if ( cmn.isFunction ( o.ctrlD ) ) {
		let paneId = cmn.isNumber ( o.paneId ) ? o.paneId : prpPaneId;
		if ( cmn.isObject ( o.ctrlD ) ) {
			//	Focus on d -
			//		Push panel(s) on to focusedPanelDataStack
			//		Set focus on d
			//		Show properties (if a properties pane is active)
			let f       = prpClientAppFnc;
			let frame   = f ( { do:		 'get-frame',   
								frameId: prpFrameId } );
			let content = f ( { do:		 'get-content', 
								paneId:  paneId } );
			prpAppFrameFnc ( { do: 		'set-focused-frame-fnc',
							   frameAs:	o.frameAs,
							   focus:	{ frameFnc:	frame.frameFnc,
										  paneFnc:	content.paneFnc } } );
			pushPanels ( o.ctrlD );
			o.ctrlD.focus();
			this.onProperties ( o.ctrlD, true ); }	//	show properties
		else {
		//	prpAppContentFnc ( { do:		'set-pane-focus',
		//						 frameId:	prpFrameId,
		//						 paneId:	paneId } ); }
			prpClientAppFnc ( { do:			'set-pane-focus',
								frameId:	prpFrameId,
								paneId:		paneId } ); }
	}	//	clickFocus()

	edtFocusCallBack ( d, i, ele ) {
		const sW = 'UDUI edtFocusCallBack()';
		cmn.log ( sW, d.name );
		let fPD = this.get_fPD();
		if ( fPD ) {
			fPD.focusedChildId = d.id; }
	}	//	edtFocusCallBack()

	setupControl ( d ) {
		let sW = 'UDUI setupControl()';
		d.shiftClickCB = this.shiftClickCB;
		d.onProperties = this.onProperties;
		switch ( d.type ) {
			case uc.TYPE_PANEL: 
				d.clickCB	   = this.pnlCallback;
			//	d.shiftClickCB = uShiftClick.shiftClickControl;
			//	d.onProperties = this.onProperties;
				break;
			case uc.TYPE_BUTTON:
				d.cb = this.btnCallback; 
				break; 
			case uc.TYPE_CHECKBOX:
				d.cb = this.chkCallback; 
				break; 
			case uc.TYPE_INPUT:
				d.focusCB  = this.edtFocusCallBack;
				d.inputCB  = this.edtInputCallback;
				d.changeCB = this.edtChangeCallback;
			//	d.shiftClickCB = uShiftClick.shiftClickControl;
			//	d.onProperties = this.onProperties;
				break; 
			case uc.TYPE_LABEL:
			//	d.shiftClickCB = uShiftClick.shiftClickLabel;
			//	d.shiftClickCB = uShiftClick.shiftClickControl;
			//	d.onProperties = this.onProperties;
				d.cb = this.lblCallback;
				break;
			case uc.TYPE_LIST:
				d.cb = this.lstCallback;
				break;
			case uc.TYPE_TREE:
				d.cb			= this.treCallback;
				d.expandCB		= this.treItemExpandCallBack;
				d.collapseCB	= this.treItemCollapseCallback;
				break;
			case uc.TYPE_GRAPH:
				d.cb   = this.grfCallback;
			//	d.dsrc = new uDsrcGraphTypes();
				d.dsrc = new uDsrcGraph();
				break;
			case uc.TYPE_TEXTAREA:
				d.inputCB  = this.edtInputCallback;
				d.changeCB = this.edtChangeCallback;
			//	d.shiftClickCB = uShiftClick.shiftClickTextarea;
			//	d.onProperties = this.onProperties;
				break;
			case uc.TYPE_EDITOR:
				d.inputCB  = this.edtInputCallback;
				d.changeCB = this.edtChangeCallback;
				break;
			case uc.TYPE_TABLE:
				break;
			case uc.TYPE_TABS:
				d.cb = this.tbsCallback; 
				break;
			case uc.TYPE_CANVAS:
				break;
			default:
				cmn.error ( sW, ' Error: unrecognized control type '
							  + '(uc.TYPE_XXXXX ' + d.type + ')' );
		}
	}	//	setupControl()

	loadChildren ( sW, children, panel? ) {
		if ( ! panel ) {
			panel = this.rootPanel; }
		var o2 = uSL.getLoadSpec ( this.rpd,
								   { sW: 		sW, 
									 uduiId: 	this.rpd.uduiId, 
									 panelSvc: 	uPanel, 
									 dlg: 		null, 
									 board: 	null, 
									 storeId: 	0,			//	for now
									 storeName: '' } );		//	for now
		o2.setUpCB = this.setupControl;
		uSL.loadChildren ( children, o2, this.rpd, panel );
		this.rpd.afterLoad();
	}	//	loadChildren()

	keyDown ( o ) {
		let sW = 'UDUI keyDown()';
		if ( o.ev.altKey ) {
			sW += ' alt' }
		sW += ' ' + o.ev.key;
		if ( ! this.rpd ) {
			cmn.error ( sW, 'rpd is not set' );
			return false; }
	//	cmn.log ( sW );

		let code: any = this.getCode();

		if ( code && code.uduiFnc 
				  && cmn.isNumber ( code.paneId ) 
				  && (code.paneId !== prpPaneId) ) {
			code.uduiFnc ( o );
			return; }

		let self = this;

		let n = self.focusedPanelDataStack.length;
		if ( n === 0 ) {
			self.focusedPanelDataStack.push ( { pd:				self.rpd,
												focusedChildId:	0 } ); 
			n = 1; }
		let fPD = self.focusedPanelDataStack[n-1];
		
		let i, ctrls 		= {}, 
			   cData: any 	= null, 
			   cdd 			=   fPD.pd.childData.data;

		function focus ( cData ) {
			if ( ! cData ) {
				return; }
			let d = cData;
			if ( 	(d.type           === uc.TYPE_TABS)
				 &&	(d.tabs.iSelected >=  0           ) ) {
				//	Focus on the panel of the selected tab.
				d = d.tabs.data[d.tabs.iSelected].panel.data; }
			d.focus(); 
			self.onProperties ( d );		//	show properties
		}	//	focus()

		function unFocus ( a ) {
			let	d = ctrls[fPD.focusedChildId];
			if ( ! d ) {
				return false; }
			if ( 	(d.type           === uc.TYPE_TABS)
				 &&	(d.tabs.iSelected >=  0           ) ) {
				d = d.tabs.data[d.tabs.iSelected].panel.data; 
				d.unfocus(); 
				return false; }
			d.unfocus(); 
			if ( self.focusedWH ) {
				self.focusedWH = false;
				d.unfocusWH();
				if ( ! a.bAll ) {
					d.focus(); 
					return true; } } 
			return false;
		}	//	unFocus()

		function getCtrls() {
			for ( i = 0; i < cdd.length; i++ ) {//	ctrls[] set to those of
				ctrls[cdd[i].id] = cdd[i]; }	//	currently focused panel.
		}	//	getCtrls()

		getCtrls();
		
		//	Hot key? 
		cData =   fPD.pd.hotCtrlD ( o );	//	ctrl assoc with hot key
		if ( cData ) {
			unFocus ( { bAll: true } );
			cData.focus(); 
			this.onProperties ( cData ); 	//	show properties
			fPD.focusedChildId = cData.id; 
			return true; } 

		//	Focused control, if any.
		let focusedCtrlD: any = null;
		if ( fPD.focusedChildId ) {
			focusedCtrlD = ctrls[fPD.focusedChildId]; }

		//	Key handled by code?
		code = fPD.pd.code;
		if ( cmn.isObject ( code ) && cmn.isFunction ( code.keyDown ) ) {
			o.focusedCtrlD = focusedCtrlD;
			if (   fPD.pd.code.keyDown ( o ) ) {
				return true; } }
		else {
			//	Maybe code is that of another pane?
			let code = this.getCode();
			if ( code && cmn.isFunction ( code.keyDown ) ) {
				o.focusedCtrlD = focusedCtrlD;
				if ( code.keyDown ( o ) ) {
					return true; } } }

		//	alt -	i.e., alt <minus>
		//	To move focus out from inside a panel.
		while (     o.ev.altKey 
			 	&& (o.ev.key === '-') ) {
			let n = this.focusedPanelDataStack.length;
			if ( n <= 1 ) {
				break; }
			unFocus ( { bAll: true } );
			this.focusedPanelDataStack.pop();
			fPD = this.focusedPanelDataStack[n-2];
			cdd = fPD.pd.childData.data;
			getCtrls();
			cData = ctrls[fPD.focusedChildId];
			focus ( cData );
			break; }

		let keyUC = o.ev.key.toUpperCase();

		//	Cycle focus on a child?
		if ( o.ev.altKey && (keyUC === 'C') ) {
			if ( unFocus ( { bAll: false } ) ) {
				return; }

			//	alt shift c
			while ( o.ev.shiftKey && focusedCtrlD ) {
				//	Set focus to a control  * inside * a panel?
				if ( focusedCtrlD.type === uc.TYPE_TABS ) {
					let panel = focusedCtrlD.getSelectedTabPanel();
					if ( ! panel ) {
						cmn.error ( sW, 'tabs panel not selected' );
						return; }
					focusedCtrlD = panel.data; }
				if ( focusedCtrlD.type !== uc.TYPE_PANEL ) {
					break; }
				fPD = { pd:				focusedCtrlD,
						focusedChildId:	0			 };
				cdd = fPD.pd.childData.data;
				self.focusedPanelDataStack.push ( fPD );
				getCtrls();
				focusedCtrlD = null; 
				break; }

			let keys = Object.keys ( ctrls ).sort();

			if ( keys.length === 0 ) {
				return;	}

			if ( fPD.focusedChildId === 0 ) {
				fPD.focusedChildId = keys[0]; }
			else {
				i = keys.indexOf ( '' + fPD.focusedChildId );
				if ( i < 0 ) {
					i  = 0; }
				else {
					i += 1; }
				if ( i >= keys.length ) {
					i  = 0;	}
				fPD.focusedChildId = keys[i]; }

			if ( typeof fPD.focusedChildId === 'string' ) {
				fPD.focusedChildId = Number.parseInt ( fPD.focusedChildId ); }

			cData = ctrls[fPD.focusedChildId];
			focus ( cData );

			return;
		}	//	if ( alt-C )

		if ( fPD.focusedChildId === 0 ) {
			return; }

		cData = ctrls[fPD.focusedChildId];
		if ( ! cData ) {
			return; }

		if ( o.ev.altKey && (keyUC === 'W' ) ) {
			if ( this.focusedWH ) {
				this.focusedWH = false;
				cData.unfocusWH(); }
			else {
				this.focusedWH = true;
				cData.focusWH(); }
			return; }

		if ( o.ev.altKey && (o.ev.key === 'ArrowUp') ) {
			if ( this.focusedWH ) {
				cData.deltaXYWH ( { dx:  0, dy:  0, dw:  0, dh: -2 } ); }
			else {
				cData.deltaXYWH ( { dx:  0, dy: -2, dw:  0, dh:  0 } ); }
			o.ev.stopPropagation();
			return; }
		if ( o.ev.altKey && (o.ev.key === 'ArrowDown') ) {
			if ( this.focusedWH ) {
				cData.deltaXYWH ( { dx:  0, dy:  0, dw:  0, dh:  2 } ); }
			else {
				cData.deltaXYWH ( { dx:  0, dy:  2, dw:  0, dh:  0 } ); }
			o.ev.stopPropagation();
			return; }
		if ( o.ev.altKey && (o.ev.key === 'ArrowRight') ) {
			if ( this.focusedWH ) {
				cData.deltaXYWH ( { dx:  0, dy:  0, dw:  2, dh:  0 } ); }
			else {
				cData.deltaXYWH ( { dx:  2, dy:  0, dw:  0, dh:  0 } ); }
			o.ev.stopPropagation();
			return; }
		if ( o.ev.altKey && (o.ev.key === 'ArrowLeft') ) {
			if ( this.focusedWH ) {
				cData.deltaXYWH ( { dx:  0, dy:  0, dw: -2, dh:  0 } ); }
			else {
				cData.deltaXYWH ( { dx: -2, dy:  0, dw:  0, dh:  0 } ); }
			o.ev.stopPropagation();
			return; }
	}	//	keyDown()

	addControl ( o ) {
		const sW = 'UDUI addControl()';
		if ( typeof o.kind !== 'string' ) {
			cmn.log ( sW, ' error: kind is not a string' );
			return null; }
		let ctrlD: any = null;
		o.rpd 			= this.rpd;
		o.shiftClickCB	= this.shiftClickCB;
		o.onProperties	= this.onProperties;
		switch ( o.kind ) {
			case 'button':
				o.cb  = this.btnCallback;
				ctrlD = uButton.createButtonData ( o );
				break;
			case 'checkbox':
				o.cb  = this.chkCallback;
				ctrlD = uCheckbox.createCheckBoxData ( o );
				break;
			case 'graph':
				o.cb  = this.grfCallback;
				ctrlD = uGraph.createGraphData ( o );
				break;
			case 'input':
				o.focusCB   = this.edtFocusCallBack;
				o.inputCB 	= this.edtInputCallback;
				o.changeCB	= this.edtChangeCallback;
			//	o.shiftClickCB = uShiftClick.shiftClickControl;
			//	o.onProperties = this.onProperties;
				ctrlD = uInput.createInputData ( o );
				break;
			case 'label':
				if ( o.horz_align ) {
					o.horzAlign = o.horz_align; }
			//	o.shiftClickCB = uShiftClick.shiftClickLabel;
			//	o.onProperties = this.onProperties;
				o.cb  = this.lblCallback;
				ctrlD = uLabel.createLabelData ( o );
				break;
			case 'list':
				o.cb = this.lstCallback;
				ctrlD = uList.createListData ( o );
				break;
			case 'tree':
				o.cb			= this.treCallback;
				o.expandCB		= this.treItemExpandCallBack;
				o.collapseCB	= this.treItemCollapseCallback;
				ctrlD = uTree.createTreeData ( o );
				break;
			case 'panel':
				o.clickCB	= this.pnlCallback;
				o.bVertSB	= false;
				o.bHorzSB	= false;
			//	o.shiftClickCB = uShiftClick.shiftClickControl;
			//	o.onProperties = this.onProperties;
				o.hasConnectors = true;
				ctrlD = uPanel.createPanelData ( o );
				break;
			case 'table':
				o.cb		= null;		//	for now
				o.inputCB	= null;
				o.changeCB	= this.tblChangeCallback;
				ctrlD = uTable.createTableData ( o );
				break;
			case 'tabs':
				o.cb		= this.tbsCallback;
				o.panelSvc	= uPanel;
			//	o.shiftClickCB = uShiftClick.shiftClickControl;
			//	o.onProperties = this.onProperties;
				ctrlD = uTabs.createTabsData ( o );
				break;
			case 'text':
				o.value		= 'Wala! Textarea!';
				o.inputCB 	= this.edtInputCallback;
				o.changeCB	= this.edtChangeCallback;
			//	o.shiftClickCB = uShiftClick.shiftClickTextarea;
			//	o.onProperties = this.onProperties;
				ctrlD = uTextarea.createTextareaData ( o );
				break;
			case 'editor':
				o.inputCB 	= this.edtInputCallback;
				o.changeCB	= this.edtChangeCallback;
				ctrlD = uEditor.createEditorData ( o );
				break;
			case 'canvas':
				ctrlD = uCanvas.createCanvasData ( o );
				break;
			default:
				cmn.error ( sW, 'unrecognized kind "' 
							  + o.kind + '"' );
				return null;
		}
		
	//	this.rootPanel.addControl ( ctrlD );
		let panel = this.rootPanel;
		let fPD = this.get_fPD();
		if ( fPD && (fPD.focusedChildId > 0) ) {
		//	let cd = this.rpd.getControlById ( fPD.focusedChildId );
			let cd =   fPD.pd.getControlById ( fPD.focusedChildId );
			if ( 	(cd.type           === uc.TYPE_TABS)
				 &&	(cd.tabs.iSelected >=  0           ) ) {
				//	The panel of the selected tab.
				cd = cd.tabs.data[cd.tabs.iSelected].panel.data; }
				//	2022-Sep-24 	To get the new control to persist (save, 
				//	load).  I.e., cd.tabs.data does not seem to be the same as
				//	cd.childData.data
			//	cd = cd.childData.data[cd.tabs.iSelected].panel.data; }
			if ( cd && (cd.type === uc.TYPE_PANEL) ) {
				panel = cd.panel; } }
	
		//	To always place the control as ctrlD.x, y are initally set
		//	as if there is no panning.  That is to * appear *  as if placed 
		//	as ctrlD.x, y are initially set.
		//	The reason is that the panning could be great and the control 
		//	may not  * appear *  at all.
		let pd = panel.data;

		if ( cmn.isNumber ( pd.panX ) && cmn.isNumber ( pd.panY ) ) {
			ctrlD.x += pd.baseX0 - pd.panX;
			ctrlD.y += pd.baseY0 - pd.panY; }

		panel.addControl ( ctrlD ); 

		prpClientAppFnc ( { do: 'set-state-changed' } );

		return ctrlD;
	}	//	addControl()

	enable ( o ) {
		const sW = 'UDUI enable()';
		let ctrlD;
		ctrlD = this.rpd.getControl ( uc.TYPE_ANY, o['control-name'] );
		if ( ctrlD ) {
			ctrlD.enable ( o.enable ); 
			return { status: 'ok' }; }
		return { status: 'error', msg: 'control not found' };
	}	//	enable()

	setChecked ( o ) {
		const sW = 'UDUI setChecked()';
		let ctrlD;
		ctrlD = this.rpd.getControl ( uc.TYPE_CHECKBOX, o['control-name'] );
		if ( ctrlD ) {
			ctrlD.setChecked ( o.checked ); 
			return { status: 'ok' }; }
		return { status: 'error', msg: 'control not found' };
	}	//	setChecked()

	listClear ( o ) {
		const sW = 'UDUI listClear()';
		let ctrlName = o["control-name"];
		let ctrlD    = this.rpd.getControl ( uc.TYPE_LIST, ctrlName );
		if ( ! cmn.isObject ( ctrlD ) ) {
			//	Is it a tree control?
			ctrlD = this.rpd.getControl ( uc.TYPE_TREE, ctrlName );
			if ( ! cmn.isObject ( ctrlD ) ) {
				let msg = 'list or tree "' + ctrlName + '" not found';
				cmn.error ( sW + msg );
				return { status: 'error', msg: msg }; } }
		ctrlD.clear();
		return { status: 'ok' }; 
	}	//	listClear()
	
	listAddItem ( o ) {
		const sW = 'UDUI listAddItem()';
		let ctrlName = o["control-name"];
		let ctrlD    = this.rpd.getControl ( uc.TYPE_LIST, ctrlName );
		if ( ! cmn.isObject ( ctrlD ) ) {
			//	Is it a tree control?
			ctrlD = this.rpd.getControl ( uc.TYPE_TREE, ctrlName );
			if ( ! uc.isObject ( ctrlD ) ) {
				let msg = 'list or tree "' + ctrlName + '" not found';
				cmn.error ( sW + msg );
				return { status: 'error', msg: msg }; }
			let itemD = ctrlD.addItem ( { parentTextId:	0,
										  newTextId:	o['text-id'],
										  newText:		o['text'],
										  expandParent:	false } );
			ctrlD.update();
			return { status: 'ok', itemId: itemD.id }; }
		let itemD = uList.createListItemData ( o['text-id'], o['text'] );
		ctrlD.itemData.push ( itemD );
		ctrlD.update();
		return { status: 'ok', itemId: itemD.id };
	}	//	listAddItem()
	
	setText ( o ) {
		const sW = 'UDUI setText()';
		let ctrlD;
		ctrlD = this.rpd.getControl ( uc.TYPE_LABEL, o['control-name'] );
		if ( ctrlD ) {
			ctrlD.setText ( o.text ); 
			return { status: 'ok' }; }
		else {
			ctrlD = this.rpd.getControl ( uc.TYPE_INPUT, o['control-name'] );
			if ( ctrlD ) {
				ctrlD.setText ( o.text ); 
				return { status: 'ok' } } }
		return { status: 'error', msg: 'control not found' };
	}	//	setText()
	
	getText ( o ) {
		const sW = 'UDUI getText()';
		let ctrlD;
		ctrlD = this.rpd.getControl ( uc.TYPE_LABEL, o['control-name'] );
		if ( ctrlD ) {
			return { status: 'ok', text: ctrlD.text }; }
		else {
			ctrlD = this.rpd.getControl ( uc.TYPE_INPUT, o['control-name'] );
			if ( ctrlD ) {
				return { status: 'ok', text: ctrlD.value } } }
		return { status: 'error', msg: 'control not found' };
	}	//	getText()
	
	getSelected ( o ) {
		const sW = 'UDUI getSelected()';
		let ctrlName = o["control-name"];
		let ctrlD = this.rpd.getControl ( uc.TYPE_LIST, ctrlName );
		if ( ! cmn.isObject ( ctrlD ) ) {
			ctrlD = this.rpd.getControl ( uc.TYPE_TREE, ctrlName ); }
		if ( ctrlD ) {
			if ( ctrlD.itemSelected ) {
				return { status:	'ok',
						 itemId:	ctrlD.itemSelected.id,
						 itemName:	ctrlD.itemSelected.name,
						 textId:	ctrlD.itemSelected.textId,
						 text:		ctrlD.itemSelected.text }; }
			return { status: 'item not selected' }; }
		return { status: 'error', msg: 'control not found' };
	}	//	getSelected()

	prepCanvasOp ( o ) {
		let p: { cvsD: any; result: any } = { cvsD:		null,
				  							  result:	null };

		let pnlName = o["panel"];
		if ( ! cmn.isString ( pnlName ) ) {
			p.result = { status: 'error', msg: 'expected panel name' }; 
			return p; }
		let pnlD = this.rpd.name === pnlName
					? this.rpd
					: this.rpd.getControl ( uc.TYPE_PANEL, pnlName );
		if ( ! pnlD ) {
			p.result = { status: 'error', msg: 'panel not found' }; 
			return p; }
		let cvsName = o["canvas"];
		if ( ! cmn.isString ( cvsName ) ) {
			p.result = { status: 'error', msg: 'expected canvas name' }; 
			return p; }
		let cvsD = pnlD.getControl ( uc.TYPE_CANVAS, cvsName );
		if ( ! cvsD ) {
			p.result = { status: 'error', msg: 'canvas not found' }; 
			return p; }

		p.cvsD   = cvsD;
		p.result = 	{ cmd:		o["cmd"],
					  status:	'ok', 
					  'context-object':	o['context-object'],
					  'result':	'success' };
		return p;
	}	//	prepCanvasOp()
	
	getCanvasContext ( o ) {
		const sW = 'UDUI getCanvasContext()';
		let p = this.prepCanvasOp ( o );
		if ( p.result.status !== 'ok' ) {
			return p.result; }	

		p.result["context-handle"] = p.cvsD.getContext();		
		return p.result;
	}	//	getCanvasContext()

	canvasSetFillstyle ( o ) {
		const sW = 'UDUI canvasSetFillstyle()';
		let p = this.prepCanvasOp ( o );
		if ( p.result.status !== 'ok' ) {
			return p.result; }	

		let hContext  = o["context-handle"];
		let fillstyle = o["fillstyle"];
		p.cvsD.setFillstyle ( hContext, fillstyle );		
		return p.result;
	}	//	canvasSetFillstyle()

	canvasFillRect ( o ) {
		const sW = 'UDUI canvasFillRect()';
		let p = this.prepCanvasOp ( o );
		if ( p.result.status !== 'ok' ) {
			return p.result; }	

		let hContext  = o["context-handle"];
		p.cvsD.fillRect ( hContext, o.x, o.y, o.w, o.h );		
		return p.result;
	}	//	canvasFillRect()

	canvasSize ( o ) {
		const sW = 'UDUI canvasSize()';
		let p = this.prepCanvasOp ( o );
		if ( p.result.status !== 'ok' ) {
			return p.result; }	

		let hContext  = o["context-handle"];
		p.cvsD.size ( hContext, o.w, o.h );		
		return p.result;
	}	//	canvasSize()

	canvasEnlarge ( o ) {
		const sW = 'UDUI canvasEnlarge()';
		let p = this.prepCanvasOp ( o );
		if ( p.result.status !== 'ok' ) {
			return p.result; }	

		let hContext  = o["context-handle"];
		p.cvsD.enlarge ( hContext, o['pixel-size'] );		
		return p.result;
	}	//	canvasEnlarge()

	canvasTranslate ( o ) {
		const sW = 'UDUI canvasTranslate()';
		let p = this.prepCanvasOp ( o );
		if ( p.result.status !== 'ok' ) {
			return p.result; }	

		let hContext  = o["context-handle"];
		p.cvsD.translate ( hContext, o.x, o.y );
		return p.result;
	}	//	canvasTranslate()

	canvasRotate ( o ) {
		const sW = 'UDUI canvasRotate()';
		let p = this.prepCanvasOp ( o );
		if ( p.result.status !== 'ok' ) {
			return p.result; }	

		let hContext  = o["context-handle"];
		p.cvsD.rotate ( hContext, o.a );
		return p.result;
	}	//	canvasRotate()

	canvasGetImageData ( o ) {
		const sW = 'UDUI canvasGetImageData()';
		let p = this.prepCanvasOp ( o );
		if ( p.result.status !== 'ok' ) {
			return p.result; }	

		let hContext  = o["context-handle"];
		let bp: BytePixels = p.cvsD.getImageData ( hContext, o.x, o.y, 
															 o.w, o.h );
		//	https://developer.mozilla.org/en-US/docs/Glossary/Base64
		let s3 = btoa ( String.fromCodePoint ( ...bp.b ) )
		p.result.result = s3;
		return p.result;
	}	//	canvasGetImageData()

	canvasEdge ( o ) {
		const sW = 'UDUI canvasEdge()';
		let p = this.prepCanvasOp ( o );
		if ( p.result.status !== 'ok' ) {
			return p.result; }	

		let hContext  = o["context-handle"];
		p.cvsD.edge ( hContext );
		return p.result;
	}	//	canvasEdge()

	doScript ( script ) {
		const sW = 'UDUI doScript()';
		let results: any [] = [];
		if ( ! Array.isArray ( script ) ) {
			cmn.error ( sW, 'script is not an array' );
			return results; }
		let i;
		for ( i = 0; i < script.length; i++ ) {
			let cmdResult: any = this.doScriptCmd ( script[i] );
			results.push ( cmdResult );
		}	//	for 
		return results;
	}	//	doScript()

	doScriptCmd ( cmd ) {
		const sW = 'UDUI doScriptCmd()';
		let ai = cmd;
		let cmdResult: any = null;
		if ( typeof ai.cmd !== 'string' ) {
			cmdResult = { status: 'error', msg: 'cmd is not a string' };
			return cmdResult; }
		switch ( ai.cmd ) {
			case 'add-control':
				let ctrlD = this.addControl ( ai );
				if ( ctrlD ) {
					return { ctrlId: ctrlD.id } }
				cmdResult = { status: 'error', msg: 'failed to add control' };
				break;
			case 'enable':
				cmdResult = this.enable ( ai );
				break;
			case 'set-checked':
				cmdResult = this.setChecked ( ai );
				break;
			case 'list-clear':
			case 'tree-clear':
				cmdResult = this.listClear ( ai );
				break;
			case 'list-add-item':
			case 'tree-add-item':
				cmdResult = this.listAddItem ( ai );
				break;
			case 'clear':
				uPanel.clear ( this.rootPanel );
				cmdResult = { status: 'ok' };
				break;
			case 'set-text':
				cmdResult = this.setText ( ai );
				break;
			case 'get-text':
				cmdResult = this.getText ( ai );
				break;
			case 'get-selected':
				cmdResult = this.getSelected ( ai );
				break;
			case 'get-canvas-context':
				cmdResult = this.getCanvasContext ( ai );
				break;
			case 'canvas-set-fillstyle':
				cmdResult = this.canvasSetFillstyle ( ai );
				break;
			case 'canvas-fill-rect':
				cmdResult = this.canvasFillRect ( ai );
				break;
			case 'canvas-size':
				cmdResult = this.canvasSize ( ai );
				break;
			case 'canvas-enlarge':
				cmdResult = this.canvasEnlarge ( ai );
				break;
			case 'canvas-translate':
				cmdResult = this.canvasTranslate ( ai );
				break;
			case 'canvas-rotate':
				cmdResult = this.canvasRotate ( ai );
				break;
			case 'canvas-get-image-data':
				cmdResult = this.canvasGetImageData ( ai );
				break;
			case 'canvas-edge':
				cmdResult = this.canvasEdge ( ai );
				break;
			default:
				let msg = 'unrecognized cmd "' + ai.cmd + '"';
				cmn.error ( sW, msg );
				cmdResult = { status: 'error', msg: msg };
		}	//	switch
		cmdResult.cmd = ai.cmd;
		return cmdResult;
	}	//	doScriptCmd()

	showJointValues ( o ) {
		const sW = 'showJointValues()';
		cmn.log ( sW );
		if ( ! this.rpd ) {
			cmn.error ( sW, 'no rpd' );
			return; }
		for ( let j = 0; j < o.values.length; j++ ) {
			let name = 'edtJ' + (j + 1);
			let jd = this.rpd.getControl ( uc.TYPE_INPUT, name );
			if ( ! jd ) {
				cmn.error ( sW, 'control "' + name + '" not found' );
				continue; }
			jd.setNumber ( o.values[j] ); }
	}	//	showJointValues();
		
	jsonizeRPD ( sW ) {
		return JSON.parse ( uSL.jsonizePanel ( sW, 
											   this.rpd.uduiId, 
											   this.rpd ) );
	}	//	jsonizeRPD()

	save() {
		const sW = 'UDUI save()';
		let self = this;
		function getData() {
			
			//	Some how save UDUI regSpec here too?

			//	How to save the pane name with the UDUI?
			//	-	Should it be panel name instead?
			//	-	In the ui() call its 'pane'.
			//		-	 Maybe 'frame' and 'panel' should be added/optional?
			//	-	Pane name seems necessary for "routing" the ui call. See
			//		pe3.ts uiScript().

			return self.jsonizeRPD ( sW );		//	a string
		}	//	getData()
		prpClientAppFnc ( { do:			'save-record-dialog',
							title:		'Save UDUI',
							recordType:	'udui',
							afterCB:	getData } );
	}	//	save();

	load() {
		const sW = 'UDUI load()';
		let self = this;
		function setData ( data: any ) {
			let sRS: null | string = null;
			self.rpd.panningEnabled = cmn.isBoolean ( data.panningEnabled )
										? data.panningEnabled : false;
			self.rpd.minWidth  = cmn.isNumber ( data.minWidth )
										? data.minWidth  : 0;
			self.rpd.minHeight = cmn.isNumber ( data.minHeight )
										? data.minHeight : 0;
			sRS = data.regSpec;
			let code = self.instantiateCode ( data.codeName, self.state );
			self.loadChildren ( sW, data.childData.data );
			if ( code && ! code.isLoaded ) {
				if ( typeof sRS === 'string' ) {
					self.rpd.regSpec = JSON.parse ( sRS ); }
				else {
					self.rpd.regSpec = sRS; }
				code.loaded();
				if ( cmn.isFunction ( code.gotProperties ) ) {
					let fnc = cmn.oneCallee ( sW, self.callees, 
												  'properties' );
					code.gotProperties ( cmn.isFunction ( fnc ) ); } 
				code.isLoaded = true; 
				self.insertNameInTopEleIds ( data.codeName ); 
			//	if ( cmn.isFunction ( code.updateRegistration ) ) {
			//		code.updateRegistration ( self.rpd.regSpec ); }
			//	else {
			//		cmn.error ( sW, 'code has no updateRegistration()' ); } 
			//	Taken care of by code.loaded(), just above.
			}
			if ( (! code) && (typeof sRS === 'string') 
						  && (sRS.length > 0)  ) {
				//	Register rpd.regSpec.
				try {
					let o = JSON.parse ( sRS );	
					self.updateRPDRegistration ( o ); }
				catch ( e ) {
					throw { message: 'failed to parse reg spec' }; }
			}
			self.setRootPanelWH();
		}	//	setData()
		
		prpClientAppFnc ( { do:			'load-record-dialog',
							title:		'Load UDUI',
							recordType:	'udui',
							afterCB:	setData } );
	}	//	load();

	insertNameInTopEleIds ( name : string ) {
		const sW = 'UDUI insertNameInTopEleIds()';
		cmn.log ( sW, 'incorporating into top udui ele ids: "' + name + '"' );
		//	Fix ele ids of elements with ids, for example, -
		//		rr-udui-root-panel-7<-remainder-if-any>
		//	to be -
		//		rr-udui-root-panel-7-<name><-remainder-if-any>
		//	cp:	ClipPath
		let svg = document.getElementById ( this.svg.eleId );
		if ( ! svg ) {
			cmn.error ( sW, 'svg not found' );
			return; }
		let topG = svg.getElementsByTagName ( 'g' )[0];
		if ( ! topG ) {
			cmn.error ( sW, 'top g not found' );
			return; }
		if ( ! topG.id.startsWith ( 'rr-udui-root-panel-' ) ) {
			cmn.error ( sW, 'unexpected prefix' );
			return; }
		let idPfx = topG.id;
		let cp_base = document.getElementById ( 'cp-' + idPfx + '-base' );
		if ( ! cp_base ) {
			cmn.error ( sW, 'cp base not found' );
			return; }
		let cp_base_rect = document.getElementById ( 'cp-' + idPfx 
														   + '-base-rect' );
		if ( ! cp_base_rect ) {
			cmn.error ( sW, 'cp base-rect not found' );
			return; }
		let base = topG.getElementsByTagName ( 'g' )[0];
		if ( (! base) || (base.id !== idPfx + '-base') ) {
			cmn.error ( sW, 'base not found' );
			return; }
		let rect = base.getElementsByTagName ( 'rect' )[0];
		if ( (! rect) || (rect.id !== idPfx + '-base-rect') ) {
			cmn.error ( sW, 'rect not found' );
			return; }
		topG.id = idPfx + '-' + name;
		cp_base.id = 'cp-' + idPfx + name + '-base';
		cp_base_rect.id = 'cp-' + idPfx + name + '-base-rect';
		base.id = idPfx + '-' + name + '-base';
		rect.id = idPfx + '-' + name + '-base-rect';
		(<any>topG).__data__.eleId = topG.id;
		base.setAttribute ( 'clip-path', 'url(#cp-' + base.id );
	}	//	insertNameInTopEleIds()

	instantiateCode ( codeName, state ) { 
		const sW = 'UDUI instantiateCode()'
		let code: any = null;
		if ( (! uc.isString ( codeName )) || (codeName.length === 0) ) {
			return null; }
		if ( this.rpd.code ) {
			return this.rpd.code; }
			
		code = prpClientAppFnc ( { do: 			'instantiate-code',
								   codeName:	codeName,
								   state:		state,
								   frameId:		prpFrameId,
								   uduiFnc:		this.doAll,
								   rpd: 		this.rpd,
								   title:		title } );
		if ( code && code.code ) {
			this.rpd.codeName = codeName;
			this.rpd.code = code.code; }	
		if ( code && code.title ) {
			this.setTitle ( { name: code.title } );	}
			
		return code && code.code ? code.code : null;

	}	//	instantiateCode()

	doSetState ( state ) {
		const sW = 'UDUI doSetState()';
		prpClientAppFnc( { do: 'check-content', sW: sW  + ' top' } );

		this.rpd.panningEnabled = cmn.isBoolean ( state.panningEnabled )
										? state.panningEnabled
										: false;

		if ( cmn.isObject ( state.uduiRegSpec ) ) {
			this.updateUDUIRegistration ( state.uduiRegSpec ); }

		let code = this.getCode ( state.codeName );
		if ( (! code) && cmn.isString ( state.codeName)
					  && (state.codeName.length > 0) ) {
			code = this.instantiateCode ( state.codeName, state ); }

		if ( code && ! cmn.isFunction ( code.updateRegistration ) ) {
			cmn.error ( sW, 'code has no updateRegistration()' ); 
			return; }	

		if ( 	cmn.isString ( state.regSpec ) 
			 && (state.regSpec.length > 0) 
			 && ! code ) {
			try {
				let rs = JSON.parse ( state.regSpec );
				if ( ! code ) {
					this.updateRPDRegistration ( rs ); }
			//	else {
			//		code.updateRegistration ( rs ); }
			//	Should not the code have its own regSpec?
				this.rpd.regSpec = rs; } 
			catch ( e ) {
				cmn.error ( sW, 'failed to parse rpd regSpec' ); 
				this.rpd.regSpec = null; }
		}
		else
		if ( cmn.isObject ( state.regSpec ) ) {
			if ( ! code ) {
				this.updateRPDRegistration ( state.regSpec ); }
		//	else {
		//		code.updateRegistration ( state.regSpec ); }
		//	Should not the code have its own regSpec?
			this.rpd.regSpec = state.regSpec;
		}
		else 
		if ( cmn.isString ( state.codeRegSpec ) ) {
			try {
				let rs = JSON.parse ( state.codeRegSpec ); 
				if ( ! code ) {
					this.updateRPDRegistration ( rs ); }
			//	else {
			//		code.updateRegistration ( rs ); }
			//	code will set/update registration when it is loaded
				this.rpd.regSpec = rs; }
			catch ( e ) {
				cmn.error ( sW, 'failed to parse rpd regSpec' ); 
				this.rpd.regSpec = null; }
		}
		else
		if ( cmn.isObject ( state.codeRegSpec ) ) {
			if ( ! code ) {
				this.updateRPDRegistration ( state.codeRegSpec ); }
		//	else {
		//		code.updateRegistration ( state.codeRegSpec ); }
		//	code will set/update registration when it is loaded
			this.rpd.regSpec = state.codeRegSpec; 
		}
		else {
			this.rpd.regSpec = null; }

		if ( 	(! cmn.isString ( state.codeName )) 
			 || (state.codeName.length === 0)       ) {
			this.loadChildren ( sW, state.controls ); }
	
		if ( code && ! code.isLoaded ) {
			this.loadChildren ( sW, state.controls ); 
			code.loaded();
			if ( cmn.isFunction ( code.gotProperties ) ) {
				let fnc = cmn.oneCallee ( sW, this.callees, 
											  'properties', false );
				code.gotProperties ( cmn.isFunction ( fnc ) ); } 
			code.isLoaded = true; 
			this.insertNameInTopEleIds ( state.codeName ); }
		this.rpd.minWidth  = cmn.isNumber ( state.minWidth )
									? state.minWidth  : 0;
		this.rpd.minHeight = cmn.isNumber ( state.minHeight )
									? state.minHeight : 0;
		this.setRootPanelWH();
		
		if ( cmn.isString ( state.rootPanelName ) ) {
			this.rpd.name = state.rootPanelName; }
	}	//	doSetState()

	getControl ( o ) {
		return this.rpd.getControl ( o.type, o.name );
	}	//	getControl()

	disallowPaneEdits ( o ) {
		const sW = 'UDUI disallowPaneEdits() ' + this.rpd.codeName;
	//	cmn.log ( sW );
		//	Disallow control changes (flyover indicators, moves, adds, 
		//	deletes, etc.)
		this.rpd.disallowEdits();
	}	//	disallowPaneEdits()

	gotProperties ( bGot ) {
		if ( this.willUnmount ) {
			return; }
		let code = this.getCode();
		if ( code && cmn.isFunction ( code.gotProperties ) ) {
			code.gotProperties ( bGot ); }	
	}	//	gotProperties()

	getInfo() {
		let sW = 'UDUI ' + prpPaneId + ' getInfo()';
		cmn.log ( sW );
		return { type:		'UDUI',
				 frameId:	prpFrameId,
				 paneId:	prpPaneId,
				 title:		title,
				 fnc:		this.doAll,
				 codeName:	this.rpd.codeName,
				 code:		this.getCode() };
	}	//	getInfo()


	doAll ( o ) {
		let sW = 'UDUI doAll() ' + o.do;
	//	cmn.log ( sW );
		if ( o.do === 'identify' ) {
			return { name:		'UDUI',
					 fnc:		this.doAll,
					 uduiInfo:	this.getInfo() }; }
		if ( o.do === 'set-state-changed' ) {
			prpClientAppFnc ( o );
			return; }
		if ( o.do === 'set-registered-callee' ) {
			if ( ! cmn.isObject ( this.regSpec ) ) {
				cmn.error ( sW, 'this.regSpec is not set' );
				return; }
			cmn.log ( sW, '  this pane: ' + this.regSpec.pane 
						+ '    it kind: ' + o.paneKind + '  it pane: ' + o.pane );
			let fnc = cmn.setRegisteredCallee ( sW, this.regSpec, 
													this.callees, o );
			if ( ! cmn.isFunction ( fnc ) ) {
				return; };
		//	if ( o.pane === this.regSpec.sndTo['vp'].pane ) {
		//		if ( this.notifyGotVPFnc ) {
		//			this.notifyGotVPFnc ( fnc ); } }
			if ( o.pane === this.regSpec.sndTo['properties'].pane ) {
				if ( this.prpsCtrlD ) {
					fnc ( { do: 		'properties-of-control',
							frameId:	prpFrameId,
							paneId:		prpPaneId,
							ctrlD:		this.prpsCtrlD,
							title:		'Edit' } );	}
				this.gotProperties ( true ); }

			return;
		}
		if ( o.do === 'unset-registered-callee' ) {
			if ( ! cmn.isObject ( this.regSpec ) ) {
				cmn.error ( sW, 'this.regSpec is not set' );
				return; }
		//	if ( o.pane === this.regSpec.sndTo['pe'].pane ) {
		//		this.peFnc = null;
		//		return; }
		//	if ( o.pane === this.regSpec.sndTo['vp'].pane ) {
		//		this.vpFnc = null;
		//		return; }
		//	if ( o.pane === this.regSpec.sndTo['properties'].pane ) {
		//		this.prpsFnc = null;
		//		return; }
			cmn.log ( sW, '  this pane: ' + this.regSpec.pane 
						+ '    it kind: ' + o.paneKind + '  it pane: ' + o.pane );
			cmn.unsetRegisteredCallee ( sW, this.regSpec, 
											this.callees, o );
			return;
		}
		if ( 	(o.do === 'get-state'  )
			 || (o.do === 'get-state-2') ) {
			let pd = this.jsonizeRPD ( sW );
			return { 
				state: 			null,
				rootPanelName:	pd.name,
				controls:		pd.childData.data,
				style:			this.state.style,
				title:			title,
				titleStyle:		this.state.titleStyle,
				codeName:		this.rpd.codeName,
				panningEnabled:	this.rpd.panningEnabled,
				uduiRegSpec:	this.regSpec,
				codeRegSpec:	this.rpd.regSpec,
				minWidth:		this.rpd.minWidth,
				minHeight:		this.rpd.minHeight
			};
		}
		if ( 	(o.do === 'set-state'  )
			 || (o.do === 'set-state-2') ) {
			if ( this.stateSet ) {
				cmn.error ( sW, 'stateSet' );
				return; }
			if ( this.rpd ) {
				this.doSetState ( o.state ); 
				this.stateSet = true; }
			else {
				this.oState = o.state; }
		//	this.setState ( { style:		o.state.style,
		//					  title:		o.state.title,
		//					  titleStyle:	o.state.titleStyle } ); 
		//	if ( cmn.isObject ( o.state.style ) ) {
		//		this.setState ( { style:		o.state.style,
		//						  title:		o.state.title,
		//						  titleStyle:	o.state.titleStyle } ); }
		//	else {
		//		this.setState ( { title:		o.state.title,
		//						  titleStyle:	o.state.titleStyle } ); }
			if ( o.state.titleStyle.display === 'none' ) {
			//	this.setState ( { style:		{ gridTemplateRows:	'auto' },
			//					  title:		o.state.title,
			//					  titleStyle:	o.state.titleStyle } ); }
				this.state.style = { 'grid-template-rows': 'auto' };
				styleString = cmn.stringifyStyle ( this.state.style );
						    title = o.state.title;
				this.state.titleStyle = o.state.titleStyle;
				titleStyleString = 
								cmn.stringifyStyle ( this.state.titleStyle ); }

			else {
				let template = this.titleH + 'px auto';
			//	this.setState ( { style:		{ gridTemplateRows:	template },
			//					  title:		o.state.title,
			//					  titleStyle:	o.state.titleStyle } ); }
				this.state.style = { 'grid-template-rows': template };
				styleString = cmn.stringifyStyle ( this.state.style );
						   title = o.state.title;
				this.state.titleStyle = o.state.titleStyle;
				titleStyleString = 
								cmn.stringifyStyle ( this.state.titleStyle ); }
			return;
		}
		if ( (o.do === 'size') || (o.do === 'splitter-dragged') ) {
		//	let w = o.paneW;
		//	let h = o.paneH;
		//	cmn.log ( 'UDUI do size  h: ' + h );
		//	this.setRootPanelWH();
			//	To size SVG elements inside this. But this may not have
			//	fully sized. So, hack, and give this time to size. IOW, I
			//	think, set the SVG element's size in the next JS event
			//	cycle (after this has sized).
		//	window.setTimeout ( this.setRootPanelWH, 0 );
			tick().then ( () => {
				this.setRootPanelWH();
			} );
			return; }
		if ( o.do === 'load-children' ) {
			return this.loadChildren ( sW, o.controls, o.panel );
		}
		if ( o.do === 'append-menu-items' ) {
			let a = o.menuItems;
			let bShowTitle =     this.state.titleStyle 
							 && (this.state.titleStyle.display === 'none');
			a.push ( { type: 		'item', 		
					   text: 		'Title ...' } );
			a.push ( { type: 		'item', 		
					   text: 		bShowTitle ? 'Show Title' 
											   : 'Hide Title' } );
			a.push ( { type: 		'separator',	
					   text: 		'' } );
			a.push ( { type: 		'item',		
					   text: 		'Properties ...',
					   fnc: 		this.properties })
			a.push ( { type: 		'item',		
					   text: 		'Pane UDUI Registration ...',
					   fnc: 		this.paneUDUIRegistration })
			a.push ( { type: 		'item',		
					   text: 		'Pane Code Registration ...',
					   fnc: 		this.paneCodeRegistration,
					   disabled:	this.getCode() ? false : true } );
			a.push ( { type: 		'item',		
					   text: 		'Add Control >',
					   bSubmenu:	true,
					   fnc: 		this.subMenu })
			a.push ( { type:		'item',
					   text:		'Save ...' } );
			a.push ( { type:		'item',
					   text:		'Load ...' } );
			a.push ( { type: 		'item',
					   text: 		'Clear' } );
		
			let fPD = this.get_fPD();
			if ( fPD && (fPD.focusedChildId > 0) ) {
				a.push ( { type: 		'separator',	
						   text: 		'' } );
				a.push ( { type: 		'item',	
						   text: 		'Delete Control' } ); }
			return;
		}
		if ( o.do === 'menu-item' ) {
			//	Return true if the menu item is handled here.
			if ( o.menuItemText === 'Title ...' ) {
				this.changeTitle ( o );
				return true;
			}
			if ( o.menuItemText === 'Show Title' ) {
				let template = this.titleH + 'px auto';
			//	this.setState ( { style: { gridTemplateRows: template },
			//					  titleStyle: { display: 'block' } }, () => {
				this.state.style = { 'grid-template-rows': template };
				styleString = cmn.stringifyStyle ( this.state.style );
				this.state.titleStyle = { display: 'block' };
				titleStyleString = 
								cmn.stringifyStyle ( this.state.titleStyle ); 
				tick().then ( () => {
					this.setRootPanelWH(); } );
				return true;
			}
			if ( o.menuItemText === 'Hide Title' ) {
			//	this.setState ( { style: { gridTemplateRows: 'auto' },
			//					  titleStyle: { display: 'none' } }, () => {
				this.state.style = { 'grid-template-rows': 'auto' };
				styleString = cmn.stringifyStyle ( this.state.style );
				this.state.titleStyle = { display: 'none' };
				titleStyleString = 
								cmn.stringifyStyle ( this.state.titleStyle ); 
				tick().then ( () => {
					this.setRootPanelWH(); } );
				return true;
			}
			if ( o.menuItemText === 'Button' ) {
				let btnD = this.addControl ( {
					kind:  'button',	x: 5,  y: 5,  w: 70,  h: 24,
					name:  'btnName', 
					text:  'button'
				} );
				if ( btnD ) {
					this.onProperties ( btnD ); }
				return true; }
			if ( o.menuItemText === 'Checkbox' ) {
				let chkD = this.addControl ( {
					kind:  'checkbox',	x: 5,  y: 5,  w: 70,  h: 24,
					name:  'chkName', 
					text:  'checkbox'
				} );
				if ( chkD ) {
					this.onProperties ( chkD ); }
				return true; }
			if ( o.menuItemText === 'Input' ) {
				let edtD = this.addControl ( {
					kind:  'input',		x: 5,  y: 5,  w: 70,  h: 24,
					name:  'edtName',
					value: '' 
				} );
				if ( edtD ) {
					this.onProperties ( edtD ); }
				return true; }
			if ( o.menuItemText === 'Label' ) {
				let lblD = this.addControl ( {
					kind:  'label',		x: 5,  y: 5,  w: 70,  h: 20,
					name:  'lblName',
					text:  'label'
				} );
				if ( lblD ) {
					this.onProperties ( lblD ); }
				return true; }
			if ( o.menuItemText === 'List' ) {
				let lstD = this.addControl ( {
					kind:  'list',		x: 5,  y: 5,  w: 70,  h: 70,
					name:  'lstName',
				} );
			//	list.data.itemData.push ( uList.createListItemData ( 'bug-howard', 'Bug Howard' ) );
			//	list.data.itemData.push ( uList.createListItemData ( 'les-miles', 'Les Miles' ) );
			//	list.data.itemData.push ( uList.createListItemData ( 'ralph', 'Ralph' ) );
			//	list.data.itemData.push ( uList.createListItemData ( 'waldo', 'Waldo' ) );
			//	list.data.itemData.push ( uList.createListItemData ( 'emerson', 'Emerson' ) );
			//	list.data.itemData.push ( uList.createListItemData ( 'grace', 'Grace' ) );
			//	list.data.itemData.push ( uList.createListItemData ( 'hopper', 'Hopper' ) );
			//	list.data.itemData.push ( uList.createListItemData ( 'brad-dunagan', 'Brad Dunagan' ) );
			//	list.data.itemData.push ( uList.createListItemData ( 'linus', 'Linus' ) );
			//	list.data.itemData.push ( uList.createListItemData ( 'elija', 'Elija' ) );
			//	list.data.itemData.push ( uList.createListItemData ( 'bart', 'Bart' ) );
			//	list.data.itemData.push ( uList.createListItemData ( 'rosco', 'Rosco' ) );
			//	list.data.itemData.push ( uList.createListItemData ( 'jake', 'Jake' ) );
			//	list.update();
				if ( lstD ) {
					this.onProperties ( lstD ); }
				return true; }
			if ( o.menuItemText === 'Tree' ) {
				let treD = this.addControl ( {
					kind:  'tree',		x: 5,  y: 5,  w: 70,  h: 70,
					name:  'treName',
				} );
				if ( treD ) {
					this.onProperties ( treD ); }
				return true; }
			if ( o.menuItemText === 'Graph' ) {
				let grfD = this.addControl ( {
					kind:	'graph',	x: 5,  y: 5,  w: 70,  h: 70,
					name:	'grfName',
				//	dsrc:	new uDsrcGraphTypes()
					dsrc:	new uDsrcGraph()
				} );
				if ( grfD ) {
					this.onProperties ( grfD ); }
				return true; }
			if ( o.menuItemText === 'Panel' ) {
				let pnlD = this.addControl ( {
					kind:  'panel',		x: 5,  y: 5,  w: 70,  h: 70,
					name:  'pnlName',
				} );
				if ( pnlD ) {
					this.onProperties ( pnlD ); }
				return true; }
			if ( o.menuItemText === 'Table' ) {
				let tblD = this.addControl ( {
					kind:  'table',		x: 5,  y: 5,  w: 70,  h: 70,
					name:  'tblName',
				} );
				if ( tblD ) {
					this.onProperties ( tblD ); }
				return true; }
			if ( o.menuItemText === 'Tabs' ) {
				let txtD = this.addControl ( {
					kind:  'tabs',		x: 5,  y: 5,  w: 70,  h: 70,
					name:  'tbsName',
				} );
				if ( txtD ) {
					this.onProperties ( txtD ); }
				return true; }
			if ( o.menuItemText === 'Text' ) {
				let txtD = this.addControl ( {
					kind:  'text',		x: 5,  y: 5,  w: 70,  h: 70,
					name:  'txtName',
				} );
				if ( txtD ) {
					this.onProperties ( txtD ); }
				return true; }
			if ( o.menuItemText === 'Editor' ) {
				let edtD = this.addControl ( {
					kind:  'editor',	x: 5,  y: 5,  w: 70,  h: 70,
					name:  'edtName',
				} );
				if ( edtD ) {
					this.onProperties ( edtD ); }
				return true; }
			if ( o.menuItemText === 'Canvas' ) {
				let cvsD = this.addControl ( {
					kind:  'canvas',	x: 5,  y: 5,  w: 70,  h: 70,
					name:  'cvsName',
				} );
				if ( cvsD ) {
					this.onProperties ( cvsD ); }
				return true; }
			if ( o.menuItemText === 'Save ...' ) {
				this.save();
				return true; }
			if ( o.menuItemText === 'Load ...' ) {
				this.load();
				return true; }
			if ( o.menuItemText === 'Clear' ) {
				uPanel.clear ( this.rootPanel );
				return true; }
			if ( o.menuItemText === 'Delete Control' ) {
				let fPD = this.get_fPD();
				if ( fPD && (fPD.focusedChildId > 0) ) {
					let cd =   fPD.pd.getControlById ( fPD.focusedChildId );
					if ( cd ) {
						fPD.pd.panel.rmvControl ( cd ); }
					fPD.focusedChildId = 0; }

				return true; }
			return false;
		}
		if ( o.do === 'set-title' ) {
			this.setTitle ( o );
			return;
		}
		if ( o.do === 'keyboard-key-down' ) {
			return this.keyDown ( o );
		}
		if ( o.do === 'script' ) {
			return this.doScript ( o.script ); }
		if ( o.do === 'script-cmd' ) {
			return this.doScriptCmd ( o.cmd ); }
		if ( o.do === 'joint-values' ) {
			this.showJointValues ( o ); 
			return; }
		if ( o.do === 'close-frame' ) {
			o.frameId = prpFrameId;
			prpClientAppFnc ( o );;
			return; }
		if ( o.do === 'show-move-properties' ) {
		//	if ( uc.isFunction ( this.prpsFnc ) ) {
		//		this.prpsFnc ( { do: 		'properties-of-control',
		//						 frameId:	prpFrameId,
		//						 paneId:	prpPaneId,
		//						 ctrlD:		o.ctrlD,
		//						 title:		o.title  } ); }
			let fnc = cmn.oneCallee ( sW, this.callees, 'properties', false );
			if ( ! cmn.isFunction ( fnc ) ) {
				return; }
			fnc ( { do: 		'properties-of-control',
					frameId:	prpFrameId,
					paneId:		prpPaneId,
					ctrlD:		o.ctrlD,
					title:		o.title  } );
			return; }
		if ( o.do === 'clear-move-properties' ) {
		//	if ( uc.isFunction ( this.prpsFnc ) ) {
		//		this.prpsFnc ( { do: 		'properties-of-control',
		//						 frameId:	prpFrameId,
		//						 paneId:	prpPaneId,
		//						 ctrlD:		null,
		//						 title:		o.title  } ); }
			let fnc = cmn.oneCallee ( sW, this.callees, 'properties', false );
			if ( ! cmn.isFunction ( fnc ) ) {
				return; }
			fnc ( { do: 		'properties-of-control',
					frameId:	prpFrameId,
					paneId:		prpPaneId,
					ctrlD:		null,
					title:		o.title  } ); 
			return; }
		if ( o.do === 'get-control' ) {
			return this.getControl ( o ); }
		if ( o.do === 'get-code' ) {
			//	Do not call this.getCode() here. It may be that another
			//	pane of this frame is looking for the code.
			if ( this.rpd && cmn.isObject ( this.rpd.code ) ) {
				return this.rpd.code; }
			return null;
		}
		if ( o.do === 'disallow-pane-edits' ) {
			return this.disallowPaneEdits ( o );
		}
		if ( o.do === 'click-focus' ) {
			this.clickFocus ( o );
			return null; }
	//	if ( o.do === 'get-vp-fnc' ) {
	//		this.notifyGotVPFnc = o.cb;
	//		let fnc = cmn.oneCallee ( sW, this.callees, 'viewport' );
	//		if ( ! cmn.isFunction ( fnc ) ) {
	//			return null; }
	//		this.notifyGotVPFnc ( fnc );
	//		return null; }
		if ( o.do === 'not-focus' ) {
			let fPD = this.get_fPD();
			if ( fPD && (fPD.focusedChildId > 0) ) {
				let cd =   fPD.pd.getControlById ( fPD.focusedChildId );
				if ( cd ) {
					  cd.unfocus(); }
				fPD.focusedChildId = 0; }
			return null; }
		if ( o.do === 'control-removed' ) {
			if ( this.remove_fPD ( o.ctrlId ) ) {
				return null; }
			let fPD = this.get_fPD();
			if ( fPD && (fPD.focusedChildId === o.ctrlId) ) {
				fPD.focusedChildId = 0; }
			return null; }
		if ( o.do === 'get-info' ) {
			return this.getInfo(); }
		if ( o.do === 'long-text-dialog' ) {
			prpClientAppFnc ( o );;
			return; }
	}	//	doAll()

}	//	ClassUDUI

	let self = new ClassUDUI();

	onMount ( () => {
		const sW = 'UDUI onMount()';
	//	cmn.log ( sW );

	//	prpAppContentFnc ( { do:        'set-call-down',
	//						 to:        'client-content',
	//						 frameId:	prpFrameId,
	//						 paneId:	prpPaneId,
	//						 fnc:    	self.doAll } );
	 	//	The frame may not be in the app content. It (e.g., Help) may be
		//	a sibling to a modal dialog on the app screen. 
		let frame = prpClientAppFnc ( { do: 		'get-frame',
										frameId:	prpFrameId } );
		frame.frameFnc ( { do:		'set-call-down',
						   to:		'client-content',
						   frameId:	prpFrameId,
						   paneId:	prpPaneId,
						   fnc:    	self.doAll } );

		prpClientAppFnc ( { do: 		'register',
					//		what:		'UDUI',
							frameId:	prpFrameId,
							paneId:		prpPaneId,
							fnc:		self.doAll,
							paneKind:	'udui',
							regSpec:	self.regSpec } );
		self.bUDUIRegistered = true;

		let svg = d3.select ( '#' + self.svg.eleId );
		svg.append ( 'defs' );
		self.createRootPanel ( svg );

//		rrWorld.registerUDUI ( self.svg.eleId, self.doAll );

		if ( prpState ) {
			self.doSetState ( prpState.ccState ); }

	} )	//	onMount()

	onDestroy ( () => {
		const sW = 'UDUI onDestroy()';
	//	cmn.log ( sW );

		self.willUnmount = true;
		
	//	if ( uc.isFunction ( self.prpsFnc ) ) {
	//		//	Clear (unshow) any properties.  Know that if the properties
	//		//	pane is showing properties of another UDUI then this will do
	//		//	nothing.
	//		self.prpsFnc ( { do: 		'properties-of-control',
	//						 frameId:	prpFrameId,
	//						 paneId:	prpPaneId,
	//						 ctrlD:		null,
	//						 title:		'UDUI Pane Closed' } ); }
		//	Clear (unshow) any properties.  Know that if the properties
		//	pane is showing properties of another UDUI then this will do
		//	nothing.
		let fnc = cmn.oneCallee ( sW, self.callees, 
									  'properties', false );
		if ( cmn.isFunction ( fnc ) ) {
			fnc ( { do: 		'properties-of-control',
					frameId:	prpFrameId,
					paneId:		prpPaneId,
					ctrlD:		null,
					title:		'UDUI Pane Closed' } ); }
		
		let code = self.getCode();
		if ( code && cmn.isFunction ( code.willUnmount ) ) {
			code.willUnmount(); }

		if ( self.regSpec && self.bUDUIRegistered ) {
			prpClientAppFnc ( { do: 		'unregister',
						//		what:		'UDUI',
								frameId:	prpFrameId,
								paneId:		prpPaneId,
								fnc:		self.doAll,
								paneKind:	'udui',
								regSpec: 	self.regSpec } ); 
			self.bUDUIRegistered = false; }
		
//		rrWorld.unregisterUDUI ( self.svg.eleId );
	} ) //	onDestroy()

	afterUpdate ( () => {
		let sW = 'UDUI afterUpdate()';
	//	cmn.log ( sW );
		prpClientAppFnc ( { do: 'check-content', sW: sW  + ' top' } );
		if ( self.rpd && self.oState ) {
			self.doSetState ( self.oState );
			self.oState   = null;
			self.stateSet = true; }
		prpClientAppFnc ( { do: 'check-content', sW: sW  + ' bot' } );
	} ) //	afterUpdate()



</script>

<udui>

	<div id			= { prpEleId }
		 class		= "rr-udui-container"
		 style		= { styleString } >
		<div id			= { prpEleId + '-title' }
			 class		= "rr-udui-title"
			 style 		= { titleStyleString } >
			 { title }
		</div>
		<svg id			= { self.svg.eleId }
			 version		= "1.1 "
			 baseProfile	= "full"
			 width		= "100%" 
			 height		= "100%"
			 xmlns		= "http://www.w3.org/2000/svg">
		</svg>
	</div>

</udui>

<style>

	.rr-udui-container {
		display:			grid;
		width:              100%;
		height:				100%;
	}

	.rr-udui-title {
		font-family:        Arial, Helvetica, sans-serif;
		font-size:          12px;
		padding-bottom:     1px;
		flex:               1 1 auto;
		max-height:         14px;
		cursor:				default;
		text-align: 		center;
		border-bottom: 		dotted 1px #d2d2d2;
	}

</style>
