
//  app/partials/udui/udui-textarea-a.js

import * as d3 		from 'd3';

//	Based on (possibly much like) udui-input-b.js.

import { cmn }		from '../common';
import { uc } 		from './udui-common';
import { uCD } 		from './udui-control-data-a';
import uBoards	 	from './udui-boards-a';


export var uEditor = (function() { 

	'use strict';

	var serviceId = 'uduiEditorA';

	/* jshint validthis: true */

	var svc: any = {};


	function onInput ( d, i, ele ) {
		var sW = serviceId + ' onInput()';
		//	Called when textarea's text changes - key press, delete, paste, etc..
	//	var textareaEle = ele[i].children[0];
	//	cmn.log ( sW, ' eleId: ' + d.eleId + ' value: ' + textareaEle.value );
		var textareaEle = ele[i].children[0];
		d.value = textareaEle.value;
		if ( d.inputCB ) {
			d.inputCB ( d, i, ele ); }
	}	//	onInput()

	function onChange ( d, i, ele ) {
		var sW = serviceId + ' onChange()';
		cmn.log ( sW );
		//	Called when focus is lost or when Enter key is pressed.
		var textareaEle = ele[i].children[0];
		d.value = textareaEle.value;
		if ( d.changeCB ) {
			d.changeCB ( d ); }
	}	//	onChange()

	function mouseOver ( d, i, ele ) {
	//	cmn.log ( serviceId + ' mouseOver()' );
		if ( ! d.hasBorder ) {
			let clses  = 'u34-editor-foreignobject';
				clses += ' u34-editor-foreignobject-with-border'; 
			d3.select ( '#' + d.eleId )
				.select ( 'foreignObject' )
					.attr ( 'class', clses ); }
	}	//	mouseOver()

	function mouseLeave ( d, i, ele ) {
	//	cmn.log ( serviceId + ' mouseLeave()' );
		if ( ! d.hasBorder ) {
			let clses  = 'u34-editor-foreignobject';
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

	//	Editor Move
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

	//	Editor Size
	//
	function sized2 ( d, g, dx, dy ) {
		var sW = serviceId + ' sized2()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   dx y: ' + dx + ' ' + dy );
		d.w += dx;
		d.h += dy;

		g.select ( 'foreignObject' )
			.attr ( 'width',  d =>  d.w + 8 )
			.attr ( 'height', d =>  d.h + 2 );

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
		return d.w - uc.SIZE_HANDLE_WIDTH + (4 + 2);
	}	//	sizeX()

	function sizeY ( d ) {
		//	2 		? 	It just works.
		return d.h - uc.SIZE_HANDLE_HEIGHT + 2;
	}	//	sizeY()

	function Editor ( data ) {
		this.data = data;
	}

	function EditorData ( o ) {
	//	o.x += uc.OFFS_4_1_PIX_LINE;
	//	o.y += uc.OFFS_4_1_PIX_LINE;

		//	Initialize the "base" of this object, ControlData -
		o.type      = uc.TYPE_EDITOR;
		o.hasBorder = uc.isBoolean ( o.hasBorder ) ? o.hasBorder 
												   : false;
		o.class     = uc.isDefined ( o.class )     ? o.class
												   : 'u34-textarea';
		uCD.callControlData ( this, o );


		//	Properties unique to this control -
		this.bVertSB	  = uc.isBoolean ( o.bVertSB ) ? o.bVertSB : true;

		this.value = uc.isString ( o.value ) ? o.value : 'Editor';

		this.inputCB      = uc.isFunction ( o.inputCB )      ? o.inputCB      
															 : null;
		this.changeCB     = uc.isFunction ( o.changeCB )     ? o.changeCB     
															 : null;
		this.shiftClickCB = uc.isFunction ( o.shiftClickCB ) ? o.shiftClickCB 
															 : null;
		this.onProperties = uc.isFunction ( o.onProperties ) ? o.onProperties 
															 : null;
		this.ff   = uc.isString ( o.ff ) ? o.ff : 'verdana';	//	font family
		let ff = this.ff.toLowerCase();
		if ( ff === 'consolas' ) {
			this.ff = 'courier new'; }
		
		this.fs   = uc.isNumber ( o.fs ) ? o.fs : 10;			//	size, pixels

		this.markdown = true;		//	For now. 

		this.letterSpacing = uc.isNumber ( o.letterSpacing ) ? o.letterSpacing
															 : 0;
		this.lineHeight    = uc.isNumber ( o.lineHeight )    ? o.lineHeight
															 : 0;

		this.classText = 'u34-button-text';

		this.content = { y:		0,
						 h:		0 };

		//	Override some "base" properties -
		this.onSize  = sized;
		this.onSize2 = sized2;
		this.onMove  = moved;
		this.onMouseOver  = mouseOver;
		this.onMouseLeave = mouseLeave;
	//	this.onVScroll = vscrolled;

	}	//	EditorData()


//	EditorData.prototype = uCD.newControlData();
//	EditorData.prototype.constructor = EditorData;
//	See createEditorData().


	function EditorData_listProperties() {
		var sW = serviceId + ' EditorData.prototype.listProperties()';
		var whiteList = [ 'ff', 'fs', 'letterSpacing', 'lineHeight', 
						  'hasBorder' ];
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
				case 'ff': 				displayName = 'font';			break;
				case 'fs': 				displayName = 'font size';		break;
				case 'letterSpacing':	displayName = 'letter spacing';	break;
				case 'lineHeight':		displayName = 'line height';	break;
			}
			cmn.log ( sW, '   key: ' + key + '  value: ' + value );
			props.push ( { property: key, value: value, displayName: displayName } );
		}
		return props;
	}	//	EditorData.prototype.listProperties()

//	EditorData.prototype.setProperty = function ( name, value ) {
	function EditorData_setProperty ( name, value ) {
		var sW = serviceId + ' EditorData.prototype.setProperty()';
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
			let clses = 'u34-editor-foreignobject';
			if ( this[name] ) {
				clses += ' u34-editor-foreignobject-with-border'; }
			g.select ( 'foreignObject' )
				.attr ( 'class', clses );
			return 1; }
		if ( name === 'text' ) {
			EditorData_setText.call ( this, value );
			return 1; }
		if ( name === 'ff' ) {
			this[name] = value;
			this.setStyle();
			return 1; }
		if ( name === 'fs' ) {
			n = Number ( value );
			if ( n !== n ) 					//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
				return;
			this[name] = n;
			this.setStyle();
			return 1; }
		if ( name === 'letterSpacing' ) {
			n = Number ( value );
			if ( n !== n ) 					//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
				return;
			this[name] = n;
			this.setStyle();
			return 1; }
		if ( name === 'lineHeight' ) {
			n = Number ( value );
			if ( n !== n ) 					//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
				return;
			this[name] = n;
			this.setStyle();
			return 1; }

		return 0;
	}	//	EditorData.prototype.setProperty()

	function EditorData_setStyle() {
		let d     = this;
		let lineH = d.lineHeight > 0 ? d.lineHeight + 'px' : 'normal';

	//	let style = 'width:' + d.w + 'px; '
		//		  + 'height:' + d.h + 'px; '
		//		  + 'font-family: ' + d.ff + '; '
		//		  + 'font-size: ' + d.fs + 'px; '
		//		  + 'letter-spacing: ' + d.letterSpacing + 'px; '
		//		  + 'line-height: ' + lineH + ';';
		let style = 'width:' + (d.w - 14) + 'px; '
				  + 'font-family: ' + d.ff + '; '
				  + 'font-size: ' + d.fs + 'px; '
				  + 'letter-spacing: ' + d.letterSpacing + 'px; '
				  + 'line-height: ' + lineH + ';';
		if ( this.markdown ) {
			d3.select ( '#' + d.eleId + '-markdown-container' )
				.attr ( 'style',  style ); }
		else {
			d3.select ( '#' + d.eleId + '-textarea' )
				.attr ( 'style',  style ); }
	}	//	EditorData_setStyle()

	function EditorData_setText ( text ) {
	//	var sW = serviceId + ' EditorData_setText()';
		this.value = text;
	//	d3.select ( '#' + this.eleId + '-textarea' )
	//		.html ( text );
		this.setContent();
	}	//	EditorData_setText()

	function EditorData_setContent() {
		const sW = serviceId + ' setContent()';
		let d = this;
		let e = window.document.getElementById ( '' + d.eleId + '-body' );

		//	Trying to get the Monaco Editor to work here.
		//	e is an iframe. Need the body ...
		let b = (<HTMLObjectElement>e).contentDocument.getElementsByTagName ( 'body' )[0];

		if ( b.children[0] ) {
			b.removeChild ( b.children[0] ); }
		let lineH = d.lineHeight > 0 ? d.lineHeight + 'px' : 'normal';
		if ( ! d.markdown ) {
			cmn.error ( sW, 'not an editor' ); }

		b.setAttribute ( 'style', 'margin: 0px' );

		//	Create a node (a <div>) to render the markdown in otherwise
		//	React will complain and it just won't work when displaying
		//	the raw text (in a <textarea>) again.
	//	let div  = window.document.createElement ( 'div' );
		let div  = (<HTMLObjectElement>e).contentDocument.createElement ( 'div' );
		let node = b.insertBefore ( div, null );
		node.setAttribute ( 'id', '' + d.eleId + '-markdown-container' );
		node.setAttribute ( 'class', 'rr-help-markdown-container' );
		//	Don't need height.
	//	node.setAttribute ( 'style', 'width:' + (d.w - 14) + 'px; '
		node.setAttribute ( 'style', 'width: 100%; '
								   + 'height: 100%; '
								   + 'font-family: ' + d.ff + '; '
								   + 'font-size: ' + d.fs + 'px; '
						   + 'letter-spacing: ' + d.letterSpacing + 'px; '
								   + 'line-height: ' + lineH + ';' );
		//	Editor container.
		let n = node;
		div  = (<HTMLObjectElement>e).contentDocument.createElement ( 'div' );
		node = n.insertBefore ( div, null );
		node.setAttribute ( 'id', '' + d.eleId + '-editor-div' );
		node.setAttribute ( 'class', 'u34-editor-div' );
		node.setAttribute ( 'style', 'width: 100%; '
								   + 'height: 100%;' );
	//	node.innerHTML = d.value; 
				
		d.content.y = 0;
	//	updateSclrs ( d );

	//	d3.select ( '#' + d.eleId + '-foreignobject' )
	//		.select ( 'foreignObject' )
	//			.attr ( 'y',	  0 )
	//			.attr ( 'height', d =>  d.content.h ); 
		this.contentNode = node;
	}	//	EditorData_setContent()

	function EditorData_getContainer() {
		const sW = serviceId + ' getContainer()';
		cmn.log ( sW );
	//	return d3.select ( '#' + this.eleId + '-editor-div' ).node();
		return this.contentNode;
	}	//	EditorData_getContainer()

	svc.createEditorData = function ( o ) {

	//	if ( EditorData.prototype.constructor.name === 'EditorData' ) {
	//		//	Do this once, here to avoid cir ref issue
			EditorData.prototype = uCD.newControlData();
			EditorData.prototype.constructor = EditorData;
			EditorData.prototype.listProperties = EditorData_listProperties;
			EditorData.prototype.setStyle = EditorData_setStyle;
			EditorData.prototype.setText = EditorData_setText;
			EditorData.prototype.setProperty = EditorData_setProperty;
			EditorData.prototype.setContent = EditorData_setContent;
			EditorData.prototype.getContainer = EditorData_getContainer;
	//	}

		return new EditorData ( o );
	};	//	svc.createEditorData()

	svc.defineEditor = function ( panel ) {
		var sW = serviceId + ' defineEditor()';
		var newEditor = null;
		var s = panel.data.base.selectAll ( '#' + panel.data.eleId + '-base' + ' > g' );
		cmn.log ( sW, '  s length: ' + s._groups[0].length );

		var ctrlEles = s
			.data ( panel.data.childData.data, function ( d ) { 
					return d.id || (d.id = ++panel.data.childData.nextId); 
			} )
			.enter()
			.each ( function ( d ) { 
				cmn.log ( sW, ' - g - new data: ' + d.name ); 
				newEditor  = new EditorData ( d );
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
					return d.w + 8; } )
				.attr ( 'height', function ( d, i ) { 
					return d.h + 2; } )
				.attr ( 'class',  d => 'u34-editor-foreignobject'
								  	   + (d.hasBorder ? 
									   ' u34-editor-foreignobject-with-border'
									   : '') )
			//	.append ( 'xhtml:body' )
			//		.attr ( 'id', d => d.eleId + '-body' )
			//		.html ( function ( d, i ) {
			//			bodyD = d;
			//			return '';
			//		} )
				.append ( 'xhtml:iframe' )
					.attr ( 'id', d => d.eleId + '-body' )
					.attr ( 'border', 'none' )
					.attr ( 'width', '100%' )
					.attr ( 'height', '100%' )
					.html ( function ( d, i ) {
						bodyD = d;
						return '';
					} )
					.on ( 'input',    onInput )				//	fires on any change
					.on ( 'change',   onChange );			//	fires when focus lost or on Enter key

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

		return newEditor;
	};	//	svc.defineEditor()

	return svc;
})();

