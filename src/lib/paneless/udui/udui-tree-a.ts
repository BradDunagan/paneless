
//  app/partials/udui/udui-tree-a.js
//
//	2019-Sep-09
//
//  Like udui-list-b. Enhancements -
//
//  	-	Space for an expand/contract button at left of each item. If
//  		item has no children (subitems) the space is taken but no button
//  		is shown.
//
//  	-	When children are showing they are placed to the right of their
//  		parent by the width of expand/contract button.

import * as d3 		from 'd3';

import { cmn }		from '../common';
import { uc } 		from './udui-common';
import { uCD } 		from './udui-control-data-a';
import uBoards	 	from './udui-boards-a';
import clone 		from 'clone';

export var uTree = (function() { 

	'use strict';

	var serviceId = 'uTree';

	/* jshint validthis: true */

	var svc: any = {};

	function mouseOverItem ( evt: PointerEvent, d: any ) { 
	//	var sW = serviceId + ' mouseOverItem()';
		if ( cmn.isBoolean ( d.ignoreMouseOver ) && d.ignoreMouseOver ) {
			return; }
		var td = this.parentNode.__data__;
		if ( td.mouseOver )
			return;
		if ( td.isScrolling )
			return;
		if ( (! td.itemSelected) || (td.itemSelected.textid !== d.textId) ) {
			var g = d3.select ( this );
			g.select ( 'rect' )
				.classed ( 'u34-tree-item',            false )
				.classed ( 'u34-tree-item-mouse-over', true  );
		}
		td.mouseOver = { g: this, d: d, i: -1, ele: evt.target };
	}	//	mouseOverItem()

	function mouseLeaveItem ( evt: PointerEvent, d: any ) {
	//	var sW = serviceId + ' mouseLeaveItem()';
		if ( cmn.isBoolean ( d.ignoreMouseOver ) && d.ignoreMouseOver ) {
			return; }
		var td = this.parentNode.__data__;
		if ( ! td.mouseOver ) {
			if ( td.isScrolling ) 
				td.wasMouseOver = null;
			return;
		}
		if ( td.isScrolling ) {
			td.wasMouseOver = null;
			return;
		}
		var g = d3.select ( this );
		if ( d.td.itemSelected && (d.td.itemSelected.textId ===  d.textId) )
	//	if (   td.itemSelected && (  td.itemSelected.textId === td.textId) )
			g.select ( 'rect' )
				.classed ( 'u34-tree-item-selected',   true )
				.classed ( 'u34-tree-item-mouse-over', false  );
		else
			g.select ( 'rect' )
				.classed ( 'u34-tree-item',            true )
				.classed ( 'u34-tree-item-mouse-over', false  );
		td.mouseOver = null;
	}	//	mouseLeaveItem()

	function clickItem ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' clickItem()';
		var td = d.td;

		cmn.log ( sW, '  Item text: ' + d.text );

		evt.stopPropagation();

		let hostFnc = td.rpd ? td.rpd.hostFnc : td.hostFnc;
		hostFnc ( { do:			'click-focus',
					ctrlD:		null,
					frameAs: 	'',
					paneId:		td.getPaneId() } );
		
		if ( evt.altKey ) {
			cmn.log ( sW, ' altKey' );
			return; }
		
		if ( evt.shiftKey && uc.isFunction ( d.shiftClickCB ) ) {
			let otherMenuItems = null;
			d.shiftClickCB ( evt, d, otherMenuItems ); 
			return; }

		function callback() {
			if ( uc.isFunction ( td.cb ) ) {
				td.cb ( evt, d ); } }

		if ( ! td.wasScrolling ) {
			td.selectItem ( d );
			callback();
		}

	}	//	clickItem()

	function inputInput ( evt, d ) {
		var sW = serviceId + ' inputInput()';
		var inputEle = evt.target;
		cmn.log ( sW, 'd.id: ' + d.id + '  value: ' + inputEle.value );
		evt.stopPropagation();

		if ( d.input.cbInput ) {
			d.input.cbInput ( evt, d ); }

	}	//	inputInput()

	function inputChange ( evt, d ) {
		var sW = serviceId + ' inputChange()';
		var inputEle = evt.target;
		cmn.log ( sW, 'd.id: ' + d.id + '  value: ' + inputEle.value );
		evt.stopPropagation();

		if ( d.input.cbChange ) {
			d.input.cbChange ( evt, d ); }

	}	//	inputChange()

	function clickExpandCollapse ( evt: PointerEvent, d: any ) {
		const sW = 'Tree clickExpandCollapse()';
		cmn.log ( sW, d.text );
		
		var td = d.td;

		evt.stopPropagation();

		let hostFnc = td.rpd ? td.rpd.hostFnc : td.hostFnc;
		hostFnc ( { do:			'click-focus',
					ctrlD:		null,
					frameAs: 	''             } );
		
		if ( d.expanded ) {
			collapse ( d ); 
			if ( cmn.isFunction ( td.collapseCB ) ) {
				td.collapseCB ( d, -1, evt.target ); } }
		else {
			expand ( d );
			if ( cmn.isFunction ( td.expandCB ) ) {
				td.expandCB ( d, -1, evt.target ); } }

		d.td.update();

	}	//	clickExpandCollapse()

	//	Tree Scroll/Pan
	//
	function mouseDown ( evt, d ) {
		var sW = serviceId + ' mouseDown()';
	//	cmn.log ( sW );
		evt.stopPropagation();
	//	if ( d.mouseOver ) {
	//		d.wasMouseOver = d.mouseOver;
	//		mouseLeaveItem.call ( d.mouseOver.g, d.mouseOver.d, d.mouseOver.i, d.mouseOver.ele );
	//	}
	//	d.isScrolling = true;
//		d.dragStartX = d3.event.x;
//		d.dragStartY = d3.event.y;
		d.wasScrolling = false;
		d.scrollingY0  = d.items.y;
	}	//	mouseDown()

	function mouseMove ( evt, d ) {
		var sW = serviceId + ' mouseMove()';
	//	cmn.log ( sW );
		var op = uc.mouseOp;
		if ( ! op )
			return;
		op.updateXY ( evt.pageX, 
					  evt.pageY );		//	uCD.mouseDown() should have set up uc.mouseOp
		var dy = op.y - op.y0;
		if ( (Math.abs ( dy ) < 2) && ! d.isScrolling )
			return;

		if ( ! d.isScrolling ) {
			d.isScrolling = true;
			if ( d.mouseOver ) {
				d.wasMouseOver = d.mouseOver;
				let mo = d.mouseOver;
				mouseLeaveItem.call ( mo.g, mo.d, mo.i, mo.ele ); } }

		op.y0 += dy;
		scroll_v ( d, -1, evt.target, dy );
	}	//	mouseMove()

	function mouseUp ( evt, d ) {
		var sW = serviceId + ' mouseUp()';
	//	cmn.log ( sW );
		if ( d.isScrolling ) {
			d.isScrolling  = false;
			d.wasScrolling = true;
			d.scrollingY0  = 0;
			if ( d.wasMouseOver ) {
				mouseOverItem.call ( d.wasMouseOver.g, d.wasMouseOver.d, d.wasMouseOver.i, d.wasMouseOver.ele );
				d.wasMouseOver = null;
			}
		}
	}	//	mouseUp()

	function onWheel( evt, d ) {
		const sW = serviceId + ' onWheel()';
	//	evt.stopPropagation();
		evt.preventDefault();
		let dx0 = evt.deltaX;
		let dy0 = evt.deltaY;
		let dx = dx0;
		let dy = dy0;
		if ( Math.abs ( dx ) > 10 ) {
			dx = Math.round ( dx0 / 5 ); }
		if ( Math.abs ( dy ) > 10 ) {
		//	dy = Math.round ( dy0 / 5 ); }
			dy = Math.round ( dy0 / 10 ); }
	//	cmn.log ( sW, '  dx0 dx ' + dx0 + ' ' + dx
	//				+ '  dy0 dy ' + dy0 + ' ' + dy );
		
		let td = d.td ? d.td : d;
		
		let lg = d3.select ( '#' + td.eleId + '-items' );
		scroll_v ( td, 0, [lg.node()], -dy );

	//	cmn.log ( sW, '   items.y ' + td.items.y );
	}	//	onWheel()

	function scroll_v_move_stuff ( d, i, ele, dy ) {
		let itemsH = d.itemData.length * d.itemHeight;
		let minY   = d.h - itemsH;
		if ( minY >  uc.OFFS_4_1_PIX_LINE ) {
			minY = uc.OFFS_3_1_PIX_LINE; }
		let x, y;
		let g = d3.select ( ele[i] )
			.attr ( 'transform', function ( d: any, i ) { 
				x = uc.OFFS_4_1_PIX_LINE;
				y = d.items.y +  dy;
				    d.items.y += dy;
				if ( y > 0 ) { 
					y = d.items.y = uc.OFFS_4_1_PIX_LINE; }
				if ( y < minY ) {
					y = d.items.y = minY; }
				return 'translate(' + x + ',' + y + ')'; 
			} );
		d3.select ( '#cp-' + d.eleId + '-rect' )
			.attr ( 'y', function ( d, i ) { return -y + uc.OFFS_4_1_PIX_LINE; } );
		g.select ( '#' + d.eleId + '-items-rect' )
			.attr ( 'y', function ( d: any, i ) { return -d.items.y; } );
	}	//	scroll_v_move_stuff()

	function scroll_v ( d, i, ele, dy ) {
		scroll_v_move_stuff ( d, i, ele, dy );
		updateSclrs ( d );
	}	//	scroll_v()

	function updateSclrs ( d ) {
		const sW = 'serviceId + updateSclrs()';
		let o: any = { minY:	d.items.y,
					   maxY:	d.items.y + (d.itemData.length * d.itemHeight) };
			o.eY = o.maxY - o.minY;
		let dy = (d.h - d.items.y) - o.eY;
	//	cmn.log ( sW, '   d.h ' + d.h 
	//				+ '   d.items.y ' + d.items.y
	//				+ '   o.eY ' + o.eY
	//				+ '   dy ' + dy );
		if ( (d.items.y < 0) && (dy > 0) ) {
			let td = d.td ? d.td : d;
			let lg = d3.select ( '#' + td.eleId + '-items' );
			scroll_v ( td, 0, [lg.node()], dy );
			return; }
		d.updateVsclr ( { y: d.items.y }, o ); 
	};	//	updateSclrs()

	function vscrolled ( d, i, ele, dx, dy ) {
		var sW = serviceId + ' vscrolled()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   dx y: ' + dx + ' ' + dy );
		//	Something like onWheel().
		let td = d.td ? d.td : d;
		var lg = d3.select ( '#' + td.eleId + '-items' );
	//	scroll_v ( td, 0, [lg.node()], -dy );
		//	2022-Oct-02
		let itemsH = d.itemData.length * d.itemHeight;
		let dY = parseInt ( ((dy * itemsH) / d.h).toFixed ( 0 ) );
		scroll_v ( td, 0, [lg.node()], -dY );
	//	cmn.log ( sW, '   items.y ' + td.items.y );
	}	//	vscrolled()

	function click ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' click()';
