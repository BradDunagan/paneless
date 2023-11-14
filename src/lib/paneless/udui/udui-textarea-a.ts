
//	app/udui/udui-textarea-a.ts

import * as d3 		from 'd3';

//	Based on (possibly much like) udui-input-b.ts.
//	But more.

import { cmn }		from '../common';
import { uc } 		from './udui-common';
import { uCD } 		from './udui-control-data-a';


export var uTextarea = (function() { 

	'use strict';

	var serviceId = 'uduiTextareaA';

	/* jshint validthis: true */

	var svc: any = {};


	function onInput ( evt, d ) {
		var sW = serviceId + ' onInput()';
		//	Called when textarea's text changes - key press, delete, paste, etc..
	//	cmn.log ( sW, ' eleId: ' + d.eleId + ' value: ' + textareaEle.value );
		var textareaEle = evt.target.children[0];
		d.value = textareaEle.value;
		if ( d.inputCB ) {
			d.inputCB ( evt, d ); }
	}	//	onInput()

	function onChange ( evt, d ) {
		var sW = serviceId + ' onChange()';
	//	cmn.log ( sW );
		//	Called when focus is lost or when Enter key is pressed.
		var textareaEle = evt.target.children[0];
		d.value = textareaEle.value;
		if ( d.changeCB ) {
			d.changeCB ( d ); }
	}	//	onChange()

	function mouseOver ( evt, d ) {
	//	cmn.log ( serviceId + ' mouseOver()' );
		if ( (! d.hasBorder) && (! d.markdown) ) {
			d3.select ( '#' + d.eleId + '-textarea' )
				.attr ( 'class', d.class + ' u34-textarea-border' ); }
	}	//	mouseOver()

	function mouseLeave ( evt, d ) {
	//	cmn.log ( serviceId + ' mouseLeave()' );
		if ( (! d.hasBorder) && (! d.markdown) ) {
			d3.select ( '#' + d.eleId + '-textarea' )
				.attr ( 'class', d.class ); }
	}	//	mouseLeave()

	function mousedown ( evt, d ) {
		var sW = serviceId + ' mousedown()';
	//	cmn.log ( sW, 'Name: ' + d.name );
	//	evt.stopPropagation();
	}	//	mousedown()

	function mousemove ( evt, d ) {
//		var sW = serviceId + ' mousemove()';
//		cmn.log ( sW, 'Name: ' + d.name + '  event.altKey: ' + event.altKey );
		evt.stopPropagation();
	}	//	mousemove()

	function mouseup ( evt, d ) {
		var sW = serviceId + ' mouseup()';
	//	cmn.log ( sW, 'Name: ' + d.name );
	//	evt.stopPropagation();
	}	//	mouseup()

	function click ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' click()';
	//	cmn.log ( sW, 'Name: ' + d.name );
		evt.stopPropagation();
		if ( evt.shiftKey && uc.isFunction ( d.shiftClickCB ) ) {
			let otherMenuItems = null;
			d.shiftClickCB ( evt, d, otherMenuItems ); 
			return; }
	}	//	click()

	//	Textarea Move
	//
	function moved ( d, i, ele, x, y ) {
		var sW = serviceId + ' moved()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   x y: ' + x + ' ' + y );
		d3.select ( ele.parentNode )
			.attr ( 'transform', function ( d: any, i ) { 
				return 'translate(' + (d.x = x) + ',' + (d.y = y) + ')'; 
			} );
		d.parentPanel.updateSclrs();
	}	//	moved()

	//	Textarea Size
	//
	function sized2 ( d, g, dx, dy ) {
		var sW = serviceId + ' sized2()';
	//	cmn.log ( sW, ' d.name: ' + d.name + '   dx y: ' + dx + ' ' + dy );
		d.w += dx;
		d.h += dy;

		g.select ( 'foreignObject' )
		//	.attr ( 'width',  d =>  d.w - 8 )
			.attr ( 'width',  d =>  d.w >= 8 ? d.w - 8 : 0 )
		//	.attr ( 'height', d =>  d.h + 2 );
		//	.attr ( 'height', d =>  d.content.h + 2 - d.y );
		//	d.content.h ... does not work for in panel-code/help-2.js. Going
		//	back ... and subtracting d.content.y.
			.attr ( 'height', d =>  d.h + 2 - d.content.y );

		d.setStyle();

		g.select ( '#' + d.eleId + '-size' )
			.attr ( 'x',      sizeX )
			.attr ( 'y',      sizeY );
		d3.select ( '#cp-' + d.eleId + '-rect' )
			.attr ( 'width',  function ( d: any, i ) { return d.w += dx; } )
			.attr ( 'height', function ( d: any, i ) { return d.h += dy; } );
		g.select ( '#' + d.eleId + '-vsclr-track' )
			.attr ( 'x',      uCD.vsclrX )
			.attr ( 'y',      0 )
			.attr ( 'width',  uc.VERT_GEN_SCROLL_WIDTH )
			.attr ( 'height', d => d.h );
		updateSclrs ( d );
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

	function onWheel( evt, d ) {
		const sW = serviceId + ' onWheel()';
		evt.preventDefault();
		let dx0 = evt.deltaX;
		let dy0 = evt.deltaY;
		let dx = dx0;
		let dy = dy0;
		if ( Math.abs ( dx ) > 10 ) {
			dx = Math.round ( dx0 / 5 ); }
		if ( Math.abs ( dy ) > 10 ) {
			dy = Math.round ( dy0 / 5 ); }
	//	cmn.log ( sW, '  dx0 dx ' + dx0 + ' ' + dx
	//				+ '  dy0 dy ' + dy0 + ' ' + dy );
		
		var lg = d3.select ( '#' + d.eleId + '-items' );
		if ( d.markdown ) {
			scroll_v ( d, 0, [lg.node()], -dy ); }
		else {
			scroll_v ( d, 0, [lg.node()], Math.round ( -dy / 1 ) ); }

	//	cmn.log ( sW, '   content.y ' + d.content.y );
	}	//	onWheel()

	function getContentH ( sW, d ) {
		let contents = d3.select ( '#' + d.eleId + '-markdown-container' )
							.select ( 'div' ).node();
		let h = 0;
		let textarea = null;
		if ( contents ) {
			h = (<HTMLElement>contents).offsetHeight + 16; }
		else {
			textarea = document.getElementById ( d.eleId + '-textarea' );
			if ( textarea ) {
			//	let lineH = d.lineHeight > 0 ? d.lineHeight  
			//								 : d.fs + 1;	//	guesstimate
			//	h = textarea.scrollHeight / lineH; }
			 	//	+ 2 (guesstimate) to display a pixle line of white space 
				//	below the last line.
				h = textarea.scrollHeight + 2; }
			else {
				cmn.error ( sW, 'neither markdown nor textarea found' ); 
				return 0; } }	
		return h;
	}	//	getContentH()

	function scroll_v ( d, i, ele, dy ) {
		let	sW = serviceId + ' scroll_v()';

		let contents = d3.select ( '#' + d.eleId + '-markdown-container' )
							.select ( 'div' ).node();
	//	let textarea = null;
	//	if ( contents ) {
	//		d.content.h = (<HTMLElement>contents).offsetHeight + 16; }
	//	else {
	//		textarea = document.getElementById ( d.eleId + '-textarea' );
	//		if ( textarea ) {
	//			let lineH = d.lineHeight > 0 ? d.lineHeight  
	//										 : d.fs + 1;	//	guesstimate
	//			d.content.h = textarea.scrollHeight / lineH; }
	//		else {
	//			cmn.error ( sW, 'neither markdown nor textarea found' ); } }	
		d.content.h = getContentH ( sW, d );

		let minY   = d.h - d.content.h;
	//	if ( minY >= 0 ) {
	//		return; }
		if ( minY > 0 ) { 
			minY = 0; }
		
		let y;
	//	y = d.content.y +  dy;
	//		d.content.y += dy;
//		let dY = parseInt ( ((dy * d.content.h) / d.h).toFixed ( 0 ) );
		//	2022-Oct-02
		let dY = dy;
		y = d.content.y +  dY;
			d.content.y += dY;
		
		if ( y > 0 ) { 
			y = d.content.y = 0; }
		
		if ( y < minY ) {
			y = d.content.y = minY; }

		d3.select ( '#cp-' + d.eleId + '-rect' )
			.attr ( 'y', function ( d, i ) { return -y; } );
		
		if ( d.markdown ) {	//	markdown/html
			d3.select ( '#' + d.eleId )
				.select ( 'foreignObject' )
					.attr ( 'y',	  d =>  y )
					.attr ( 'height', ( d: any ) =>  d.h + 2 - y ); }
		else {
			let textarea = document.getElementById ( d.eleId + '-textarea' );
			if ( ! textarea ) {
				cmn.error ( sW, 'not markdown and no textearea' ); }
			else {
				textarea.scroll ( 0, -y ); } }

	//	cmn.log ( sW, '   dy: ' + dy 
	//				+ '   dY: ' + dY
	//				+ '   content.h: ' + d.content.h
	//				+ '   content.y: ' + d.content.y
	//				+ '   y: ' + y
	//				+ '   d.h + 2 - y: ' + (d.h + 2 - y) );
		updateSclrs ( d );
	}	//	scroll_v()

	function updateSclrs ( d ) {
		let	sW = serviceId + ' updateSclrs()';
	//	let contents = d3.select ( '#' + d.eleId + '-markdown-container' )
	//						.select ( 'div' ).node();
	//	let textarea = null;
	//	if ( contents ) {
	//		d.content.h = (<HTMLElement>contents).offsetHeight + 16; }
	//	else {
	//		textarea = document.getElementById ( d.eleId + '-textarea' );
	//		if ( textarea ) {
	//			d.content.h = textarea.scrollHeight; }
	//		else {
	//			cmn.error ( sW, 'neither markdown nor textarea found' ); } }	
		d.content.h = getContentH ( sW, d );

		let o: any = { minY:	d.content.y,
					   maxY:	d.content.y + d.content.h };
			o.eY = o.maxY - o.minY;

		let dy = (d.h - d.content.y) - o.eY;
	//	cmn.log ( sW, '   d.h ' + d.h 
	//				+ '   d.content.y ' + d.content.y
	//				+ '   o.eY ' + o.eY
	//				+ '   dy ' + dy );
		if ( (d.content.y < 0) && (dy > 0) ) {
			let lg = d3.select ( '#' + d.eleId + '-items' );
			scroll_v ( d, 0, [lg.node()], dy );
			return; }

		d.updateVsclr ( { y: d.content.y }, o ); 
	};	//	updateSclrs()

	function vscrolled ( d, i, ele, dx, dy ) {
		var sW = serviceId + ' vscrolled()';
		
		//	Something like onWheel().
		var lg = d3.select ( '#' + d.eleId + '-items' );
	//	scroll_v ( d, 0, [lg.node()], -dy );
		//	2022-Oct-02
		let dY = parseInt ( ((dy * d.content.h) / d.h).toFixed ( 0 ) );
		scroll_v ( d, 0, [lg.node()], -dY );

	//	cmn.log ( sW, '   content.y ' + d.content.y );
	}	//	vscrolled()

	function Textarea ( data ) {
		this.data = data;
	}

	function TextareaData ( o ) {
	//	o.x += uc.OFFS_4_1_PIX_LINE;
	//	o.y += uc.OFFS_4_1_PIX_LINE;

		//	Initialize the "base" of this object, ControlData -
		o.type      = uc.TYPE_TEXTAREA;
		o.hasBorder = uc.isBoolean ( o.hasBorder ) ? o.hasBorder 
												   : false;
		o.class     = uc.isDefined ( o.class )     ? o.class
												   : 'u34-textarea';
		uCD.callControlData ( this, o );


		//	Properties unique to this control -
		this.bVertSB	  = uc.isBoolean ( o.bVertSB ) ? o.bVertSB : true;

		this.value = uc.isString ( o.value ) ? o.value : 'Text in a textarea.';

		this.inputCB      = uc.isFunction ( o.inputCB )      ? o.inputCB      
															 : null;
		this.changeCB     = uc.isFunction ( o.changeCB )     ? o.changeCB     
															 : null;
		this.shiftClickCB = uc.isFunction ( o.shiftClickCB ) ? o.shiftClickCB 
															 : null;
		this.anchorCB	  = null;
		
		this.onProperties = uc.isFunction ( o.onProperties ) ? o.onProperties 
															 : null;
		this.ff   = uc.isString ( o.ff ) ? o.ff : 'verdana';	//	font family
		this.fs   = uc.isNumber ( o.fs ) ? o.fs : 10;			//	size, pixels
		this.markdown = uc.isBoolean ( o.markdown ) ? o.markdown : false;
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
		this.onClick	  = click;			//	after focus
		this.onVScroll = vscrolled;

	}	//	TextareaData()


//	TextareaData.prototype = uCD.newControlData();
//	TextareaData.prototype.constructor = TextareaData;
//	See createTextareaData().


	function TextareaData_listProperties() {
		var sW = serviceId + ' TextareaData.prototype.listProperties()';
		var whiteList = [ 'ff', 'fs', 'letterSpacing', 'lineHeight', 
						  'hasBorder', 'markdown' ];
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
				case 'markdown':		displayName = 'html';			break;
				case 'letterSpacing':	displayName = 'letter spacing';	break;
				case 'lineHeight':		displayName = 'line height';	break;
			}
		//	cmn.log ( sW, '   key: ' + key + '  value: ' + value );
			props.push ( { property: key, value: value, displayName: displayName } );
		}
		return props;
	}	//	TextareaData.prototype.listProperties()

