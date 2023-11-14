
//  app/partials/udui/udui-list-b.js

import * as d3 		from 'd3';

import { cmn }		from '../common';
import { uc } 		from './udui-common';
import { uCD } 		from './udui-control-data-a';

export var uList = (function() { 

	'use strict';

	var serviceId = 'uduiListB';

	/* jshint validthis: true */

	var svc: any = {};

	function mouseOverItem ( evt, d ) {
	//	var sW = serviceId + ' mouseOverItem()';
		var ld = this.parentNode.__data__;
		if ( ld.mouseOver )
			return;
		if ( ld.isScrolling )
			return;
		if ( (! ld.itemSelected) || (ld.itemSelected.textid !== d.textId) ) {
			var g = d3.select ( this );
			g.select ( 'rect' )
				.classed ( 'u34-list-item',            false )
				.classed ( 'u34-list-item-mouse-over', true  );
		}
		ld.mouseOver = { g: this, d: d, i: -1, ele: evt.target };
	}	//	mouseOverItem()

	function mouseLeaveItem ( evt, d ) {
	//	var sW = serviceId + ' mouseLeaveItem()';
		var ld = this.parentNode.__data__;
		if ( ! ld.mouseOver ) {
			if ( ld.isScrolling ) 
				ld.wasMouseOver = null;
			return;
		}
		if ( ld.isScrolling ) {
			ld.wasMouseOver = null;
			return;
		}
		var g = d3.select ( this );
		if ( d.ld.itemSelected && (d.ld.itemSelected.textId === d.textId) )
			g.select ( 'rect' )
				.classed ( 'u34-list-item-selected',   true )
				.classed ( 'u34-list-item-mouse-over', false  );
		else
			g.select ( 'rect' )
				.classed ( 'u34-list-item',            true )
				.classed ( 'u34-list-item-mouse-over', false  );
		ld.mouseOver = null;
	}	//	mouseLeaveItem()

	function selectItem ( ld, d ) {
		let g;
		if ( ld.itemSelected ) {
			g = d3.select ( ld.itemSelected.g );
			g.select ( 'rect' )
				.classed ( 'u34-list-item-selected', false )
				.classed ( 'u34-list-item',          true  );
		}
		ld.itemSelected = d;
		if ( ! d ) {
			return; }
		g = d3.select ( d.g );
		g.select ( 'rect' )
			.classed ( 'u34-list-item-selected',   true  )
			.classed ( 'u34-list-item',            false )
			.classed ( 'u34-list-item-mouse-over', false );
	}	//	selectItem()

	function clickItem ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' clickItem()';
		var ld = d.ld, g;
		if ( evt.altKey ) {
			cmn.log ( sW, ' altKey' );
			return; }
		if ( evt.shiftKey && uc.isFunction ( d.shiftClickCB ) ) {
			let otherMenuItems = null;
			d.shiftClickCB ( d, otherMenuItems ); 
			return; }

	//	cmn.log ( sW, '  Item text: ' + d.text );
		if ( ! ld.wasScrolling ) {
			selectItem ( ld, d ); }

		if ( uc.isFunction ( ld.cb ) ) {
//			cmn.log ( sW, 'calling back' );
			ld.cb ( evt, d ); }
	}	//	clickItem()

	//	List Scroll/Pan
	//
	function mouseDown ( evt, d ) {
	//	var sW = serviceId + ' mouseDown()';
	//	cmn.log ( sW, '  panel: ' + d.panelData.name );
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
		var pd = d.panelData;
		var op = uc.mouseOp;
		if ( ! op )
			return;
		//	uCD.mouseDown() should have set up uc.mouseOp
		op.updateXY ( evt.pageX, 
					  evt.pageY );
		var dy = op.y - op.y0;
		if ( (Math.abs ( dy ) < 2) && ! d.isScrolling )
			return;
		if ( ! d.isScrolling ) {
			d.isScrolling = true;
			if ( d.mouseOver ) {
				d.wasMouseOver = d.mouseOver;
				mouseLeaveItem.call ( d.mouseOver.g, d.mouseOver.d, d.mouseOver.i, d.mouseOver.ele );
			}
		}
		var x, y;
		var g = d3.select ( evt.target )
			.attr ( 'transform', function ( d: any, i ) { 
				x = uc.OFFS_4_1_PIX_LINE;
			//	y = d.items.y += op.dy;
				y = d.items.y  = d.scrollingY0 + dy;
				if ( y > 0 )  
					y = d.items.y = uc.OFFS_4_1_PIX_LINE;	
				return 'translate(' + x + ',' + y + ')'; 
			} );
		d3.select ( '#cp-' + d.eleId + '-rect' )
			.attr ( 'y', function ( d, i ) { return -y + uc.OFFS_4_1_PIX_LINE; } );
		g.select ( '#' + d.eleId + '-items-rect' )
			.attr ( 'y', function ( d: any, i ) { return -d.items.y; } );
	}	//	mouseMove()

	function mouseUp ( evt, d ) {
		var sW = serviceId + ' mouseUp()';
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


	//	List Move
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

	//	List Size
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
		let w = d.w - (1 * uc.LIST_BORDER_WIDTH);
		return w >= 1 ? w : 1;
	}	//	sizeItemsRectW()

	function sizeItemsRectH ( d, i ) {
		let h = d.h - (1 * uc.LIST_BORDER_WIDTH);
		return h >= 1 ? h : 1;
	}	//	sizeItemsRectH()

	function sized ( d, i, ele, dx, dy ) {
		var sW = serviceId + ' sized()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   dx y: ' + dx + ' ' + dy );
		d.w += dx;
		d.h += dy;
		var g = d3.select ( ele.parentNode );
		g.select ( '#' + d.eleId + '-rect' )
			.attr ( 'width',  function ( d: any, i ) { return d.w; } )
			.attr ( 'height', function ( d: any, i ) { return d.h; } );
		g.select ( '#' + d.eleId + '-size' )
			.attr ( 'x',      function ( d: any, i ) { 
				return d.w - uc.SIZE_HANDLE_WIDTH;  } )
			.attr ( 'y',      function ( d: any, i ) { 
				return d.h - uc.SIZE_HANDLE_HEIGHT; } );
		d3.select ( '#cp-' + d.eleId + '-rect' )
		//	.attr ( 'width',  function ( d, i ) { return d.w += dx; } )
		//	.attr ( 'height', function ( d, i ) { return d.h += dy; } );
			.attr ( 'width',  d => cpSizeRectW ( d, dx ) )
			.attr ( 'height', d => cpSizeRectH ( d, dy ) );
		g.select ( 'g #' + d.eleId + '-items-rect' )
			.attr ( 'width',  sizeItemsRectW )
			.attr ( 'height', sizeItemsRectH );
		g.select ( '#' + d.eleId + '-items' )
			.selectAll ( 'g' )
				.select ( 'rect' )
					.attr ( 'width', itemRectWidth );
		d.parentPanel.updateSclrs();
	}	//	sized()

	function sized2 ( d, g, dx, dy ) {
	//	let s = g.select ( '#' + d.eleId + '-size' );
	//	let e = s.nodes()[0].parentElement;
		let e = document.getElementById ( d.eleId + '-size' )
		sized ( d, -1, e, dx, dy );
	}	//	sized2()


	function findByItemText ( ld, text ) {
		return ld.itemData.find ( d => d.text === text );
	}	//	findByItemText()

	function findByItemId ( ld, textId ) {
		return ld.itemData.find ( d => d.textId === textId );
	}	//	findByItemId()

	function ListItemData ( textId, text ) {
		var o = (typeof textId === 'object') ? textId : null;
		this.type = uc.TYPE_LISTITEM;
		this.id = 0;
		this.ld = null;					//	the ListData
		this.g  = null;					//	the item's <g> element

		if ( o ) {
			this.textId  = o.textId;
			this.text    = o.text;
			this.data    = o.data;
			this.execute = uc.isString ( o.execute ) ? o.execute : '';
		} else {
			this.textId  = textId;
			this.text    = text;
			this.data    = null;
			this.execute = '';
		}

		this.class = 'u34-list-item';
	}	//	ListItemData()

	svc.createListItemData = function ( textId, text ) {
		return new ListItemData ( textId, text );
	};	//	svc.createListItemData()

	function ListData ( o ) {
		//	Initialize the "base" of this object, ControlData -
		o.type      = uc.TYPE_LIST;
		o.class     = o.class     === undefined ? 'u34-list' : o.class;
		o.hasBorder = o.hasBorder === undefined ? true       : o.hasBorder;
		uCD.callControlData ( this, o );


		//	Initialize the rest of this object -
		this.cb           = uc.isFunction ( o.cb )           ? o.cb           
															 : null;
		this.shiftClickCB = uc.isFunction ( o.shiftClickCB ) ? o.shiftClickCB 
															 : null;
		this.onProperties = uc.isFunction ( o.onProperties ) ? o.onProperties 
															 : null;
		this.ff = uc.isString ( o.ff ) ? o.ff : 'verdana';	//	font family
		let ff = this.ff.toLowerCase();
		if ( ff === 'consolas' ) {
			this.ff = 'courier new'; }
		
		this.fs = uc.isNumber ( o.fs ) ? o.fs : 12;			//	size, pixels
		this.classText = 'u34-list-text';

		this.items = { 						
			x: uc.OFFS_4_1_PIX_LINE, 		//	incremented, decremented as list
			y: uc.OFFS_4_1_PIX_LINE 		//	is scrolled/panned
		};

	//	this.itemHeight = this.fs + 4;
		this.itemHeight = this.fs + 8;		//	2018-Apr-21

		this.itemNextId = 0;
		this.itemData = [];

		this.isMenu      = (o.isMenu === undefined) ? false : o.isMenu;
		this.subMenuData = null;

		//	scrolling support
		this.isScrolling  = false;
		this.wasScrolling = false;
		this.scrollingY0  = 0;
		this.mouseOver    = null;			//	a { g, d, i, ele } of the list item the mouse is over
		this.wasMouseOver = null;			//	set to mouseOver on mouseDown

		this.itemSelected = null;			//	a ListItemData

		//	Override some "base" properties -
		this.onMouseDown = mouseDown;
		this.onMouseMove = mouseMove;
		this.onMouseUp   = mouseUp;
		this.onSize  = sized;
		this.onSize2 = sized2;
		this.onMove  = moved;

		this.execute  = uc.isString ( o.execute )  ? o.execute  : '';
		this.onselect = uc.isObject ( o.onselect ) ? o.onselect : null;

	}	//	ListData()

