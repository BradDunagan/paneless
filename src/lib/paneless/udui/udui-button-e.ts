
//  app/partials/udui/udui-button-e.js

import * as d3 		from 'd3';

import { cmn }		from '../common';
import { uc } 		from './udui-common';
import { uCD } 		from './udui-control-data-a';

export var uButton = (function() { 

	'use strict';

	var serviceId = 'uduiButtonE';

	/* jshint validthis: true */

	var svc: any = {};

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

	function textX ( d ) {
	//	cmn.log ( 'uButton textX()' );
		switch ( d.textAnchor ) {
			case 'start': 	return d.bDropdown ? 8 : 2; 
			case 'middle': 	return d.w / 2; 
			case 'end': 	return d.w - 2; }
		return d.w / 2;
	}	//	textX()

	function textY ( d ) {
		let y = ((d.h -   4 + d.fs) / 2) + 1;
		if ( d.h < 20 ) {
			y -= 1; }
		return y;
	}	//	textY()

//	function click ( d, i, ele ) {
	function click ( evt : PointerEvent, d ) {
		var sW = serviceId + ' ' + ' click()';
		evt.stopPropagation();
		if ( evt.altKey ) {
			cmn.log ( sW, ' d.name: ' + d.name + '  altKey' );
			return;
		}
		if ( evt.shiftKey && uc.isFunction ( d.shiftClickCB ) ) {
			let otherMenuItems = null;
			d.shiftClickCB ( evt, d, otherMenuItems ); 
			return;
		}
		if ( uc.isFunction ( d.cb ) ) {
			cmn.log ( sW, ' d.name: ' + d.name + '  callback ...' );
//			d.cb ( d,  i, ele );
			d.cb ( d, -1, evt.target );
		}
		else
			cmn.log ( sW, ' d.name: ' + d.name );
	}	//	click()


	function moved ( d, i, ele, x, y ) {
		var sW = serviceId + ' moved()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   x y: ' + x + ' ' + y );
		d3.select ( ele.parentNode )
			.attr ( 'transform', function ( d: any, i ) { 
				return 'translate(' + (d.x = x) + ',' + (d.y = y) + ')'; 
			} );
		d.parentPanel.updateSclrs();
	}	//	moved()

	function sized ( d, i, ele, dx, dy ) {
		var sW = serviceId + ' sized()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   dx y: ' + dx + ' ' + dy );
		var g = d3.select ( ele.parentNode );
		sized2 ( d, g, dx, dy );
	}	//	sized()

	function sized2 ( d, g, dx, dy ) {
		d.w += dx;
		d.h += dy;
		g.select ( '#' + d.eleId + '-rect' )
		//	.attr ( 'width',  function ( d, i ) { return d.w; } )
		//	.attr ( 'height', function ( d, i ) { return d.h; } );
			.attr ( 'width',  d => d.w )
			.attr ( 'height', d => d.h );
		g.select ( '#' + d.eleId + '-text' )
		//	.attr ( 'x',      function ( d, i ) { return  d.w / 2; } )
			.attr ( 'x',      textX )
			.attr ( 'y',      textY )
		g.select ( '#' + d.eleId + '-size' )
		//	.attr ( 'x',      function ( d, i ) { return d.w - uc.SIZE_HANDLE_WIDTH;  } )
		//	.attr ( 'y',      function ( d, i ) { return d.h - uc.SIZE_HANDLE_HEIGHT; } );
			.attr ( 'x', d => d.w - uc.SIZE_HANDLE_WIDTH )
			.attr ( 'y', d => d.h - uc.SIZE_HANDLE_HEIGHT );
		if ( d.bDropdown ) {
		//	let data = ddaData ( d );
		//	g.select ( '#' + d.eleId + '-dropdownarrow' )
		//		.data ( [data] ); }
			d3.select ( '#' + this.eleId + '-dropdownarrow' ).remove();
			let node = d3.select ( '#' + this.eleId ).node();
			d.defineDropdownArrow ( node, true ); }
		d3.select ( '#cp-' + d.eleId + '-rect' )
		//	.attr ( 'width',  function ( d, i ) { return d.w += dx; } )
		//	.attr ( 'height', function ( d, i ) { return d.h += dy; } );
			.attr ( 'width',  d => cpSizeRectW ( d, dx ) )
			.attr ( 'height', d => cpSizeRectH ( d, dy ) );
		d.parentPanel.updateSclrs();
	}	//	sized2()

	function Button ( data ) {
		this.data = data;
	}

	function ButtonData ( o ) {
	//	o.x += uc.OFFS_4_1_PIX_LINE;
	//	o.y += uc.OFFS_4_1_PIX_LINE;

		//	Initialize the "base" of this object, ControlData -
		o.type      = uc.TYPE_BUTTON;
	//	o.class     = o.class     === undefined ? 'u34-button' : o.class;			2017-Aug 	obsolete?
		o.hasBorder = o.hasBorder === undefined ? true         : o.hasBorder;
		uCD.callControlData ( this, o );

		//	Initialize the rest of this object -
		this.text   = o.text;
		this.textId = o.textId ? o.textId : 0;
		this.cb     = uc.isFunction ( o.cb )           ? o.cb           
															 : null;
		this.shiftClickCB = uc.isFunction ( o.shiftClickCB ) ? o.shiftClickCB 
															 : null;
		this.onProperties = uc.isFunction ( o.onProperties ) ? o.onProperties
															 : null;
		this.ff   = uc.isString ( o.ff ) ? o.ff : 'verdana';//	font family
		let ff = this.ff.toLowerCase();
		if ( ff === 'consolas' ) {
			this.ff = 'courier new'; }
		
		this.fs   = uc.isNumber ( o.fs ) ? o.fs : 10;		//	size, pixels
		this.classText = 'u34-button-text';

		//	2017-Aug 	These  * were *  set by the class, above, u34-button.
		this.backgroundColor = uc.isString ( o.backgroundColor ) 
															? o.backgroundColor 
															: 'white';
		this.borderColor     = uc.isString ( o.borderColor ) ? o.borderColor 
															 : 'gray';
		this.borderWidth     = uc.isString ( o.borderWidth ) ? o.borderWidth 
															 : '1px';

		//	2017-Aug 	More options.
		this.bMoveRect  = uc.isBoolean ( o.bMoveRect ) ? o.bMoveRect : true;
		this.bSizeRect  = uc.isBoolean ( o.bSizeRect ) ? o.bSizeRect : true;

		//	Override some "base" properties -
		this.onSize  = sized;
		this.onSize2 = sized2;
		this.onMove  = moved;

		this.execute = uc.isString ( o.execute ) ? o.execute : '';
		this.onclick = uc.isObject ( o.onclick ) ? o.onclick : null;

		//	When clicked show a menu (list) below?
		if ( uc.isNumber ( o.bDropdown ) ) {
			this.bDropdown = (o.bDropdown !== 0); }
		else
		if ( uc.isString ( o.bDropdown ) ) {
			this.bDropdown = (o.bDropdown.toLowerCase() === 'true'); }
		else
		if ( uc.isBoolean ( o.bDropdown ) ) {
			this.bDropdown = o.bDropdown; }
		else {
			this.bDropdown = false; }
		//	Comma separated list of dropdown menu items.
		if ( uc.isString ( o.menu ) ) {
			try {
				let o2    = JSON.parse ( o.menu );
				this.menu = JSON.stringify ( o2 ); }
			catch ( e ) {
				this.menu = ''; } }
		else
		if ( uc.isObject ( o.menu ) ) {
			try {
				this.menu = JSON.stringify ( o.menu ); }
			catch ( e ) {
				this.menu = ''; } }
		else {
			this.menu = ''; }

		this.textAnchor = 'middle';
		if ( uc.isString ( o.horzAlign ) ) {
			switch ( o.horzAlign ) {
				case 'left': 	this.textAnchor = 'start';		break;
				case 'middle': 	this.textAnchor = 'middle';		break;
				case 'right': 	this.textAnchor = 'end';		break; } }
		else {
			if ( this.bDropdown ) {
				this.textAnchor = 'start'; } }

		//	An SVG image shown in the button?
		this.image		= cmn.isString ( o.image ) ? o.image : '';
		this.imageX		= cmn.isNumber ( o.imageX ) ? o.imageX : 0;
		this.imageY		= cmn.isNumber ( o.imageY ) ? o.imageY : 0;
		this.imageScale	= cmn.isNumber ( o.imageScale ) ? o.imageScale : 1;

	}	//	ButtonData()

