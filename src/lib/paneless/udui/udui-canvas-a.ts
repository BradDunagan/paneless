
//  app/partials/udui/udui-canvas-a.js

import * as d3 		from 'd3';

import { cmn }		from '../common';
import { uc } 		from './udui-common';
import { uCD } 		from './udui-control-data-a';


export var uCanvas = (function() { 

	'use strict';

	var serviceId = 'uduiCanvasA';

	/* jshint validthis: true */

	var svc: any = {};


	function mouseOver ( d, i, ele ) {
	//	cmn.log ( serviceId + ' mouseOver()' );
		if ( ! d.hasBorder ) {
			let clses  = 'u34-canvas-foreignobject';
				clses += ' u34-canvas-foreignobject-with-border'; 
			d3.select ( '#' + d.eleId )
				.select ( 'foreignObject' )
					.attr ( 'class', clses ); }
	}	//	mouseOver()

	function mouseLeave ( d, i, ele ) {
	//	cmn.log ( serviceId + ' mouseLeave()' );
		if ( ! d.hasBorder ) {
			let clses  = 'u34-canvas-foreignobject';
			d3.select ( '#' + d.eleId )
				.select ( 'foreignObject' )
					.attr ( 'class', clses ); }
	}	//	mouseLeave()

	function mousedown ( evt: PointerEvent, d: any ) {
//		var sW = serviceId + ' mousedown()';
//		cmn.log ( sW, 'Name: ' + d.name + '  event.altKey: ' + event.altKey );
		evt.stopPropagation();
	}	//	mousedown()

	function mousemove ( evt: PointerEvent, d: any ) {
//		var sW = serviceId + ' mousemove()';
//		cmn.log ( sW, 'Name: ' + d.name + '  event.altKey: ' + event.altKey );
		evt.stopPropagation();
	}	//	mousemove()

	function mouseup ( evt: PointerEvent, d: any ) {
//		var sW = serviceId + ' mouseup()';
//		cmn.log ( sW, 'Name: ' + d.name + '  event.altKey: ' + event.altKey );
		evt.stopPropagation();
	}	//	mouseup()

	function click ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' click()';
//		cmn.log ( sW, 'Name: ' + d.name + '  event.altKey: ' + event.altKey );
		evt.stopPropagation();
		if ( evt.shiftKey && uc.isFunction ( d.shiftClickCB ) ) {
			let otherMenuItems = null;
			d.shiftClickCB ( evt, d, otherMenuItems ); 
			return; }
	}	//	click()

	//	Canvas Move
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

	//	Canvas Size
	//
	function sized2 ( d, g, dx, dy ) {
		var sW = serviceId + ' sized2()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   dx y: ' + dx + ' ' + dy );
		d.w += dx;
		d.h += dy;

		g.select ( 'foreignObject' )
			.attr ( 'width',  d =>  d.w )
			.attr ( 'height', d =>  d.h );

		d.setStyle();

		g.select ( '#' + d.eleId + '-size' )
		//	.attr ( 'x',      function ( d, i ) { return d.w - uc.SIZE_HANDLE_WIDTH;  } )
		//	.attr ( 'y',      function ( d, i ) { return d.h - uc.SIZE_HANDLE_HEIGHT; } );
			.attr ( 'x',      sizeX )
			.attr ( 'y',      sizeY );
		d3.select ( '#cp-' + d.eleId + '-rect' )
			.attr ( 'width',  function ( d: any, i ) { return d.w += dx; } )
			.attr ( 'height', function ( d: any, i ) { return d.h += dy; } );
	//	g.select ( '#' + d.eleId + '-vsclr-track' )
	//		.attr ( 'x',      uCD.vsclrX )
	//		.attr ( 'y',      0 )
	//		.attr ( 'width',  uc.VERT_GEN_SCROLL_WIDTH )
	//		.attr ( 'height', d => d.h );
	//	updateSclrs ( d );
		d.parentPanel.updateSclrs();
	}	//	sized2()

	function sized ( d, i, ele, dx, dy ) {
		var sW = serviceId + ' sized()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   dx y: ' + dx + ' ' + dy );
		var g = d3.select ( ele.parentNode );
		sized2 ( d, g, dx, dy );
	}	//	sized()

	function sizeX ( d ) {
		//	(4 + 2)
		//		4 		For the left and right padding (2 pixels each).
		//		2 		? 	It just works.
	//	return d.w - uc.SIZE_HANDLE_WIDTH + (4 + 2);
		return d.w - uc.SIZE_HANDLE_WIDTH;
	}	//	sizeX()

	function sizeY ( d ) {
		//	2 		? 	It just works.
	//	return d.h - uc.SIZE_HANDLE_HEIGHT + 2;
		return d.h - uc.SIZE_HANDLE_HEIGHT;
	}	//	sizeY()


	function CanvasData ( o ) {
	//	o.x += uc.OFFS_4_1_PIX_LINE;
	//	o.y += uc.OFFS_4_1_PIX_LINE;

		//	Initialize the "base" of this object, ControlData -
		o.type      = uc.TYPE_CANVAS
		o.hasBorder = uc.isBoolean ( o.hasBorder ) ? o.hasBorder 
												   : true;
		o.class     = uc.isDefined ( o.class )     ? o.class
												   : 'u34-canvas';
		uCD.callControlData ( this, o );


		//	Properties unique to this control -
		this.bVertSB	  = uc.isBoolean ( o.bVertSB ) ? o.bVertSB : true;

		this.value        = uc.isString ( o.value )          ? o.value 
                                                             : 'Canvas';
		this.shiftClickCB = uc.isFunction ( o.shiftClickCB ) ? o.shiftClickCB 
															 : null;
		this.onProperties = uc.isFunction ( o.onProperties ) ? o.onProperties 
															 : null;

		this.content = { y:		0,
						 h:		0 };

		//	Override some "base" properties -
		this.onSize  = sized;
		this.onSize2 = sized2;
		this.onMove  = moved;
		this.onMouseOver  = mouseOver;
		this.onMouseLeave = mouseLeave;
	//	this.onVScroll = vscrolled;

	}	//	CanvasData()


