
//  app/partials/udui/udui-panel-f.js

//	To use ControlData.

import * as d3 			from 'd3';
import clone 			from 'clone';


import { uc } 			from './udui-common';
import { uSL } 			from './udui-store-load-a';
import { uCD } 			from './udui-control-data-a';
import { cmn }			from '../common';

import { uButton } 		from './udui-button-e';
import { uSplitter } 	from './udui-splitter-b';
import { uList } 		from './udui-list-b';
import { uTree } 		from './udui-tree-a';
import { uInput } 		from './udui-input-b';
import { uLabel } 		from './udui-label-b';
import { uCheckbox } 	from './udui-checkbox-b';
import { uGraph }		from './udui-graph-a';
import { uTabs } 		from './udui-tabs-a';
import { uTable } 		from './udui-table-a';
import { uTextarea } 	from './udui-textarea-a';
import { uEditor }		from './udui-editor-a';

import './udui.css';

let lastPathId = 0;

export var uPanel = (function () { 

	'use strict';


	/* global $timeout */

	var serviceId = 'uduiPanelF';

	/* jshint validthis: true */

//		var svc = this;
//
//		uc.panelSvc = this;

	var svc: any = {};

	uc.panelSvc = svc;

	function ClipPath ( eleId, x, y, w, h ) {
		this.eleId = eleId;
		this.x = x + uc.OFFS_4_1_PIX_LINE;
		this.y = y + uc.OFFS_4_1_PIX_LINE;
		this.w = w;
		this.h = h;
	}	//	ClipPath()

	function FilterData ( o ) {
		this.eleId        = o.eleId;
		this.inBlur       = o.inBlur;
		this.stdDev       = o.stdDev;
		this.dx           = o.dx;
		this.dy           = o.dy;
		this.inMergeNode2 = o.inMergeNode2;
	}	//	FilterData()

	function BaseData ( x, y, w, h, name, panelData, panelEleId ) {
		this.type = uc.TYPE_PANEL_BASE;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.name = name;
		this.panelData  = panelData;
		this.panelEleId = panelEleId;

	//	this.panX	= 0;
	//	this.panY	= 0;
	//	this.scale	= 1;
	}	//	BaseData()


	function mouseOver ( evt, d ) {
		var sW = serviceId + ' mouseOver()';
		var pd = d.panelData;
	//	cmn.log ( sW, '  panel: ' + pd.name );
		evt.stopPropagation();

		//	Drag & Drop: Step 3 -
		//
		//		indicate targetable screen and target(s)

		if ( ! uc.isDragging )
			return;

		var dcd = uc.dragee.dragCtrlData;

		if ( dcd.eleId === pd.eleId ) {						//	it is this panel?
			return;
		}

	//	if ( dcd.parentPanel.data.eleId === pd.eleId  )		//	or is already a child of this panel
	//		return;
	//	determine elligibility on a target bases

//		if ( angular.isDefined ( d.dragTarget ) && (d.dragTarget !== null) ) {
		if ( uc.isDefined ( d.dragTarget ) && (d.dragTarget !== null) ) {
			d.dragTarget.over = true;
			uc.dragee.rootPanel.dragInfoLine1 ( 'target panel: ' + pd.name );
			return;
		}

	//	cmn.log ( sW, ': creating d.dragTarget' );

		d.dragTarget = { over: true };

		//	in the root panel - 
		//
		//		-	append the screen above everything else
		//
		//			but screen does not appear unless the mouse is over the root panel
		//
		//		-	insert the transparent zone polygons before the child panels so
		//			that the mouse event over the child panels will be detected
		//			and child panel screens will be shown instead the root's.

		d.dragTarget.screen = d3.select ( '#' + d.eleId )
			.append ( 'g' )
			.attr ( 'id',     d.eleId + '-drag-target-screen' )
			.attr ( 'transform', 'translate(' + (-d.x + uc.OFFS_4_1_PIX_LINE) + ',' 
											  + (-d.y + uc.OFFS_4_1_PIX_LINE) + ')' );
		d.dragTarget.screen
			.append ( 'rect' ) 
			.attr ( 'id',     d.eleId + '-drag-target-screen-rect' )
			.attr ( 'x',      0 )
			.attr ( 'y',      0 )
			.attr ( 'width',  function ( d ) { 
				return d.w - uc.PANEL_BORDER_WIDTH; 
			} )
			.attr ( 'height', function ( d ) { 
				return d.h - uc.PANEL_BORDER_WIDTH; 
			} )
			.attr ( 'class',  'u34-drag-target-screen' );

		//	Five targets - 
		//
		//		center - dragee becomes a child in this panel (if not already so)
		//
		//		left, top, right, bottom - dock - this panel is split
		//
		//	How to represent (draw) a target without looking crowded or busy? -

		//	Try dashed lines to indicate target zones.
		//
		var xul  = 0;										//	upper left 
		var yul  = 0; 
		var xul4 = xul + (d.w / 4);							//	upper left inner by 1/4
		var yul4 = yul + (d.h / 4);
		var xur  = xul + d.w;								//	upper right
		var yur  = yul;
		var xur4 = xur - (d.w / 4);
		var yur4 = yul4;
		var xlr  = xur;										//	lower right
		var ylr  = yul + d.h;
		var xlr4 = xur4;
		var ylr4 = ylr - (d.h / 4);
		var xll  = xul;										//	lower left
		var yll  = ylr;
		var xll4 = xul4;
		var yll4 = ylr4;
		d.dragTarget.screen
			.append ( 'line')
			.attr ( 'x1', xul ).attr ( 'y1', yul ).attr ( 'x2', xul4 ).attr ( 'y2', yul4 )
			.attr ( 'stroke-dasharray', '5,3' )
			.attr ( 'class', 'u34-test-line-drop-target' );
		d.dragTarget.screen
			.append ( 'line')
			.attr ( 'x1', xur ).attr ( 'y1', yur ).attr ( 'x2', xur4 ).attr ( 'y2', yur4 )
			.attr ( 'stroke-dasharray', '5,3' )
			.attr ( 'class', 'u34-test-line-drop-target' );
		d.dragTarget.screen
			.append ( 'line')
			.attr ( 'x1', xlr ).attr ( 'y1', ylr ).attr ( 'x2', xlr4 ).attr ( 'y2', ylr4 )
			.attr ( 'stroke-dasharray', '5,3' )
			.attr ( 'class', 'u34-test-line-drop-target' );
		d.dragTarget.screen
			.append ( 'line')
			.attr ( 'x1', xll ).attr ( 'y1', yll ).attr ( 'x2', xll4 ).attr ( 'y2', yll4 )
			.attr ( 'stroke-dasharray', '5,3' )
			.attr ( 'class', 'u34-test-line-drop-target' );
		d.dragTarget.screen
			.append ( 'line')
			.attr ( 'x1', xul4 ).attr ( 'y1', yul4 ).attr ( 'x2', xur4 ).attr ( 'y2', yur4 )
			.attr ( 'stroke-dasharray', '5,3' )
			.attr ( 'class', 'u34-test-line-drop-target' );
		d.dragTarget.screen
			.append ( 'line')
			.attr ( 'x1', xur4 ).attr ( 'y1', yur4 ).attr ( 'x2', xlr4 ).attr ( 'y2', ylr4 )
			.attr ( 'stroke-dasharray', '5,3' )
			.attr ( 'class', 'u34-test-line-drop-target' );
		d.dragTarget.screen
			.append ( 'line')
			.attr ( 'x1', xlr4 ).attr ( 'y1', ylr4 ).attr ( 'x2', xll4 ).attr ( 'y2', yll4 )
			.attr ( 'stroke-dasharray', '5,3' )
			.attr ( 'class', 'u34-test-line-drop-target' );
		d.dragTarget.screen
			.append ( 'line')
			.attr ( 'x1', xll4 ).attr ( 'y1', yll4 ).attr ( 'x2', xul4 ).attr ( 'y2', yul4 )
			.attr ( 'stroke-dasharray', '5,3' )
			.attr ( 'class', 'u34-test-line-drop-target' );


		//	Transparent polygon for each zone to get drag-over events.
		//
		//	in the root panel -
		//
		//		-	insert in the root's base <g> after the base rect but before 
		//			any controls in that <g>
		//
		var selection;
		if ( pd.name === uc.APP_CLIENT_ROOT_PANEL_NAME )
			selection = d.dragTarget.zones = d3.select ( '#' + d.eleId )
				.insert ( 'g', ':nth-child(0n+2)' )
				.attr ( 'id', 'root-panel-drop-zones' )
				.attr ( 'transform', 'translate(0,0)' );
		else
			selection = d.dragTarget.screen;

		selection
			.append ( 'g' )
			.attr ( 'id', 		function ( d, i ) { return d.panelEleId + '-' + d.name + '-droptargetleft'; } )
			.attr ( 'transform', 'translate(0,0)' )
			.on ( 'mouseover', mouseOverDropTargetLeft )
			.on ( 'mouseout',  mouseLeaveDropTargetLeft )
				.append ( 'polygon' )
				.attr ( 'id', 		function ( d, i ) { return d.panelEleId + '-' + d.name + '-droptargetleft-rect'; } )
				.attr ( 'points',   function ( d, i ) {
					var pts  = '';
					pts += xul  + ' ' + yul  + ',';
					pts += xul4 + ' ' + yul4 + ',';
					pts += xll4 + ' ' + yll4 + ',';
					pts += xll  + ' ' + yll;
					return pts;
				} )
				.attr ( 'class', 'u34-test-polygon-drop-target' );
		selection
			.append ( 'polygon' )
			.attr ( 'id', 		function ( d, i ) { return d.panelEleId + '-' + d.name + '-droptargettop'; } )
			.attr ( 'points',   function ( d, i ) {
				var pts  = '';
				pts += xul  + ' ' + yul  + ',';
				pts += xur  + ' ' + yur  + ',';
				pts += xur4 + ' ' + yur4 + ',';
				pts += xul4 + ' ' + yul4;
				return pts;
			} )
			.attr ( 'class', 'u34-test-polygon-drop-target' )
			.on ( 'mouseover', mouseOverDropTargetTop )
			.on ( 'mouseout',  mouseLeaveDropTargetTop );
		selection
			.append ( 'polygon' )
			.attr ( 'id', 		function ( d, i ) { return d.panelEleId + '-' + d.name + '-droptargetright'; } )
			.attr ( 'points',   function ( d, i ) {
				var pts  = '';
				pts += xur  + ' ' + yur  + ',';
				pts += xlr  + ' ' + ylr  + ',';
				pts += xlr4 + ' ' + ylr4 + ',';
				pts += xur4 + ' ' + yur4;
				return pts;
			} )
			.attr ( 'class', 'u34-test-polygon-drop-target' )
			.on ( 'mouseover', mouseOverDropTargetRight )
			.on ( 'mouseout',  mouseLeaveDropTargetRight );
		selection
			.append ( 'polygon' )
			.attr ( 'id', 		function ( d, i ) { return d.panelEleId + '-' + d.name + '-droptargetbottom'; } )
			.attr ( 'points',   function ( d, i ) {
				var pts  = '';
				pts += xll4 + ' ' + yll4 + ',';
				pts += xlr4 + ' ' + ylr4 + ',';
				pts += xlr  + ' ' + ylr  + ',';
				pts += xll  + ' ' + yll;
				return pts;
			} )
			.attr ( 'class', 'u34-test-polygon-drop-target' )
			.on ( 'mouseover', mouseOverDropTargetBottom )
			.on ( 'mouseout',  mouseLeaveDropTargetBottom );
		selection
			.append ( 'g' )
			.attr ( 'id', function ( d, i ) { return d.panelEleId + '-' + d.name + '-droptargetcenter'; } )
			.attr ( 'transform', 'translate(0,0)' )
			.on ( 'mouseover', mouseOverDropTargetCenter )
			.on ( 'mouseout',  mouseLeaveDropTargetCenter )
				.append ( 'polygon' )
				.attr ( 'id', 		function ( d, i ) { return d.panelEleId + '-' + d.name + '-droptargetcenter-rect'; } )
				.attr ( 'points',   function ( d, i ) {
					var pts  = '';
					pts += xul4 + ' ' + yul4 + ',';
					pts += xur4 + ' ' + yur4 + ',';
					pts += xlr4 + ' ' + ylr4 + ',';
					pts += xll4 + ' ' + yll4;
					return pts;
				} )
				.attr ( 'class', 'u34-test-polygon-drop-target' );

		//	Some info about the target.
		//
		uc.dragee.rootPanel.dragInfoLine1 ( 'target panel: ' + pd.name );

	}	//	mouseOver()

	function mouseLeave ( evt, d ) {
		var sW = serviceId + ' mouseLeave()';
		var pd = d.panelData;
		sW += '  panel: ' + pd.name;
	//	cmn.log ( sW  );
	//	evt.stopPropagation();			prevents mouseEnter event elsewhere

		if ( uc.isDefined ( d.dragTarget ) && (d.dragTarget !== null) ) {
			d.dragTarget.over = false;
		//	d.dragTarget.leavePromise = $timeout ( function () {
		//	//	NoNg
			//	What was the promise for?  Can not find any other reference to it.
			//	https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
			window.setTimeout ( function () {
				if ( ! d.dragTarget )
					return;
				if ( d.dragTarget.over )
					return;
			//	cmn.log ( sW, 'leave timeout - inCircle?' );
				if ( ! d.dragTarget.inCircle ) {
			//		cmn.log ( sW, 'no - removing target screen' );
					d.dragTarget.screen.remove();
					if ( pd.name === uc.APP_CLIENT_ROOT_PANEL_NAME )
						d.dragTarget.zones.remove();
			//		cmn.log ( sW, '   clearing info - pd.name: ' + pd.name );
					uc.dragee.rootPanel.dragInfoLine1 ( '' );
					uc.dragee.rootPanel.dragInfoLine2 ( '' );
					d.dragTarget = null;
				} 
			//	else
			//		cmn.log ( sW, 'yes - continue showing target screen' );
			}, 1 );
		}
	}	//	mouseLeave()

	function mouseDown ( evt, d ) {
		var sW = serviceId + ' mouseDown()';
		let pd = d.type === uc.TYPE_PANEL_BASE ? d.panelData : d;
		cmn.log ( sW, '  panel: ' + pd.name );

		evt.stopPropagation();
		evt.preventDefault();					//	prevents text cursor

		if ( evt.target.id.indexOf ( 'connector-' ) > 0 ) {
			uc.mouseOp.connectPath = d.panel.connectPathStart ( ele[0] );
		} else
		if ( evt.altKey ) {
			//	Drag & Drop: Step 1 -
			//
			//		called by mouseDown()
			//
			//		pick up - drag - drop  -  i.e., moving the panel to another parent panel
			//		i.e., floating, docking, etc..
			//
			uc.mouseOp.dragDrop = true;
			uc.initiateDrag ( pd.panelData, d.w, d.h );
		} else
		if ( evt.shiftKey ) {
			pd.shiftKeyDown_x0 = evt.pageX;
			pd.shiftKeyDown_y0 = evt.pageY;
		} else {
		//	dragSclrStarted2.call ( this, d, i, ele, uc.mouseOp );
		}

	}	//	mouseDown()

	function mouseMove ( evt, d ) {
		var sW = serviceId + ' mouseMove()';
		let pd = d.type === uc.TYPE_PANEL_BASE ? d.panelData : d;
	//	var baseX = d.x - uc.OFFS_4_1_PIX_LINE;
	//	var baseY = d.y - uc.OFFS_4_1_PIX_LINE;
	//	var lcl   = uc.localXY ( d.panelData, event.clientX, event.clientY, baseX, baseY );
	//	cmn.log ( sW, '  panel eleId: ' + pd.eleId + '  X Y: ' + lcl.x + '  ' + lcl.y );

		if ( ! uc.mouseOp )
			return;

		if ( pd.name === uc.APP_CLIENT_ROOT_PANEL_NAME )
			uc.mouseOp.updateXY ( evt.pageX, evt.pageY );

		if ( uc.isDragging ) {
	//		cmn.log ( sW, 'mouse x y ' + uc.mouseOp.x + ' ' + uc.mouseOp.y );
			pd.clickDisabled = true;
			if ( pd.name !== uc.APP_CLIENT_ROOT_PANEL_NAME )
				return;
			uc.dragee.dx = uc.mouseOp.dx;
			uc.dragee.dy = uc.mouseOp.dy;
			uc.dragee.rootPanel.drag ( uc.dragee );		//	Drag & Drop: Step 2
			return;
		}

	//	if ( uc.mouseOp.downData.eleId === d.panelData.eleId ) {
		if ( uc.mouseOp.downData.eleId === pd.eleId ) {
			let e = [document.getElementById ( pd.eleId + '-base') ];
			if ( pd.name !== uc.APP_CLIENT_ROOT_PANEL_NAME )
				uc.mouseOp.updateXY ( evt.pageX, evt.pageY );
			if ( uc.mouseOp.scrolling ) 
		//		dragSclred2.call ( this, d, i, ele, uc.mouseOp );
				dragSclred2.call ( this, d, 0,   e, uc.mouseOp );
			else
			if ( uc.mouseOp.selecting ) 
		//		selectUpdate.call ( this, d, i, ele );
				selectUpdate.call ( this, d, 0,   e );
			else {
				var dx = uc.mouseOp.x0 - uc.mouseOp.x;
				var dy = uc.mouseOp.y0 - uc.mouseOp.y;
				if ( (Math.abs ( dx ) >= 2) || (Math.abs ( dy ) >= 2) ) {
					if ( evt.shiftKey ) {
						uc.mouseOp.selecting = true;
		//				selectStart.call ( this, d, i, ele );
						selectStart.call ( this, d, 0,   e );
						pd.clickDisabled = true;
					} else {
						if ( pd.panningEnabled ) {
							uc.mouseOp.scrolling = true;
		//					dragSclrStarted2.call ( this, d, i, ele );
		//					dragSclred2.call ( this, d, i, ele, uc.mouseOp );
							dragSclrStarted2.call ( this, d, 0, e );
							dragSclred2.call ( this, d, 0, e, uc.mouseOp );
							pd.clickDisabled = true; }
					}
				}
			}
			evt.stopPropagation();
		}
	}	//	mouseMove()

	function mouseUp ( evt, d ) {
		var sW = serviceId + ' mouseUp()';
		var x, y, newPanelData, newPanel, pd = d.type === uc.TYPE_PANEL_BASE ? d.panelData : d;
		cmn.log ( sW, '  panel: ' + pd.name );

		evt.stopPropagation();

		if ( evt.shiftKey ) {
			if ( uc.isNumber ( pd.shiftKeyDown_x0 ) ) {
				pd.shiftKeyDown_dX = evt.pageX - pd.shiftKeyDown_x0;
				delete ( pd.shiftKeyDown_x0 ) }
			if ( uc.isNumber ( pd.shiftKeyDown_y0 ) ) {
				pd.shiftKeyDown_dY = evt.pageY - pd.shiftKeyDown_y0; 
				delete ( pd.shiftKeyDown_y0 ) } }

		if ( uc.mouseOp && (uc.mouseOp.downData.eleId !== pd.eleId) ) 
			pd.clickDisabled = true;

		var mouseOp = uc.mouseOp;		
					  uc.mouseOp = null;

		if ( mouseOp && mouseOp.scrolling ) {
			dragSclrEnded.call ( this, d );
			return; }

		if ( mouseOp && mouseOp.selecting ) {
			selectEnd.call ( this, d, mouseOp );
			return; }

		//	Drag & Drop: Finally -
		if ( uc.isDragging ) {
			var dt   = uc.dragee.dropTarget;
			var drop = uc.dragee.dragCtrlData.panel;

			var ebcr = dt.targetEle.getBoundingClientRect();	//	for e2e test development
			var eleX = evt.pageX - ebcr.left;			//
			var eleY = evt.pageY - ebcr.top;			//
		//	cmn.log ( sW, 'mouse x y ' + mouseOp.x + ' ' + mouseOp.y + '  ele ID ' + dt.targetEle.id + '  ele x y ' + eleX + ' ' + eleY );

			//	target panel (dt) Is the parent of what is being dragged and dropped (SrcParent)?
			var dtIsSrcParent = false;
			if ( drop.data.parentPanel && (drop.data.parentPanel.data.eleId === dt.panel.data.eleId) )
				dtIsSrcParent = true;

			uc.dragee.rootPanel.dragEnd ( uc.dragee );

			if ( dt ) {
				var bd = dt.panel.data.baseData[0];
				if ( bd.dragTarget ) {
					bd.dragTarget.screen.remove();
					if ( dt.panel.data.name === uc.APP_CLIENT_ROOT_PANEL_NAME )
						bd.dragTarget.zones.remove();
				}

				var parentPanel = uc.dragee.dragCtrlData.parentPanel;	//	set before the dock because it will change

				//	2017-Apr-09
				//
				//	If the drop target is not the source parent -
				//
				//		A new panel will be created.
				//
				//		Destroy the old panel  * first *.
				//
				//		But not its contents.
				//
				//		Get references to the old panel's contents, remove those references from the old
				//		panel's data, then destroy the old panel (along with it's clippath). I.e., create
				//		a new array of data from the old panel.
				//
				//		So, drop, as it is passed here, will no longer exist.  But we will have the data 
				//		of what were its contents.
				//
				//		Do not pass  drop  to  dock...()  or whatever.  Instead pass the array of content 
				//		data from the panel just destroyed.
				//
				//		Will that work?  In general?

				var bDestroyDrop = true;

				var remainingPanel = getRemainingPanel ( parentPanel, drop );	//	2017-May-28

				switch ( dt.where ) {
					case 'left':
					//	dt.panel.dockSplitLeft  ( drop, uc.appPanelClick, dtIsSrcParent );
						dt.panel.dockSplitLeft2 ( drop, uc.appPanelClick, dtIsSrcParent );
						bDestroyDrop = false;		//	done in dockSplitLeft2().
						break;
					case 'top':
					//	dt.panel.dockSplitTop  ( drop, uc.appPanelClick, dtIsSrcParent );
						dt.panel.dockSplitTop2 ( drop, uc.appPanelClick, dtIsSrcParent );
						bDestroyDrop = false;		//	done in dockSplitTop2().
						break;
					case 'right':
					//	dt.panel.dockSplitRight  ( drop, uc.appPanelClick, dtIsSrcParent );
						dt.panel.dockSplitRight2 ( drop, uc.appPanelClick, dtIsSrcParent );
						bDestroyDrop = false;		//	done in dockSplitRight2().
						break;
					case 'bottom':
					//	dt.panel.dockSplitBottom  ( drop, uc.appPanelClick, dtIsSrcParent );
						dt.panel.dockSplitBottom2 ( drop, uc.appPanelClick, dtIsSrcParent );
						bDestroyDrop = false;		//	done in dockSplitBottom2().
						break;
					case 'center':
						var lcl = uc.localXY ( pd, evt.clientX, 
												   evt.clientY, 
											   d.x - uc.OFFS_4_1_PIX_LINE, 
											   d.y - uc.OFFS_4_1_PIX_LINE );
						newPanelData = svc.createPanelData (  { rpd:		pd.rpd,
																x: 			lcl.x + uc.OFFS_4_1_PIX_LINE, 
															  	y: 			lcl.y + uc.OFFS_4_1_PIX_LINE, 
															  	w: 			drop.data.w, 
															  	h: 			drop.data.h,
															  	name: 		drop.data.name,
															  	clickCB: 	drop.data.clickCB } );
						newPanel = dt.panel.addControl ( newPanelData );
						svc.addCtrls ( newPanel, drop.data.childData );
						break;
					default:
						cmn.error ( sW, 'bad/unrecognized dt.where (' + dt.where + ')' );
						return;
				}
				if ( ! dtIsSrcParent )
				//	uc.dragee.dragCtrlData.parentPanel.rmvControl ( drop, { bKeepChildClipPaths: true } );
				//	uc.dragee.dragCtrlData.parentPanel.rmvControl ( drop, { bKeepChildClipPaths: false } );
					//	Note that the data of what was just docked/floated might (should?) be the 
					//	same instance as that of the drop - to preserve references the to or from that
					//	data.  But the DOM elements docked/floated are probably new (duplicated from 
					//	those of the drop).  So - here we want to be certain we delete the DOM elements 
					//	of what was dragged and not those that were just created.
					if ( bDestroyDrop )
						parentPanel.rmvControl ( drop, { bKeepChildClipPaths: false } );
					//	2017-May-28		I think we need here -
					else
						if ( remainingPanel )
							parentPanel.unsplit ( remainingPanel );
			}
		}

	}	//	mouseUp()

	function click ( evt:PointerEvent, d: any ) {
		var sW = serviceId + ' click()';
	//	var pd = d.panelData;
		let pd = d.type === uc.TYPE_PANEL_BASE ? d.panelData : d;
	//	cmn.log ( sW, '  panel: ' + pd.name + '  clientX Y: ' + evt.clientX + '  ' + evt.clientY );
		evt.stopPropagation();
		if ( evt.shiftKey ) {
			if ( 	uc.isNumber ( pd.shiftKeyDown_dX )
				 && uc.isNumber ( pd.shiftKeyDown_dY ) ) {
				let dX = pd.shiftKeyDown_dX;
				delete ( pd.shiftKeyDown_dX );
				let dY = pd.shiftKeyDown_dY;
				delete ( pd.shiftKeyDown_dY );
				if ( Math.sqrt ( (dX * dX) + (dY * dY) ) > 4 ) {
					return; } }
			if ( uc.isFunction ( pd.shiftClickCB ) ) {
				let otherMenuItems = null;
				pd.shiftClickCB ( evt, pd, otherMenuItems ); 
				return; }
		}
		if ( pd.clickDisabled ) {
			pd.clickDisabled = false;
			return;
		}
		if ( uc.isFunction ( pd.clickCB ) ) {
			pd.clickCB ( evt, pd, d.x - uc.OFFS_4_1_PIX_LINE, 
								  d.y - uc.OFFS_4_1_PIX_LINE ); }
	}	//	click()

	function inSelectRect ( g, s /* selection */ ) {
		s.minX = s.minY = Number.POSITIVE_INFINITY;
		s.maxX = s.maxY = Number.NEGATIVE_INFINITY;
		//	https://www.w3.org/TR/selectors-api/
		//	https://drafts.csswg.org/selectors-4/#child-combinators
		var ge = g._groups[0][0];
		d3.selectAll ( '#' + ge.id + '> g' )		//	just the child g and not descendents of those
			.each ( function ( d: any ) { 
				var x, y;
				if ( ! d.w )
					return;
				if ( (d.x > s.xs) && (d.x + d.w < s.xe) && (d.y > s.ys) && (d.y + d.h < s.ye) ) {
					s.ctrls.push ( d );

					if ( d.x < s.minX )  s.minX = d.x;
					x = d.x + d.w;
					if ( x > s.maxX )  s.maxX = x;

					if ( d.y < s.minY )  s.minY = d.y;
					y = d.y + d.h;
					if ( y > s.maxY )  s.maxY = y;
				}
			} );
		s.eX = s.maxX - s.minX;
		s.eY = s.maxY - s.minY;
	}	//	inSelectRect()

	function xMinMax ( g, o ) {
		o.minX = Number.POSITIVE_INFINITY;
		o.maxX = Number.NEGATIVE_INFINITY;
	//	g.selectAll ( 'g' )
		//	https://www.w3.org/TR/selectors-api/
		//	https://drafts.csswg.org/selectors-4/#child-combinators
		var ge = g._groups[0][0];
		d3.selectAll ( '#' + ge.id + '> g' )		//	just the child g and not descendents of those
			.each ( function ( d: any ) { 
	//			if ( (! d.x) || (! d.w) )  return;
				if (             ! d.w  )  return;
				if ( d.x < o.minX )  o.minX = d.x;
				var x = d.x + d.w;
				if ( x > o.maxX )  o.maxX = x;
			} );
		o.eX = o.maxX - o.minX;
	}	//	xMinMax()

	function yMinMax ( g, o ) {
		o.minY = Number.POSITIVE_INFINITY;
		o.maxY = Number.NEGATIVE_INFINITY;
	//	g.selectAll ( 'g' )
		//	https://www.w3.org/TR/selectors-api/
		//	https://drafts.csswg.org/selectors-4/#child-combinators
		var ge = g._groups[0][0];
		d3.selectAll ( '#' + ge.id + '> g' )		//	just the child g and not descendents of those
			.each ( function ( d: any ) { 
	//			if ( (! d.y) || (! d.h) )  return;
				if (             ! d.h  )  return;
				if ( d.y < o.minY )  o.minY = d.y;
				var y = d.y + d.h;
				if ( y > o.maxY )  o.maxY = y;
			} );
		o.eY = o.maxY - o.minY;
	}	//	yMinMax()

	function updateHsclr0 ( panelEleId ) {
		//	Update horizontal scroller.
		var o = {}, g = d3.select ( '#' + panelEleId + '-' + 'base' );
		g.each ( function ( d ) { 
			xMinMax ( g, o );
			updateHsclr ( g, d, o ); 
		} );
	}	//	updateHsclr0()

	function updateHsclr ( g,			//	that of id="base"
						   d, 			//	the base's data
						   ox ) {		//	extents of controls horizontally
		const sW = serviceId + ' updateHsclr()';
//		cmn.log ( sW, 'ox: ' + JSON.stringify ( ox ) );
		let pd = d.type === uc.TYPE_PANEL_BASE ? d.panelData : d;
		let bd = pd.baseData[0];
	//	var iX =                          uc.PANEL_BORDER_WIDTH      + uc.OFFS_4_1_PIX_LINE;	//	indicator position
		var iX = (pd.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) + uc.OFFS_4_1_PIX_LINE;	//	indicator position
		var iW = bd.w - uc.PANEL_BORDER_WIDTH;					//	indicator Width 
	//	if ( bd.x + ox.minX <  0   ) {
		if ( bd.x + ox.minX < -0.5 ) {
			iX += parseInt ( (((-ox.minX - bd.x) * bd.w) / ox.eX).toFixed ( 0 ) );
			iW  = parseInt ( ((bd.w * bd.w) / ox.eX).toFixed ( 0 ) ) - uc.PANEL_BORDER_WIDTH;
			if ( Math.round ( (-bd.x) + bd.w ) >= ox.maxX ) 
				iW = bd.w - iX + uc.OFFS_4_1_PIX_LINE;
		} else {
			var r = Math.round ( (-bd.x) + bd.w );
			if ( ox.maxX > r ) 
				iW = bd.w - parseInt ( (((ox.maxX - r) * bd.w) / ox.eX).toFixed ( 0 ) );
		}
		d3.select ( '#' + bd.panelEleId + '-' + 'hsclr' )			//	for now, just use the "thumb" on the right
			.attr ( 'x',     function ( d, i ) { return iX; } )
			.attr ( 'width', function ( d, i ) { return iW; } )
			.attr ( 'visibility', iW >= bd.w - uc.PANEL_BORDER_WIDTH 
									  ? 'hidden': null );
	}	//	updateHsclr()

	function updateVsclr0 ( panelEleId ) {
		//	Update vertical scroller.
		var o = {}, g = d3.select ( '#' + panelEleId + '-base' );
		g.each ( function ( d ) { 
			yMinMax ( g, o );
			updateVsclr ( g, d, o ); 
		} );
	}	//	updateVsclr0()

	function updateVsclr ( g,			//	that of id="base"
						   d, 			//	the base's data
						   oy ) {		//	extents of controls vertically
		const sW = serviceId + ' updateVsclr()';
		//	Set indicators - maybe a lightgray piece on the border. Get extents of 
		//	the controls.  Use selection.each(function) -
		//		https://github.com/d3/d3-selection#selection_each
		//
		//	Height (lightgray length) of indicator on right border might be proportional 
		//	to height-of-panel / eY.  So the greater the extent of the controls the smaller 
		//	the indicator - which gives it more room to move and show the amount of  
		//	scrolling that can be done.
		//
		//		d.h: 	height of the "viewport"
		//
		//		eY: 	total height of the controls - i.e., their vertical extents, the size
		//				of the "subject"
		//
		//		scrolling is useful when -
		//
		//			(d.h / eY)  <  1  
		//
		//		i.e., when either controls extents top or bottom is beyond the "viewport" top 
		//		or bottom
		//
		//		So, for now, (d.h / eY) -
		//
		//			is always < 1 
		//
		//			gets smaller as the control's extents get farther apart - i.e, as the 
		//			"subject" gets larger.
		//
		let pd = d.type === uc.TYPE_PANEL_BASE ? d.panelData : d;
		let bd = pd.baseData[0];
	//	var iY =                          uc.PANEL_BORDER_WIDTH      + uc.OFFS_4_1_PIX_LINE;	//	indicator position
		var iY = (pd.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) + uc.OFFS_4_1_PIX_LINE;	//	indicator position
		var iH = bd.h - uc.PANEL_BORDER_WIDTH;					//	indicator Height
	//	if (                    bd.y + oy.minY <  0   ) {	
	//	if ( (oy.eY > bd.h) && (bd.y + oy.minY <  0)  ) {			//	2017-May-04
	//	cmn.log ( sW, 'bd.y ' + bd.y + '  oy.minY ' + oy.minY + ' < -0.5 ?' );
	//	cmn.log ( sW, 'oy: ' + JSON.stringify ( oy ) );
		let dy = parseInt ( (((-oy.minY - bd.y) * bd.h) / oy.eY).toFixed ( 0 ) );

//		//	This done in dragSclred2().  * When moving by the scroll bar 
//		//	thumb * -
//		//		dy		how much the thumb moves
//		//		bd.y	resulting base position
//		bd.y = -(((dy * oy.eY) / bd.h) + oy.minY)

	//	cmn.log ( sW, 'd.name ' + d.name 
	//				  + '   iY ' + iY 
	//				  + '   iH ' + iH 
	//				  + '   dy ' + dy 
	//				  + '   bd.y (' + bd.y + ') + oy.minY (' + oy.minY + ') ' + (bd.y + oy.minY) + ' < -0.5 ?' );
		if (                    bd.y + oy.minY < -0.5 ) {			//	2017-May-07
	//		let dy = parseInt ( (((-oy.minY - bd.y) * bd.h) / oy.eY).toFixed ( 0 ) );
			iY += dy;
			iH  = parseInt ( ((bd.h * bd.h) / oy.eY).toFixed ( 0 ) ) - uc.PANEL_BORDER_WIDTH;
			if ( Math.round ( (-bd.y) + bd.h ) >= oy.maxY ) 
				iH = bd.h - iY + uc.OFFS_4_1_PIX_LINE;
		} else {
			var r = Math.round ( (-bd.y) + bd.h );
			if ( oy.maxY > r ) 
				iH = bd.h - parseInt ( (((oy.maxY - r) * bd.h) / oy.eY).toFixed ( 0 ) );
		}
	//	if ( bd.eleId === 'rr-11-base' )
	//		cmn.log ( sW,   'bd.h: ' + bd.h 
	//					  + '   minY: ' + oy.minY 
	//					  + '   maxY: ' + oy.maxY
	//					  + '   eY: ' + oy.eY 
	//					  + '   iY: ' + iY  
	//					  + '   iH: ' + iH  
	//					  + '   bd.y: ' + bd.y 
	//					  + '   iY: ' + iY );
		d3.select ( '#' + bd.panelEleId + '-' + 'vsclr' )		//	for now, just use the "thumb" on the right
			.attr ( 'y',          function ( d, i ) { return iY; } )
			.attr ( 'height',     function ( d, i ) { return iH; } )
			.attr ( 'visibility', iH >= bd.h - uc.PANEL_BORDER_WIDTH 
									  ? 'hidden': null );
	}	//	updateVsclr()

//		function dragSclrFilter ( d ) {
//			var sW = serviceId + ' dragSclrFilter()';
//			cmn.log ( sW, '  panel name: ' + d.panelData.name + '  event.altKey: ' + event.altKey );
//			if ( d3.event.button !== 0 )
//				return false;
//			if ( event.altKey )
//				return false;
//			return true;
//		}

	function dragSclrStarted2 ( d, i, ele ) {
		var sW = serviceId + ' dragSclrStarted2()';
		let pd = d.type === uc.TYPE_PANEL_BASE ? d.panelData : d;
		let bd = pd.baseData[0];
		cmn.log ( sW, '  panel name: ' + pd.name );

		//	scrolling/panning

		d3.select ( '#' + bd.panelEleId + '-' + 'vsclr' )
			.classed ( 'u34-scroll-thumb',           false )
			.classed ( 'u34-scroll-thumb-scrolling', true  );
		d3.select ( '#' + bd.panelEleId + '-' + 'hsclr' )
			.classed ( 'u34-scroll-thumb',           false )
			.classed ( 'u34-scroll-thumb-scrolling', true  );

	}	//	dragSclrStarted2()

	function dragSclred2 ( d, i, ele, myEvt ) {
		var sW = serviceId + ' dragSclred2()';
		let mt = d.type;		//	move type
		let pd = d.type === uc.TYPE_PANEL_BASE ? d.panelData : d;
		let bd = pd.baseData[0];
	//	cmn.log ( sW, '  d.type: ' + d.type 
	//				+ '  panel: ' + pd.name 
	//				+ '  dxy: ' + myEvt.dx + ' ' + myEvt.dy );
		var x, xo, y, yo;

		var g = d3.select ( ele[i] )
			.attr ( 'transform', function ( d: any, i ) { 
				if ( pd.filledBy && pd.filledBy.parentScrolled ) {
					pd.filledBy.parentScrolled ( mt, myEvt ); }
	//			cmn.log ( sW, 'd.name ' + d.name 
	//						  + ' d.y (' + d.y + ') += dy (' + myEvt.dy + ') ' + (d.y + myEvt.dy) );
				d.x += myEvt.dx;
				d.y += (mt === uc.TYPE_PANEL_BASE ? myEvt.dy : -myEvt.dy);
				let x = d.x / pd.scale;
				let y = d.y / pd.scale;
				return   'scale(' + pd.scale + ') '
					   + 'translate(' + x + ',' + y + ')'; 
			} );
		x  = (pd.panX = bd.x) / pd.scale;
		x  = Math.round ( x * 2 ) / 2; 
		y  = (pd.panY = bd.y) / pd.scale;
		y  = Math.round ( y * 2 ) / 2;
		xo = (pd.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);
		yo = (pd.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);
		d3.select ( '#cp-' + bd.panelEleId + '-' + bd.name + '-rect' )
			.attr ( 'x', -x + xo )
			.attr ( 'y', -y + yo );
		g.select ( '#' + bd.panelEleId + '-' + bd.name + '-rect' )
			.attr ( 'x', -x + xo )
			.attr ( 'y', -y + yo );

		var ox = {};	xMinMax ( g, ox );
		updateHsclr ( g, d, ox );
		var oy = {};	yMinMax ( g, oy );
		updateVsclr ( g, d, oy );

	//	cmn.log ( sW, 'panel: ' + pd.name + '  bd.x y  ' + bd.x + '  ' + bd.y );
		
		if ( pd.propCB ) {			//	update the properties board?
			pd.propCB ( 'panX', pd.panX - pd.baseX0 );
			pd.propCB ( 'panY', pd.panY - pd.baseY0 ); }
	}	//	dragSclred2()

	function dragSclrEnded ( d, i, ele ) {
		var sW = serviceId + ' dragSclrEnded()';
		let pd = d.type === uc.TYPE_PANEL_BASE ? d.panelData : d;
		let bd = pd.baseData[0];
		cmn.log ( sW, '  panel name: ' + pd.name  );
		
	//	if ( d.dragee ) {
	//		d.dragee.rootPanel.dragEnd ( d.dragee );
	//		d.dragee = null;
	//	} else {
			d3.select ( '#' + bd.panelEleId + '-' + 'vsclr' )
				.classed ( 'u34-scroll-thumb',           true  )
				.classed ( 'u34-scroll-thumb-scrolling', false );
			d3.select ( '#' + bd.panelEleId + '-' + 'hsclr' )
				.classed ( 'u34-scroll-thumb',           true  )
				.classed ( 'u34-scroll-thumb-scrolling', false );
	//	}
	}	//	dragSclrEnded()

	//	Selecting (possibly multiple controls) with the mouse.
	//
	function selectStart ( bd, i, ele ) {
		var sW = serviceId + ' selectStart()';
		var pd = bd.panelData;
		var mo = uc.mouseOp;
//		cmn.log ( sW, '  panel name: ' + pd.name + '  event.altKey: ' + event.altKey );

		//	draw a dashed-line rectangle

	//	cmn.log ( sW, '  panel name: ' + pd.name + ' eleX Y: ' + mo.eleX + ' ' + mo.eleY + ' bd.x y ' + bd.x + ' ' + bd.y );

		mo.select = {
			xs: mo.eleX - bd.x - 0.5,
			ys: mo.eleY - bd.y - 0.5
		};

		var dx = mo.x - mo.x0;
		var dy = mo.y - mo.y0;

		d3.select ( '#' + pd.eleId + '-base' )
			.append ( 'rect' ) 
			.attr ( 'id',     pd.eleId + '-control-select' )
			.attr ( 'x',      mo.select.xs )
			.attr ( 'y',      mo.select.ys )
			.attr ( 'width',  dx )
			.attr ( 'height', dy )
			.attr ( 'class',  'u34-control-select-rect' );

	}	//	selectStart()

	function selectUpdate ( bd, i, ele ) {
		var sW = serviceId + ' selectUpdate()';
		var pd = bd.panelData;
		var mo = uc.mouseOp;
	//	cmn.log ( sW, '  panel name: ' + pd.name + '  event.altKey: ' + event.altKey );

		var dx = mo.x - mo.x0;
		var dy = mo.y - mo.y0;

	//	cmn.log ( sW, '  panel name: ' + pd.name + ' eleX Y: ' + mo.eleX + ' ' + mo.eleY + '  dx y: ' + dx + ' ' + dy );

	//	d3.select ( '#' + pd.eleId + '-control-select' )
	//		.attr ( 'width',  dx )
	//		.attr ( 'height', dy );

		if ( dx < 0 ) {
			d3.select ( '#' + pd.eleId + '-control-select' )
				.attr ( 'x',     mo.select.xs + dx )
				.attr ( 'width', -dx ); }
		else {
			d3.select ( '#' + pd.eleId + '-control-select' )
				.attr ( 'width',  dx ); }

		if ( dy < 0 ) {
			d3.select ( '#' + pd.eleId + '-control-select' )
				.attr ( 'y',      mo.select.ys + dy )
				.attr ( 'height', -dy ); }
		else {
			d3.select ( '#' + pd.eleId + '-control-select' )
				.attr ( 'height',  dy ); }

	}	//	selectUpdate()

	function selectEnd ( bd, mo /* mouseOp */ ) {
		var sW = serviceId + ' selectEnd()';
		var pd = bd.panelData;
		let rpd = pd.rpd ? pd.rpd : pd;
//		cmn.log ( sW, '  panel name: ' + pd.name + '  event.altKey: ' + event.altKey );

		var dx = mo.x - mo.x0;
		var dy = mo.y - mo.y0;

		if ( dx < 0 ) {
			mo.select.xe  = mo.select.xs; 
			mo.select.xs += dx; }
		else {
			mo.select.xe = mo.select.xs + dx; }
		if ( dy < 0 ) {
			mo.select.ye  = mo.select.ys;
			mo.select.ys += dy; }
		else {
			mo.select.ye = mo.select.ys + dy; }

		//	Remove the selection rectangle.
		d3.select ( '#' + pd.eleId + '-control-select' )
			.remove();

		//	Append a new rectangle that is filled semitransparent over the 
		//	selected  controls.
		//	First, iterate over the controls.
		mo.select.ctrls = [];
		var g = d3.select ( '#' + pd.eleId + '-' + 'base' );
		g.each ( function ( d ) { inSelectRect ( g, mo.select ); } );

		//	The results of inSelectRect() -
		//	mo.select.xs, ys, xe, ye, 		start, end of selection rect and 
		//	minX, minY, maxX, maxY, eX, eY 	extents of controls selected and
		//	ctrls[] 						the controls selected. 

		mo.select.ctrls.forEach ( d => d.indicateSelected() );

		//	Create a screen over the app.  Clicking outside the selection and 
		//	onto the screen will stop (not undo) any operation on the 
		//	selection.
		function clickScreen ( d, i, ele ) {
			var sW = serviceId + ' selectEnd()  clickScreen()';
		//	cmn.log ( sW );
			uc.downAppScreen ( rpd );	//	The menu is removed because it is 
										//	a child of the screen.
			mo.select.ctrls.forEach ( d => {
				if ( uc.isNumber ( d.x0 ) ) {
					delete ( d.x0 ); }
				if ( uc.isNumber ( d.y0 ) ) {
					delete ( d.y0 ); }
				d.unindicateSelected(); } );

			rpd.hostFnc ( { do:		'clear-move-properties',
							title:	  'UDUI Control Properties (no control is '
									+ 'selected)'} );
		}	//	clickScreen()

		function mousemoveScreen ( evt, d ) {
			var sW = serviceId + ' selectEnd()  mousemoveScreen()';
			var ebcr = evt.target.getBoundingClientRect();
			//	x0: 			event.pageX,		//	first event
			//	y0: 			event.pageY,
			//	x: 				event.pageX,		//	current position
			//	y: 				event.pageY,
			//	dx: 			0,					//	change in position
			//	dy: 			0,
			var	eleX = 			evt.pageX - ebcr.left;
			var	eleY =			evt.pageY - ebcr.top;
		//	cmn.log ( sW, ' eleX Y: ' + eleX + ' ' + eleY );
		}	//	mousemoveScreen()

		let bMouseDown = false, dX = 0, dY = 0;

		function mousedown ( evt: PointerEvent, d: any ) {
			var sW = serviceId + ' selectEnd()  mousedown()';
		//	cmn.log ( sW );
			evt.stopPropagation();
			if ( ! uc.isNumber ( mo.select.x0 ) ) {
				mo.select.x0 = evt.pageX; }
			else {
				mo.select.x0 += evt.pageX - (mo.select.x0 + dX); }
			if ( ! uc.isNumber ( mo.select.y0 ) ) {
				mo.select.y0 = evt.pageY; }
			else {
				mo.select.y0 += evt.pageY - (mo.select.y0 + dY); }
		//	mo.select.ctrls.forEach ( d => { d.x0 = d.x; d.y0 = d.y; } );
		//	dX = dY = 0;
			bMouseDown = true;
		}	//	mousedown()
		
		function dXY() {
			mo.select.ctrls.forEach ( d => { 
				if ( ! uc.isNumber ( d.x0 ) ) {
					d.x0 = d.x; }
				if ( ! uc.isNumber ( d.y0 ) ) {
					d.y0 = d.y; }
				d.x = d.x0 + dX; 
				d.y = d.y0 + dY;
			//	d.onMove ( d, -1, op.downEle, e.x, e.y );
				let ele = d3.select ( '#' + d.eleId + '-move' ).node();
				d.onMove ( d, -1, ele, d.x, d.y ); } );
			outline
				.attr ( 'x', mo.select.minX - 6 + dX )
				.attr ( 'y', mo.select.minY - 6 + dY );
		}	//	dXY()

		function mousemove ( evt: PointerEvent, d: any ) {
			var sW = serviceId + ' selectEnd()  mousemove()';
		//	cmn.log ( sW );
			evt.stopPropagation();
		//	if ( 	(! uc.isNumber ( mo.select.x0 )) 
		//		 ||	(! uc.isNumber ( mo.select.y0 )) ) {
		//		return; }
			if ( ! bMouseDown ) {
				return; }
			dX = evt.pageX - mo.select.x0;
			dY = evt.pageY - mo.select.y0;
			dXY();
			if ( uc.isFunction ( moveD.propCB ) ) {	//	update the properties board?
				moveD.propCB ( 'dX', dX );
				moveD.propCB ( 'dY', dY ); }
		}	//	mousemove()
		
		function mouseup ( evt: PointerEvent, d: any ) {
			var sW = serviceId + ' selectEnd()  mouseup()';
		//	cmn.log ( sW );
			evt.stopPropagation();
		//	if ( uc.isNumber ( mo.select.x0 ) ) {
		//		delete ( mo.select.x0 ); }
		//	if ( uc.isNumber ( mo.select.y0 ) ) {
		//		delete ( mo.select.y0 ); }
		//	mo.select.ctrls.forEach ( d => {
		//		if ( uc.isNumber ( d.x0 ) ) {
		//			delete ( d.x0 ); }
		//		if ( uc.isNumber ( d.y0 ) ) {
		//			delete ( d.y0 ); } } );
			bMouseDown = false;
		}	//	mouseup()
		
		function click ( evt: PointerEvent, d: any ) {
			var sW = serviceId + ' selectEnd()  click()';
		//	cmn.log ( sW );
			evt.stopPropagation();

		//	uc.downAppScreen ( rpd );
			clickScreen ( null, null, null );

			//	Menu?  E.g., Delete, Copy
			if ( evt.shiftKey ) {
				if ( uc.isFunction ( pd.shiftClickCB ) ) {
					let otherMenuItems = null;
				 	let ms = {		//	Multiple Selection
						ctrlsData:	mo.select.ctrls,
						x:			mo.select.xs,
						y:			mo.select.ys,
						h:			mo.select.ye - mo.select.ys };
					pd.shiftClickCB ( evt, d, otherMenuItems, ms );
					return; }
			}
		}	//	click()
		
		var screenPanel = uc.upAppScreen ( { sc: 			sW,
											 rpd:			rpd,
											 clickCB: 		clickScreen,
											 baseClass: 	'u34-popupmenu-screen' } );
		var spd = screenPanel.data;
		spd.onMouseMove  = mousemoveScreen;
		let outline = d3.select ( '#' + spd.eleId + '-base' )
			.append ( 'rect' )
			.attr ( 'id',     spd.eleId + '-controls-selected' )
			.attr ( 'x',      mo.select.minX - 6 )
			.attr ( 'y',      mo.select.minY - 6 )
			.attr ( 'width',  mo.select.eX + 12 )
			.attr ( 'height', mo.select.eY + 12 )
			.attr ( 'class',  'u34-controls-selected-rect' )
			.on ( 'mousedown', mousedown )
			.on ( 'mousemove', mousemove )
			.on ( 'mouseup',   mouseup )
			.on ( 'click',	   click );

		//	Show amount-selected-controls-move (dx, dy) in Properties pane.
		//
		if ( ! uc.isFunction ( rpd.hostFnc ) ) {
			return; }
		
		let n, moveD = {
			sC:				sW,
			listProperties: function() {
				return [ { property: 'dX', value: 0, displayName: 'dX' },
						 { property: 'dY', value: 0, displayName: 'dY' } ]; },
			setProperty:	function ( name, value ) {
				switch ( name ) {
					case 'dX':
						n = Number ( value );
						if ( n !== n ) {	//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
							break; }
						dX = n;
						dXY();
						break;
					case 'dY':
						n = Number ( value );
						if ( n !== n ) {	//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
							break; }
						dY = n;
						dXY();
						break;
					default:
						cmn.error ( sW, 'unrecognized property name "' + name + '"' );
				} },
			propCB:			null };
		
		rpd.hostFnc ( { do:		'show-move-properties',
						title:	'Move Selected',
						ctrlD:	moveD } );

	}	//	selectEnd()






	//	Panel Move
	//
	function moved ( d, i, ele, x, y ) {
		var sW = serviceId + ' moved()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   x y: ' + x + ' ' + y );
		d3.select ( ele.parentNode )
			.attr ( 'transform', function ( d: any, i ) { 
				return 'translate(' + (d.x = x) + ',' + (d.y = y) + ')'; 
			} );


		redrawPaths ( d );

		d.parentPanel.updateSclrs();
	}	//	moved()


	//	Panel Connect
	//
	function connect ( d, i, ele, dx, dy ) {
		let rpd = d.rpd;
		if ( ! ele ) {
			rpd.panel.connectCancel();
			return; }
		rpd.panel.connectPending ( dx, dy ); 
	}	//	connect()


	//	Panel Save (for, e.g., built in dialogs)
	//
	function clickSave ( evt: PointerEvent, d: any ) {		//	for, e.g., built in dialogs
		var sW = serviceId + ' clickSave()';
	//	cmn.log ( sW );
		evt.stopPropagation();
		d.rpd.panel.hideFlyoverInfo();
		uSL.storePanel ( sW, d.rpd.uduiId, d );
	}	//	clickSave()

	function clickClose ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' clickClose()';
	//	cmn.log ( sW );
		evt.stopPropagation();
		d.rpd.panel.hideFlyoverInfo();

		d.rpd.panel.rmvControl ( d.panel );

		if ( d.closeCB )
			d.closeCB();
	}	//	clickClose()

	//	Panel Size
	//