//	ButtonData.prototype = uCD.newControlData();
//	ButtonData.prototype.constructor = ButtonData;
//	See svc.createButtonData().

	function ButtonData_listProperties() {
		var sW = serviceId + ' ButtonData.prototype.listProperties()';
		let self = this;
		let hostFnc = this.rpd.hostFnc;
		function imageSpec ( cellD ) {
			let td = cellD.tableData;
			let displayName = td.rows[cellD.iRow].cells[0].text;
			let value       = cellD.inputEle.value;
			cmn.log ( sW + ' imageSpec()',   ' displayName: ' + displayName 
											 + '  value: ' + value );
			cmn.log ( sW + ' imageSpec()', ' self.name: ' + self.name );

			//	Show long-text dialog. Initialize with value.
			//	On OK set regSpec property.
			if ( ! cmn.isFunction ( hostFnc ) ) {
				cmn.error ( 'hostFnc is not set' );
				return; }

			//	Dialog to edit long text.
			function onOK ( a ) {
				cmn.log ( sW, ' onOK()' );
				let s = a.text.trim();
				if ( s.length === 0 ) {
					s = null; }
				self.setImage ( s );
			}	//	onOK()
		
			hostFnc ( { do:		'long-text-dialog',
						title:	'Image SVG',
						onOK:	onOK,
						text:	self.image } );
		}	//	imageSpec()

		var whiteList = [ 'execute', 'text', 'ff', 'fs', 'bDropdown', 'menu',
						  'image', 'imageX', 'imageY', 'imageScale' ];
		var value, displayName, longTextCB, 
			props = uCD.listProperties ( this );
		for ( var key in this ) {
			if ( ! whiteList.includes ( key ) )
				continue;
			value = this[key];
			if ( value === undefined )
				continue;
			if ( value === null )
				continue;
			displayName = key;
			longTextCB  = null;
			switch ( key ) {
				case 'ff': 			displayName = 'font';			break;
				case 'fs': 			displayName = 'font size';		break;
				case 'bDropdown':	displayName = 'dropdown';		break;
				case 'image':		displayName = 'image';	
									longTextCB  = imageSpec;
									break;
				case 'imageX':		displayName = 'image x';		break;
				case 'imageY':		displayName = 'image y';		break;
				case 'imageScale':	displayName = 'image scale';	break;
			}
		//	cmn.log ( sW, '   key: ' + key + '  value: ' + value );
			props.push ( { property:	key, 
						   value:		value, 
						   displayName:	displayName,
						   longTextCB:	longTextCB } );
		}
		return props;
	}	//	ButtonData.prototype.listProperties()