//		cmn.log ( sW, '  panel: ' + d.name + '  clientX Y: ' + event.clientX + '  ' + event.clientY );
		evt.stopPropagation();
		if ( d.clickDisabled ) {
			d.clickDisabled = false;
			return; }
		if ( evt.shiftKey && uc.isFunction ( d.shiftClickCB ) ) {
			let otherMenuItems = null;
			d.shiftClickCB ( evt, d, otherMenuItems ); 
			return; }
		if ( d.clickCB )
			d.clickCB ( d, d.x - uc.OFFS_4_1_PIX_LINE, d.y - uc.OFFS_4_1_PIX_LINE );
	}	//	click()


	//	Tree Move
	//
	function moved ( d, i, ele, x, y ) {
		var sW = serviceId + ' moved()';
		cmn.log ( sW, ' d.name: ' + d.name + '   x y: ' + x + ' ' + y );
		d3.select ( ele.parentNode )
			.attr ( 'transform', function ( d: any, i ) { 
				return 'translate(' + (d.x = x) + ',' + (d.y = y) + ')'; 
			} );
		d.parentPanel.updateSclrs();
	}	//	moved()

	//	Tree Size
	//
	function cpSizeRectW ( d, dx ) {
		let w = d.w + dx;
		if ( w >= 1 ) {
			d.w = w; }
		return d.w;
	}	//	cpSizeRectW()

	function cpSizeRectH ( d, dy ) {
		let h = d.h + dy;
		if ( h >= 1 ) {
			d.h = h; }
		return d.h;
	}	//	cpSizeRectH()

	function sizeItemsRectW ( d, i ) {
		let w = d.w - (1 * uc.TREE_BORDER_WIDTH);
		return w >= 1 ? w : 1;
	}	//	sizeItemsRectW()

	function sizeItemsRectH ( d, i ) {
		let h = d.h - (1 * uc.TREE_BORDER_WIDTH);
		return h >= 1 ? h : 1;
	}	//	sizeItemsRectH()

	function sizeColumnGs ( td ) {
		let colG = td.columnGs[0];
		if ( (colG.x === null) && (colG.w === null) ) {
			let pw = 1 / td.columnGs.length;
			let w = Math.round ( (td.w - 2) * pw );
			let x = 0;
			td.columnGs.forEach ( colG => {
				colG.x = x;
				colG.w = w;
				colG.pw = pw;	//	propotional
				x += w; } ); }
		else {
			//	New size proportional to current size.
			let x = 0;
			td.columnGs.forEach ( colG => {
				colG.x = x;
				colG.w = Math.round ( (td.w - 2) * colG.pw );
				x += colG.w; } ); }
		
		td.columnGs.forEach ( colG => {
		 	colG.g
				.attr ( 'transform', 'translate(' + colG.x + ', 0)' ); } );
	}	//	sizeColumnGs()

	function sized ( d, i, ele, dx, dy ) {
		var sW = serviceId + ' sized()';
	//	cmn.log ( sW, ' d.name: ' + d.name 
	//				+ '   x y: ' + d.x + '  ' + d.y 
	//				+ '  dx y: ' + dx + ' ' + dy );
		d.w += dx;
		d.h += dy;
		var g = d3.select ( ele.parentNode );
		g.select ( '#' + d.eleId + '-rect' )
			.attr ( 'width',  ( d: any ) => d.w >= 1 ? d.w : 1 )
			.attr ( 'height', ( d: any ) => d.h >= 1 ? d.h : 1 );
		d3.select ( '#cp-' + d.eleId + '-rect' )
			.attr ( 'width',  d => cpSizeRectW ( d, dx ) )
			.attr ( 'height', d => cpSizeRectH ( d, dy ) );
		g.select ( 'g #' + d.eleId + '-items-rect' )
			.attr ( 'width',  sizeItemsRectW )
			.attr ( 'height', sizeItemsRectH );
		g.select ( '#' + d.eleId + '-size' )
			.attr ( 'x', ( d: any ) => d.w - uc.SIZE_HANDLE_WIDTH )
			.attr ( 'y', ( d: any ) => d.h - uc.SIZE_HANDLE_HEIGHT );
		g.select ( '#' + d.eleId + '-vsclr-track' )
			.attr ( 'x',      uCD.vsclrX )
			.attr ( 'y',      0 )
			.attr ( 'width',  uc.VERT_GEN_SCROLL_WIDTH )
			.attr ( 'height', ( d: any ) => d.h );
		if ( ! d.columnGs) {
			g.select ( '#' + d.eleId + '-items' )
				.selectAll ( 'g' )
					.select ( 'rect' )
						.attr ( 'width', ( d: any ) => {
							return itemRectWidth ( d ); 
						} ); 
			g.select ( '#' + d.eleId + '-items' )
				.selectAll ( 'foreignObject' )
					.attr ( 'width',  ( d: any ) => {
						let x = (d.depth() + 1) * d.td.baWidth;
						return (d.td.w - x) + 'px';
					} )
					.each ( ( d: any, i, nodes ) => {
					//	cmn.log ( sW, 'i: ' + i + '  d.id: ' + d.id );
						let tid = d;		//	TreeItemData
						g.select ( '#' +  d.td.eleId + '-' + d.id + '-input-div' )
							.each ( ( d: any, i, nodes ) => {
								let div: any = nodes[i];
							//	div.style['width'] =   d.inputWidth() + 'px';
							//	d is TreeData. Why is it not TreeItemData?
								div.style['width'] = tid.inputWidth() + 'px';
							} );
					} )
		}
		else {
			sizeColumnGs ( d );
			for ( let iCol = 0; iCol < d.columnGs.length; iCol++ ) {
				let colG = d.columnGs[iCol];
			//	let cg = d3.select ( '#' + d.eleId + '-column-' + iCol )
			//		.attr ( 'transform', 'translate( ' + colG.x + ', 0)' );
			//	cg.select ( 'g rect' )
				colG.g.selectAll ( 'g rect' )
					.attr ( 'width', colG.w ); } }
		updateSclrs ( d );
		d.parentPanel.updateSclrs();
	}	//	sized()

	function sized2 ( d, g, dx, dy ) {
	//	let s = g.select ( '#' + d.eleId + '-size' );
	//	let e = s.nodes()[0].parentElement;
		let e = document.getElementById ( d.eleId + '-size' )
		sized ( d, -1, e, dx, dy );
	}	//	sized2()


	function TreeItemData ( textId, text ) {
		var o = (typeof textId === 'object') ? textId : null;
		this.id = 0;
		this.td = null;		//	the TreeData
		this.g  = null;		//	the item's <g> element
		this.y  = 0;		//	where g is tranlated to vertically

		if ( o ) {
			this.textId		= parseInt ( o.textId );
			this.text		= o.text;
			this.textStyle	= cmn.isString ( o.textStyle )
									? o.textStyle
									: '';
			this.ignoreMouseOver = cmn.isBoolean ( o.ignoreMouseOver )
												? o.ignoreMouseOver
												: false;
			this.selectable = cmn.isBoolean ( o.selectable ) ? o.selectable
															 : null;
			this.data    = o.data;
			this.execute = uc.isString ( o.execute ) ? o.execute : ''; 
			this.input	 = cmn.isObject ( o.input ) ? clone ( o.input )
													: null; }
		else {
			this.textId  	= parseInt ( textId );
			this.text    	= text;
			this.textStyle	= '';
			this.ignoreMouseOver = false;
			this.selectable = null;
			this.data    	= null;
			this.execute 	= '';
			this.input	 	= null; }

		if ( this.input ) {
			this.input.inputEle = null; }

		this.parent			= null;
		//	This array always contains all child items whether their parent
		//	(this item) is expanded (and the children are made visible) or not.
		this.children		= [];
		this.wasExpanded	= false;
		this.expanded		= false;

		this.class = 'u34-tree-item';
		
		this.depth = function() {
			if ( this.parent ) {
				return 1 + getDepth ( this.parent ); }
			return 0;
		}
		
	//	this.style = function() {
	//		if ( cmn.isObject ( this.input ) ) {
	//			let d = this;				
	//			return '"width: ' + (d.td.w - ((d.depth() + 1) * d.td.baWidth) - 6) + 'px; '
	//				+   'font-family: ' + d.td.ff + '; '
	//				+   'font-size: ' + d.td.fs + 'px; '
	//				+   'display: flex; '
	//				+   'flex-direction: row;"'; }
	//		return '';
	//	}
		this.inputWidth = function() {
			let d = this;
			return d.td.w - ((d.depth() + 1) * d.td.baWidth) - 6;
		}

	}	//	TreeItemData()

	svc.createTreeItemData = function ( textId, text ) {
		return new TreeItemData ( textId, text );
	};	//	svc.createTreeItemData()

	function TreeItemCellData ( text ) {
		var o = (typeof text === 'object') ? text : null;
		
		//	These are set in update_b().
		this.td = null;					//	the TreeData
		this.g  = null;					//	the item's <g> element
		this.y	= null;

		if ( o ) {
			this.text    = o.text; }
		else {
			this.text    = text; }

		this.class = 'u34-tree-cell';
	}	//	TreeItemCellData()

	svc.createTreeItemCellData = function ( text ) {
		return new TreeItemCellData ( text );
	};	//	svc.createTreeItemCellData()

	function TreeData ( o ) {
		//	Initialize the "base" of this object, ControlData -
		o.type      = uc.TYPE_TREE;
		o.class     = o.class     === undefined ? 'u34-tree' : o.class;
		o.hasBorder = o.hasBorder === undefined ? true       : o.hasBorder;
		uCD.callControlData ( this, o );


		//	Initialize the rest of this object -
		
		this.bVertSB	  = uc.isBoolean ( o.bVertSB ) ? o.bVertSB : true;

		this.cb           = uc.isFunction ( o.cb )           ? o.cb           
															 : null;
		this.shiftClickCB = uc.isFunction ( o.shiftClickCB ) ? o.shiftClickCB 
															 : null;
		this.onProperties = uc.isFunction ( o.onProperties ) ? o.onProperties
															 : null;
		this.style        = uc.isString ( o.style )          ? o.style 
															 : '';
		this.itemStyle    = uc.isString ( o.itemStyle )      ? o.itemStyle 
															 : '';

		this.ff = uc.isString ( o.ff ) ? o.ff : 'verdana';	//	font family
		this.fs = uc.isNumber ( o.fs ) ? o.fs : 12;			//	size, pixels
		this.classText = 'u34-tree-text';

		this.items = { 						
			x: uc.OFFS_4_1_PIX_LINE, 		//	incremented, decremented as list
			y: uc.OFFS_4_1_PIX_LINE 		//	is scrolled/panned
		};

	//	this.itemHeight = this.fs + 4;
		this.itemHeight = this.fs + 8;		//	2018-Apr-21

		this.itemNextId = 0;
		//	This itemData, initially, contains the tree root items (items with
		//	no parents). When a root item is expanded  * the children of that
		//	item are spliced into this array *.
		//	Note that if a child item itself is expanded its children are 
		//	spliced into this array also.
		//	In other words, this array contains all tree items that are 
		//	currently visible in the tree.
		this.itemData	= [];
		this.xData		= {};

		this.isMenu      = (o.isMenu === undefined) ? false : o.isMenu;
		this.subMenuData = null;

		//	scrolling support
		this.isScrolling  = false;
		this.wasScrolling = false;
		this.scrollingY0  = 0;
		this.mouseOver    = null;			//	a { g, d, i, ele } of the tree 
											//	item the mouse is over
		this.wasMouseOver = null;			//	set to mouseOver on mouseDown

		this.itemSelected = null;			//	a TreeItemData

		//	"extra columns" make things appear like a table. Additional "cells"
		//	appear to the right of the normal item text on each "row".
		this.xcolumns 	  = cmn.isArray ( o.xcolumns) ? o.xcolumns: null;

		this.columnGs	  = null;			//	Defined when rendered, updated.


		//	Override some "base" properties -
		this.onMouseDown = mouseDown;
		this.onMouseMove = mouseMove;
		this.onMouseUp   = mouseUp;
		this.onClick	 = click;
		this.onSize  = sized;
		this.onSize2 = sized2;
		this.onMove  = moved;
		this.onVScroll = vscrolled;

		this.execute  = uc.isString ( o.execute )  ? o.execute  : '';
		this.onselect = uc.isObject ( o.onselect ) ? o.onselect : null;

		this.expandBtnWidth		= 10;
		this.expandBtnHeight	= 10;
	//	this.expandBtnClass		= 'u34-tree-expand-btn';
		this.expandBtnClass		= 'u34-tree-expand-btn-stroke-transparent';
		this.baWidth			= 2 + this.expandBtnWidth + 2;	//	button area

		this.expandCB	= uc.isFunction ( o.expandCB )  ? o.expandCB  : null;
		this.collapseCB	= uc.isFunction ( o.collapseCB ) ? o.collapseCB : null;

	}	//	TreeData()