//	ListData.prototype = uCD.newControlData();
//	ListData.prototype.constructor = ListData;
//	See createListData()

	function ListData_listProperties() {
		var sW = serviceId + ' ListData.prototype.listProperties()';
		var value, displayName, props = uCD.listProperties ( this );
		var whiteList = [ 'ff', 'fs' ];
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
			}
			cmn.log ( sW, '   key: ' + key + '  value: ' + value );
			props.push ( { property: key, value: value, displayName: displayName } );
		}
		return props;
	}	//	ListData.prototype.listProperties()

//	ListData.prototype.setProperty = function ( name, value ) {
	function ListData_setProperty ( name, value ) {
		var sW = serviceId + ' ListData.prototype.setProperty()';
		//	handle x, y, w, h, name properties in the "base class" ControlData
		var n, g, rtn;
		rtn = uCD.setProperty ( this, name, value );
		if ( rtn )
			return rtn;
		if ( name === 'ff' ) {
			this[name] = value;
			this.updateStyle();
		}
		if ( name === 'fs' ) {
			n = Number ( value );
			if ( n !== n ) 					//	Good Grief!  ... testing for NaN ...	got'a love JS 
				return;
			this[name] = n;
			this.updateStyle();
		}
	}	//	ListData.prototype.setProperty()

	function ListData_clear() {
		this.itemData = [];
		this.update();
	}	//	ListData.prototype.clear()

