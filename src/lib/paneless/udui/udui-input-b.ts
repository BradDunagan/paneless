
//  app/partials/udui/udui-input-b.js

//	For this b version -
//
//		Using ControlData to help with the mouse work.

import * as d3 		from 'd3';

import { cmn }		from '../common';
import { uc } 		from './udui-common';
import { uCD } 		from './udui-control-data-a';
import uBoards	 	from './udui-boards-a';

/*
function rrInputInput ( evt ) {
	var sW = 'rrInputInput()';
	//	Called when input's value changes - key press, delete, paste, etc..
	var inputEle = evt.srcElement;
	cmn.log ( sW, ' eleId: ' + inputEle.id + '  value: ' + inputEle.value );
}
*/
/*
function rrInputChange ( evt ) {
	var sW = 'rrInputChange()';
	cmn.log ( sW );
	//	Called when input focus is lost or when Enter key is pressed.
	var inputEle = evt.srcElement;
	var bodyEle  = inputEle.parentElement;
	bodyEle.__data__.value = inputEle.value;
}
*/

export var uInput = (function() { 

	'use strict';

	var serviceId = 'uduiInputB';

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

	function onFocus ( evt ) {
		var sW = serviceId + ' onFocus()';
		let ele = evt.target;
		let d   = ele.__data__;
		cmn.log ( sW, ' eleId: ' + d.eleId );
		if ( d.focusCB ) {
			d.focusCB ( d, -1, ele ); }
	}	//	onFocus()
	
	function onInput ( evt, d ) {
		var sW = serviceId + ' onInput()';
		//	Called when input's value changes - key press, delete, paste, etc..
		d.value = evt.target.value;
	//	cmn.log ( sW, ' eleId: ' + d.eleId + ' value: ' + d.value );
		if ( d.inputCB )
			d.inputCB ( evt, d );
	}	//	onInput()

	function onChange ( evt, d ) {
		var sW = serviceId + ' onChange()';
		cmn.log ( sW );
		//	Called when input focus is lost or when Enter key is pressed.
		d.value = evt.target.value;
		if ( d.changeCB ) 
			d.changeCB ( evt, d );
	}	//	onChange()

	function mousedown ( evt, d ) {
//		var sW = serviceId + ' mousedown()';
//		cmn.log ( sW, 'Name: ' + d.name + '  event.altKey: ' + event.altKey );
		evt.stopPropagation();
	}	//	mousedown()

	function mousemove ( evt, d ) {
//		var sW = serviceId + ' mousemove()';
//		cmn.log ( sW, 'Name: ' + d.name + '  event.altKey: ' + event.altKey );
		evt.stopPropagation();
	}	//	mousemove()

	function mouseup ( evt, d ) {
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

	//	Input Move
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

	//	Input Size
	//
	function sized2 ( d, g, dx, dy ) {
		var sW = serviceId + ' sized2()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   dx y: ' + dx + ' ' + dy );
		d.w += dx;
		if ( d.w < 0 ) {
			d.w = 1; }
		d.h += dy;
		if ( d.h < 0 ) {
			d.h = 1; }
		g.select ( 'foreignObject' )
			//	w + 4 (padding top, bottom) + 2 (border top, bottom)
			.attr ( 'width',  d => { return (d.w + 6) + 'px'; } )
			//	h + 2 (border top, bottom)
			.attr ( 'height', d => { return (d.h + 2) + 'px'; } );
		g.select ( 'input' )
			.attr ( 'style',  function ( d, i ) { 
			//	return 'width:' + d.w + 'px; height:' + d.h + 'px;                          font-family:' + d.ff + '; font-size:' + d.fs + 'px;';
				return 'width:' + d.w + 'px; height:' + d.h + 'px; border:' + d.border + '; font-family:' + d.ff + '; font-size:' + d.fs + 'px; text-align:' + d.textAlign + ';';
			} );
		g.select ( '#' + d.eleId + '-size' )
		//	.attr ( 'x',      function ( d, i ) { return d.w - uc.SIZE_HANDLE_WIDTH;  } )
		//	.attr ( 'y',      function ( d, i ) { return d.h - uc.SIZE_HANDLE_HEIGHT; } );
			.attr ( 'x',      sizeX )
			.attr ( 'y',      sizeY );
		d3.select ( '#cp-' + d.eleId + '-rect' )
		//	.attr ( 'width',  function ( d, i ) { return d.w += dx; } )
		//	.attr ( 'height', function ( d, i ) { return d.h += dy; } );
			.attr ( 'width',  d => cpSizeRectW ( d, dx ) )
			.attr ( 'height', d => cpSizeRectH ( d, dy ) );
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
		return d.w - uc.SIZE_HANDLE_WIDTH + (4 + 2);
	}	//	sizeX()

	function sizeY ( d ) {
		//	2 		? 	It just works.
		return d.h - uc.SIZE_HANDLE_HEIGHT + 2;
	}	//	sizeY()

	function Input ( data ) {
		this.data = data;
	}

	function InputData ( o ) {
	//	o.x += uc.OFFS_4_1_PIX_LINE;
	//	o.y += uc.OFFS_4_1_PIX_LINE;

		//	Initialize the "base" of this object, ControlData -
		o.type      = uc.TYPE_INPUT;
	//	o.class     = o.class     === undefined ? 'u34-button' : o.class;			2017-Aug
		o.class     = o.class     === undefined ? 'u34-input' : o.class;
		o.hasBorder = o.hasBorder === undefined ? false       : o.hasBorder;
		uCD.callControlData ( this, o );


		//	Properties unique to this control -
		this.value = uc.isString ( o.value ) ? o.value : '';

		this.focusCB      = uc.isFunction ( o.focusCB )      ? o.focusCB      : null;
		this.inputCB      = uc.isFunction ( o.inputCB )      ? o.inputCB      : null;
		this.changeCB     = uc.isFunction ( o.changeCB )     ? o.changeCB     : null;
		this.shiftClickCB = uc.isFunction ( o.shiftClickCB ) ? o.shiftClickCB : null;
		this.onProperties = uc.isFunction ( o.onProperties ) ? o.onProperties : null;

		this.border 	= uc.isString ( o.border ) ? o.border : 'solid 1px lightgray';
		this.ff   		= uc.isString ( o.ff ) ? o.ff : 'consolas';				//	font family
		this.fs   		= uc.isNumber ( o.fs ) ? o.fs : 12;						//	font size, pixels
		this.textAlign	= uc.isString ( o.textAlign ) ? o.textAlign : 'right';

		this.inputType	= uc.isString ( o.inputType ) ? o.inputType : 'number';
		this.step		= uc.isNumber ( o.step )      ? o.step      : 10;
		this.decPlaces	= uc.isNumber ( o.decPlaces ) ? o.decPlaces : 2;

		//	Override some "base" properties -
		this.onSize  = sized;
		this.onSize2 = sized2;
		this.onMove  = moved;

		this.execute  = uc.isString ( o.execute )  ? o.execute  : '';
		this.onchange = uc.isObject ( o.onchange ) ? o.onchange : null;

		this.tabIndex = uc.isNumber ( o.tabIndex ) ? o.tabIndex : '';
	}	//	InputData()


//	InputData.prototype = uCD.newControlData();
//	InputData.prototype.constructor = InputData;
//	See createInputData().


	function InputData_listProperties() {
		var sW = serviceId + ' InputData.prototype.listProperties()';
		var whiteList = [ 'execute', 'border', 'ff', 'fs', 'textAlign', 
						  'inputType', 'step', 'tabIndex' ];
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
				case 'ff': 			displayName = 'font';			break;
				case 'fs': 			displayName = 'font size';		break;
				case 'textAlign':	displayName = 'text align';		break;
				case 'inputType': 	displayName = 'input type';		break;
				case 'tabIndex':	displayName = 'tab index';		break;
			}
			cmn.log ( sW, '   key: ' + key + '  value: ' + value );
			props.push ( { property: key, value: value, displayName: displayName } );
		}
		return props;
	}	//	InputData.prototype.listProperties()

