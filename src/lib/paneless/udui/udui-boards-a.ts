
//	These are not dialogs where other parts of the app are screened so
//	that the user can not interact with them while the dialog is active.
//
//	Instead these are displayed - either floating or docked - and possibly
//	left showing when the user is not interacting with them - to control 
//	some ... and/or modify something.  And these might be used to show 
//	status - values - of something - i.e., some controls in these may be
//	"read only".

import { cmn }			from '../common';
import { uc } 			from './udui-common';
import { uSL } 			from './udui-store-load-a';
import { uPanel } 		from './udui-panel-f';
import { uTable } 		from './udui-table-a';

let uBoards = ( function() {

	'use strict';

	var serviceId = 'uduiBoardsA';

	/* jshint validthis: true */

	let O = {
	//	bInitialized:	false,
	//	init:			init,
	//	getLastPE_Id:	getLastPE_Id,
	//	setLastPE_Id:	setLastPE_Id,
	//	newPE:			newPE,

		createBoard:	createBoard
	};

	let lastBoard_Id = 0;

function Board ( rgs ) {

	var self = this;

	self.boardType	= rgs.type;
	self.rpd 		= rgs.rpd;
	self.x 			= rgs.x;
	self.y 			= rgs.y;
	self.hasBorder	= rgs.hasBorder;

	self.propertiesTable = null;

	self.spec = { isBuiltIn: 		true,
				  panelData:		null,
				  panel: 			null };

	self.prpsOfFrameId	= 0;
	self.prpsOfPaneId	= 0;

	self.createPropertiesTable = function() {
		var sW  = serviceId + ' createPropertiesTable()';
		var tableName = 'tblProps';
		var tableD, panel;		//	Properties Table

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

		var w = panelW;
		var h = 150;
		var x = (typeof self.x === 'number') ? self.x : Math.round ( (self.rpd.w - w) / 2 );
		var y = (typeof self.y === 'number') ? self.y : Math.round ( (self.rpd.h - h) / 2 );

		function onClose() {
			var sW = serviceId + ' onClose()';
			uSL.storePanel ( sW, self.rpd.uduiId, self.spec.panelData );
			self.spec.panelData  = null;
			self.spec.panel		 = null;
			self.propertiesTable = null;
		}	//	onClose()

		var o = uSL.getLoadSpec ( self.rpd,
								  { sW: 		sW, 
									uduiId: 	self.rpd.uduiId, 
									panelSvc: 	uPanel, 
									dlg: 		null, 
									board: 		self.spec,
									storeId: 	uc.PROPERTIES_BOARD_STORE_ID, 
									storeName: 	uc.PROPERTIES_BOARD_STORE_NAME } );
	//	o.ctrls = 'none';		//	do not load child controls. just the panel.
		uSL.loadPanel ( self.rpd, o );
		if ( ! o.panel ) {
			self.spec.panelData = uPanel.createAppPanelData ( { 
				rpd:			self.rpd ? self.rpd : null,
				x: 				x + uc.OFFS_4_1_PIX_LINE, 
				y: 				y + uc.OFFS_4_1_PIX_LINE, 
				w: 				w, 
				h: 				h, 
				name: 			'pnlProperties', 
				clickCB: 		uc.appPanelClick, 
				storeId: 		uc.PROPERTIES_BOARD_STORE_ID,
				storeName: 		uc.PROPERTIES_BOARD_STORE_NAME,
				hasCloseBox: 	true,
				closeCB: 		onClose,
				hasBorder:		self.hasBorder } );

			self.spec.panelData.bSaveRect = self.spec.isBuiltIn;

			self.spec.panel = self.rpd.panel.appendBoard ( self.spec );

			tableD = uTable.createTableData ( { rpd:	self.rpd,
												x: 		0,  
												y: 		0, 
												w: 		60,  
												h: 		60, 
												name: 	tableName,
												title: 	'' } );

		//	var	styleCell0div = tableD.createStyle ( { name: 'styleCell0div' } );
		//		styleCell0div.list.push ( { property: 'display',    value: 'inline-block' } );
		//		styleCell0div.list.push ( { property: 'overflow-x',  value: 'hidden' } );
		//		styleCell0div.list.push ( { property: 'padding-top', value: '4px' } );
		//		styleCell0div.list.push ( { property: 'width',      value: '' + adjColW + 'px' } );
		//		styleCell0div.list.push ( { property: 'white-space', value: 'nowrap' } );
		//	var	styleCell0td = tableD.createStyle ( { name: 'styleCell2td' } );					//	should be 'styleCell0td' ?
		//		styleCell0td.list.push ( { property: 'border-right', value: 'transparent' } );
		//	var	styleCell1td = tableD.createStyle ( { name: 'styleCell1td' } );
		//		styleCell1td.list.push ( { property: 'border-left',      value: 'none' } );
		//		styleCell1td.list.push ( { property: 'border-right',     value: 'none' } );
		//		styleCell1td.list.push ( { property: 'cursor',          value: 'col-resize' } );
		//		styleCell1td.list.push ( { property: 'background-color', value: 'lightgray' } );
		//	var	styleCell2div = tableD.createStyle ( { name: 'styleCell2div' } );
		//		styleCell2div.list.push ( { property: 'display',    value: 'inline-block' } );
		//		styleCell2div.list.push ( { property: 'overflow-x',  value: 'hidden' } );
		//		styleCell2div.list.push ( { property: 'padding-top', value: '4px' } );
		//		styleCell2div.list.push ( { property: 'width',      value: '' + adjColW + 'px' } );
		//	var	styleCell2td = tableD.createStyle ( { name: 'styleCell2td' } );
		//		styleCell2td.list.push ( { property: 'border-left', value: 'transparent' } );
		//
		//	tableD.createColumn ( { iCol: 			0, 
		//							name: 			'property-name',
		//							colStyleId:		0,
		//							divStyleId: 	styleCell0div.id,
		//							tdStyleId: 		styleCell0td.id,
		//							hasDiv: 		true,
		//							isSplitter: 	false } );
		//	tableD.createColumn ( { iCol: 			1, 
		//							name: 			'splitter',
		//							colStyleId: 	0,
		//							divStyleId: 	0,
		//							tdStyleId: 		styleCell1td.id,
		//							hasDiv: 		false,
		//							isSplitter: 	true } );
		//	tableD.createColumn ( { iCol: 			2, 
		//							name: 			'property-value',
		//							colStyleId: 	0,
		//							divStyleId: 	styleCell2div.id,
		//							tdStyleId: 		styleCell2td.id,
		//							hasDiv: 		true,
		//							isSplitter: 	false } );
		//	//
			tableD.createColumns ( { nCols:		2,
									 adjColW: 	adjColW,
									 colNames: 	['property-name', 
										 		 'property-value'], } );

		} else {
			tableD = self.spec.panelData.getControl ( uc.TYPE_TABLE, tableName );
			self.spec.panelData.closeCB = onClose;
		}

		tableD.fillsPanel = true;

		self.propertiesTable = self.spec.panel.addControl ( tableD );

		self.spec.panelData.filledBy = self.propertiesTable;	

		return tableD;
	}	//	createPropertiesTable()

	self.showProperties = function ( rgs: any ) {
		var sW = rgs.sC + ' ' + serviceId + ' showProperties()';

		if ( ! rgs.ofCtrlD ) {		//	If clearing ...
			//	and current properties not that of what is clearing ..
			if ( 	(rgs.ofFrameId !== self.prpsOfFrameId)
				 || (rgs.ofPaneId  !== self.prpsOfPaneId ) ) {
				return; } }

		self.prpsOfFrameId = rgs.ofFrameId;
		self.prpsOfPaneId  = rgs.ofPaneId;

		var o, tableD = null;

		tableD = self.propertiesTable.data;

		tableD.rows = [];		//	in the table.update() the existing <tr> elements will be removed

		var i = 0, cells, props = [];

		if ( uc.isObject ( rgs.ofCtrlD ) ) {
			props = rgs.ofCtrlD.listProperties(); }

		for ( i = 0; i < props.length; i++ ) {
			let longCB = cmn.isFunction ( props[i].longTextCB )
								? props[i].longTextCB
								: null;
			cells = [ tableD.createCell ( { iCol: 0, iRow: i }, 
										  { text: props[i].displayName } ),      
					  tableD.createCell ( { iCol: 1, iRow: i }, 
						  				  { isSplitter: true } ),
					  tableD.createCell ( { iCol: 2, iRow: i }, 
						  				  { input: { 
											  value: '' + props[i].value,
										  	  type:		  props[i].type,
										  	  step:	 '' + props[i].step,
										      longCB:     longCB } } ) ];
			tableD.createRow ( { cells: cells } );
		}	



	//	if ( ! self.propertiesTable ) {
	//		tableD.fillsPanel = true;
	//		if ( tableD.table ) {			//	board was probably just loaded from storage
	//			self.propertiesTable = tableD.table;
	//			self.propertiesTable.update ( { bFirstUpdate: true } );		//	first update after rows added
	//			//
	//			//	note - "first update" is probably a misnomer - one of the important things done in
	//			//			update() is calculating the relative sizes of columns if those sizes have not
	//			//			already been calculated
	//			//
	//			//	if rows previously existed then the column widths will already have been set so update()
	//			//	does not need to calculate relative column widths - in fact, we probably want those to be 
	//			//	as they were for the previous rows
	//			//	
	//			//	if the board has just been loaded from storage update() will have been called when the
	//			//	table was defined - so this will not be the first update() call - but at the first call
	//			//	no rows will have been defined and therefore update() could not have set the relative 
	//			//	column widths - so, here, we call update() again, after the rows are added, as if it is the 
	//			//	first update.
	//		}
	//		else {
	//			self.propertiesTable = self.spec.panel.addControl ( tableD ); }
	//		self.spec.panelData.filledBy = self.propertiesTable;	
	//	} else {
	//		self.propertiesTable.update(); }
		self.propertiesTable.update ( { bFirstUpdate: true } );

		self.spec.panelData.onSize ( self.spec.panelData, -1, null, 0, 0 );

		self.propertiesTable.data.setTitle ( rgs.title );

		function update ( name, value ) {
			var i, sW = serviceId + ' update()';
			for ( i = 0; i < props.length; i++ )
				if ( props[i].property === name ) {
					tableD.setCell ( i, 2, value );
					break;
				}
		}	//	update()

		function onInput ( cellD, value ) {
			if ( ! uc.isObject ( rgs.ofCtrlD ) ) {
				return; }
			var name = props[cellD.iRow].property;
			rgs.ofCtrlD.setProperty ( name, value );
		}	//	onInput()

		function onChange ( cellD, value ) {

		}	//	onChange()

		if ( uc.isObject ( rgs.ofCtrlD ) ) {
			rgs.ofCtrlD.propCB = update;

			self.propertiesTable.data.inputCB  = onInput;
			self.propertiesTable.data.changeCB = onChange; }
		else {
			self.propertiesTable.data.inputCB  = null;
			self.propertiesTable.data.changeCB = null; }

		return self.spec.panel;

	};	//	showProperties()

	self.showSplitterProperties = function ( rgs ) {
		var sW = rgs.sC + ' ' + serviceId + ' showSplitterProperties()';

		//	For the splitters - rgs is like -
		//		{ sC: 			<the calling function>
		//		  ofFrameId:	<the frame containing the split pane>
		//		  ofPaneId:		<the split pane>
		//		  properties:	<an array of {name, value}>
		//		  title:		,
		//		  splitterFnc:	<call back to set property in the splitter> }

		if ( ! rgs.properties) {		//	If clearing ...
			//	and current properties not that of what is clearing ..
			if ( 	(rgs.ofFrameId !== self.prpsOfFrameId)
				 || (rgs.ofPaneId  !== self.prpsOfPaneId ) ) {
				return; } }

		self.prpsOfFrameId = rgs.ofFrameId;
		self.prpsOfPaneId  = rgs.ofPaneId;

		var o, tableD = null;

		tableD = self.propertiesTable.data;

		tableD.rows = [];		//	in the table.update() the existing <tr> elements will be removed

		var i = 0, cells, props = [];
		
		if ( rgs.properties ) {
			props = rgs.properties; }

		for ( i = 0; i < props.length; i++ ) {
			cells = [ tableD.createCell ( { iCol: 0, iRow: i }, 
										  { text: props[i].name } ),      
					  tableD.createCell ( { iCol: 1, iRow: i }, 
						  				  { isSplitter: true } ),
					  tableD.createCell ( { iCol: 2, iRow: i }, 
						  				  { input: { value: '' + props[i].value } } ) ];
			tableD.createRow ( { cells: cells } );
		}	



		self.propertiesTable.update ( { bFirstUpdate: true } );

		self.spec.panelData.onSize ( self.spec.panelData, -1, null, 0, 0 );

		self.propertiesTable.data.setTitle ( rgs.title );

		function onInput ( cellD, value ) {
			if ( ! uc.isFunction ( rgs.splitterFnc ) ) {
				return; }
			if ( value === 'null' ) {
				value = null; }
			var name = props[cellD.iRow].name;
			rgs.splitterFnc ( { do:			'set-property',
								propName:	name,
								propValue:	value } );
		}	//	onInput()

		function onChange ( cellD, value ) {

		}	//	onChange()

		if ( uc.isFunction ( rgs.splitterFnc) ) {
			self.propertiesTable.data.inputCB  = onInput;
			self.propertiesTable.data.changeCB = onChange; }
		else {
			self.propertiesTable.data.inputCB  = null;
			self.propertiesTable.data.changeCB = null; }

		return self.spec.panel;

	};	//	showSplitterProperties()

}	//	Board()

	function createBoard ( rgs ) {
		const sW = serviceId + ' createBoard()';
		cmn.log ( sW, ' Type: ' + rgs.type );
		let board = new Board ( rgs );
		board.createPropertiesTable();
		return board;
	}	//	createBoard()

	return O;

})();

export { uBoards as default };

