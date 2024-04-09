
//  app/partials/udui/udui-shift-click-a.js

//	Clicking on a control while holding the shift key down pops up a menu.
//
//	The menu items will depend on the control.
//
//	This functionality for the panel was implemented in the shiftClickPanel() function
//	of bootstrap.js.

import * as d3 			from 'd3';

import { cmn }			from '../common';
import { uc } 			from './udui-common';

import { uButton } 		from './udui-button-e';
import { uCheckbox } 	from './udui-checkbox-b';
import { uInput } 		from './udui-input-b';
import { uLabel } 		from './udui-label-b';
import { uTextarea }	from './udui-textarea-a';
import { uList } 		from './udui-list-b';
import { uTree } 		from './udui-tree-a';
import { uGraph }		from './udui-graph-a';
import { uTabs } 		from './udui-tabs-a';
import { uTable } 		from './udui-table-a';
import { uPanel } 		from './udui-panel-f';
import { uDialog } 		from './udui-dialogs-a';
import { uSL }			from './udui-store-load-a';

export var uShiftClick = (function() { 

	'use strict';

	var serviceId = 'uShiftClick';

	/* jshint validthis: true */

	var svc: any = {};

	svc.copiedControls = null;

	svc.shiftClickPanel = function ( evt: PoineteEvent, 
									 panelData, baseX, baseY ) {
		var sW  = serviceId + ' shiftClickPanel()';
		let rpd = panelData.rpd ? panelData.rpd : panelData;

		//	2022-Aug	This appears to only be used by createRootPanel() in
		//				properties.svelte.
		//				Some of this has (useful) has not been reimplemented
		//				below yet in  svc.shiftClickControl().

		var lcl = uc.localXY ( panelData, evt.offsetX, 
										  evt.offsetY, 
										  baseX, baseY );

		cmn.log ( sW, '  root panel eleId: ' + rpd.eleId + '  X Y: ' + lcl.x + '  ' + lcl.y );

		//	Want to bring up a dialog.  As in udui-dialog-a-directive.js.
		//
		//	But - instead of screening the invoking panel - we -
		//
		//		Screen all  * but *  the invoking panel.  
		//
		//		This dialog is intended to edit the controls on the invoking dialog.
		//
		//		Put the invoking panel on top of the Z order (it might be already).
		//
		//		Put this dialog on top of the invoking panel (on top of everything).
		//
		//	The invoking panel can not be the root panel.  The root panel's controls 
		//	can only be sized and moved.  The root panel's controls, therefore, do not
		//	require this dialog.  Right?

		var	screenPanel = null;		//	A screen for the popup menu - it might be transparent -
		var menuX = evt.offsetX - uc.offsX;
		var menuY = evt.offsetY - uc.offsY;
		var listMenu = null;

		function clickScreen ( d, i, ele ) {
			var sW = serviceId + ' shiftClickPanel()  clickScreen()';
			cmn.log ( sW );
			uc.downAppScreen ( rpd );		//	The menu is removed because it is a child of 
											//	the screen.
		}	//	clickScreen()

		//	Use a panel for the screen (a kind of a shield) - so that -
		//
		//		the list is a child of the screen
		//
		//		the list can be moved by panning this screen panel
		//
		screenPanel = uc.upAppScreen ( { sc: 		sW,
									//	 panelSvc: 	uPanel,
										 rpd:		rpd,
										 clickCB: 	clickScreen,
										 baseClass: 'u34-popupmenu-screen',
										 w:			panelData.w,
										 h:			panelData.h } );
		//	A menu -
		//
		//		Add Control 		>	Button
		//								Edit
		//								Label
		//								List
		//								Panel
		//		Properties ...
		//
		//	Implement a Menu with a List control -
		//
		//		Each item in the list is a Menu Item.
		//
		//		Submenus are additional lists.
		//
		//	Arrow keys and menu item hot keys select a menu item.
		//
		//	The list disappears when the user -
		//
		//		Clicks anywhere
		//		or
		//		Hits the Esc key
		//		or
		//		Hits a menu item hot key or Enter

	//	//	Remove the menu -
	//	if ( listMenu ) {
	//		removeMenu();
	//		return;
	//	}

		function removeMenu() {
			var sW = serviceId + ' shiftClickPanel() removeMenu()';
	//			cmn.log ( sW );
			uc.downAppScreen ( rpd );		screenPanel = null;
			listMenu = null;
		}	//	removeMenu()

		function itemClick ( evt, itemData ) {
			var sW = serviceId + ' shiftClickPanel() itemClick()';
			var ld = itemData.ld,					//	ld: listData
				subListData, subMenu, subX, subY;
			evt.stopPropagation();
	//			cmn.log ( sW, itemData.text );

			function subItemClick ( evt, subItemData ) {
				var sW = serviceId + ' shiftClickPanel() itemClick() subItemClick()';
				evt.stopPropagation();
	//				cmn.log ( sW, subItemData.text );

				var rrePanel = null;

	//			function splitHorz() {
	//				var sW = serviceId + ' shiftClickPanel() itemClick() subItemClick() splitHorz()';
	//			//		cmn.log ( sW );
	//				rrePanel.splitHorz();
	//			}	//	splitHorz()

	//			function splitVert() {
	//				var sW = serviceId + ' shiftClickPanel() itemClick() subItemClick() splitVert()';
	//			//		cmn.log ( sW );
	//				rrePanel.splitVert ( shiftClickPanel );
	//			}	//	splitVert()

				removeMenu();

				if ( subItemData.textId === 'button' ) {
					var buttonD = uButton.createButtonData ( 
						{ rpd: rpd, x: lcl.x, y: lcl.y, w: 75, h: 25, name: 'btnNew', text: 'New Button!', shiftClickCB: svc.shiftClickButton } );
					panelData.panel.addControl ( buttonD );
					buttonD.showPropertiesBoard ( 'New Button' );
				}
				else
				if ( subItemData.textId === 'checkbox' ) {
					var checkboxD = uCheckbox.createCheckBoxData ( 
						{ rpd: rpd, x: lcl.x, y: lcl.y, w: 100, h: 25, name: 'chkNew', text: 'New Checkbox' } );
					panelData.panel.addControl ( checkboxD );
					checkboxD.showPropertiesBoard ( 'New Checkbox' );
				}
				else
				if ( subItemData.textId === 'input' ) {
					var inputD = uInput.createInputData ( 
						{ rpd: rpd, x: lcl.x, y: lcl.y, w: 60, h: 30, name: 'edtNew', value: '' } );
					panelData.panel.addControl ( inputD );
			//		inputD.showPropertiesBoard ( 'New Input' );				disable while developing/testing tabs
				}
				else
				if ( subItemData.textId === 'label' ) {
					var labelD = uLabel.createLabelData ( 
						{ rpd: rpd, x: lcl.x, y: lcl.y, w: 75, h: 15, 
						  name:			'lblNew', 
						  text:			'new label', 
						  shiftClickCB: svc.shiftClickLabel } );
					panelData.panel.addControl ( labelD );
			//		labelD.showPropertiesBoard ( 'New Label' );				disable while developing/testing tabs
				}
				else
				if ( subItemData.textId === 'textarea' ) {
					var textareaD = uTextarea.createTextareaData ( 
						{ rpd: rpd, x: lcl.x, y: lcl.y, w: 60, h: 30, name: 'txtNew', value: 'Wala. Textarea!' } );
					panelData.panel.addControl ( textareaD );
			//		textareaD.showPropertiesBoard ( 'New Textarea' );			disable while developing/testing tabs
				}
				else
				if ( subItemData.textId === 'list' ) {
					var listD = uList.createListData (
						{ rpd: rpd, x: lcl.x, y: lcl.y, w: 75, h: 100, name: 'lstNew' } );
					var list = panelData.panel.addControl ( listD );
					list.data.itemData.push ( uList.createListItemData ( 'bug-howard', 'Bug Howard' ) );
					list.data.itemData.push ( uList.createListItemData ( 'les-miles', 'Les Miles' ) );
					list.data.itemData.push ( uList.createListItemData ( 'ralph', 'Ralph' ) );
					list.data.itemData.push ( uList.createListItemData ( 'waldo', 'Waldo' ) );
					list.data.itemData.push ( uList.createListItemData ( 'emerson', 'Emerson' ) );
					list.data.itemData.push ( uList.createListItemData ( 'grace', 'Grace' ) );
					list.data.itemData.push ( uList.createListItemData ( 'hopper', 'Hopper' ) );
					list.data.itemData.push ( uList.createListItemData ( 'brad-dunagan', 'Brad Dunagan' ) );
					list.data.itemData.push ( uList.createListItemData ( 'linus', 'Linus' ) );
					list.data.itemData.push ( uList.createListItemData ( 'elija', 'Elija' ) );
					list.data.itemData.push ( uList.createListItemData ( 'bart', 'Bart' ) );
					list.data.itemData.push ( uList.createListItemData ( 'rosco', 'Rosco' ) );
					list.data.itemData.push ( uList.createListItemData ( 'jake', 'Jake' ) );
					list.update();
			//		listD.showPropertiesBoard ( 'New List' );				disable while developing/testing tabs
				}
				else
				if ( subItemData.textId === 'graph' ) {
					var graphD = uGraph.createGraphData ( 
						{ rpd: rpd, x: lcl.x, y: lcl.y, w: 75, h: 15, name: 'grfNew', shiftClickCB: svc.shiftClickGraph } );
					panelData.panel.addControl ( graphD );
				}
				else
				if ( subItemData.textId === 'tabs' ) {
					var tabsD = uTabs.createTabsData ( 
						{ rpd: rpd, x: lcl.x, y: lcl.y, w: 150, h: 150, name: 'tabsNew', panelSvc: uPanel } );
					panelData.panel.addControl ( tabsD );
					tabsD.showPropertiesBoard ( 'New Tab' );
				}
				else
				if ( subItemData.textId === 'table' ) {
					var tableD = uTable.createTableData ( 
						{ rpd: rpd, x: lcl.x, y: lcl.y, w: 175, h: 115, name: 'tblNew' } );
					var table = panelData.panel.addControl ( tableD );

	//					cmn.log ( sW, 'created table ' + table.name );
				}
				else
				if ( subItemData.textId === 'panel' ) {
					var panelD = uPanel.createPanelData ( 
						{ rpd:		rpd,
						  x: 		lcl.x + uc.OFFS_4_1_PIX_LINE,
						  y: 		lcl.y + uc.OFFS_4_1_PIX_LINE, 
						  w: 		200, 
						  h: 		 60, 
						  name: 	'control-panel', 
						  clickCB: 	svc.shiftClickPanel,
						  bMoveRect: 	true,
						  bSizeRect: 	true,
						  bVertSB: 		false,
						  bHorzSB: 		false,
						  hasConnectors:	true} );
					rrePanel = panelData.panel.addControl ( panelD );

				//	splitVert();			//	Just go ahead and split it.  Controls will be on the top panel.
				//	splitHorz();
				//	rrePanel.splitHorz ( svc.shiftClickPanel );
				}
			}	//	subItemClick()
			
			subX = ld.w;
			subY = 0;
			if ( itemData.textId === 'grid' ) {
				removeMenu();
				uDialog.showGridDialog ( { sC: 			sW,
										   uduiId: 		rpd.uduiId, 
										   forPanel: 	panelData.panel } );
			}
			else
			if ( itemData.textId === 'add-control' ) {
				subListData = uList.createListData ( { rpd:		rpd,
													   x: 		subX, 
													   y: 		subY,  
													   w: 		100,  
													   h: 		100, 
													   name: 	'add-control',
													   isMenu: 	true,
													   cb: 		subItemClick } );
				subMenu = listMenu.addSubMenu ( subListData );
				subMenu.data.itemData.push ( uList.createListItemData ( 'button',   '[B]utton' ) );
				subMenu.data.itemData.push ( uList.createListItemData ( 'checkbox', '[C]heckbox' ) );
				subMenu.data.itemData.push ( uList.createListItemData ( 'input',    '[I]nput' ) );
				subMenu.data.itemData.push ( uList.createListItemData ( 'label',    '[L]abel' ) );
				subMenu.data.itemData.push ( uList.createListItemData ( 'textarea', 'Te[x]tarea' ) );
				subMenu.data.itemData.push ( uList.createListItemData ( 'list',     'Li[s]t' ) );
				subMenu.data.itemData.push ( uList.createListItemData ( 'graph',    '[G]raph' ) );
				subMenu.data.itemData.push ( uList.createListItemData ( 'panel',    '[P]anel' ) );
				subMenu.data.itemData.push ( uList.createListItemData ( 'tabs',     '[T]abs' ) );
				subMenu.data.itemData.push ( uList.createListItemData ( 'table',    'T[a]ble' ) );

				subMenu.update();
			}
			else
			if ( itemData.textId === 'properties' ) {
				removeMenu();
				panelData.showPropertiesBoard ( 'Panel Properties' );
			}
			else
			if ( itemData.textId === 'delete' ) {
				removeMenu();
				if ( panelData.parentPanel )
					panelData.parentPanel.rmvControl ( panelData.panel );
				else
				if ( panelData.parent && (panelData.parent.type === uc.TYPE_TABS) )
					panelData.parent.rmvTab ( panelData.panel );

			}
			else
			if ( itemData.textId === 'save' ) {
				removeMenu();
				panelData.panel.saveToLS();
			}
			else
			if ( itemData.textId === 'load' ) {
				removeMenu();
				panelData.panel.loadFromLS();
			}
			else
			if ( itemData.textId === 'copy' ) {
				removeMenu();

			}
			else
			if ( itemData.textId === 'paste' ) {
				removeMenu();

			}
			else
			if ( itemData.textId === 'split-horz' ) {
				removeMenu();
				panelData.panel.splitHorz ( svc.shiftClickPanel );
			}
			else
			if ( itemData.textId === 'split-vert' ) {
				removeMenu();
			panelData.panel.splitVert ( svc.shiftClickPanel );
			}

		}	//	itemClick()

		//	Create and show the menu -
		var listD = uList.createListData ( { rpd:		rpd,
											 x: 		menuX - uc.MOVE_HANDLE_WIDTH  - 4,	//	to avoid the pointer 
											 y: 		menuY - uc.MOVE_HANDLE_HEIGHT - 2, 	//	being on the move box
											 w: 		140,  
											 h: 		160, 
						 					 name: 	  	'menuA',
											 isMenu: 	true,
											 cb: 		itemClick } );
	//	listMenu = panelData.panel.addControl ( listD );
		listMenu = screenPanel.addControl ( listD );

	//		cmn.log ( sW, ' listMenu eleId: ' + listMenu.data.eleId );

		listMenu.data.itemData.push ( uList.createListItemData ( 'grid',        '[G]rid ...' ) );
		listMenu.data.itemData.push ( uList.createListItemData ( 'add-control', '[A]dd Control >' ) );
		listMenu.data.itemData.push ( uList.createListItemData ( 'properties',  '[P]roperties ...' ) );
		if ( panelData.parentPanel )
			listMenu.data.itemData.push ( uList.createListItemData ( 'delete',      '[D]elete' ) );
		else
		if ( panelData.parent && (panelData.parent.type === uc.TYPE_TABS0) )
			listMenu.data.itemData.push ( uList.createListItemData ( 'delete',      '[D]elete Tab' ) );
		listMenu.data.itemData.push ( uList.createListItemData ( 'save',        '[S]ave ...' ) );
		listMenu.data.itemData.push ( uList.createListItemData ( 'load',        '[L]oad' ) );
		listMenu.data.itemData.push ( uList.createListItemData ( 'copy',        '[C]opy' ) );
		listMenu.data.itemData.push ( uList.createListItemData ( 'paste',       'Pas[t]e' ) );
		listMenu.data.itemData.push ( uList.createListItemData ( 'split-horz',  'Split [H]orizontally' ) );
		listMenu.data.itemData.push ( uList.createListItemData ( 'split-vert',  'Split [V]ertically' ) );

		listMenu.update();

	};	//	shiftClickPanel()

//	function createMenu ( sW, rpd, itemClick, items ) {
	svc.createMenu = function ( o ) {
		const sW = 'shift-click createMenu()';
		if ( uc.isFunction ( o.createMenu ) ) {
			o.createMenu ( { sW:		o.sW,
				 			 evt:		o.evt,
							 x:			o.evt.pageX,
							 y:			o.evt.pageY + 8,
							 items:		o.items } );
			return; }

		let	menuX = 0, menuY = 0;
		if ( uc.isNumber ( o.x ) ) {
			menuX = o.x; } 
		else {
			if ( ! o.evt ) {
				cmn.error ( sW, 'evt is not provided - no evt - need evt' );
				return; }
			menuX =   o.evt.clientX - uc.offsX
					- uc.MOVE_HANDLE_WIDTH  - 4; }	//	to avoid the pointer 
		if ( uc.isNumber ( o.y ) ) {
			menuY = o.y; }
		else {
			if ( ! o.evt ) {
				cmn.error ( sW, 'evt is not provided - no evt - need evt' );
				return; }
			menuY =   o.evt.clientY - uc.offsY
					- uc.MOVE_HANDLE_HEIGHT - 2; } 	//	being on the move box

		//	Use a panel for the screen (a kind of a shield) - so that -
		//		the list is a child of the screen
		//		the list can be moved by panning this screen panel
		function clickScreen ( d, i, ele ) {
			var sW = serviceId + ' createMenu()  clickScreen()';
			cmn.log ( sW );
			uc.downAppScreen ( o.rpd );	//	The menu is removed because it is 
										//	a child of the screen.
		}	//	clickScreen()

		let	screenPanel = null;
		
		if ( o.panel ) {
			screenPanel = o.panel; }
		else {
			screenPanel = uc.upAppScreen ( { sc: 		o.sW,
											 rpd:		o.rpd,
											 clickCB: 	clickScreen,
											 baseClass: 'u34-popupmenu-screen' } ); }

	//	if ( o.bFullScreen ) {
	//		let p = o.rpd.svg.node().parentElement;
	//		let r = p.getBoundingClientRect();
	//		menuX += r.x;
	//		menuY += r.y; 
	//	
	//		screenPanel = o.clientAppFnc ( { do: 'show-dropdown-screen' } ); }

		if ( o.bAsTree ) {
			let w = uc.isNumber ( o.w ) ? o.w : 140;
			let	treeD = uTree.createTreeData ( { rpd:		o.rpd,
												 x: 		menuX,
												 y: 		menuY,
												 w: 		w,  
												 h: 		160, 
												 name: 	  	'menuA',
										//		 isMenu: 	true,
												 isMenu: 	false,
												 cb: 		o.itemClick } );
			let	treeMenu = screenPanel.addControl ( treeD );

			function addItems ( items ) {
				items.forEach ( item => treeD.addItem ( item ) );
				treeMenu.update(); 
				if ( cmn.isFunction ( o.cbPopulated ) ) {
					o.cbPopulated ( { status:	'ok',
									  treeD:	treeD } ); }
				if ( o.selectedItemId > 0 ) {
					treeD.showSelected ( o.selectedParentId, 
										 o.selectedItemId );
					treeD.scrollIntoView ( o.selectedItemId ); }
			}	//	addItems()
			
			if ( cmn.isPromise ( o.items ) ) {
				o.items.then ( addItems ); }
			else {
				addItems ( o.items ); } }
		else {
			let	listD = uList.createListData ( { rpd:		o.rpd,
												 x: 		menuX,
												 y: 		menuY,
												 w: 		140,  
												 h: 		160, 
												 name: 	  	'menuA',
												 isMenu: 	true,
												 cb: 		o.itemClick } );
			let	listMenu = screenPanel.addControl ( listD );


			for ( let i = 0; i < o.items.length; i++ ) {
				let	item     = o.items[i];
				let itemData = uList.createListItemData ( item );
				listMenu.data.itemData.push ( itemData );
			}

			listMenu.update(); }

	}	//	createMenu()

	svc.removeMenu = function ( rpd ) {
		uc.downAppScreen ( rpd );
	}	//	removeMenu()

	svc.shiftClickButton = function ( evt, buttonData ) {
		var sW  = serviceId + ' shiftClickButton()';

		let rpd = buttonData.rpd;
		var menuX = evt.clientX - uc.offsX;
		var menuY = evt.clientY - uc.offsY;

		function clickScreen ( d, i, ele ) {
			var sW = serviceId + ' shiftClickButton()  clickScreen()';
			cmn.log ( sW );
			uc.downAppScreen ( rpd );		//	The menu is removed because it is a child of 
											//	the screen.
		}	//	clickScreen()

		//	Use a panel for the screen (a kind of a shield) - so that -
		//
		//		the list is a child of the screen
		//
		//		the list can be moved by panning this screen panel
		//
		var screenPanel = uc.upAppScreen ( { sc: 		sW,
											 rpd:		rpd,
											 clickCB: 	clickScreen,
											 baseClass: 'u34-popupmenu-screen' } );

		function removeMenu() {
			uc.downAppScreen ( rpd );		screenPanel = null;
			listMenu = null;
		}	//	removeMenu()

		function itemClick ( evt, itemData ) {
			var sW = serviceId + ' shiftClickButton() itemClick()';
			var ld = itemData.ld,					//	ld: listData
				subListData, subMenu, subX, subY;
			evt.stopPropagation();
	//			cmn.log ( sW, itemData.text );

			
			if ( itemData.textId === 'properties' ) {
				removeMenu();
				buttonData.showPropertiesBoard ( 'Edit Button' );
			}
			else
			if ( itemData.textId === 'delete' ) {
				removeMenu();
				buttonData.parentPanel.rmvControl ( buttonData );
			}
			else
			if ( itemData.textId === 'copy' ) {
				removeMenu();

			}

		}	//	itemClick()

		var listD = uList.createListData ( { rpd:		rpd,
											 x: 		menuX - uc.MOVE_HANDLE_WIDTH  - 4,	//	to avoid the pointer 
											 y: 		menuY - uc.MOVE_HANDLE_HEIGHT - 2, 	//	being on the move box
											 w: 		140,  
											 h: 		160, 
						 					 name: 	  	'menuA',
											 isMenu: 	true,
											 cb: 		itemClick } );
		var listMenu = screenPanel.addControl ( listD );

	//	cmn.log ( sW, ' listMenu eleId: ' + listMenu.data.eleId );

		listMenu.data.itemData.push ( uList.createListItemData ( 'properties',  '[P]roperties ...' ) );
		listMenu.data.itemData.push ( uList.createListItemData ( 'delete',      '[D]elete' ) );
		listMenu.data.itemData.push ( uList.createListItemData ( 'copy',        '[C]opy' ) );

		listMenu.update();

	};	//	shiftClickButton()

	svc.shiftClickLabel = function ( evt, labelData ) {
		var sW  = serviceId + ' shiftClickLabel()';

		function itemClick ( evt, itemData ) {
			evt.stopPropagation();
			svc.removeMenu ( labelData.rpd );
			switch ( itemData.textId ) {
				case 'properties':
				 	uc.isFunction ( labelData.onProperties )
						? labelData.onProperties ( labelData )
						: labelData.showPropertiesBoard ( 'Edit Label' );
					break;
				case 'delete':
					labelData.parentPanel.rmvControl ( labelData );
					break;
				case 'copy':
					break;
			}
		}	//	itemClick()

		var items = [
			{ textId: 'properties',  text: '[P]roperties ...' },
			{ textId: 'delete',      text: '[D]elete' },
			{ textId: 'copy',        text: '[C]opy' }
		];
	//	createMenu ( sW, labelData.rpd, itemClick, items );
		svc.createMenu ( { sW: 			sW, 
			   			   evt: 		evt,
						   rpd: 		labelData.rpd, 
						   x:			labelData.x,
						   y:			labelData.y + labelData.h + 1,
						   itemClick: 	itemClick, 
						   items: 		items } );

	};	//	shiftClickLabel()

/*
	svc.shiftClickTextarea = function ( d ) {
		var sW  = serviceId + ' shiftClickTextarea()';

		function itemClick ( itemData ) {
			window.event.stopPropagation();
			svc.removeMenu ( d.rpd );
			switch ( itemData.textId ) {
				case 'properties':
				 	uc.isFunction ( d.onProperties )
						? d.onProperties ( d )
						: d.showPropertiesBoard ( 'Edit Textarea' );
					break;
				case 'delete':
					d.parentPanel.rmvControl ( d );
					break;
				case 'copy':
					break;
			}
		}	//	itemClick()

		var items = [
			{ textId: 'properties',  text: '[P]roperties ...' },
			{ textId: 'delete',      text: '[D]elete' },
			{ textId: 'copy',        text: '[C]opy' }
		];
		svc.createMenu ( { sW: 			sW, 
			   			   evt:			null,
						   rpd: 		d.rpd, 
						   x:			d.x,
						   y:			d.y + d.h + 1,
						   itemClick: 	itemClick, 
						   items: 		items } );

	};	//	shiftClickTextarea()
*/

	svc.shiftClickGraph = function ( evt, graphData ) {
		var sW  = serviceId + ' shiftClickGraph()';

		function itemClick ( evt, itemData ) {
			evt.stopPropagation();
			svc.removeMenu ( graphData.rpd );
			switch ( itemData.textId ) {
				case 'properties': 	
					graphData.showPropertiesBoard ( 'Edit Graph' );		
					break;
				case 'delete': 		
					graphData.parentPanel.rmvControl ( graphData );		
					break;
				case 'copy': 															
					break;
			}
		}	//	itemClick()

		var items = [
			{ textId: 'properties',  text: '[P]roperties ...' },
			{ textId: 'delete',      text: '[D]elete' },
			{ textId: 'copy',        text: '[C]opy' }
		];
	//	createMenu ( sW, graphData.rpd, itemClick, items );
		svc.createMenu ( { sW: 			sW, 
			   			   evt:			evt,
						   rpd: 		graphData.rpd, 
						   itemClick: 	itemClick, 
						   items: 		items } );

	};	//	shiftClickGraph()

	svc.shiftClickControl = function ( evt, ctrlData, createMenu ) {
		var sW  = serviceId + ' shiftClickControl()';

		function onProperties() {
			const sW2 = sW + ' onProperties()';
			if ( uc.isFunction ( ctrlData.onProperties ) ) {
				ctrlData.onProperties ( ctrlData ) }
			else {
				cmn.error ( sW2, 'control\'s onProperties is not set' ); }
		}
		function onDelete() {
			ctrlData.parentPanel.rmvControl ( ctrlData );
		}
		function onCopy() {
			const sW2 = sW + ' onCopy()';
		//	cmn.error ( sW2, 'copy not implemented' );
		 	//	ctrlData may be any control (including a panel).
			svc.copiedControls = JSON.parse ( 
									uSL.jsonizeControl ( sW, ctrlData ) );
			let s = JSON.stringify ( svc.copiedControls, null, '    ' );
			cmn.log ( sW2, '-\n' + s );
		}
		function onPaste() {
			const sW2 = sW + ' onPaste()';
		//	cmn.error ( sW2, 'paste not implemented' );
		 	//	Unjsonize svc.copiedControls into ctrlData (which must be a
			//	panel).
			if ( ! svc.copiedControls ) {
				cmn.error ( sW, 'no copied controls' );
				return; }

		//	uSL.loadChildren ( controls, o, rpd, panel ) 
		 	if ( ctrlData.type !== 'panel' ) {
				cmn.error ( sW, 'paste into a panel only' );
				return; }
			let hostFnc = ctrlData.hostFnc;
			if ( ! cmn.isFunction ( hostFnc ) ) {
				if ( ! ctrlData.rpd ) {
					cmn.error ( sW2, 'no rpd' );
					return; }
				if ( ! cmn.isFunction ( ctrlData.rpd.hostFnc ) ) {
					cmn.error ( sW2, 'no hostFnc' );
					return; }
				hostFnc = ctrlData.rpd.hostFnc; }
			let controls = [];
			if ( cmn.isArray ( svc.copiedControls ) ) {
				svc.copiedControls.forEach ( cc => {
					controls.push ( { storeName:	null,
									  data: 		cc } ); } ); }
			else {
				controls.push ( { storeName:	null,
								  data: 		svc.copiedControls } ); }
			hostFnc ( { do: 		'load-children',
						controls:	controls,
						panel:		ctrlData.panel } );
		}
		function itemClick ( evt, itemData ) {
			evt.stopPropagation();
			svc.removeMenu ( ctrlData.rpd ); 
			switch ( itemData.textId ) {
				case 'properties':
					onProperties();
					break;
				case 'delete':
					onDelete();
					break;
				case 'copy':
					onCopy();
					break;
				case 'paste':
					onPaste();
					break;
				default:
					cmn.error ( sW, 'unrecognized menu item textId' );
			}
		}	//	itemClick()


		let items = [];
		if ( uc.isFunction ( createMenu ) ) {
			items.push ( { type:	'item', 	text: '[P]roperties ...', 
						   fnc:		onProperties } );
			items.push ( { type:	'item', 	text: '[D]elete', 
						   fnc:		onDelete } );
			items.push ( { type:	'item', 	text: '[C]opy',
						   fnc:		onCopy } );
			let disabled = 	   (   (! cmn.isObject ( svc.copiedControls ))
								&& (! cmn.isArray ( svc.copiedControls)))
							|| (ctrlData.type !== 'panel');
			items.push ( { type:	'item', 	disabled: disabled,
												text: 'P[a]ste',
						   fnc:		onPaste } ); }
		else {
			items.push ( { textId: 'properties',  text: '[P]roperties ...' } );
			items.push ( { textId: 'delete',      text: '[D]elete' } );
			items.push ( { textId: 'copy',        text: '[C]opy' } ); 
			items.push ( { textId: 'paste',       text: 'P[a]ste' } ); }

		svc.createMenu ( { sW: 			sW, 
			   			   evt:			evt,
						   rpd: 		ctrlData.rpd, 
						   x:			ctrlData.x,
						   y:			ctrlData.y + ctrlData.h + 1,
						   itemClick: 	itemClick, 
						   items: 		items,
						   createMenu:	createMenu } );

	};	//	shiftClickControl()

	svc.shiftClickControls = function ( evt, ctrlsData, rpd, x, y, h, createMenu ) {
		var sW  = serviceId + ' shiftClickControls()';

		//	Like shiftClickControl() but works on an array of controls.
		if ( ! cmn.isArray ( ctrlsData ) ) {
			cmn.error ( sW, 'expect ctrlsData to be an array' );
			return; }

		function onDelete() {
			ctrlsData.forEach ( cd => cd.parentPanel.rmvControl ( cd ) );
		}
		function onCopy() {
			const sW2 = sW + ' onCopy()';
		 	//	Any ctrlData in ctrlsData may be any control (including a panel).
			let a = [];
			ctrlsData.forEach ( cd => {
				a.push ( JSON.parse ( uSL.jsonizeControl ( sW, cd ) ) ); } );
			svc.copiedControls = a;
			let s = JSON.stringify ( svc.copiedControls, null, '    ' );
			cmn.log ( sW2, '-\n' + s );
		}
		function itemClick ( evt, itemData ) {
			evt.stopPropagation();
			svc.removeMenu ( rpd ); 
			switch ( itemData.textId ) {
				case 'delete':
					onDelete();
					break;
				case 'copy':
					onCopy();
					break;
				default:
					cmn.error ( sW, 'unrecognized menu item textId' );
			}
		}	//	itemClick()


		let items = [];
		if ( ! uc.isFunction ( createMenu ) ) {
			cmn.error ( sW, 'expect createMenu' );
			return; }
		items.push ( { type:	'item', 	text: '[D]elete', 
					   fnc:		onDelete } );
		items.push ( { type:	'item', 	text: '[C]opy',
					   fnc:		onCopy } );

		svc.createMenu ( { sW: 			sW, 
			   			   evt:			evt,
						   rpd: 		rpd, 
						   x:			x,
						   y:			y + h + 1,
						   itemClick: 	itemClick, 
						   items: 		items,
						   createMenu:	createMenu } );

	};	//	shiftClickControls()

	return svc;

})();
