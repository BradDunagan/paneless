
//  app/partials/udui/udui-canvas-a.js

import * as d3 		from 'd3';

import { cmn }		from '../common';
import { uc } 		from './udui-common';
import { uCD } 		from './udui-control-data-a';

interface CanvasContexts {
	[key: string|number]:		CanvasRenderingContext2D;
}

//	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
//
interface BytePixels {
	w: number;
	h: number;
	b: Uint8Array;
}

var uCanvas = (function() { 

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
		let sW = serviceId + ' mousemove()';
		cmn.log ( sW, 'Name: ' + d.name + '  evt.altKey: ' + evt.altKey
					+ '    clientX Y: ' + evt.clientX + ' ' + evt.clientY );
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

	function canvasSize ( d, w, h, doPropCB:boolean = true) {
		let sW = serviceId + ' canvasSize()';
		//	Size of the canvas.
		//	Not necessarily the size of the control which is the size of the
		//	svg foreign object and html body.
		//	Something like that.
		let cvs = <HTMLCanvasElement>window.document.getElementById ( 
														d.eleId + '-canvas' );
		if ( ! cvs ) {
			cmn.error ( sW, 'canvas not found' );
			return; }
		//	https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/width
		cvs.width  = d.canvasW = w;		//	Just a number. Not a string, like, 
		cvs.height = d.canvasH = h;		//	e.g., "400px".
		if ( doPropCB && cmn.isFunction ( d.propCB ) ) {
			d.propCB ( 'canvasW', cvs.width );
			d.propCB ( 'canvasH', cvs.height );
		}
	}	//	canvasSize()

	function canvasSizeByControl ( d ) {
		if ( ! d.bSzCvsIsSzCtrl ) {
			return; }
		let w = d.w, h = d.h;
		if ( d.hasBorder ) {
			w -= 2;	h -= 2;	}			
		canvasSize ( d, w, h ); 
	}	//	canvasSizeByControl()

	//	Canvas Control Size
	//
	function sized2 ( d, g, dx, dy ) {
		var sW = serviceId + ' sized2()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   dx y: ' + dx + ' ' + dy );
		d.w += dx;
		d.h += dy;

		g.select ( 'foreignObject' )
			.attr ( 'width',  d =>  d.w )
			.attr ( 'height', d =>  d.h );

		if ( d.bSzCvsIsSzCtrl ) {
			canvasSizeByControl ( d ); }

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
		this.value        = uc.isString ( o.value )          ? o.value 
                                                             : 'Canvas';
		this.shiftClickCB = uc.isFunction ( o.shiftClickCB ) ? o.shiftClickCB 
															 : null;
		this.onProperties = uc.isFunction ( o.onProperties ) ? o.onProperties 
															 : null;
		this.bSzCvsIsSzCtrl	= cmn.isBoolean ( o.bSzCvsIsSzCtrl )  
							? o.bSzCvsIsSzCtrl
							: false;
		this.canvasW		= cmn.isNumber ( o.canvasW ) ? o.canvasW : null;
		this.canvasH		= cmn.isNumber ( o.canvasH ) ? o.canvasH : null;

		//	Override some "base" properties -
		this.onSize  = sized;
		this.onSize2 = sized2;
		this.onMove  = moved;
		this.onMouseOver  = mouseOver;
		this.onMouseLeave = mouseLeave;
	//	this.onVScroll = vscrolled;
		
		this.context		= <CanvasContexts> {};
		this.imageData		= <BytePixels | null> null;
		this.bIsEnlarged	= false;
		this.enlargedPS		= 0;		//	Pixel Size
		this.feats			= null;

	}	//	CanvasData()


//	CanvasData.prototype = uCD.newControlData();
//	CanvasData.prototype.constructor = CanvasData;
//	See createCanvasData().


	function CanvasData_listProperties() {
		var sW = serviceId + ' CanvasData.prototype.listProperties()';
		var whiteList = [ 'hasBorder', 'bSzCvsIsSzCtrl', 'canvasW', 'canvasH' ];
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
				case 'hasBorder': 	
					displayName = 'has border';		
					break;
				case 'bSzCvsIsSzCtrl':	
					displayName = 'canvas size == control size';
					break;
				case 'canvasW':
					displayName = 'canvas width';
					break;
				case 'canvasH':
					displayName = 'canvas height';
					break;
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
			canvasSizeByControl ( this );
			return 1; }
		if ( name === 'bSzCvsIsSzCtrl' ) {
			if ( uc.booleanify ( value ) ) {
				if ( this.bSzCvsIsSzCtrl ) {
					return 1; }
				this.bSzCvsIsSzCtrl = true;
				canvasSizeByControl ( this ); }
			else {
				if ( ! this.bSzCvsIsSzCtrl ) {
					return 1; }
				this.bSzCvsIsSzCtrl = false; }
			return 1; }
		if ( name === 'canvasW' ) {
			n = Number ( value );
			if ( Number.isNaN ( n ) || n < 1 ) {
				return 1; }
			if ( this.bSzCvsIsSzCtrl ) {
				let  g = d3.select ( '#' + d.eleId );
				let dw = n - this.canvasW;
				let dh = 0;
				sized2 ( this, g, dw, dh ); }
			else {
				canvasSize ( this, n, this.canvasH, false ); }
			return 1; }
		if ( name === 'canvasH' ) {
			n = Number ( value );
			if ( Number.isNaN ( n ) || n < 1 ) {
				return 1; }
			if ( this.bSzCvsIsSzCtrl ) {
				let  g = d3.select ( '#' + d.eleId );
				let dw = 0;
				let dh = n - this.canvasH;
				sized2 ( this, g, dw, dh ); }
			else {
				canvasSize ( this, this.canvasW, n, false ); }
			return 1; }

		return 0;
	}	//	CanvasData.prototype.setProperty()

	function CanvasData_setStyle() {
		let d     = this;
	//	let style = 'width:' + (d.w - 14) + 'px; ';
	//	d3.select ( '#' + d.eleId + '-canvas' )
	//		.attr ( 'style',  style ); 
		
		//	width, height of the canvas is set via the width, height
		//	properties of the canvas. Right?  See CanvasData_size().
	}	//	CanvasData_setStyle()

	function CanvasData_setContent() {
		const sW = serviceId + ' setContent()';
		let d = this;
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

	function CanvasData_getContext() : number {
		const sW = serviceId + ' getContext()';
		cmn.log ( sW );
		let  d   = this;
		let  cvs = <HTMLCanvasElement>
				   window.document.getElementById ( d.eleId + '-canvas' );
		if ( ! cvs ) {
			cmn.error ( sW, 'canvas not found' );
			return 0; }
		let hCtx = 1;
		d.context[hCtx] = <CanvasRenderingContext2D>cvs.getContext ( "2d" );
		return hCtx;
	}	//	CanvasData_getContext()

	function CanvasData_size ( hContext: number, w: number, h: number ) {
		const sW = serviceId + ' size()';
		cmn.log ( sW );
		let d = this;
		if ( d.bSzCvsIsSzCtrl ) {
			let  cvs = <HTMLCanvasElement>
					   window.document.getElementById ( d.eleId + '-canvas' );
			if ( ! cvs ) {
				cmn.error ( sW, 'canvas not found' );
				return; }
			let dw = w - cvs.width;
			let dh = h - cvs.height;
			let  g = d3.select ( '#' + d.eleId );
			sized2 ( d, g, dw, dh ); }
		else {
			canvasSize ( d, w, h ); }
	}	//	CanvasData_size()

	function CanvasData_enlarge ( hContext: number, pixelSize: number ) {
		const sW = serviceId + ' enlarge()';
		cmn.log ( sW );
		let d = this;
		
		//	Get the current image data.
		//		If the pixels are not currently enlarged.
		//		Else, having the image data from a previous enlargement, this
		//		is unnecessary.
		//	Resize the canvas.
		//	Rectangle fill each enlarged pixel according to each's data.

		//	Image data is maintained separately from the canvas as just one
		//	byte per pixel.
		let	 bab: BytePixels | null = this.getImageData ( hContext );
		if ( ! bab ) {
			cmn.error ( sW, 'failed to get image data' );
			return; }

		const PB	= 1;
		const PW	= pixelSize;
		const PH	= pixelSize;
		const ImgW	= bab.w;
		const ImgH	= bab.h;
		const 	w	= PB + ((PW + PB) * ImgW);
		const	h 	= PB + ((PH + PB) * ImgH);

		d.size ( hContext, w, h );

		let  ctx = d.context[hContext];

		for ( let j = 0; j < ImgH; j++ ) {
		for ( let i = 0; i < ImgW; i++ ) {
			let b = bab.b[(j * bab.w) + i];
			ctx.fillStyle = "rgb(" + b + " " + b + " " + b + " / 100%";
			ctx.fillRect ( (i * (PW + PB) + PB), 	//	x
						   (j * (PH + PB) + PB),	//	y
						   PW, PH ); } }

		d.bIsEnlarged	= true;
		d.enlargedPS	= pixelSize;
	}	//	CanvasData_enlarge()

	function CanvasData_setFillstyle ( hContext, style ) {
		const sW = serviceId + ' setFillstyle()';
		cmn.log ( sW );
		let d   = this;
		let ctx = d.context[hContext];
		ctx.fillStyle = style;
	}	//	CanvasData_setFillstyle()

	function CanvasData_fillRect ( hContext, x, y, w, h ) {
		const sW = serviceId + ' fillRect()';
		cmn.log ( sW );
		let d   = this;
		let ctx = d.context[hContext];
		ctx.fillRect ( x, y, w, h );	
	}	//	CanvasData_fillRect()

	function CanvasData_translate ( hContext, x, y ) {
		const sW = serviceId + ' translate()';
		cmn.log ( sW );
		let d   = this;
		let ctx = d.context[hContext];
		ctx.translate ( x, y );	
	}	//	CanvasData_translate()

	function CanvasData_rotate ( hContext, a ) {
		const sW = serviceId + ' rotate()';
		cmn.log ( sW );
		let d   = this;
		let ctx = d.context[hContext];
		ctx.rotate ( a );	
	}	//	CanvasData_rotate()

	function CanvasData_getImageData ( hContext, x, y, w, h ) {
		const sW = serviceId + ' getImageData()';
		cmn.log ( sW );
		let d   = this;
		if ( d.imageData ) {
			return d.imageData; }
		if ( d.bIsEnlarged ) {
			cmn.error ( sW, 'no image data, but is enlarged' );
			return null; }
		let  cvs = <HTMLCanvasElement>
				   window.document.getElementById ( d.eleId + '-canvas' );
		if ( ! cvs ) {
			cmn.error ( sW, 'canvas not found' );
			return; }
		let  ctx = d.context[hContext];
		let data = <ImageData>ctx.getImageData ( 0, 0, cvs.width, cvs.height );
		//	Byte Array Buffer
		//	I.e., for now, deal with just 8 bits per pixel. I.e., gray scale.
		let	  nb = data.width * data.height;
		let  bab = new Uint8Array ( nb );
		for ( let i = 0; i < nb; i++ ) {
			bab[i] = data.data[i * 4]; }

		d.imageData = { w:	data.width,
						h:	data.height,
						b:	bab };
		return d.imageData;
	}	//	CanvasData_getImageData()

	function CanvasData_edge ( hContext ) {
		const sW = serviceId + ' edge()';
		cmn.log ( sW );
		let d    = this;
		let data: BytePixels | null = null;
		if ( d.imageData ) {
			data = d.imageData; }
		else {
			if ( d.bIsEnlarged ) {
				cmn.error ( sW, 'no image data, but is enlarged' );
				return null; }
			data = d.getImageData ( hContext ); }
		if ( ! data ) {
			return null; } 


		//	N-S differences.
		
		let ImgW = data.w;
		let ImgH = data.h;
		let pix	 = data.b;

		let feats : { i: number; j: number; d: number } [] = [];

		const nsH  = 7;
		const nsH2 = Math.floor ( nsH / 2 );

		for ( let j = nsH; j < ImgH - nsH; j += nsH2 )
		for ( let i = 0; i < ImgW; i++ ) {
			let maxD = 0;	let maxDk = -1;
			for ( let k = -nsH2; k < nsH2; k++ ) {
				let aj = j + k;
				let ip = (aj * ImgW) + i;
				let a0 = pix[ip + (0 * ImgW)];
				let a1 = pix[ip + (1 * ImgW)];
				let a2 = pix[ip + (2 * ImgW)];
				let a  = Math.floor ( (a0 + a1 + a2) / 3 );
				let b0 = pix[ip + (4 * ImgW)];
				let b1 = pix[ip + (5 * ImgW)];
				let b2 = pix[ip + (6 * ImgW)];
				let b  = Math.floor ( (b0 + b1 + b2) / 3 );
				let diff = Math.abs ( b - a );
				if ( diff > maxD ) {
					maxD  = diff;
					maxDk = k; }
			}
			if ( maxD > 40 ) {
				feats.push ( { i: i, j: j + maxDk + 3, d: maxD } );
			}
		}

		if ( d.bIsEnlarged ) {
			let  cvs = <HTMLCanvasElement>
					   window.document.getElementById ( d.eleId + '-canvas' );
			if ( ! cvs ) {
				cmn.error ( sW, 'canvas not found' );
				return null; }

			let  ctx = d.context[hContext];

			ctx.fillStyle = "rgb(0 255 0 / 100%";

			let PW = d.enlargedPS;
			let PH = d.enlargedPS;
			let PB = 1;

			feats.forEach ( f => {
				ctx.fillRect ( (f.i * (PW + PB) + PB) + 3, 	//	x
							   (f.j * (PH + PB) + PB) + 3,	//	y
							   3, 3 ); 
			} ); }

		d.feats = feats;
		
		return null;
	}	//	CanvasData_edge()

	svc.createCanvasData = function ( o ) {
	//	if ( CanvasData.prototype.constructor.name === 'CanvasData' ) {
	//		//	Do this once, here to avoid cir ref issue
			CanvasData.prototype = uCD.newControlData();
			CanvasData.prototype.constructor = CanvasData;
			CanvasData.prototype.listProperties = CanvasData_listProperties;
			CanvasData.prototype.setStyle = CanvasData_setStyle;
			CanvasData.prototype.setProperty = CanvasData_setProperty;
			CanvasData.prototype.setContent = CanvasData_setContent;
			CanvasData.prototype.getContext = CanvasData_getContext;
			CanvasData.prototype.size = CanvasData_size;
			CanvasData.prototype.enlarge = CanvasData_enlarge;
			CanvasData.prototype.setFillstyle = CanvasData_setFillstyle;
			CanvasData.prototype.fillRect = CanvasData_fillRect;
			CanvasData.prototype.translate = CanvasData_translate;
			CanvasData.prototype.rotate = CanvasData_rotate;
			CanvasData.prototype.getImageData = CanvasData_getImageData;
			
			//	Features ?
			//	-	edge
			//		-	average intensity
			//		-	pattern (e.g., noisyness)
			//	-	corner ?
			//	-	gradient

			CanvasData.prototype.edge = CanvasData_edge;
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
		//	.on ( 'mousemove', mousemove )
			.on ( 'mouseup',   mouseup )
		//	.on ( 'wheel',     onWheel )
			.on ( 'click',     click );

		let bodyD: any = null;

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

		while ( bodyD  ) {
			bodyD.setContent(); 
			let cvs = <HTMLCanvasElement>
					  document.getElementById ( bodyD.eleId + '-canvas' );
			if ( ! cvs ) {
				break; }
			if ( bodyD.canvasW === null ) {
				bodyD.canvasW = cvs.width; }
			else {
				cvs.width = bodyD.canvasW; }
			if ( bodyD.canvasH === null ) {
				bodyD.canvasH = cvs.height; }
			else {
				cvs.height = bodyD.canvasH; }
				
		//	cvs.onmousemove = mousemove;
			(<any>cvs).__data__ = bodyD;
			d3.select ( cvs )
				.on ( 'mousemove', mousemove );

			break; }

		ctrlEles.append ( 'rect' )		//	size handle - invisible until mouse is over
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

export { uCanvas,  type BytePixels };