//	CanvasData.prototype = uCD.newControlData();
//	CanvasData.prototype.constructor = CanvasData;
//	See createCanvasData().


	function CanvasData_listProperties() {
		var sW = serviceId + ' CanvasData.prototype.listProperties()';
		var whiteList = [ 'hasBorder' ];
		var value, displayName, props = uCD.listProperties ( this );
		for ( var key in this ) {
			if ( ! whiteList.includes ( key ) )
				continue;
			value = this[key];
			if ( value === undefined )
				continue;
			if ( value === null )
				continue;
		//	if ( typeof value === 'function' )
		//		continue;
			displayName = key;
			switch ( key ) {
				case 'hasBorder': 		displayName = 'has border';		break;
			}
			cmn.log ( sW, '   key: ' + key + '  value: ' + value );
			props.push ( { property: key, value: value, displayName: displayName } );
		}
		return props;
	}	//	CanvasData.prototype.listProperties()

//	CanvasData.prototype.setProperty = function ( name, value ) {
	function CanvasData_setProperty ( name, value ) {
		var sW = serviceId + ' CanvasData.prototype.setProperty()';
		var rtn = uCD.setProperty ( this, name, value );
		if ( rtn )
			return rtn;
		var n, g = d3.select ( '#' + this.eleId );
		if ( name === 'hasBorder' ) {					//	Like udui-label-b.js
			n = Number ( value );
			if ( n !== n ) {				//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
				if ( typeof value === 'string' ) {
					value = (value === 'true'); }
				else {
					value = false; } }
			else {
				value = (n !== 0); }
			this[name] = !! value;
			let clses = 'u34-canvas-foreignobject';
			if ( this[name] ) {
				clses += ' u34-canvas-foreignobject-with-border'; }
			g.select ( 'foreignObject' )
				.attr ( 'class', clses );
			return 1; }

		return 0;
	}	//	CanvasData.prototype.setProperty()

	function CanvasData_setStyle() {
		let d     = this;
	//	let style = 'width:' + (d.w - 14) + 'px; ';
	//	d3.select ( '#' + d.eleId + '-canvas' )
	//		.attr ( 'style',  style ); 
	}	//	CanvasData_setStyle()

	function CanvasData_setContent() {
		const sW = serviceId + ' setContent()';
		let d = this;
	//	let e = <HTMLIFrameElement>window.document.getElementById ( '' + d.eleId + '-iframe' );
	//
	//	if ( ! e ) {
	//		cmn.error ( sW, 'iframe is null' );
	//		return; }
	//
	//	e.style.border = 'none';
	//
	//	//	e is an iframe. Need the body ...
	//	let b = e.contentDocument?.getElementsByTagName ( 'body' )[0];
		let b = window.document.getElementById ( d.eleId + '-body' );
        
        if ( ! b ) {
            cmn.error ( sW, 'body is null' );
            return; }

		if ( b.children[0] ) {
			b.removeChild ( b.children[0] ); }

        b.innerHTML = '<canvas '
                    + 'id="' + d.eleId + '-canvas" '
                    + 'class="' + d.class + '">'
                    + '</canvas>';  

	}	//	CanvasData_setContent()

	function CanvasData_getContainer() {
		const sW = serviceId + ' getContainer()';
		cmn.log ( sW );
	//	return d3.select ( '#' + this.eleId + '-canvas-div' ).node();
		return this.contentNode;
	}	//	CanvasData_getContainer()

	svc.createCanvasData = function ( o ) {

	//	if ( CanvasData.prototype.constructor.name === 'CanvasData' ) {
	//		//	Do this once, here to avoid cir ref issue
			CanvasData.prototype = uCD.newControlData();
			CanvasData.prototype.constructor = CanvasData;
			CanvasData.prototype.listProperties = CanvasData_listProperties;
			CanvasData.prototype.setStyle = CanvasData_setStyle;
			CanvasData.prototype.setProperty = CanvasData_setProperty;
			CanvasData.prototype.setContent = CanvasData_setContent;
			CanvasData.prototype.getContainer = CanvasData_getContainer;
	//	}

		return new CanvasData ( o );
	};	//	svc.createCanvasData()

	svc.defineCanvas = function ( panel ) {
		var sW = serviceId + ' defineCanvas()';
		var newCanvas = null;
		var s = panel.data.base.selectAll ( '#' + panel.data.eleId + '-base' + ' > g' );
		cmn.log ( sW, '  s length: ' + s._groups[0].length );

		var ctrlEles = s
			.data ( panel.data.childData.data, function ( d ) { 
					return d.id || (d.id = ++panel.data.childData.nextId); 
			} )
			.enter()
			.each ( function ( d ) { 
				cmn.log ( sW, ' - g - new data: ' + d.name ); 
				newCanvas  = new CanvasData ( d );
			} )
			.append ( 'g' )
			.attr ( 'id',        function ( d, i ) { return d.eleId; } )
			//	group has no x, y - must transform -
			.attr ( 'transform', function ( d, i ) { return 'translate(' + d.x + ',' + d.y + ')'; } );

		ctrlEles
			.on ( 'mouseover', uCD.mouseover )
			.on ( 'mouseout',  uCD.mouseleave )
			.on ( 'mousedown', mousedown )
			.on ( 'mousemove', mousemove )
			.on ( 'mouseup',   mouseup )
		//	.on ( 'wheel',     onWheel )
			.on ( 'click',     click );

		let bodyD = null;

		ctrlEles.append ( 'g' )
			.attr ( 'id',         function ( d, i ) { return d.eleId + '-foreignobject'; } )
				.attr ( 'transform', 'translate(0.5,0.5)' )
			.append ( 'foreignObject' )
				.attr ( 'id',     function ( d, i ) { return d.eleId + '-text'; } )
				.attr ( 'x', 0 )
				.attr ( 'y', 0 )
				.attr ( 'width',  function ( d, i ) { 
					return d.w; } )
				.attr ( 'height', function ( d, i ) { 
					return d.h; } )
				.attr ( 'class',  d => 'u34-canvas-foreignobject'
								  	   + (d.hasBorder ? 
									   ' u34-canvas-foreignobject-with-border'
									   : '') )
				.append ( 'xhtml:body' )
					.attr ( 'id', d => d.eleId + '-body' )
					.attr ( 'style', 'margin:0px; height:100%')
					.html ( function ( d, i ) {
						bodyD = d;
						return '';
					} )
			//	.append ( 'xhtml:iframe' )
			//		.attr ( 'id', d => d.eleId + '-iframe' )
			//		.attr ( 'style', 'border:none;' )
			//		.html ( function ( d, i ) {
			//			bodyD = d;
			//			return '';
			//		} );

		if ( bodyD  ) {
			bodyD.setContent(); }

		ctrlEles.append ( 'rect' )				//	size handle - invisible until mouse is over
			.attr ( 'id',     function ( d, i ) { return d.eleId + '-size'; } )
			.attr ( 'x',      sizeX ) 
			.attr ( 'y',      sizeY )
			.attr ( 'width',  uc.SIZE_HANDLE_WIDTH )
			.attr ( 'height', uc.SIZE_HANDLE_HEIGHT )
			.attr ( 'class',  'u34-size-handle-transparent' )
			.on ( 'mouseover', uCD.mouseoverSize )
			.on ( 'mouseout',  uCD.mouseleaveSize )
			.on ( 'mousedown', uCD.mousedownSize );

		ctrlEles.append ( 'rect' )		//	move handle - invisible until mouse is over
			.attr ( 'id',     function ( d, i ) { return d.eleId + '-move'; } )
				.attr ( 'x',      1 )
				.attr ( 'y',      1 )
			.attr ( 'width',  uc.MOVE_HANDLE_WIDTH )
			.attr ( 'height', uc.MOVE_HANDLE_HEIGHT )
			.attr ( 'class',  'u34-move-handle-transparent' )
			.on ( 'mouseover', uCD.mouseoverMove )
			.on ( 'mouseout',  uCD.mouseleaveMove )
			.on ( 'mousedown', uCD.mousedownMove );

	//	uCD.defineScrollers ( ctrlEles );

		return newCanvas;
	};	//	svc.defineCanvas()

	return svc;
})();