//	InputData.prototype.setProperty = function ( name, value ) {
	function InputData_setProperty ( name, value ) {
		var sW = serviceId + ' InputData.prototype.setProperty()';
		var rtn = uCD.setProperty ( this, name, value );
		if ( rtn )
			return rtn;
		if ( name === 'execute' ) {
			this[name] = value;
		}
		var n, g = d3.select ( '#' + this.eleId );
		if ( ['border', 'ff', 'fs', 'textAlign'].indexOf ( name ) >= 0 ) {
			if ( name === 'fs' ) {
				n = Number ( value );
				if ( n !== n ) { 	//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
					return 1; }
				this[name] = n; }
			else {
				this[name] = value; }
			g.select ( 'input' )
				.attr ( 'style',  function ( d: any, i ) { 
					return   'width:' + d.w + 'px; height:' + d.h + 'px; '
						   + 'border: ' + d.border + '; '
						   + 'font-family: ' + d.ff + '; '
						   + 'font-size: ' + d.fs + 'px; '
						   + 'text-align: ' + d.textAlign + ';';
				} );
			return 1;
		}
		if ( name === 'inputType' ) {
			this[name] = value;
			g.select ( 'input' )
				.attr ( 'type',  function ( d: any, i ) { 
					return d.inputType;
				} );
			return 1;
		}
		if ( name === 'step' ) {
			n = Number ( value );
			if ( n !== n ) { 	//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
				return 1; }
			this[name] = n; 
			g.select ( 'input' )
				.attr ( 'step',  function ( d: any, i ) { 
					return d.step;
				} );
			return 1;
		}
		if ( name === 'tabIndex' ) {
			n = Number ( value );
			if ( n !== n ) { 	//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
				this[name] = '';
				g.select ( 'input' )
					.attr ( 'tabIndex',  '' );
				return 1; }
			this[name] = n; 
			g.select ( 'input' )
				.attr ( 'tabIndex',  ( d: any ) => d.tabIndex );
			return 1;
		}
		return 0;
	}	//	InputData.prototype.setProperty()

	function InputData_focus() {
	//	var sW = serviceId + ' InputData.prototype.focus()';
		(<HTMLElement>d3.select ( '#' + this.eleId + '-input' ).node()).focus();
	}	//	InputData.prototype.focus()

	function InputData_getText() {
	//	var sW = serviceId + ' InputData.prototype.getText()';
		let s = d3.select ( '#' + this.eleId + '-input' );
		let n = s.node();
		if ( n ) {
			return (<HTMLInputElement>n).value; }
		return '';
	}	//	InputData.prototype.getText()

	function InputData_setText ( text ) {
	//	var sW = serviceId + ' InputData.prototype.setText()';
		this.value = text;
		let s = d3.select ( '#' + this.eleId + '-input' );
		let n = s.node();
		if ( n ) {
			(<HTMLInputElement>n).value = text; }
	}	//	InputData.prototype.setText()

	function InputData_setNumber ( n ) {
		var sW = serviceId + ' InputData.prototype.setNumber()';
		cmn.log ( sW );
		let f    = this.decPlaces * 10;
		let text = '' + Math.round ( n * f ) / f;
		this.setText ( text );
	}	//	InputData.prototype.setNumber()

	svc.createInputData = function ( o ) {

	//	if ( InputData.prototype.constructor.name === 'InputData' ) {
	//		//	Do this once, here to avoid cir ref issue
			InputData.prototype = uCD.newControlData();
			InputData.prototype.constructor = InputData;
			InputData.prototype.listProperties = InputData_listProperties;
			InputData.prototype.focus = InputData_focus;
			InputData.prototype.getText = InputData_getText;
			InputData.prototype.setText = InputData_setText;
			InputData.prototype.setNumber = InputData_setNumber;
			InputData.prototype.setProperty = InputData_setProperty;
	//	}

		return new InputData ( o );
	};	//	svc.createInputData()

	svc.defineInput = function ( panel ) {
		var sW = serviceId + ' defineInput()';
		var newInput = null;
		var s = panel.data.base.selectAll ( '#' + panel.data.eleId + '-base' + ' > g' );
	//	cmn.log ( sW, '  s length: ' + s._groups[0].length );

		var ctrlEles = s
			.data ( panel.data.childData.data, function ( d ) { 
					return d.id || (d.id = ++panel.data.childData.nextId); 
			} )
			.enter()
			.each ( function ( d ) { 
			//	cmn.log ( 'defineInput() - g - new data: ' + d.name ); 
				newInput  = new InputData ( d );
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
			.on ( 'click',     click );

		ctrlEles.append ( 'g' )
			.attr ( 'id',          function ( d, i ) { return d.eleId + '-foreignobject'; } )
				.attr ( 'transform', 'translate(0.5,0.5)' )
			.append ( 'foreignObject' )
				.attr ( 'id',          function ( d, i ) { return d.eleId + '-text'; } )
				.attr ( 'x', 0 )
				.attr ( 'y', 0 )
				//	<input> control disappears when scrolling to left - its a w, h issue with
				//	the <foreignObject>.  See project where this was debugged in -
				//		\Dign\OT\VSCode\WebPage
			//	.attr ( 'width',  function ( d, i ) { return d.w; } )
			//	.attr ( 'height', function ( d, i ) { return d.h; } )
				//	w + 4 (padding top, bottom) + 2 (border top, bottom)
				.attr ( 'width',  d => { return (d.w + 6) + 'px'; } )
				//	h + 2 (border top, bottom)
				.attr ( 'height', d => { return (d.h + 2) + 'px'; } )
				.append ( 'xhtml:body' )
					.style ( 'font', '12px "consolas"' )
					.html ( function ( d, i ) {
						return '<input '
								+  'id="' + d.eleId + '-input" '
								+  'type="' + d.inputType + '" '
								+  'tabIndex="' + d.tabIndex + '" '
								+  'step="' + d.step + '" '
								+  'autocomplete="off" '
								+  'autocorrect="off" '
								+  'spellcheck="false" '
								+  'class="' + d.class + '" '
								+  'style="width:' + d.w + 'px; height:' + d.h + 'px; border:' + d.border + '; font-family:' + d.ff + '; font-size:' + d.fs + 'px; text-align:' + d.textAlign + ';" '
								+  'value="' + d.value + '"></input>';
					} )
					.on ( 'input',    onInput )				//	fires on any change
					.on ( 'change',   onChange );			//	fires when focus lost or on Enter key

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

		ctrlEles.select ( 'input' ).node().addEventListener ( 'focus', onFocus );

		return newInput;
	};	//	svc.defineInput()

	return svc;

})();