//	function mouseOverSize ( d, i, ele ) {
//	//	cmn.log ( 'mouseOverSize()' );
//		d3.select ( this )		//	select rect
//			.classed ( 'u34-size-handle-transparent', false )
//			.classed ( 'u34-size-handle',             true  );
//	}
//	The size rect is always visible in intersection of the scrollers.

//	function mouseLeaveSize ( d, i, ele ) {
//	//	cmn.log ( 'mouseLeaveSize()' );
//		d3.select ( this )		//	select rect
//			.classed ( 'u34-size-handle-transparent', true )
//			.classed ( 'u34-size-handle',             false  );
//	}
//	The size rect is always visible in intersection of the scrollers.

//	function dragSizeStarted ( d, i, ele ) {
//	//	cmn.log ( 'dragSizeStarted()' );
//	//	d3.select ( this )		//	select size rect from group
//	//		.classed ( 'u34-size-handle-transparent', false  )
//	//		.classed ( 'u34-size-handle',             true );
//	//	always visible
//		if ( d.horzSplitter ) 
//			d.lpwf = d.leftPanel.data.w / d.w;		//	Left Panel Width Factor
//		if ( d.vertSplitter ) 
//			d.tphf = d.topPanel.data.h / d.h;		//	Top Panel Height Factor
//	}	//	dragSizeStarted()

	function closeHandleX ( d ) {		//	d is of the panel g
		return d.baseData[0].w - uc.CLOSE_HANDLE_WIDTH + uc.OFFS_4_1_PIX_LINE;
	}

	function connectorLeftX ( d ) {		//	d is of the panel g
		return -uc.CONNECTOR_WIDTH;
	}

	function connectorLeftY ( d ) {		//	d is of the panel g
		return (d.h - uc.CONNECTOR_HEIGHT) / 2;
	}

	function connectorTopX ( d ) {		//	d is of the panel g
		return (d.w - uc.CONNECTOR_WIDTH) / 2;
	}

	function connectorTopY ( d ) {		//	d is of the panel g
		return  -uc.CONNECTOR_HEIGHT;
	}

	function connectorRightX ( d ) {	//	d is of the panel g
		return d.w;
	}

	function connectorRightY ( d ) {	//	d is of the panel g
		return (d.h - uc.CONNECTOR_HEIGHT) / 2;
	}

	function connectorBottomX ( d ) {	//	d is of the panel g
		return (d.w - uc.CONNECTOR_WIDTH) / 2;
	}

	function connectorBottomY ( d ) {	//	d is of the panel g
		return d.h + uc.PANEL_BORDER_WIDTH;
	}

	function sizeStart ( d ) {
		if ( d.horzSplitter ) {
			d.lpwf = d.leftPanel.data.w / d.w;		//	Left Panel Width Factor
			sizeStart ( d.leftPanel.data );
			sizeStart ( d.rightPanel.data );
		}
		if ( d.vertSplitter ) {
			d.tphf = d.topPanel.data.h / d.h;		//	Top Panel Height Factor
			sizeStart ( d.topPanel.data );
			sizeStart ( d.bottomPanel.data );
		}
	}	//	sizeStart()

	function sizeHandleX ( d ) {		//	d is of the panel g
	//	return d.w - uc.SIZE_HANDLE_WIDTH  - uc.OFFS_4_1_PIX_LINE;			
	//	return d.w - uc.PANEL_BORDER_WIDTH                     - uc.VERT_SCROLL_WIDTH  - 1 - uc.OFFS_4_1_PIX_LINE;			

	//	return d.w - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.VERT_SCROLL_WIDTH      - uc.OFFS_4_1_PIX_LINE;			
		return d.w - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.VERT_SCROLL_WIDTH      - uc.OFFS_4_1_PIX_LINE - (d.hasBorder ? 0 : 1);
	}

	function sizeHandleY ( d ) {		//	d is of the panel g
	//	return d.h - uc.SIZE_HANDLE_HEIGHT - uc.OFFS_4_1_PIX_LINE;
	//	return d.h - uc.PANEL_BORDER_WIDTH                     - uc.HORZ_SCROLL_HEIGHT - 1 - uc.OFFS_4_1_PIX_LINE;

	//	return d.h - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.HORZ_SCROLL_HEIGHT     - uc.OFFS_4_1_PIX_LINE;
		return d.h - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.HORZ_SCROLL_HEIGHT     - uc.OFFS_4_1_PIX_LINE - (d.hasBorder ? 0 : 1);
	}

	function widthSizeHandle ( d ) {
	//	return uc.SCROLL_BORDER_WIDTH + uc.VERT_SCROLL_WIDTH  + (d.hasBorder ? uc.PANEL_BORDER_WIDTH :    -uc.OFFS_4_1_PIX_LINE);
		return uc.SCROLL_BORDER_WIDTH + uc.VERT_SCROLL_WIDTH  + (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 1 - uc.OFFS_4_1_PIX_LINE);
	}

	function heightSizeHandle( d ) {
	//	return uc.SCROLL_BORDER_WIDTH + uc.VERT_SCROLL_WIDTH  + (d.hasBorder ? uc.PANEL_BORDER_WIDTH :    -uc.OFFS_4_1_PIX_LINE);
		return uc.SCROLL_BORDER_WIDTH + uc.VERT_SCROLL_WIDTH  + (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 1 - uc.OFFS_4_1_PIX_LINE);
	}

	//	Extending d3 -
	//		http://blogs.atlassian.com/2014/06/extending-d3-js/
	//		http://stackoverflow.com/questions/32675769/how-can-i-extend-d3
	//		https://github.com/wbkd/d3-extended
	d3.selection.prototype.placeSizeHandleRect = function() {
		this
			.attr ( 'x', function ( d, i ) { return sizeHandleX ( d ); } )
			.attr ( 'y', function ( d, i ) { return sizeHandleY ( d ); } );
		return this;		
	};

	d3.selection.prototype.placeSizeHandleLeftBorder = function() {
		this
			.attr ( 'x1', function ( d, i ) { return sizeHandleX ( d ); } )
			.attr ( 'y1', function ( d, i ) { return sizeHandleY ( d ); } )
			.attr ( 'x2', function ( d, i ) { return sizeHandleX ( d ); } )
			.attr ( 'y2', function ( d, i ) {
			//	return sizeHandleY ( d ) + uc.HORZ_SCROLL_HEIGHT + (d.hasBorder ? 1 + uc.OFFS_4_1_PIX_LINE : 0);
				return sizeHandleY ( d ) + uc.HORZ_SCROLL_HEIGHT + (d.hasBorder ? 1 + uc.OFFS_4_1_PIX_LINE : 1);
			} );
		return this;		
	};

	d3.selection.prototype.placeSizeHandleTopBorder = function() {
		this
			.attr ( 'x1', function ( d, i ) { return sizeHandleX ( d ); } )
			.attr ( 'y1', function ( d, i ) { return sizeHandleY ( d ); } )
			.attr ( 'x2', function ( d, i ) {
			//	return sizeHandleX ( d ) + uc.VERT_SCROLL_WIDTH + (d.hasBorder ? 1 + uc.OFFS_4_1_PIX_LINE : 0);
				return sizeHandleX ( d ) + uc.VERT_SCROLL_WIDTH + (d.hasBorder ? 1 + uc.OFFS_4_1_PIX_LINE : 1);
			} )
			.attr ( 'y2', function ( d, i ) { return sizeHandleY ( d ); } );
		return this;
	};

	function sizeBaseRectX ( d, bd, bRootPanel? ) {
		//	Same/Used for both the panel base rect and panel clip path rect.
		if ( ! uc.isBoolean ( bRootPanel ) )
			bRootPanel = (d.parentPanel == null) && ! (d.parent && d.parent.type === uc.TYPE_TABS0);
		if ( bRootPanel )				//	if caller says it is the root panel 
			bd.w = d.bW100Pct ? '100%' : d.w;
		else
		if ( d.bSplitPanel ) {			//	if the panel is split
			if ( ! d.parentPanel ) 		//		and it is the root panel
				bd.w = d.w;
			else
			//	bd.w = d.w - (2 * uc.PANEL_BORDER_WIDTH);
				bd.w = d.w -      uc.PANEL_BORDER_WIDTH;
		}
		else
		if ( d.bParentSplitAndRoot ) 
		//	bd.w = d.w - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH;
			bd.w = d.w - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH - uc.PANEL_BORDER_WIDTH;
		else
		//	bd.w = d.w - uc.VERT_SCROLL_WIDTH  - (2 * uc.OFFS_4_1_PIX_LINE) - (2 * uc.PANEL_BORDER_WIDTH)                   - uc.SCROLL_BORDER_WIDTH;

		//	bd.w = d.w - uc.VERT_SCROLL_WIDTH                               - (d.hasBorder ? 2 * uc.PANEL_BORDER_WIDTH : 0                        ) - uc.SCROLL_BORDER_WIDTH;
			bd.w = d.w - uc.VERT_SCROLL_WIDTH                               - (d.hasBorder ? 2 * uc.PANEL_BORDER_WIDTH : 1 * uc.PANEL_BORDER_WIDTH) - uc.SCROLL_BORDER_WIDTH;
		return bd.w;
	}

	function sizeBaseRectY ( d, bd, bRootPanel? ) {
		//	Same/Used for both the panel base rect and panel clip path rect.
		if ( ! uc.isBoolean ( bRootPanel ) )
			bRootPanel = (d.parentPanel == null) && ! (d.parent && d.parent.type === uc.TYPE_TABS0 );
		if ( bRootPanel )				//	if caller says it is the root panel 
			bd.h = d.bH100Pct ? '100%' : d.h;
		else
		if ( d.bSplitPanel ) {			//	if the panel is split
			if ( ! d.parentPanel )		//		and it is the root panel
				bd.h = d.h;
			else
			//	bd.h = d.h - (2 * uc.PANEL_BORDER_WIDTH);
				bd.h = d.h -      uc.PANEL_BORDER_WIDTH;
		}
		else
		if ( d.bParentSplitAndRoot ) 
		//	bd.h = d.h - uc.HORZ_SCROLL_HEIGHT - uc.SCROLL_BORDER_WIDTH;
			bd.h = d.h - uc.HORZ_SCROLL_HEIGHT - uc.SCROLL_BORDER_WIDTH - uc.PANEL_BORDER_WIDTH;
		else
		//	bd.h = d.h - uc.HORZ_SCROLL_HEIGHT - (2 * uc.OFFS_4_1_PIX_LINE) - (2 * uc.PANEL_BORDER_WIDTH)                   - uc.SCROLL_BORDER_WIDTH;

		//	bd.h = d.h - uc.HORZ_SCROLL_HEIGHT                              - (d.hasBorder ? 2 * uc.PANEL_BORDER_WIDTH : 0                        ) - uc.SCROLL_BORDER_WIDTH;
			bd.h = d.h - uc.HORZ_SCROLL_HEIGHT                              - (d.hasBorder ? 2 * uc.PANEL_BORDER_WIDTH : 1 * uc.PANEL_BORDER_WIDTH) - uc.SCROLL_BORDER_WIDTH;
		return bd.h;
	}

	function vsclrX ( d ) {
	//	return d.w  - uc.PANEL_BORDER_WIDTH                     - uc.VERT_SCROLL_WIDTH - uc.OFFS_4_1_PIX_LINE; 
	//	return d.w  - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.VERT_SCROLL_WIDTH - uc.OFFS_4_1_PIX_LINE; 
	//	return d.w  - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.VERT_SCROLL_WIDTH + uc.OFFS_4_1_PIX_LINE; 
		return d.w  - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.VERT_SCROLL_WIDTH + (d.hasBorder ? uc.OFFS_4_1_PIX_LINE : -uc.OFFS_4_1_PIX_LINE); 
	}

	function vsclrLeftBorderX ( d ) {
	//	if ( d.bParentSplitAndRoot ) 
	//		return d.w                         - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH + uc.OFFS_4_1_PIX_LINE; 
	//	return     d.w - uc.PANEL_BORDER_WIDTH - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH - uc.OFFS_4_1_PIX_LINE; 

	//	return d.w - uc.PANEL_BORDER_WIDTH                     - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH - uc.OFFS_4_1_PIX_LINE;
	//	return d.w - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.VERT_SCROLL_WIDTH                          - uc.OFFS_4_1_PIX_LINE;
		return d.w                                             - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH - uc.OFFS_4_1_PIX_LINE;
	}

	function vsclrLeftBorderY1 ( d ) {
		return (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0); 
	}
	
	function vsclrLeftBorderY2 ( d ) {
	//	return d.h - uc.PANEL_BORDER_WIDTH - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH; 
	//	return d.h - uc.PANEL_BORDER_WIDTH                     - uc.VERT_SCROLL_WIDTH  - uc.SCROLL_BORDER_WIDTH + uc.OFFS_4_1_PIX_LINE; 

	//	return d.h - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.HORZ_SCROLL_HEIGHT - uc.SCROLL_BORDER_WIDTH                + uc.OFFS_4_1_PIX_LINE; 
		return d.h - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.HORZ_SCROLL_HEIGHT - uc.SCROLL_BORDER_WIDTH + (d.hasBorder ? uc.OFFS_4_1_PIX_LINE : -uc.OFFS_4_1_PIX_LINE); 
	}
	
	function hsclrY ( d ) {
	//	return d.h  - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.VERT_SCROLL_WIDTH  - uc.OFFS_4_1_PIX_LINE; 
	//	return d.h  - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.HORZ_SCROLL_HEIGHT + uc.OFFS_4_1_PIX_LINE; 
		return d.h  - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.HORZ_SCROLL_HEIGHT + (d.hasBorder ? uc.OFFS_4_1_PIX_LINE : -uc.OFFS_4_1_PIX_LINE); 
	}

	function hsclrTopBorderX1 ( d ) {
		return (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0); 
	//	//	test test (verify error)
	//	return 2;	//	bad
	}

	function hsclrTopBorderX2 ( d ) {
	//	return d.w - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH; 

	//	return d.w - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH                + uc.OFFS_4_1_PIX_LINE; 
		return d.w - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH + (d.hasBorder ? uc.OFFS_4_1_PIX_LINE : -uc.OFFS_4_1_PIX_LINE);
	}

	function hsclrTopBorderY ( d ) {
	//	return d.h - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.VERT_SCROLL_WIDTH  - uc.SCROLL_BORDER_WIDTH - uc.OFFS_4_1_PIX_LINE; 
	//	return d.h;
	
	//	return d.h - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) - uc.HORZ_SCROLL_HEIGHT                          - uc.OFFS_4_1_PIX_LINE; 

		return d.h                                             - uc.HORZ_SCROLL_HEIGHT - uc.SCROLL_BORDER_WIDTH - uc.OFFS_4_1_PIX_LINE; 
	//	//	test test
	//	return d.h                                             - uc.HORZ_SCROLL_HEIGHT - uc.SCROLL_BORDER_WIDTH; 	//	bad
	}

	function sized3 ( d, w, h, g, hasBorder ) {
		var sW = serviceId + ' sized3()';
		if ( (d.minWidth > 0) && (w < d.minWidth) ) {
			w = d.minWidth; }
		if ( (d.minHeight > 0) && (h < d.minHeight) ) {
			h = d.minHeight; }
		var dx = w - d.w;
		var dy = h - d.h;
		d.w = w;
		d.h = h;
		if ( (typeof hasBorder === 'undefined') || hasBorder )
			g.select ( '#' + d.eleId + '-panel-border' )
				.attr ( 'width',  function ( d ) { return d.w;                         } )
				.attr ( 'height', function ( d ) { return d.h;                         } );

		if ( d.eleId !== ('rr-' + uc.APP_CLIENT_ROOT_PANEL_ELE_ID) ) {		//	do not size root base because it is always '100%'.
			if ( d.eleId === 'rr-ralph' )
				cmn.log ( 'debug this' );
			g.select ( '#' + d.eleId + '-base-rect' )
				.data ( d.baseData )
			//	.attr ( 'width',  function ( d, i ) { return d.w += dx; } )
			//	.attr ( 'height', function ( d, i ) { return d.h += dy; } );
				.attr ( 'width',  function ( bd ) { 
					return sizeBaseRectX ( d, bd ); 
				} )
				.attr ( 'height', function ( bd ) { 
					return sizeBaseRectY ( d, bd ); 
				} );
			}
		else {
			var bd   = d.baseData[0];							//	do set the root panel's base data w, h
				bd.w = d.w;
				bd.h = d.h;
		}


		if ( d.filledBy ) {
			d.filledBy.parentSizedAbsolute ( d.baseData[0].w, 
											 d.baseData[0].h ); }

		g.select ( '#' + d.eleId + '-vsclr' )
		//	.attr ( 'x',      function ( d, i ) { 
		//		if ( d.bParentSplitAndRoot ) 
		//			return d.w - uc.VERT_SCROLL_WIDTH + uc.OFFS_4_1_PIX_LINE; 
		//		return d.w  - uc.PANEL_BORDER_WIDTH - uc.VERT_SCROLL_WIDTH - uc.OFFS_4_1_PIX_LINE; 
		//	} )
			.attr ( 'x',      vsclrX ) 
			.attr ( 'y',      function ( d, i ) { 
				var y = (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) + uc.OFFS_4_1_PIX_LINE;  
				return y;
			} )
			.attr ( 'width',  function ( d, i ) { return uc.VERT_SCROLL_WIDTH; } );
		//	.attr ( 'height', function ( d, i ) { return 0; } );	see updateSclrs()
		g.select ( '#' + d.eleId + '-vsclr-left-border' )
		//	.attr ( 'x1',    function ( d, i ) { 
		//		if ( d.bParentSplitAndRoot ) 
		//			return d.w                         - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH + uc.OFFS_4_1_PIX_LINE; 
		//		return     d.w - uc.PANEL_BORDER_WIDTH - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH - uc.OFFS_4_1_PIX_LINE; 
		//	} )
			.attr ( 'x1',    vsclrLeftBorderX )
		//	.attr ( 'y1',    function ( d, i ) { return uc.PANEL_BORDER_WIDTH; } )
			.attr ( 'y1',    vsclrLeftBorderY1 )
		//	.attr ( 'x2',    function ( d, i ) { 
		//		if ( d.bParentSplitAndRoot ) 
		//			return d.w                         - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH + uc.OFFS_4_1_PIX_LINE; 
		//		return     d.w - uc.PANEL_BORDER_WIDTH - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH - uc.OFFS_4_1_PIX_LINE; 
		//	} )
			.attr ( 'x2',    vsclrLeftBorderX )
		//	.attr ( 'y2',    function ( d, i ) { 
		//		if ( d.bParentSplitAndRoot ) 
		//			return d.h - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH; 
		//		return d.h - uc.PANEL_BORDER_WIDTH - uc.VERT_SCROLL_WIDTH - uc.SCROLL_BORDER_WIDTH; 
		//	} );
			.attr ( 'y2',     vsclrLeftBorderY2 );
		g.select ( '#' + d.eleId + '-hsclr' )
			.attr ( 'x',      function ( d, i ) { 
				return (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) + uc.OFFS_4_1_PIX_LINE; 
			} )
		//	.attr ( 'y',      function ( d, i ) { 
		//		if ( d.bParentSplitAndRoot ) 
		//			return d.h - uc.HORZ_SCROLL_HEIGHT + uc.OFFS_4_1_PIX_LINE; 
		//		return d.h - uc.PANEL_BORDER_WIDTH - uc.HORZ_SCROLL_HEIGHT - uc.OFFS_4_1_PIX_LINE; 
		//	} )
			.attr ( 'y',      hsclrY )
		//	.attr ( 'width',  function ( d, i ) { return 0; } )		see updateSclrs()
			.attr ( 'height', function ( d, i ) { return uc.VERT_SCROLL_WIDTH; } );
		g.select ( '#' + d.eleId + '-hsclr-top-border' )
			.attr ( 'x1',    hsclrTopBorderX1 )
			.attr ( 'y1',    hsclrTopBorderY )
			.attr ( 'x2',    hsclrTopBorderX2 )
			.attr ( 'y2',    hsclrTopBorderY );
		g.select ( '#' + d.eleId + '-size' )
		//	.attr ( 'x',      sizeHandleX )
		//	.attr ( 'y',      sizeHandleY );
			.placeSizeHandleRect();
		g.select ( '#' + d.eleId + '-size-left-border' )
			.placeSizeHandleLeftBorder();
		g.select ( '#' + d.eleId + '-size-top-border' )
			.placeSizeHandleTopBorder();
		g.select ( '#' + d.eleId + '-close' )
			.attr ( 'x',      closeHandleX );
		g.select ( '#' + d.eleId + '-connector-left' )
			.attr ( 'y',      connectorLeftY );
		g.select ( '#' + d.eleId + '-connector-top' )
			.attr ( 'x',      connectorTopX );
		g.select ( '#' + d.eleId + '-connector-right' )
			.attr ( 'x',      connectorRightX )
			.attr ( 'y',      connectorRightY );
		g.select ( '#' + d.eleId + '-connector-bottom' )
			.attr ( 'x',      connectorBottomX )
			.attr ( 'y',      connectorBottomY );

		d3.select ( '#cp-' + d.eleId + '-base-rect' )
			.attr ( 'width',  function ( cpd ) { 
			//	return sizeBaseRectX ( d, cpd, d.parentPanel == null ); 
				//	2017-May-28
			//	return sizeBaseRectX ( d, cpd, (d.parentPanel == null) && (! (d.parent && d.parent.type === uc.TYPE_TABS0 )) );
				//	2017-Aug 		sizeBaseRectX() makes the root panel decision
				return sizeBaseRectX ( d, cpd );
			} )
			.attr ( 'height', function ( cpd ) { 
			//	return sizeBaseRectY ( d, cpd, d.parentPanel == null ); 
				//	2017-May-28
			//	return sizeBaseRectY ( d, cpd, (d.parentPanel == null) && (! (d.parent && d.parent.type === uc.TYPE_TABS0 )) );
				//	2017-Aug 		sizeBaseRectY() makes the root panel decision
				return sizeBaseRectY ( d, cpd );
			} );

		redrawPaths ( d );

		//	dynamic controls (child x, y, w and/or h as percentages)
		d.childData.data.forEach ( function ( cd ) {
			if ( 	uc.isNumber ( cd.xPct  ) 
				 || uc.isNumber ( cd.yPct  )
				 || uc.isNumber ( cd.wPct  )
				 || uc.isNumber ( cd.hPct  )
				 || uc.isString ( cd.wEval )
				 || uc.isString ( cd.hEval )
				 || uc.isString ( cd.xEval )
				 || uc.isString ( cd.yEval ) ) {
				cd.parentSized(); }
		} );

		d.panel.updateSclrs();
	}	//	sized3()

	function sized2 ( d, g, dx, dy, hasBorder ) {
		var sW = serviceId + ' sized2()';
		var g2;
		d.w += dx;
		if ( (d.minWidth > 0) && (d.w < d.minWidth) ) {
			d.w = d.minWidth; }
		d.h += dy;
		if ( (d.minHeight > 0) && (d.h < d.minHeight) ) {
			d.h = d.minHeight; }
	//	if ( hasBorder )		done with szied2() at bottom here
	//		g.select ( '#' + d.eleId + '-panel-border' )
	//			.attr ( 'width',  function ( d ) { return d.w - uc.PANEL_BORDER_WIDTH; } )
	//			.attr ( 'height', function ( d ) { return d.h - uc.PANEL_BORDER_WIDTH; } );
		if ( d.horzSplitter ) {		//	If  * this  panel *  is split horizontally
			//	Move this panel's size rect.
			g.select ( '#' + d.eleId + '-size' )
				.placeSizeHandleRect();
			g.select ( '#' + d.eleId + '-size-left-border' )
				.placeSizeHandleLeftBorder();
			g.select ( '#' + d.eleId + '-size-top-border' )
				.placeSizeHandleTopBorder();

			var	lpd = d.leftPanel.data, lpw, lph, 
				sx, sw, 
				rpd = d.rightPanel.data, rpw, rph;
			
			//	Size the left panel.
			g2  = d3.select ( '#' + lpd.eleId );
			lpw = Math.round ( d.w * d.lpwf );
			lph = lpd.h + dy;
		//	sized3 ( lpd, lpw, lph, g2, false );
			sized2 ( lpd, g2, lpw - lpd.w, lph - lpd.h, false );

			//	Move, Size the splitter.
			g2 = d.horzSplitter.g;
		//	sx = lpw + uc.SPLITTER_BORDER_W - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH);
			sx = lpw + uc.SPLITTER_BORDER_W;		//	2017-May-26
			g2.attr ( 'transform', function ( d ) { 
			//	return 'translate(' + (d.x = sx) + ',' + (uc.OFFS_4_1_PIX_LINE - (d.hasBorder                  ? 0 : uc.PANEL_BORDER_WIDTH)) + ')'; 
			//	return 'translate(' + (d.x = sx) + ',' + (uc.OFFS_4_1_PIX_LINE - (d.parentPanel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH)) + ')'; 
				return 'translate(' + (d.x = sx) + ',' +  uc.OFFS_4_1_PIX_LINE + ')'; 		//	2017-May-26
			} );
			g2.select ( 'rect' )
				.attr ( 'height', function ( d ) { 
					return d.h += dy; 
				} );
			g2.selectAll ( 'line' )
				.attr ( 'y2', function ( d ) { 
					return d.h; 
				} );

			//	Move, Size the right panel.
			g2 = d3.select ( '#' + rpd.eleId );
			g2.attr ( 'transform', function ( d ) { 
			//	return 'translate(' + (d.x = lpw + uc.SPLITTER_WH + (1 * uc.SPLITTER_BORDER_W) + 0.5) + ',' + uc.OFFS_4_1_PIX_LINE + ')'; 
			//	var x =                d.x = lpw + uc.SPLITTER_WH + (1 * uc.SPLITTER_BORDER_W) + 0.5 - (d.hasBorder                                 ? 0 : uc.PANEL_BORDER_WIDTH);
			//	var x =                d.x = lpw + uc.SPLITTER_WH + (1 * uc.SPLITTER_BORDER_W) + 0.5 - (d.hasBorder || d.parentPanel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH);
				var x =                d.x = lpw + uc.SPLITTER_WH + (1 * uc.SPLITTER_BORDER_W) + 0.5;	//	2017-May-26
				var y = d.y;
				return 'translate(' + x + ',' + y + ')'; 

			//	return 'translate(' + uc.OFFS_4_1_PIX_LINE + ',' + (d.y = tph + uc.SPLITTER_WH + (1 * uc.SPLITTER_BORDER_W) + 0.5) + ')'; 
			} );
			sw  = uc.SPLITTER_WH;
			rpw = d.w - (lpw + sw  + uc.SPLITTER_BORDER_W) - (d.hasBorder ? 1 : 0);
		//	rpw = d.w - (lpw + sw  + uc.SPLITTER_BORDER_W) - (d.hasBorder ? 1 : 0) + (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH);	//	2017-May-26
			rph = rpd.h + dy;
		//	sized3 ( rpd, rpw, rph, g2, false );
			sized2 ( rpd, g2, rpw - rpd.w, rph - rpd.h, false );
		}
		else
		if ( d.vertSplitter ) {		//	If  * this  panel *  is split vertically
			//	Move this panel's size rect.
			g.select ( '#' + d.eleId + '-size' )
				.placeSizeHandleRect();
			g.select ( '#' + d.eleId + '-size-left-border' )
				.placeSizeHandleLeftBorder();
			g.select ( '#' + d.eleId + '-size-top-border' )
				.placeSizeHandleTopBorder();

			var tpd = d.topPanel.data, tpw, tph, 
				sy, sh, 
				bpd = d.bottomPanel.data, bpw, bph;
			
			//	Size the top panel.
			g2  = d3.select ( '#' + tpd.eleId );
			tpw = tpd.w + dx;
			tph = Math.round ( d.h * d.tphf );
		//	cmn.log ( sW, '  tph: ' + tph );
		//	sized3 ( tpd, tpw, tph, g2, false );
			sized2 ( tpd, g2, tpw - tpd.w, tph - tpd.h, false );

			//	Move, Size the splitter.
			g2  = d.vertSplitter.g;
			sy  = tph + uc.SPLITTER_BORDER_W;
			g2.attr ( 'transform', function ( d ) { 
				return 'translate(' + uc.OFFS_4_1_PIX_LINE + ',' + (d.y = sy) + ')'; 
			} );
			g2.select ( 'rect' )
				.attr ( 'width', function ( d ) { 
					return d.w += dx; 
				} );
			g2.selectAll ( 'line' )
				.attr ( 'x2', function ( d ) { 
					return d.w; 
				} );

			//	Move, Size the bottom panel.
			g2  = d3.select ( '#' + bpd.eleId );
			g2.attr ( 'transform', function ( d ) { 
				return 'translate(' + uc.OFFS_4_1_PIX_LINE + ',' + (d.y = tph + uc.SPLITTER_WH + (1 * uc.SPLITTER_BORDER_W) + 0.5) + ')'; 
			} );
			sh  = uc.SPLITTER_WH;
			bpw = bpd.w + dx;
		//	bph = d.h - (tph + sh + uc.SPLITTER_BORDER_W) - 1;
			bph = d.h - (tph + sh + uc.SPLITTER_BORDER_W) - 1 + (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH);	//	2017-May-26
		//	sized3 ( bpd, bpw, bph, g2, false );
			sized2 ( bpd, g2, bpw - bpd.w, bph - bpd.h, false );
		}
		else {
			sized3 ( d, d.w, d.h, g, hasBorder );
		}

		d.panel.updateSclrs();
	}	//	sized2()

	function sized ( d, i, ele, dx, dy, hasBorder? ) {	//	called by ControlData
		var sW = 'sized()';
	//	cmn.log ( sW, ' w: ' + d.w + '   h: ' + d.h );
		var g;
	//	if ( ele )		//	ele, when specified, is expected to be the size rect
	//		g = d3.select ( ele.parentNode );
	//	else
	//	2017-May-21
	//	Specifying the parent node in the select() call does not set the selection's
	//	_parents. That is what happens when this is called by windowMouseMove() of
	//	udui-control-data.js.  The result is a reference exception in d3.
	//	So, for now, see if we can always select with d.eleId.
			g = d3.select ( '#' + d.eleId );
		sized2 ( d, g, dx, dy, uc.isDefined ( hasBorder ) ? hasBorder : true );

		if ( d.bSplitPanel ) 
			//	note that d.w, h are adjusted in size1()
			sized3 ( d, d.w, d.h, g, uc.isDefined ( hasBorder ) ? hasBorder : true );	

		if ( d.parentPanel )
			d.parentPanel.updateSclrs();
	}	//	sized()