//	TreeData.prototype = uCD.newControlData();
//	TreeData.prototype.constructor = TreeData;
//	See createTreeData()

	function TreeData_scrollIntoView ( d ) {
		const sW = serviceId + ' TreeData.prototype.scrollIntoView()';
		let td = this, g;
		if ( cmn.isString ( d ) ) {
			d = parseInt ( d ); 
			if ( ! cmn.isNumber ( d ) ) {
				cmn.error ( sW, 'd ?' );
				return; } }
		if ( cmn.isNumber ( d ) ) {				//	d is an item text id?
			let i = findItemDataByTextId ( td, d );
			if ( i < 0 ) {
				cmn.error ( sW, ' item not found' );
				return; }
			else {
				d = td.itemData[i]; } }

		if ( 	(d.y - td.itemHeight < -td.items.y)
			 || (d.y + (2 * td.itemHeight) > -td.items.y + td.h) ) {
			let y  = -(d.y - ((td.h - td.itemHeight) / 2));
			let dy = td.items.y - y;
			let lg = d3.select ( '#' + td.eleId + '-items' );
			scroll_v ( td, 0, [lg.node()], -dy ); }
	}	//	TreeData_scrollIntoView()

	function TreeData_selectItem ( d ) {
		const sW = serviceId + ' TreeData.prototype.selectItem()';
		let td = this, g;
		if ( cmn.isString ( d ) ) {
			d = parseInt ( d ); 
			if ( ! cmn.isNumber ( d ) ) {
				cmn.error ( sW, 'd ?' );
				return; } }
		if ( cmn.isNumber ( d ) ) {				//	d is an item id?
			let i = findItemDataByTextId ( td, d );
			if ( i < 0 ) {
				cmn.error ( sW, ' item not found' );
				return; }
			else {
				d = td.itemData[i]; } }

		if ( cmn.isBoolean ( d.selectable ) && ! d.selectable ) {
			return; }	

		if ( td.itemSelected ) {
			g = d3.select ( td.itemSelected.g );
			g.select ( 'rect' )
				.classed ( 'u34-tree-item-selected', false )
				.classed ( 'u34-tree-item',          true  );
			if ( td.itemSelected.id === d.id ) {
				td.itemSelected = null;
				return; } }

		td.itemSelected = d;
		g = d3.select ( d.g );
		g.select ( 'rect' )
			.classed ( 'u34-tree-item-selected',   true  )
			.classed ( 'u34-tree-item',            false )
			.classed ( 'u34-tree-item-mouse-over', false );
		return d;
	}	//	TreeData.prototype.selectItem()

	function TreeData_listProperties() {
		var sW = serviceId + ' TreeData.prototype.listProperties()';
		var value, displayName, props = uCD.listProperties ( this );
		var whiteList = [ 'execute', 'style', 'itemStyle', 'ff', 'fs' ];
		for ( var key in this ) {
			if ( ! whiteList.includes ( key ) )
				continue;
			value = this[key];
			if ( value === undefined )
				continue;
			if ( value === null )
				continue;
			displayName = key;
			switch ( key ) {
				case 'ff': 			displayName = 'font';			break;
				case 'fs': 			displayName = 'font size';		break;
				case 'itemStyle':	displayName = 'item style';		break;
			}
			cmn.log ( sW, '   key: ' + key + '  value: ' + value );
			props.push ( { property:	key, 
						   value:		value, 
						   displayName: displayName } );
		}
		return props;
	}	//	TreeData.prototype.listProperties()

//	TreeData.prototype.setProperty = function ( name, value ) {
	function TreeData_setProperty ( name, value ) {
		var sW = serviceId + ' TreeData.prototype.setProperty()';
		//	handle x, y, w, h, name properties in the "base class" ControlData
		var n, g, rtn;
		rtn = uCD.setProperty ( this, name, value );
		if ( rtn )
			return rtn;
		if ( name === 'execute' ) {
			this[name] = value;
		}
		if ( name === 'ff' ) {
			this[name] = value;
			this.updateStyle();
		}
		if ( name === 'fs' ) {
			n = Number ( value );
			if ( n !== n ) 			//	Good Grief!  ... testing for NaN ...	got'a love JS 
				return;
			this[name] = n;
			this.updateStyle();
		}
		if ( name === 'style' ) {
			this[name] = value;
			d3.select ( '#' + this.eleId + '-rect' )
				.attr ( 'style', value );
		}
		if ( name === 'itemStyle' ) {
			this[name] = value;
			d3.select ( '#' + this.eleId )
				.selectAll ( 'g' )
					.select ( 'rect' )
						.attr ( 'style', value );
		}
	}	//	TreeData.prototype.setProperty()

	function TreeData_clear() {
		this.itemData = [];
		this.update();
		updateSclrs ( this );
	}	//	TreeData.prototype.clear()