//	ListData.prototype.updateStyle = function() {
	function ListData_updateStyle() {
		var sW = serviceId + ' ListData.updateStyle()';
		var ld = this;
		if ( ld.isMenu ) {
			return; }
		var lg = d3.select ( '#' + ld.eleId + '-items' );	//	the list items g
		var	is = lg.selectAll ( 'g' );
		is.each ( ( d: any ) => {
			d3.select ( d.g ).select ( 'text' )
				.attr ( 'style',   'font-family: ' + ld.ff 
								 + '; font-size: ' + ld.fs + 'px;' );
		} );
	}	//	ListData.prototype.updateStyle()

//	ListData.prototype.update = function() {
	function ListData_update() {
		var sW = serviceId + ' ListData.update()';
		var ld = this;
		var lg = d3.select ( '#' + ld.eleId + '-items' );		//	the list items g
		var	is = lg.selectAll ( 'g' ) 							//	g for each item ...
			.data ( ld.itemData, function ( d: any ) {
				return d.id || (d.id = ++ld.itemNextId);
			} );

		var ig = is.enter()										//	... add new item g 
			.append ( 'g' )
			.each ( function ( d: any ) { d.ld = ld; } )
			.attr ( 'id',     function ( d: any, i ) { 
				var eleId = ld.eleId + '-rect-item-' + i;
//				cmn.log ( sW, ' - appending list item - eleId: ' + eleId );
				d.g = this;
				return eleId; 
			} )
			.attr ( 'transform', function ( d, i ) { 
				return 'translate(' + 0 + ',' + i * ld.itemHeight + ')'; 
			} )
			.on ( 'mouseover', mouseOverItem )
			.on ( 'mouseout',  mouseLeaveItem )
			.on ( 'click',    clickItem );


		ig.append ( 'rect')										//	a rect in the item g
		//	.attr ( 'id', ... )									//	no id
			.attr ( 'x',      function ( d, i ) { return 0; } )
			.attr ( 'y',      function ( d, i ) { return 0; } )
			.attr ( 'width',  itemRectWidth )
			.attr ( 'height', ld.itemHeight )
			.attr ( 'class',  function ( d: any, i ) { return d.class; } );

		if ( ld.isMenu ) {
			ig.append ( 'foreignObject' )
			//	.attr ( 'id', function ( d, i ) { return d.eleId + '-text'; } )		no id?
				.attr ( 'x', 0 )
			//	.attr ( 'y', 0 )
				.attr ( 'y', ((ld.itemHeight - ld.fs) / 2) - 1 )		//	2018-Apr-21
			//	.attr ( 'width',  1 )	//	function ( d, i ) { return d.w; } )
			//	.attr ( 'height', 1 ) 	//	function ( d, i ) { return d.h; } )
				.attr ( 'width',  ld.w          + 'px' )
				.attr ( 'height', ld.itemHeight + 'px' )
				.append ( 'xhtml:body' )
				.style ( 'font', '12px "courier new"' )
			//	.html ( menuItemHTML )
				.html ( uc.textHTML )
				.on ( 'click',    clickItem );
		} else {
			ig.append ( 'text' )
			//	.attr ( 'id', ... )													no id?
				.attr ( 'text-anchor', function ( d, i ) { return 'start'; } )
				.attr ( 'x',           function ( d, i ) { return 2; } )
				.attr ( 'y',           function ( d, i ) { 
					var h = ld.itemHeight;
					return h - ((h - ld.fs) / 2) - 1;		//	why - 1 ?  I don't know.  But it looks better.
				} )
			//	.attr ( 'style', function ( d, i ) { return 'font-family: ' + ld.ff + '; font-size: ' + ld.fs + 'px;'; } )
				.attr ( 'style',   'font-family: ' + ld.ff 
								 + '; font-size: ' + ld.fs + 'px;' )
				.attr ( 'class', 'u34-list-item-text' )
				.text ( function ( d: any, i ) { return d.text; } );
			//	.on ( 'click',    clickItem );
			//	Is not clickITem set in is.enter() above?
		}

		if ( ! ld.isMenu ) {
		//	is.each()					//	update
		//		.attr ( 'style',   'font-family: ' + ld.ff 
		//						 + '; font-size: ' + ld.fs + 'px;' ); 
		//	That does not work.
			//	Possibly something like what ListData_updateStyle()
			//	does?
			//	And/Or is this even necessary here?
		}



		is.exit()						//	... delete old item g
			.remove();

		if ( ld.isMenu ) {			//	set list height?
			ld.h = (ld.itemHeight * ld.itemData.length) + 1;
		//	d3.select ( '#cp-' + ld.eleId + '-rect' )
		//		.attr ( 'height', function ( d, i ) { 
		//			return d.h - 1; 
		//		} );
			//	2017-Jun-04
			uc.panelSvc.adjustClipPath ( ld );
			d3.select ( 'g #' + ld.eleId + '-items-rect' )
				.attr ( 'height', sizeItemsRectH );
			d3.select ( '#' + ld.eleId  + '-rect' )
				.attr ( 'height', function ( d: any, i ) { 
					return d.h; } );
			d3.select ( '#' + ld.eleId  + '-size' )
				.attr ( 'y',      function ( d: any, i ) { 
					return d.h - uc.SIZE_HANDLE_HEIGHT; } );
		}

	}	//	ListData.prototype.update()

	
