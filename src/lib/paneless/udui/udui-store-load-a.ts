
//  app/partials/udui/udui-store-load-a.js

//	For UDUI controls, to save to and load from local storage.

//	LS 	- 	In Local Storage (and probably in Share) things are stored with indirection
//
//	-	rr systems 
//		-	sys id
//			-	udui
//				-	panels
//					-	next panel id 			//	just one of these
//					-	panel id
//						-	<saved as>				//	a name
//							-	<panel JSON>
//						-	<saved as>				//	a name
//							-	<panel JSON>
//						...							//	user may store a panel to multiple names
//					...							//	for each panel of the system's udui
//
//	So -
//
//		Panel ID may need to be allocated by Share.
//
//			complex
//
//			perf hit
//
//			is there another way?
//
//			it must be unique system wide
//
//		Include the user ID - 
//
//			allocate panel IDs per user
//
//			<sys-id>-<user-id>-<panel-id> specification is like that of record types
//
//			user ID is that of the user that created the panel
//
//			prevents a particular user from maliciously (or otherwise) using up IDs for 
//			all users
//
//		Panels may be referenced/used across systems, between users -
//
//			<sys-id> is always the system where the  panel was created
//
//			<user-id> is always the user that created the panel
//
//		The LS item name for a particular panel's JSON might be something like -
//
//			<created-in-sys-id>-<created-by-user-id>-<panel-id>
//
//		May need a <saved-by-user-id> -
//
//			<created-in-sys-id>-<created-by-user-id>-<panel-id>-<saved-by-user-id>-<saved-as>
//
//		For example, the LS panel ID item name will look like -
//
//			30C4-9112-B-4C621
//
//		The item will be an array of panel names.  From that the current user can select
//		a panel, or verify a new name is not already being used.  The item name for the 
//		JSON of the panel will then be -
//
//			30C4-9112-B-4C621-<panel-name>
//
//		Share ? - Store Priority -
//
//			IndexdDB (iDB) - Local Storage (rrLS) - Share (thru RR Server API)
//
//			So, for storage, the app (almost?) always calls iDB functions -
//
//				On load - if the value is not present -
//
//					Get it from Share and insert it.
//
//				On store - if the bUpdate flag is true -
//
//					Store it in Share also.
//
//	App -
//
//		UDUI things - especially a command record's UDUI - 
//
//		-	is stored as a RR record
//
//		-	which means -
//
//			-	it has a RecID
//
//			-	it has a type ? - a user-specified subtype of ^UDUI ?
//
//			-	it is a server to -
//
//				-	the user that created it
//
//				-	probably command records
//
//		or 	- 	command records are its servers ?

import clone 			from 'clone';
import { cmn }			from '../common';

import { uc } 			from './udui-common';
import { uLabel } 		from './udui-label-b';
import { uCheckbox } 	from './udui-checkbox-b';
import { uButton } 		from './udui-button-e';
import { uSplitter } 	from './udui-splitter-b';
import { uList } 		from './udui-list-b';
import { uTree }		from './udui-tree-a';
import { uGraph }		from './udui-graph-a';
import { uInput } 		from './udui-input-b';
import { uTable } 		from './udui-table-a';
import { uTabs }		from './udui-tabs-a';
import { uTextarea }	from './udui-textarea-a';
import { uEditor }		from './udui-editor-a';
import { uCanvas } 		from './udui-canvas-a';


let rrLS = null;

let globalWhiteList = [ 'x', 'y', 'w', 'h', 'scale', 'name', 'eleId', 
	'childData', 'data', 'text', 'isMenu', 'itemData', 'ff', 'fs', 
	'vh', 'type', 'textId', 'sclrX', 'sclrY', 'bSplitPanel', 
	'bSaveRect', 'createdInSysId', 'createdByUserId', 'storeId', 
	'storeName', 'value', 'grid', 'isEnabled', 'isVisible', 'spaceX', 
	'spaceY', 'hasBorder', 'class', 'horzAlign', 'vertAlign', 'docked', 
	'bMoveRect', 'bSizeRect', 'bVertSB', 'bHorzSB', 'inputType', 
	'execute', 'onclick', 'border', 'codeName', 'regSpec', 'hotKey', 
	'assoc', 'textAlign', 'color', 'bDropdown', 'menu', 'nCols', 
	'tabIndex', 'xPct', 'yPct', 'wPct', 'hPct', 'xEval', 'yEval', 
	'wEval', 'hEval', 'iSelected', 'panelStoreId', 'style', 'step', 
	'decPlaces', 'markdown', 'letterSpacing', 'lineHeight', 
	'fillsPanel', 'xcolumns', 'hasConnectors', 'pathData', 'pathId', 
	'dir', 'startPoint', 'endPoint', 'panelName', 'panningEnabled',
	'panX', 'panY', 'borderColor', 'image', 'imageX', 'imageY', 
	'imageScale', 'title', 'itemStyle', 'minWidth', 'minHeight' ];