//	function TreeData_addItem ( parentTextId, newTextId, newText ) {
	function TreeData_addItem ( o ) {
		//	o is expected to contain -
		//	{ atI:				<integer >= 0>		optional
		//	  parentTextId:		<integer >= 0>, 
		//	  newTextId:		<integer > 0>, 
		//	  newText:			<string>,
		//	  expandParent:		<boolean>,
		//	  xcells:			<null when a regular tree/list> }
		//	xcells - not a regular tree/list, but multiple columns -
		//	[ { name: 		<col-name>,
		//		text:		<string> } ]
		//	optional -
		//	  data:				<object>,
		//	  textStyle:		<style string>,
		//	something possibly editable -
		//	  - for now, does not work with multiple columns
		//	input: {
		//		val:				<string|number>,
		//		bEditable:			<boolean>,
		//		type:				<string>,
		//		step:				<number>
		const sW = 'Tree addItem()';
		let td = this, i, n = td.itemData.length;

		function translate ( g, y ) {
			d3.select ( g )
				.attr ( 'transform', ( d: any ) => { 
					d.y = y;
					return 'translate(' + 0 + ',' 
										+ y + ')'; } ); 
		}	//	translate()

		//	Extra Cells -
		//	-	Text items on the same line, beyond that of the item text.
		//	-	Makes the contents of this control appear like a table with
		//		expandable/collapsable rows.
		//	-	When a row is expaneded the item text (on the far left column)
		//		is probably only shown on the first row of the expansion.
		if ( cmn.isArray ( o.xcells ) ) {
			//	Check some things.
			if ( ! td.xcolumns ) {
				cmn.error ( sW, 'xcells but no xcolumns' );
				return null; }
			if ( o.xcells.length !== td.xcolumns.length ) {
				cmn.error ( sW, 'xcells.length !== td.xcolumns.length' );
				return null; } 
			o.xcells.forEach ( cell => {
				if ( ! td.xcolumns.find ( xcol => xcol.name === cell.name ) ) {
					cmn.error ( sW, 'column of cell not found' );
					return null; }
			//	if ( ! cmn.isArray ( td.xData[cell.name] ) ) {
			//		cmn.error ( sW, 'xData of cell not found' );
			//		return null; }
			} ); }

	//	let newD = svc.createTreeItemData ( o.newTextId, o.newText );
		let di = {
			textId:				o.newTextId,
			text:				o.newText,
			textStyle:			o.textStyle,
			ignoreMouseOver:	o.ignoreMouseOver,
			selectable:			o.selectable,
			data:				o.data ? o.data : null,
			execute:			o.execute,
			input:		cmn.isObject ( o.input ) ? o.input : null };	
		let newD = svc.createTreeItemData ( di );

	


		//	This puts the new item in the tree's itemData.  You must call
		//	update() to show it.

		if ( o.parentTextId === 0 ) {		//	adding a "root" (top) item?
			if ( cmn.isNumber ( o.atI ) ) {
				//	o.atI is an index in the parent's children. It is * not *
				//	an index of td.itemData. o.atI being specified implies
				//	the parent is expanded or the new item is at the top 
				//	level (it has no parent) and the siblings (if any) of
				//	the new item are visible (in td.itemData). So, need to 
				//	get the td.itemData index corresponding to o.atI.
				let idI = findItemDataBy_atI ( td, 0, o.atI );
				if ( idI < 0 ) {
					cmn.error ( sW, 'itemData atI index not found' );
					return null; }
			//	td.itemData.splice ( o.atI, 0, newD ); 
				td.itemData.splice (   idI, 0, newD ); 
				//	Move the ones below down.
				let n = td.itemData.length;
			//	let i = o.atI + 1;
				let i =   idI + 1;
				for ( ; i < n; i++ ) {
					translate ( td.itemData[i].g, i * td.itemHeight ); } 

				if ( cmn.isArray ( o.xcells ) ) {
					o.xcells.forEach ( cell => {
						let data = null;
						//	cell.name must be of col names (checked above)
						if ( ! td.xData[cell.name] ) {
							data = td.xData[cell.name] = []; }
						else {
							data = td.xData[cell.name]; }
						let cellD = svc.createTreeItemCellData ( cell.text );
					//	data.splice ( o.atI, 0, cellD );
					//	i = o.atI + 1;
						data.splice (   idI, 0, cellD );
						i =   idI + 1;
						for ( ; i < n; i++ ) {
							translate ( data.g, i * td.itemHeight ); } 
					} );
				}
			}
			else {
				td.itemData.push ( newD ); 

				if ( cmn.isArray ( o.xcells ) ) {
					o.xcells.forEach ( cell => {
						let data = null;
						//	cell.name must be of col names (checked above)
						if ( ! td.xData[cell.name] ) {
							data = td.xData[cell.name] = []; }
						else {
							data = td.xData[cell.name]; }
						let cellD = svc.createTreeItemCellData ( cell.text );
						data.push ( cellD ); 
					} );
				}
			}
			updateSclrs ( td );
			return newD; 
		}	//	if ( o.parentTextId === 0 )

		//	The tree's itemData array always (and only) contains the items
		//	that are showing (parents are expanded if they have children).
		//
		//	To find the parent item we (for now) search the tree's itemData.
		//
		//	The order of the items in itemData are as they appear in the
		//	tree from top to bottom.
		//
		//	To find a parent item that is itself a child of another item
		//	then that other item must be expanded (showing) - otherwise the
		//	parent will not be in itemData.
		//
		//	Furthermore if the parent item itself already has children then
		//	it must be expanded so that the new item will be inserted into
		//	itemData at the right location.
		//
		//	So, generally, for now, before adding an item (calling this 
		//	function) -
		//
		//		-	call expandItem() on the parent item first.
		//
		//	Now - maybe this will work without the parent item being 
		//	expaneded.

		let parentD = null;
		let wasFoundInItemData = false;
		let opts = { not: '<parent>' };

		i = findItemDataByTextId ( td, o.parentTextId, opts );
		if ( i < 0 ) {
//			cmn.error ( sW, 'parent not found' );
			//	Look harder. Search children.
			let o2 = deepFindByTextId ( td.itemData, o.parentTextId, opts );
			if ( ! o2 ) {
				cmn.error ( sW, 'parent not found' );
				return; } 
			parentD = o2.d; }
		else {
			wasFoundInItemData = true;
			parentD = td.itemData[i]; }

	//	let nc = parentD.children.length;
		let nc = numChildrenShowing ( parentD );

		let idI = null;
		newD.parent = parentD;
		if ( cmn.isNumber ( o.atI ) ) {
			idI = findItemDataBy_atI ( td, o.parentTextId, o.atI );
			if ( idI < 0 ) {
				cmn.error ( sW, 'itemData atI index not found' );
				return null; }
			parentD.children.splice ( o.atI, 0, newD ); }
		//	parentD.children.splice (   idI, 0, newD ); }
		else {
			parentD.children.push ( newD ); }

		nc += 1; 
		if ( wasFoundInItemData && o.expandParent ) {
			if ( cmn.isNumber ( o.atI ) ) {
			//	td.itemData.splice ( i + o.atI + 1,  0, newD ); 
			//	i += o.atI + 1; }
				td.itemData.splice (       idI,      0, newD ); 
				i  =   idI + 1; }
			else {
			//	td.itemData.splice ( i + nc + 1, 0, newD ); 
				td.itemData.splice ( i + nc,     0, newD ); 
				i += nc; }

			//	move the ones below down
			n += 1;
			for ( ; i < n; i++ ) {
				let itemD = td.itemData[i];
				d3.select ( itemD.g )
					.attr ( 'transform', ( d: any ) => { 
						d.y = i * td.itemHeight; 
						return 'translate(' + 0 + ',' + d.y + ')'; 
					} ); } }
		
		if ( (nc === 1) && o.expandParent ) {
			parentD.expanded = true; }

		updateSclrs ( td );
		return newD;
	}	//	TreeData.prototype.addItem()

	function numChildrenShowing ( itemD ) {
		let nShowing = 0;
		if ( itemD.expanded ) {
			let nc = nShowing = itemD.children.length;
			for ( let i = 0; i < nc; i++ ) {
				let childD = itemD.children[i];
				nShowing += numChildrenShowing ( childD ); } }
		return nShowing;
	}	//	numChildrenShowing()

	function TreeData_rmvItem ( textId ) {
		const sW = 'Tree rmvItem()';
		let td = this;

		let bNotFoundOk = false;

		if ( uc.isObject ( textId ) ) {
			let o = textId;
			textId		= o.textId;
			bNotFoundOk = o.bNotFoundOk; }

		//	This removes the item from the tree's itemData.  You must call
		//	update() to un-show it.

		//	The item to be removed must be showing. That is, it must be
		//	in itemData. See comments in addItem().

	//	function numChildrenShowing ( itemD ) {
	//		let nShowing = 0;
	//		if ( itemD.expanded ) {
	//			let nc = nShowing = itemD.children.length;
	//			for ( let i = 0; i < nc; i++ ) {
	//				let childD = itemD.children[i];
	//				nShowing += numChildrenShowing ( childD ); } }
	//		return nShowing;
	//	}	//	numChildrenShowing()
	//	Made accessible to other members.

		//	Since only a shown item can be removed it will be in itemData.
		let ii = findItemDataByTextId ( td, textId );
		if ( ii < 0 ) {
			//	Assume parent item is not expanded. Also assume that simply 
			//	removing it from children[] of the parent item is okay.
			let o = deepFindByTextId ( td.itemData, textId );
			while ( o ) {
				let ic = findChildByTextId ( o.d.parent, textId );
				if ( ic < 0 ) {
					break; }
				o.d.parent.children.splice ( ic, 1 );  
				return; }
			if ( ! bNotFoundOk ) {
				cmn.error ( sW, 'item not found' ); }
			return; }

		let itemD = td.itemData[ii];

		//	Is the item expanded? How many children are being shown? Remove 
		//	those also.
		let nc = numChildrenShowing ( itemD );
			
		//	Remove the item and the children showing.
		td.itemData.splice ( ii, 1 + nc );

		//	move the ones below up
		let i = ii, n = td.itemData.length;
		for ( ; i < n; i++ ) {
			let itemD = td.itemData[i];
			d3.select ( itemD.g )
				.attr ( 'transform', ( d: any ) => { 
					d.y = i * td.itemHeight; 
					return 'translate(' + 0 + ',' + d.y + ')'; 
				} ); }
	
		if ( td.itemSelected && (td.itemSelected.textId === textId) ) {
			td.itemSelected = null; }

		//	Remove from the parent's children.
		if ( itemD.parent ) {
			let ip = findItemDataByTextId ( td, itemD.parent.textId );
			if ( ip < 0 ) {
				cmn.error ( sW, 'parent not found' ); 
				return null; }
			else {
			//	itemD.parent.children.splice ( ii - 1 - ip, 1 ); } 
				let ic = findChildByTextId ( itemD.parent, textId );
				if ( ic < 0 ) {
					cmn.error ( sW, 'child not found' );
					return null; }
				itemD.parent.children.splice ( ic, 1 ); } 
			if ( itemD.parent.children.length === 0 ) {
				//	remove expand/collapse button
				d3.select ( itemD.parent.g ).select ( 'rect ~ rect' )
					.remove();
				d3.select ( itemD.parent.g ).select ( 'rect ~ path' )
					.remove();
				d3.select ( itemD.parent.g ).selectAll ( 'line' )
					.remove(); } }

		updateSclrs ( td );
		return null;
	}	//	TreeData.prototype.rmvItem()
	
	function TreeData_reinsertItem ( o ) {
		//	o is expected to contain -
		//	{ atI:				<integer >= 0>
		//	  parentTextId:		<integer >= 0>, 
		//	  itemD:			<TreeItemData>,
		//	  expandParent:		<boolean> }
		const sW = 'Tree reinsertItem()';
		let td = this, i, n = td.itemData.length;

		function translate ( g, y ) {
			d3.select ( g )
				.attr ( 'transform', ( d: any ) => { 
					d.y = y;
					return 'translate(' + 0 + ',' 
										+ y + ')'; } ); 
		}	//	translate()

		//	Based on, similar to TreeData_addItem().

		//	Extra Cells -
		//		Not implemented (yet?) here.  See TreeData_addItem().

		if ( ! cmn.isNumber ( o.atI ) ) {
			cmn.error ( sW, 'o.atI is not a number' ); 
			return false; }

		let idI = findItemDataBy_atI ( td, o.parentTextId, o.atI );
		if ( idI < 0 ) {
			cmn.error ( sW, 'itemData atI index not found' );
			return false; }

		//	This is called when item being inserted has children. The item
		//	is not expanded.
		//
		//	But the parent item, if any, must be expanded.

		//	This puts the new item in the tree's itemData.  You must call
		//	update() to show it.

		if ( o.parentTextId === 0 ) {	//	Reinserting a "root" (top) item?
			o.itemD.parent = null;
			o.itemD.id = 0;				//	To rebuild in D3.
			o.itemD.g  = null;			//	
			td.itemData.splice (   idI, 0, o.itemD ); 
			//	Move the ones below down.
			let n = td.itemData.length;
			let i =   idI + 1;
			for ( ; i < n; i++ ) {
				translate ( td.itemData[i].g, i * td.itemHeight ); } 

			updateSclrs ( td );
			return true; }

		let parentD = null;
		let opts = { not: '<parent>' };

		i = findItemDataByTextId ( td, o.parentTextId, opts );
		if ( i < 0 ) {
			cmn.error ( sW, 'parent not found' );
			return false; } 
		else {
			parentD = td.itemData[i]; }

		if ( cmn.isNumber ( o.atI ) ) {
			parentD.children.splice ( o.atI, 0, o.itemD ); }
		else {
			parentD.children.push ( o.itemD ); }

		o.itemD.parent = parentD;

		o.itemD.id = 0;				//	To rebuild in D3.
		o.itemD.g  = null;			//	
		td.itemData.splice ( idI, 0, o.itemD ); 
		i  =   idI + 1;

		//	move the ones below down
		n += 1;
		for ( ; i < n; i++ ) {
			let itemD = td.itemData[i];
			d3.select ( itemD.g )
				.attr ( 'transform', ( d: any ) => { 
					d.y = i * td.itemHeight;
					return 'translate(' + 0 + ',' + d.y + ')'; 
				} ); }
		
		if ( o.expandParent ) {
			parentD.expanded = true; }
		updateSclrs ( td );
		return true;
	}	//	TreeData.prototype.reinsertItem()

	function findItemDataByTextId ( td, textId, opts? ) {
		//	The item's parent must be expanded (i.e., the item must be
		//	showing).
		let i, n = td.itemData.length;
		for ( i = 0; i < n; i++ ) {
			if ( td.itemData[i].textId !== textId ) {
				continue; }
			if ( opts && (td.itemData[i].text === opts.not) ) {
				continue; }
			return i; }
		return -1;
	}	//	findItemDataByTextId()

