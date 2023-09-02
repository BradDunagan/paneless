
//  app/partials/udui/udui-graph-a.js

//	For this a version -
//
//		Using ControlData to help with the mouse work.

import * as d3 		from 'd3';

import { cmn }		from '../common';
import { uc } 		from './udui-common';
import { uCD } 		from './udui-control-data-a';

export var uGraph = (function() { 

	'use strict';

	var serviceId = 'uduiGraphA';

	/* jshint validthis: true */

	var svc: any = {};

	let self = this;

	function mouseOver ( evt, d ) {
	//	cmn.log ( serviceId + ' mouseOver()' );
		if ( ! d.hasBorder )
			d3.select ( '#' + d.eleId + '-rect' )
				.classed ( 'u34-graph', 				false )
				.classed ( 'u34-graph-mouse-over',      true  );
	}	//	mouseOver()

	function mouseLeave ( evt, d ) {
	//	cmn.log ( serviceId + ' mouseLeave()' );
		if ( ! d.hasBorder )
			d3.select ( '#' + d.eleId + '-rect' )
				.classed ( 'u34-graph', 				true )
				.classed ( 'u34-graph-mouse-over',      false  );
	}	//	mouseLeave()

	function mouseDown ( evt: PointerEvent, d ) {
		var sW = serviceId + ' mouseDown()';
		cmn.log ( sW );
		evt.stopPropagation();
	}	//	mouseDown()

	function mouseMove ( evt, d ) {
		var sW = serviceId + ' mouseMove()';

		let op = uc.mouseOp;
		let uc2 = uc;

		if ( ! op )
			return;

		uc.mouseOp.updateXY ( evt.pageX, 
							  evt.pageY );

		var dx = uc.mouseOp.x - uc.mouseOp.x0;
		var dy = uc.mouseOp.y - uc.mouseOp.y0;
		if ( (Math.abs ( dx ) >= 2) || (Math.abs ( dy ) >= 2) ) {
			if (  d.panningEnabled ) {
				if ( ! uc.mouseOp.scrolling ) {
					d.panX0 = d.panX;
					d.panY0 = d.panY; }

				uc.mouseOp.scrolling = true;

				d.clickDisabled = true; 

				d.checkPan ( dx, dy );
				
				let panX = d.panX / d.scale;
				let panY = d.panY / d.scale;
				d3.select ( '#' + d.eleId + '-grf-main' )
					.attr ( "transform",  ( d: any ) => {
						let st =   "scale(" + d.scale + ") "
								 + "translate(" + panX + "," + panY + ")";
					//	cmn.log ( 'zoom transform: ' + st );
						return st; } );

				d.updateSclrs();
			}
		}
		evt.stopPropagation();
	//	cmn.log ( sW );
	}	//	mouseMove()

	function mouseUp ( evt, d ) {
		var sW = serviceId + ' mouseUp()';
	//	var x, y, newPanelData, newPanel, pd = d.type === uc.TYPE_PANEL_BASE ? d.panelData : d;
		cmn.log ( sW, '  graph: ' + d.name );
		evt.stopPropagation();
		var mouseOp = uc.mouseOp;		
					  uc.mouseOp = null;

		if ( mouseOp && mouseOp.scrolling ) {
			mouseOp.scrolling = false;
			return; }

	}	//	mouseUp()

	function vscrolled ( d, i, ele, dx, dy ) {
		var sW = serviceId + ' vscrolled()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   dx y: ' + dx + ' ' + dy );
		
		//	Same as panning.  Sort of.  See mouseMove().
		//
		d.panX0 = d.panX;
		d.panY0 = d.panY;

		d.checkPan ( dx, -dy );
		
		let panX = d.panX / d.scale;
		let panY = d.panY / d.scale;
		d3.select ( '#' + d.eleId + '-grf-main' )
			.attr ( "transform",  ( d: any ) => {
				let st =   "scale(" + d.scale + ") "
						 + "translate(" + panX + "," + panY + ")";
			//	cmn.log ( 'zoom transform: ' + st );
				return st; } );

		d.updateSclrs();

	}	//	vscrolled()

	
	function click ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' click()';
		cmn.log ( sW, ' clickDisabled: ' + d.clickDisabled );
		evt.stopPropagation();
		if ( evt.shiftKey && uc.isFunction ( d.shiftClickCB ) ) {
			let otherMenuItems = null;
			if ( 	cmn.isObject ( d.dsrc )
				 && cmn.isObject ( d.dsrc.code )
				 && cmn.isFunction ( d.dsrc.code.shiftClickMenu ) ) {
				otherMenuItems = d.dsrc.code.shiftClickMenu(); }

			d.shiftClickCB ( evt, d, otherMenuItems );
			return;
		}
		
		let bCallbackMade = false;

		if ( uc.isFunction ( d.cb ) ) {
			cmn.log ( sW, ' d.name: ' + d.name + '  callback ...' );
//			d.cb ( d,  i, ele ); }
			d.cb ( evt, d ); }
	//		bCallbackMade = true; }

		if ( d.clickDisabled ) {
			d.clickDisabled = false;
			return; }

		if ( 	(! bCallbackMade)
			 && d.dsrc && uc.isFunction ( d.dsrc.grfClick) ) {
//			d.dsrc.grfClick ( d,  i, ele ); }
			d.dsrc.grfClick ( d, -1, evt.target ); }

	}	//	click()

	function moved ( d, i, ele, x, y ) {
		var sW = serviceId + ' moved()';
		cmn.log ( sW, ' d.name: ' + d.name + '   x y: ' + x + ' ' + y );
		d3.select ( ele.parentNode )
			.attr ( 'transform', function ( d: any, i ) { 
				return 'translate(' + (d.x = x) + ',' + (d.y = y) + ')'; 
			} );
		d.updateSclrs();
		d.parentPanel.updateSclrs();
	}	//	moved()

	function sized2 ( d, g, dx, dy ) {
		const sW = serviceId + ' sized()';
		let pandx = 0, pandy = 0; 
		d.w += dx;
		if ( d.panX < d.w - (d.ex * d.scale) ) {
			pandx = dx; }
		d.h += dy;
		if ( d.panY < d.h - (d.ey * d.scale) ) {
			pandy = dy; }
		g.select ( '#' + d.eleId + '-rect' )
			.attr ( 'width',  d => d.w )
			.attr ( 'height', d => d.h );
		g.select ( '#' + d.eleId + '-size' )
			.attr ( 'x',      d => d.w - uc.SIZE_HANDLE_WIDTH )
			.attr ( 'y',      d => d.h - uc.SIZE_HANDLE_HEIGHT );
		d3.select ( '#cp-' + d.eleId + '-rect' )
			.attr ( 'x',      0.5 )
			.attr ( 'y',	  0.5 )
			.attr ( 'width',  ( d: any ) => d.w += dx )
			.attr ( 'height', ( d: any ) => d.h += dy );
		if ( pandx || pandy ) {
	//		cmn.log ( sW, '  pandx ' + pandx + '   pandy ' + pandy );
			d.panX0 = d.panX;
			d.panY0 = d.panY;
		//	this.pan ( pandx, pandy, () => {
			   d.pan ( pandx, pandy, () => {
				d.updateSclrs();
				d.parentPanel.updateSclrs(); } ); }
		else {
			d.updateSclrs();
			d.parentPanel.updateSclrs(); }
	}	//	sized2()

	function sized ( d, i, ele, dx, dy ) {
		var sW = serviceId + ' sized()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   dx y: ' + dx + ' ' + dy );
		var g = d3.select ( ele.parentNode );
		sized2 ( d, g, dx, dy );
	}	//	sized()



	function Graph ( data ) {
		this.data = data;
	}

	Graph.prototype.updateProperties = function() {
		var d = this.data;
	};	//	updateProperties()


	function GraphData ( o ) {

		//	Initialize the "base" of this object, ControlData -
		o.type      = uc.TYPE_GRAPH;
		o.hasBorder = uc.isBoolean ( o.hasBorder ) ? o.hasBorder : true;
		o.class     = uc.isString ( o.class ) 
						? o.class 
						: o.hasBorder ? 'u34-graph-with-border' : 'u34-graph';
		uCD.callControlData ( this, o );

		//	Initialize the rest of this object -
		this.cb           = uc.isFunction ( o.cb )           ? o.cb           
															 : null;
		this.shiftClickCB = uc.isFunction ( o.shiftClickCB ) ? o.shiftClickCB 
															 : null;
		this.onProperties = uc.isFunction ( o.onProperties ) ? o.onProperties
															 : null;

		this.dsrc = uc.isObject ( o.dsrc ) ? o.dsrc : null;

		this.bHorzSB = uc.isBoolean ( o.bHorzSB ) ? o.bHorzSB : true;
		this.bVertSB = uc.isBoolean ( o.bVertSB ) ? o.bVertSB : true;

		this.scale = 1;
		this.panningEnabled = true;
		this.panX0 = 0;
		this.panX  = 0;
		this.panY0 = 0;
		this.panY  = 0;
		this.ex	   = 0;		//	extent (width) of contents
		this.ey    = 0;		//	extent (height) of contents

		this.clickDisabled	= false;

		//	Override some "base" properties -
		this.onSize  = sized;
		this.onSize2 = sized2;
		this.onMove  = moved;
		this.onMouseOver  = mouseOver;
		this.onMouseLeave = mouseLeave;
		this.onMouseDown  = mouseDown;
		this.onMouseMove  = mouseMove;
		this.onMouseUp    = mouseUp;
		this.onVScroll	  = vscrolled;

	}	//	GraphData()

	function GraphData_listProperties() {
		var sW = serviceId + ' GraphData.prototype.listProperties()';
	//	var whiteList = [ 'x', 'y', 'w', 'h', 'name', 'hasBorder' ];
		var whiteList = [                             'hasBorder' ];
		var value, displayName, props = uCD.listProperties ( this );
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
				case 'hasBorder': 	displayName = 'has border';		break;
			}
			cmn.log ( sW, '   key: ' + key + '  value: ' + value );
			props.push ( { property: key, value: value, displayName: displayName } );
		}
		return props;
	};	//	GraphData.prototype.listProperties()

	function GraphData_setProperty ( name, value ) {
		var sW = serviceId + ' GraphData.prototype.setProperty()';
		//	handle x, y, w, h, name properties in the "base class" ControlData
		var n, g, rtn;
		rtn = uCD.setProperty ( this, name, value );
		if ( rtn )
			return rtn;
		if ( name === 'hasBorder' ) {
			n = Number ( value );
			if ( n !== n ) {				//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
				if ( typeof value === 'string' )
					value = (value === 'true');
				else
					value = false;
			} else
				value = (n !== 0);
			this[name] = !! value;
			this.class = this[name] ? 'u34-graph-with-border' : 'u34-graph';
			d3.select ( '#' + this.eleId + '-rect' )
				.attr ( 'class',  function ( d: any, i ) { return d.class; } );
		}
	};	//	GraphData.prototype.setProperty()

	function GraphData_isPanNecessary ( box ) {
		let d = this;
		let vsw = d.vScrollVisible ? uc.VERT_GEN_SCROLL_WIDTH  : 0;
		let hsh = d.hScrollVisible ? uc.HORZ_GEN_SCROLL_HEIGHT : 0;
		//	Pan to make the box visible?
		box.x *= d.scale;
		box.y *= d.scale;
		box.w *= d.scale;
		box.h *= d.scale;
		box.dx = 0;		//	how much to pan
		box.dy = 0;
	
		d.panX0 = d.panX;
		d.panY0 = d.panY;

		let margin = 10;
		let xBndL = margin - this.panX;				//	x boundary left
		let xBndR = xBndL + this.w - (2 * margin);	//	and right
		if ( box.x < xBndL ) {
			box.dx = xBndL - box.x; }
		if ( box.x > xBndR - vsw - box.w ) {
			if ( box.w > xBndR - xBndL ) {
				box.dx = xBndL - box.x; }
			else {
				box.dx = xBndR - box.x - vsw - box.w; } }
		//	Check panX and extent.
		if ( box.dx === 0 ) {
			let ex = d.ex * d.scale;
			if ( (d.panX < 0) && (ex < d.w - vsw) ) {
				box.dx = -d.panX; }
			else {
				if ( d.panX < d.w - vsw - ex ) {
					box.dx = ex - d.w - vsw; } } }

		let yBndT = margin - this.panY;				//	y boundary top
		let yBndB = yBndT + this.h - (2 * margin);	//	and bottom
		if ( box.y < yBndT ) {
			box.dy = yBndT - box.y; }
		if ( box.y > yBndB - hsh - box.h ) {
			if ( box.h > yBndB - yBndT ) {
				box.dy = yBndT - box.y; }
			else {
				box.dy = yBndB - box.y - hsh - box.h; } }
		//	Check panY and extent.
		if ( box.dy === 0 ) {
			let ey = d.ey * d.scale;
			if ( (d.panY < 0) && (ey < d.h - hsh) ) {
				box.dy = -d.panY; }
			else {
				if ( d.panY < d.h - hsh - ey ) {
					box.dy = ey - d.h - hsh; } } }

		return (box.dx !== 0) || (box.dy !== 0);
	}	//	GraphData.prototype.isPanNecessary()

	function GraphData_checkPan ( dx, dy ) {
		const sW = serviceId + ' checkPan()'; 
		let d = this;
		let ex = d.ex * d.scale;
		let ey = d.ey * d.scale;
		let vsw = d.vScrollVisible ? uc.VERT_GEN_SCROLL_WIDTH  : 0;
		let hsh = d.hScrollVisible ? uc.HORZ_GEN_SCROLL_HEIGHT : 0;
		if ( ex <= d.w - vsw ) {
			d.panX = 0; }
		else {
			let x = d.panX0 + dx;
			if ( (x <= 0) && (x >= d.w - vsw - ex) ) {
				d.panX = x; }
			else {
				if ( x > 0 ) {
					d.panX = 0; }
				else {
					if ( x < d.w - vsw - ex ) {
						d.panX = d.w - vsw - ex; } } } }
		if ( ey <= d.h - hsh ) {
	//		cmn.log ( sW, 'd.panY = 0;' );
			d.panY = 0; }
		else {
			let y = d.panY0 + dy;
			if ( (y <= 0) && (y >= d.h - hsh - ey) ) {
	//			cmn.log ( sW, 'd.panY0 ' + d.panY0 + '  d.panY = y; ' + y );
				d.panY = y; }
			else {
				if ( y > 0 ) {
	//				cmn.log ( sW, 'd.panY0 ' + d.panY0 + '  d.panY = 0;' );
					d.panY = 0; } 
				else {
					if ( y < d.h - hsh - ey ) {
	//					cmn.log ( sW, 'd.panY0 ' + d.panY0 + '  d.panY = d.h - hsh -ey;' );
						d.panY = d.h - hsh - ey; } } } }
	}	//	GraphData.prototype.checkPan()

	function GraphData_pan ( dx, dy, onTransitionEnd, onTransitionInterrupt ) {
		const sW = serviceId + ' pan()';
		let d = this;
	//	cmn.log ( sW, 'dx y ' + dx + ' ' + dy );
		this.checkPan ( dx, dy );
		let panX = d.panX / d.scale;
		let panY = d.panY / d.scale;
		d3.select ( '#' + d.eleId + '-grf-main' )
			.transition()
			.duration ( 200 )
			.attr ( "transform",  ( d: any ) => {
				let st =   "scale(" + d.scale + ") "
						 + "translate(" + panX + "," + panY + ")";
				return st; } )
			.on ( 'end', onTransitionEnd )
			.on ( 'interrupt', onTransitionInterrupt );
	}	//	GraphData.prototype.pan()

	function GraphData_updateSclrs() {
		const sW = serviceId + ' updateSclrs()';
		let d = this;
		let ex = d.ex * d.scale;
		let ey = d.ey * d.scale;
		let vsw = d.vScrollVisible ? uc.VERT_GEN_SCROLL_WIDTH  : 0;
		let hsh = d.hScrollVisible ? uc.HORZ_GEN_SCROLL_HEIGHT : 0;
	//	cmn.log ( sW, 'panX Y ' + d.panX + ' ' + d.panY 
	//			  	+ '   w ' + d.w + '   vsw ' + vsw + '   ex ' + ex );
		if ( (d.panX < 0) && (d.panX < d.w - vsw - ex) ) {
		//	cmn.error ( sW, 'd.panX < d.w - vsw - ex' ); 
			//	A pan() may be forthcoming, and then, another updateSclrs().
			cmn.log ( sW, 'd.panX < d.w - vsw - ex  returning' ); 
			return; }
		if ( (d.panY < 0) && (d.panY < d.h - hsh - ey) ) {
		//	cmn.error ( sW, 'd.panY < d.h - hsh - ey' );
			//	A pan() may be forthcoming, and then, another updateSclrs().
			cmn.log ( sW, 'd.panY < d.h - hsh - ey  returning' );
			return; }
		let panX = d.panX;	//	/ d.scale;
		let panY = d.panY;	//	/ d.scale;
		let vsv = d.vScrollVisible;
		let hsv = d.hScrollVisible;
		d.updateSclrs2 ( { x: panX, ex: vsw + ex,
						   y: panY, ey: hsh + ey } ); 
		let dx = (vsv && ! d.vScrollVisible) ? vsw : 0;
		let dy = (hsv && ! d.hScrollVisible) ? hsh : 0;
		if ( dx || dy ) {
		//	this.pan ( dx, dy, null ); }
			   d.pan ( dx, dy, null ); }
	};	//	GraphData.prototype.updateSclrs()

	svc.createGraphData = function ( o ) {

	//	if ( GraphData.prototype.constructor.name === 'GraphData' ) {
	//		//	Do this once, here to avoid cir ref issue
			GraphData.prototype = uCD.newControlData();
			GraphData.prototype.constructor = GraphData;
			GraphData.prototype.listProperties = GraphData_listProperties;
			GraphData.prototype.setProperty = GraphData_setProperty;
			GraphData.prototype.isPanNecessary = GraphData_isPanNecessary;
			GraphData.prototype.checkPan = GraphData_checkPan;
			GraphData.prototype.pan = GraphData_pan;
			GraphData.prototype.updateSclrs = GraphData_updateSclrs;
	//	}

		return new GraphData ( o );
	};	//	svc.createGraphData()

	var nextId = 0;

	svc.defineGraph = function ( panel ) {
		var sW = serviceId + ' defineGraph()';
		var graphData = null, newGraph = null;

		var s = panel.data.base.selectAll ( '#' + panel.data.eleId + '-base' + ' > g' );
//		cmn.log ( sW, '  s length: ' + s._groups[0].length );

		var ctrlEles = s
			.data ( panel.data.childData.data, function ( d ) { 
					return d.id || (d.id = ++panel.data.childData.nextId); 
			} )
			.enter()
			.each ( function ( d ) { 
//				cmn.log ( sW, ' - g - new data: ' + d.name );
				graphData = d;

				newGraph = new Graph ( graphData );
			} )
			.append ( 'g' )
			.attr ( 'id',        function ( d, i ) { return d.eleId; } )
			//	group has no x, y - must transform -
			.attr ( 'transform', function ( d, i ) { 
				return 'translate(' + d.x + ',' + d.y + ')'; } );

		ctrlEles
			.on ( 'mouseover', uCD.mouseover )
			.on ( 'mouseout',  uCD.mouseleave )
			.on ( 'click',     click );

		//	Note that mouse events might not be triggered on this rect if 
		//	those events are not filtered from d3 zoom.  See udui-dsrc-graph-a.
		var rect = ctrlEles.append ( 'rect' )
			.attr ( 'id',     function ( d, i ) { return d.eleId + '-rect'; } )
			.attr ( 'width',  function ( d, i ) { return d.w; } )
			.attr ( 'height', function ( d, i ) { return d.h; } )
			.attr ( 'class',  function ( d, i ) { return d.class; } )
			.on ( 'mousedown', uCD.mousedown )
			.on ( 'mousemove', uCD.mousemove )
			.on ( 'mouseup',   uCD.mouseup );

		if ( graphData.dsrc && uc.isFunction ( graphData.dsrc.createGraph ) ) {
			graphData.dsrc.createGraph ( ctrlEles, graphData ) }

		ctrlEles.append ( 'rect' )		//	size handle - invisible until mouse is over
			.attr ( 'id',     function ( d, i ) { return d.eleId + '-size'; } )
			.attr ( 'x',      function ( d, i ) { return d.w - uc.SIZE_HANDLE_WIDTH; } )
			.attr ( 'y',      function ( d, i ) { return d.h - uc.SIZE_HANDLE_HEIGHT; } )
			.attr ( 'width',  function ( d, i ) { return uc.SIZE_HANDLE_WIDTH; } )
			.attr ( 'height', function ( d, i ) { return uc.SIZE_HANDLE_HEIGHT; } )
			.attr ( 'class',  function ( d, i ) { return 'u34-size-handle-transparent'; } )
			.on ( 'mouseover', uCD.mouseoverSize )
			.on ( 'mouseout',  uCD.mouseleaveSize )
			.on ( 'mousedown', uCD.mousedownSize );

		ctrlEles.append ( 'rect' )		//	move handle - invisible until mouse is over
			.attr ( 'id',     function ( d, i ) { return d.eleId + '-move'; } )
			.attr ( 'x',      0 )
			.attr ( 'y',      0 )
			.attr ( 'width',  uc.MOVE_HANDLE_WIDTH )
			.attr ( 'height', uc.MOVE_HANDLE_HEIGHT )
			.attr ( 'class',  'u34-move-handle-transparent' )
			.on ( 'mouseover', uCD.mouseoverMove )
			.on ( 'mouseout',  uCD.mouseleaveMove )
			.on ( 'mousedown', uCD.mousedownMove );

		uCD.defineScrollers ( ctrlEles );	//	Based on that in udui-tree-a.js.
	//	uCD.overrideNoEdit ( 

		return newGraph;
	};	//	svc.defineGraph()

	svc.measureText = function ( panel, fontFamily, fontSize, text ) {
	//	var sW = serviceId + ' measureText()';
		var ts = panel.data.base.append ( 'text' )
			.attr ( 'fill',        'transparent' )
			.attr ( 'stroke',      'transparent' )
			.attr ( 'font-family', fontFamily )
			.attr ( 'font-size',   fontSize )
			.text ( text );
		var bb = ts._groups[0][0].getBBox();
		var wh = { w: bb.width, h: bb.height };
		ts.remove();
		return wh;
	};	//	svc.measureText()

	return svc;

})();