//	ButtonData.prototype.setProperty = function ( name, value ) {
	function ButtonData_setProperty ( name, value ) {
		var sW = serviceId + ' ButtonData.prototype.setProperty()';
		var n, g, rtn;
		rtn = uCD.setProperty ( this, name, value );
		if ( rtn )
			return rtn;
		if ( name === 'execute' ) {
			this[name] = value;
		}
		if ( name === 'text' ) {
			this[name] = value;
			g = d3.select ( '#' + this.eleId + '-text' );
			g.text ( value );
		}
		if ( name === 'ff' ) {
			this[name] = value;
			g = d3.select ( '#' + this.eleId + '-text' );
			g.attr ( 'style', function ( d, i ) { return 'font-family: ' + d.ff + '; font-size: ' + d.fs + 'px;'; } );
		}
		if ( name === 'fs' ) {
		//	this[name] = parseFloat ( value );
			n = Number ( value );
			if ( n !== n ) 					//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
				return;
			this[name] = n;
			g = d3.select ( '#' + this.eleId + '-text' );
			g.attr ( 'style', function ( d, i ) { return 'font-family: ' + d.ff + '; font-size: ' + d.fs + 'px;'; } );
		}
		if ( name === 'bDropdown' ) {
			let bWasDropdown = this[name];
			let bDropdown = uc.booleanify ( value );
			this[name] = bDropdown;
			if ( bDropdown && ! bWasDropdown ) {
				let node = d3.select ( '#' + this.eleId ).node();
				this.defineDropdownArrow ( node, true );
				this.textAnchor = 'start'; }
			if ( bWasDropdown && ! bDropdown ) {
				d3.select ( '#' + this.eleId + '-dropdownarrow' ).remove();
				this.textAnchor = 'middle'; }
			if ( bDropdown !== bWasDropdown ) {
				d3.select ( '#' + this.eleId + '-text' )
					.attr ( 'text-anchor', ( d: any ) => d.textAnchor )
					.attr ( 'x', textX ); }
		}
		if ( name === 'menu' ) {
			this[name] = value;
		}
		if ( name === 'image' ) {
			if ( (! cmn.isString ( value )) || (value.trim() === '') ) {
				value = null; }
			this.setImage ( value );
		}
		if ( 	(name === 'imageX')
			 || (name === 'imageY')
			 || (name === 'imageScale') ) {
			let v = parseFloat ( value );
			if ( cmn.isNumber ( v ) ) {
				this[name] = v;
				d3.select ( '#' + this.eleId + '-image' )
					.attr ( 'transform', 
							( d: any ) => 'translate(' + d.imageX + ','
													   + d.imageY + ')'
											+ 'scale(' + d.imageScale + ')' ); }
		}
	}	//	ButtonData.prototype.setProperty()