/*
	function deepFindItemDataByTextId ( itemData, textId, opts? ) {
		//	The item's parent must be expanded (i.e., the item must be
		//	showing).
		let i, n = itemData.length;
		for ( i = 0; i < n; i++ ) {
			let d = itemData[i];
			if ( d.textId !== textId ) {
				if ( d.children.length > 0 ) {
					//	This does not make sense.  Returning index of which
					//	array?
					let j = deepFindItemDataByTextId ( d.children, textId );
					if ( j >= 0 ) {
						return j; } }
				continue; }
			if ( opts && (d.text === opts.not) ) {
				continue; }
			return i; }
		return -1;
	}	//	deepFindItemDataByTextId()
*/

	function deepFindByTextId ( itemData, textId, opts? ) {
		let i, n = itemData.length;
		for ( i = 0; i < n; i++ ) {
			let d = itemData[i];
			if ( d.textId !== textId ) {
				if ( d.children.length > 0 ) {
					let o = deepFindByTextId ( d.children, textId );
					if ( o ) {
						return o; } }
				continue; }
			if ( opts && (d.text === opts.not) ) {
				continue; }
			return { d: d, i: i }; }
		return null;
	}	//	deepFindByTextId()

	function deepFindByText ( itemData, text, opts? ) {
		let i, n = itemData.length;
		for ( i = 0; i < n; i++ ) {
			let d = itemData[i];
			if ( d.text !== text ) {
				if ( 	cmn.isObject ( opts ) 
					 && cmn.isBoolean ( opts.bShallow ) && opts.bShallow ) {
					continue; }
				if ( d.children.length > 0 ) {
					let o = deepFindByText ( d.children, text, opts );
					if ( o ) {
						return o; } }
				continue; }
			
			//	opts

			return { d: d, i: i }; }
		return null;
	}	//	deepFindByText()

	function findItemDataBy_atI ( td, parentTextId, atI ) {
		const sW = 'Tree findItemDataBy_atI()';
		//	Look only in td.itemData because it is assumed that the item of
		//	parentTextId (if > 0) is expanded/visible and thus in td.itemData.
		if ( parentTextId > 0 ) {
			let ip = findItemDataByTextId ( td, parentTextId );
			if ( ip < 0 ) {
				cmn.error ( sW, 'parent not found' );
				return -1; }
		//	let dA       = td.itemData[ip].children; 
		//	let expanded = td.itemData[ip].expanded;
		//	if ( atI >= dA.length ) {
			let parent = td.itemData[ip];			//	Expected to be expanded.
			if ( (parent.children.length > 0) && ! parent.expanded ) {
				cmn.error ( sW, 'parent is expected to be expanded' );
				return -1; }
			if ( atI >= parent.children.length ) {
			//	return ip + dA.length + 1; }
			//	return ip + parent.children.length + 1 + nc; }
				let nc = numChildrenShowing ( parent );
				return ip + nc + 1; }
		//	let atD = dA[atI];
			let atD = parent.children[atI];
			let i   = findItemDataByTextId ( td, atD.textId );
			if ( i < 0 ) {
				cmn.error ( sW, 'atI not found in td.itemData' );
				return -1; }
			return i; }
		//	atI must be that of a root item. But we got to iterate past any
		//	expanded items ...
		let i, j = 0, n = td.itemData.length;
		for ( i = 0; i < n; i++ ) {
			let d = td.itemData[i];
			if ( d.parent ) {
				continue; }
			if ( j === atI ) {
				return i; }
			j++; }
		if ( j === atI ) {
			return i; }
		cmn.error ( sW, 'atI not found in roots' );
		return -1;
	}	//	findItemDataBy_atI()

	function findChildByTextId ( parent, textId ) {
		let a = parent.children;
		for ( let i = 0; i < a.length; i++ ) {
			if ( a[i].textId === textId ) {
				return i; } }
		return -1;
	}	//	findChildByTextId()


	function collapse ( itemD ) {
		const sW = 'Tree collapse()';
		let td = itemD.td, i, n = td.itemData.length;

		if ( ! itemD.expanded ) {
			cmn.error ( sW, 'item is not expanded' );
			return itemD; }
		
		//	Is an item selected that is a child of the item to be collapsed?
		if ( td.itemSelected ) {
			let o = deepFindByTextId ( itemD.children, 
									   td.itemSelected.textId );
			if ( o ) {
				td.itemSelected = null; } }

		i = findItemDataByTextId ( td, itemD.textId );
		if ( i < 0 ) {
			cmn.error ( sW, 'item not found' );
			return null; }
		
	//	//	Find the next sibling of itemD.
	//	let is = i + 1;
	//	for ( ; is < n; is++ ) {
	//		let sibD = td.itemData[is];
	//		if ( itemD.parent === null ) {
	//			if ( sibD.parent === null ) {
	//				break; }
	//			continue; }
	//		if ( sibD.parent === null ) {
	//			break; }
	//		if ( sibD.textId === itemD.parent.textId ) {
	//			break; }
	//		if ( sibD.parent.textId === itemD.parent.textId ) {
	//			break; } }
		let nc = numChildrenShowing ( itemD );

		//	Remove the item's children from the tree's itemData[].
	//	let nRmv = is - i - 1;
		let nRmv = nc;
		td.itemData.splice ( i + 1, nRmv );
		n -= nRmv;

		//	Move remaining items below itemD (in itemData[]) up.
		for ( i++; i < n; i++ ) {
			d3.select ( td.itemData[i].g )
				.attr ( 'transform', ( d: any ) => { 
					d.y = i * td.itemHeight;
					return 'translate(' + 0 + ',' + d.y + ')'; 
				} ); }
		
		itemD.expanded = false;
		
		//	caller must call update().
		
		updateSclrs ( td );

		return itemD;
	}	//	collapse()

	function expand ( itemD, i? ) {
		const sW = 'Tree expand()';

		let td = itemD.td, n = td.itemData.length;

		let nS = 0;		//	Number Spliced into td.itemData[].

		function spliceInChildren ( d, nc ) {
			let j;
			for ( j = 0; j < nc; j++ ) {
				let c = d.children[j];
				td.itemData.splice ( i + nS++ + 1, 0, c ); 

				//	if the child is expanded ...
				if ( c.expanded ) {
					spliceInChildren ( c, c.children.length ); } }
		}

		if ( ! cmn.isNumber ( i ) ) {
			i = findItemDataByTextId ( td, itemD.textId );
			if ( i < 0 ) {
				cmn.error ( sW, 'item not found' );
				return null; } }

		let nc = itemD.children.length;
		if ( itemD.expanded || (nc === 0) ) {
			return itemD; }

		spliceInChildren ( itemD, nc );

		//	move the ones below down
		n += nS;
		i += nS;
		for ( ; i < n; i++ ) {
			let itemD = td.itemData[i];
			d3.select ( itemD.g )
				.attr ( 'transform', ( d: any ) => { 
					d.y = i * td.itemHeight;
					return 'translate(' + 0 + ',' + d.y + ')'; 
				} ); }
		
		itemD.expanded = true;
		
		//	caller must call update().
		
		updateSclrs ( td );

		return itemD;
	}	//	expand()
	
	function TreeData_expandItem ( textId ) {
		const sW = 'Tree expandItem()';
		let td = this, i;

		//	The tree's itemData is searched for the specified item.
		//
		//	This means that if the specified item is a child then it's
		//	parent  * must *  itself already be expanded.

		//	This puts the expanded item's children in the tree's itemData.
		//	You must call update() after this to show them.

	//	i = findItemDataByTextId ( td, textId );
	//	i = deepFindItemDataByTextId ( td.itemData, textId );
		//	I think this is right because td.itemData is an array of
		//	all  * showing *  data items.
		i = findItemDataByTextId ( td, textId );
		if ( i < 0 ) {
			cmn.error ( sW, 'item not found' );
			return null; }

		return expand ( td.itemData[i] );
		
		//	caller must call update().
		
	}	//	TreeData.prototype.expandItem()

	function TreeData_collapseItem ( textId ) {
		const sW = 'Tree collapseItem()';
		let td = this, i;

		//	The tree's itemData is searched for the specified item.
		//
		//	This means that if the specified item is a child then it's
		//	parent  * must *  itself already be expanded.

		//	This removes the expanded item's children from the tree's itemData.
		//	You must call update() after this to show them.

	//	i = findItemDataByTextId ( td, textId );
	//	i = deepFindItemDataByTextId ( td.itemData, textId );
		//	I think this is right because td.itemData is an array of
		//	all  * showing *  data items.
		i = findItemDataByTextId ( td, textId );
		if ( i < 0 ) {
			cmn.error ( sW, 'item not found' );
			return null; }

		return collapse ( td.itemData[i] );
		
		//	caller must call update().
		
	}	//	TreeData.prototype.collapseItem()

	function getDepth ( d ) {
		if ( d.parent ) {
			return 1 + getDepth ( d.parent ); }
		return 0;
	}	//	getDepth()

	function updateExpandBtn ( d ) {
		let td = d.td;

		function appendExpandPlus ( gs, x, y ) {
			gs.append ( 'line' )
				.attr ( 'x1', x + 1 )
				.attr ( 'y1', y + (td.expandBtnHeight / 2) )
				.attr ( 'x2', x + td.expandBtnWidth - 1 )
				.attr ( 'y2', y + (td.expandBtnHeight / 2) )
				.attr ( 'class', 'u34-tree-expand-h-line' );
			gs.append ( 'line' )
				.attr ( 'x1', x + (td.expandBtnWidth / 2) )
				.attr ( 'y1', y + 1 )
				.attr ( 'x2', x + (td.expandBtnWidth / 2) )
				.attr ( 'y2', y + td.expandBtnHeight - 1 )
				.attr ( 'class', 'u34-tree-expand-v-line' );
		}	//	appendExpandPlus()

		let x = (getDepth ( d ) * td.baWidth) + 2;
		let y = Math.round ( (td.itemHeight - td.expandBtnHeight) / 2 );

		let gs = d3.select ( d.g );
		let rs = gs.select ( '.' + td.expandBtnClass );

		if ( rs.empty() ) {
			gs
				.append ( 'rect' )
					.attr ( 'x',      x )
					.attr ( 'y',      y )
					.attr ( 'width',  td.expandBtnWidth )
					.attr ( 'height', td.expandBtnHeight )
					.attr ( 'class',  td.expandBtnClass );
			let arc  = d3.arc();
			let path = 	arc ( { innerRadius:	0,
								outerRadius:	td.expandBtnWidth / 2,
								startAngle:		0,
								endAngle:		Math.PI * 2 } );
			gs
				.append ( 'path' )
					.attr ( 'id', ( d: any ) => td.eleId + '-expand-' + d.id )
					.attr ( 'd', path )
					.attr ( 'transform', 'translate ( ' 
												+ (x + (td.expandBtnWidth / 2))
										 + ', ' + (y + (td.expandBtnHeight / 2))
										 + ' )' )
					.style ( 'fill', 'white' )
					.style ( 'stroke', 'gray' )
					.style ( 'stroke-width', '0.5px' )
					.style ( 'cursor', 'pointer' )
					.on ( 'click', clickExpandCollapse ) 

			if ( ! d.expanded ) {
				appendExpandPlus ( gs, x, y ); } }
		else {
			if ( (! d.wasExpanded) && d.expanded ) {
			//	gs.select ( '.u34-tree-expand-v-line' )
			//		.remove(); }
				gs.selectAll ( 'line' )
					.remove(); }
			else
			if ( d.wasExpanded && ! d.expanded ) {
				appendExpandPlus ( gs, x, y ); } }
	}	//	updateExpandBtn()