//	function dragSized ( d, i, ele ) {
//		var sW = 'dragSized()';
//	//	cmn.log ( sW, ' w: ' + d.w + '   h: ' + d.h );
//		var g = d3.select ( this.parentNode );
//		sized2 ( d, g, d3.event.dx, d3.event.dy, true );
//		if ( d.parentPanel )
//			d.parentPanel.updateSclrs();
//	}	//	dragSized()


//	function dragSizeEnded ( d, i, ele ) {
//	//	cmn.log ( 'dragSizeEnded()' );
//	//	d3.select ( this )
//	//		.classed ( 'u34-size-handle-transparent', true  )
//	//		.classed ( 'u34-size-handle',             false );
//	//	always visible
//	}	//	dragSizeEnded()



	var filtersData = [];
	var nextFilterId = 0;

//	var clipPathsData = [];
//	var nextClipPathId = 0;


	function pushPanelClipPathData ( d ) {
		//	Will need clipPath defs.  See -
		//		http://bl.ocks.org/anonymous/2b1d992dfb66542ec1e2
		//		https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text 
		//		https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath
		//	Clip everything to not draw outside the panel. Match base rect.
	//	var bRootPanel = ! d.parentPanel;
	//	var bRootPanel = (! d.parentPanel) && (! (d.parent && d.parent.type === uc.TYPE_TABS0 ));	//	2017-May-28
		let rpd = d.rpd ? d.rpd : d;
		var cpd = new ClipPath ( 'cp-' + d.eleId + '-base', 
								 0, 				//	x
						   		 0, 				//	y
								 0,					//	w, see sizeBaseRectX() below
								 0 );				//	h, see sizeBaseRectY() below

		
		if ( (d.type === 'panel') && (! d.hasBorder) ) {	//	2017-May-08
			cpd.x -= uc.PANEL_BORDER_WIDTH;
			cpd.y -= uc.PANEL_BORDER_WIDTH;
		}

		sizeBaseRectX ( d, cpd );		//	sizeBaseRectX() makes the root panel decision
		sizeBaseRectY ( d, cpd );		//	sizeBaseRectY() makes the root panel decision
		rpd.clipPathsData.push ( cpd );
	}	//	pushPanelClipPathData()

	function Panel ( data ) {
		this.type = uc.TYPE_PANEL0;
		this.data = data;
	}

	function PanelData ( o ) { 

		//	Initialize the "base" of this object, ControlData -
		if ( ! cmn.isString ( o.name ) ) {
			o.name = 'pnlName'; }
		o.type      = uc.TYPE_PANEL;
		o.class     = o.class     === undefined ? 'u34-panel' : o.class;
		o.hasBorder = o.hasBorder === undefined ? true        : o.hasBorder;
		uCD.callControlData ( this, o );

		//	Initialize the rest of this object -

		this.bMoveRect = uc.isBoolean ( o.bMoveRect ) ? o.bMoveRect : true;
		this.bSizeRect = uc.isBoolean ( o.bSizeRect ) ? o.bSizeRect : true;
		this.bVertSB   = uc.isBoolean ( o.bVertSB ) ? o.bVertSB : true;
		this.bHorzSB   = uc.isBoolean ( o.bHorzSB ) ? o.bHorzSB : true;

		this.parentPanel = null;	//	set by the parent panel
		this.panel = null;			//	or the tabs

		if ( ! uc.isDefined ( o.eleId ) )
			this.eleId = null;		//	set by the parent panel

		this.parent = null;			//	set by parent if parent is not a panel 

		this.baseData = [];
		this.base = null;			//	base rect of the panel - what controls 
									//	are added to

		this.childData = { 			//	data of the child elements on the base 
									//	rect
			nextId: 	0,
			data: 		[]
		};

		this.baseClass   = o.baseClass   === undefined ? 'u34-panel-rect'   
													   : o.baseClass;
		this.borderClass = o.borderClass === undefined ? 'u34-panel-border' 
													   : o.borderClass;

		this.borderColor = cmn.isString ( o.borderColor ) ? o.borderColor
														  : '';

		this.clickCB      = uc.isFunction ( o.clickCB )      ? o.clickCB      
															 : null;
		this.shiftClickCB = uc.isFunction ( o.shiftClickCB ) ? o.shiftClickCB 
															 : null;
		this.onProperties = uc.isFunction ( o.onProperties ) ? o.onProperties 
															 : null;

		this.foInfoLabel = null;
		this.dragTarget   = null;
	//	this.isDragMoving = false;

		this.bSaveRect = false;			//	true when, for example, the panel is an application
										//	dialog panel - a built-in vs a user-defined panel

		//	like bSaveRect - clickable, normally hidden, hover over to find - rect at upper right
		this.hasCloseBox = o.hasCloseBox ? o.hasCloseBox : false;		

		this.hasConnectors = uc.isBoolean ( o.hasConnectors ) ? o.hasConnectors
															  : false;

		this.grid = {
			isEnabled: 	true,
			isVisible: 	true,
			spaceX: 	4,
			spaceY: 	4
		};

		//	To maintain the panel in storage (IndexedDB and/or Share) -
		//
		this.createdInSysId  = 0;		//	For now.
		this.createdByUserId = 0;		//	For now.

		//	Storage - parts of the item name.  storeId is common for all versions of the panel.
		//	storeName is unique for each version of the panel saved.
		let uduiId = o.uduiId ? o.uduiId : o.rpd.uduiId;
		this.storeId   =   o.bStore 
						 ? uSL.allocPanelStore ( uduiId, o.storeId ) //	later, udui may be that of a PE
						 : 0;
		this.storeName = o.storeName;		//	Unique name for the panel when the user does a Save As ...

		//	Sometimes a single control may fill the entire panel by itself.  
		//	For examples, tables and tabs.  
		this.filledBy = null;

		this.bSplitPanel = false;

		this.closeCB = o.closeCB ? o.closeCB : null;

		this.docked = o.docked ? o.docked : false;		//	when this panel is docked then 'left', 'top', 'right' or 
														//	'bottom'

		this.bParentSplitAndRoot = false;				//	true when this panel is docked to the root panel

		this.bW100Pct = uc.isBoolean ( o.bW100Pct ) ? o.bW100Pct : false;
		this.bH100Pct = uc.isBoolean ( o.bH100Pct ) ? o.bH100Pct : false;

		this.pathData = cmn.isArray ( o.pathData ) ? o.pathData : [];

		//	Name of component called on control events.
		this.codeName = cmn.isString ( o.codeName ) ? o.codeName : '';
		this.code	  = null;	//	Instantiated component.

		//	To connect registered panes.  See { do: 'register', ...
		//	JSON. Set as a property. Something like -
		//		{ id: 		, 			Uniquely identifies pane in layout
		//		  rcvFm: 	[<id>, ...],
		//		  sndTo: 	[<id>, ...] }
		this.regSpec = '';
		
		this.minHeight	= cmn.isNumber ( o.minHeight ) ? o.minHeight : 0;
		this.minWidth	= cmn.isNumber ( o.minWidth )  ? o.minWidth  : 0;

		this.hostFnc  = uc.isFunction ( o.hostFnc ) ? o.hostFnc : null;

		this.paneId	= 0;		//	Set by udui.jsx only on the rpd of a 
								//	udui pane.  Since each control has a 
								//	reference to its rpd each control can 
								//	know the pane it is on by rpd.paneId.

		this.panningEnabled = 	cmn.isBoolean ( o.panningEnabled ) 
											  ? o.panningEnabled
											  : false;

		//	Used to help set the initial position of a child control at the 
		//	upper left corner.
		this.baseX0 = null;		//	These are set when the panel is created
		this.baseY0 = null;		//	and they do not change after that.  See 
								//	pushPanelBaseData().  
		
		this.scale	= cmn.isNumber ( o.scale ) ? o.scale : 1;
		this.panX 	= cmn.isNumber ( o.panX )  ? o.panX  : null;
		this.panY 	= cmn.isNumber ( o.panY )  ? o.panY  : null;

		this.zoomListener	= null;
		//	Zoom G and Extents.
		this.zge			= { g:				null,
								lowerExtent:	0.1,
								upperExtent:	1.2 };

		this.bIsTabPanel	= cmn.isBoolean ( o.bIsTabPanel ) && o.bIsTabPanel;
		this.tabsData		= cmn.isObject ( o.tabsData ) ? o.tabsData : null;
		this.tabData		= cmn.isObject ( o.tabData )  ? o.tabData  : null;

		//	Mouse ops on the vertical scroller thumb.
	//	this.vsMouse		= { bActive:	false,
	//							mouseY0:	0,
	//							y0:			0,
	//							bdy0:		0 };
		this.onVScroll	  = vscrolled;
		this.onHScroll	  = hscrolled;

		//	Override some "base" properties -
		this.onMouseOver  = mouseOver;
		this.onMouseLeave = mouseLeave;
		this.onMouseDown  = mouseDown;
		this.onMouseMove  = mouseMove;
		this.onMouseUp    = mouseUp;
	//	this.onClick	  = click;			//	after focus
		this.onSizeStart  = sizeStart;
		this.onSize       = sized;
		this.onSize2      = sized2;
		this.onMove       = moved;
		this.onConnect    = connect;
	}	//	PanelData()