//	TextareaData.prototype.setProperty = function ( name, value ) {
	function TextareaData_setProperty ( name, value ) {
		var sW = serviceId + ' TextareaData.prototype.setProperty()';
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
			let clses = this.class;
			if ( this[name] ) {
				clses += ' ' + 'u34-textarea-border'; }
			d3.select ( '#' + this.eleId + '-textarea' )
				.attr ( 'class', clses );
			return 1; }
		if ( name === 'text' ) {
			TextareaData_setText.call ( this, value );
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
		if ( name === 'markdown' ) {
			n = Number ( value );
			if ( n !== n ) {				//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
				if ( typeof value === 'string' ) {
					value = (value === 'true'); }
				else {
					value = false; } }
			else {
				value = (n !== 0); }
			let prev = this[name];
			this[name] = !! value;
			if ( this[name] !== prev ) { 
			//	TextareaData_setContent.call ( this ); } }
				this.setContent(); } }

		return 0;
	}	//	TextareaData.prototype.setProperty()

	function TextareaData_setStyle() {
		let d     = this;
		let lineH = d.lineHeight > 0 ? d.lineHeight + 'px' : 'normal';

		//	2022-Aug-25		On padding -
		//	For DlgGroups the padding specified in d.class (.u34-textarea) 
		//	works better.
	//	let style = 'width:' + (d.w - 14) + 'px; '
		let style = 'font-family: ' + d.ff + '; '
				  + 'font-size: ' + d.fs + 'px; '
				  + 'letter-spacing: ' + d.letterSpacing + 'px; '
				  + 'line-height: ' + lineH + ';'
		//		  + 'padding: 0px; '
				  + 'resize: none;';

		if ( this.markdown ) {
			d3.select ( '#' + d.eleId + '-markdown-container' )
				.attr ( 'style',  style ); }
		else {
			//	Width adjustments -
			//		-8 for the foreign object.
			//		-6 for left, right padding and border.
			style =   'width:'  + (d.w - 8 - 6) + 'px; '
					+ 'height:' +  d.h          + 'px; '
					+ style;
			d3.select ( '#' + d.eleId + '-textarea' )
				.attr ( 'style',  style ); }
	}	//	TextareaData_setStyle()

	function TextareaData_setText ( text, opts?: any ) {
	//	var sW = serviceId + ' TextareaData_setText()';
		this.value = text;
		this.setContent ( opts );
	}	//	TextareaData_setText()


	class RRTopicAnchor extends HTMLElement {
		control:	any;
		constructor() {
			super();

			this.addEventListener ( 'click', this.anchorClick );

			this.anchorClick	= this.anchorClick.bind ( this );
			this.setControl		= this.setControl.bind ( this );

			
			this.control 	= null;
			this.setControl ( this.parentElement );
		}	//	constructor()

		setControl ( parentElement ) {
			const sW = 'RRTopicAnchor setControl()';
			if ( ! parentElement ) {
				return; }
			if ( parentElement.tagName === 'BODY' ) {
				let sel = d3.select ( '#' + parentElement.id );
				if ( sel && ! sel.empty() ) {
	//				cmn.log ( sW, 'got it' );
					this.control = sel.data()[0]; } 
				return; }
			this.setControl ( parentElement.parentElement );
		}

		anchorClick ( e ) {
			const sW = 'RRTopicAnchor anchorClick()';
			if ( ! this.control ) {
				cmn.error ( sW, 'control is not set' ); 
				return; }
	//		cmn.log ( sW,   this.control.eleId + ' ' 
	//					  + this.control.name + ' ' 
	//					  + this.dataset.ref );
			let cb = this.control.anchorCB;
			if ( ! cmn.isFunction ( cb ) ) {
				cmn.error ( sW, 'callback is not set' );
				return; }
			cb ( { event:		'click',
				   reference:	this.dataset.ref } );
		}	//	click();
	}	//	class	RRTopicAnchor

	window.customElements.define ( 'rr-topic-anchor', RRTopicAnchor );

	function TextareaData_setContent ( opts?: any ) {
		const sW = serviceId + ' TextareaData_setContent()';
		let d = this;
		let e = window.document.getElementById ( '' + d.eleId + '-body' );
		if ( e.children[0] ) {
			e.removeChild ( e.children[0] ); }
		let lineH = d.lineHeight > 0 ? d.lineHeight + 'px' : 'normal';
		if ( d.markdown ) {
			//	Create a node (a <div>) to render the markdown in.  Otherwise
			//	React will complain and it just won't work when displaying
			//	the raw text (in a <textarea>) again.
			let div  = window.document.createElement ( 'div' );
			let node = e.insertBefore ( div, null );
			node.setAttribute ( 'id', '' + d.eleId + '-markdown-container' );
			node.setAttribute ( 'class', 'rr-help-markdown-container' );
			//	Don't need height.
		//	node.setAttribute ( 'style', 'width:' + (d.w - 14) + 'px; '
			//	Nor width.
			node.setAttribute ( 'style', 'font-family: ' + d.ff + '; '
									   + 'font-size: ' + d.fs + 'px; '
							   + 'letter-spacing: ' + d.letterSpacing + 'px; '
									   + 'line-height: ' + lineH + ';' );
		//	render ( compiler ( d.value ), node ); }
		//	render ( <BoundedMarkdown text = { d.value } />, node ); }
			//	Just do HTML.
			e    = node;
			div  = window.document.createElement ( 'div' );
			node = e.insertBefore ( div, null );
			node.setAttribute ( 'id', '' + d.eleId + '-html-div' );

		//	cmn.error ( sW, 'make-safe/sanitize d.value for innerHTML' );
		//	cmn.error ( sW, 'Use markdown?'); 	//	or
		//	cmn.error ( sW, 'Check d.value with an HTML parser?');
		//	See 
		//		-	checkHtml() in help-edit.svelte 
		//		and 
		//		-	checkHtml() in share-postgres.cjs.

			node.innerHTML = d.value; }
		else {
			//	2022-Aug-25		On padding in style -
			//	For DlgGroups the padding specified in d.class (.u34-textarea) 
			//	works better.
			e.innerHTML = '<textarea '
						+ 'id="' + d.eleId + '-textarea" '
						+ 'autocapitalize="none" '
						+ 'autocomplete="off" '
						+ 'spellcheck="false" '
						+ 'wrap="hard" '
						+ 'class="' + d.class 
									+ (d.hasBorder ? ' u34-textarea-border' 
										 		   : '') + '" '
						+ 'style= "width:' + (d.w - 14) + 'px; '
								+ 'height:' + d.h + 'px; '
								+ 'font-family: ' + d.ff + '; '
								+ 'font-size: ' + d.fs + 'px; '
								+ 'letter-spacing: ' + d.letterSpacing + 'px; '
								+ 'line-height: ' + lineH + '; '
					//			+ 'padding: 0px; '
								+ 'resize: none; '
								+ 'overflow: hidden;">'
						+ d.value 
						+ '</textarea>'; } 
		
		d.content.y = 0;
	//	updateSclrs ( d );
		var lg = d3.select ( '#' + d.eleId + '-items' );
		if ( 	cmn.isObject ( opts )
			 && cmn.isBoolean ( opts.bScrollToBottom ) 
			 && opts.bScrollToBottom ) {
			let ch = getContentH ( sW, d );
			let dy = d.h - ch;
			scroll_v ( d, 0, [lg.node()], dy ); }
		else {
			scroll_v ( d, 0, [lg.node()], 0 ); }


	//	if ( d.markdown ) {
	//		d3.select ( '#' + d.eleId + '-foreignobject' )
	//			.select ( 'foreignObject' )
	//				.attr ( 'y',	  0 )
	//				.attr ( 'height', d =>  d.content.h ); }
	//	d.content.h ... does not work for in panel-code/help-2.js.
	
	}	//	TextareaData_setContent()

	svc.createTextareaData = function ( o ) {

	//	if ( TextareaData.prototype.constructor.name === 'TextareaData' ) {
	//		//	Do this once, here to avoid cir ref issue
			TextareaData.prototype = uCD.newControlData();
			TextareaData.prototype.constructor = TextareaData;
			TextareaData.prototype.listProperties = TextareaData_listProperties;
			TextareaData.prototype.setStyle = TextareaData_setStyle;
			TextareaData.prototype.setText = TextareaData_setText;
			TextareaData.prototype.setProperty = TextareaData_setProperty;
			TextareaData.prototype.setContent = TextareaData_setContent;
	//	}

		return new TextareaData ( o );
	};	//	svc.createTextareaData()

	svc.defineTextarea = function ( panel ) {
		var sW = serviceId + ' defineTextarea()';
		var newTextarea = null;
		var s = panel.data.base.selectAll ( '#' + panel.data.eleId + '-base' + ' > g' );
	//	cmn.log ( sW, '  s length: ' + s._groups[0].length );

		var ctrlEles = s
			.data ( panel.data.childData.data, function ( d ) { 
					return d.id || (d.id = ++panel.data.childData.nextId); 
			} )
			.enter()
			.each ( function ( d ) { 
	//			cmn.log ( sW, ' - g - new data: ' + d.name ); 
				newTextarea  = new TextareaData ( d );
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
			.on ( 'wheel',     onWheel )
		//	.on ( 'click',     click );
			.on ( 'click',     uCD.click );		//	focus

		let bodyD = null;

		ctrlEles.append ( 'g' )
			.attr ( 'id',          function ( d, i ) { return d.eleId + '-foreignobject'; } )
				.attr ( 'transform', 'translate(0.5,0.5)' )
			.append ( 'foreignObject' )
				.attr ( 'id',          function ( d, i ) { return d.eleId + '-text'; } )
				.attr ( 'x', 0 )
				.attr ( 'y', 0 )
			//	.attr ( 'width',  function ( d, i ) { return d.w - 8; } )
			//	.attr ( 'height', function ( d, i ) { return d.h + 2; } )
				.attr ( 'width',  d => d.w >= 8 ? d.w - 8 : 0 )
				.attr ( 'height', d => d.h + 2 )
				.append ( 'xhtml:body' )
					.attr ( 'id', d => d.eleId + '-body' )
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

		uCD.defineScrollers ( ctrlEles );

		return newTextarea;
	};	//	svc.defineTextarea()

	return svc;

})();