//	TreeData.prototype.updateStyle = function() {
	function TreeData_updateStyle() {
		var sW = serviceId + ' TreeData.updateStyle()';
		var td = this;
		if ( td.isMenu ) {
			return; }
		var lg = d3.select ( '#' + td.eleId + '-items' );	//	list items g
		var	is = lg.selectAll ( 'g' );
		is.each ( ( d: any ) => {
			d3.select ( d.g ).select ( 'text' )
				.attr ( 'style',   'font-family: ' + td.ff 
								 + '; font-size: ' + td.fs + 'px;' );
		} );
	}	//	updateStyle()

//	TreeData.prototype.update = function() {
	function TreeData_update() {
		var sW = serviceId + ' TreeData.update()';
		var td = this;

		if ( cmn.isArray ( td.xcolumns ) ) {
			td.update_b(); 
			return; }

		var lg = d3.select ( '#' + td.eleId + '-items' );	//	list items g
		var	is = lg.selectAll ( 'g' ) 				//	g for each item ...
			.data ( td.itemData, function ( d: any ) {
				return d.id || (d.id = ++td.itemNextId);
			} );

		var ig = is.enter()							//	... add new item g 
			.append ( 'g' )
			.each ( function ( d: any ) { 
				d.td = td; } )
			.attr ( 'id',     function ( d: any, i ) { 
				var eleId = td.eleId + '-item-g-' + i;
			//	cmn.log ( sW, ' - appending list item - eleId: ' + eleId );
				d.g = this;
				return eleId; 
			} )
			.attr ( 'transform', function ( d: any, i ) { 
				d.y = i * td.itemHeight; 
				return 'translate(' + 0 + ',' + d.y + ')'; 
			} )
			.on ( 'mouseover', mouseOverItem )
			.on ( 'mouseout',  mouseLeaveItem )
			.on ( 'click',     clickItem )
			.on ( 'wheel',     onWheel );

		ig.append ( 'rect')										//	a rect in the item g
		//	.attr ( 'id', ... )									//	no id
			.attr ( 'x',      function ( d, i ) { return 0; } )
			.attr ( 'y',      function ( d, i ) { return 0; } )
			.attr ( 'width',  itemRectWidth )
			.attr ( 'height', td.itemHeight )
			.attr ( 'class',  function ( d: any, i ) { return d.class; } )
			.attr ( 'style',  td.itemStyle );

		ig.each ( ( d: any ) => {
			if ( d.children.length === 0 ) {
				return; }

			//	New items. So we don't expand them and show the children.

			//	Draw the  +  button.
			
			updateExpandBtn ( d );
		} );

		let	igInput: any = null;
		ig.each ( ( d: any ) =>  { 
			if ( cmn.isObject ( d.input ) ) {
				igInput = d.input; } } );

		if ( td.isMenu ) {
			ig.append ( 'foreignObject' )
			//	.attr ( 'id', function ( d, i ) { return d.eleId + '-text'; } )		no id?
				.attr ( 'x', 0 )
			//	.attr ( 'y', 0 )
				.attr ( 'y', ((td.itemHeight - td.fs) / 2) - 1 )		//	2018-Apr-21
			//	.attr ( 'width',  1 )	//	function ( d, i ) { return d.w; } )
			//	.attr ( 'height', 1 ) 	//	function ( d, i ) { return d.h; } )
				.attr ( 'width',  td.w          + 'px' )
				.attr ( 'height', td.itemHeight + 'px' )
				.append ( 'xhtml:body' )
				.style ( 'font', '12px "consolas"' )
			//	.html ( menuItemHTML )
				.html ( uc.textHTML )
				.on ( 'click',    clickItem );
		} else {
		//	if ( cmn.isArray ( td.cells ) && (td.cells.length > 0) ) {
		//		//	Cells - for now -
		//		//	-	Assumption is that the "tree" can only be max one 
		//		//		level deep.
		//		//	-	When an item is expanded only the parent row show its
		//		//		text. Child items do not show text but only their 
		//		//		cells.
		//		//	-	All items always shows its cells.
		//		//	-	So, things appear like a table. Cells, as columns, are
		//		//		horizontally aligned somehow.
		//		//	-	HTML?
		//		//	-	Try multiple SVG 'text' on each row?
		//	}
		//	else {
				if ( igInput && cmn.isObject ( igInput ) ) {
					let inp = ig.append ( 'foreignObject' )
						.attr ( 'x',  ( d: any ) => {
						//	let x = (getDepth ( d ) + 1) * td.baWidth;
							let x = (d.depth()      + 1) * td.baWidth;
							return x; 
						} )
						.attr ( 'y',  d => {
							return 0;
						} )
					//	.attr ( 'width',  td.w          + 'px' )
						.attr ( 'width',  ( d: any ) => {
							let x = (d.depth() + 1) * td.baWidth;
							return (td.w - x) + 'px';
						} )
						.attr ( 'height', td.itemHeight + 'px' )
						.style ( 'padding-left', '4px' )
						.style ( 'padding-top', '3px' )
						.append ( 'xhtml:body' )
							.style ( 'font', '12px "consolas"' )
							.html ( ( d: any, i ) => {
								return uc.varValHTML ( d, i ); 
				 			} );
					//	.on ( 'click',    clickItem )					
	
					inp.select ( 'input' )
						.each ( ( d: any, i, nodes ) => {
							d.input.inputEle = nodes[i];
						} )
						.on ( 'input', inputInput )		//	fires on any change
						.on ( 'change', inputChange );	//	fires when focus lost or on Enter key

					//	To deal with quotes in the input ...
					//	The HTML is this -
					//	<body>
					//		<div>
					//			<div>
					//			<input>
				//	while ( cmn.isString ( igInput.val ) ) {
				//		let body: any = inp.node();
					inp.each ( ( d: any, i, nodes ) => {
						if ( ! cmn.isString ( d.input.val ) ) {
							return; }
						let body: any = nodes[i];
						let div: any  = body.getElementsByTagName ( 'div' )[0];
						if ( ! div ) {
							cmn.error ( sW, 'expected body - div' );
				//			break; }
							return; }
						let input: any = div.getElementsByTagName ( 'input' )[0];
						if ( ! input ) {
							cmn.error ( sW, 'expected body - div - input' );
				//			break; }
							return; }
				//		input.value = igInput.val;
				//		break;
						input.value = d.input.val;
					} );
				} 	//	if ( igInput && cmn.isObject ( igInput ) ) 
				else {
					ig.append ( 'text' )
					//	.attr ( 'id', ... )		no id?
						.attr ( 'text-anchor', 'start' )
						.attr ( 'x',  d => {
							let x = (getDepth ( d ) + 1) * td.baWidth;
							return x; 
						} )
						.attr ( 'y',  d => {
							let	h = td.itemHeight;
							//	why - 1 ?  I don't know.  But it looks better.
							return h - ((h - td.fs) / 2) - 1;
						} )
						.attr ( 'style', ( d: any ) => {
							return	  'font-family: ' + td.ff + '; '
									+ 'font-size: ' + td.fs + 'px; '
									+ d.textStyle; } )
						.attr ( 'class',       'u34-tree-item-text' )
						.text (                function ( d: any, i ) { return d.text; } )
						.on ( 'click',    clickItem ); 
				}
		//	}
		}

		is.each ( ( d: any ) => {

			if ( d.children.length === 0 ) {
				return; }

			updateExpandBtn ( d );
				
			d.wasExpanded = d.expanded;
		} );


		is.exit()									//	... delete old item g
			.remove();

		if ( td.isMenu ) {			//	set list height?
			td.h = (td.itemHeight * td.itemData.length) + 1;
		//	d3.select ( '#cp-' + td.eleId + '-rect' )
		//		.attr ( 'height', function ( d, i ) { 
		//			return d.h - 1; 
		//		} );
			//	2017-Jun-04
			uc.panelSvc.adjustClipPath ( td );
			d3.select ( 'g #' + td.eleId + '-items-rect' )
				.attr ( 'height', sizeItemsRectH );
			d3.select ( '#' + td.eleId  + '-rect' )
				.attr ( 'height', function ( d: any, i ) { 
					return d.h; } );
			d3.select ( '#' + td.eleId  + '-size' )
				.attr ( 'y',      function ( d: any, i ) { 
					return d.h - uc.SIZE_HANDLE_HEIGHT; } );
		}

	}	//	TreeData.prototype.update()