//	PanelData.prototype = uCD.newControlData();
//	PanelData.prototype.constructor = PanelData;
//	See createPanelData().

	function PanelData_afterLoad() {
		const sW = serviceId + ' afterLoad()';
		//	Call this after all the controls are loaded from persistence.
		//	E.g., see loadChildren() in udui.jsx.
		let self = this;
		let pathDataIds = {};
		this.childData.data.forEach ( cd => {
			cd.setZOrder ( null ); 
	
			if ( cd.type !== uc.TYPE_PANEL ) {
				return; }

			cd.pathData.forEach ( path => {
				let p2 = pathDataIds[path.pathId];	
				if ( ! p2 ) {
					pathDataIds[path.pathId] = path;
					return; }
				let sp2 = p2.startPoint;
				let ep2 = p2.endPoint;
				if ( sp2.panelName !== path.startPoint.panelName ) {
					cmn.error ( sW, 'path start points' ); 
					delete pathDataIds[path.pathId]; 
					return; }
				if ( ep2.panelName !== path.endPoint.panelName ) {
					cmn.error ( sW, 'path end points' ); 
					delete pathDataIds[path.pathId]; 
					return; }
			} );
		} );

		this.childData.data.forEach ( cd => {
			if ( cd.type !== uc.TYPE_PANEL ) {
				return; }
			cd.pathData = [];
		} );

		let keys = Object.keys ( pathDataIds );
		keys.forEach ( pathId => {
			let path = clone ( pathDataIds[pathId] );

			path.pathId = ++lastPathId;

			let sp = path.startPoint;
		//	cmn.log ( sW, 'sp: ' + sp.panelName );
			let spcd = self.getControl ( uc.TYPE_PANEL, sp.panelName );
			if ( ! spcd ) {
				cmn.error ( sW, 'path start point panel not found' ); 
				return; }
			else { 
				sp.panelDataId = spcd.id;
				delete ( sp.panelName ); }
			
			let ep = path.endPoint;
		//	cmn.log ( sW, 'ep: ' + ep.panelName );
			let epcd = self.getControl ( uc.TYPE_PANEL, ep.panelName );
			if ( ! epcd ) {
				cmn.error ( sW, 'path end point panel not found' ); 
				return; }
			else { 
				ep.panelDataId = epcd.id;
				delete ( ep.panelName ); }

			path.path = generatePathData ( path.startPoint, path.endPoint );

			spcd.pathData.push ( path );
			epcd.pathData.push ( path );

			d3.select ( '#' + self.eleId + '-base' )
				.append ( 'path' )
					.attr ( 'id',    self.eleId + '-path-' + path.pathId )
					.attr ( 'd',     path.path )
					.attr ( 'class', 'u34-path' );
		} );
		
		this.childData.data.forEach ( cd => {
			if ( cd.type !== uc.TYPE_PANEL ) {
				return; }
			cd.afterLoad();
		} );
	}	//	PanelData.prototype.afterLoad()

	function PanelData_disallowEdits() {
		var sW   = serviceId + ' PanelData.prototype.disallowEdits()';
		uCD.disallowEdits ( this );
		var i, data = this.childData.data, cd;
		for ( i = 0; i < data.length; i++ ) {
			data[i].disallowEdits(); }
		return null;
	}	//	PanelData.prototype.disallowEdits()

//	PanelData.prototype.getControl = function ( type, name ) {
	function PanelData_getControl ( type, name ) {
		var sW   = serviceId + ' PanelData.prototype.getControl()';
		var i, data = this.childData.data, cd;
		for ( i = 0; i < data.length; i++ ) {
			cd = data[i];
			if ( cd.name !== name ) {
				continue; }
			if ( type === uc.TYPE_ANY ) {
				return cd; }
			if ( cd.type === type ) {
				return cd; } }
		return null;
	}	//	PanelData.prototype.getControl()

	function PanelData_getControlById ( id ) {
		var sW   = serviceId + ' PanelData.prototype.getControlById()';
		var i, data = this.childData.data, cd;
		for ( i = 0; i < data.length; i++ ) {
			cd = data[i];
			if ( cd.id === id ) {
				return cd; } }
		return null;
	}	//	PanelData.prototype.getControlById()

	function PanelData_listProperties() {
		var sW = serviceId + ' PanelData.prototype.listProperties()';
		let self = this;
		function longRegSpec ( cellD ) {
			let td = cellD.tableData;
			let displayName = td.rows[cellD.iRow].cells[0].text;
			let value       = cellD.inputEle.value;
		//	cmn.log ( sW + ' longRegSpec()',   ' displayName: ' + displayName 
		//									 + '  value: ' + value );
		//	cmn.log ( sW + ' longRegSpec()', ' self.name: ' + self.name );

			//	Show long-text dialog. Initialize with value.
			//	On OK set regSpec property.
			if ( ! cmn.isFunction ( self.hostFnc ) ) {
				cmn.error ( 'hostFnc is not set' );
				return; }

			//	Dialog to edit long text.
			function onOK ( a ) {
			//	cmn.log ( sW, ' onOK()' );

				//	Set regSpec property.
				try {
					let o = JSON.parse ( a.text );	//	just checking
					self.regSpec = a.text; 
					cellD.inputEle.value = a.text; }
				catch ( err ) {
					cmn.error ( sW + ' onOK()', err ); }
			}	//	onOK()
		
			self.hostFnc ( { do:	'long-text-dialog',
							 title:	'Registration Spec',
							 onOK:	onOK,
						//	 text:	value } );
							 text:	self.regSpec } );
		}	//	longRegSpec()

		var whiteList = [ 'borderColor', 'panningEnabled', 'bVertSB', 'bHorzSB',
						  'panX', 'panY', 'codeName', 'regSpec', 'minHeight', 
						  'minWidth' ];
		var value, displayName, longTextCB, props = uCD.listProperties ( this );
	//	for ( var key in this ) {
	//		if ( ! whiteList.includes ( key ) )
	//			continue;
		whiteList.forEach ( key => {
			value = self[key];
			if ( value === undefined ) {
				return; }
			if ( value === null ) {
				return; }
			displayName = key;
			longTextCB  = null;
			switch ( key ) {
				case 'borderColor':		
					displayName = 'border color';
					if (    (! cmn.isString ( value )) 
						 || (value.trim().length === 0) ) {
						value = 'default'; }
					break;
				case 'panningEnabled':	displayName = 'can pan';
										break;
				case 'bVertSB':	displayName = 'has vert scrollbar';
								break;
				case 'bHorzSB':	displayName = 'has horz scrollbar';
								break;
				case 'panX':	if ( ! self.panningEnabled ) {
									return; }
								displayName = 'pan x';
								value -= self.baseX0;
								break;
				case 'panY':	if ( ! self.panningEnabled ) {
									return; }
								displayName = 'pan y';
								value -= self.baseY0;
								break;
				case 'codeName':	displayName = 'code';			
									break;
				case 'regSpec':		displayName = 'registration';	
									longTextCB  = longRegSpec;
									break;
				case 'minWidth':	displayName = 'min width';
									break;
				case 'minHeight':	displayName = 'min height';
									break;
			}
		//	cmn.log ( sW, '   key: ' + key + '  value: ' + value );
			props.push ( { property:	key, 
						   value:		value, 
						   type:		typeof value,
						   step:		0,
						   displayName:	displayName,
						   longTextCB:	longTextCB } );
		} );
		return props;
	}	//	PanelData.prototype.listProperties()

	function PanelData_setProperty ( name, value ) {
		const sW = serviceId + ' PanelData.prototype.setProperty()';
		let rtn = uCD.setProperty ( this, name, value );
		if ( rtn )
			return rtn;
		if ( name === 'borderColor' ) {
			if ( ! cmn.isString ( value ) ) {
				value = ''; }
			value = value.trim().toLowerCase();
			if ( value === 'default' ) {
				this[name] = ''; }
			else {
				this[name] = value; } 
			let s = this[name];
			let color =	(s.length > 0) && (s !== 'default') ? s : 'null'; 
			d3.select ( '#' + this.eleId + '-panel-border' )
				.attr ( 'style', 'stroke: '  + color ); }
		if ( name === 'panningEnabled' ) {
			let bWas = this[name];
			this[name] = uc.booleanify ( value ); 
			if ( 	cmn.isFunction ( this.onProperties ) 
				 && (this[name] !== bWas) ) {
				this.onProperties ( this ); } }
		if ( name === 'bVertSB' ) {
			let bWas = this[name];
			this[name] = uc.booleanify ( value ); 
			if ( 	cmn.isFunction ( this.onProperties ) 
				 && (this[name] !== bWas) ) {
				//	Show/Hide vert scroll bar.
				if ( this[name] ) {
					let g = d3.select ( '#' + this.eleId );
					defineVSclr ( g ); 
					updateVsclr0 ( this.eleId ); }
				else {
					svc.removeVSclr ( this ); }
				this.onProperties ( this ); } }
		if ( name === 'bHorzSB' ) {
			let bWas = this[name];
			this[name] = uc.booleanify ( value ); 
			if ( 	cmn.isFunction ( this.onProperties ) 
				 && (this[name] !== bWas) ) {
				//	Show/Hide horz scroll bar.
				if ( this[name] ) {
					let g = d3.select ( '#' + this.eleId );
					defineHSclr ( g );
					updateHsclr0 ( this.eleId ); }
				else {
					svc.removeHSclr ( this ); }
				this.onProperties ( this ); } }
		if ( name === 'panX' ) {
			let v = parseInt ( value );
			if ( ! cmn.isNumber ( v ) ) {
				return -1; }
			let x0 = this[name];
			let x  = v + this.baseX0; 
			let cb = this.propCB;
					 this.propCB = null;
			this.panel.scroll ( { dx: x - x0,  dy: 0 } ); 
			this.propCB = cb; }
		if ( name === 'panY' ) {
			let v = parseInt ( value );
			if ( ! cmn.isNumber ( v ) ) {
				return -1; }
			let y0 = this[name];
			let y  = v + this.baseY0; 
			let cb = this.propCB;
					 this.propCB = null;
			this.panel.scroll ( { dx: 0,  dy: y - y0 } ); 
			this.propCB = cb; }
		if ( name === 'codeName' ) {
			this[name] = value; }
		if ( name === 'regSpec' ) {
			if ( (! cmn.isString ( value )) || (value === '') ) {
				this[name] = ''; }
			else {
				try {
					let o = JSON.parse ( value );	//	just checking
					this[name] = value; }
				catch ( err ) {
					cmn.error ( sW, err ); } } }
		while ( name === 'minWidth' ) {
			let v = parseInt ( value );
			if ( (! cmn.isNumber ( v )) || (v < 0) ) {
				return -1; }
			this[name] = v;
			if ( v === 0 ) {
				break; }
			if ( this.w < v ) {
				let w = v, h = this.h;
				let g = d3.select ( '#' + pd.eleId );
				sized3 ( pd, w, h, g, false ); }
			break; }
		while ( name === 'minHeight' ) {
			let v = parseInt ( value );
			if ( (! cmn.isNumber ( v )) || (v < 0) ) {
				return -1; }
			this[name] = v; 
			if ( v === 0 ) {
				break; }
			if ( this.h < v ) {
				let w = this.w, h = v;
				let g = d3.select ( '#' + pd.eleId );
				sized3 ( pd, w, h, g, false ); }
			break; }
		return 0;
	}	//	PanelData.prototype.setProperty()

	function PanelData_hotCtrlD ( o ) {
		var sW   = serviceId + ' PanelData.prototype.hotCtrlD()';

		if ( ! o.ev.altKey ) {
			return null; }

		//	Look for a label whose hotKey === o.ev.key.
		let kUC = o.ev.key.toUpperCase();
		let i, data = this.childData.data, cd, assoc = null;
		for ( i = 0; i < data.length; i++ ) {
			cd = data[i];
			if (   (cd.type === uc.TYPE_LABEL )
				&& (cd.hotKey.toUpperCase() === kUC ) ) {
				assoc = cd.assoc; 
				break; } }
		if ( ! assoc ) {
			return null; }

		//	Now find assoc.
		for ( i = 0; i < data.length; i++ ) {
			cd = data[i];
			if ( cd.name === assoc ) {
				return cd; } }

		return null;
	}	//	PanelData_hotCtrlD();

	function PanelData_checkPan ( dx, dy ) {
		const sW = serviceId + ' PanelData.prototype.checkPan()';

		//	See GraphData.prototype.checkPan()

	}	//	PanelData.prototype.checkPan();

	svc.createPanelData = function ( o ) {

	//	if ( PanelData.prototype.constructor.name === 'PanelData' ) {
	//		//	Do this once, here to avoid cir ref issue
			PanelData.prototype = uCD.newControlData();
			PanelData.prototype.constructor = PanelData;
			PanelData.prototype.afterLoad = PanelData_afterLoad;
			PanelData.prototype.disallowEdits = PanelData_disallowEdits;
			PanelData.prototype.getControl = PanelData_getControl;
			PanelData.prototype.getControlById = PanelData_getControlById;
			PanelData.prototype.listProperties = PanelData_listProperties;
			PanelData.prototype.setProperty = PanelData_setProperty;
			PanelData.prototype.hotCtrlD = PanelData_hotCtrlD;
			PanelData.prototype.checkPan = PanelData_checkPan;
	//	}

	//	o.bStore    = true;
	//	o.storeId   = 0;
	//	o.storeName = null;
		if ( ! uc.isDefined ( o.bStore ) )
			o.bStore    = true;
		if ( ! uc.isDefined ( o.storeId ) )
			o.storeId   = 0;
		if ( ! uc.isDefined ( o.storeName ) )
			o.storeName = null;
		return new PanelData ( o );
	};	//	svc.createPanelData()

	svc.restorePanelData = function ( o ) {
		return svc.createPanelData ( o );
	};	//	svc.restorePanelData()

	//	root panel, maybe app dialog panels, etc.. any panel that is not created by
	//	the user
	svc.createAppPanelData = function ( o ) { 
		o.bStore = true;
		return svc.createPanelData ( o );
	};	//	svc.createAppPanelData()

	//	panels that are not stored
	svc.createTemporaryPanelData = function ( o ) {
		o.bStore = false;
		return svc.createPanelData ( o );
	};	//	svc.createTemporaryPanelData()


	Panel.prototype.updateSclrs = function() {
		var pd = this.data;
		if ( pd.bSplitPanel )
			return;
		if ( pd.bVertSB )
			updateVsclr0 ( pd.eleId );
		if ( pd.bHorzSB )
			updateHsclr0 ( pd.eleId );
	};	//	Panel.prototype.updateSclrs()


	Panel.prototype.addClipPath = function ( ctrlData ) {
		let rpd = ctrlData.rpd ? ctrlData.rpd : ctrlData;
		if ( (! rpd) || (! rpd.svg) ) {
			cmn.error ( 'Panel.prototype.addClipPath()',  ' ! rpd.svg' );
			return;	}
		if ( ctrlData.type === uc.TYPE_PANEL )
			pushPanelClipPathData ( ctrlData );
		else
		if ( 	(ctrlData.type === uc.TYPE_BUTTON)
			 || (ctrlData.type === uc.TYPE_CHECKBOX)
			 || (ctrlData.type === uc.TYPE_LABEL)
			 || (ctrlData.type === uc.TYPE_INPUT) ) {
			//	Clip path - Offset by 2 from group/rect x and y, -4 on group/rect w and h.
			//	This should probably be the "root" panel - where all the <defs> data goes.
			rpd.clipPathsData.push ( new ClipPath ( 'cp-' + ctrlData.eleId, 
													2,  2, ctrlData.w - 5, 
														   ctrlData.h - 5 ) ); }
		else
		if ( 	(ctrlData.type === uc.TYPE_LIST)
			 || (ctrlData.type === uc.TYPE_TREE)
			 || (ctrlData.type === uc.TYPE_TABS) ) {
			rpd.clipPathsData.push ( new ClipPath ( 'cp-' + ctrlData.eleId, 
													-uc.OFFS_4_1_PIX_LINE,
													-uc.OFFS_4_1_PIX_LINE,
													ctrlData.w, 
													ctrlData.h - 1 ) ); }
		else
		if ( ctrlData.type === uc.TYPE_GRAPH ) {
			rpd.clipPathsData.push ( new ClipPath ( 'cp-' + ctrlData.eleId, 
													-uc.OFFS_4_1_PIX_LINE,
													-uc.OFFS_4_1_PIX_LINE,
													ctrlData.w - 1, 
													ctrlData.h - 1 ) ); }
		else
		if ( ctrlData.type === uc.TYPE_TABLE  ) {
			//	Just the title area (for now?).
			let titleH = 20;		//	for now
			rpd.clipPathsData.push ( new ClipPath ( 'cp-' + ctrlData.eleId, 
													-uc.OFFS_4_1_PIX_LINE,
													-uc.OFFS_4_1_PIX_LINE,
													ctrlData.w - 1, 
													titleH ) ); }

		//	Evidently having multiple <defs> messes things up.  Putting all the clip paths 
		//	under one <defs>.
	//	d3.select ( 'defs' )
		rpd.svg.select ( 'defs' )
			.selectAll ( 'clipPath' )
			.data ( rpd.clipPathsData, function ( d ) { 
				return d.id || (d.id = ++rpd.nextClipPathId); 
			} )
			.enter()
			.append ( 'clipPath' )
			.attr ( 'id', function ( d, i ) { return d.eleId; } )					//	e.g., 'cp-base' and/or 'cp-btnA'
			.append ( 'rect' )
			.attr ( 'id',     function ( d, i ) { return d.eleId + '-rect'; } )		//	e.g., 'cp-base-rect' and/or 'cp-btnA-rect'
			.attr ( 'x',      function ( d, i ) { return d.x; } )
			.attr ( 'y',      function ( d, i ) { return d.y; } )
		//	//	2017-May-08
		//	.attr ( 'x',      function ( d, i ) { 
		//		return d.x + ((ctrlData.type === 'panel') && (! ctrlData.hasBorder) ? uc.PANEL_BORDER_WIDTH : 0); 
		//	} )
		//	.attr ( 'y',      function ( d, i ) { 
		//		return d.y + ((ctrlData.type === 'panel') && (! ctrlData.hasBorder) ? uc.PANEL_BORDER_WIDTH : 0); 
		//	} )
			.attr ( 'width',  function ( d, i ) { return d.w; } )
			.attr ( 'height', function ( d, i ) { return d.h; } );
	};	//	Panel.prototype.addClipPath()

//	Panel.prototype.adjustClipPath = function ( ctrlData ) {
	svc.adjustClipPath = function ( ctrlData ) {
		if ( 	(ctrlData.type !== uc.TYPE_LIST)
			 && (ctrlData.type !== uc.TYPE_TREE) ) {
			return; }		//	only for lists and trees, for now
		let rpd = ctrlData.rpd ? ctrlData.rpd : ctrlData;
		var cpEleId = 'cp-' + ctrlData.eleId;
		var cpd = rpd.clipPathsData.find ( function ( cpd ) { 
					return cpd.eleId === cpEleId; } );
		if ( ! cpd )
			return;
		cpd.h = ctrlData.h - 1;
		d3.select ( '#' + cpEleId + '-rect' )
			.attr ( 'height', function ( d: any, i ) { 
				return d.h > 0 ? d.h - 1 : 0;
			} );
//	};	//	Panel.prototype.adjustClipPath()
	};	//	svc.adjustClipPath()

	svc.nextEleId = 0;

	Panel.prototype.addControl = function ( ctrlData ) {
		const sW = serviceId + ' PanelData.prototype.addControl()';
		var panel = this, child = null;

		ctrlData.parentPanel = panel;
	//	ctrlData.eleId       = panel.data.eleId + '-' + ctrlData.name;
	//	ctrlData.eleId       = panel.data.eleId + '-' + (++svc.nextEleId);
		if ( ! ctrlData.eleId )	{	//	for e2e tests, eleId may already be set to something fixed, known
		//	ctrlData.eleId = panel.data.eleId + '-' + (++svc.nextEleId);
			ctrlData.eleId = 'rr-'                  + (++svc.nextEleId);
		 	//	E2e tests or no, add type name to eleId.
			if ( cmn.isString ( ctrlData.type ) ) {
				ctrlData.eleId += '-' + ctrlData.type; }
			if ( cmn.isString ( ctrlData.name ) ) {
				ctrlData.eleId += '-' + ctrlData.name; } }

		let pd = panel.data;

		panel.addClipPath ( ctrlData );

		panel.data.childData.data.push ( ctrlData );


		if ( ctrlData.type === uc.TYPE_BUTTON ) {
		//	uButton.defineButton ( panel.data.base, panel.data.childData );
			child = uButton.defineButton ( panel ); }

		if ( ctrlData.type === uc.TYPE_INPUT ) {
			child = uInput.defineInput ( panel ); }

		if ( ctrlData.type === uc.TYPE_LABEL ) {
			child = uLabel.defineLabel ( panel ); }

		if ( ctrlData.type === uc.TYPE_TEXTAREA ) {
			child = uTextarea.defineTextarea ( panel ); }

		if ( ctrlData.type === uc.TYPE_CHECKBOX ) {
			child = uCheckbox.defineCheckBox ( panel ); }

		if ( ctrlData.type === uc.TYPE_TABS ) {
			child = uTabs.defineTabs ( panel ); }

		if ( ctrlData.type === uc.TYPE_TABLE ) {
			child = uTable.defineTable ( panel ); 
			if ( ctrlData.fillsPanel ) {
				pd.filledBy = child; 
				child.parentSizedAbsolute ( pd.baseData[0].w, 
											pd.baseData[0].h ); } }

		if ( ctrlData.type === uc.TYPE_PANEL ) {
			child = svc.createPanel ( panel.data.base, 
									  panel.data.childData, false ); }

		if ( ctrlData.type === uc.TYPE_SPLITTER ) {
			child = uSplitter.defineSplitter ( panel ); }

		if ( ctrlData.type === uc.TYPE_LIST ) {
			child = uList.defineList ( panel ); }

		if ( ctrlData.type === uc.TYPE_TREE ) {
			child = uTree.defineTree ( panel ); }

		if ( ctrlData.type === uc.TYPE_GRAPH ) {
			child = uGraph.defineGraph ( panel ); }

		if ( ctrlData.type === uc.TYPE_EDITOR ) {
			child = uEditor.defineEditor( panel ); }

	//	updateVsclr0 ( panel.data.eleId );
	//	updateHsclr0 ( panel.data.eleId );
	//	//
		//	When loading (restoring from persistence) ...
		//
		//		Calling dragSclred2() which transforms the base <g> and moves the base <rect>
		//		works to fix (for some reason unknown by me right now) the problem of mouse 
		//		events not being seen in areas where the panel has been panned away from - even 
		//		though chrome debugger indicates the mouse is over the <rect>.
		//
		//		I noticed this in a child panel.  It might have something to do with the 
		//		parent panel (i.e., the root panel) being panned.
		//
		var sel: any = d3.select ( '#' + panel.data.eleId + '-base' );
	//	var sel = d3.select ( '#' + panel.data.eleId + '-base-rect' );
		var ele = sel._groups[0];
		if ( ele[0] )		//	will be null for panel containing splitter
			dragSclred2.call ( ele[0], ele[0].__data__, 0, ele, { dx: 0, dy: 0 } );

		//	In case the child x, y, w and/or h need to be evaluated ...
		if ( ! cmn.isFunction ( ctrlData.parentSized ) ) {
			cmn.error ( sW, 'function ctrlData.parentSized is not set' ); }
		else {
			ctrlData.parentSized(); }

		return child;
	};	//	Panel.prototype.addControl()

	Panel.prototype.scroll = function ( rgs ) {		//	or, that is, pan
		var panel = this;
		var sel: any = d3.select ( '#' + panel.data.eleId + '-base' );
		var ele = sel._groups[0];
		if ( ele[0] )		//	will be null for panel containing splitter
			dragSclred2.call ( ele[0], ele[0].__data__, 0, ele, rgs );
	};	//	Panel.prototype.scroll()

//	Panel.prototype.rmvControls = function ( ctrls ) {
//		var panel = this;
//
//	//	Removing the clip paths from <defs> is done more generally from updatePanels().
//
//		if ( ctrls.type === 'panel' ) {
//			svc.updatePanels ( panel.data.base, ctrls );
//		} 
//
//		updateVsclr0 ( panel.data.eleId );
//		updateHsclr0 ( panel.data.eleId );
//	};	//	Panel.prototype.rmvControls()

	function getRemainingPanel ( parentPanel, ctrl ) {
		var ppd = parentPanel.data;
		var eleId = ctrl.data.eleId;
		var remainingPanel = null;
		if ( ppd.bSplitPanel && (ctrl.data.constructor === PanelData) ) {
			if ( 	uc.isDefined ( ppd.leftPanel )
				 && uc.isDefined ( ppd.rightPanel ) ) {
				if ( ppd.leftPanel.data.eleId === eleId )
					remainingPanel = ppd.rightPanel;
				else
				if ( ppd.rightPanel.data.eleId === eleId )
					remainingPanel = ppd.leftPanel;
			}
			else
			if ( 	uc.isDefined ( ppd.topPanel )
				 && uc.isDefined ( ppd.bottomPanel ) ) {
				if ( ppd.topPanel.data.eleId === eleId )
					remainingPanel = ppd.bottomPanel;
				else
				if ( ppd.bottomPanel.data.eleId === eleId )
					remainingPanel = ppd.topPanel;
			}
	//		if ( ! remainingPanel ) {
	//			cmn.error ( sW, 'split but no remaining panel' );
	//			return;
	//		}
		}
		return remainingPanel;
	}	//	getRemainingPanel()

	Panel.prototype.rmvControl = function ( ctrl, opts ) {
		var sW = serviceId + ' rmvControl()';
		var panel = this, remainingPanel = null;

		if ( ctrl.type === uc.TYPE_PANEL0 ) {
			remainingPanel = getRemainingPanel ( panel, ctrl ); }

	//	Removing the clip paths from <defs> is done more generally from updatePanel().

		svc.updatePanel ( panel, ctrl, opts );

		if ( remainingPanel ) {
			panel.unsplit ( remainingPanel );
			return;
		}

		updateVsclr0 ( panel.data.eleId );
		updateHsclr0 ( panel.data.eleId );

		if ( cmn.isFunction ( panel.data.hostFnc ) ) {
			panel.data.hostFnc ( { do: 		'control-removed',
								   ctrlId:	ctrl.id } ); }
	};	//	Panel.prototype.rmvControl()


	Panel.prototype.appendDialog = function ( dlg ) {
		var sW = serviceId + ' appendDialog()';
		var panel = this;		//	we should be the app's root panel
		let rpd = panel.data.rpd;
		if (    rpd
			 && (panel.data.eleId !== uc.appScreenPanelEleId ( rpd ) ) ) {
		//	cmn.error ( sW, 'this is expected to be the root panel' );
			return;
		}

	//	if ( dlg.invokingPanel.data.eleId !== panel.data.eleId ) {		//	if invoker is not the root panel
		//	2017-Aug
		if (    (dlg.invokingPanel.data.eleId !== panel.data.eleId)		//	if invoker is not the root panel
			 && ! uc.isAppScreenPanel ( dlg.invokingPanel ) ) {			//	and is not the app screen
			//	A screen to make the invoking panel appear disabled and to capture its 
			//	mouse actions.
			var g = d3.select ( '#' + dlg.invokingPanel.data.eleId );
			g
				.append ( 'rect' ) 
				.attr ( 'id',     panel.data.eleId + '-dialog-screen' )
				.attr ( 'x',      0 + uc.OFFS_4_1_PIX_LINE )
				.attr ( 'y',      0 + uc.OFFS_4_1_PIX_LINE )
				.attr ( 'width',  function ( d: any ) { return d.w - uc.PANEL_BORDER_WIDTH; } )
				.attr ( 'height', function ( d: any ) { return d.h - uc.PANEL_BORDER_WIDTH; } )
				.attr ( 'class',  'u34-dialog-screen' );
		}

		//	Offset the specified location by this panel's base rect position (due to 
		//	panning/scrolling).
		//
		var bd = panel.data.baseData[0];
		var dd = dlg.data;
		dd.x = (dd.x - bd.x) + uc.OFFS_4_1_PIX_LINE;
		dd.y = (dd.y - bd.y) + uc.OFFS_4_1_PIX_LINE;

		//	Now simply add the dialog as another child panel control of the root panel.
		//
		var dlgPanel = dlg.panel = panel.addControl ( dlg.data );

		return dlgPanel;
	};	//	Panel.prototype.appendDialog()

//	Panel.prototype.removeDialog = function ( invokingPanel, dlg ) {
	Panel.prototype.removeDialog = function (                dlg ) {
		var sW = serviceId + ' removeDialog()';
		var panel = this;		//	we should be the app's root panel

		if ( panel.data.rpd ) {
			cmn.error ( sW, 'this is expected to be the root panel' );
			return;	}

		//	First the dialog itself.
//		panel.rmvControls ( dlg );
		panel.rmvControl ( dlg.panel );

		//	Now the screen over the invoking panel.
		var g = d3.select ( '#' + dlg.invokingPanel.data.eleId );
		g
			.select ( '#' + panel.data.eleId + '-dialog-screen' )
			.remove();
	};	//	Panel.prototype.removeDialog()


//		Panel.prototype.appendPopup = function() {
//
//			//	Unlike appendDialog(), all panels  * but *  the invoking panel are screened.
//
//		};	//	Panel.prototype.appendPopup()


	Panel.prototype.appendBoard = function ( spec ) {
		var sW = serviceId + ' appendBoard()';
		var panel = this;		//	we should be the app's root panel

		if ( panel.data.rpd ) {
			cmn.error ( sW, 'this is expected to be the root panel' );
			return; }

		//	Like appendDialog(), but -
		//
		//		Boards do not disable any part of app.  No "screens".

		//	Offset the specified location by this panel's base rect position (due to 
		//	panning/scrolling).
		//
		var bd = panel.data.baseData[0];
		var dd = spec.panelData;
		dd.x = (dd.x - bd.x) + uc.OFFS_4_1_PIX_LINE;
		dd.y = (dd.y - bd.y) + uc.OFFS_4_1_PIX_LINE;

		//	Now simply add the board as another child panel control of the root panel.
		//
		var boardPanel = spec.panel = panel.addControl ( spec.panelData );

		return boardPanel;
	};	//	Panel.prototype.appendBoard()