//	ListData.prototype.selectItem= function() {
	function ListData_selectItem ( item ) {
		var sW = serviceId + ' ListData.selectItem()';
		if ( ! item ) {
			selectItem ( this, null );
			return; }

		let d = null;
		if ( uc.isString ( item ) ) {
			d = findByItemText ( this, item ); }
		if ( uc.isNumber ( item ) ) {
			d = findByItemId ( this, item ); }
		if ( uc.isObject ( item ) ) {
			d = item; }
		
		if ( uc.isObject ( d ) ) {
			selectItem ( this, d );
			return d; }

		cmn.error ( sW, 'item not found' ); 
		return null;
	}	//	ListData.prototype.selectItem()
	
	/*	Just use udui-tree-a.ts.

	function ListData_scrollIntoView ( d ) {
		const sW = serviceId + ' ListData.prototype.scrollIntoView()';
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
	}	//	ListData.prototype.scrollIntoView()
	*/

	svc.createListData = function ( o ) {

	//	if ( ListData.prototype.constructor.name === 'ListData' ) {
	//		//	Do this once, here to avoid cir ref issue
			ListData.prototype = uCD.newControlData();
			ListData.prototype.constructor = ListData;
			ListData.prototype.listProperties = ListData_listProperties;
			ListData.prototype.setProperty = ListData_setProperty;
			ListData.prototype.clear = ListData_clear;
			ListData.prototype.updateStyle = ListData_updateStyle;
			ListData.prototype.update = ListData_update;
			ListData.prototype.selectItem = ListData_selectItem;
	//		ListData.prototype.scrollIntoView	= ListData_scrollIntoView;
	//	}

		return new ListData ( o );
	};	//	svc.createListData()


	function List ( data ) {
		this.data = data;
	}

	function itemRectWidth ( d ) {
//		return d.ld.w - 1 + uc.OFFS_4_1_PIX_LINE;
		return d.ld.w - 1;
	}	//	itemRectWidth()