//	function TreeData_update_a() {
//		var sW = serviceId + ' TreeData.update_a()';
//		var td = this;
//		var lg = d3.select ( '#' + td.eleId + '-items' );	//	list items g
//
//		//	Render/Update each column in its own g.  This will make asjusting 
//		//	column widths easier.
//		//
//		//	There are td.xcolumns.length + 1 columns because the main item (the
//		//	text in the left column, what is normally the text item of the 
//		//	tree/list control) is * not * counted as a column in td.xcolumns.
//		
//		if ( ! cmn.isArray ( td.columnGs ) ) {		//	First time?
//			td.columnGs = [];
//			let x = null, colG = null;
//			
//			//	Column for the main item at the left.
//			x = 0;
//			colG = { x:		x,
//					 g:		lg.append ( 'g' )
//								.attr ( 'x', x )
//								.attr ( 'y', 0 ),
//					 data:	td.itemData,
//					 dataNextId:	0 };
//			td.columnGs.push ( colG );
//
//			//	Extra Columns
//			//	Initially space according to current control width.
//			let colWidth = Math.round ( td.w / (td.xcolums.length + 1) );
//			x = colWidth;
//			td.xcolumns.forEach ( xcol => {
//				let data = td.xData[xcol.name] = [];
//				colG = { x:		x,
//						 g:		lg.append ( 'g' )
//									.attr ( 'x', x )
//									.attr ( 'y', 0 ),
//						 data:	data,
//						 dataNextId:	0 };
//				td.columnGs.push ( colG );
//				x += colWidth;
//			} ); }
//
//		//	Do it.
//		td.columnGs.forEach ( colG => {
//			var	is = colG.g.selectAll ( 'g' ) 	//	g for each item/cell ...
//				.data ( colG.data, function ( d ) {
//					return d.id || (d.id = ++colG.dataNextId);
//				} );
//		} );
//
//
//	}	//	TreeData.prototype.update_a()


//	TreeData.prototype.update_b = function() {
	function TreeData_update_b() {
		var sW = serviceId + ' TreeData.updateCells()';
		var td = this;

		//	Render/Update each column in its own g.  This will make adjusting 
		//	column widths easier.
		//
		//	There are td.xcolumns.length + 1 columns because the main item (the
		//	text in the left column, what is normally the text item of the 
		//	tree/list control) is * not * counted as a column in td.xcolumns.
		
		//	First time?
		if ( ! cmn.isArray ( td.columnGs ) ) {		//	First time?
			var lg = d3.select ( '#' + td.eleId + '-items' );	//	list items g
			td.columnGs = [];
			let colG = null;
			
			//	Column for the main item at the left.
			colG = { x:		null,
					 w:		null,
					 pw:	null,
					 g:	lg.append ( 'g' )			//	The actual column g.
						.attr ( 'id', td.eleId + '-column-0' )
						.attr ( 'transform', 'translate(0, 0)' ),
					 data:	td.itemData,			//	TreeItemData
					 dataNextId:	0 };
			td.columnGs.push ( colG );

			//	Extra Columns
			//	Initially space according to current control width.
			let iCol = 1;
			td.xcolumns.forEach ( xcol => {
				let data = td.xData[xcol.name] = [];
				colG = { x:		null,
						 w:		null,
						 pw:	null,
						 g:	lg.append ( 'g' )		//	The actual column g.
							.attr ( 'id', td.eleId + '-column-' + iCol )
							.attr ( 'transform', 'translate(0, 0)' ),
		//				 data:	data,				//	TreeItemData
						 data:	data,				//	TreeItemCellData  ?
						 dataNextId:	0 };
				td.columnGs.push ( colG );
				iCol += 1;
			} ); 
		
			sizeColumnGs ( td ); 
		}	//	first time

		//	Do it.
		var icg = d3.select ( '#' + td.eleId + '-column-0' );	//	item column
		var	is = icg.selectAll ( 'g' ) 				//	g for each item ...
			.data ( td.itemData, function ( d: any ) {
				return d.id || (d.id = ++td.itemNextId);
			} );

		is.enter().each ( ( d, i, nodes ) => {		//	... add new item g 
			//	The conventional list item.
			let ig = d3.select ( nodes[i] )
				.append ( 'g' )
				.each ( function ( d: any ) { 	//	d is TreeItemData
					d.td = td; } )
			//	d is td!
				.attr ( 'id',     function ( d: any ) { 
					var eleId = td.eleId + '-item-g-' + i;
					d.g = this;
					return eleId; 
				} )
				.attr ( 'transform', function ( d: any ) { 
					d.y = i * td.itemHeight; 
					return 'translate(' + 0 + ',' + d.y + ')'; 
				} )
				.on ( 'mouseover', mouseOverItem )
				.on ( 'mouseout',  mouseLeaveItem )
				.on ( 'click',     clickItem )
				.on ( 'wheel',     onWheel );

			ig.append ( 'rect')						//	a rect in the item g
			//	.attr ( 'id', ... )					//	no id
				.attr ( 'x',      function ( d ) { return 0; } )
				.attr ( 'y',      function ( d ) { return 0; } )
				.attr ( 'width',  td.columnGs[0].w )
				.attr ( 'height', td.itemHeight )
				.attr ( 'class',  function ( d: any ) { return d.class; } )
				.attr ( 'style',  td.itemStyle );

			ig.each ( ( d: any ) => {
				if ( d.children.length === 0 ) {
					return; }

				//	New items. So we don't expand them and show the children.

				//	Draw the  +  button.
				
				updateExpandBtn ( d );
			} );

			ig.append ( 'text' )
			//	.attr ( 'id', ... )						no id?
				.attr ( 'text-anchor', 'start' )
				.attr ( 'x',  d => (getDepth ( d ) + 1) * td.baWidth )
				.attr ( 'y',  d => {
					var h = td.itemHeight;
					return h - ((h - td.fs) / 2) - 1;		//	why - 1 ?  I don't know.  But it looks better.
				} )
			//	.attr ( 'style', d => { return 'font-family: ' + td.ff + '; font-size: ' + td.fs + 'px;'; } )
				.attr ( 'style', ( d: any ) => {
					return	  'font-family: ' + td.ff + '; '
							+ 'font-size: ' + td.fs + 'px; '
							+ d.textStyle; } )
				.attr ( 'class',       'u34-tree-item-text' )
				.text (                function ( d: any, i ) { return d.text; } )
				.on ( 'click',    clickItem ); 

			//	The extra column cells.
			for ( let ic = 1; ic < td.columnGs.length; ic++ ) {
				let colG = td.columnGs[ic];
			//	let ig = colG.g
			//		.append ( 'g' )
			//	//	.each ( function ( d ) { 
			//	//		d.td = td; } )
			//	//	d is td!
				//	Should be TreeItemCellData, set in addItem().
				if ( ! colG.data[i] ) {	
					cmn.error ( sW, 'colG.data[i] should be TreeItemCellData' );
				}
				let ig = colG.g
					.append ( 'g' )
					.data ( [colG.data[i]] )
				//	.each ( function ( d, i, nodes ) { 
				//		d.td = td; 
				//		d.g  = nodes[i]; } )
					.attr ( 'id',     function ( d ) { 
						d.td = td;
						d.g  = this;
						return td.eleId + '-column-' + ic + '-g-' + i;
					} )
					.attr ( 'transform', function ( d ) { 
				//		d.y = i * td.itemHeight; 
				//		return 'translate(' + 0 + ',' + d.y + ')'; 
				//	d is td.  Instead -
				//		let y = i * td.itemHeight; 
				//		return 'translate(' + 0 + ',' + y + ')'; 
						//	d is now TreeItemCellData.  This should be ok.
						d.y = i * td.itemHeight; 
						return 'translate(' + 0 + ',' + d.y + ')'; 
					} )
					.on ( 'mouseover', mouseOverItem )
					.on ( 'mouseout',  mouseLeaveItem )
					.on ( 'click',     clickItem )
					.on ( 'wheel',     onWheel );

				ig.append ( 'rect')										//	a rect in the item g
					.attr ( 'x',      0 )
					.attr ( 'y',      0 )
					.attr ( 'width',  colG.w )
					.attr ( 'height', td.itemHeight )
					.attr ( 'class',  'u34-tree-item' );

				//	Cells - for now -
				//	-	Assumption is that the "tree" can only be max one 
				//		level deep.
				//	-	When an item is expanded only the parent row show its
				//		text. Child items do not show text but only their 
				//		cells.
				//	-	All items always shows its cells.
				//		//	-	So, things appear like a table. Cells, as columns, are
				//		horizontally aligned somehow.
				//	-	HTML?
				//	-	Try multiple SVG 'text' on each row?
				ig.append ( 'text' )
					.attr ( 'text-anchor', 'start' )
					.attr ( 'x',  0 )
					.attr ( 'y',  d => {
						var h = td.itemHeight;
						return h - ((h - td.fs) / 2) - 1;		//	why - 1 ?  I don't know.  But it looks better.
					} )
					.attr ( 'style',   'font-family: ' + td.ff 
									 + '; font-size: ' + td.fs + 'px;' )
					.attr ( 'class',       'u34-tree-item-text' )
					.text ( colG.data[i].text )
					.on ( 'click',    clickItem ); 

			}	//	for ( ic < td.xcolumns.length )
		} );	//	is.enter().each ( ...

		is.each ( ( d: any ) => {

			if ( d.children.length === 0 ) {
				return; }

			//	Existing items. If expanded then
			//		draw a  +  in a box
			//	else
			//		draw a  -  in a box

			updateExpandBtn ( d );
				
			d.wasExpanded = d.expanded;
		} );


		is.exit()												//	... delete old item g
			.remove();

		if ( td.isMenu ) {			//	set list height?
			td.h = (td.itemHeight * td.itemData.length) + 1;
		//	d3.select ( '#cp-' + td.eleId + '-rect' )
		//		.attr ( 'height', function ( d, i ) { 
		//			return d.h - 1; 
		//		} );
			//	2017-Jun-04
			uc.panelSvc.adjustClipPath ( td );
			d3.select ( 'g #' + td.eleId + '-items-rect' )
				.attr ( 'height', sizeItemsRectH );
			d3.select ( '#' + td.eleId  + '-rect' )
				.attr ( 'height', function ( d: any, i ) { 
					return d.h; } );
			d3.select ( '#' + td.eleId  + '-size' )
				.attr ( 'y',      function ( d: any, i ) { 
					return d.h - uc.SIZE_HANDLE_HEIGHT; } );
		}

	}	//	TreeData.prototype.update_b()


	function TreeData_setItemText ( textId, text ) {
		const sW = 'Tree setItemText()';
		let td = this, i;

		//	The tree's itemData is searched for the specified item.
		//
		//	This means that if the specified item is a child then it's
		//	parent  * must *  be expanded.

		i = findItemDataByTextId ( td, textId );
		if ( i < 0 ) {
			cmn.error ( sW, 'item not found' );
			return; }
		
		let d = td.itemData[i]; 
		
		d.text = text;

		d3.select ( d.g )
			.select ( 'text' )
				.text ( ( d: any ) => d.text );
		
	}	//	TreeData.prototype.setItemText()


	function TreeData_findItem ( textId ) {
		const sW = 'Tree findItem()';
		let td = this;
		let o = deepFindByTextId ( td.itemData, textId );
		if ( ! o ) {
			return null; }
		return o.d;
	}	//	TreeData.prototype.findItem()

	function TreeData_findItemByText ( text, opts? ) {
		const sW = 'Tree findItem()';
		let td = this;
		let itemData = td.itemData;
		if ( cmn.isObject ( opts ) && cmn.isInteger ( opts.parentTextId ) ) {
			let parent = td.findItem ( opts.parentTextId );
			if ( ! parent ) {
				return null; }	
			itemData = parent.children; }
		let o = deepFindByText ( itemData, text, opts );
		if ( ! o ) {
			return null; }
		return o.d;
	}	//	TreeData.prototype.findItemByText()

	
	function TreeData_nextItem ( textId ) {
		const sW = 'Tree nextItem()';
		let td = this;
		let i  = findItemDataByTextId ( td, textId );
		if ( i < 0 ) {
			cmn.error ( sW, 'item not found' );
			return null; }
		if ( i >= td.itemData.length - 1 ) {
			cmn.error ( sW, 'no next item' );
			return null; }
		return td.itemData[i + 1];
	}	//	TreeData.prototype.nextItem()


	function TreeData_parentItem ( textId ) {
		const sW = 'Tree parentItem()';
		let td = this;
		let i  = findItemDataByTextId ( td, textId );
		if ( i < 0 ) {
			cmn.error ( sW, 'item not found' );
			return null; }
		let item = td.itemData[i];
		if ( ! item.parent ) {
			cmn.error ( sW, 'item has no parent' );
			return null; }
		return item.parent;
	}	//	TreeData.prototype.parentItem()


	function TreeData_getBAWidth() {
		const sW = 'Tree getBAWidth()';
		return this.baWidth;
	}	//	TreeData.prototype.getBAWidth()


	svc.createTreeData = function ( o ) {

		let p = TreeData.prototype = uCD.newControlData();
		p.constructor		= TreeData;
		p.scrollIntoView	= TreeData_scrollIntoView;
		p.selectItem		= TreeData_selectItem;
		p.listProperties	= TreeData_listProperties;
		p.setProperty		= TreeData_setProperty;
		p.clear				= TreeData_clear;
		p.addItem			= TreeData_addItem;
		p.rmvItem			= TreeData_rmvItem;
		p.reinsertItem		= TreeData_reinsertItem;
		p.expandItem		= TreeData_expandItem;
		p.collapseItem		= TreeData_collapseItem;
		p.updateStyle		= TreeData_updateStyle;
		p.update			= TreeData_update;
	//	p.update_a			= TreeData_update_a;
		p.update_b			= TreeData_update_b;
		p.setItemText		= TreeData_setItemText;
		p.findItem			= TreeData_findItem;
		p.findItemByText	= TreeData_findItemByText;
		p.nextItem			= TreeData_nextItem;
		p.parentItem		= TreeData_parentItem;
		p.getBAWidth		= TreeData_getBAWidth;

		return new TreeData ( o );
	};	//	svc.createTreeData()


	function Tree ( data ) {
		this.data = data;
	}

	function itemRectWidth ( d ) {
		let w = d.td.w - 1;
		return w >= 1 ? w : 1;
	}	//	itemRectWidth()