//	Panel.prototype.splitPrep = function ( current, drop,     dtIsSrcParent ) {
	Panel.prototype.splitPrep = function ( current, dropData, dtIsSrcParent ) {
		var panel = this;

		//	Get the current child controls data.
		//
		current.nextId = panel.data.childData.nextId;
		current.data   = [];
		panel.data.childData.data.forEach ( function ( ctrl ) { 
//			if ( drop     && dtIsSrcParent && (ctrl.eleId === drop.data.eleId) )
			//	If ctrl is what is being dropped ...
			//		When does this happen?  I.e., when is something dropped in
			//		the same panel it comes from?
			if ( dropData && dtIsSrcParent && (ctrl.eleId ===  dropData.eleId) ) 	
				return;
			current.data.push ( ctrl ); 
		} );

		//	Remove control elements from this panel.  The child elements of 
		//	this panel's base <g>.  Possibly just remove the base <g>.  And
		//	don't forget the clip paths.  
		//
		svc.removeBaseG ( panel );			//	not the <g>, but its content <g>s
		svc.removeSclrs ( panel );			//	And the scrollers.

		//	But we need a base because that is the element controls are added to.
		//
		//	This panel's base is now ... this panel's <g> -
		//
	//	panel.data.base = d3.select ( '#' + panel.data.eleId );		now the base is maintained
	//																see changes in removeBaseG()
	};	//	splitPrep()

	svc.clear = function ( panel ) {
		var cd = panel.data.childData.data;
		while ( cd.length > 0 ) {
			svc.updatePanel ( panel, cd[0], { bKeepChildClipPaths: 	false,
											  baseEleId: 			panel.data.eleId + '-base' } );
		}
	}	//	svc.clear()

	svc.addCtrls = function ( panel, childData, rmvFromEleId ) {
		if ( ! childData )
			return;
	//	var data = childData.data;
	//	panel.data.childData.data   = [];
		//	Need to do a D3 select - .exit-.remove thing here.  Maybe call svc.updatePanel() ?
		//	Something like (as in Panel.prototype.unsplit()) -
		var data = [];
		childData.data.forEach ( function ( d ) {
			data.push ( d );
		} );
		if ( uc.isDefined ( rmvFromEleId ) && !!rmvFromEleId) {
			var cd = panel.data.childData.data;
			while ( cd.length > 0 ) {
				svc.updatePanel ( panel, cd[0], { bKeepChildClipPaths: 	true,
												  baseEleId: 			rmvFromEleId + '-base' } );
			}
		}
		panel.data.childData.nextId = childData.nextId;
		data.forEach ( function ( ctrlD ) { 
		//	var copyD = angular.copy ( ctrlD );
		//	if ( copyD.type === uc.TYPE_PANEL )
		//		copyD.baseData = [];
		//	var ctrl = panel.addControl ( copyD ); 
		//	if ( copyD.fillsPanel )
		//		panel.data.filledBy = ctrl;
		//
		//	if ( copyD.type === uc.TYPE_PANEL ) 
		//		svc.addCtrls ( ctrl, copyD.childData );
		//	//	
			//	To maintain references - do not copy - use existing data.
			//	For example, references between a label and the properties board/table.
			//
			if ( ctrlD.type === uc.TYPE_PANEL )
				ctrlD.baseData = [];
			var ctrl = panel.addControl ( ctrlD ); 
			if ( ctrlD.fillsPanel ) {
				panel.data.filledBy = ctrl; }

			if ( ctrlD.type === uc.TYPE_PANEL ) 
				svc.addCtrls ( ctrl, ctrlD.childData );
		} );
	};	//	addCtrls()

	svc.addCtrls2 = function ( panel, childData ) {
		if ( ! childData )
			return;
		panel.data.childData.nextId = childData.nextId;
		childData.data.forEach ( function ( ctrlD ) { 
		//	var copyD = angular.copy ( ctrlD );
		//	if ( copyD.type === uc.TYPE_PANEL )
		//		copyD.baseData = [];
		//	var ctrl = panel.addControl ( copyD ); 
		//	if ( copyD.fillsPanel )
		//		panel.data.filledBy = ctrl;
		//
		//	if ( copyD.type === uc.TYPE_PANEL ) 
		//		svc.addCtrls ( ctrl, copyD.childData );
		//	//	
			//	To maintain references - do not copy - use existing data.
			//	For example, references between a label and the properties board/table.
			//
			if ( ctrlD.type === uc.TYPE_PANEL )
				ctrlD.baseData = [];
			var ctrl = panel.addControl ( ctrlD ); 
			if ( ctrlD.fillsPanel ) {
				panel.data.filledBy = ctrl; }

			if ( ctrlD.type === uc.TYPE_PANEL ) 
				svc.addCtrls ( ctrl, ctrlD.childData );
		} );
	};	//	addCtrls2()