//	function menuItemHTML ( d, i ) {
//		var ld   = d.ld,
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
//		+		'class="u34-list-item-text" '
//		+		'style="width: ' + (ld.w - 2) + 'px; font-family: ' + ld.ff + '; font-size: ' + ld.fs + 'px;">'
//		+		textHTML
//		+		iconHTML
//		+	'</div>';
//
//		return html;					
//	}	//	menuItemHTML()
//	menuItemHTML() is now implemented as textHTML() in udui-common.js.

	List.prototype.update = function() {
		this.data.update();
	};	//	List.prototype.update()

	List.prototype.addSubMenu = function ( subMenuData ) {
		var menu = this, subMenu = null;

		subMenuData.parentMenu = menu;						//	submenu's ref to parent
		subMenuData.eleId      = menu.data.eleId + '-' + subMenuData.name;

		menu.data.parentPanel.addClipPath ( subMenuData );

		menu.data.subMenuData = subMenuData;				//	parent's ref to submenu

		subMenu = subMenuData.list = new List ( subMenuData );

		var grp = d3.select ( '#' + menu.data.eleId )
			.append ( 'g' )
			.data ( [subMenuData] );

		defineGroup ( grp );

		return subMenu;

	};	//	List.prototype.addSubMenu()

	svc.defineList = function ( panel ) {
		var sW = serviceId + ' defineList()';
		var newList = null;

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
				newList = d.list = new List ( d );
			} )
			.append ( 'g' );

		defineGroup ( grp );

		newList.update();

		return newList;
	};	//	svc.defineList()

	function defineGroup ( g ) {
		g
			.attr ( 'id',        function ( d, i ) { return d.eleId; } )
			//	group has no x, y - must transform -
			.attr ( 'transform', function ( d, i ) { return 'translate(' + d.x + ',' + d.y + ')'; } );

		g.append ( 'rect' )
			.attr ( 'id',     function ( d, i ) { return d.eleId + '-rect'; } )
			.attr ( 'width',  function ( d, i ) { return d.w; } )
			.attr ( 'height', function ( d, i ) { return d.h; } )
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
			.on ( 'click',     click )
			//	Like a panel's base rect ...
			//	A transparent (possibly white) rect, covers whole list. Something to catch 
			//	drag (evidently, you can not click on a <g>).  x y maintained so that rect 
			//	continuously covers only the visible part of the list.
			.append ( 'rect' )
				.attr ( 'id',     function ( d, i ) { return d.eleId + '-items-rect'; } )
				.attr ( 'x',      0 )	//	0 + uc.OFFS_4_1_PIX_LINE )
				.attr ( 'y',      0 )	//	0 + uc.OFFS_4_1_PIX_LINE )
				.attr ( 'width',  sizeItemsRectW )
				.attr ( 'height', sizeItemsRectH )
				.attr ( 'class',  function ( d, i ) { return 'u34-list-rect'; } );

		g.append ( 'rect' )				//	size handle - invisible until mouse is over
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