let tableColsWhiteList = [ 'iCol', 'colStyleId', 'divStyleId', 
						   'tdStyleId', 'hasDiv', 'isSplitter' ];

export let uSL = (function() { 

	'use strict';

	/* global uTable */

	let serviceId = 'uduiStoreLoadA';

	/* jshint validthis: true */

	let svc: any = {};

	let uduis: any = null;	//	uduis is an object whose item's key is 
							//	'<uduiId>' and each item's value is also an 
							//	object.
							//
							//	And the key of each item in the panels object is the panel's storeId
							//	and the items' value is a list (array) of names representing each 
							//	version of the panel stored (i.e., the panel's storeName).
							//
							//	Like so -
							//
							//		uduis = {
							//			'<uduiId>': {
							//				nextStoreId: 	<number>,
							//				panels: {
							//					'<storeId>': [
							//						'<storeName>',
							//						'<storeName>',
							//						...
							//					],
							//					'<storeId>': [
							//						'<storeName>',
							//						'<storeName>',
							//						...
							//					],
							//					...
							//				}
							//			},
							//			'<uduiId>': {
							//				nextStoreId: 	<number>,
							//				panels: {
							//					...
							//				}
							//			},
							//			...
							//		}
							//
							//	This is the UDUI "list".  One, for all users, per system.  For now.
							//
							//	It is stored with a item name like -
							//
							//		 <sys-id>-udui-list

	svc.getLoadSpec = function ( rpd, rgs ) {
		return { 
			sC: 		rgs.sW, 
			panelSvc: 	rgs.panelSvc,
			root: 		{ 
				svg: 		null,
				data: 		null,
				panelData: 	null,
				panel: 		rpd.panel 
			},
			parentPanel: 	rpd.panel,
			dlg: 			rgs.dlg,
			board: 			rgs.board,
			panel:  		null,
			panelClick: 	null 
		};
	};	//	getLoadSpec()

	function loadUDUIs ( sC ) {
		let sW  = sC + ' loadUDUIs()';
	//	cmn.log ( sW );
		if ( ! uduis )
			uduis = {};
	}	//	loadUDUIs()

	function storeUDUIs ( sC ) {
		let sW  = sC + ' storeUDUIs()';
	//	cmn.log ( sW );
	}	//	storeUDUIs()

	function getUDUI ( sC, uduiId ) {
		let sW  = sC + ' getUDUI()';
//		cmn.log ( sW );
		if ( uduis === null ) 
			loadUDUIs ( sW );
		let udui = uduis[uduiId];
		if ( ! udui ) 
			udui = uduis[uduiId] = { nextStoreId: 	uc.FIRST_PANEL_STORE_ID,
									 panels:       	{} };
		return udui;
	}	//	getUDUI()

	function updatePanelList ( sC, uduiId, panelData ) {
		let sW  = sC + ' updatePanelList()';
		cmn.log ( sW );
		let udui       = getUDUI ( sW, uduiId );
		let storeNames = udui.panels[panelData.storeId];
		if ( storeNames.indexOf ( panelData.storeName ) >= 0 ) 
			return;
		storeNames.push ( panelData.storeName );
		storeUDUIs ( sW );
	}	//	updatePanelList()


	svc.allocPanelStore = function ( uduiId, storeId ) {
		let sW  = serviceId + ' allocPanelStore()';
//		cmn.log ( sW );
		let udui = getUDUI ( sW, uduiId );
		if ( storeId === 0 )
			storeId = udui.nextStoreId++;
		if ( udui.panels[storeId] === undefined ) {
			udui.panels[storeId] = [];
			storeUDUIs ( sW );
		}
		return storeId;
	};	//	allocPanelStore()


	svc.getPanelList = function ( sC, uduiId ) {
		let sW = sC + ' ' + serviceId + ' getPanelList';
		cmn.log ( sW );
		let list: any [] = [];
		let udui = getUDUI ( sW, uduiId );
		let key, names, n, i;
		for ( key in udui.panels ) {
			names = udui.panels[key];
			n = names.length;
			for ( i = 0; i < n; i++ ) {
				list.push ( { id: key, name: names[i] } );
			}
		}
		return list;
	};	//	getPanelList()


	svc.jsonizeControl = function ( sC, ctrlD ) {
		let sW  = sC + ' ' + serviceId + ' jsonizeControl()';
	//	cmn.log ( sW );

		if ( ctrlD.type === 'panel' ) {
			return svc.jsonizePanel ( sW, 0, ctrlD ); }

		const replacer =  ( key, value ) => {

			//	Some keys (not in the white list) of certain controls ...
			if ( this.type === uc.TYPE_TABLE ) {
				if ( key === 'styles' ) {
					return JSON.stringify ( value ); }
				if ( key === 'cols' ) {
					return JSON.stringify ( value, tableColsWhiteList ); }
			//	if ( key === 'nextStyleId' ) {
			//		return value; }
			//	if ( key === 'nextColId' ) {
			//		return value; }
				if ( key === 'dwr' ) {
					return value; } } 

			if ( this.type === uc.TYPE_TABS ) {
				if ( key === 'tabs' ) {
				//	return value; } }
					//	Use PanelData's storeId to associate pane with tab 
					//	when restoring.
					let v2: any = {};
					v2.iSelected = value.iSelected;
					v2.data      = [];
					value.data.forEach ( d => {
						let rpd   = d.rpd;		d.rpd   = null;
						let panel = d.panel;	d.panel = null;
						let tabs  = d.tabs;		d.tabs  = null;
						let d2 = clone ( d );
						d2.panelStoreId = panel.data.storeId;
						d.rpd   = rpd;
						d.panel = panel;
						d.tabs  = tabs;
						v2.data.push ( d2 );
					} );
					return v2; } }

			if ( key.length === 0 )  {
				return value; }
			if ( Array.isArray ( this ) ) {	//	key will be the string form 
				return value; }				//	of the index
			if ( globalWhiteList.includes ( key ) ) {
				return value; }
			return undefined;
		}	//	replacer()

		let s1 = JSON.stringify ( ctrlD, replacer );
	//	cmn.log ( sW, 'data - (length: ' + s1.length + ')\n' + s1 );
	//	let	s2 = JSON.stringify ( pd, replacer, '    ' );
	//	cmn.log ( sW, 'data -\n' + s2 );

		return s1;

	};	//	jsonizeControl()

	//	UDUI Panel storage item name (its pretty long) -
	//
	//		 <created-in-sys-id>		the system the panel was created in
	//		-<udui-store-id>			the UDUI the panel was in when it was stored
	//		-<created-by-user-id>		the user that created the panel
	//		-<panel-store-id>			the Id given to the panel when it was created
	//		-<saved-by-user-id>			the user that stored the panel - synonymous with posted-by
	//		-<panel-store-name>			the name given by the user when the panel was stored
	//
	//	Loading ... ?  How to specify all those things -
	//
	//		created-in-sys-id		?
	//		created-by-user-id 		?
	//
	//	Its like selecting a record, or record type.  Need a dialog with lists of systems, 
	//	users to choose from.  Silly.
	//
	//	Root panel -
	//
	//		Goes with the system.  When a system is Shared, for example, there are PEs, etc..
	//		Systems have a posted-by (user) property.
	//
	//	->		That posted-by will apply to the layout too. ?
	//
	//			Same for the created-by.
	//
	//
	//		So, for the root panel -
	//
	//			created-in-sys-id 		==		current system's Id
	//			udui-store-id			==		uduiId allocated when the root panel was
	//											created
	//			created-by-user-id 		==		current system's created-by-user-id
	//			panel-store-id			==		?
	//			saved-by-user-id		==		current system's posted-by-user-id
	//			panel-store-name		==		'RRWebApp'
	//
	//		What about panel-store-id?  For the root panel will it always be some known
	//		value?  Something like -
	//
	//			uc.APP_CLIENT_ROOT_PANEL_STORE_ID	?
	//
	//		i.e., some reserved store Ids

	svc.jsonizePanel = function ( sC, uduiId, panelData ) {
		let sW  = sC + ' ' + serviceId + ' jsonizePanel()';
	//	cmn.log ( sW );

		function safePanelData ( pd0 ) {
			//	Temporarily undo possible circular refs.
			let panel       = pd0.panel;			pd0.panel       = null;	
			let parent		= pd0.parent;			pd0.parent		= null;
			let parentPanel = pd0.parentPanel;		pd0.parentPanel = null;
			let childData   = pd0.childData;		pd0.childData   = null;
			let filledBy    = pd0.filledBy;			pd0.filledBy    = null;
			let base        = pd0.base;				pd0.base        = null;
			let baseData    = pd0.baseData;			pd0.baseData    = null;
			let rootData	= pd0.rootData;			pd0.rootData	= null;
			let svg			= pd0.svg;				pd0.svg			= null;
			let rpd			= pd0.rpd;				pd0.rpd			= null;
			let code		= pd0.code;				pd0.code		= null;
			let foInfoLabel	= pd0.foInfoLabel;		pd0.foInfoLabel	= null;
			let zge			= pd0.zge;				pd0.zge			= null;
			let tabsData	= pd0.tabsData;			pd0.tabsData	= null;
			let tabData		= pd0.tabData;			pd0.tabData		= null;
			let appSPs		= pd0.appScreenPanels;	pd0.appScreenPanels = null;
			//	Copy the panel data.
			let pd = JSON.parse ( JSON.stringify ( pd0 ) );
			//	Undo undo.
			pd0.panel       = panel;
			pd0.parent		= parent;
			pd0.parentPanel = parentPanel;
			pd0.childData   = childData;		
			pd0.filledBy    = filledBy;			
			pd0.base        = base;							
			pd0.baseData    = baseData;			
			pd0.rootData	= rootData;						
			pd0.svg			= svg;	
			pd0.rpd 		= rpd;
			pd0.code		= code;
			pd0.foInfoLabel	= foInfoLabel;
			pd0.zge			= zge;
			pd0.tabsData	= tabsData;
			pd0.tabData		= tabData;
			pd0.appScreenPanels	= appSPs;
			return pd;
		}	//	safePanelData()
		function safeTabData ( td0 ) {
			let rpd			= td0.rpd;			td0.rpd		= null;
			let panel 		= td0.panel;		td0.panel 	= null;
			let	tabs 		= td0.tabs;			td0.tabs 	= null;
			let td = JSON.parse ( JSON.stringify ( td0 ) );
			td0.rpd			= rpd;
			td0.panel 		= panel;
			td0.tabs		= tabs;
			return td;
		}	//	safeTabData()
		function safeTabsData ( tsd0 ) {
			let rpd			= tsd0.rpd;				tsd0.rpd			= null;
			let childData   = tsd0.childData;		tsd0.childData		= null;
			let content		= tsd0.content;			tsd0.content		= null;
			let panel		= tsd0.panel;			tsd0.panel			= null;
			let parentPanel	= tsd0.parentPanel;		tsd0.parentPanel	= null;
			let tabs_g 		= tsd0.tabs.g;			tsd0.tabs.g			= null;
			let tabs_data	= tsd0.tabs.data;		tsd0.tabs.data		= [];
			for ( let i = 0; i < tabs_data.length; i++ ) {
				tsd0.tabs.data.push ( safeTabData ( tabs_data[i] ) ); }	
			let tsd = JSON.parse ( JSON.stringify ( tsd0 ) );
			tsd0.rpd		 = rpd;
			tsd0.childData   = childData;
			tsd0.content	 = content;
			tsd0.panel		 = panel;
			tsd0.parentPanel = parentPanel;
			tsd0.tabs.g 	 = tabs_g;
			tsd0.tabs.data	 = tabs_data;
			return tsd;
		}	//	safeTabsData()
		function setChildPanelStoreNames ( pd0 ) {
			let pd = safePanelData ( pd0 );
			//	Assign panel names to the start, end points of paths between
			//	child panels.
			let paths = {};
			pd0.childData.data.forEach ( function ( ctrl ) { 
				if ( ctrl.type !== 'panel' ) {
					return; }
				ctrl.pathData.forEach ( path => {
					if ( ! paths[path.pathId] ) {
						paths[path.pathId] = path; }
				} ); } );
			let keys = Object.keys ( paths );
			keys.forEach ( pathId => {
				let path = paths[pathId];
				let sp = path.startPoint;
				let ep = path.endPoint;;
				let cd: any = null;
				//	TODO:	Use storeId instead of name?
				cd = pd0.getControlById ( sp.panelDataId );
				if ( ! cd ) {
					cmn.error ( sW, 'path start panel not found' ); }
				else {
					sp.panelName = cd.name; }
				cd = pd0.getControlById ( ep.panelDataId );
				if ( ! cd ) {
					cmn.error ( sW, 'path end panel not found' ); }
				else {
					ep.panelName = cd.name; } } );

			//	Recur on child panels.
			pd.childData = { nextId: 	pd0.childData.nextId,
							 data: 		[] };
			pd0.childData.data.forEach ( function ( ctrl ) { 
				if ( ctrl.type === 'panel' ) {
					if ( ctrl.savedAs ) {
						pd.childData.data.push ( { storeName: 	ctrl.storeName,
												   data:    	null } ); 
						svc.storePanel ( sW, uduiId, ctrl ); }
					else {
						let sd = { storeName: 	null,
								   data:   	setChildPanelStoreNames ( ctrl ) }; 
						pd.childData.data.push ( sd ); } }
				else {
					if ( ctrl.type === 'tabs' ) {
						let tds = safeTabsData ( ctrl );
						//	Use PanelData's storeId to associate pane with tab 
						//	when restoring.
						let d   = ctrl.tabs.data;
						for ( let i = 0; i < d.length; i++ ) {
							if ( ! d[i].panel ) {
								cmn.error ( sW,   'ctrl tabs.data[' + i 
												+ '].panel is not set' );
								continue; }
							tds.tabs.data[i].panelStoreId 
													= d[i].panel.data.storeId; }
						//	Recur on the tab's panel.
						tds.childData = { nextId: 	ctrl.childData.nextId,
										  data: 	[] };
						let cdd = ctrl.childData.data;
						for ( let i = 0; i < cdd.length; i++ ) {
							let d = setChildPanelStoreNames ( cdd[i] );
							tds.childData.data.push ( d ); } 
						pd.childData.data.push ( { storeName: 	null,
												   data:    	tds} ); }
					else {
						pd.childData.data.push ( { storeName: 	null,
												   data:    	ctrl } ); } }
			} );
			return pd;	//	Return copy of pd0 with storeName in childData.data.
		}	//	setChildPanelStoreNames()			

	//	const replacer =  ( key, value ) => {
		function replacer ( key, value ) {

			//	Some keys (not in the white list) of certain controls ...
			if ( this.type === uc.TYPE_TABLE ) {
				if ( key === 'styles' ) {
					return JSON.stringify ( value ); }
				if ( key === 'cols' ) {
					return JSON.stringify ( value, tableColsWhiteList ); }
			//	if ( key === 'nextStyleId' ) {
			//		return value; }
			//	if ( key === 'nextColId' ) {
			//		return value; }
				if ( key === 'dwr' ) {
					return value; } } 

			if ( this.type === uc.TYPE_TABS ) {
				if ( key === 'tabs' ) {
				//	return value; } }
					let v2: any = {};
					v2.iSelected = value.iSelected;
					v2.data      = [];
					value.data.forEach ( d => {
						let rpd   = d.rpd;		d.rpd   = null;
						let panel = d.panel;	d.panel = null;
						let tabs  = d.tabs;		d.tabs  = null;
						let d2 = clone ( d );
					//	d2.panelStoreId = panel ? panel.data.storeId : 0;
					//	Doesn't work here because panel is set null.
						d.rpd   = rpd;
						d.panel = panel;
						d.tabs  = tabs;
						v2.data.push ( d2 );
					} );
					return v2; } }

			if ( key.length === 0 )  {
				return value; }
			if ( Array.isArray ( this ) ) {	//	key will be the string form 
				return value; }				//	of the index
			if ( globalWhiteList.includes ( key ) ) {
				return value; }
			return undefined;
		}	//	replacer()

		let pd = setChildPanelStoreNames ( panelData );

		let s1 = JSON.stringify ( pd, replacer );
	//	cmn.log ( sW, 'data - (length: ' + s1.length + ')\n' + s1 );
	//	let	s2 = JSON.stringify ( pd, replacer, '    ' );
	//	cmn.log ( sW, 'data -\n' + s2 );
		
		//	If pd.regSpec was an object then stringify as so.
		if ( cmn.isObject ( pd.regSpec ) ) {
			let o = JSON.parse ( s1 );
			o.regSpec = pd.regSpec;
			s1 = JSON.stringify ( o ); }
			
		//	Likewise, storageSpec.
		if ( cmn.isObject ( pd.storageSpec ) ) {
			let o = JSON.parse ( s1 );
			o.storageSpec = pd.storageSpec;
			s1 = JSON.stringify ( o ); }

		return s1;

	};	//	jsonizePanel()

	svc.storePanel = function ( sC, uduiId, panelData ) {
		let sW  = sC + ' ' + serviceId + ' storePanel()';
		cmn.log ( sW );

		let s = svc.jsonizePanel ( sW, uduiId, panelData );

		updatePanelList ( sW, uduiId, panelData );

	};	//	storePanel()


	svc.loadChildren = function ( controls, o, rpd, panel ) {
		const sW = serviceId + ' loadChildren()';

		function buildPanel ( itemD, parentPanel, tabsD? ) {
			let sW2 = sW + ' buildPanel()';
			let panel: any = null;
			cmn.log ( sW2 + ':  itemD.name: ' + itemD.name );

			o.setUpCB ( itemD );

			function addChildCtrls ( data, panel ) {
				let d, o2, child;
				for ( let i = 0; i < data.length; i++ ) {
					d = data[i];
					if ( d.storeName ) {
						o2 = { 
							sC: 		sW2, 
							panelSvc: 	o.svc,
							root: 		{ 
								svg: 		null,
								data: 		null,
								panelData: 	null,
								panel: 		rpd
							},
							parentPanel: 	panel,
							dlg: 			null,
							panel:  		null,
							panelClick: 	null 
						};

						data[i] = svc.loadPanel ( rpd, o2 ).data; }
					else {
						data[i] = d.data;
						buildUDUI ( data[i], panel ); } }
			}	//	addChildCtrls()

			if ( (parentPanel === null) && cmn.isObject ( tabsD ) ) {
				panel = tabsD.createPanelData().panel; }
			else
			if ( o.root.panel === null ) {
				let d = { rpd:				rpd,
						  x: 				itemD.x, 
						  xPct:				itemD.xPct,
						  xEval:			itemD.xEval,
						  y: 				itemD.y, 
						  yPct:				itemD.yPct,
						  yEval:			itemD.yEval,
					 	  w: 				itemD.w, 
						  wPct:				itemD.wPct,
						  wEval:			itemD.wEval,
						  h: 				itemD.h, 
						  hPct:				itemD.hPct,
						  hEval:			itemD.hEval,
						  name: 			itemD.name, 
						  clickCB: 			o.panelClick,
						  bStore: 			true,
						  storeId: 			itemD.storeId,
						  storeName: 		itemD.storeName,
						  shiftClickCB:		itemD.shiftClickCB,
						  onProperties:		itemD.onProperties,
						  borderColor:		itemD.borderColor,
						  panningEnabled:	itemD.panningEnabled,
						  panX:				itemD.panX,
						  panY:				itemD.panY,
						  hasConnectors:	itemD.hasConnectors,
						  pathData:			itemD.pathData,
						  minWidth: 		itemD.minWidth,
						  minHeight:		itemD.minHeight };

				o.root.panelData = o.panelSvc.restorePanelData ( d );

				o.root.panelData.sclrX = itemD.sclrX;
				o.root.panelData.sclrY = itemD.sclrY;

				//	Normally the parent panel sets this.  Since this is the 
				//	"root" panel (it has no parent) we do it here.
				o.root.panelData.eleId = itemD.eleId;

				o.root.data.data = [];
				o.root.data.data.push ( o.root.panelData );
				o.root.panel = o.panelSvc.createPanel ( o.root.svg, o.root.data, true );
				panel = o.root.panel; } 
			else {
				//	A child panel.  
				let d = { rpd:				rpd,
						  x: 				itemD.x, 
						  xPct:				itemD.xPct,
						  xEval:			itemD.xEval,
						  y: 				itemD.y, 
						  yPct:				itemD.yPct,
						  yEval:			itemD.yEval,
					 	  w: 				itemD.w, 
						  wPct:				itemD.wPct,
						  wEval:			itemD.wEval,
						  h: 				itemD.h, 
						  hPct:				itemD.hPct,
						  hEval:			itemD.hEval,
						  name: 			itemD.name, 
						  clickCB: 			o.panelClick,
						  bStore: 			true,
						  storeId: 			itemD.storeId,
						  storeName: 		itemD.storeName,
						  docked: 			itemD.docked,
						  bMoveRect: 		itemD.bMoveRect,
						  bSizeRect: 		itemD.bSizeRect,
						  bVertSB: 			itemD.bVertSB,
						  bHorzSB: 			itemD.bHorzSB,
						  shiftClickCB:		itemD.shiftClickCB,
						  onProperties:		itemD.onProperties,
						  borderColor:		itemD.borderColor,
						  panningEnabled:	itemD.panningEnabled,
						  panX:				itemD.panX,
						  panY:				itemD.panY,
						  hasConnectors:	itemD.hasConnectors,
						  pathData:			itemD.pathData,
						  codeName:			itemD.codeName,
						  minWidth: 		itemD.minWidth,
						  minHeight:		itemD.minHeight };

				let pd = o.panelSvc.restorePanelData ( d );

				pd.sclrX = itemD.sclrX;
				pd.sclrY = itemD.sclrY;

				if ( o.dlg ) {
					o.dlg.data = pd;
					o.dlg.data.bSaveRect = o.dlg.isBuiltIn;

					//	i.e., show it on top of everything else
				//	panel = o.root.panel.appendDialog ( o.dlg );
					panel = parentPanel.appendDialog ( o.dlg ); }	//	2017-Aug
				else
				if ( o.board ) {
					o.board.panelData = pd;
					o.board.panelData.bSaveRect   = o.board.isBuiltIn;
					o.board.panelData.hasCloseBox = true;
					switch ( pd.docked ) {
						case 'right':
							o.board.panel 
								= panel 
								= o.root.panel.dockSplitRight ( pd, 	//	expecting Panel here
																uc.appPanelClick, 
																false )
									.rightPanel;
							break;
						default:
							o.board.panel 
								= panel 
								= o.root.panel.appendBoard ( o.board );
					} } 
				else {
					panel = parentPanel.addControl ( pd ); }

				//	Split?
				if ( itemD.bSplitPanel ) {
					let id0 = itemD.childData.data[0];
					let pd0 = o.panelSvc.createPanelData ( { rpd:		rpd,
															 x:			id0.x, 
															 y:			id0.y, 
															 w:			id0.w, 
															 h:			id0.h, 
															 name:		id0.name, 
															 clickCB:	o.panelClick,
						  									 shiftClickCB:	itemD.shiftClickCB,
						  									 onProperties:	itemD.onProperties } );
					pd0.sclrX = id0.sclrX;
					pd0.sclrY = id0.sclrY;

					let sd = uSplitter.createSplitterData ( itemD.childData.data[1] );

					let id2 = itemD.childData.data[2];
					let pd2 = o.panelSvc.createPanelData ( { rpd:		rpd,
															 x:			id2.x, 
															 y:			id2.y, 
															 w:			id2.w, 
															 h:			id2.h, 
															 name:		id2.name, 
															 clickCB:	o.panelClick,
						  									 shiftClickCB:	itemD.shiftClickCB,
															 onProperties:	itemD.onProperties } );
					pd2.sclrX = id2.sclrX;
					pd2.sclrY = id2.sclrY;

					panel.restoreSplit ( pd0, sd, pd2 );

					addChildCtrls ( id0.childData.data, pd0.panel );

					addChildCtrls ( id2.childData.data, pd2.panel );

					return panel;
				}
			}

			if ( o.ctrls === 'none' )
				return panel;

			addChildCtrls ( itemD.childData.data, panel );

			return panel;
		}	//	buildPanel()

		function buildButton ( itemD, panel ) {
			itemD.eleId			= 0;
			itemD.rpd 			= rpd;
			o.setUpCB ( itemD );
			panel.addControl ( uButton.createButtonData ( itemD ) );
		}	//	buildButton()

		function buildLabel ( itemD, panel ) {
			itemD.eleId = 0;
			itemD.rpd	= rpd;
			o.setUpCB ( itemD );
			panel.addControl ( uLabel.createLabelData ( itemD ) );
		}	//	buildLabel()

		function buildCheckBox ( itemD, panel ) {
			itemD.eleId = 0;
			itemD.rpd	= rpd;
			o.setUpCB ( itemD );
			panel.addControl ( uCheckbox.createCheckBoxData ( itemD ) );
		}	//	buildCheckBox()

		function buildList ( itemD, panel ) {
			itemD.eleId = 0;
			itemD.rpd 	= rpd;
			o.setUpCB ( itemD );
			let list = panel.addControl ( uList.createListData ( itemD ) );

			if ( itemD.isMenu ) {
				let i, a = itemD.itemData;
				for ( i = 0; i < a.length; i++ ) {
					let id = a[i];
					let itemData = uList.createListItemData ( id.textId, 
															  id.text );
					list.data.itemData.push ( itemData ); } }
			else {
				itemD.itemData = []; }
			list.update();
		}	//	buildList()

		function buildTree ( itemD, panel ) {
			itemD.eleId = 0;
			itemD.rpd 	= rpd;
			o.setUpCB ( itemD );
			let tree = panel.addControl ( uTree.createTreeData ( itemD ) );

			if ( itemD.isMenu )	{
				let i, a = itemD.itemData;
				for ( i = 0; i < a.length; i++ ) {
					let id = a[i];
					let itemData = uTree.createTreeItemData ( id.textId, 
															  id.text );
					tree.data.itemData.push ( itemData ); } }
			else {
				itemD.itemData = []; }
			tree.update();
		}	//	buildTree()

		function buildGraph ( itemD, panel ) {
			itemD.eleId = 0;
			itemD.rpd	= rpd;
			o.setUpCB ( itemD );
			panel.addControl ( uGraph.createGraphData ( itemD ) );
		}	//	buildGraph()

		function buildInput ( itemD, panel ) {
			itemD.eleId = 0;
			itemD.rpd 	= rpd;
			o.setUpCB ( itemD );
			panel.addControl ( uInput.createInputData ( itemD ) );
		}	//	buildInput()

		function buildTextarea ( itemD, panel ) {
			itemD.eleId = 0;			
			itemD.rpd 	= rpd;
			o.setUpCB ( itemD );
			panel.addControl ( uTextarea.createTextareaData ( itemD ) );
		}	//	buildTextarea()

		function buildEditor( itemD, panel ) {
			itemD.eleId = 0;			
			itemD.rpd 	= rpd;
			o.setUpCB ( itemD );
			panel.addControl ( uEditor.createEditorData ( itemD ) );
		}	//	buildEditor()

		function buildCanvas ( itemD, panel ) {
			itemD.eleId = 0;			
			itemD.rpd 	= rpd;
			o.setUpCB ( itemD );
			panel.addControl ( uCanvas.createCanvasData ( itemD ) );
		}	//	buildCanvas()

		function buildTable ( itemD, panel ) {
			let styles = JSON.parse ( itemD.styles );	itemD.styles = [];
			let cols   = JSON.parse ( itemD.cols );		itemD.cols   = [];
			itemD.eleId = 0;			
			itemD.rpd 	= rpd;
			o.setUpCB ( itemD );
			let tableD = uTable.createTableData ( itemD );
			styles.forEach ( function ( style ) {
				tableD.createStyle ( style );
			} );
			cols.forEach ( function ( col ) {
				tableD.createColumn ( col );
			} );
			panel.addControl ( tableD );
		}	//	buildTable()

		function buildTabs ( itemD, panel ) {
			itemD.eleId		= 0;			
			itemD.rpd		= rpd;
			itemD.panelSvc	= o.panelSvc;
			o.setUpCB ( itemD );
			
			let tabsD = uTabs.createTabsData ( itemD );
				tabsD.tabs.data      = itemD.tabs.data;
				tabsD.tabs.iSelected = itemD.tabs.iSelected;
			
			tabsD.tabs.data.forEach ( d => {
				d.rpd   = rpd; } );
			//	let o = { bStore: true,
			//			  storeId: }
			//	d.panel = tabsD.createPanelData ( d, o ).panel; } );
			
			//	A panelStoreId was added to each TabData in tabsD.tabs.data[].
			//	That panelStoreId is used to look up the panel in what is
			//	here called stored[].  Note that uTabs recreates the tab panels
			//	from scratch. But we still need to provide the contents of
			//	each panel - which can be found in this stored.
			tabsD.childData.stored = itemD.childData.data;
			tabsD.childData.stored.forEach ( d => d.rpd = rpd );
		//	let cdd  = itemD.childData.data;
		//	let i, n = cdd.length;
		//	let td   = itemD.tabs.data;
		//	let j, ntd = td.length;
		//	for ( i = 0; i < n; i ++ ) {		//	each tab panel
		//		let storeId = cdd[i].storeId;
		//		let panel = buildPanel ( cdd[i], null, tabsD );
		//		itemD.childData.data[i] = panel.data; 
		//		for ( j = 0; j < ntd;  j++ ) {
		//			if ( td[i].panelStoreId === storeId ) {
		//				td[i].panel = panel;
		//				panel.data.eleId = td.eleId + '-pnl';
		//				break; } } }
			
			tabsD.childData.restorePanelCB = function ( data, panel ) {
				for ( let i = 0; i < data.length; i++ ) {
					buildUDUI ( data[i].data, panel ); } 
			}	//	restorePanelCB()

			panel.addControl ( tabsD );
		}	//	buildTabs()

		function buildUDUI ( itemD, panel ) {
			if ( itemD.type === uc.TYPE_PANEL ) {
				return buildPanel ( itemD, panel ); }
			else
			if ( itemD.type === uc.TYPE_BUTTON ) {
				buildButton ( itemD, panel ); }
			else
			if ( itemD.type === uc.TYPE_LABEL ) {
				buildLabel ( itemD, panel ); }
			else
			if ( itemD.type === uc.TYPE_CHECKBOX ) {
				buildCheckBox ( itemD, panel ); }
			else
			if ( itemD.type === uc.TYPE_LIST ) {
				buildList ( itemD, panel ); }
			else
			if ( itemD.type === uc.TYPE_TREE ) {
				buildTree ( itemD, panel ); }
			else
			if ( itemD.type === uc.TYPE_GRAPH ) {
				buildGraph ( itemD, panel ); }
			else
			if ( itemD.type === uc.TYPE_INPUT ) {
				buildInput ( itemD, panel ); }
			else
			if ( itemD.type === uc.TYPE_TEXTAREA ) {
				buildTextarea ( itemD, panel ); }
			else
			if ( itemD.type === uc.TYPE_EDITOR ) {
				buildEditor ( itemD, panel ); }
			else
			if ( itemD.type === uc.TYPE_CANVAS ) {
				buildCanvas ( itemD, panel ); }
			else
			if ( itemD.type === uc.TYPE_TABLE ) {
				buildTable ( itemD, panel ); }
			else
			if ( itemD.type === uc.TYPE_TABS ) {
				buildTabs ( itemD, panel ); }
			return null;
		}	//	buildUDUI()

		for ( let i = 0; i < controls.length; i++ ) {
			let itemD = clone ( controls[i].data );
			buildUDUI ( itemD, panel ); }

	}	//	loadChildren()

	svc.loadPanel = function ( rpd, o ) {
		let sW = o.sC + ' ' + serviceId + ' loadPanel()';

		let item = null;

		if ( ! item ) {
		//	cmn.log ( sW, 'item not in local storage' );
			return null;
		}
		let s = JSON.stringify ( item );
		cmn.log ( sW, ' data - (length: ' + s.length + ')\n' + s );


	//	o.panel = buildUDUI ( item, o.parentPanel ? o.parentPanel : o.root.panel );
		svc.loadChildren ( [item], rpd, o, o.parentPanel ? o.parentPanel : o.root.panel )

	};	//	loadPanel()

	return svc;

} )();