/*	Unnecessary. Client calls deltaXYWH() in uCD directly.
	function ButtonData_deltaXYWH ( o ) {
	//	if ( o.dx || o.dy ) {
	//		uCD.deltaXYWH ( this, o ); 
	//		if ( this.propCB ) {			//	update the properties board?
	//			this.propCB ( 'x', this.x );
	//			this.propCB ( 'y', this.y ); } }
	//	if ( o.dw || o.dh ) {
	//		let e = document.getElementById ( this.eleId + '-size' )
	//		sized ( this, null, e, o.dw, o.dh ); 
	//		if ( this.propCB ) {			//	update the properties board?
	//			this.propCB ( 'w', this.w );
	//			this.propCB ( 'h', this.h ); } }
		uCD.deltaXYWH ( this, o ); 
	}	//	ButtonData.prototype.deltaXYWH()
*/

	function ButtonData_setText ( s, id ) {
		this.text = s;
		d3.select ( '#' + this.eleId + '-text' )
			.text ( s );
		if ( id ) {
			this.textId = id; }
	}	//	ButtonData_setText();

	function ButtonData_setImage ( s ) {
		this.image = s;
		d3.select ( '#' + this.eleId + '-image' )
			.html ( cmn.isString ( s ) ? s : '' );
	}	//	ButtonData_setImage();

	function ddaData ( d ) {
		return [
			{x:d.w-14, y:5    }, 
			{x:d.w-4,  y:5    }, 
			{x:d.w-9,  y:d.h-5},
			{x:d.w-14, y:5    } ];
	}	//	ddaData()

	function ButtonData_defineDropdownArrow ( sel, before ) {
		let d = this;
		let valueline: any = d3.line()
			.x ( ( d: any ) => d.x )
			.y ( ( d: any ) => d.y );
	//	let ddaData = [
	//		{x:d.w-14, y:5    }, 
	//		{x:d.w-4,  y:5    }, 
	//		{x:d.w-9,  y:d.h-5},
	//		{x:d.w-14, y:5    } ];
		let data = ddaData ( d );

		if ( before ) {
			if ( d.bSizeRect ) {
				before = '#' + d.eleId + '-size'; }
			else
			if ( d.MoveRect ) {
				before = '#' + d.eleId + '-move'; }
			else {
				before = null; } }
		else  {
			before = null; }

		let s = d3.select ( sel );

		s.insert ( 'path', before ) 
			.attr ( 'id', ( d: any ) => d.eleId + '-dropdownarrow' )
		//	.data ( [ddaData] )
			.data ( [data] )
			.attr ( 'class', 'u34-dropdownarrow' )
			.attr ( 'd', valueline );
	}	//	ButtonData_defineDropdownArrow()

	function ButtonData_setDisplay ( display ) {
		//	I.e., visibility
		//		display:	none				//	to hide
		//		display:	unset				//	to show
		d3.select ( '#' + this.eleId  )
			.attr ( 'style', 'display: ' + display + ';' );
	}	//	ButtonData_setDisplay()


	svc.createButtonData = function ( o ) {

	//	if ( ButtonData.prototype.constructor.name === 'ButtonData' ) {
	//		//	Do this once, here to avoid cir ref issue
			ButtonData.prototype = uCD.newControlData();
			ButtonData.prototype.constructor = ButtonData;
			ButtonData.prototype.listProperties = ButtonData_listProperties;
			ButtonData.prototype.setProperty = ButtonData_setProperty;
		//	ButtonData.prototype.deltaXYWH = ButtonData_deltaXYWH;
			ButtonData.prototype.setText = ButtonData_setText;
			ButtonData.prototype.setImage = ButtonData_setImage;
			ButtonData.prototype.defineDropdownArrow 
				= ButtonData_defineDropdownArrow;
			ButtonData.prototype.setDisplay = ButtonData_setDisplay;
	//	}

		return new ButtonData ( o );
	};	//	svc.createButtonData()


	Button.prototype.parentSizedAbsolute = function ( w, h )  { 	//	i.e., this control's "client" area has been resized
		var bd = this.data;
		var dx = w - bd.w + 1;
		var dy = h - bd.h + 1;
		let e = document.getElementById ( this.data.eleId + '-size' )
		sized ( bd, null, e, dx, dy );
	};	//	Button.prototype.parentSizedAbsolute()

	svc.defineButton = function ( panel ) {
		var sW = serviceId + ' defineButton()';
	
		var button = null;
		var s = panel.data.base.selectAll ( '#' + panel.data.eleId + '-base' + ' > g' );
	//	cmn.log ( sW, '  s length: ' + s._groups[0].length );

		var ctrlEles = s
			.data ( panel.data.childData.data, function ( d ) { 
					return d.id || (d.id = ++panel.data.childData.nextId); 
			} )
			.enter()
			.each ( function ( d ) { 
	//			cmn.log ( 'defineButton() - g - new data: ' + d.name + '  x y: ' + d.x + ' ' + d.y ); 
				button = new Button ( d );
			} )
			.append ( 'g' )
			.attr ( 'id',        function ( d, i ) { return d.eleId; } )
			//	group has no x, y - must transform -
		//	.attr ( 'transform', function ( d, i ) { return 'translate(' + d.x + ',' + d.y + ')'; } );
			.attr ( 'transform', d => 'translate(' + d.x + ',' + d.y + ')' );

		ctrlEles
			.on ( 'mouseover', uCD.mouseover )
			.on ( 'mouseout',  uCD.mouseleave )
			.on ( 'mousemove', uCD.mousemove )
			.on ( 'mousedown', uCD.mousedown )
			.on ( 'mouseup',   uCD.mouseup )
			.on ( 'click',     click );
	//	On the rect -
		ctrlEles.append ( 'rect' )
			.attr ( 'id',           function ( d, i ) { return d.eleId + '-rect'; } )
			.attr ( 'width',        function ( d, i ) { return d.w; } )
			.attr ( 'height',       function ( d, i ) { return d.h; } )
		//	.attr ( 'class',        function ( d, i ) { return d.class; } );
			.attr ( 'fill',         function ( d, i ) { return d.backgroundColor; } )
			.attr ( 'stroke',       function ( d, i ) { return d.borderColor; } )
			.attr ( 'stroke-width', function ( d, i ) { return d.borderWidth; } );
	//		.on ( 'mouseover', uCD.mouseover )
	//		.on ( 'mouseout',  uCD.mouseleave )
	//		.on ( 'mousemove', uCD.mousemove )
	//		.on ( 'mousedown', uCD.mousedown )
	//		.on ( 'mouseup',   uCD.mouseup )
	//		.on ( 'click',     click );

		ctrlEles.append ( 'g' )
			.attr ( 'id',        d => d.eleId + '-image-clip' )
			.attr ( 'clip-path', d => 'url(#cp-' + d.eleId + ')' )
			.append ( 'g' )
				.attr ( 'id',        d => d.eleId + '-image' )
				.attr ( 'transform', d => {
					if ( ! cmn.isDefined ( d.imageX ) ) {
						cmn.error ( sW, 'd.imageX is undefined' ); }
					return 'translate(' + d.imageX + ','
													   + d.imageY + ')'
										+ 'scale(' + d.imageScale + ')'; } )
				.html ( d => d.image );
		
		ctrlEles.append ( 'text' )
			.attr ( 'id',          function ( d, i ) { return d.eleId + '-text'; } )
			.attr ( 'text-anchor', function ( d, i ) { return d.textAnchor; } )
			.attr ( 'x',           textX )
			.attr ( 'y',           textY )
			.attr ( 'style',       function ( d, i ) { return 'font-family: ' + d.ff + '; font-size: ' + d.fs + 'px;'; } )
			.attr ( 'class',       function ( d, i ) { return d.classText; } )
		//	.attr ( 'clip-path',   function ( d, i ) { return 'url(#cp-' + d.eleId + ')'; } )
			.attr ( 'clip-path',   d => 'url(#cp-' + d.eleId + ')' )
			.text (                function ( d, i ) { return d.text; } );
		//	.on ( 'mousedown',	null );

		ctrlEles.each ( function ( d ) {	
			if ( ! d.bDropdown ) {
				return; }
			d.defineDropdownArrow ( this, null );
		} );

	//	ctrlEles.append ( 'rect' )		//	size handle - invisible until mouse is over
		ctrlEles.each ( function ( d ) {	
			if ( ! d.bSizeRect ) {
				return; }
		d3.select ( this )			
			.append ( 'rect' )			//	size handle - invisible until mouse is over
			.attr ( 'id',     function ( d: any, i ) { return d.eleId + '-size'; } )
			.attr ( 'x',      function ( d: any, i ) { return d.w - uc.SIZE_HANDLE_WIDTH; } )
			.attr ( 'y',      function ( d: any, i ) { return d.h - uc.SIZE_HANDLE_HEIGHT; } )
			.attr ( 'width',  function ( d, i ) { return uc.SIZE_HANDLE_WIDTH; } )
			.attr ( 'height', function ( d, i ) { return uc.SIZE_HANDLE_HEIGHT; } )
			.attr ( 'class',  function ( d, i ) { return 'u34-size-handle-transparent'; } )
			.on ( 'mouseover', uCD.mouseoverSize )
			.on ( 'mouseout',  uCD.mouseleaveSize )
			.on ( 'mousedown', uCD.mousedownSize );
		} );

	//	ctrlEles.append ( 'rect' )		//	move handle - invisible until mouse is over
		ctrlEles.each ( function ( d ) {	
			if ( ! d.bMoveRect ) {
				return; }
		d3.select ( this )			
			.append ( 'rect' )			//	move handle - invisible until mouse is over
			.attr ( 'id',     function ( d: any, i ) { return d.eleId + '-move'; } )
			.attr ( 'x',      0 )
			.attr ( 'y',      0 )
			.attr ( 'width',  uc.MOVE_HANDLE_WIDTH )
			.attr ( 'height', uc.MOVE_HANDLE_HEIGHT )
			.attr ( 'class',  'u34-move-handle-transparent' )
			.on ( 'mouseover', uCD.mouseoverMove )
			.on ( 'mouseout',  uCD.mouseleaveMove )
			.on ( 'mousedown', uCD.mousedownMove );
		} );

		return button;
	};	//	svc.defineButton()

	return svc;

})();