//	function menuItemHTML ( d, i ) {
//		var td   = d.td,
//			text, iconHTML, textHTML,
//			html;
//		//	submenu or dialog
//		if ( d.text.endsWith ( '>' ) ) {
//			text = d.text.slice ( 0, -1 ).trimRight();
//			iconHTML = 
//				'<i '
//			+		'class="fa fa-chevron-right" '
//		//	+		'style="padding-top: 1px;">'
//			+		'style="padding-right: 4px; padding-top: 2px;">'	//	2018-Apr-21
//			+	'</i>';
//
//		} else
//		if ( d.text.endsWith ( '...' ) ) {
//			text = d.text.slice ( 0, -3 ).trimRight();
//		//	iconHTML = '<span>...</span>';
//			iconHTML = '<span style="padding-right: 4px;">...</span>';
//		} else {
//			text = d.text;
//			iconHTML = '';
//		}
//
//		//	look for hot key
//		var iOB = text.indexOf ( '[' );
//		var iCB = text.indexOf ( ']' );
//		if ( iCB - iOB === 2 ) {
//			textHTML = 
//		//		'<span>'
//				'<span style="padding-left: 6px">'		//	2018-Apr-21
//			+		text.slice ( 0, iOB ) 
//			+ 		'<span style="text-decoration: underline;">' + text[iOB + 1] + '</span>' 
//			+ 		text.slice ( iCB + 1 )
//			+	'</span>';
//		} else
//			textHTML = text;
//
//		html = 
//			'<div '
//		+		'class="u34-tree-item-text" '
//		+		'style="width: ' + (td.w - 2) + 'px; font-family: ' + td.ff + '; font-size: ' + td.fs + 'px;">'
//		+		textHTML
//		+		iconHTML
//		+	'</div>';
//
//		return html;					
//	}	//	menuItemHTML()
//	menuItemHTML() is now implemented as textHTML() in udui-common.js.

	Tree.prototype.update = function() {
		this.data.update();
	};	//	Tree.prototype.update()

	Tree.prototype.addSubMenu = function ( subMenuData ) {
		var menu = this, subMenu = null;

		subMenuData.parentMenu = menu;						//	submenu's ref to parent
		subMenuData.eleId      = menu.data.eleId + '-' + subMenuData.name;

		menu.data.parentPanel.addClipPath ( subMenuData );

		menu.data.subMenuData = subMenuData;				//	parent's ref to submenu

		subMenu = subMenuData.list = new Tree ( subMenuData );

		var grp = d3.select ( '#' + menu.data.eleId )
			.append ( 'g' )
			.data ( [subMenuData] );

		defineGroup ( grp );

		return subMenu;

	};	//	Tree.prototype.addSubMenu()

	svc.defineTree = function ( panel ) {
		var sW = serviceId + ' defineTree()';
		var newTree = null;

		var s = panel.data.base.selectAll ( '#' + panel.data.eleId + '-base' + ' > g' );
//		cmn.log ( sW, '  s length: ' + s._groups[0].length );

		var d = s
			.data ( panel.data.childData.data, function ( d ) { 
					return d.id || (d.id = ++panel.data.childData.nextId); 
			} );

		var e = d
			.enter();

		var grp = e
			.each ( function ( d ) { 
//				cmn.log ( sW, ' - g - new data: ' + d.name ); 
				newTree = d.list = new Tree ( d );
			} )
			.append ( 'g' );

		defineGroup ( grp );

		uCD.defineScrollers ( grp );	//	Based on that in udui-panel-f.js.

		newTree.update();

		updateSclrs ( newTree.data );
		
		return newTree;
	};	//	svc.defineTree()

	function defineGroup ( g ) {
		g
			.attr ( 'id',        function ( d, i ) { return d.eleId; } )
			//	group has no x, y - must transform -
			.attr ( 'transform', function ( d, i ) { return 'translate(' + d.x + ',' + d.y + ')'; } );

		g.append ( 'rect' )
			.attr ( 'id',     function ( d, i ) { return d.eleId + '-rect'; } )
			.attr ( 'width',  function ( d, i ) { return d.w; } )
			.attr ( 'height', function ( d, i ) { return d.h; } )
			.attr ( 'style',  ( d ) => {
				return d.style; } )
			.attr ( 'class',  function ( d, i ) { return d.class; } );

		g.append ( 'g' )		//	to clip the items (not the border), and keep the size rect on top
			.attr ( 'id',        function ( d, i ) { return d.eleId + '-items'; } )
			.attr ( 'transform', function ( d, i ) { 
				return 'translate(' + d.items.x + ',' + d.items.y + ')'; 
			} )
			.attr ( 'clip-path', function ( d, i ) { return 'url(#cp-' + d.eleId + ')'; } )
//				.call ( d3.drag()
//					.on ( 'start', dragSclrStarted )
//					.on ( 'drag',  dragSclred )
//					.on ( 'end',   dragSclrEnded ) )
			.on ( 'mousedown', uCD.mousedown )
			.on ( 'mousemove', uCD.mousemove )
			.on ( 'mouseup',   uCD.mouseup )
		//	.on ( 'click',     click )
			.on ( 'click',     uCD.click )
			//	Like a panel's base rect ...
			//	A transparent (possibly white) rect, covers whole tree. Something to catch 
			//	drag (evidently, you can not click on a <g>).  x y maintained so that rect 
			//	continuously covers only the visible part of the list.
			.append ( 'rect' )
				.attr ( 'id',     function ( d, i ) { return d.eleId + '-items-rect'; } )
				.attr ( 'x',      0 )	//	0 + uc.OFFS_4_1_PIX_LINE )
				.attr ( 'y',      0 )	//	0 + uc.OFFS_4_1_PIX_LINE )
				.attr ( 'width',  sizeItemsRectW )
				.attr ( 'height', sizeItemsRectH )
				.attr ( 'class',  function ( d, i ) { return 'u34-tree-rect'; } );

		g.append ( 'rect' )		//	size handle - invisible until mouse is over
			.attr ( 'id',     function ( d, i ) { return d.eleId + '-size'; } )
			.attr ( 'x',      function ( d, i ) { return d.w - uc.SIZE_HANDLE_WIDTH; } )
			.attr ( 'y',      function ( d, i ) { return d.h - uc.SIZE_HANDLE_HEIGHT; } )
			.attr ( 'width',  uc.SIZE_HANDLE_WIDTH )
			.attr ( 'height', uc.SIZE_HANDLE_HEIGHT )
			.attr ( 'class',  'u34-size-handle-transparent' )
			.on ( 'mouseover', uCD.mouseoverSize )
			.on ( 'mouseout',  uCD.mouseleaveSize )
			.on ( 'mousedown', uCD.mousedownSize );

		g.append ( 'rect' )		//	move handle - invisible until mouse is over
			.attr ( 'id',     function ( d, i ) { return d.eleId + '-move'; } )
			.attr ( 'x',      0 )
			.attr ( 'y',      0 )
			.attr ( 'width',  uc.MOVE_HANDLE_WIDTH )
			.attr ( 'height', uc.MOVE_HANDLE_HEIGHT )
			.attr ( 'class',  'u34-move-handle-transparent' )
			.on ( 'mouseover', uCD.mouseoverMove )
			.on ( 'mouseout',  uCD.mouseleaveMove )
			.on ( 'mousedown', uCD.mousedownMove );

	}	//	defineGroup()

	return svc;

})();