//	Panel.prototype.splitAddPanel = function ( x, y, w, h, dataName, eleId, ctrls, cb ) {
	Panel.prototype.splitAddPanel = function ( x, y, w, h, dataName, eleId, pd,    cb, docked, bParentSplitAndRoot ) {
		var sW = serviceId + ' Panel.prototype.splitAddPanel()';
		var panel = this, ctrls = null;
		let rpd = panel.data.rpd ? panel.data.rpd : panel.data;
		var oldPanelEleId = null;

		if ( ! pd ) 	//	If, for example, splitting an empty panel.  See splitVert(), splitHorz().
			pd = svc.createPanelData ( { rpd:		rpd,
										 x: 		x, 
										 y: 		y, 
										 w: 		w, 
										 h: 		h, 
										 name: 		dataName,
										 clickCB: 	cb,
										 docked: 	docked } );

		if ( pd.constructor !== PanelData ) {
			cmn.error ( sW, ' WARNING: expect pd to be PanelData' );
			ctrls = pd;
			pd = svc.createPanelData ( { rpd:		rpd,
										 x: 		x, 
										 y: 		y, 
										 w: 		w, 
										 h: 		h, 
										 name: 		dataName,
										 clickCB: 	cb,
										 docked: 	docked } );
		} else {
			oldPanelEleId = pd.eleId;
			pd.x = x;
			pd.y = y;
			pd.w = w;
			pd.h = h;
			pd.baseData = [];
			pd.docked = docked;
			pd.id = 0;				//	to get a new ID that will not conflict with sibling's
			pd.eleId = null;		//	to not be same as what might be destroyed
			ctrls = pd.childData;
		}

		pd.hasBorder = false;
		pd.bMoveRect = false;
		pd.bSizeRect = false;
		pd.bParentSplitAndRoot = uc.isDefined ( bParentSplitAndRoot ) ? bParentSplitAndRoot : false;

		var newPanel = panel.data[dataName] = panel.addControl ( pd );

		svc.addCtrls ( newPanel, ctrls, oldPanelEleId );

		if ( pd.filledBy ) {
			pd.filledBy.parentSizedAbsolute ( pd.baseData[0].w, 
											  pd.baseData[0].h ); }

		if ( pd.constructor === PanelData )
			pd.onSize ( pd, -1, null, 0, 0 );

		return newPanel;
	};	//	Panel.prototype.splitAddPanel()

	Panel.prototype.splitAddPanel2 = function ( x, y, w, h, dataName, childData,  cb, docked, bParentSplitAndRoot ) {
		var sW = serviceId + ' Panel.prototype.splitAddPanel2()';
		var panel = this;
		let rpd = panel.data.rpd ? panel.data.rpd : panel.data;
		var	pd = svc.createPanelData ( { rpd:		rpd,
										 x: 		x, 
										 y: 		y, 
										 w: 		w, 
										 h: 		h, 
										 name: 		dataName,
										 clickCB: 	cb,
										 docked: 	docked } );
		pd.hasBorder = false;
		pd.bMoveRect = false;
		pd.bSizeRect = false;
		pd.bParentSplitAndRoot = uc.isDefined ( bParentSplitAndRoot ) ? bParentSplitAndRoot : false;

		var newPanel = panel.data[dataName] = panel.addControl ( pd );

		svc.addCtrls2 ( newPanel, childData );

		if ( pd.filledBy ) {
			pd.filledBy.parentSizedAbsolute ( pd.baseData[0].w, 
											  pd.baseData[0].h ); }

		if ( pd.constructor === PanelData )
			pd.onSize ( pd, -1, null, 0, 0 );

		return newPanel;
	};	//	Panel.prototype.splitAddPanel2()

	function borderInAncestry ( d ) {				//	2017-May-28
		//	Same as asking if the panel or its parent(s) is docked in the root panel. Because the 
		//	root panel is the only panel that does not have a border. For now. Possibly a tab content 
		//	panel would not have a border - in the future. Maybe.
		if ( d.hasBorder )
			return true;
		if ( ! d.parentPanel )
			return false;
		return borderInAncestry ( d.parentPanel.data );			
	}

	function horzSplitPanelWidth ( d ) {
	//	var pw = {
	//		w: 	((d.w - uc.SPLITTER_WH - (2 * uc.SPLITTER_BORDER_W)) / 2) + (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH)
	//	};
	//	function hasBorder ( d ) {			//	2017-May
	//		if ( d.hasBorder )
	//			return true;
	//		if ( ! d.parentPanel )
	//			return false;
	//		return hasBorder ( d.parentPanel.data );			
	//	}
		var pw: any = {
		//	w: 	((d.w - uc.SPLITTER_WH - (2 * uc.SPLITTER_BORDER_W)) / 2) + (hasBorder ( d )        ? 0 : uc.PANEL_BORDER_WIDTH)
			w: 	((d.w - uc.SPLITTER_WH - (2 * uc.SPLITTER_BORDER_W)) / 2) + (borderInAncestry ( d ) ? 0 : uc.PANEL_BORDER_WIDTH)
		};
		//	left: 	left panel width
		//	right: 	right panel width
		if ( Math.trunc ( pw.w ) < pw.w ) {
			pw.left  = Math.trunc ( pw.w ) + 1;
			pw.right = Math.trunc ( pw.w );
		} else {
			pw.left  = pw.w;
			pw.right = pw.w;
		}
		pw.right += d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH;		//	2017-May-26
		return pw;
	}	//	horzSplitPanelWidth()

	Panel.prototype.splitHorz = function ( cb ) {
		var panel = this;
		//	Do -
		//
		//		Save/remember the controls on this panel.
		//
		//		Remove the controls, scrollers - everything  * but *  the -
		//
		//			border
		//			size rect
		//			move rect
		//
		//		Insert -
		//
		//			Child panel control on the left side.  Add the controls 
		//			that were on this panel.  
		//
		//			Splitter control - a vertical bar from top to bottom, 
		//			centered horizontally.
		//
		//			Another, empty, panel control on the right side.
		//
		//		The new child panels should not have size and move rects.

		//	Get the child controls data.
		//
		var current = {};

		panel.splitPrep ( current, null, null );

		panel.data.bSplitPanel = true;

		var d      = panel.data;
		var pw     = horzSplitPanelWidth ( d );
		var	xRight = pw.left + uc.SPLITTER_WH + (1 * uc.SPLITTER_BORDER_W) + 0.5;
		var	ph     = d.h - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);

		//	Left child panel.    For now, by default, left side gets the controls.
		panel.splitAddPanel ( 0.5, 
							  0.5, 
							  pw.left,						//	should be integer
							  ph, 
							  'leftPanel', 'left-panel', current, cb, 'left' );

		//	Center splitter child
		panel.data.horzSplitter = panel.addControl ( uSplitter.createSplitterData ( {
			x: 		pw.left                        + uc.SPLITTER_BORDER_W,
			y: 		uc.OFFS_4_1_PIX_LINE,
			w: 		uc.SPLITTER_WH,
			h: 		ph,
			name: 	'splitter', 
			vh: 	'horz' } ) );

		//	Right child panel
		panel.splitAddPanel ( xRight, 
							  0.5, 
							  pw.right, 
							  ph, 
							  'rightPanel', 				//	name in this panel's data of the new panel 
							  'right-panel', 				//	new panel's element id
							  null,				 			//	new panel's controls
							  cb, 'right' );				//	an event callback, probably panel click


		var g = d3.select ( '#' + d.eleId );
		sized3 ( d, d.w, d.h, g, true );

	};	//	Panel.prototype.splitHorz()

	function vertSplitPanelHeight ( d ) {
	//	var ph = {
	//		h: 	((d.h - uc.SPLITTER_WH - (2 * uc.SPLITTER_BORDER_W)) / 2) + (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH)
	//	};
	//	function hasBorder ( d ) {			//	2017-May
	//		if ( d.hasBorder )
	//			return true;
	//		if ( ! d.parentPanel )
	//			return false;
	//		return hasBorder ( d.parentPanel.data );			
	//	}
		var ph: any = {
		//	h: 	((d.h - uc.SPLITTER_WH - (2 * uc.SPLITTER_BORDER_W)) / 2) + (hasBorder ( d )        ? 0 : uc.PANEL_BORDER_WIDTH)
			h: 	((d.h - uc.SPLITTER_WH - (2 * uc.SPLITTER_BORDER_W)) / 2) + (borderInAncestry ( d ) ? 0 : uc.PANEL_BORDER_WIDTH)
		};
		//	top: 		top panel height
		//	bottom: 	bottom panel height
		var truncH = Math.trunc ( ph.h );
		if ( truncH < ph.h ) {
			ph.top    = truncH + 1;
			ph.bottom = truncH;
		} else {
			ph.top    = ph.h;
			ph.bottom = ph.h;
		}
		ph.bottom += d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH;		//	2017-May-26
		return ph;
	}	//	vertSplitPanelHeight()

	Panel.prototype.splitVert = function ( cb ) {
		var panel = this;

		//	Get the child controls data.  Remove controls from this panel.
		//	See splitHorz() for comments.
		//
		var current = {};

		panel.splitPrep ( current, null, null );

		panel.data.bSplitPanel = true;

		//	Top child panel.  For now, by default, top side gets the controls.
		var d = panel.data;
		var ph      = vertSplitPanelHeight ( d );
		var yBottom = ph.top + uc.SPLITTER_WH + (1 * uc.SPLITTER_BORDER_W) + 0.5;
		var	pw      = d.w - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);

		panel.splitAddPanel ( 0.5, 
							  0.5, 
							  pw, 
							  ph.top, 						//	should be integer
							  'topPanel', 					//	name in this panel's data of the new panel 
							  'top-panel', 					//	new panel's element id
							  current,			 			//	new panel's controls
							  cb, 'top' );					//	an event callback, probably panel click

		//	Splitter child
		panel.data.vertSplitter = panel.addControl ( uSplitter.createSplitterData ( {
			x: 		uc.OFFS_4_1_PIX_LINE,
			y: 		ph.top                        + uc.SPLITTER_BORDER_W,
			w: 		pw,
			h: 		uc.SPLITTER_WH,
			name: 	'splitter', 
			vh: 	'vert' } ) );


		//	Bottom child panel
		panel.splitAddPanel ( 0.5, 
							  yBottom, 
							  pw, 
							  ph.bottom,
							  'bottomPanel', 				//	name in this panel's data of the new panel 
							  'bottom-panel', 				//	new panel's element id
							  null,				 			//	new panel's controls
							  cb, 'bottom' );				//	an event callback, probably panel click

		var g = d3.select ( '#' + d.eleId );
		sized3 ( d, d.w, d.h, g, true );

	};	//	Panel.prototype.splitVert()

	Panel.prototype.dockSplitLeft = function ( drop, cb, dtIsSrcParent ) {
		//	Something (drop - another panel) is being docked to the left side of this panel.
		//
		//	So ...
		//
		//	Split this panel -
		//
		//		right: 	controls currently in this panel
		//
		//		left: 	controls currently in drop
		//
		//	Do like splitHorz() -
		//
		//		Save/remember the controls on this panel.
		//
		//		Remove the controls, scrollers - everything  * but *  the -
		//
		//			border
		//			size rect
		//			move rect
		//
		//		Insert -
		//
		//			Child panel control on the left side.  Add the controls 
		//			that were on this panel.  
		//
		//			Splitter control - a vertical bar from top to bottom, 
		//			centered horizontally.
		//
		//			Another, empty, panel control on the right side.
		//
		//		The new child panels should not have size and move rects.

		var panel = this, current = {};

		panel.splitPrep ( current, drop, dtIsSrcParent );	//	Get this panel's current control's data, 
															//	prepare for split.

		//	left side gets the drop
		//
		var pw = (panel.data.w - uc.SPLITTER_WH) / 2;
		var ph =  panel.data.h;

	//	panel.splitAddPanel ( 0, 							//	x
	//						  0, 							//	y
		panel.splitAddPanel ( -0.5, 						//	x
							  -0.5, 						//	y
							  pw + uc.OFFS_4_1_PIX_LINE, 	//	w
							  ph, 							//	h
							  'leftPanel', 					//	name in this panel's data of the new panel 
							  'left-panel', 				//	new panel's element id
							  drop.data.childData, 			//	new panel's controls
							  cb );							//	an event callback, probably panel click


		//	splitter child
		//
		panel.data.horzSplitter = panel.addControl ( uSplitter.createSplitterData ( {
	//		x: 		0 + pw,
	//		y: 		0 + uc.OFFS_4_1_PIX_LINE,
			x: 		-0.5 + pw,
			y: 		-0.5 + uc.OFFS_4_1_PIX_LINE,
			w: 		uc.SPLITTER_WH,
			h: 		ph - uc.SPLITTER_BORDER_W,
			name: 	'splitter', 
			vh: 	'horz' } ) );


		//	right child panel
		//
	//	panel.splitAddPanel ( pw + uc.SPLITTER_WH - uc.OFFS_4_1_PIX_LINE, 		//	x
	//						  0, 							//	y
		panel.splitAddPanel ( pw + uc.SPLITTER_WH - uc.OFFS_4_1_PIX_LINE - 0.5,	//	x
							  -0.5, 						//	y
							  pw + uc.OFFS_4_1_PIX_LINE, 	//	w
							  ph, 							//	h
							  'rightPanel', 				//	name in this panel's data of the new panel 
							  'right-panel', 				//	new panel's element id
							  current,			 			//	new panel's controls
							  cb );							//	an event callback, probably panel click

		panel.data.bSplitPanel = true;

		var d = panel.data;
		var g = d3.select ( '#' + d.eleId );
		sized3 ( d, d.w, d.h, g, true );

	};	//	Panel.prototype.dockSplitLeft()

	Panel.prototype.dockSplitLeft2 = function ( drop, cb, dtIsSrcParent ) {
		//	Something (drop - another panel) is being docked to the left side of this panel.
		//
		//	So ...
		//
		//	Split this panel -
		//
		//		right: 	controls currently in this panel
		//
		//		left: 	controls currently in drop
		//
		//	Do like splitHorz() -
		//
		//		Save/remember the controls on this panel.
		//
		//		Remove the controls, scrollers - everything  * but *  the -
		//
		//			border
		//			size rect
		//			move rect
		//
		//		Insert -
		//
		//			Child panel control on the left side.  Add the controls 
		//			of the drop
		//
		//			Splitter control - a vertical bar from top to bottom, 
		//			centered horizontally.
		//
		//			Another panel control on the right side.  Add to it the 
		//			controls that were in this panel.
		//
		//		The new child panels should not have size and move rects.

		var panel = this, current = {};

		var dropData = (drop.constructor === PanelData) ? drop : drop.data;

		panel.splitPrep ( current, dropData, dtIsSrcParent );	//	Get this panel's current control's data, 
																//	prepare for split.

		panel.data.bSplitPanel = true;

		var d      = panel.data;
		var pw     = horzSplitPanelWidth ( d );
		var	xRight = pw.left + uc.SPLITTER_WH + (1 * uc.SPLITTER_BORDER_W) + 0.5 - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH);
		var	ph     = d.h - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);

		//	left side gets the drop
		//
	//	var pw = (panel.data.w - uc.SPLITTER_WH) / 2;
	//	var ph =  panel.data.h;
	//
	//	panel.splitAddPanel ( -0.5, 						//	x
	//						  -0.5, 						//	y
	//						  pw + uc.OFFS_4_1_PIX_LINE, 	//	w
	//						  ph, 							//	h
	//						  'leftPanel', 					//	name in this panel's data of the new panel 
	//						  'left-panel', 				//	new panel's element id
	//						  drop.data.childData, 			//	new panel's controls
	//						  cb );							//	an event callback, probably panel click
		//
		//	First, need to remove the controls from the panel being dropped.  But maintain 
		//	the controls' data.
		//
		//	We just need the data of the dropped panel's controls.
		var childData = { nextId: dropData.childData.nextId, data: [] };
		dropData.childData.data.forEach ( function ( d ) {
			childData.data.push ( d );
		} );
		//
		//	The new left panel's controls (html elements) will have the same element IDs
		//	as those of the dropped panel.  To avoid conflicts we need to destroy the dropped
		//	panel and its child elements here.
		//	Just set the dropped panel's child data to [] and destroy that panel.
		dropData.childData.data = [];
		svc.updatePanel ( dropData.parentPanel, dropData );
		//
		//	Now add the left panel and the controls we got from the dropped panel.
		var leftPanel =
		panel.splitAddPanel2 ( 0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
							   0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
							   pw.left,						//	should be integer
							   ph, 
							   'leftPanel',					//	name in this panel's data of the new panel 
							   childData,					//	new panel's controls
							   cb, 							//	an event callback, probably panel click
							   'left',
							   ! panel.data.parentPanel );	//	bParentSplitAndRoot - to help size left panel


	//	//	splitter child
	//	//
	//	panel.data.horzSplitter = panel.addControl ( uSplitter.createSplitterData ( {
	//		x: 		-0.5 + pw,
	//		y: 		-0.5 + uc.OFFS_4_1_PIX_LINE,
	//		w: 		uc.SPLITTER_WH,
	//		h: 		ph - uc.SPLITTER_BORDER_W,
	//		name: 	'splitter', 
	//		vh: 	'horz' } ) );
		//	Center splitter child
		panel.data.horzSplitter = panel.addControl ( uSplitter.createSplitterData ( {
			x: 		pw.left + uc.SPLITTER_BORDER_W - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
			y: 		uc.OFFS_4_1_PIX_LINE           - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
			w: 		uc.SPLITTER_WH,
			h: 		ph,
			name: 	'splitter', 
			vh: 	'horz' } ) );


		//	right child panel
		//
	//	panel.splitAddPanel ( pw + uc.SPLITTER_WH - uc.OFFS_4_1_PIX_LINE - 0.5,	//	x
	//						  -0.5, 						//	y
	//						  pw + uc.OFFS_4_1_PIX_LINE, 	//	w
	//						  ph, 							//	h
	//						  'rightPanel', 				//	name in this panel's data of the new panel 
	//						  'right-panel', 				//	new panel's element id
	//						  current,			 			//	new panel's controls
	//						  cb );							//	an event callback, probably panel click
	//
	//	panel.data.bSplitPanel = true;
	//
	//	var d = panel.data;
	//	var g = d3.select ( '#' + d.eleId );
	//	sized3 ( d, d.w, d.h, g, true );
		//
		var rightPanel =
		panel.splitAddPanel ( xRight, 
							  0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
							  pw.right, 
							  ph, 
							  'rightPanel',		//	name in this panel's data of the new panel 
							  'right-panel', 	//	new panel's element id
							  current,			//	new panel's controls
							  cb, 				//	an event callback, probably panel click
							  'right',
							  ! panel.data.parentPanel );	//	bParentSplitAndRoot - to help size right panel

		var g = d3.select ( '#' + d.eleId );
		sized3 ( d, d.w, d.h, g, true );

		return { leftPanel: leftPanel, rightPanel: rightPanel };
	};	//	Panel.prototype.dockSplitLeft2()

	Panel.prototype.dockSplitTop = function ( drop, cb, dtIsSrcParent ) {

		//	See comments in dockSplitLeft().

		var panel = this, current = {};

		panel.splitPrep ( current, drop, dtIsSrcParent );	//	Get this panel's current control's data, 
															//	prepare for split.

		//	top gets the drop
		//
		var pw =  panel.data.w;
		var ph = (panel.data.h - uc.SPLITTER_WH) / 2;

	//	panel.splitAddPanel ( 0, 							//	x
	//						  0, 							//	y
		panel.splitAddPanel ( -0.5,							//	x
							  -0.5,							//	y
							  pw, 							//	w
							  ph + uc.OFFS_4_1_PIX_LINE, 	//	h
							  'topPanel', 					//	name in this panel's data of the new panel 
							  'top-panel', 					//	new panel's element id
							  drop.data.childData, 			//	new panel's controls
							  cb );							//	an event callback, probably panel click


		//	splitter child
		//
		panel.data.vertSplitter = panel.addControl ( uSplitter.createSplitterData ( {
	//		x: 		0 + uc.OFFS_4_1_PIX_LINE,
	//		y: 		0 + ph, 
			x: 		-0.5 + uc.OFFS_4_1_PIX_LINE,
			y: 		-0.5 + ph, 
			w: 		pw - uc.SPLITTER_BORDER_W,
			h: 		uc.SPLITTER_WH,
			name: 	'splitter', 
			vh: 	'vert' } ) );


		//	bottom child panel
		//
	//	panel.splitAddPanel ( 0, 							//	x
	//						  ph + uc.SPLITTER_WH - uc.OFFS_4_1_PIX_LINE, 		//	y
		panel.splitAddPanel ( -0.5,							//	x
							  ph + uc.SPLITTER_WH - uc.OFFS_4_1_PIX_LINE - 0.5,	//	y
							  pw, 							//	w
							  ph + uc.OFFS_4_1_PIX_LINE, 	//	h
							  'bottomPanel', 				//	name in this panel's data of the new panel 
							  'bottom-panel', 				//	new panel's element id
							  current,			 			//	new panel's controls
							  cb );							//	an event callback, probably panel click

		panel.data.bSplitPanel = true;

		var d = panel.data;
		var g = d3.select ( '#' + d.eleId );
		sized3 ( d, d.w, d.h, g, true );

	};	//	Panel.prototype.dockSplitTop()

	Panel.prototype.dockSplitTop2 = function ( drop, cb, dtIsSrcParent ) {

		//	See comments in dockSplitLeft().

		var panel = this, current = {};

		var dropData = (drop.constructor === PanelData) ? drop : drop.data;

		panel.splitPrep ( current, dropData, dtIsSrcParent );	//	Get this panel's current control's data, 
																//	prepare for split.

		panel.data.bSplitPanel = true;

		var d       = panel.data;
		var ph      = vertSplitPanelHeight ( d );
		var	yBottom = ph.top + uc.SPLITTER_WH + (1 * uc.SPLITTER_BORDER_W) + 0.5 - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH);
		var	pw      = d.w - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);

		//	top side gets the drop
		//
		//	First, need to remove the controls from the panel being dropped.  But maintain 
		//	the controls' data.
		//
		//	We just need the data of the dropped panel's controls.
		var childData = { nextId: dropData.childData.nextId, data: [] };
		dropData.childData.data.forEach ( function ( d ) {
			childData.data.push ( d );
		} );
		//
		//	The new top panel's controls (html elements) will have the same element IDs
		//	as those of the dropped panel.  To avoid conflicts we need to destroy the dropped
		//	panel and its child elements here.
		//	Just set the dropped panel's child data to [] and destroy that panel.
		dropData.childData.data = [];
		svc.updatePanel ( dropData.parentPanel, dropData );
		//
		//	Now add the top panel and the controls we got from the dropped panel.
		var topPanel =
		panel.splitAddPanel2 ( 0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
							   0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
							   pw,		
							   ph.top, 						//	should be integer
							   'topPanel',					//	name in this panel's data of the new panel 
							   childData,					//	new panel's controls
							   cb, 							//	an event callback, probably panel click
							   'top',
							   ! panel.data.parentPanel );	//	bParentSplitAndRoot - to help size top panel


		//	Center splitter child
		panel.data.vertSplitter = panel.addControl ( uSplitter.createSplitterData ( {
			x: 		uc.OFFS_4_1_PIX_LINE          - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
			y: 		ph.top + uc.SPLITTER_BORDER_W - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
			w: 		pw,
			h: 		uc.SPLITTER_WH,
			name: 	'splitter', 
			vh: 	'vert' } ) );


		//	bottom child panel
		var bottomPanel =
		panel.splitAddPanel ( 0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
							  yBottom, 
							  pw, 
							  ph.bottom, 
							  'bottomPanel',				//	name in this panel's data of the new panel 
							  'bottom-panel', 				//	new panel's element id
							  current,						//	new panel's controls
							  cb, 							//	an event callback, probably panel click
							  'right',
							  ! panel.data.parentPanel );	//	bParentSplitAndRoot - to help size bottom panel

		var g = d3.select ( '#' + d.eleId );
		sized3 ( d, d.w, d.h, g, true );

		return { topPanel: topPanel, bottomPanel: bottomPanel };
	};	//	Panel.prototype.dockSplitTop2()


	Panel.prototype.dockSplitRight = function ( drop, cb, dtIsSrcParent  ) {

		//	See comments in dockSplitLeft().

		var panel = this, current = {};

		var dropData = (drop.constructor === PanelData) ? drop : drop.data;

	//	panel.splitPrep ( current, drop,     dtIsSrcParent );	//	Get this panel's current control's data, 
		panel.splitPrep ( current, dropData, dtIsSrcParent );	//	Get this panel's current control's data, 
																//	prepare for split.

		panel.data.bSplitPanel = true;

		var d      = panel.data;
		var pw     = horzSplitPanelWidth ( d );
		var	xRight = pw.left + uc.SPLITTER_WH + (1 * uc.SPLITTER_BORDER_W) + 0.5 - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH);
		var	ph     = d.h - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);

		//	left side gets the current controls
		var leftPanel =
		panel.splitAddPanel ( 0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
							  0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
						//	  pw + uc.OFFS_4_1_PIX_LINE, 
							  pw.left,						//	should be integer
							  ph, 
							  'leftPanel', 					//	name in this panel's data of the new panel 
							  'left-panel', 				//	new panel's element id
							  current, 						//	new panel's controls
							  cb, 							//	an event callback, probably panel click
							  'left',
							  ! panel.data.parentPanel );	//	bParentSplitAndRoot - to help size left panel

		//	Center splitter child
		panel.data.horzSplitter = panel.addControl ( uSplitter.createSplitterData ( {
			x: 		pw.left + uc.SPLITTER_BORDER_W - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
			y: 		uc.OFFS_4_1_PIX_LINE           - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
			w: 		uc.SPLITTER_WH,
			h: 		ph,
			name: 	'splitter', 
			vh: 	'horz' } ) );


		//	Right child panel gets the drop
		var rightPanel =
	//	panel.splitAddPanel ( 0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH) + pw + uc.SPLITTER_WH - uc.OFFS_4_1_PIX_LINE,
		panel.splitAddPanel ( xRight, 
							  0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
						//	  pw + uc.OFFS_4_1_PIX_LINE,
							  pw.right, 
							  ph, 
							  'rightPanel', 				//	name in this panel's data of the new panel 
							  'right-panel', 				//	new panel's element id
						//	  drop.data,		//	drop.data.childData, 			//	new panel's controls
							  dropData,			//	drop.data.childData, 			//	new panel's controls
							  cb, 				//	an event callback, probably panel click
							  'right',
							  ! panel.data.parentPanel );	//	bParentSplitAndRoot - to help size right panel

		var g = d3.select ( '#' + d.eleId );
		sized3 ( d, d.w, d.h, g, true );

		return { leftPanel: leftPanel, rightPanel: rightPanel };
	};	//	Panel.prototype.dockSplitRight()

	Panel.prototype.dockSplitRight2 = function ( drop, cb, dtIsSrcParent  ) {

		//	See comments in dockSplitLeft().
		//
		//	See 2017-Apr-09 comments in mouseUp() (what calls this).

		var panel    = this, current = {};
		var dropData = (drop.constructor === PanelData) ? drop : drop.data;

		panel.splitPrep ( current, dropData, dtIsSrcParent );	//	Get this panel's current control's data, 
																//	prepare for split.

		panel.data.bSplitPanel = true;

		var d      = panel.data;
		var pw     = horzSplitPanelWidth ( d );
		var	xRight = pw.left + uc.SPLITTER_WH + (1 * uc.SPLITTER_BORDER_W) + 0.5 - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH);
		var	ph     = d.h - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);

		//	left side gets the current controls
		var leftPanel =
		panel.splitAddPanel ( 0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
							  0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
							  pw.left,						//	should be integer
							  ph, 
							  'leftPanel', 					//	name in this panel's data of the new panel 
							  'left-panel', 				//	new panel's element id
							  current, 						//	new panel's controls
							  cb, 							//	an event callback, probably panel click
							  'left',
							  ! panel.data.parentPanel );	//	bParentSplitAndRoot - to help size left panel

		//	Center splitter child
		panel.data.horzSplitter = panel.addControl ( uSplitter.createSplitterData ( {
			x: 		pw.left + uc.SPLITTER_BORDER_W - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
			y: 		uc.OFFS_4_1_PIX_LINE           - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
			w: 		uc.SPLITTER_WH,
			h: 		ph,
			name: 	'splitter', 
			vh: 	'horz' } ) );


		//	Right child panel gets the drop
		//
		//	First, need to remove the controls from the panel being dropped.  But maintain 
		//	the controls' data.
		//
		//	We just need the data of the dropped panel's controls.
		var childData = { nextId: dropData.childData.nextId, data: [] };
		dropData.childData.data.forEach ( function ( d ) {
			childData.data.push ( d );
		} );
		//
		//	The new right panel's controls (html elements) will have the same element IDs
		//	as those of the dropped panel.  To avoid conflicts we need to destroy the dropped
		//	panel and its child elements here.
		//	Just set the dropped panel's child data to [] and destroy that panel.
		dropData.childData.data = [];
		svc.updatePanel ( dropData.parentPanel, dropData );
		//
		//	Now add the right panel and the controls we got from the dropped panel.
		var rightPanel =
		panel.splitAddPanel2 ( xRight, 
							   0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
							   pw.right, 
							   ph, 
							   'rightPanel',	//	name in this panel's data of the new panel 
							   childData,		//	new panel's controls
							   cb, 				//	an event callback, probably panel click
							   'right',
							   ! panel.data.parentPanel );	//	bParentSplitAndRoot - to help size right panel

		var g = d3.select ( '#' + d.eleId );
		sized3 ( d, d.w, d.h, g, true );

		return { leftPanel: leftPanel, rightPanel: rightPanel };
	};	//	Panel.prototype.dockSplitRight2()

	Panel.prototype.dockSplitBottom = function ( drop, cb, dtIsSrcParent ) {

		//	See comments in dockSplitLeft().

		var panel = this, current = {};

		panel.splitPrep ( current, drop, dtIsSrcParent );	//	Get this panel's current control's data, 
															//	prepare for split.

		//	top gets the current controls
		//
		var pw =  panel.data.w;
		var ph = (panel.data.h - uc.SPLITTER_WH) / 2;

	//	panel.splitAddPanel ( 0, 							//	x
	//						  0, 							//	y
		panel.splitAddPanel ( -0.5,							//	x
							  -0.5,							//	y
							  pw, 							//	w
							  ph + uc.OFFS_4_1_PIX_LINE, 	//	h
							  'topPanel', 					//	name in this panel's data of the new panel 
							  'top-panel', 					//	new panel's element id
							  current,			 			//	new panel's controls
							  cb );							//	an event callback, probably panel click


		//	splitter child
		//
		panel.data.vertSplitter = panel.addControl ( uSplitter.createSplitterData ( {
	//		x: 		0 + uc.OFFS_4_1_PIX_LINE,
	//		y: 		0 + ph, 
			x: 		-0.5 + uc.OFFS_4_1_PIX_LINE,
			y: 		-0.5 + ph, 
			w: 		pw - uc.SPLITTER_BORDER_W,
			h: 		uc.SPLITTER_WH,
			name: 	'splitter', 
			vh: 	'vert' } ) );


		//	bottom gets the drop
		//
	//	panel.splitAddPanel ( 0, 							//	x
	//						  ph + uc.SPLITTER_WH - uc.OFFS_4_1_PIX_LINE, 		//	y
		panel.splitAddPanel ( -0.5,							//	x
							  ph + uc.SPLITTER_WH - uc.OFFS_4_1_PIX_LINE - 0.5,	//	y
							  pw, 							//	w
							  ph + uc.OFFS_4_1_PIX_LINE, 	//	h
							  'bottomPanel', 				//	name in this panel's data of the new panel 
							  'bottom-panel', 				//	new panel's element id
							  drop.data.childData, 			//	new panel's controls
							  cb );							//	an event callback, probably panel click

		panel.data.bSplitPanel = true;

		var d = panel.data;
		var g = d3.select ( '#' + d.eleId );
		sized3 ( d, d.w, d.h, g, true );

	};	//	Panel.prototype.dockSplitBottom()

	Panel.prototype.dockSplitBottom2 = function ( drop, cb, dtIsSrcParent ) {

		var panel = this, current = {};

		var dropData = (drop.constructor === PanelData) ? drop : drop.data;

		panel.splitPrep ( current, dropData, dtIsSrcParent );	//	Get this panel's current control's data, 
																//	prepare for split.

		panel.data.bSplitPanel = true;

		var d       = panel.data;
		var ph      = vertSplitPanelHeight ( d );
		var	yBottom = ph.top + uc.SPLITTER_WH + (1 * uc.SPLITTER_BORDER_W) + 0.5 - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH);
		var	pw      = d.w - (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);

		//	top child panel
		var topPanel =
		panel.splitAddPanel ( 0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
							  0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
							  pw, 
							  ph.top, 
							  'topPanel',					//	name in this panel's data of the new panel 
							  'top-panel', 					//	new panel's element id
							  current,						//	new panel's controls
							  cb, 							//	an event callback, probably panel click
							  'right',
							  ! panel.data.parentPanel );	//	bParentSplitAndRoot - to help size top panel


		//	Center splitter child
		panel.data.vertSplitter = panel.addControl ( uSplitter.createSplitterData ( {
			x: 		uc.OFFS_4_1_PIX_LINE          - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
			y: 		ph.top + uc.SPLITTER_BORDER_W - (d.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
			w: 		pw,
			h: 		uc.SPLITTER_WH,
			name: 	'splitter', 
			vh: 	'vert' } ) );


		//	bottom side gets the drop
		//
		//	First, need to remove the controls from the panel being dropped.  But maintain 
		//	the controls' data.
		//
		//	We just need the data of the dropped panel's controls.
		var childData = { nextId: dropData.childData.nextId, data: [] };
		dropData.childData.data.forEach ( function ( d ) {
			childData.data.push ( d );
		} );
		//
		//	The new bottom panel's controls (html elements) will have the same element IDs
		//	as those of the dropped panel.  To avoid conflicts we need to destroy the dropped
		//	panel and its child elements here.
		//	Just set the dropped panel's child data to [] and destroy that panel.
		dropData.childData.data = [];
		svc.updatePanel ( dropData.parentPanel, dropData );
		//
		//	Now add the bottom panel and the controls we got from the dropped panel.
		var bottomPanel =
		panel.splitAddPanel2 ( 0.5 - (panel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH),
							   yBottom,
							   pw,		
							   ph.bottom, 					//	should be integer
							   'bottomPanel',				//	name in this panel's data of the new panel 
							   childData,					//	new panel's controls
							   cb, 							//	an event callback, probably panel click
							   'bottom',
							   ! panel.data.parentPanel );	//	bParentSplitAndRoot - to help size bottom panel

		var g = d3.select ( '#' + d.eleId );
		sized3 ( d, d.w, d.h, g, true );

		return { topPanel: topPanel, bottomPanel: bottomPanel };
	};	//	Panel.prototype.dockSplitBottom2()


	Panel.prototype.unsplit = function ( panelRemaining ) {
		var sW    = serviceId + ' Panel.prototype.unsplit()';
		var panel = this;
		let rpd = panel.data.rpd ? panel.data.rpd : panel.data;
		//	This panel is currently split.  Do -
		//		Get the location, dimensions of this panel.
		//		Get the controls of panelRemaining.
		//		Destroy this panel's element - with parentPanel.rmvControl ( panel ).
		//		Create  a new element with this panel's location, dimensions.

		var pd = panel.data, parentPanel = panel.data.parentPanel, rd = panelRemaining.data;
		
		//	location, dimensions of this panel
		var x = pd.x, y = pd.y, w = pd.w, h = pd.h;

		//	If this is the root panel (parentPanel === null) then 
		//		Call svc.updatePanel() to remove the remaining controls
		//		Rebuild the scrollers, etc.
		//		Add the remaining controls.
		//
		if ( parentPanel === null ) {
			var cd = pd.childData.data;
			while ( cd.length > 0 )
				svc.updatePanel ( panel, cd[0], { bKeepChildClipPaths: false } );
			var g = d3.select ( '#' + pd.eleId );
			pd.bSplitPanel  = false;
			pd.horzSplitter = null;
			pd.vertSplitter = null;
		//	defineScrollers ( g );
		//	uCD.defineScrollers ( g );	//	Based on udui-graph-a.ts.
			defineScrollers ( g );		//	Here because there's more to it.
			sized3 ( pd, w, h, g, true );
			svc.addCtrls ( panel, rd.childData );
			return;
		}

		//	destroy this panel's current element
		parentPanel.rmvControl ( panel );

		//	new data for this panel
		pd = svc.createPanelData ( { rpd:		rpd,
									 x: 		x, 
									 y: 		y, 
									 w: 		w, 
									 h: 		h, 
									 name: 		rd.name, 
									 clickCB: 	rd.clickCB } );

		var newPanel = parentPanel.addControl ( pd );		//	newPanel replacing this?

		svc.addCtrls ( newPanel, rd.childData );

		return newPanel;
	};	//	Panel.prototype.unsplit()

	Panel.prototype.restoreSplit = function ( pd0, sd, pd2 ) {
		var panel = this;

		//	Restoring this panel from storage.  Caller has already created and passed here
		//	the data for the two new panels (pd0, pd2) and the splitter (sd).  Caller will take 
		//	care of the child controls in the new panels.

		svc.removeBaseG ( panel );
		svc.removeSclrs ( panel );

		panel.data.base = d3.select ( '#' + panel.data.eleId );

		pd0.hasBorder   = false;
		pd0.bMoveRect = false;
		pd0.bSizeRect = false;

		pd2.hasBorder   = false;
		pd2.bMoveRect = false;
		pd2.bSizeRect = false;

		if ( sd.vh === 'vert' ) {
			panel.data.topPanel     = panel.addControl ( pd0 );
			panel.data.vertSplitter = panel.addControl ( sd );
			panel.data.bottomPanel  = panel.addControl ( pd2 );
		} else
		if ( sd.vh === 'horz' ) {
			panel.data.leftPanel    = panel.addControl ( pd0 );
			panel.data.horzSplitter = panel.addControl ( sd );
			panel.data.rightPanel   = panel.addControl ( pd2 );
		}

		panel.data.bSplitPanel = true;

	};	//	Panel.prototype.restoreSplit()


	Panel.prototype.splitterMove = function ( dx, dy ) {
		var panel = this, pd, g;
		if ( panel.data.horzSplitter ) {
			//	Size the right panel.
			pd = panel.data.rightPanel.data;
			g  = d3.select ( '#' + pd.eleId );
			sized2 ( pd, g, -dx, 0, false );
			//	Move the right panel.
		//	g.attr ( 'transform', function ( d, i ) { return 'translate(' + (d.x += dx) + ',0)'; } );
			g.attr ( 'transform', function ( d, i ) { 
			//	return 'translate(' + (d.x += dx) + ',' + (- uc.OFFS_4_1_PIX_LINE)                                                              + ')'; 
				return 'translate(' + (d.x += dx) + ',' + (  uc.OFFS_4_1_PIX_LINE - (d.parentPanel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH)) + ')'; 
			} );
			//	Size the left panel.
			pd = panel.data.leftPanel.data;
			g  = d3.select ( '#' + pd.eleId );
			sized2 ( pd, g, dx, 0, false );
		}
		if ( panel.data.vertSplitter ) {
			//	Size the bottom panel.
			pd = panel.data.bottomPanel.data;
			g  = d3.select ( '#' + pd.eleId );
			sized2 ( pd, g, 0, -dy, false );
			//	Move the bottom panel.
		//	g.attr ( 'transform', function ( d, i ) { return 'translate(0,'                                + (d.y += dy) + ')'; } );
			g.attr ( 'transform', function ( d, i ) { 
			//	return 'translate(' + (- uc.OFFS_4_1_PIX_LINE)                                                              + ',' + (d.y += dy) + ')'; 
				return 'translate(' + (  uc.OFFS_4_1_PIX_LINE - (d.parentPanel.data.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH)) + ',' + (d.y += dy) + ')'; 
			} );
			//	Size the top panel.
			pd = panel.data.topPanel.data;
			g  = d3.select ( '#' + pd.eleId );
			sized2 ( pd, g, 0, dy, false );
		}
	};	//	Panel.prototype.splitterMove()

	Panel.prototype.connectPathStart = function ( eleConnectorStart ) {
		const sW = 'Panel.prototype.connectPathStart()';
		let d = this.data;
		let rtn: any = {};
		if ( eleConnectorStart.id.indexOf ( 'connector-left' ) > 0 ) {
			rtn.xs = rtn.xe = d.x;
			rtn.ys = rtn.ye = d.y + (d.h / 2); }
		if ( eleConnectorStart.id.indexOf ( 'connector-top' ) > 0 ) {
			rtn.xs = rtn.xe = d.x + (d.w / 2);
			rtn.ys = rtn.ye = d.y; }
		if ( eleConnectorStart.id.indexOf ( 'connector-right' ) > 0 ) {
			rtn.xs = rtn.xe = d.x + d.w;
			rtn.ys = rtn.ye = d.y + (d.h / 2); }
		if ( eleConnectorStart.id.indexOf ( 'connector-bottom' ) > 0 ) {
			rtn.xs = rtn.xe = d.x + (d.w / 2);
			rtn.ys = rtn.ye = d.y + d.h; }
	//	cmn.log ( sW, ' xs ' + rtn.xs + '  ys ' + rtn.ys );
	//	let rpd = d.rpd;
	//	rtn.line = d3.select ( '#' + rpd.eleId + '-base' )
		let ppd = d.parentPanel ? d.parentPanel.data : d.rpd;
		rtn.line = d3.select ( '#' + ppd.eleId + '-base' )
			.append ( 'line' )
	//			.attr ( 'id',    rpd.eleId + '-connector-line' )
				.attr ( 'id',    ppd.eleId + '-connector-line' )
				.attr ( 'x1',    rtn.xs )
				.attr ( 'y1',    rtn.ys )
				.attr ( 'x2',    rtn.xe )
				.attr ( 'y2',    rtn.ye )
				.attr ( 'class', 'u34-path' );
		return rtn;
	}	//	Panel.prototype.connectPathStart()

	Panel.prototype.connectPending = function ( dx, dy ) {
		const sW = 'Panel.prototype.connectPending()';
		if ( (! uc.mouseOp) || (! uc.mouseOp.connectPath) ) {
			return; }
		let path = uc.mouseOp.connectPath;
		path.xe += dx;
		path.ye += dy;
	//	cmn.log ( sW, ' xe ' + path.xe + '  ye ' + path.ye );
		path.line
			.attr ( 'x2',	path.xe )
			.attr ( 'y2',	path.ye );
	}	//	Panel.prototype.connectPending()

	Panel.prototype.connectCancel = function() {
		const sW = 'Panel.prototype.connectCancel()';
		if ( (! uc.mouseOp) || (! uc.mouseOp.connectPath) ) {
			return; }
		let path = uc.mouseOp.connectPath;
		path.line.remove();
	}	//	Panel.prototype.connectCancel()

	Panel.prototype.connectCreatePath = function ( eleConnectorEnd ) {
		const sW = 'Panel.prototype.connectCreatePath()';
		if ( (! uc.mouseOp) || (! uc.mouseOp.connectPath) ) {
			return; }

		let d = this.data;		//	must be the panel of end connector
		if ( d.id === uc.mouseOp.downData.id ) {
			return; }

		let eleConnectorStart = uc.mouseOp.downEle;

		let path = uc.mouseOp.connectPath;

		let pathStart = { panelDataId:	uc.mouseOp.downData.id,
						  x: path.xs, 
						  y: path.ys, 
						  dir: getConnectorDirection ( eleConnectorStart ) };

		//	Get the end point.
		let pathEnd = { panelDataId:	d.id,
						x: 0,
						y: 0,
						dir: getConnectorDirection ( eleConnectorEnd ) };

		getPathConnectorPoint ( d, pathEnd );

		let pathData = {
			pathId:		++lastPathId,
			startPoint:	pathStart,
			endPoint:	pathEnd,
			path:		generatePathData ( pathStart, pathEnd ) }

		uc.mouseOp.downData.pathData.push ( pathData );
		d.pathData.push ( pathData );

	//	let rpd = d.rpd;
	//	d3.select ( '#' + rpd.eleId + '-base' )
		let ppd = d.parentPanel ? d.parentPanel.data : d.rpd;
		d3.select ( '#' + ppd.eleId + '-base' )
			.append ( 'path' )
	//			.attr ( 'id',    rpd.eleId + '-path-' + pathData.pathId )
				.attr ( 'id',    ppd.eleId + '-path-' + pathData.pathId )
				.attr ( 'd',     pathData.path )
				.attr ( 'class', 'u34-path' );
	
	}	//	Panel.prototype.connectCreatePath()

	Panel.prototype.createPath2 = function ( ) {
		const sW = serviceId + ' createPath2()';

		//	Create a path between panels. Determine connection points based
		//	on panele's location relative to each other.

	}	//	Pane.prototype.createPath2()

	function redrawPaths ( d ) {
		const sW = serviceId + ' redrawPath()';
	//	let rpd = d.rpd;
		let ppd = d.parentPanel ? d.parentPanel.data : d.rpd;
		d.pathData.forEach ( dp => {
			if ( dp.startPoint.panelDataId === d.id ) {
				getPathConnectorPoint ( d, dp.startPoint ); }
			else
			if ( dp.endPoint.panelDataId === d.id ) {
				getPathConnectorPoint ( d, dp.endPoint ); }
			else {
				cmn.error ( sW, 'connector point not found' );
				return; }
			dp.path = generatePathData ( dp.startPoint, dp.endPoint );
	//		d3.select ( '#' + rpd.eleId + '-path-' + dp.pathId )
			d3.select ( '#' + ppd.eleId + '-path-' + dp.pathId )
				.attr ( 'd',	dp.path );
		} );
	}	//	redrawPaths()

	function getPathConnectorPoint ( pd, pt ) {
		const sW = serviceId + ' getPathConnetorPoint()';
		switch ( pt.dir ) {
			case 'left':
				pt.x = pd.x;
				pt.y = pd.y + (pd.h / 2); 
				break;
			case 'up':
				pt.x = pd.x + (pd.w / 2);
				pt.y = pd.y;
				break;
			case 'right':
				pt.x = pd.x + pd.w;
				pt.y = pd.y + (pd.h / 2); 
				break;
			case 'down':
				pt.x = pd.x + (pd.w / 2);
				pt.y = pd.y + pd.h; 
				break;
			default:
				cmn.error ( sW, 'unrecognized point direction' ); }
	}	//	getPathConnectorPoint()

	function generatePathData ( s, e ) {
		//	s and e specify how the path starts and ends.  Each is -
		//		{ x: , y: , dir: }
		//	where dir (direction) is one of 'left', 'up', 'right', 
		//	'down'.

		let cp1 = { x: 0, y: 0 };
		let cp2 = { x: 0, y: 0 };

		if ( (s.dir === 'right') && (e.dir === 'left') ) {
			let dx2 = (e.x - s.x) / 2;
			if ( e.x < s.x ) {
				dx2 *= -1; }
			cp1.x = s.x + dx2;
			cp1.y = s.y;
			cp2.x = e.x - dx2;
			cp2.y = e.y; }

		if ( (s.dir === 'right') && (e.dir === 'down') ) {
			let dx2 = (e.x - s.x) / 2;
			if ( e.x < s.x ) {
				dx2 *= -1; }
			let dy2 = (e.y - s.y) / 2;
			if ( e.y < s.y ) {
				dy2 *= -1; }
			cp1.x = s.x + dx2;
			cp1.y = s.y;
			cp2.x = e.x;
			cp2.y = e.y + dy2; }

		if ( (s.dir === 'down') && (e.dir === 'left') ) {
			let dy2 = (e.y - s.y) / 2;
			if ( e.y < s.y ) {
				dy2 *= -1; }
			let dx2 = (e.x - s.x) / 2;
			if ( e.x < s.x ) {
				dx2 *= -1; }
			cp1.x = s.x;
			cp1.y = s.y + dy2;
			cp2.x = e.x - dx2;
			cp2.y = e.y; }

		if ( (s.dir === 'down') && (e.dir === 'up') ) {
			let dy2 = (e.y - s.y) / 2;
			if ( e.y < s.y ) {
				dy2 *= -1; }
			cp1.x = s.x;
			cp1.y = s.y + dy2;
			cp2.x = e.x;
			cp2.y = e.y - dy2; }

		if ( (s.dir === 'up') && (e.dir === 'down') ) {
			let dy2 = (e.y - s.y) / 2;
			if ( e.y < s.y ) {
				dy2 *= -1; }
			cp1.x = s.x;
			cp1.y = s.y - dy2;
			cp2.x = e.x;
			cp2.y = e.y + dy2; }

		let path = d3.path();
		path.moveTo ( s.x, s.y );
		path.bezierCurveTo ( cp1.x, cp1.y, cp2.x, cp2.y, e.x, e.y );
		return path.toString();
	}	//	generatePathData()

	function getConnectorDirection ( eleConnector ) {
		const sW = serviceId + ' getConnectorDirection()';
		if ( eleConnector.id.indexOf ( 'connector-left' ) > 0 ) {
			return 'left'; }
		if ( eleConnector.id.indexOf ( 'connector-top' ) > 0 ) {
			return 'up'; }
		if ( eleConnector.id.indexOf ( 'connector-right' ) > 0 ) {
			return 'right'; }
		if ( eleConnector.id.indexOf ( 'connector-bottom' ) > 0 ) {
			return 'down'; }
		cmn.error ( sW, ' unrecognized connector id' );
		return '';
	}	//	getConnectorDirection()

	Panel.prototype.drag = function ( dragee ) {
		var sW = serviceId + ' Panel.drag()';
		var panel = this;

		//	Drag & Drop: Step 2 -
		//
		//		Create and move a representation of what is being dragged.
		//
		//		Note that the class u34-drag-dragee-outline has pointer-events
		//		set to none.
		//
		//	First, an outline to represent what is being dragged.
		//
		if ( ! dragee.outline ) {
			dragee.outline = d3.select ( '#' + panel.data.eleId )
				.append ( 'g' )
				.attr ( 'id', 'dragee' )
				.attr ( 'transform', 'translate(' + dragee.x + ',' + dragee.y + ')' );

			dragee.outline
				.append ( 'rect' )
				.attr ( 'x', 	  0 )
				.attr ( 'y', 	  0 )
				.attr ( 'width',  dragee.w )
				.attr ( 'height', dragee.h )
				.attr ( 'class',  'u34-drag-dragee-outline' );

			dragee.outline
				.append ( 'text' )
				.attr ( 'id', 'drag-info-text-line-1')
				.attr ( 'text-anchor', 'left' )
				.attr ( 'x',     5 )
				.attr ( 'y',     15 )
				.attr ( 'class', 'u34-drag-info-text' )
				.text ( '' );

			dragee.outline
				.append ( 'text' )
				.attr ( 'id', 'drag-info-text-line-2')
				.attr ( 'text-anchor', 'left' )
				.attr ( 'x',     5 )
				.attr ( 'y',     30 )
				.attr ( 'class', 'u34-drag-info-text' )
				.text ( '' );
		}

		dragee.outline
			.attr ( 'transform', 'translate(' + (dragee.x += dragee.dx) + ',' + (dragee.y += dragee.dy) + ')' );

	};	//	Panel.prototype.drag()

	Panel.prototype.dragInfoLine1 = function ( info ) {
		var sW = serviceId + ' Panel.dragInfoLine1()';
		var panel = this;

	//	cmn.log ( sW, ' info: ' + info );

		//	Drag & Drop: Step 3 -
		//
		//		Display info, on the dragged outline, about candidate target (what the 
		//		mouse is over).
		//
		if ( ! uc.isDragging ) {
			cmn.error ( sW, ' ! uc.isDragging' );
			return;
		}

		if ( ! uc.dragee.outline ) {			//	happens during e2e sometimes
			cmn.error ( sW, ' ! uc.dragee.outline' );
			return;
		}

		uc.dragee.outline.select ( '#drag-info-text-line-1' )
			.text ( info );

	};	//	Panel.prototype.dragInfoLine1()

	Panel.prototype.dragInfoLine2 = function ( info ) {
		var sW = serviceId + ' Panel.dragInfoLine2()';
		var panel = this;

		if ( ! uc.isDragging )
			return;

		uc.dragee.outline.select ( '#drag-info-text-line-2' )
			.text ( info );

	};	//	Panel.prototype.dragInfoLine2()


	Panel.prototype.dragEnd = function ( dragee ) {
		var sW = serviceId + ' Panel.dragEnd()';
		var panel = this;

		if ( dragee.outline ) 
			dragee.outline
				.remove();
		dragee.outline = null;
		uc.isDragging = false;

	};	//	Panel.prototype.dragEnd()


	Panel.prototype.showFlyoverInfo = function ( x, y, text ) {
		var sW    = serviceId + ' showFlyoverInfo()';
		var panel = this;
		let rpd = panel.data.rpd ? panel.data.rpd : panel.data;
		var wh = uLabel.measureText ( panel, 'verdana', '10px', text );
		var w = wh.w + 4;
		var h = wh.h;
		var labelD = uLabel.createLabelData ( { rpd:	rpd,
												x: 		x         + uc.OFFS_4_1_PIX_LINE, 
												y: 		y - h - 4 + uc.OFFS_4_1_PIX_LINE,  
												w: 		w,  
												h: 		h, 
												name: 	'flyoverInfo',
												text: 	text,
												fs:		10 } );
		labelD.class  = 'u34-label-flyover-info';
	//	labelD.filter = 'url(#drop-shadow)';
		panel.data.foInfoLabel = panel.addControl ( labelD );
	};	//	Panel.prototype.showFlyoverInfo()

	Panel.prototype.hideFlyoverInfo = function() {
		var sW    = serviceId + ' hideFlyoverInfo()';
		var panel = this;

		if ( panel.data.foInfoLabel ) {
			panel.rmvControl ( panel.data.foInfoLabel );
			panel.data.foInfoLabel = null;
		}
	};	//	Panel.prototype.hideFlyoverInfo()

	Panel.prototype.saveToLS = function() {
		var sW    = serviceId + ' saveToLS()';
		var panel = this, pd = panel.data;

		//	prompt for save-as name
		panel.promptSaveAs ( pd );

	};	//	Panel.prototype.saveToLS()

	Panel.prototype.promptSaveAs = function ( savePanelData ) {
		var sW    = serviceId + ' promptSaveAs()';
		var rpd   = this.data.rpd,
			panel = this, 
			pd    = panel.data, 
			cd    = null, 				//	control data
			dlg   = { isBuiltIn: 		true,
					  invokingPanel: 	panel,
					  data: 			null,
					  panel: 			null };

		function onOK() {
			var sW2 = sW + ' onOK()';
			var pd = savePanelData;
			var cd = dlg.panel.getControlDataByName ( 'edtSaveAs' );
			pd.storeName = cd.value;
		//	cmn.log ( sW2 + ':  storeName: ' + pd.storeName );
			uSL.storePanel ( sW2, 
							 rpd.uduiId,	//	For now.  Later, might be a PE UDUI.
							 pd );
			rpd.panel.removeDialog ( dlg );
		}	//	onOK()
		
		function onCancel() {
			var sW2 = sW + ' onCancel()';
		//	cmn.log ( sW2 );
			rpd.panel.removeDialog ( dlg );
		}	//	onCancel()
		
		var o = { 
			sC: 		sW, 
			panelSvc: 	svc,
			root: 		{ 
				svg: 		null,
				data: 		null,
				panelData: 	null,
				panel: 		rpd.panel 
			},
			parentPanel: 	panel,
			dlg: 			dlg,
			panel:  		null,
			panelClick: 	null 
		};

		uSL.loadPanel ( rpd, o );

		if ( o.panel ) {
			if ( (cd = o.panel.getControlDataByName ( 'btnOK' )) !== null )
				cd.cb = onOK;
			if ( (cd = o.panel.getControlDataByName ( 'btnCancel' )) !== null )
				cd.cb = onCancel;
			return;
		}

		var w = 200;
		var h = 140;
		var x = Math.round ( (rpd.w - w) / 2 );
		var y = Math.round ( (rpd.h - h) / 2 );

		dlg.data = svc.createAppPanelData ( { rpd:			rpd,
											  x: 			x + uc.OFFS_4_1_PIX_LINE, 
											  y: 			y + uc.OFFS_4_1_PIX_LINE, 
											  w: 			w, 
											  h: 			h, 
											  name: 		'pnlSaveAs', 
											  bStore: 		true,
											  storeId: 		uc.SAVE_AS_DLG_STORE_ID,
											  storeName: 	uc.SAVE_AS_DLG_STORE_NAME } );
		dlg.data.bSaveRect = dlg.isBuiltIn;

		rpd.panel.appendDialog ( dlg );

		dlg.panel.addControl ( uLabel.createLabelData ( { rpd:	rpd,
														  x: 	20,
														  y: 	20,
														  w: 	60,  
														  h: 	15, 
														  name: 'lblSaveAs',
														  text: 'Save As:' } ) );
		dlg.panel.addControl ( uInput.createInputData ( { rpd: rpd,
														  x: 	80,
														  y: 	20,
														  w: 	80,  
														  h: 	15, 
														  name: 'edtSaveAs',
														  value: '' } ) );
		dlg.panel.addControl ( uButton.createButtonData ( { rpd: rpd,
															x: 		20,
														    y: 		60,
														    w: 		60,  
														    h: 		20, 
														    name: 	'btnOK',
														    text: 	'OK',
														    cb: 	onOK } ) );
		dlg.panel.addControl ( uButton.createButtonData ( { rpd: rpd,
															x: 		80,
														    y: 		60,
														    w: 		60,  
														    h: 		20, 
														    name: 	'btnCancel',
														    text: 	'Cancel',
														    cb: 	onCancel } ) );
	};	//	Panel.prototype.promptSaveAs()

	Panel.prototype.loadFromLS = function() {
		var sW    = serviceId + ' loadFromLS()';
		var panel = this;

		panel.promptLoad (  );

	};	//	Panel.prototype.loadFromLS()

	Panel.prototype.promptLoad = function (  ) {
		var sW    = serviceId + ' promptLoad()';
		var rpd   = this.data.rpd,
			panel = this, 
			pd    = panel.data, 
			cd    = null, 				//	control data
			dlg   = { isBuiltIn: 		true,
					  invokingPanel: 	panel,
					  data: 			null,
					  panel: 			null },
			selectedPanel = null;

		function onListPanelNamesItemClick ( itemData ) {
			selectedPanel = itemData;
		}	//	onListPanelNamesItemClick();

		function onOK() {
			var sW2 = sW + ' onOK()';
		//	cmn.log ( sW2 + ':  storeName: ' + pd.storeName );
			rpd.panel.removeDialog ( dlg );

			if ( ! selectedPanel )
				return;

			o.dlg = null;
			uSL.loadPanel ( rpd, o );
		}	//	onOK()
		
		function onCancel() {
			var sW2 = sW + ' onCancel()';
		//	cmn.log ( sW2 );
			rpd.panel.removeDialog ( dlg );
		}	//	onCancel()
		
		var o = { 
			sC: 		sW, 
			panelSvc: 	svc,
			root: 		{ 
				svg: 		null,
				data: 		null,
				panelData: 	null,
				panel: 		rpd.panel 
			},
			parentPanel: 	panel,
			dlg: 			dlg,
			panel:  		null,
			panelClick: 	uc.appPanelClick
		};

		uSL.loadPanel ( rpd, o );

		if ( o.panel ) {
			if ( (cd = o.panel.getControlDataByName ( 'lstPanelNames' )) !== null ) {
				cd.itemData = [];
				var panelList = uSL.getPanelList ( sW, rpd.uduiId );
				var i, n = panelList.length;
				for ( i = 0; i < n; i++ ) {
					var pnl = panelList[i];

					var itm = { textId: pnl.id + pnl.name,
								text: 	pnl.name,
								data: 	pnl };
					cd.itemData.push ( uList.createListItemData ( itm ) );
				}
				cd.update();
				cd.cb = onListPanelNamesItemClick;
			}
			if ( (cd = o.panel.getControlDataByName ( 'btnOK' )) !== null )
				cd.cb = onOK;
			if ( (cd = o.panel.getControlDataByName ( 'btnCancel' )) !== null )
				cd.cb = onCancel;
			return;
		}

		var w = 200;
		var h = 140;
		var x = Math.round ( (rpd.w - w) / 2 );
		var y = Math.round ( (rpd.h - h) / 2 );

		dlg.data = svc.createAppPanelData ( { rpd:			rpd,
											  x: 			x + uc.OFFS_4_1_PIX_LINE, 
											  y: 			y + uc.OFFS_4_1_PIX_LINE, 
											  w: 			w, 
											  h: 			h, 
											  name: 		'pnlLoad', 
											  bStore: 		true,
											  storeId: 		uc.LOAD_DLG_STORE_ID,
											  storeName: 	uc.LOAD_DLG_STORE_NAME } );
		dlg.data.bSaveRect = dlg.isBuiltIn;

		rpd.panel.appendDialog ( dlg );

		dlg.panel.addControl ( uButton.createButtonData ( { rpd: rpd,
															x: 		20,
														    y: 		60,
														    w: 		60,  
														    h: 		20, 
														    name: 	'btnOK',
														    text: 	'OK',
														    cb: 	onOK } ) );
		dlg.panel.addControl ( uButton.createButtonData ( { rpd: rpd,
															x: 		80,
														    y: 		60,
														    w: 		60,  
														    h: 		20, 
														    name: 	'btnCancel',
														    text: 	'Cancel',
														    cb: 	onCancel } ) );
	};	//	Panel.prototype.promptLoad()

	Panel.prototype.getControlDataByName = function ( name ) {
		var sW    = serviceId + ' getControlDataByName()';
		var panel = this, pd = panel.data, cdd = pd.childData.data, i;
		for ( i = 0; i < cdd.length; i++ )
			if ( cdd[i].name === name )
				return cdd[i];
		return null;
	};	//	Panel.prototype.getControlDataByName()

	Panel.prototype.getControlElementByName = function ( name ) {
		var sW = serviceId + ' getControlElementByName()';
		var cd = this.getControlDataByName ( name );
		if ( cd === null )
			return null;
		var es: any = d3.select ( '#' + cd.eleId );
		var e  = es._groups[0][0];
		return e;
	};	//	Panel.prototype.getControlElementByName()

	Panel.prototype.setInput = function ( ctrlName, value ) {
		var sW = serviceId + ' setInput()';
		var ce = this.getControlElementByName ( ctrlName );
		if ( ce == null ) 
			return;
		ce.__data__.value = value;
		var eles = ce.getElementsByTagName ( 'input' );
		if ( eles.length > 0 )
			eles[0].value = value;
	};	//	Panel.prototype.setInput()

	Panel.prototype.setCheckBox = function ( ctrlName, value ) {
		var sW = serviceId + ' setCheckBox()';
		var ce = this.getControlElementByName ( ctrlName );
		if ( ce == null ) 
			return;
		ce.__data__.value = value;
		var eles = ce.getElementsByTagName ( 'line' );
		for ( var i = 0; i < eles.length; i++ )
			eles[i].class = value ? 'u34-checkbox-checked' : 'u34-checkbox-checked-not';
	};	//	Panel.prototype.setCheckBox()

	Panel.prototype.gridMove = function ( childData, event ) {
		var xy = null;
		if ( event )
			xy = event;
		else
		if ( d3.event )
			xy = d3.event;
		if ( xy === null )
			return null;
		var grid = this.data.grid;
		var gx = grid.isEnabled ? grid.spaceX : 1;
		var gy = grid.isEnabled ? grid.spaceY : 1;
	//	var ex = (Math.round ( (xy.x * 10) / gx ) * gx) / 10;	//	maintain the fractional part of the
	//	var ey = (Math.round ( (xy.y * 10) / gy ) * gy) / 10;	//	position (e.g., panel)
		var fx = Math.round ( (xy.x - Math.trunc ( xy.x )) * 10 ) / 10;	//	maintain the fractional part of the
		var ex = (Math.round ( xy.x / gx ) * gx) + fx;					//	position (e.g., panel), 1 dec place
		var fy = Math.round ( (xy.y - Math.trunc ( xy.y )) * 10 ) / 10;
		var ey = (Math.round ( xy.y / gy ) * gy) + fy;
		if ( (ex === childData.x) && (ey === childData.y) )
			return null;
		return { x: ex, y: ey };
	};	//	Panel.prototype.gridMove()

	Panel.prototype.parentSizedAbsolute = function ( w, h )  { 	//	i.e., this control's "client" area has been resized
		var pd = this.data;
		var dx = w - pd.w + 1;
		var dy = h - pd.h + 1;
		sized ( pd, null, null, dx, dy );
	};	//	Panel.prototype.parentSizedAbsolute()

	function mouseOverDropTargetLeft ( d, i, ele ) {
		var sW = serviceId + ' mouseOverDropTargetLeft()';
	//	cmn.log ( sW );
		uc.dragee.rootPanel.dragInfoLine2 ( 'dock left' );

		uc.dragee.dropTarget = { panel: 		d.panelData.panel,
								 where: 		'left',
								 targetEle: 	ele[i] };

		//	show something to indicate possible drop and dock at left side of panel
	//	var x  = d.x;
		var dw = d.w / 4;
		d.dragTarget.screen
			.select ( 'rect' )
	//		.attr ( 'x',      d.x += dw )		//	move to the right and
	//		.attr ( 'width',  d.w -= dw );		//	make narrower
			.attr ( 'x',      dw )				//	move to the right and
			.attr ( 'width',  d.w - uc.PANEL_BORDER_WIDTH - dw );		//	make narrower
		d.dragTarget.screen 
			.append ( 'rect' )
			.attr ( 'id',     'drop-left-rect' )
	//		.attr ( 'x',      x )				//	in the space opened by the rect adjustment above 
	//		.attr ( 'y',      d.y )
			.attr ( 'x',      0 )				//	in the space opened by the rect adjustment above 
			.attr ( 'y',      0 )
			.attr ( 'width',  dw )
			.attr ( 'height', d.h )
			.attr ( 'class',  'u34-drag-target-drop' );
	}	//	mouseOverDropTargetLeft()


	function mouseLeaveDropTargetLeft ( d, i, ele ) {
		var sW = serviceId + ' mouseLeaveDropTargetLeft()';
	//	cmn.log ( sW );
		uc.dragee.rootPanel.dragInfoLine2 ( '' );

		uc.dragee.dropTarget = null;

		d.dragTarget.screen 					//	undo drop indicator
			.select ( '#drop-left-rect' )
				.remove();
	//	var dw = d.w / 3;
		d.dragTarget.screen
			.select ( 'rect' )
	//		.attr ( 'x',      d.x -= dw )
	//		.attr ( 'width',  d.w += dw );
			.attr ( 'x',      0 )
			.attr ( 'width',  d.w - uc.PANEL_BORDER_WIDTH );
	}	//	mouseLeaveDropTargetLeft()

	function mouseOverDropTargetTop ( d, i, ele ) {
		var sW = serviceId + ' mouseOverDropTargetTop()  panel: ' + d.panelData.name;
	//	cmn.log ( sW );
		uc.dragee.rootPanel.dragInfoLine2 ( 'dock top' );

		uc.dragee.dropTarget = { panel: 		d.panelData.panel,
								 where: 		'top',
								 targetEle: 	ele[i] };

		//	show something to indicate possible drop and dock at top of panel
	//	var y  = d.y;
		var dh = d.h / 4;
		d.dragTarget.screen
			.select ( 'rect' )
	//		.attr ( 'y',       d.y += dh )		//	move down and
	//		.attr ( 'height',  d.h -= dh );		//	make shorter
			.attr ( 'y',       dh )				//	move down and
			.attr ( 'height',  d.h - uc.PANEL_BORDER_WIDTH - dh );		//	make shorter
		d.dragTarget.screen 
			.append ( 'rect' )
			.attr ( 'id',     'drop-top-rect' )
		//	.attr ( 'x',      d.x )				//	in the space opened by the rect adjustment above 
		//	.attr ( 'y',      y )
			.attr ( 'x',      0 )				//	in the space opened by the rect adjustment above 
			.attr ( 'y',      0 )
			.attr ( 'width',  d.w )
			.attr ( 'height', dh )
			.attr ( 'class',  'u34-drag-target-drop' );
	}	//	mouseOverDropTargetTop()

	function mouseLeaveDropTargetTop ( d, i, ele ) {
		var sW = serviceId + ' mouseLeaveDropTargetTop()';
	//	cmn.log ( sW );
		uc.dragee.rootPanel.dragInfoLine2 ( '' );

		d.dragTarget.screen 					//	undo drop indicator
			.select ( '#drop-top-rect' )
				.remove();
	//	var dh = d.h / 3;
		d.dragTarget.screen
			.select ( 'rect' )
	//		.attr ( 'y',      d.y -= dh )
	//		.attr ( 'height', d.h += dh );
			.attr ( 'y',      0 )
			.attr ( 'height', d.h - uc.PANEL_BORDER_WIDTH );
	}	//	mouseLeaveDropTargetTop()

	function mouseOverDropTargetRight ( d, i, ele ) {
		var sW = serviceId + ' mouseOverDropTargetRight()';
	//	cmn.log ( sW );
		uc.dragee.rootPanel.dragInfoLine2 ( 'dock right' );

		uc.dragee.dropTarget = { panel: 		d.panelData.panel,
								 where: 		'right',
								 targetEle: 	ele[i] };

		//	show something to indicate possible drop and dock at right side of panel
	//	var x  = d.x + ((d.w * 3) / 4);
		var x  =        (d.w * 3) / 4;
		var dw = d.w / 4;
		d.dragTarget.screen
			.select ( 'rect' )
	//		.attr ( 'width',  d.w -= dw );		//	make narrower
			.attr ( 'width',  d.w -  dw );		//	make narrower
		d.dragTarget.screen 
			.append ( 'rect' )
			.attr ( 'id',     'drop-right-rect' )
			.attr ( 'x',      x )				//	in the space opened by the rect adjustment above 
	//		.attr ( 'y',      d.y )
			.attr ( 'y',      0 )
			.attr ( 'width',  dw )
			.attr ( 'height', d.h )
			.attr ( 'class',  'u34-drag-target-drop' );
	}	//	mouseOverDropTargetRight()

	function mouseLeaveDropTargetRight ( d, i, ele ) {
		var sW = serviceId + ' mouseLeaveDropTargetRight()';
	//	cmn.log ( sW );
		uc.dragee.rootPanel.dragInfoLine2 ( '' );

		d.dragTarget.screen 					//	undo drop indicator
			.select ( '#drop-right-rect' )
				.remove();
	//	var dw = d.w / 3;
		d.dragTarget.screen
			.select ( 'rect' )
	//		.attr ( 'width',  d.w += dw );
			.attr ( 'width',  d.w - uc.PANEL_BORDER_WIDTH );
	}	//	mouseLeaveDropTargetRight()

	function mouseOverDropTargetBottom ( d, i, ele ) {
		var sW = serviceId + ' mouseOverDropTargetBottom()';
	//	cmn.log ( sW );
		uc.dragee.rootPanel.dragInfoLine2 ( 'dock bottom' );

		uc.dragee.dropTarget = { panel: 		d.panelData.panel,
								 where: 		'bottom',
								 targetEle: 	ele[i] };

		//	show something to indicate possible drop and dock at bottom of panel
	//	var y  = d.y + ((d.h * 3) / 4);
		var y  =        (d.h * 3) / 4;
		var dh = d.h / 4;
		d.dragTarget.screen
			.select ( 'rect' )
	//		.attr ( 'height',  d.h -= dh );		//	make shorter
			.attr ( 'height',  d.h - uc.PANEL_BORDER_WIDTH - dh );		//	make shorter
		d.dragTarget.screen 
			.append ( 'rect' )
			.attr ( 'id',     'drop-bottom-rect' )
	//		.attr ( 'x',      d.x )				//	in the space opened by the rect adjustment above 
			.attr ( 'x',      0 )				//	in the space opened by the rect adjustment above 
			.attr ( 'y',      y )
			.attr ( 'width',  d.w )
			.attr ( 'height', dh )
			.attr ( 'class',  'u34-drag-target-drop' );
	}	//	mouseOverDropTargetBottom()

	function mouseLeaveDropTargetBottom ( d, i, ele ) {
		var sW = serviceId + ' mouseLeaveDropTargetBottom()';
	//	cmn.log ( sW );
		uc.dragee.rootPanel.dragInfoLine2 ( '' );

		d.dragTarget.screen 					//	undo drop indicator
			.select ( '#drop-bottom-rect' )
				.remove();
	//	var dh = d.h / 3;
		d.dragTarget.screen
			.select ( 'rect' )
	//		.attr ( 'height', d.h += dh );
			.attr ( 'height', d.h - uc.PANEL_BORDER_WIDTH );
	}	//	mouseLeaveDropTargetBottom()

	function mouseOverDropTargetCenter ( d, i, ele ) {
		var sW = serviceId + ' mouseOverDropTargetCenter()';
	//	cmn.log ( sW );

		var dcd = uc.dragee.dragCtrlData;

		if ( dcd.parentPanel.data.eleId === d.panelData.eleId ) {
			uc.dragee.rootPanel.dragInfoLine2 ( 'no drop - already floating here' );
			uc.dragee.dropTarget = null;
			return;
		}

		uc.dragee.rootPanel.dragInfoLine2 ( 'float center' );

		uc.dragee.dropTarget = { panel: d.panelData.panel,
								 where: 'center' };

		//	show something to indicate possible drop and float
	//	var x  = d.x + (d.w / 4);
	//	var y  = d.y + (d.h / 4);
		var x  =        d.w / 4;
		var y  =        d.h / 4;
		var dw = d.w / 2;
		var dh = d.h / 2;
		d.dragTarget.screen 
			.append ( 'rect' )
			.attr ( 'id',     'drop-center-rect' )
			.attr ( 'x',      x )				//	in the space opened by the rect adjustment above 
			.attr ( 'y',      y )
			.attr ( 'width',  dw )
			.attr ( 'height', dh )
			.attr ( 'class',  'u34-drag-target-drop' );
	}	//	mouseOverDropTargetCenter()

	function mouseLeaveDropTargetCenter ( d, i, ele ) {
		var sW = serviceId + ' mouseLeaveDropTargetCenter()';
	//	cmn.log ( sW );
		uc.dragee.rootPanel.dragInfoLine2 ( '' );

		d.dragTarget.screen 					//	undo drop indicator
			.select ( '#drop-center-rect' )
				.remove();
	}	//	mouseLeaveDropTargetCenter()


	function pushPanelBaseData ( d, bRootPanel ) {
		bRootPanel = uc.isBoolean ( bRootPanel ) ? bRootPanel : false;
	//	var bd = new BaseData ( 0 +                                          uc.OFFS_4_1_PIX_LINE, 	//	x
	//							0 +                                          uc.OFFS_4_1_PIX_LINE, 	//	y
	//	var bd = new BaseData ( 0 + (  d.docked    ? -uc.OFFS_4_1_PIX_LINE : uc.OFFS_4_1_PIX_LINE), 	//	x
	//							0 + (  d.docked    ? -uc.OFFS_4_1_PIX_LINE : uc.OFFS_4_1_PIX_LINE), 	//	y
		//	2017-May-08
	//	var bd = new BaseData ( 0 + (! d.hasBorder ? -uc.OFFS_4_1_PIX_LINE : uc.OFFS_4_1_PIX_LINE), 	//	x
	//							0 + (! d.hasBorder ? -uc.OFFS_4_1_PIX_LINE : uc.OFFS_4_1_PIX_LINE), 	//	y
		//	2017-May-26		This seems to be undone by the statement that creates the element in 
		//					createPanel() - the statement bases.append ( 'rect' ).  That is createPanel() 
		//					was setting the element to the opposite of what this was setting.
		//	So lets get it straight in the data (here) and in  bases.append ( 'rect' )  just use these 
		//	data values.
	//	var bd = new BaseData ( 0 + (d.hasBorder            ? uc.OFFS_4_1_PIX_LINE : -uc.OFFS_4_1_PIX_LINE), 	//	x
	//							0 + (d.hasBorder            ? uc.OFFS_4_1_PIX_LINE : -uc.OFFS_4_1_PIX_LINE), 	//	y
		//	2017-May-28
	//	var bd = new BaseData ( 0 + (borderInAncestry ( d ) ? uc.OFFS_4_1_PIX_LINE : -uc.OFFS_4_1_PIX_LINE), 	//	x
	//							0 + (borderInAncestry ( d ) ? uc.OFFS_4_1_PIX_LINE : -uc.OFFS_4_1_PIX_LINE), 	//	y
		d.baseX0 = (borderInAncestry ( d ) ? uc.OFFS_4_1_PIX_LINE 
										   : -uc.OFFS_4_1_PIX_LINE);
		d.baseY0 = (borderInAncestry ( d ) ? uc.OFFS_4_1_PIX_LINE 
										   : -uc.OFFS_4_1_PIX_LINE);
		var bd = new BaseData ( d.baseX0,
								d.baseY0,
								0,			//	w, see sizeBaseRectX() call below
								0,			//	h, see sizeBaseRectY() call below
								'base',		//	name
								d,
								d.eleId );
		sizeBaseRectX ( d, bd, bRootPanel );
		sizeBaseRectY ( d, bd, bRootPanel );
		d.baseData.push ( bd );
		return bd;
	}	//	pushPanelBaseData()


	function defineVSclr ( g ) {
		g.each ( function ( d ) {
				if ( ! d.bVertSB ) 
					return;
			g.append ( 'rect' )
				.attr ( 'id',     function ( d, i ) { return d.eleId + '-vsclr'; } )
				.attr ( 'x',      vsclrX )
				.attr ( 'y',      function ( d, i ) { 
					return        (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) + uc.OFFS_4_1_PIX_LINE; 
				} )
				.attr ( 'width',  function ( d, i ) { return uc.VERT_SCROLL_WIDTH; } )
				.attr ( 'height', function ( d, i ) { return 1; } )
				.attr ( 'class',  function ( d, i ) { return 'u34-scroll-thumb'; } )
				.on ( 'mousedown', uCD.mousedownVScroll );
			g.append ( 'line' )
				.attr ( 'id',    function ( d, i ) { return d.eleId + '-vsclr-left-border'; } )
				.attr ( 'x1',    vsclrLeftBorderX )
				.attr ( 'y1',    vsclrLeftBorderY1 ) 
				.attr ( 'x2',    vsclrLeftBorderX )
				.attr ( 'y2',    vsclrLeftBorderY2 )
				.attr ( 'class', function ( d, i ) { return 'u34-scroll-border'; } );
		} );
	}	//	defineVSclr()

	function defineHSclr ( g ) {
		g.each ( function ( d ) {
				if ( ! d.bHorzSB ) 
					return;
			g.append ( 'rect' )
				.attr ( 'id',     function ( d, i ) { return d.eleId + '-hsclr'; } )
				.attr ( 'x',      function ( d, i ) { 
					return        (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) + uc.OFFS_4_1_PIX_LINE; 
				} )
				.attr ( 'y',      hsclrY )
				.attr ( 'width',  function ( d, i ) { return 1; } )
				.attr ( 'height', function ( d, i ) { return uc.VERT_SCROLL_WIDTH; } )
				.attr ( 'class',  function ( d, i ) { return 'u34-scroll-thumb'; } )
				.on ( 'mousedown', uCD.mousedownHScroll );
			g.append ( 'line' )
				.attr ( 'id',    function ( d, i ) { return d.eleId + '-hsclr-top-border'; } )
				.attr ( 'x1', hsclrTopBorderX1 )
				.attr ( 'y1', hsclrTopBorderY )
				.attr ( 'x2', hsclrTopBorderX2 )
				.attr ( 'y2', hsclrTopBorderY )
				.attr ( 'class', function ( d, i ) { return 'u34-scroll-border'; } );
		} );
	}	//	defineHSclr()

	function defineScrollers ( g ) {
		//	A scroll bar - the thumb/handle part - on the base panel. Just a simple rectangle 
		//	for now. Something to indicate scrolled position.
		defineVSclr ( g );
		defineHSclr ( g );
	}	//	defineScrollers()

	function vscrolled ( d, i, ele, dx, dy ) {
		const sW = serviceId + ' vscrolled()';
		let pd = d;
		let bd = pd.baseData[0];
		if ( dy === 0 ) {
			return; }
		cmn.log ( sW, 'd.type ' + d.type + '  d.name ' + d.name + ' dy ' + dy );

		let g = d3.select ( '#' + pd.eleId + '-base' );
		let oy: any = {};	yMinMax ( g, oy );
		//	This done in dragSclred2().  * When moving by the scroll bar 
		//	thumb * -
		//		y		currnt thumb position
		//		ddy		how much the thumb moves * relative to y *
		//		bdy		resulting base position (movement?)
	//	let y   = parseInt ( d3.select ( '#' + d.eleId + '-vsclr' )
	//								.attr ( 'y' ) );
		let ddy = dy;	//	pd.vsMouse.y0 + dy - y;
		let bdy = -parseInt ( (((ddy * oy.eY) / bd.h) + oy.minY)
															.toFixed ( 0 ) );
		//	Move the base.
		let yo = 0;
		g
			.attr ( 'transform', function ( d: any, i ) { 
				let evt = { dx: 0, dy: bdy };
				if ( pd.filledBy && pd.filledBy.parentScrolled ) {
					pd.filledBy.parentScrolled ( uc.TYPE_PANEL, evt ); }
				cmn.log ( sW, 'd.name ' + d.name 
			//				  + ' bdy0 (' + pd.vsMouse.bdy0 + ') - evt.dy (' + evt.dy + ') = ' 
			//				  + (pd.vsMouse.bdy0 - evt.dy) );
			//	d.y = pd.vsMouse.bdy0 - evt.dy;
							  + ' d.y (' + d.y + ') += evt.dy (' + evt.dy + ')  (' + (d.y + evt.dy) + ')' );
				d.y += evt.dy;

				let x = d.x / pd.scale;
				let y = d.y / pd.scale;
				return   'scale(' + pd.scale + ') '
					   + 'translate(' + x + ',' + y + ')'; 
			} );
		let	y  = (pd.panY = bd.y) / pd.scale;
			y  = Math.round ( y * 2 ) / 2;
		yo = (pd.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);
		d3.select ( '#cp-' + bd.panelEleId + '-' + bd.name + '-rect' )
			.attr ( 'y', -y + yo );
		g.select ( '#' + bd.panelEleId + '-' + bd.name + '-rect' )
			.attr ( 'y', -y + yo );

	//	cmn.log ( sW, 'panel: ' + pd.name + '  bd.x y  ' + bd.x + '  ' + bd.y );
		
		if ( pd.propCB ) {			//	update the properties board?
			pd.propCB ( 'panX', pd.panX - pd.baseX0 );
			pd.propCB ( 'panY', pd.panY - pd.baseY0 ); }

		//	Move the scroller thumb.
	//	let iY = (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) + uc.OFFS_4_1_PIX_LINE;	//	indicator position
		let iY = parseInt ( d3.select ( '#' + pd.eleId + '-vsclr' ).attr ( 'y' ) );
	//	let iH = bd.h - uc.PANEL_BORDER_WIDTH;					//	indicator Height
		let iH = parseInt ( ((bd.h * bd.h) / oy.eY).toFixed ( 0 ) ) - uc.PANEL_BORDER_WIDTH;
	//	if ( Math.round ( (-bd.y) + bd.h ) >= oy.maxY ) 
	//		iH = bd.h - iY + uc.OFFS_4_1_PIX_LINE;
	//	cmn.log ( sW, 'bd.y ' + bd.y + '  oy.minY ' + oy.minY + ' < -0.5 ?' );

	//	cmn.log ( sW, 'd.name ' + d.name 
	//				  + '   iY ' + iY 
	//				  + '   iH ' + iH 
	//				  + '   dy ' + dy 
	//				  + '   bd.y (' + bd.y + ') + oy.minY (' + oy.minY + ') ' + (bd.y + oy.minY) + ' < -0.5 ?' );
	 	iY += dy;
		if ( iY < 0 ) {
			iY = 0; }
		if ( iY + iH > bd.h ) {
	//		iH = parseInt ( ((bd.h * bd.h) / oy.eY).toFixed ( 0 ) ) - uc.PANEL_BORDER_WIDTH;
			iY = bd.h - iH; }
	//	cmn.log ( sW,   'bd.h: ' + bd.h 
	//				  + '   minY: ' + oy.minY 
	//				  + '   maxY: ' + oy.maxY
	//				  + '   eY: ' + oy.eY 
	//				  + '   iY: ' + iY  
	//				  + '   iH: ' + iH  
	//				  + '   bd.y: ' + bd.y 
	//				  + '   iY: ' + iY );
		d3.select ( '#' + bd.panelEleId + '-vsclr' )		//	for now, just use the "thumb" on the right
			.attr ( 'y',      function ( d, i ) { return iY; } )
			.attr ( 'height', function ( d, i ) { return iH; } );
	}	//	vscrolled()

	function hscrolled ( d, i, ele, dx, dy ) {
		const sW = serviceId + ' hscrolled()';
		let pd = d;
		let bd = pd.baseData[0];
		if ( dx === 0 ) {
			return; }
//		cmn.log ( sW, 'd.type ' + d.type + '  d.name ' + d.name + ' dx ' + dx );

		let g = d3.select ( '#' + pd.eleId + '-base' );
		let ox: any = {};	xMinMax ( g, ox );
		//	This done in dragSclred2().  * When moving by the scroll bar 
		//	thumb * -
		//		x		currnt thumb position
		//		ddx		how much the thumb moves * relative to x *
		//		bdx		resulting base position (movement?)
		let ddx = dx;
		let bdx = -parseInt ( (((ddx * ox.eX) / bd.w) + ox.minX)
															.toFixed ( 0 ) );
		//	Move the base.
		let xo = 0;
		g
			.attr ( 'transform', function ( d: any, i ) { 
				let evt = { dx: bdx, dy: 0 };
				if ( pd.filledBy && pd.filledBy.parentScrolled ) {
					pd.filledBy.parentScrolled ( uc.TYPE_PANEL, evt ); }
//				cmn.log ( sW, 'd.name ' + d.name 
//							  + ' d.x (' + d.x + ') += evt.dx (' + evt.dx + ')  (' + (d.x + evt.dx) + ')' );
				d.x += evt.dx;

				let x = d.x / pd.scale;
				let y = d.y / pd.scale;
				return   'scale(' + pd.scale + ') '
					   + 'translate(' + x + ',' + y + ')'; 
			} );
		let	x  = (pd.panX = bd.x) / pd.scale;
			x  = Math.round ( x * 2 ) / 2;
		xo = (pd.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);
		d3.select ( '#cp-' + bd.panelEleId + '-' + bd.name + '-rect' )
			.attr ( 'x', -x + xo );
		g.select ( '#' + bd.panelEleId + '-' + bd.name + '-rect' )
			.attr ( 'x', -x + xo );

	//	cmn.log ( sW, 'panel: ' + pd.name + '  bd.x y  ' + bd.x + '  ' + bd.y );
		
		if ( pd.propCB ) {			//	update the properties board?
			pd.propCB ( 'panX', pd.panX - pd.baseX0 );
			pd.propCB ( 'panY', pd.panY - pd.baseY0 ); }

		//	Move the scroller thumb.
		let iX = parseInt ( d3.select ( '#' + pd.eleId + '-hsclr' ).attr ( 'x' ) );
		let iW = parseInt ( ((bd.w * bd.w) / ox.eX).toFixed ( 0 ) ) - uc.PANEL_BORDER_WIDTH;
	//	cmn.log ( sW, 'bd.x ' + bd.x + '  ox.minX ' + ox.minX + ' < -0.5 ?' );

	 	iX += dx;
		if ( iX < 0 ) {
			iX = 0; }
		if ( iX + iW > bd.w ) {
			iX = bd.w - iW; }
	//	cmn.log ( sW,   'bd.w: ' + bd.w 
	//				  + '   minY: ' + ox.minY 
	//				  + '   maxY: ' + ox.maxY
	//				  + '   eY: ' + ox.eY 
	//				  + '   iX: ' + iX  
	//				  + '   iW: ' + iW  
	//				  + '   bd.x: ' + bd.x );
		d3.select ( '#' + bd.panelEleId + '-hsclr' )		//	for now, just use the "thumb" at the bottom
			.attr ( 'x',      function ( d, i ) { return iX; } )
			.attr ( 'height', function ( d, i ) { return iW; } );
	}	//	hscrolled()

	svc.createPanel = function ( parentSelection, childData, bRootPanel ) {
		var sW = 'createPanel()';
		
		//	childData.data is an array - one array item per panel
		//
		//	i.e., may create multiple panels here

		var newPanel = null, cp: any = {}, bTestDropTargets = false;

	//	var pe = parentSelection._groups[0][0];			//	parent element
		var pe = parentSelection.nodes()[0];			//	parent element

	//	cmn.log ( sW, ' parent eleId: ' + pe.id );

		//	each panel is in a group element
		var s = parentSelection.selectAll ( '#' + pe.id + ' > g' );

	//	cmn.log ( sW, ' s length: ' + s._groups[0].length );

		let rpd = null;

		var grps = s
			.data ( childData.data, function ( d ) { 
				return d.id || (d.id = ++childData.nextId); 
			} )
			.enter()
			.each ( function ( d ) { 
			//	cmn.log ( sW, ' - g - new data: ' + d.name ); 
				newPanel = d.panel = new Panel ( d );
			//	if ( ! d.parentPanel )		//	if this is the root panel (has no parent)
				if ( bRootPanel )			//	if this is the root panel (has no parent)
					pushPanelClipPathData ( d );
				var bd = pushPanelBaseData ( d, bRootPanel );	//	Panel "base" data (what controls are rendered on)
				if ( cmn.isNumber ( d.panX ) ) {
					bd.x = cp.x = d.panX; }
				else {
					d.panX = bd.x; }
				if ( cmn.isNumber ( d.panY ) ) {
					bd.y = cp.y = d.panY; }
				else {
					d.panY = bd.y; }
				bTestDropTargets = d.bTestDropTargets;
				if ( ! rpd ) {
					rpd = d.rpd ? d.rpd : d; }
			} )
			.append ( 'g' )
			.attr ( 'id',        function ( d, i ) { return d.eleId; } )
			//	group has no x, y - must transform -
			.attr ( 'transform', function ( d, i ) { return 'translate(' + d.x + ',' + d.y + ')'; } );

		//	This should be done only for the root panel.
		if ( bRootPanel ) {
			//	A <defs> only in the root panel.
		//	var defs = grps.append ( 'defs' );			//	2017-Aug	Putting defs under <svg>
		//	var defs = d3.select ( 'defs' );			//				
			let defs = parentSelection.select ( 'defs' );

			//	The clipPath for the root panel.
			defs.selectAll ( 'clipPath' )
				.data ( rpd.clipPathsData )
				.enter()
				.append ( 'clipPath' )
				.attr ( 'id',     function ( d, i ) { return d.eleId; } )			//	e.g., 'cp-root-base'
				.append ( 'rect' )
				.attr ( 'id',     function ( d, i ) { return d.eleId + '-rect'; } )	//	e.g., 'cp-root-base-rect'
				.attr ( 'x',      function ( d, i ) { return (cp.x !== undefined) ? -cp.x + uc.PANEL_BORDER_WIDTH : d.x; } )
				.attr ( 'y',      function ( d, i ) { return (cp.y !== undefined) ? -cp.y + uc.PANEL_BORDER_WIDTH : d.y; } )
				.attr ( 'width',  function ( d, i ) { return d.w; } )
				.attr ( 'height', function ( d, i ) { return d.h; } );

		//	//	Filters.  For now, one filter to implement a drop shadow.
		//	//		http://stackoverflow.com/questions/6088409/svg-drop-shadow-using-css3
		//	//		https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feGaussianBlur
		//	filtersData.push ( new FilterData ( { eleId: 			'drop-shadow',
		//										  inBlur: 			'SourceAlpha',
		//										  stdDev: 			1,
		//										  dx: 				2,
		//										  dy: 				4,
		//										  inMergeNode2: 	'SourceGraphic' } ) );
		//	defs.selectAll ( 'filter')
		//		.data ( filtersData, function ( d ) { 
		//			return d.id || (d.id = ++nextFilterId); 
		//		} )
		//		.enter()
		//		.each ( function ( d ) {
		//			var filter = d3.select ( this ).append ( 'filter' );
		//			filter
		//				.attr ( 'id', function ( d ) { return d.eleId; } );
		//			filter.append ( 'feGaussianBlur' )
		//				.attr ( 'in',           function ( d ) { return d.inBlur; } )
		//				.attr ( 'stdDeviation', function ( d ) { return d.stdDev; } );
		//			filter.append ( 'feOffset' )
		//				.attr ( 'dx', function ( d ) { return d.dx; } )
		//				.attr ( 'dy', function ( d ) { return d.dy; } );
		//			var merge = filter.append ( 'feMerge' );
		//			merge.append ( 'feMergeNode' );
		//			merge.append ( 'feMergeNode' )
		//				.attr ( 'in', function ( d ) { return d.inMergeNode2; } );
		//		} );
		}


		//	Panel border
		grps.each ( function ( d ) {
			if ( ! d.hasBorder ) 
				return;
			let s = d.borderColor.trim().toLowerCase();
			let color =	cmn.isString ( s ) && (s.length > 0) 
										   && (s !== 'default') ? s : 'null'; 
			d3.select ( this )
				.append ( 'rect' )
				.attr ( 'id',     ( d: any ) => d.eleId + '-panel-border' )
				.attr ( 'x',      0 + uc.OFFS_4_1_PIX_LINE )
				.attr ( 'y',      0 + uc.OFFS_4_1_PIX_LINE )
			//	.attr ( 'width',  function ( d ) { return d.w - uc.PANEL_BORDER_WIDTH; } )
			//	.attr ( 'height', function ( d ) { return d.h - uc.PANEL_BORDER_WIDTH; } )
				.attr ( 'width',  function ( d: any ) { return d.w;                         } )
				.attr ( 'height', function ( d: any ) { return d.h;                         } )
				.attr ( 'class',  function ( d: any ) { return d.borderClass; } )
				.attr ( 'style', 'stroke: ' + color );
		} );

		//	Panel base rectangle - what contents are rendered on
		let pd = newPanel.data;

		function zoomCB() {
			pd.checkPan ( 0, 0 );	//	Checks/limits panX, panY.
	//		pd.updateSclrs();

			let x  = pd.panX / pd.scale;
				x  = Math.round ( x * 2 ) / 2;
			let y  = pd.panY / pd.scale;
				y  = Math.round ( y * 2 ) / 2;
			let xo = (pd.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);
			let yo = (pd.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);

			d3.select ( '#cp-' + pd.eleId + '-base-rect' )
				.attr ( 'x',      -x + xo )
				.attr ( 'y',      -y + yo )
				.attr ( 'width',  function ( cpd ) { 
					let w = sizeBaseRectX ( pd, cpd );
					return w / pd.scale;
				} )
				.attr ( 'height', function ( cpd ) { 
					let h = sizeBaseRectY ( pd, cpd );
					return h / pd.scale;
				} );


			d3.select ( '#' + pd.eleId + '-base-rect' )
				.attr ( 'x',      -x + xo )
				.attr ( 'y',      -y + yo )
				.attr ( 'width',  function ( bd ) { 
					let w = sizeBaseRectX ( pd, bd ); 
					return w / pd.scale;
				} )
				.attr ( 'height', function ( bd ) { 
					let h = sizeBaseRectY ( pd, bd ); 
					return h / pd.scale;
				} );
		}	//	zoomCB()

		let zoom = new uc.Zoom ( { zge:		pd.zge,
								   rect:	pd.eleId + '-base-rect',
								   d:		pd,
								   cb:		zoomCB } );

		let zoomFilter = new uc.ZoomFilter();

		pd.zoomListener = d3.zoom()
								.scaleExtent ( [pd.zge.lowerExtent, 
												pd.zge.upperExtent] )
								.on ( "zoom", zoom )
								.filter ( zoomFilter );
	
		var bases = grps.selectAll ( 'g' )
			.data ( function ( d ) { return d.baseData; } )
			.enter()
			.append ( 'g' )
			.attr ( 'id', d => d.eleId = d.panelEleId + '-' + d.name )
			//	group has no x, y - must transform -
			.attr ( 'transform', d => 'translate(' + d.x + ',' + d.y + ')' )
			.attr ( 'clip-path', d => 'url(#cp-' + d.panelEleId 
												 + '-' + d.name + ')' )
			.on ( 'mouseover', uCD.mouseover )
			.on ( 'mouseout',  uCD.mouseleave )
			.on ( 'mousedown', uCD.mousedown )
			.on ( 'mousemove', uCD.mousemove )
			.on ( 'mouseup',   uCD.mouseup )
			.on ( 'click',     click );
		//	.on ( 'click',     uCD.click );			//	focus

		pd.zge.g = bases;

		bases.each ( function ( bd ) {	//	base data
			var base = this;
			grps.each ( function ( d ) {
				if ( d.eleId === bd.panelEleId ) {
					d.base = d3.select ( base );
				}
			} );
		} );

		//	A transparent rect, covers whole panel. Something to catch drag 
		//	(evidently, you can not click on a <g>).  x y maintained so that 
		//	rect continuously covers only the visible part of the panel.
		bases.append ( 'rect' )
			.attr ( 'id',     d => d.panelEleId + '-' + d.name + '-rect' )
 			//	2017-May-26		Get d.x, y right in pushPanelBaseData() and 
			//					use them here.
			.attr ( 'x',      d => d.x )
 			.attr ( 'y',      d => d.y )
			.attr ( 'width',  d => d.w )
			.attr ( 'height', d => d.h )
			.attr ( 'class',  d => d.panelData.baseClass )
			.call ( pd.zoomListener );

		//	A scroll bar - the thumb/handle part - on the base panel. Just a simple rectangle 
		//	for now. Something to indicate scrolled position.
	//	defineScrollers ( grps );
	//	uCD.defineScrollers ( grps );	//	Based on udui-graph-a.ts.
		defineScrollers ( grps );

		//	For panels, make the size handle size align with the scrollers.  Make the move handle size the same 
		//	as the size handle.
	//	var widthSizeMove  = uc.PANEL_BORDER_WIDTH + uc.VERT_SCROLL_WIDTH  + 1;
	//	var heightSizeMove = uc.PANEL_BORDER_WIDTH + uc.HORZ_SCROLL_HEIGHT + 1;

		grps.each ( function ( d ) {	//	size handle - invisible until mouse is over
			if ( ! d.bSizeRect ) 
				return;
			var sel: any = d3.select ( this );
			sel
				.append ( 'rect' )	
				.attr ( 'id',     function ( d: any, i ) { 
					return d.eleId + '-size'; } )
				.placeSizeHandleRect()
				.attr ( 'width',  widthSizeHandle )
				.attr ( 'height', heightSizeHandle )
				.attr ( 'class',  function ( d, i ) { 
			//		return 'u34-size-handle-rect'; } )		//	always visible	
					return 'u34-size-handle-transparent'; } )
				.on ( 'mouseover', uCD.mouseoverSize )
				.on ( 'mouseout',  uCD.mouseleaveSize )
				.on ( 'mousedown', uCD.mousedownSize )
				.on ( 'mouseup',   uCD.mouseup );			//	2017-Apr-17
			sel
				.append ( 'line' )
				.attr ( 'id',    function ( d, i ) { 
					return d.eleId + '-size-left-border'; } )
				.placeSizeHandleLeftBorder()
				.attr ( 'class', function ( d, i ) { 
			//		return 'u34-size-handle-border'; 
					return 'u34-size-handle-transparent';
				} );
			sel
				.append ( 'line' )
				.attr ( 'id',    function ( d, i ) { 
					return d.eleId + '-size-top-border'; } )
				.placeSizeHandleTopBorder()
				.attr ( 'class', function ( d, i ) { 
			//		return 'u34-size-handle-border'; } );
					return 'u34-size-handle-transparent'; } )
		} );

		grps.each ( function ( d ) {	//	move handle
			if ( ! d.bMoveRect ) 
				return;
			//	move handle is same size as the size handle
			var w  = (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) + uc.VERT_SCROLL_WIDTH  + uc.SCROLL_BORDER_WIDTH;
			var h  = (d.hasBorder ? uc.PANEL_BORDER_WIDTH : 0) + uc.HORZ_SCROLL_HEIGHT + uc.SCROLL_BORDER_WIDTH;
			d3.select ( this )
				.append ( 'rect' )	
				.attr ( 'id',     function ( d: any, i ) { return d.eleId + '-move'; } )
				.attr ( 'x',      0 + uc.OFFS_4_1_PIX_LINE )
				.attr ( 'y',      0 + uc.OFFS_4_1_PIX_LINE )
			//	.attr ( 'width',  widthSizeMove )
			//	.attr ( 'height', heightSizeMove )
				.attr ( 'width',  w )
				.attr ( 'height', h )
				.attr ( 'class',  'u34-move-handle-transparent' )
				.on ( 'mouseover', uCD.mouseoverMove )
				.on ( 'mouseout',  uCD.mouseleaveMove )
				.on ( 'mousedown', uCD.mousedownMove );
		} );

		grps.each ( function ( d ) {	//	Layout save (to LS) rect/handle ...
			var x = 0;
			if ( ! d.bSaveRect ) 
				return;
			if ( d.bMoveRect )
				x = uc.PANEL_BORDER_WIDTH + widthSizeHandle ( d )  + 1;
			d3.select ( this )
				.append ( 'rect' )	
				.attr ( 'id',      function ( d: any, i ) { return d.eleId + '-save'; } )
				.attr ( 'x',       x + uc.OFFS_4_1_PIX_LINE )
				.attr ( 'y',       0 + uc.OFFS_4_1_PIX_LINE )
				.attr ( 'width',   uc.SAVE_HANDLE_WIDTH )
				.attr ( 'height',  uc.SAVE_HANDLE_HEIGHT )
				.attr ( 'class',   'u34-save-handle-transparent' )
			//	.on ( 'mouseover', mouseOverSave )
			//	.on ( 'mouseout',  mouseLeaveSave )
				.on ( 'mouseover', uCD.mouseoverSave )
				.on ( 'mouseout',  uCD.mouseleaveSave )
				.on ( 'click',     clickSave );
		} );

		grps.each ( function ( d ) { 
			if ( ! d.hasCloseBox )
				return;
		//	var x = d.baseData[0].w - uc.CLOSE_HANDLE_WIDTH;
			d3.select ( this )
				.append ( 'rect' )		//	close handle - invisible until mouse is over
				.attr ( 'id',      function ( d: any, i ) { return d.eleId + '-close'; } )
		//		.attr ( 'x',       x + uc.OFFS_4_1_PIX_LINE )
				.attr ( 'x',       closeHandleX )
				.attr ( 'y',       0 + uc.OFFS_4_1_PIX_LINE )
				.attr ( 'width',   uc.CLOSE_HANDLE_WIDTH )
				.attr ( 'height',  uc.CLOSE_HANDLE_HEIGHT )
				.attr ( 'class',   'u34-close-handle-transparent' )
				.on ( 'mouseover', uCD.mouseoverClose )
				.on ( 'mouseout',  uCD.mouseleaveClose )
				.on ( 'click',     clickClose );
		} );

		//	Graph node connectors.
		grps.each ( function ( d ) { 
			if ( ! d.hasConnectors )
				return;
			//	Invisible until mouse is over.
			d3.select ( this )
				.append ( 'rect' )	//	left connector
				.attr ( 'id',      ( d: any ) => d.eleId + '-connector-left' )
				.attr ( 'x',       connectorLeftX )
				.attr ( 'y',       connectorLeftY )
				.attr ( 'width',   uc.CONNECTOR_WIDTH )
				.attr ( 'height',  uc.CONNECTOR_HEIGHT )
				.attr ( 'class',   'u34-connector-transparent' )
				.on ( 'mouseover', uCD.mouseoverConnector )
				.on ( 'mouseout',  uCD.mouseleaveConnector )
				.on ( 'mousedown', uCD.mousedownConnector )
				.on ( 'mouseup',   uCD.mouseupConnector );
			d3.select ( this )
				.append ( 'rect' )	//	top connector
				.attr ( 'id',      ( d: any ) => d.eleId + '-connector-top' )
				.attr ( 'x',       connectorTopX )
				.attr ( 'y',       connectorTopY )
				.attr ( 'width',   uc.CONNECTOR_WIDTH )
				.attr ( 'height',  uc.CONNECTOR_HEIGHT )
				.attr ( 'class',   'u34-connector-transparent' )
				.on ( 'mouseover', uCD.mouseoverConnector )
				.on ( 'mouseout',  uCD.mouseleaveConnector )
				.on ( 'mousedown', uCD.mousedownConnector )
				.on ( 'mouseup',   uCD.mouseupConnector );
			d3.select ( this )
				.append ( 'rect' )	//	right connector
				.attr ( 'id',      ( d: any ) => d.eleId + '-connector-right' )
				.attr ( 'x',       connectorRightX )
				.attr ( 'y',       connectorRightY )
				.attr ( 'width',   uc.CONNECTOR_WIDTH )
				.attr ( 'height',  uc.CONNECTOR_HEIGHT )
				.attr ( 'class',   'u34-connector-transparent' )
				.on ( 'mouseover', uCD.mouseoverConnector )
				.on ( 'mouseout',  uCD.mouseleaveConnector )
				.on ( 'mousedown', uCD.mousedownConnector )
				.on ( 'mouseup',   uCD.mouseupConnector );
			d3.select ( this )
				.append ( 'rect' )	//	bottom connector
				.attr ( 'id',      ( d: any ) => d.eleId + '-connector-bottom' )
				.attr ( 'x',       connectorBottomX )
				.attr ( 'y',       connectorBottomY )
				.attr ( 'width',   uc.CONNECTOR_WIDTH )
				.attr ( 'height',  uc.CONNECTOR_HEIGHT )
				.attr ( 'class',   'u34-connector-transparent' )
				.on ( 'mouseover', uCD.mouseoverConnector )
				.on ( 'mouseout',  uCD.mouseleaveConnector )
				.on ( 'mousedown', uCD.mousedownConnector )
				.on ( 'mouseup',   uCD.mouseupConnector );
		} );

		return newPanel;
	};	//	svc.createPanel


	svc.rmvClipPaths = function ( d, opts ) {
		var sW       = 'rmvClipPaths()';
		var cpEleIds = [];		//	Clip Path element Ids
		let rpd = d.rpd ? d.rpd : d;
		function findClipPaths ( d ) {
			var sW = 'findClipPaths()';
			var i, td;
//			cmn.log ( sW, ' - d - name: ' + d.name + '  eleId: ' + d.eleId ); 
			if ( d.type === uc.TYPE_PANEL ) {
				cpEleIds.push ( 'cp-' + d.eleId + '-base' );

				var be = d.base._groups[0][0];				//	panel's base element
				d3.selectAll ( '#' + be.id + '> g' )		//	just the child g and not descendents of those
					.each ( function ( d ) {
						findClipPaths ( d );
					} );
			}
			else
			if ( d.type === uc.TYPE_PANEL_BASE ) {		//	d is that of the base element
				cpEleIds.push ( 'cp-' + d.eleId );

				d3.selectAll ( '#' + d.eleId + '> g' )		//	just the child g and not descendents of those
					.each ( function ( d ) {
						findClipPaths ( d );
					} );
			}
			else
			if ( d.type === uc.TYPE_LIST ) {
				cpEleIds.push ( 'cp-' + d.eleId );

				if ( d.subMenuData )						//	d is a menu and it has a submenu
					findClipPaths ( d.subMenuData );
			}
			else
			if ( d.type === uc.TYPE_TREE ) {
				cpEleIds.push ( 'cp-' + d.eleId );
			}
			else
			if ( d.type === uc.TYPE_TABS ) {
				for ( i = 0; i < d.tabs.data.length; i++ ) {
					td = d.tabs.data[i];
					cpEleIds.push ( 'cp-' + td.eleId );
					if ( td.panel )
						findClipPaths ( td.panel.data );
				}
			}
			else
//			if ( (! angular.isDefined ( opts )) || ! opts.bKeepChildClipPaths ) {
			if ( (! uc.isDefined ( opts )) || ! opts.bKeepChildClipPaths ) {
				cpEleIds.push ( 'cp-' + d.eleId );
			}
		}	//	findClipPaths();

		//	Find defs data (clip paths) used by d and its child elements.
		findClipPaths ( d );

		//	splice clipPathsData
		while ( cpEleIds.length > 0 ) {
			var eleId = cpEleIds.pop();
			for ( var j = 0; j < rpd.clipPathsData.length; j++ ) {
				if ( rpd.clipPathsData[j].eleId === eleId ) {
					rpd.clipPathsData.splice ( j, 1 );
					break;
				}
			}
		}

		//	remove clip paths from <defs>
	//	d3.select ( 'defs' )
		rpd.svg.select ( 'defs' )
			.selectAll ( 'clipPath' )
			.data ( rpd.clipPathsData, function ( d ) { return d.id; } )
			.exit()
			.each ( function ( d ) { 
			//	cmn.log ( sW, ' - defs - old data: ' + d.eleId ); 
			} )
			.remove();
	}	//	svc.rmvClipPaths()

	svc.updatePanels = function ( parentSelection, ctrls ) {
		var sW = serviceId + ' updatePanels()';

		for ( var i = ctrls.di; i < ctrls.di + ctrls.dn; i++ ) {
			var d = ctrls.data[i];
			parentSelection.select ( '#' + d.eleId + '-move' )
				.remove();
		}

		ctrls.data.splice ( ctrls.di, ctrls.dn );

		var pe = parentSelection._groups[0][0];
		d3.selectAll ( '#' + pe.id + '> g' )		//	just the child g and not descendents of those
			.data ( ctrls.data, function ( d: any ) { return d.id; } )
			.exit()
			.each ( function ( d: any ) { 
		//		cmn.log ( sW, ' - g - old data - name: ' + d.name + '  eleId: ' + d.eleId ); 
				svc.rmvClipPaths ( d );
			} )
			.remove();
	};	//	svc.updatePanels()

	svc.updatePanel = function ( panel, ctrl, opts ) {
	//	var sW = serviceId + ' updatePanel()';
	//	var i;
	//
	//	if ( ctrl.data )
	//		cmn.log ( sW, '  ctrl.data.id: ' + ctrl.data.id + '  ctrl.data.name: ' + ctrl.data.name );
	//	else
	//		cmn.log ( sW, '  ctrl.id: ' + ctrl.id + '  ctrl.name: ' + ctrl.name );
	//
	//	for ( i = 0; i < panel.data.childData.data.length; i++ ) {
	//		if ( ctrl.data ) {
	//			if ( panel.data.childData.data[i].id === ctrl.data.id )  {
	//				panel.data.base.select ( '#' + ctrl.data.eleId + '-move' )
	//					.remove();
	//				break;
	//			}
	//			continue;
	//		}
	//		if ( panel.data.childData.data[i].id === ctrl.id )  {
	//			panel.data.base.select ( '#' + ctrl.eleId + '-move' )
	//				.remove();
	//			break;
	//		}
	//	}
	//
	//	if ( i >= panel.data.childData.data.length ) {
	//		cmn.log ( sW, ' ERROR: can not find control' );
	//		return;
	//	}
	//
	//	panel.data.childData.data.splice ( i, 1 );
	//
	//	var baseEleId;
	//	if ( uc.isDefined ( opts ) && uc.isDefined ( opts.baseEleId ) )
	//		baseEleId = opts.baseEleId;
	//	else
	//		baseEleId = panel.data.base._groups[0][0].id;
	//	d3.selectAll ( '#' + baseEleId + '> g' )		//	just the child g and not descendents of those
	//		.data ( panel.data.childData.data, function ( d ) { return d.id; } )
	//		.exit()
	//		.each ( function ( d ) { 
	//			cmn.log ( sW, ' - g - old data - name: ' + d.name + '  eleId: ' + d.eleId ); 
	//			svc.rmvClipPaths ( d, opts );
	//		} )
	//		.remove();
	//	//
		var opts2 = uc.isDefined ( opts ) ? opts : {};

		if ( ! uc.isDefined ( opts2.removeMove ) )
			opts2.removeMove = true;
		
		svc.rmvControl2 ( panel.data, ctrl, opts2 );

	};	//	svc.updatePanel()

	svc.rmvControl2 = function ( data, ctrl, opts ) {
		var sW = serviceId + ' rmvControl2()';
		var i;

		if ( ! uc.isDefined ( opts ) )
			return;

	//	if ( ctrl.data )
	//		cmn.log ( sW, '  ctrl.data.id: ' + ctrl.data.id + '  ctrl.data.name: ' + ctrl.data.name );
	//	else
	//		cmn.log ( sW, '  ctrl.id: ' + ctrl.id + '  ctrl.name: ' + ctrl.name );

		for ( i = 0; i < data.childData.data.length; i++ ) {
			if ( ctrl.data ) {
				if ( data.childData.data[i].id === ctrl.data.id ) {
					break; } } 
			else {
				if ( data.childData.data[i].id === ctrl.id ) {
					break; } }
		}

		if ( i >= data.childData.data.length ) {
			if ( ctrl.data && ! ctrl.data.parent ) {	//	possibly a screen
				svc.rmvClipPaths ( ctrl.data, opts );
				return;	}
			cmn.error ( '%s: can not find control', sW );
			return; }

		if ( uc.isDefined ( opts.removeMove ) ) {
			if ( ctrl.data ) {
				data.base.select ( '#' + ctrl.data.eleId + '-move' )
					.remove(); }
			else {
				data.base.select ( '#' + ctrl.eleId + '-move' )
					.remove(); } }

		let cd   = cmn.isObject ( ctrl.data ) ? ctrl.data : ctrl;
		let cddp = cd.pathData ? cd.pathData : [];
		cddp.forEach ( dp => {
			let ppd = data;
			function removeOtherPathData ( point ) {
				let oc = ppd.getControlById ( point.panelDataId );
				if ( ! oc ) {
					cmn.error ( sW, 'panel of other path point not found' );
					return; }
				let i = oc.pathData.findIndex ( ocdp => {
					return ocdp.pathId === dp.pathId; } );
				if ( i < 0 ) {
					cmn.error ( sW, 'path not found in other control' ); 
					return; }
				oc.pathData.splice ( i, 1 );
			}	//	removeOtherPathData()
			if ( dp.startPoint.panelDataId !== cd.id ) {
				removeOtherPathData ( dp.startPoint ); }
			else
			if ( dp.endPoint.panelDataId !== cd.id ) {
				removeOtherPathData ( dp.endPoint ); }
			else {
				cmn.error ( sW, 'other path connector point not found' ); }
			d3.selectAll ( '#' + ppd.eleId + '-path-' + dp.pathId )
				.remove(); } );

		data.childData.data.splice ( i, 1 );

		var parentEleId;
		if ( uc.isDefined ( opts.parentEleId ) ) {
			parentEleId = opts.parentEleId; }
		else {
		if ( uc.isDefined ( opts.baseEleId ) ) {
			parentEleId = opts.baseEleId; }
		else {
			parentEleId = data.base._groups[0][0].id; } } 
		d3.selectAll ( '#' + parentEleId + '> g' )		//	just the child g and not descendents of those
			.data ( data.childData.data, function ( d: any ) { return d.id; } )
			.exit()
			.each ( function ( d ) { 
	//			cmn.log ( sW, ' - g - old data - name: ' + d.name + '  eleId: ' + d.eleId ); 
				svc.rmvClipPaths ( d, opts );
			} )
			.remove();

	};	//	svc.rmvControl2()

	svc.removeBaseG = function ( panel ) {
		var sW = 'removeBaseG()';

		panel.data.childData.data = [];

	//	d3.selectAll ( '#' + panel.data.eleId + '> g' )			//	just the child g and not descendents of those
		//	leave the base <g>
	//	d3.selectAll ( '#' + panel.data.eleId + '-base > *' )	//	all children of the base but not descendents of those
		d3.selectAll ( '#' + panel.data.eleId + '-base > g' )	//	all child <g> of the base but not descendents of those
			.data ( [] )
			.exit()
			.each ( function ( d ) { 
			//	cmn.log ( sW, ' - g - old data - name: ' + d.name + '  eleId: ' + d.eleId ); 
				svc.rmvClipPaths ( d );
			} )
			.remove();
	//	d3.select ( '#' + panel.data.eleId + '-base rect' )			leave the <rect> of the base
	//		.each ( function ( d ) { 
	//			cmn.log ( sW, ' - removing rect' );
	//		} )
	//		.remove();
		//	2017-May-21 	Reimplement this.
		//	Assume the panel is being split so that it will contain two new (split) panels
		//	with their own base rects and clippaths.  So, the base rect of the parent panel 
		//	is no longer needed.  Nor its clippath.
	//	d3.select ( '#' + panel.data.eleId + '-base rect' )
	//		.each ( function ( d ) { 
	//			cmn.log ( sW, ' - removing rect' );
	//	//		svc.rmvClipPaths ( d );
	//		} );
	//	d3.select ( '#' + panel.data.eleId + '-base rect' )
	//	d3.select ( '#' + panel.data.eleId + '-base-rect' )
	//		.data ( [] )
	//		.exit()
	//	//	.each ( function ( d ) { 
	//	//		cmn.log ( sW, ' - removing rect' );
	//	//		svc.rmvClipPaths ( d );
	//	//	} )
	//		.remove();
	//	d3.select ( '#' + panel.data.eleId + '-base rect' )
	//		.each ( function ( d ) { 
	//			cmn.log ( sW, ' - rect still selected????' );
	//		} );
		d3.select ( '#' + panel.data.eleId + '-base' )
			.select  ( '#' + panel.data.eleId + '-base-rect' )
			//	.data ( [] )
			//	.exit()
				.each ( function ( d: any ) { 
			//		cmn.log ( sW, ' d.eleId: ' + d.eleId + ' - removing rect' );
					svc.rmvClipPaths ( d );
				} )
				.remove();
	};	//	svc.removeBaseG()

	svc.removeVSclr = function ( pd ) {
		d3.select ( '#' + pd.eleId + '-vsclr' )
			.remove();
		d3.select ( '#' + pd.eleId + '-vsclr-left-border' )
			.remove();
	}	//	svc.removeVSclr()

	svc.removeHSclr = function ( pd ) {
		d3.select ( '#' + pd.eleId + '-hsclr' )
			.remove();
		d3.select ( '#' + pd.eleId + '-hsclr-top-border' )
			.remove();
	}	//	svc.removeHSclr()

	svc.removeSclrs = function ( panel ) {
		svc.removeVSclr ( panel.data );
		svc.removeHSclr ( panel.data );
	};	//	svc.removeSclrs()

	svc.clearFiltersData = function() {
		filtersData = [];			
	};	//	svc.clearFiltersData()

	return svc;

})();
