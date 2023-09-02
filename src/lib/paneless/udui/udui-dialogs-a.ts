
//  app/partials/udui/udui-dialogs-a.js

import { cmn }			from '../common';
import { uc } 			from './udui-common';
import { uSL } 			from './udui-store-load-a';
import { uPanel } 		from './udui-panel-f';
import { uButton } 		from './udui-button-e';
import { uLabel } 		from './udui-label-b';
import { uInput } 		from './udui-input-b';
import { uCheckbox } 	from './udui-checkbox-b';
import { uTable } 		from './udui-table-a';

export var uDialog = (function() { 

	'use strict';

	var serviceId = 'uduiDialogsA';

	/* jshint validthis: true */

	var svc: any = {};

	svc.newLabelDialog = function ( args ) {
		var sW = args.sC + ' ' + serviceId + ' newLabelDialog()';
		var rpd   = args.rpd,
			dlg   = { isBuiltIn: 		true,
						invokingPanel: 	args.forPanel,
						data: 			null,
						panel: 			null },
			cd    = null, 				//	control data
			ce    = null,				//	control element
			eles  = [];					//	elements

		function onOK() {
			var sW2 = sW + ' onOK()';
			cmn.log ( sW2 );
			var ld = args.label.data;
			ld.name =                   dlg.panel.getControlDataByName ( 'edtLabelName' ).value;
			ld.text =                   dlg.panel.getControlDataByName ( 'edtLabelText' ).value;
			ld.ff   =                   dlg.panel.getControlDataByName ( 'edtLabelFontName' ).value;
			ld.fs   = Number.parseInt ( dlg.panel.getControlDataByName ( 'edtLabelFontSize' ).value );
			rpd.panel.removeDialog ( dlg );
			args.label.updateProperties();
		}	//	onOK()
		
		function onCancel() {
			var sW2 = sW + ' onCancel()';
			cmn.log ( sW2 );
			rpd.panel.removeDialog ( dlg );
		}	//	onCancel()
		
		var o = uSL.getLoadSpec ( rpd,
									{ sW: 		sW, 
									udui: 		args.udui, 
									panelSvc: 	uPanel, 
									dlg: 		dlg, 
									board: 		null,
									storeId: 	uc.NEW_LABEL_DLG_STORE_ID, 
									storeName: 	uc.NEW_LABEL_DLG_STORE_NAME } );

		uSL.loadPanel ( rpd, o );

		if ( o.panel ) {
			if ( (cd = o.panel.getControlDataByName ( 'btnOK' )) !== null )
				cd.cb = onOK;
			if ( (cd = o.panel.getControlDataByName ( 'btnCancel' )) !== null )
				cd.cb = onCancel;
			o.panel.setInput ( 'edtLabelName',          args.label.data.name );
			o.panel.setInput ( 'edtLabelText',          args.label.data.text );
			o.panel.setInput ( 'edtLabelFontName',      args.label.data.ff );
			o.panel.setInput ( 'edtLabelFontSize', '' + args.label.data.fs );

			return;
		}

		//	Create the dialog.  First appearence.  Edit layout and save interactively.
		//
		var w = 200;
		var h = 140;
		var x = Math.round ( args.x );
		var y = Math.round ( args.y );

		dlg.data = uPanel.createAppPanelData ( { rpd:		rpd,
												 x: 		x + uc.OFFS_4_1_PIX_LINE, 
										 		 y: 		y + uc.OFFS_4_1_PIX_LINE, 
												 w: 		w, 
												 h: 		h, 
												 name: 		'pnlNewLabel', 
												 clickCB: 	uc.appPanelClick, 
												 	 storeId: 	uc.NEW_LABEL_DLG_STORE_ID,
												 storeName: uc.NEW_LABEL_DLG_STORE_NAME } );
		dlg.data.bSaveRect = dlg.isBuiltIn;

		rpd.panel.appendDialog ( dlg );

		dlg.panel.addControl ( uLabel.createLabelData ( { rpd: rpd,
															x: 20, y: 20, w: 60, h: 15, name:  		'lblLabelName',
																						text:  		'Label Name:',
																						vertAlign: 	'top',
																						horzAlign: 	'left' } ) );
		dlg.panel.addControl ( uInput.createInputData ( { rpd: rpd,
															x: 80, y: 20, w: 80, h: 15, name:  'edtLabelName',
																						value: args.label.data.name } ) );

		dlg.panel.addControl ( uLabel.createLabelData ( { rpd: rpd,
															x: 20, y: 40, w: 60, h: 15, name:  		'lblLabelText',
																							text:  		'Label Text:',
																						vertAlign: 	'top',
																						horzAlign: 	'left' } ) );
		dlg.panel.addControl ( uInput.createInputData ( { rpd: rpd,
															x: 80, y: 40, w: 80, h: 15, name:  'edtLabelText',
																						value: args.label.data.text } ) );

		dlg.panel.addControl ( uLabel.createLabelData ( { rpd: rpd,
															x: 20, y: 60, w: 60, h: 15, name:  		'lblLabelFontName',
																							text:  		'Font Name:',
																						vertAlign: 	'top',
																						horzAlign: 	'left' } ) );
		dlg.panel.addControl ( uInput.createInputData ( { rpd: rpd,
															x: 80, y: 60, w: 80, h: 15, name:  'edtLabelFontName',
																						value: args.label.data.ff } ) );

		dlg.panel.addControl ( uLabel.createLabelData ( { rpd: rpd,
															x: 20, y: 80, w: 60, h: 15, name:  		'lblLabelFontSize',
																							text:  		'Font Size:',
																						vertAlign: 	'top',
																						horzAlign: 	'left' } ) );
		dlg.panel.addControl ( uInput.createInputData ( { rpd: rpd,
															x: 80, y: 80, w: 80, h: 15, name:  'edtLabelFontSize',
																						value: '' + args.label.data.fs } ) );

		dlg.panel.addControl ( uButton.createButtonData ( { rpd: rpd,
															x: 20, y: 100, w: 60, h: 20, name: 	'btnOK',
																							 text: 	'OK',
																							 cb: 	onOK } ) );

		dlg.panel.addControl ( uButton.createButtonData ( { rpd: rpd,
															x: 90, y: 100, w: 60, h: 20, name: 	'btnCancel',
																							 text: 	'Cancel',
																							 cb: 	onCancel } ) );
	};	//	newLabelDialog()


	svc.showGridDialog = function ( args ) {
		var sW = args.sC + ' ' + serviceId + ' showGridDialog()';
		var rpd   = args.rpd,
			dlg   = { isBuiltIn: 		true,
						invokingPanel: 	args.forPanel,
						data: 			null,
						panel: 			null },
			cd    = null; 				//	control data

		function onOK() {
			var sW2 = sW + ' onOK()';
			cmn.log ( sW2 );

			rpd.panel.removeDialog ( dlg );
		}	//	onOK()
		
		function onCancel() {
			var sW2 = sW + ' onCancel()';
			cmn.log ( sW2 );
			rpd.panel.removeDialog ( dlg );
		}	//	onCancel()
		
		var o = uSL.getLoadSpec ( rpd,
									{ sW: 		sW, 
									uduiId: 	args.uduiId, 
									panelSvc: 	uPanel, 
									dlg: 		dlg, 
									board: 		null,
									storeId: 	uc.GRID_DLG_STORE_ID, 
									storeName: 	uc.GRID_DLG_STORE_NAME } );

		uSL.loadPanel ( rpd, o );

		if ( o.panel ) {
			if ( (cd = o.panel.getControlDataByName ( 'btnOK' )) !== null )
				cd.cb = onOK;
			if ( (cd = o.panel.getControlDataByName ( 'btnCancel' )) !== null )
				cd.cb = onCancel;
			o.panel.setCheckBox ( 'chkEnabled',  args.forPanel.data.grid.isEnabled );
			o.panel.setCheckBox ( 'chkVisible',  args.forPanel.data.grid.isVisible );
			o.panel.setInput ( 'edtXSpacing',  args.forPanel.data.grid.spaceX );
			o.panel.setInput ( 'edtYSpacing',  args.forPanel.data.grid.spaceY );
			return;
		}

		var w = 200;
		var h = 140;
		var x = Math.round ( (rpd.w - w) / 2 );
		var y = Math.round ( (rpd.h - h) / 2 );

		dlg.data = uPanel.createAppPanelData ( { rpd:		rpd,
												 x: 		x + uc.OFFS_4_1_PIX_LINE, 
										 		 y: 		y + uc.OFFS_4_1_PIX_LINE, 
												 w: 		w, 
												 h: 		h, 
												 name: 		'pnlGrid', 
												 clickCB: 	uc.appPanelClick, 
												 	 storeId: 	uc.GRID_DLG_STORE_ID,
												 storeName: uc.GRID_DLG_STORE_NAME } );
		dlg.data.bSaveRect = dlg.isBuiltIn;

		rpd.panel.appendDialog ( dlg );

		dlg.panel.addControl ( uCheckbox.createCheckBoxData ( { rpd: rpd,
																x: 20, y: 20, w: 60, h: 15, name:  'chkEnabled',
																								text:  'Enabled',
																								value: args.forPanel.data.grid.isEnabled } ) );

		dlg.panel.addControl ( uCheckbox.createCheckBoxData ( { rpd: rpd,
																x: 20, y: 20, w: 60, h: 15, name:  'chkVisible',
																								text:  'Visible',
																								value: args.forPanel.data.grid.isVisible } ) );

		dlg.panel.addControl ( uLabel.createLabelData ( { rpd: rpd,
															x: 20, y: 20, w: 60, h: 15, name:  'lblXSpacing',
																							text:  'X Spacing:' } ) );
		dlg.panel.addControl ( uInput.createInputData ( { rpd: rpd,
															x: 80, y: 20, w: 80, h: 15, name:  'edtXSpacing',
																						value: '' + args.forPanel.data.grid.spaceX } ) );

		dlg.panel.addControl ( uLabel.createLabelData ( { rpd: rpd,
															x: 20, y: 20, w: 60, h: 15, name:  'lblYSpacing',
																							text:  'Y Spacing:' } ) );
		dlg.panel.addControl ( uInput.createInputData ( { rpd: rpd,
															x: 80, y: 20, w: 80, h: 15, name:  'edtYSpacing',
																						value: '' + args.forPanel.data.grid.spaceY } ) );

		dlg.panel.addControl ( uButton.createButtonData ( { rpd: rpd,
															x: 20, y: 60, w: 60, h: 20, name: 	'btnOK',
																							text: 	'OK',
																							cb: 	onOK } ) );

		dlg.panel.addControl ( uButton.createButtonData ( { rpd: rpd,
															x: 80, y: 60, w: 60, h: 20, name: 	'btnCancel',
																							text: 	'Cancel',
																							cb: 	onCancel } ) );
	};	//	showGridDialog()




	svc.showPropertiesDialog = function ( args ) {							//	obsolete?  see showPropertiesBoard()
		var sW = args.sC + ' ' + serviceId + ' showPropertiesDialog()';
		var rpd   = args.rpd,
			dlg   = { isBuiltIn: 		true,
						invokingPanel: 	args.forPanel,
						data: 			null,
						panel: 			null },
			cd    = null; 				//	control data

		function onOK() {
			var sW2 = sW + ' onOK()';
			cmn.log ( sW2 );
	//		var pd = savePanelData;
	//		var cd = dlg.panel.getControlDataByName ( 'edtSaveAs' );
	//		pd.storeName = cd.value;
	//		cmn.log ( sW2 + ':  storeName: ' + pd.storeName );
	//		uSL.storePanel ( sW2, 
	//						 args.udui,
	//						 pd );
			rpd.panel.removeDialog ( dlg );
		}	//	onOK()
		
		function onCancel() {
			var sW2 = sW + ' onCancel()';
			cmn.log ( sW2 );
			rpd.panel.removeDialog ( dlg );
		}	//	onCancel()
		
		var o = uSL.getLoadSpec ( rpd,
									{ sW: 		sW, 
									udui: 		args.udui, 
									panelSvc: 	uPanel, 
									dlg: 		dlg, 
									board: 		null,
									storeId: 	uc.PROPERTIES_DLG_STORE_ID, 
									storeName: 	uc.PROPERTIES_DLG_STORE_NAME } );
		
		uSL.loadPanel ( rpd, o );

		if ( o.panel ) {
			if ( (cd = o.panel.getControlDataByName ( 'btnOK' )) !== null )
				cd.cb = onOK;
			if ( (cd = o.panel.getControlDataByName ( 'btnCancel' )) !== null )
				cd.cb = onCancel;
			return;
		}

		var w = 280;
		var h = 200;
		var x = Math.round ( (rpd.w - w) / 2 );
		var y = Math.round ( (rpd.h - h) / 2 );

		dlg.data = uPanel.createAppPanelData ( { rpd:		rpd,
												 x: 		x + uc.OFFS_4_1_PIX_LINE, 
										 		 y: 		y + uc.OFFS_4_1_PIX_LINE, 
												 w: 		w, 
												 h: 		h, 
												 name: 		'pnlProperties', 
												 clickCB: 	uc.appPanelClick, 
												 	 storeId: 	uc.PROPERTIES_DLG_STORE_ID,
												 storeName: uc.PROPERTIES_DLG_STORE_NAME } );
		dlg.data.bSaveRect = dlg.isBuiltIn;

		rpd.panel.appendDialog ( dlg );


		var tableD, table, panelD, panel;		//	Properties Table

		//	two columns' width is adjusted by designating a middle column that splits the
		//	the two - the middle column's width is small and fixed - the user drags it like
		//	a splitter
		var nCols    = 3;				//	total number of table columns
		var nAdjCols = nCols - 1;		//	number of columns whose width is adjustable
		var adjColW  = 40;				//	starting width of all adjustable columns

		//	3 is the paddingLeft of all cells (see CSS .u34-table-fo-body-div-table tbody tr td)
		var tableW = (nCols * 3) + (nAdjCols * adjColW);	

		var panelW = tableW + 16;		//	+ 16 for the panel's borders and vertical "scroll bar"
		//
		//	or, if panelW is specified, then -
		//		
		//		adjColW = (panelW - 16 - (nCols * 3)) / nAdjCols;

		panelD = uPanel.createPanelData ( { rpd:		rpd,
											x: 			10 + uc.OFFS_4_1_PIX_LINE,
												y: 			10 + uc.OFFS_4_1_PIX_LINE, 
												w: 			panelW, 
												h: 			140, 
												name: 		'pnlProps', 
												clickCB: 	null } );
		panel = dlg.panel.addControl ( panelD );

		tableD = uTable.createTableData ( { rpd:	rpd,
											x: 		0,  
											y: 		0, 
											w: 		60,  
											h: 		60, 
											name: 	'tblProps',
											title: 	'Probably Don\'t Need A Title Here' } );

		var styleCell0div = uTable.createStyle ( { name: 'styleCell0div' } );		//	was implemented with u34-table-td-prop-name
			styleCell0div.list.push ( { property: 'display',    value: 'inline-block' } );
			styleCell0div.list.push ( { property: 'overflowX',  value: 'hidden' } );
			styleCell0div.list.push ( { property: 'paddingTop', value: '4px' } );
			styleCell0div.list.push ( { property: 'width',      value: '' + adjColW + 'px' } );
			styleCell0div.list.push ( { property: 'whiteSpace', value: 'nowrap' } );
		var styleCell0td = uTable.createStyle ( { name: 'styleCell2td' } );		//	was implemented with u34-table-td-prop-value
			styleCell0td.list.push ( { property: 'borderRight', value: 'transparent' } );
		var styleCell1td = uTable.createStyle ( { name: 'styleCell1td' } );		//	was implemented with u34-table-column-splitter
			styleCell1td.list.push ( { property: 'borderLeft',      value: 'none' } );
			styleCell1td.list.push ( { property: 'borderRight',     value: 'none' } );
			styleCell1td.list.push ( { property: 'cursor',          value: 'col-resize' } );
			styleCell1td.list.push ( { property: 'backgroundColor', value: 'lightgray' } );
		var styleCell2div = uTable.createStyle ( { name: 'styleCell2div' } );		//	was implemented with u34-table-td-prop-name
			styleCell2div.list.push ( { property: 'display',    value: 'inline-block' } );
			styleCell2div.list.push ( { property: 'overflowX',  value: 'hidden' } );
			styleCell2div.list.push ( { property: 'paddingTop', value: '4px' } );
			styleCell2div.list.push ( { property: 'width',      value: '' + adjColW + 'px' } );
		var styleCell2td = uTable.createStyle ( { name: 'styleCell2td' } );		//	was implemented with u34-table-td-prop-value
			styleCell2td.list.push ( { property: 'borderLeft', value: 'transparent' } );


		uTable.createColumn ( { tableData: 	tableD,
								iCol: 		0, 
								colStyle: 	null } );
		uTable.createColumn ( { tableData: 	tableD,
								iCol: 		1, 
								colStyle: 	null } );
		uTable.createColumn ( { tableData: 	tableD,
								iCol: 		2, 
								colStyle: 	null } );


		var commonCell0 = { tableData: 	tableD,
							iCol: 		0, 
							divStyle: 	styleCell0div,
							tdStyle: 	styleCell0td,
							hasDiv: 	true,
							isSplitter: false };
		var commonCell1 = { tableData: 	tableD,
							iCol: 		1, 
							divStyle: 	null,
							tdStyle: 	styleCell1td,
							hasDiv: 	false,
							isSplitter: true };
		var commonCell2 = { tableData: 	tableD,
							iCol: 		2, 
							divStyle: 	styleCell2div,
							tdStyle: 	styleCell2td,
							hasDiv: 	true,
							isSplitter: false };

		var i, r, rows = [
			{ propDescription: 'name',               propValue: 'lblCount' },
			{ propDescription: 'x',                  propValue: '10' },
			{ propDescription: 'y',                  propValue: '20' },
			{ propDescription: 'width',              propValue: '80' },
			{ propDescription: 'height',             propValue: '15' },
			{ propDescription: 'has border',         propValue: 'false' },
			{ propDescription: 'font',               propValue: 'verdanna' },
			{ propDescription: 'font size',          propValue: '12' },
			{ propDescription: 'color',              propValue: 'black' },
			{ propDescription: 'background color',   propValue: 'white' },
		];

		tableD.rows = [];

		for ( i = 0; i < rows.length; i++ ) {
			r = { id: 'r' + i, 
					row: [ uTable.createCell ( commonCell0, { iRow: i, text: rows[i].propDescription } ),      
						 uTable.createCell ( commonCell1, { iRow: i, isSplitter: true, mouseDown: true, mouseMove: true, mouseUp: true } ), 
						 uTable.createCell ( commonCell2, { iRow: i, text: rows[i].propValue } ) ] };
			tableD.rows.push ( r );
		}

		tableD.fillsPanel = true;
		table = panel.addControl ( tableD );
		panelD.filledBy = table;
		panelD.onSize ( panelD, null, null, 0, 0 );


		dlg.panel.addControl ( uButton.createButtonData ( { rpd: rpd,
															x: 		20,
																y: 		160,
																w: 		60,  
																h: 		20, 
																name: 	'btnOK',
																text: 	'OK',
																cb: 	onOK } ) );
		dlg.panel.addControl ( uButton.createButtonData ( { rpd: rpd,
															x: 		100,
																y: 		160,
																w: 		60,  
																h: 		20, 
																name: 	'btnCancel',
																text: 	'Cancel',
																cb: 	onCancel } ) );
	};	//	showPropertiesDialog()


	svc.showLoginDialog = function ( args ) {
		var sW = args.sC + ' ' + serviceId + ' showLoginDialog()';
		var rpd   = args.rpd,
			dlg   = { isBuiltIn: 		true,
						invokingPanel: 	args.forPanel,
						data: 			null,
						panel: 			null },
			cd    = null; 				//	control data

		//	2017-Aug
		//
		//	This is an app dialog.  Probably not in LS. Nor in any storage.
		//
		//	Loaded from the server and then probably cached.
		//
		//	If the user has policy app-admin set then editable.  Which, in that case, storable
		//	back to the server.
		//
		var o = uSL.getLoadSpec ( rpd,
									{ sW: 		sW, 
									uduiId: 	args.uduiId, 
									panelSvc: 	uPanel, 
									dlg: 		dlg, 
									board: 		null,
									storeId: 	uc.LOGIN_DLG_STORE_ID, 
									storeName: 	uc.LOGIN_DLG_STORE_NAME } );
		o.parentPanel = args.forPanel;
		uSL.loadPanel ( rpd, o );

		if ( o.panel ) {
			o.panel.data.clickCB = uc.appPanelClick;

			if ( (cd = o.panel.getControlDataByName ( 'btnOK' )) !== null )
				cd.cb = args.onOK;
			if ( (cd = o.panel.getControlDataByName ( 'btnCancel' )) !== null )
				cd.cb = args.onCancel;

		//	o.panel.setCheckBox ( 'chkEnabled',  args.forPanel.data.grid.isEnabled );
		//	o.panel.setCheckBox ( 'chkVisible',  args.forPanel.data.grid.isVisible );
		//	o.panel.setInput ( 'edtXSpacing',  args.forPanel.data.grid.spaceX );
		//	o.panel.setInput ( 'edtYSpacing',  args.forPanel.data.grid.spaceY );

			dlg.panel = o.panel;
			dlg.data  = o.panel.data;
			return dlg;
		}

		var w = 400;
		var h = 280;
		var x = Math.round ( (rpd.w - w) / 2 );		//	Center in the root panel.
		var y = Math.round ( (rpd.h - h) / 2 );

		dlg.data = uPanel.createAppPanelData ( { rpd:		rpd,
												 x: 		x + uc.OFFS_4_1_PIX_LINE, 
										 		 y: 		y + uc.OFFS_4_1_PIX_LINE, 
												 w: 		w, 
												 h: 		h, 
												 name: 		'pnlLogin', 
												 clickCB: 	uc.appPanelClick, 
												 	 storeId: 	uc.LOGIN_DLG_STORE_ID,
												 storeName: uc.LOGIN_DLG_STORE_NAME,
												 bMoveRect: false,
												 bSizeRect: false,
												 bVertSB: 	false,
												 bHorzSB: 	false } );
		dlg.data.bSaveRect = dlg.isBuiltIn;

		args.forPanel.appendDialog ( dlg );


		dlg.panel.addControl ( uButton.createButtonData ( { rpd: rpd,
															x: 30,     y: h - 50, w: 60, h: 20, 
															name: 	'btnOK',
																text: 	'OK',
																cb: 	args.onOK } ) );

		dlg.panel.addControl ( uButton.createButtonData ( { rpd: rpd,
															x: w - 90, y: h - 50, w: 60, h: 20, 
															name: 	'btnCancel',
																text: 	'Cancel',
																cb: 	args.onCancel } ) );
		return dlg;

	};	//	showLoginDialog()



	return svc;

})();
