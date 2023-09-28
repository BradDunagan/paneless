
//  app/udui/udui-control-data-a.js

import * as d3 		from 'd3';

import { cmn }		from '../common';
import { uc } 		from './udui-common';
import uBoards  	from './udui-boards-a';

//	On dynamic x, y, w, h -
//
//		w -
//
//			width of container minus n
//
//			right side sticky
//
//		x -
//
//			% of width of container

export var uCD = (function() { 

	'use strict';

	var serviceId = 'uduiControlDataA';

	/* jshint validthis: true */

	var svc: any = {};

	svc.screenPanel = null;

	function verifyRPD ( d ) {
		let rpd = null;
		if ( d.type === uc.TYPE_TABLE_CELL ) {
			rpd = d.tableData.rpd; }
		else {
			rpd = d.rpd ? d.rpd : d; }
		return rpd;
	}	//	verifyRPD()

	function clickDisabled ( evt : PointerEvent, d ) {
		var sW = serviceId + ' clickDisabled()';
		cmn.log ( sW );
		if ( ! evt.shiftKey ) {
			evt.stopPropagation(); }
	}	//	clickDisabled()

	function mouseoverDisabled ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mouseoverDisabled()';
	//	cmn.log ( sW );
		evt.stopPropagation();
	}	//	mouseoverDisabled()

	svc.mouseover = function ( evt:PointerEvent, d: any ) {
		var sW = serviceId + ' mouseover()';
		if ( d.noEdits ) {
			return; }
		var baseD = null;						//	panel base data
		if ( d.type === uc.TYPE_PANEL_BASE ) { baseD = d;  d = d.panelData; }
	//	cmn.log ( sW, ' d.name: ' + d.name + '  evt.altKey: ' + evt.altKey );
		evt.stopPropagation();
		if ( d.onMouseOver ) {
			if ( baseD ) {
				d.onMouseOver ( evt, baseD );
				return;
			}
			d.onMouseOver ( evt, d );
		}
		if ( (! d.hasBorder) && (! baseD) )		//	panels don't/shouldn't have borders when split 
			d3.select ( '#' + this.getAttribute ( 'id' ) + '-rect' )
				.classed ( 'u34-light-border', true );
	};	//	mouseover()

	svc.mouseleave = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mouseleave()';
		if ( d.noEdits ) {
			return; }
		var baseD = null;						//	panel base data
		if ( d.type === uc.TYPE_PANEL_BASE ) { baseD = d;  d = d.panelData; }
//		cmn.log ( sW, ' d.name: ' + d.name + '  evt.altKey: ' + evt.altKey );
	//	evt.stopPropagation();			prevents mouseEnter event elsewhere
		if ( d.onMouseLeave ) {
			if ( baseD ) {
				d.onMouseLeave ( evt, baseD );
				return;
			}
			d.onMouseLeave ( evt, d );
		}
		if (  uc.mouseOp && (uc.mouseOp.downData.eleId === d.eleId) )
			return;
		if ( (! d.hasBorder) && (! baseD) )		//	panels don't/shouldn't have borders when split 
			d3.select ( '#' + this.getAttribute ( 'id' ) + '-rect' )
				.classed ( 'u34-light-border', false );
	};	//	mouseleave()

	svc.mousedown = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mousedown()';
		var baseD = null;						//	panel base data
		if ( d.type === uc.TYPE_PANEL_BASE ) { baseD = d;  d = d.panelData; }
		let tagName = evt.target ? evt.target.tagName : '?';
	//	cmn.log ( sW, ' tagName ' + tagName + ' d.name ' + d.name );
	//	if ( ! d.fillsPanel ) {
	//		evt.stopPropagation(); }

	//	let hostFnc = d.rpd ? d.rpd.hostFnc : d.hostFnc;
	//	hostFnc ( { do:			'click-focus',
	//				ctrlD:		null,
	//				frameAs: 	''             } );
	//	Added svc.click().  Moved this click-focus stuff there.
		
	//	if ( event.altKey ) {
	//
	//		//	If altKey then possibly drag this to a different parent element.
	//		
	//		//	To get the current position of this as a child in the parent element -
	//		//
	//		//		Converting a NodeList to an Array
	//		//		https://developer.mozilla.org/en-US/docs/Web/API/NodeList
	//		//
	//		//		a =  Array.prototype.slice.call ( this.parentElement.childNodes );
	//		//
	//		//		i = a.indexOf ( this );
	//	}
	//	var ebcr = ele[i].getBoundingClientRect();
		if ( tagName !== 'rect' ) {
			return; }
		let ebcr = evt.target.getBoundingClientRect();
		uc.mouseOp = {							//	mouse operation
			downData: 		d,					//	on what data the mouse operation started
			sizing: 		false,
			moving: 		false,
			dragDrop: 		false,
			splitting: 		false,
			scrolling: 		false,
			selecting: 		false,
			hscrolling:		false,
			vscrolling:		false,
			x0: 			evt.pageX,		//	first event
			y0: 			evt.pageY,
			x: 				evt.pageX,		//	current position
			y: 				evt.pageY,
			dx: 			0,						//	change in position
			dy: 			0,
			elex: 			evt.pageX - ebcr.left,
			eley: 			evt.pageY - ebcr.top,

			updateXY: 		function  ( x, y ) {
				this.dx = x - this.x;		this.x = x;
				this.dy = y - this.y;		this.y = y;
			}	
		};

		d.clickdisabled = false;

		if ( d.onMouseDown ) {
			if ( baseD ) {
				d.onMouseDown ( evt, baseD );
				return;
			}
			d.onMouseDown ( evt, d );
		}
	};	//	mousedown()

	svc.mousemove = function( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mousemove()';
		var baseD = null, 				//	panel base data
			pd    = null;				//	panel data of control that fill panel

		if ( evt.ctrlKey ) {	//	2017-Jun-23		possibly a semi-transparent menu ...
			cmn.log ( sW, ' ctrlKey' );
		}

		if ( d.type === uc.TYPE_PANEL_BASE ) { 
			baseD = d;  d = d.panelData; }
		else {
			if ( ! d.fillsPanel ) {
				evt.stopPropagation(); } }
		if ( ! uc.mouseOp ) {
			return; }
		if ( uc.mouseOp.sizing ) {
			return; }
		if ( uc.mouseOp.moving ) {
			return; }
		if ( uc.mouseOp.hscrolling ) {
			return; }
		if ( uc.mouseOp.vscrolling ) {
			return; }
		if ( d.onMouseMove ) {
			if ( baseD ) {
				d.onMouseMove ( evt, baseD );
				return; }
			d.onMouseMove ( evt, d ); }
		else {
			if ( d.fillsPanel && d.parentPanel && uc.mouseOp.dragDrop ) {
				pd = d.parentPanel.data;
				if ( pd.onMouseMove ) {
					pd.onMouseMove ( evt, pd.baseData[0] ); } } }
//		cmn.log ( sW, ' d.name: ' + d.name + '  event.altKey: ' + event.altKey );
	};	//	mousemove()

	svc.mouseup = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mouseup()';
		var baseD = null;						//	panel base data
		if ( d.type === uc.TYPE_PANEL_BASE ) { baseD = d;  d = d.panelData; }
	//	cmn.log ( sW, ' d.name: ' + d.name );
	//	if ( uc.mouseOp && uc.mouseOp.sizing )
	//		cmn.log ( sW, ' sizing: ' + d.name + ' w h ' + d.w + ' ' + d.h );
		if ( d.onMouseUp ) {
			if ( baseD ) {
				d.onMouseUp ( evt, baseD );
				return; }
			d.onMouseUp ( evt, d ); }
	
	//	evt.stopPropagation();
	//	2022-Oct-07		Table panning in a panel -
	//	-	Commented out so that panel gets this to call dragSclrEnded().
	//	-	May be only necessary when scrolling by panning?
	//	-	Maybe not scroll table by panning?
	//	uc.mouseOp = null;
	//	2022-Oct-07		Table panning in a panel -
	//	-	And can't do this because the panel will not know the op was
	//		happening.

	};	//	mouseup()

	svc.click = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' click()';
		var baseD = null;						//	panel base data
		if ( d.type === uc.TYPE_PANEL_BASE ) { baseD = d;  d = d.panelData; }
	//	cmn.log ( sW, ' d.name: ' + d.name );

		let hostFnc = d.rpd ? d.rpd.hostFnc : d.hostFnc;
		hostFnc ( { do:			'click-focus',
					ctrlD:		null,
					frameAs: 	'',
					paneId:		d.getPaneId() } );
		
		if ( d.onClick ) {
			if ( baseD ) {
				d.onClick ( evt, baseD );
				return; }
			d.onClick ( evt, d ); }

	};	//	click()

	function rootXY ( d ) {
		var x = d.x;
		var y = d.y;
		if ( d.parentPanel ) {
			var cd = d.parentPanel.data;
		//	while ( cd.name !== uc.APP_CLIENT_ROOT_PANEL_NAME ) {
			while ( cd.parent || cd.parentPanel ) {
				if ( cd.type === uc.TYPE_PANEL ) {
					var bd = cd.baseData[0];
					x += cd.x + bd.x;
					y += cd.y + bd.y;
				} else {
					x += cd.x;
					y += cd.y;
				}
				cd = cd.parent ? cd.parent.data : cd.parentPanel.data;
			}
		}
		return { x: x, y: y };
	}	//	rootXY()

	svc.mouseoverMove = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mouseoverMove()';
//		cmn.log ( sW, ' Name: ' + d.name + '  event.altKey: ' + event.altKey );
		if ( d.noEdits ) {
			return; }
		if ( uc.mouseOp ) {
			return; }
		d3.select ( this )		//	select move rect
			.classed ( 'u34-move-handle-transparent', false )
			.classed ( 'u34-move-handle',             true  );
		var xy = rootXY ( d );
		d.rpd.panel.showFlyoverInfo ( xy.x, xy.y, 'move' );
	};	//	mouseoverMove()

	svc.mouseleaveMove = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mouseleaveMove()';
//		cmn.log ( sW, ' Name: ' + d.name + '  event.altKey: ' + event.altKey );
		if ( d.noEdits ) {
			return; }
		if ( uc.mouseOp && uc.mouseOp.moving ) {
			return; }
		d3.select ( this )		//	select move rect
			.classed ( 'u34-move-handle-transparent', true )
			.classed ( 'u34-move-handle',             false  );
		d.rpd.panel.hideFlyoverInfo();
	};	//	mouseleaveMove()

	svc.mousedownMove = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mousedownMove()';
		if ( d.noEdits ) {
			return; }
		cmn.log ( sW, ' Name: ' + d.name + '  evt.altKey: ' 
								+ evt.altKey );
		evt.stopPropagation();

		if ( uc.mouseOp )
			return;

		uc.mouseOp = {							//	mouse operation
			downData: 		d,					//	on what data the mouse operation started
			downEle: 		evt.target,
			sizing: 		false,
			moving: 		true,
			dragDrop: 		false,
			splitting: 		false,
			hscrolling:		false,
			vscrolling:		false,
			x0: 			evt.pageX,		//	where
			y0: 			evt.pageY,
			x: 				evt.pageX,		//	current position
			y: 				evt.pageY,
			dx: 			0,						//	change in position
			dy: 			0,

			grid: {
				x: 		evt.pageX,
				y: 		evt.pageY
			},

			updateXY: 		function  ( x, y ) {
				this.dx = x - this.x;		this.x = x;
				this.dy = y - this.y;		this.y = y;
			}	
		};

		d.clickDisabled = true;

		window.addEventListener ( 'mousemove', windowMouseMove, true );
		window.addEventListener ( 'mouseup',   windowMouseUp,   true );
		window.addEventListener ( 'click',     windowClick,     true );
		d.rpd.panel.hideFlyoverInfo();
	};	//	mousedownMove()

	svc.mouseoverSize = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mouseoverSize()';
//		cmn.log ( sW, ' Name: ' + d.name + '  event.altKey: ' + event.altKey );
		if ( d.noEdits ) {
			return; }
		if ( uc.mouseOp ) {
			return; }
	//	if ( d.type !== uc.TYPE_PANEL )		//	panel's size box is always visible
			d3.select ( this )		//	select size rect
				.classed ( 'u34-size-handle-transparent', false )
				.classed ( 'u34-size-handle',             true  );
		var xy = rootXY ( d );
		d.rpd.panel.showFlyoverInfo ( xy.x + d.w - 30, xy.y + d.h + 18, 'size' );
	};	//	mouseoverSize()

	svc.mouseleaveSize = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mouseleaveSize()';
//		cmn.log ( sW, ' Name: ' + d.name + '  event.altKey: ' + event.altKey );
		if ( d.noEdits ) {
			return; }
		if ( uc.mouseOp && uc.mouseOp.sizing ) {
			return; }
	//	if ( d.type !== uc.TYPE_PANEL )		//	panel's size box is always visible
			d3.select ( this )		//	select rect
				.classed ( 'u34-size-handle-transparent', true )
				.classed ( 'u34-size-handle',             false  );
		d.rpd.panel.hideFlyoverInfo();
	};	//	mouseleaveSize()

	svc.mousedownSize = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mousedownSize()';
		if ( d.noEdits ) {
			return; }
//		cmn.log ( sW, ' Name: ' + d.name + '  event.altKey: ' + event.altKey );
		evt.stopPropagation();

		if ( uc.mouseOp )
			return;

		uc.mouseOp = {							//	mouse operation
			downData: 		d,					//	on what data the mouse operation started
			downEle: 		evt.target,
			sizing: 		true,
			moving: 		false,
			dragDrop: 		false,
			splitting: 		false,
			hscrolling:		false,
			vscrolling:		false,
			x0: 			evt.pageX,		//	where
			y0: 			evt.pageY,
			x: 				evt.pageX,		//	current position
			y: 				evt.pageY,
			dx: 			0,						//	change in position
			dy: 			0,

			updateXY: 		function  ( x, y ) {
				this.dx = x - this.x;		this.x = x;
				this.dy = y - this.y;		this.y = y;
			}	
		};

		d.clickDisabled = true;

		if ( d.onSizeStart )
			d.onSizeStart ( evt, d );

		window.addEventListener ( 'mousemove', windowMouseMove, true );
		window.addEventListener ( 'mouseup',   windowMouseUp,   true );
		window.addEventListener ( 'click',     windowClick,     true );
		d.rpd.panel.hideFlyoverInfo();
	};	//	mousedownSize()

	svc.mouseoverSave = function ( evt: PointerEvent, d: any ) {
	//	var sW = serviceId + ' mouseoverSave()';
	//	cmn.log ( sW );
	//	if ( d.isDragMoving )
		if ( uc.mouseOp && uc.mouseOp.moving )
			return;
		d3.select ( this )		//	select rect
			.classed ( 'u34-save-handle-transparent', false )
			.classed ( 'u34-save-handle',             true  );
		d.rpd.panel.showFlyoverInfo ( d.x, d.y,      'save layout' );
	};	//	mouseoverSave()

	svc.mouseleaveSave = function ( evt: PointerEvent, d: any ) {
	//	var sW = serviceId + ' mouseleaveSave()';
	//	cmn.log ( sW );
		d3.select ( this )		//	select rect
			.classed ( 'u34-save-handle-transparent', true )
			.classed ( 'u34-save-handle',             false  );
		d.rpd.panel.hideFlyoverInfo();
	};	//	mouseleaveSave()

	svc.mouseoverHScroll = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mouseoverHScroll()';
//		cmn.log ( sW, ' Name: ' + d.name + '  event.altKey: ' + event.altKey );
		if ( uc.mouseOp ) {
			return; }
	//	//	Maybe a slightly different color.
	//	d3.select ( this )		//	select scroll thumb
	//		.classed ( 'u34-move-handle-transparent', false )
	//		.classed ( 'u34-move-handle',             true  );
	};	//	mouseoverHScroll()

	svc.mouseleaveHScroll = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mouseleaveHScroll ()';
//		cmn.log ( sW, ' Name: ' + d.name + '  event.altKey: ' + event.altKey );
		if ( uc.mouseOp && uc.mouseOp.hscrolling) {
			return; }
	//	//	Restore color.
	//	d3.select ( this )		//	select move rect
	//		.classed ( 'u34-move-handle-transparent', true )
	//		.classed ( 'u34-move-handle',             false  );
	};	//	mouseleaveHScroll()

	svc.mousedownHScroll = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mousedownHScroll()';
		if ( d.noEdits ) {
			return; }
		cmn.log ( sW, ' Name: ' + d.name + '  evt.altKey: ' 
								+ evt.altKey );
		evt.stopPropagation();

		if ( uc.mouseOp )
			return;

		uc.mouseOp = {			//	mouse operation
			downData: 		d,	//	on what data the mouse operation started
			downEle: 		evt.target,
			sizing: 		false,
			moving: 		false,
			dragDrop: 		false,
			splitting: 		false,
			hscrolling:		true,
			vscrolling:		false,
			x0: 			evt.pageX,		//	where
			y0: 			evt.pageY,
			x: 				evt.pageX,		//	current position
			y: 				evt.pageY,
			dx: 			0,						//	change in position
			dy: 			0,

			grid: {
				x: 		evt.pageX,
				y: 		evt.pageY
			},

			updateXY: 		function  ( x, y ) {
				this.dx = x - this.x;		this.x = x;
				this.dy = y - this.y;		this.y = y;
			}	
		};

		d.clickDisabled = true;

		window.addEventListener ( 'mousemove', windowMouseMove, true );
		window.addEventListener ( 'mouseup',   windowMouseUp,   true );
		window.addEventListener ( 'click',     windowClick,     true );
	};	//	mousedownHScroll()
	
	svc.mouseoverVScroll = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mouseoverVScroll()';
//		cmn.log ( sW, ' Name: ' + d.name + '  event.altKey: ' + event.altKey );
		if ( uc.mouseOp ) {
			return; }
	//	//	Maybe a slightly different color.
	//	d3.select ( this )		//	select scroll thumb
	//		.classed ( 'u34-move-handle-transparent', false )
	//		.classed ( 'u34-move-handle',             true  );
	};	//	mouseoverVScroll()

	svc.mouseleaveVScroll = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mouseleaveVScroll ()';
//		cmn.log ( sW, ' Name: ' + d.name + '  event.altKey: ' + event.altKey );
		if ( uc.mouseOp && uc.mouseOp.vscrolling) {
			return; }
	//	//	Restore color.
	//	d3.select ( this )		//	select move rect
	//		.classed ( 'u34-move-handle-transparent', true )
	//		.classed ( 'u34-move-handle',             false  );
	};	//	mouseleaveVScroll()

	svc.mousedownVScroll = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mousedownVScroll()';
		cmn.log ( sW, ' Name: ' + d.name + '  evt.altKey: ' 
								+ evt.altKey );
		
		evt.stopPropagation();

	//	if ( d.noEdits ) {
	//		return; }

		if ( uc.mouseOp )
			return;

		uc.mouseOp = {			//	mouse operation
			downData: 		d,	//	on what data the mouse operation started
			downEle: 		evt.target,
			sizing: 		false,
			moving: 		false,
			dragDrop: 		false,
			splitting: 		false,
			hscrolling:		false,
			vscrolling:		true,
			x0: 			evt.pageX,		//	where
			y0: 			evt.pageY,
			x: 				evt.pageX,		//	current position
			y: 				evt.pageY,
			dx: 			0,						//	change in position
			dy: 			0,

			grid: {
				x: 		evt.pageX,
				y: 		evt.pageY
			},

			updateXY: 		function  ( x, y ) {
				this.dx = x - this.x;		this.x = x;
				this.dy = y - this.y;		this.y = y;
			}	
		};

		d.clickDisabled = true;

		window.addEventListener ( 'mousemove', windowMouseMove, true );
		window.addEventListener ( 'mouseup',   windowMouseUp,   true );
		window.addEventListener ( 'click',     windowClick,     true );
	};	//	mousedownVScroll()

	svc.hsclrY = function ( d ) {
		return d.h  - uc.HORZ_GEN_SCROLL_HEIGHT
					- (d.hasBorder ? 0.5 : 0);
	}	//	svc.hsclrY()

	svc.vsclrX = function ( d ) {
		//	Adapted from that in udui-panel-f.js
		return d.w  - uc.VERT_GEN_SCROLL_WIDTH
					- (d.hasBorder ? 0.5 : 0);
	}	//	svc.vsclrX()

	ControlData.prototype.updateVsclr = function ( ctnt, oy ) {
		var sW = serviceId + ' ControlData.prototype.updateVsclr() ' 
						   + this.type + '  ' + this.name;
	//	cmn.log ( sW );
		let d = this;

		//	Adapted from udui-panel-f.js.

		//		d.h: 	height of the "viewport" (this control)
		//
		//		eY: 	total height of this control's contents - i.e., their 
		//				vertical extents, the size of the "subject"
		//
		//		scrolling is useful when -
		//
		//			(d.h / eY)  <  1  
		//
		//		i.e., when extents top or bottom is beyond the "viewport" top 
		//		or bottom
		//
		//		So, for now, (d.h / eY) -
		//
		//			is always < 1 
		//
		//			gets smaller as the control's extents get farther apart - 
		//			i.e, as the "subject" gets larger.
		//
		//	ctnt.y		Content Y
		//
		var iY = 0; 			//	indicator (thumb) position
		var iH = d.h;			//	indicator Height
		if ( oy.eY > 0 ) {
			if ( ctnt.y        < -0.5  ) {	//	2017-May-07
				
				iY += parseInt ( ((-ctnt.y * d.h) / oy.eY)
						.toFixed ( 0 ) );
				
				iH  = parseInt ( ((d.h * d.h) / oy.eY)
						.toFixed ( 0 ) );
				
	//			cmn.log ( 'updateVsclr()     oy.minY: ' + oy.minY
	//						+ '   ctnt.y: ' + ctnt.y
	//						+ '   d.h: ' + d.h
	//						+ '   eY: ' + oy.eY
	//						+ '   iY: ' + iY
	//						+ '   iH: ' + iH );
			} else {
				var r = Math.round ( (-ctnt.y) + d.h );
				if ( oy.maxY > r ) {
					iH =   d.h 
			//			 - parseInt ( (  ((oy.maxY - r) * d.h) 
						 - parseInt ( (  ((oy.maxY - d.h) * d.h) 
									   / oy.eY).toFixed ( 0 ) ); }

	//			cmn.log ( 'updateVsclr()     oy.minY: ' + oy.minY
	//						+ '   ctnt.y: ' + ctnt.y
	//					 	+ '   oy.maxY: ' + oy.maxY
	//						+ '   r: ' + r
	//						+ '   d.h: ' + d.h
	//						+ '   eY: ' + oy.eY
	//						+ '   iY: ' + iY
	//						+ '   iH: ' + iH );
			} }

				

		if ( iH < 0 ) {
			iH = 0; }		//	Invisible (I suppose).

		if ( iH < 10 ) {	//	If really small then don't make it too
			iH = 10; }		//	small.
		
		let style =   'visibility: '
					+ (((oy.minY >= 0) && (oy.maxY <= d.h)) ? 'hidden'
															: 'visible');
		d3.select ( '#' + d.eleId + '-vsclr-track' )	
			.attr ( 'x',	  svc.vsclrX )
			.attr ( 'height', ( d: any ) => {
				let h = d.hasBorder ? d.h - 1 : d.h;
				if ( h < 0 ) {
					h = 0; }
				return h; } )
			.attr ( 'style',  style );
		d3.select ( '#' + d.eleId + '-vsclr-thumb' )	
			.attr ( 'x',      svc.vsclrX )
			.attr ( 'y',      ( d: any ) => d.hasBorder ? iY + 0.5 : iY )
			.attr ( 'height', ( d: any ) => d.hasBorder ? (iH >= 1 ? iH - 1 : iH)
											   : iH )
			.attr ( 'style',  style );
	};	//	svc.updateVsclr()

	ControlData.prototype.updateVsclr2 = function ( ctnt, ey ) {
		var sW = serviceId + ' ControlData.prototype.updateVsclr2() ' 
						   + this.type + '  ' + this.name;
	//	cmn.log ( sW );
		let d = this;

		let iH = 0;			//	Scroll indicator height.
		let iY = 0;			//	Scroll indicator position.

		if ( ey > d.h ) {
			iH = parseInt ( ((d.h * d.h) / ey).toFixed(0) );
			iY = parseInt ( ((ctnt.y * (d.h - iH)) / (d.h - ey)).toFixed(0) );
		}

		let style =  'visibility: ' + ((iH <= 0) ? 'hidden' : 'visible');

		d3.select ( '#' + d.eleId + '-vsclr-track' )	
			.attr ( 'x',	  svc.vsclrX )
			.attr ( 'height', ( d: any ) => {
				let h = d.hasBorder ? d.h - 1 : d.h;
				if ( h < 0 ) {
					h = 0; }
				return h; } )
			.attr ( 'style',  style );
		d3.select ( '#' + d.eleId + '-vsclr-thumb' )	
			.attr ( 'x',      svc.vsclrX )
			.attr ( 'y',      ( d: any ) => d.hasBorder ? iY + 0.5 : iY )
			.attr ( 'height', ( d: any ) => d.hasBorder ? (iH >= 1 ? iH - 1 : iH)
											   : iH )
			.attr ( 'style',  style );
	};	//	svc.updateVsclr2()

	ControlData.prototype.updateSclrs2 = function ( o ) {
		var sW = serviceId + ' ControlData.prototype.updateSclrs2() ' 
						   + this.type + '  ' + this.name;
	//	cmn.log ( sW );
		let d = this;

		let showH = false;
		if ( o.ex > d.w ) {
			showH = true; }
		else {
			if ( (o.ey > d.h) && (o.ex > d.w - uc.VERT_GEN_SCROLL_WIDTH) ) {
				showH = true; } }

		let showV = false;
		if ( o.ey > d.h ) {
			showV = true; }
		else {
			if ( (o.ex > d.w) && (o.ey > d.h - uc.HORZ_GEN_SCROLL_HEIGHT) ) {
				showV = true; } }
			
		if ( showH && ! showV ) {
			if ( o.ey > d.h - uc.HORZ_GEN_SCROLL_HEIGHT ) {
				showV = true; } }

		if ( showV && ! showH ) {
			if ( o.ex > d.w - uc.VERT_GEN_SCROLL_WIDTH ) {
				showH = true; } }

			
		//	Horizontal
		let iW = 0;			//	Horz scroll indicator width.
		let iX = 0;			//	Horz scroll indicator position.
		let dw = showV ? d.w - uc.VERT_GEN_SCROLL_WIDTH : d.w;
		
		if ( showH ) {
			iW = parseInt ( ((dw * dw) / o.ex).toFixed(0) );
			iX = parseInt ( ((o.x * (dw - iW)) / (d.w - o.ex)).toFixed(0) ); }

	//	if ( (! cmn.isNumber ( iW )) || (! cmn.isNumber ( iX )) ) {
	//		cmn.error ( sW, 'iW ' + iW + '   iX ' + iX );
	//		return; }
		if ( ! cmn.isNumber ( iX ) ) {
			iX = 0; }

		let styleH =  'visibility: ' + (showH ? 'visibile' : 'hidden');

		d3.select ( '#' + d.eleId + '-hsclr-track' )	
			.attr ( 'y',	  svc.hsclrY )
			.attr ( 'width',  ( d: any ) => {
				let w = d.hasBorder ? dw - 1 : dw;
				if ( w < 0 ) {
					w = 0; }
				return w; } )
			.attr ( 'style',  styleH );
		d3.select ( '#' + d.eleId + '-hsclr-thumb' )	
			.attr ( 'x',      ( d: any ) => d.hasBorder ? iX + 0.5 : iX )
			.attr ( 'y',      svc.hsclrY )
			.attr ( 'width',  ( d: any ) => d.hasBorder ? (iW >= 1 ? iW - 1 : iW)
											   : iW )
			.attr ( 'style',  styleH );

		//	Vertial
		let iH = 0;			//	Vert scroll indicator height.
		let iY = 0;			//	Vert scroll indicator position.
		let dh = showH ? d.h - uc.HORZ_GEN_SCROLL_HEIGHT : d.h;

		if ( showV ) {
			iH = parseInt ( ((dh * dh) / o.ey).toFixed(0) );
			iY = parseInt ( ((o.y * (dh - iH)) / (d.h - o.ey)).toFixed(0) ); }

	//	if ( (! cmn.isNumber ( iH )) || (! cmn.isNumber ( iY )) ) {
	//		cmn.error ( sW, 'iH ' + iH + '   iY ' + iY );
	//		return; }
		if ( ! cmn.isNumber ( iY ) ) {
			iY = 0; }

		let styleV =  'visibility: ' + (showV ? 'visibile' : 'hidden');

		d3.select ( '#' + d.eleId + '-vsclr-track' )	
			.attr ( 'x',	  svc.vsclrX )
			.attr ( 'height', ( d: any ) => {
				let h = d.hasBorder ? d.h - 1 : d.h;
				if ( h < 0 ) {
					h = 0; }
				return h; } )
			.attr ( 'style',  styleV );
		d3.select ( '#' + d.eleId + '-vsclr-thumb' )	
			.attr ( 'x',      svc.vsclrX )
			.attr ( 'y',      ( d: any ) => d.hasBorder ? iY + 0.5 : iY )
			.attr ( 'height', ( d: any ) => d.hasBorder ? (iH >= 1 ? iH - 1 : iH)
											   : iH )
			.attr ( 'style',  styleV );

		d.vScrollVisible = showV;
		d.hScrollVisible = showH;
	};	//	svc.updateSclrs2()

	svc.defineScrollers = function ( g ) {
		//	Something to indicated scrolled position, and to look, function 
		//	like what the user is used to in a div.
		//
		//	Adapted from that in udui-panel-f.js
		//
		//	A scroll bar - the thumb/handle part - on the base panel. Just a 
		//	simple rectangle for now. Something to indicate scrolled position.
		g.each ( function ( d ) {
			if ( d.bHorzSB ) {
				g.append ( 'rect' )
					.attr ( 'id',     d => d.eleId + '-hsclr-track' )
					.attr ( 'x',	  d => d.hasBorder ? 0.5 : 0 )
					.attr ( 'y',      svc.hsclrY )
					.attr ( 'width',  d => d.hasBorder ? d.w - 1 : d.w ) 
					.attr ( 'height', d => uc.HORZ_GEN_SCROLL_HEIGHT )
					.attr ( 'class',  d => 'u34-scroll-track' )
					.attr ( 'style', 'visibility: unset' );
				g.append ( 'rect' )
					.attr ( 'id',     d => d.eleId + '-hsclr-thumb' )
					.attr ( 'x',      d => d.hasBorder ? 0.5 : 0 )
					.attr ( 'y',      svc.hsclrY )
					.attr ( 'width',  1 ) 
					.attr ( 'height', uc.HORZ_GEN_SCROLL_HEIGHT )
					.attr ( 'rx',	  4 )
					.attr ( 'ry',	  4 )
					.attr ( 'class',  'u34-scroll-thumb' )
					.attr ( 'style', 'visibility: unset' )
					.on ( 'mousedown', svc.mousedownHScroll ); }
			if ( d.bVertSB ) {
				g.append ( 'rect' )
					.attr ( 'id',     d => d.eleId + '-vsclr-track' )
					.attr ( 'x',      svc.vsclrX )
					.attr ( 'y',      d => d.hasBorder ? 0.5 : 0 )
					.attr ( 'width',  d => uc.VERT_GEN_SCROLL_WIDTH )
					.attr ( 'height', d => d.hasBorder ? d.h - 1 : d.h )
					.attr ( 'class',  d => 'u34-scroll-track' )
					.attr ( 'style', 'visibility: unset' );
				g.append ( 'rect' )
					.attr ( 'id',     d => d.eleId + '-vsclr-thumb' )
					.attr ( 'x',      svc.vsclrX )
					.attr ( 'y',      d => d.hasBorder ? 0.5 : 0 )
					.attr ( 'width',  uc.VERT_GEN_SCROLL_WIDTH )
					.attr ( 'height', 1 )
					.attr ( 'rx',	  4 )
					.attr ( 'ry',	  4 )
					.attr ( 'class',  'u34-scroll-thumb' )
					.attr ( 'style', 'visibility: unset' )
					.on ( 'mousedown', svc.mousedownVScroll ); }
		} );

		//	Just vertical, for now.

	}	//	ControlData.prototype.defineScrollers()

	svc.mouseoverClose = function ( evt: PointerEvent, d: any ) {
	//	var sW = serviceId + ' mouseoverClose()';
	//	cmn.log ( sW );
	//	if ( d.isDragMoving )
		var x;
		if ( uc.mouseOp && uc.mouseOp.moving )
			return;
		d3.select ( this )		//	select rect
			.classed ( 'u34-close-handle-transparent', false )
			.classed ( 'u34-close-handle',             true  );
		x = d.x;
		if ( d.type === uc.TYPE_PANEL )
			x += d.baseData[0].w;
		else
			x += d.w;
		d.rpd.panel.showFlyoverInfo ( x, d.y,      'close' );
	};	//	mouseoverClose()

	svc.mouseleaveClose = function ( evt: PointerEvent, d: any ) {
	//	var sW = serviceId + ' mouseleaveClose()';
	//	cmn.log ( sW );
		d3.select ( this )		//	select rect
			.classed ( 'u34-close-handle-transparent', true )
			.classed ( 'u34-close-handle',             false  );
		d.rpd.panel.hideFlyoverInfo();
	};	//	mouseleaveClose()

	svc.mouseoverConnector = function ( evt: PointerEvent, d: any ) {
	//	var sW = serviceId + ' mouseoverConnector()';
	//	cmn.log ( sW );
	//	if ( d.isDragMoving )
		if ( uc.mouseOp && uc.mouseOp.moving )
			return;
		d3.select ( this )		//	select rect
			.classed ( 'u34-connector-transparent', false )
			.classed ( 'u34-connector',             true  );
		let ele = <HTMLElement>evt.target;
		let x, y;
		if ( ele.id.indexOf ( 'connector-left' ) > 0 ) {
			x = d.x - 50;
			y = d.y + (d.h / 2); }
		if ( ele.id.indexOf ( 'connector-top' ) > 0 ) {
			x = d.x + (d.w / 2) - 50;
			y = d.y; }
		if ( ele.id.indexOf ( 'connector-right' ) > 0 ) {
			x = d.x + d.w + 10;
			y = d.y + (d.h / 2); }
		if ( ele.id.indexOf ( 'connector-bottom' ) > 0 ) {
			x = d.x + (d.w / 2) - 50;
			y = d.y + d.h + 20; }
	//	d.rpd.panel.showFlyoverInfo ( x, y,      'connect' );
		let panel = d.parentPanel ? d.parentPanel : d.rpd.panel;
		panel.showFlyoverInfo ( x, y,      'connect' );
	};	//	mouseoverConnector()

	svc.mouseleaveConnector = function ( evt: PointerEvent, d: any ) {
	//	var sW = serviceId + ' mouseleaveConnector()';
	//	cmn.log ( sW );
		d3.select ( this )		//	select rect
			.classed ( 'u34-connector-transparent', true )
			.classed ( 'u34-connector',             false  );
	//	d.rpd.panel.hideFlyoverInfo();
		let panel = d.parentPanel ? d.parentPanel : d.rpd.panel;
		panel.hideFlyoverInfo();
	};	//	mouseleaveConnector()

	svc.mousedownConnector = function ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' mousedownConnector()';
		cmn.log ( sW, ' Name: ' + d.name 
					+ '  ele.id: ' + evt.target.id
					+ '  evt.altKey: ' + evt.altKey );
		evt.stopPropagation();

		if ( uc.mouseOp )
			return;

		uc.mouseOp = {							//	mouse operation
			downData: 		d,					//	on what data the mouse operation started
			downEle: 		evt.target,
			sizing: 		false,
			moving: 		false,
			dragDrop: 		false,
			splitting: 		false,
			hscrolling:		false,
			vscrolling:		false,
			connecting:		true,
			x0: 			evt.pageX,		//	where
			y0: 			evt.pageY,
			x: 				evt.pageX,		//	current position
			y: 				evt.pageY,
			dx: 			0,						//	change in position
			dy: 			0,

			grid: {
				x: 		evt.pageX,
				y: 		evt.pageY
			},

			updateXY: 		function  ( x, y ) {
				this.dx = x - this.x;		this.x = x;
				this.dy = y - this.y;		this.y = y;
			}	
		};

		d.clickDisabled = true;

		if ( d.onMouseDown ) {
			d.onMouseDown ( evt, d ); }

		window.addEventListener ( 'mousemove', windowMouseMove, true );
		window.addEventListener ( 'mouseup',   windowMouseUp,   true );
		window.addEventListener ( 'click',     windowClick,     true );
		d.rpd.panel.hideFlyoverInfo();
	};	//	mousedownConnector()

	svc.mouseupConnector = function ( evt: PointerEvent, d: any ) {
		const sW = serviceId + ' mouseupConnector()';
		cmn.log ( sW, ' Name: ' + d.name 
					+ '  ele[i].id: ' + evt.target.id 
					+ '  evt.altKey: ' + evt.altKey );
		evt.stopPropagation();

		if ( (! uc.mouseOp) || (! uc.mouseOp.connecting) ) {
			return; }

		d.panel.connectCreatePath ( evt.target );

	};	//	svc.mouseupConnector();

	svc.mousedownSplitter = function ( evt: PointerEvent, d: any ) {
		var sW  = serviceId + ' mousedownSplitter()';
		cmn.log ( sW, ' Name: ' + d.name + '  evt.altKey: ' 
								+ evt.altKey );
		var svc = this;
		evt.stopPropagation();

		if ( uc.mouseOp )
			return;

		uc.mouseOp = {							//	mouse operation
			downData: 		d,					//	on what data the mouse operation started
			downEle: 		evt.target,
			sizing: 		false,
			moving: 		false,
			dragDrop: 		false,
			splitting: 		true,
			hscrolling:		false,
			vscrolling:		false,
			x0: 			evt.pageX,		//	where
			y0: 			evt.pageY,
			x: 				evt.pageX,		//	current position
			y: 				evt.pageY,
			dx: 			0,						//	change in position
			dy: 			0,

			updateXY: 		function  ( x, y ) {
				this.dx = x - this.x;		this.x = x;
				this.dy = y - this.y;		this.y = y;
			}	
		};

		window.addEventListener ( 'mousemove', windowMouseMove, true );
		window.addEventListener ( 'mouseup',   windowMouseUp,   true );
		window.addEventListener ( 'click',     windowClick,     true );

		svc.screenPanel = uc.upAppScreen ( { sc: 			sW,
											 rpd:			verifyRPD ( d ),
											 clickCB: 		null,
											 baseClass: 	'u34-horz-splitter-screen' } );
	};	//	mousedownSplitter()

	function setStateChanged ( d ) {
		let hostFnc = d.rpd ? d.rpd.hostFnc : d.hostFnc;
		if ( ! uc.isFunction ( hostFnc ) ) {
			return; }
		hostFnc ( { do: 'set-state-changed' } );
	}	//	setStateChanged()

	function windowMouseMove ( evt: MouseEvent) {
		var sW = serviceId + ' windowMouseMove()';
	//	cmn.log ( sW );
		var op = uc.mouseOp;
		if ( ! op )
			return;
		var d = op.downData;
		op.updateXY ( evt.pageX, 
					  evt.pageY );
		if ( op.connecting ) {
			if ( ! d.onConnect ) {
				return; }
			d.onConnect ( d, -1, op.downEle, op.dx, op.dy );
			evt.stopPropagation();
			evt.preventDefault();		//	prevents highlighting/flashing selections of input controls
			return;
		}
		if ( op.sizing ) {
			if ( ! op.downData.onSize )
				return;
			d.onSize ( d, -1, op.downEle, op.dx, op.dy );
		//	setStateChanged ( d );			moved to windowMouseUp()
			evt.preventDefault();		//	prevents highlighting/flashing selections of input controls
			if ( d.propCB ) {			//	update the properties board?
				d.propCB ( 'w', d.w );
				d.propCB ( 'h', d.h );
			}
		}
		if ( op.moving ) {
			if ( ! op.downData.onMove )
				return;
			if ( ! d.parentPanel )
				return;
			var dx = op.x - op.grid.x;
			var dy = op.y - op.grid.y;
		//	cmn.log ( sW, 'dx y: ' + dx + ' ' + dy );
			var e = d.parentPanel.gridMove ( d, { x: d.x + dx, y: d.y + dy } );
			if ( e === null )
				return;
			if ( e.x !== d.x )
				op.grid.x += (e.x - d.x);
			if ( e.y !== d.y )
				op.grid.y += (e.y - d.y);
			d.onMove ( d, -1, op.downEle, e.x, e.y );
		//	setStateChanged ( d );			moved to windowMouseUp()
			evt.preventDefault();		//	prevents highlighting/flashing selections of input controls
			if ( d.propCB ) {			//	update the properties board?
				d.propCB ( 'x', d.x );
				d.propCB ( 'y', d.y ); }
		}
		if ( op.splitting ) {
			if ( ! op.downData.onSplit ) {
				return; }
			op.downData.onSplit ( op.downData, -1, op.downEle, op.dx, op.dy );
			evt.preventDefault();		//	prevents highlighting/flashing selections of input controls
		}
		if ( op.hscrolling ) {
			if ( ! op.downData.onHScroll ) {
				return; }
			d.onHScroll ( d, -1, op.downEle, op.dx, op.dy );
		}
		if ( op.vscrolling ) {
			if ( ! op.downData.onVScroll ) {
				return; }
			d.onVScroll ( d, -1, op.downEle, op.dx, op.dy );
		}
	}	//	windowMouseMove

	function windowMouseUp ( evt: MouseEvent ) {
		var sW = serviceId + ' windowMouseUp()';
	//	cmn.log ( sW );
		window.removeEventListener ( 'mousemove', windowMouseMove, true );
		window.removeEventListener ( 'mouseup',   windowMouseUp,   true );
		var op = uc.mouseOp;
		if ( ! op )
			return;
		if ( op.connecting ) {
			let d = op.downData;
			if ( ! d.onConnect ) {
				return; }
			d.onConnect ( d, -1, null ); 
			evt.preventDefault();
			return; }
		if ( op.sizing ) {
			if ( op.downData.type !== uc.TYPE_PANEL ) {
				d3.select ( op.downEle )	//	select size rect
					.classed ( 'u34-size-handle-transparent', true )
					.classed ( 'u34-size-handle',             false  ); }
			setStateChanged ( op.downData );
			return;		//	Do not set uc.mouseOp = null here when sizing.  See svc.mouseup().
		}
		if ( op.moving ) {
			d3.select ( op.downEle )	//	select move rect
				.classed ( 'u34-move-handle-transparent', true )
				.classed ( 'u34-move-handle',             false  );
			setStateChanged ( op.downData );
		}
		if ( op.splitting ) {
			uc.downAppScreen ( verifyRPD ( op.downData ) );		
			svc.screenPanel = null;
			window.removeEventListener ( 'click', windowClick, true );
		}
		if ( ! op.downData.hasBorder ) 							//	in case this mouseup event happens 
			d3.select ( '#' + op.downData.eleId + '-rect' )		//	outside the app and the control does 
				.classed ( 'u34-light-border', false );					//	not get a mouseleave event
		uc.mouseOp = null;
	}	//	windowMouseUp

	function windowClick ( evt: MouseEvent ) {
		var sW = serviceId + ' windowClick()';
	//	cmn.log ( sW );
		evt.stopPropagation();
		window.removeEventListener ( 'click', windowClick, true );
	}	//	windowClick()

//	svc.mouseupSize = function( d, i, ele ) {
//		var sW = serviceId + ' mouseupSize()';
//		cmn.log ( sW, ' Name: ' + d.name + '  event.altKey: ' + event.altKey );
//		event.stopPropagation();
//		uc.mouseOp = null;
//	};	//	mouseupSize()



	function ControlData ( o ) {
		let sW = serviceId + ' ControlData()';
		this.id = 0;			//	set by the control when it is defined
		this.noEdits = false;	//	possibly true when not designing	

		//	If this data is that of the rpd (root panel data) then rpd will
		//	be null.
		if ( (! o) || (typeof o.rpd !== 'object') ) {
		//	cmn.log ( sW, ' ERROR: rpd is undefined' );
			return; }
		this.rpd = o.rpd;

		this.type = o.type;				//	'panel', 'button', etc..
		this.zorder  = uc.isNumber ( o.zorder )   ? o.zorder  : -1;
		this.enabled = uc.isBoolean ( o.enabled ) ? o.enabled : true;
		this.x = o.x;		
		this.xPct  = uc.isString ( o.xPct  ) ? o.xPct  : null;
		this.xEval = uc.isString ( o.xEval ) ? o.xEval : null;
		this.y = o.y;
		this.yPct  = uc.isString ( o.yPct  ) ? o.yPct  : null;
		this.yEval = uc.isString ( o.yEval ) ? o.yEval : null;
		this.w = o.w;
		this.wPct  = uc.isString ( o.wPct  ) ? o.wPct  : null;
		this.wEval = uc.isString ( o.wEval ) ? o.wEval : null;
		this.h = o.h;
		this.hPct  = uc.isString ( o.hPct  ) ? o.hPct  : null;
		this.hEval = uc.isString ( o.hEval ) ? o.hEval : null;
		this.name  = o.name;
		this.panel       = null;		//	set by the panel the control is on
		this.parentPanel = null;		//	or it may be parentPanel

		//	if not specified then set by the panel the control is on
		this.eleId = o.eleId === undefined ? null : o.eleId;	

		this.class     = o.class;		//	these work together - when class.stroke is not visible
		this.hasBorder = o.hasBorder;	//	then hasBorder should be false

		this.clickDisabled = false;

		this.fillsPanel = false;		//	control position, size to fill a panel - table,
										//	tabs controls for examples

		this.propCB = null;				//	Properties Board sets this to get updates when, for
										//	examples, the user moves or sizes the control with the mouse

		this.onMouseOver  = null;		//	when the mouse enters the control
		this.onMouseLeave = null;		//	and exits the control
		this.onMouseDown  = null;		//	when the mouse button is pressed while inside the control
		this.onMouseMove  = null;		//	when the mouse moves inside the control
		this.onMouseUp    = null;		//	when the mouse button is released while inside the control
		this.onClick	  = null;
		this.onSizeStart  = null;		//	when the control is about to be sized
		this.onSize       = null;		//	when the control is sized
		this.onSize2      = null;  		//	passes <g>, has no callbacks
		this.onMove       = null;		//	when the control moves
		this.onVScroll    = null;		//	when vertically scrolled

		this.vScrollVisible	= false;
		this.hScrollVisible	= false;

	}	//	ControlData()

	ControlData.prototype.showPropertiesBoard = function ( title, x, y, hasBorder ) {
		var sW = serviceId + ' ControlData.prototype.showPropertiesBoard()';
		let rpd = this.rpd ? this.rpd : this;
//		let panel = uBoards.showPropertiesBoard ( { 		?
//			sC: 		sW,
//			uduiId: 	rpd.uduiId, 
//	//		forPanel: 	panelData.panel } );
//			ofCtrlD: 	this,
//			title: 		title,
//			x:			x,
//			y:			y,
//			hasBorder:	hasBorder,
//			rpd:		rpd } );
//		return panel;
		cmn.error ( sW, 'uBoards.showPropertiesBoard() ?' );
		return null;
	};	//	showPropertiesBoard()
	//
	ControlData.prototype.createBoard = function ( boardType, x, y, hasBorder ) {
		var sW = serviceId + ' ControlData.prototype.createBoard()';
		let rpd = this.rpd ? this.rpd : this;
		let panel = uBoards.createBoard ( { 
			sC: 		sW,
			type:		boardType,
			x:			x,
			y:			y,
			hasBorder:	hasBorder,
			rpd:		rpd } );
		return panel;
	};	//	createBoard()

	ControlData.prototype.listProperties = function() {
		var sW = serviceId + ' ControlData.prototype.listProperties()';
		var whiteList = [ 'zorder', 'enabled', 'x', 'y', 'w', 'h', 'name' ];
		var props = [];
		for ( var key in this ) {
			if ( ! whiteList.includes ( key ) )
				continue;
			let value = this[key];
			if ( value === undefined )
				continue;
			if ( value === null )
				continue;
			let displayName = key;
		//	switch ( key ) {
		//		case 'w': 			displayName = 'width';		break;
		//		case 'h': 			displayName = 'height';		break;
		//	}
			let type  = 'text';
			let step  = 1;
			if ( key === 'zorder' ) {
				type = 'number';
				displayName = 'z order'; }
			if ( key === 'enabled' ) {
				value = this.enabled ? 'true' : 'false'; }
			if ( key === 'x' ) {
				if ( uc.isString ( this.xEval ) ) {
					value = this.xEval; } }
			if ( key === 'y' ) {
				if ( uc.isString ( this.yEval ) ) {
					value = this.yEval; } }
			if ( key === 'w' ) {
				displayName = 'width';
				if ( uc.isString ( this.wEval ) ) {
					value = this.wEval; } }
			if ( key === 'h' ) {
				displayName = 'height';
				if ( uc.isString ( this.hEval ) ) {
					value = this.hEval; } }
		//	cmn.log ( sW, '   key: ' + key + '  value: ' + value );
			props.push ( { property:	key, 
						   type:		type,
						   step:		step,
						   value:		value, 
						   displayName:	displayName } );
		}
		return props;
	};

	ControlData.prototype.setProperty = function ( name, value ) {
		var sW = serviceId + ' ControlData.prototype.setProperty()';
		var s, n, g, dx, dy, pct = false;
		if ( typeof value !== 'string' ) {
			return -1; }
		
		//	There is a delay in the state being collected.  Here the property 
		//	will be set by the time the state is collected and posted.
		setStateChanged ( this );			
		
		if ( name === 'zorder' ) {
			s = Number ( value );
			if ( s !== s ) {				//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
				return 1; }
			this.setZOrder ( s );
			return 1;
		}
		if ( name === 'enabled' ) {
		//	s = Number ( value );
		//	if ( s !== s ) {				//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
		//		s = value.toLowerCase().trim();
		//		s = (s === 'true') ? s : 'false'; }
		//	else {
		//		s = (s !== 0) ? 'true' : 'false'; }
		//	if ( s === 'true' ) {
		//		this.enable ( true ); }
		//	else {
		//		this.enable ( false ); }
		//	this[name] = (s === 'true');
			this[name] = uc.booleanify ( value );
			this.enable ( this[name] );
			return 1;
		}
		if ( (name === 'x') || (name === 'y') ) {
			s   = value.trim();

			if ( s.includes ( ':' ) || s.includes ( '%' ) ) {
				if ( name === 'x' ) {
					this.xEval = s;
					n = this.evalX ( s );
					if ( ! uc.isNumber ( n ) ) {
						this.xEval = null;
						return; } }
				else {
					this.yEval = s;
					n = this.evalY ( s );
					if ( ! uc.isNumber ( n ) ) {
						this.yEval = null;
						return; } } }
			else {
				if ( name === 'x' ) {
					this.xEval = null; }
				if ( name === 'y' ) {
					this.yEval = null; }
				if ( s.endsWith ( '%' ) ) {
					pct = true;
					value = s.slice ( 0, -1 ); }
				else {
					this[name + 'Pct'] = null; }
				n = Number ( value );
				if ( n !== n ) {	//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
					return; }
				if ( pct ) {
					if ( ! this.parentPanel ) {
						cmn.error ( sW, ' no parent panel' );
						return; }
					this[name + 'Pct'] = n;
					let pd = this.parentPanel.data;
					if ( name === 'x' ) {
						n = Math.round ( pd.w * (n / 100) ); }
					if ( name === 'y' ) {
						n = Math.round ( pd.h * (n / 100) ); } }
			}
			let prv = this[name];
			this[name] = n;
			let w = null, h = null;
			if ( (name === 'x') && (this.wEval) ) {
				w = this.evalW ( this.wEval );
				if ( ! uc.isNumber ( w ) ) {
					this[name] = prv;
					return; } }
			if ( (name === 'y') && (this.hEval) ) {
				h = this.evalH ( this.hEval );
				if ( ! uc.isNumber ( h ) ) {
					this[name] = prv;
					return; } }
			d3.select ( '#' + this.eleId )
				.attr ( 'transform', function ( d: any, i ) { 
					return 'translate(' + d.x + ',' + d.y + ')'; 
				} );
			if ( (w !== null) || (h !== null) ) {
				let dx = w !== null ? w - this.w : 0; 
				let dy = h !== null ? h - this.h : 0;
				g = d3.select ( '#' + this.eleId );
				this.onSize2 ( this, g, dx, dy ); }
			this.parentPanel.updateSclrs();
			return 1;
		}
		if ( (name === 'w') || (name === 'h') ) {
			if ( ! this.onSize2 )
				return;
			if ( value.length === 0 )
				return;
			s   = value.trim();

			if ( s.includes ( ':' ) || s.includes ( '%' ) ) {
				if ( name === 'w' ) {
					this.wEval = s;
					n = this.evalW ( s );
					if ( ! uc.isNumber ( n ) ) {
						this.wEval = null;
						return; } }
				else {
					this.hEval = s;
					n = this.evalH ( s );
					if ( ! uc.isNumber ( n ) ) {
						this.hEval = null;
						return; } } }
			else {
				if ( name === 'w' ) {
					this.wEval = null; }
				if ( name === 'h' ) {
					this.hEval = null; }
				if ( s.endsWith ( '%' ) ) {
					pct = true;
					value = s.slice ( 0, -1 ); }
				else {
					this[name + 'Pct'] = null; }
				n = Number ( value );
				if ( n !== n ) {	//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
					return; }
				if ( pct ) {
					if ( ! this.parentPanel ) {
						cmn.error ( sW, ' no parent panel' );
						return; }
					this[name + 'Pct'] = n;
					let pd = this.parentPanel.data;
					if ( name === 'w' ) {
						n = Math.round ( pd.w * (n / 100) ); }
					if ( name === 'h' ) {
						n = Math.round ( pd.h * (n / 100) ); } }
			}
		//	this[name] = n;						set in onSize2()
			dx = name === 'w' ? n - this.w : 0;
			dy = name === 'h' ? n - this.h : 0; 
			g = d3.select ( '#' + this.eleId );
			this.onSize2 ( this, g, dx, dy );
			if ( ! this.enabled ) {
				sizeDisabledRect ( this ); }
			return 1;
		}
		if ( name === 'name' ) {
			this[name] = value;
			return 1;
		}
		return 0;
	};	//	ControlData.prototype.setProperty()

	ControlData.prototype.evalWHXY_firstPart = function ( o ) {
		const sW = serviceId + ' evalWHXY_firstPart()';

		o.whxy = null;
		if ( o.s.length > 128 ) {
			cmn.error ( sW, 's is too long' );
			return; }
		if ( (o.orientation !== 'vert') && (o.orientation !== 'horz') ) {
			cmn.error ( sW, 'orientation must be vert or horz' );
			return; }
		o.right  = null;
		o.bottom = null;
		let pd = this.parentPanel.data;
		let a = o.s.trim().split ( /\s+/ );
		let relTo = null;
		let pct   = null;
		let n     = null;
		a.forEach ( t => {
			if ( t[0] === ':' ) {
				if ( o.orientation === 'horz' ) {
					let r = t.slice ( 1 );
					if ( r === 'r' ) {
						o.right = true; } }
				else {
					let b = t.slice ( 1 );
					if ( b === 'b' ) {
						o.bottom = true; } }
				return; }
			if ( t.includes ( ':' ) ) {
				relTo = t.split ( ':' ); 
				return; }
			if ( t.endsWith ( '%' ) ) {
				pct = Number.parseFloat ( t.slice ( 0, -1 ) );
				if ( Number.isNaN ( pct )  || (pct < 0) ) {
					pct = null; }
				return; }
			n = Number.parseInt ( t );
			if ( ! Number.isSafeInteger ( n ) ) {
				n = null; }
		} );
	
		while ( relTo ) {
			if ( pct ) {
				relTo = null;
				pct   = null;
				break; }		//	can't be both relTo and %
			let d = pd.panel.getControlDataByName ( relTo[0] );
			if ( ! d ) {
				relTo = null;
				break; }
			if ( o.orientation === 'horz' ) {
				if ( relTo[1] === 'r' ) {
					relTo = d.x + d.w;
					break; }
				if ( relTo[1] === 'l' ) {
					relTo = d.x;
					break; } }
			else {
				if ( relTo[1] === 'b' ) {
					relTo = d.y + d.h;
					break; }
				if ( relTo[1] === 't' ) {
					relTo = d.y;
					break; } }
			relTo = null;
			break; }

		if ( relTo ) {
			o.whxy = relTo;
			if ( n ) {
				o.whxy += n; } }
		else
		if ( pct ) {
			if ( o.orientation === 'horz' ) {
				o.whxy = Math.round ( pd.w * (pct / 100) ); }
			else {
				o.whxy = Math.round ( pd.h * (pct / 100) ); }
			if ( n ) {
				o.whxy += n; } }
		else
		if ( n && (n > 0) ) {
			o.whxy = n; }
	}	//	evalWHXY_firstPart()

	ControlData.prototype.evalW = function ( s ) {
		const sW = serviceId + ' evalW()';
		//	String format -
		//		[:r] [[<name>:r|l] | n%] [n]
		//	:r
		//		Set right side of control. So the width will be
		//		whatever value we get here minus the control's 
		//		current x. That width is what is returned.
		//	<name>
		//		Name of another control to set this one's width relative to.
		//	:r|l
		//		What appears after <name>. Specfies which edge, right or left,
		//		of the control of <name> to set this control's width relative
		//		to.
		//	n%
		//		n is a number that is interpreted as a percentage of the 
		//		parent's width.
		//	n
		//		The second n. Number of pixels. May be negative. If :r or
		//		<name>:r|l or n% are also specified then this will be an offset 
		//		from whatever value is interpreted from those. Otherwise this
		//		value will be the width in which case it should not be negative.
		//	Returns width or null on error.

		let o = { s: s, orientation: 'horz', whxy: null, right: false };

		this.evalWHXY_firstPart ( o );

		if ( ! uc.isNumber ( o.whxy ) ) {
			return null; }

		let w = o.whxy;

		if ( o.right ) {
			w = w - this.x; }

		if ( w < 0 ) {
			return null; }

		return w;
		
	}	//	ControlData.prototype.evalW()

	ControlData.prototype.evalH = function ( s ) {
		const sW = serviceId + ' evalH()';
		//	String format -
		//		[:b] [[<name>:b|t] | n%] [n]
		//	:b
		//		Set bottom side of control. So the height will be
		//		whatever value we get here minus the control's 
		//		current y. That height is what is returned.
		//	<name>
		//		Name of another control to set this one's height relative to.
		//	:b|t
		//		What appears after <name>. Specfies which edge, bottom or top,
		//		of the control of <name> to set this control's height relative
		//		to.
		//	n%
		//		n is a number that is interpreted as a percentage of the 
		//		parent's height.
		//	n
		//		The second n. Number of pixels. May be negative. If :b or
		//		<name>:b|t or n% are also specified then this will be an offset 
		//		from whatever value is interpreted from those. Otherwise this
		//		value will be the height in which case it should not be 
		//		negative.
		//	Returns height or null on error.

		let o = { s: s, orientation: 'vert', whxy: null, bottom: false };

		this.evalWHXY_firstPart ( o );

		if ( ! uc.isNumber ( o.whxy ) ) {
			return null; }

		let h = o.whxy;

		if ( o.bottom ) {
			h = h - this.y; }

		if ( h < 0 ) {
			return null; }

		return h;
		
	}	//	ControlData.prototype.evalH()

	ControlData.prototype.evalX = function ( s ) {
		const sW = serviceId + ' evalX()';
		//	String format -
		//		[:r] [[<name>:r|l] | n%] [n]
		//	:r
		//		Set right side of control. The width of the control is adjusted 
		//		so that the right side of the control appears in the same 
		//		location.
		//	<name>
		//		Name of another control to set this one's x relative to.
		//	:r|l
		//		What appears after <name>. Specfies which edge, right or left,
		//		of the control of <name> to set this control's x relative to.
		//	n%
		//		n is a number that is interpreted as a percentage of the 
		//		parent's width.
		//	n
		//		The second n. Number of pixels. May be negative. If 
		//		<name>:r|l or n% are also specified then this will be an offset 
		//		from whatever value is interpreted from those. Otherwise this
		//		value will be the x in which case it should not be negative.
		//	Returns x or null on error.

		let o = { s: s, orientation: 'horz', whxy: null, right: false };

		this.evalWHXY_firstPart ( o );

		if ( ! uc.isNumber ( o.whxy ) ) {
			return null; }

		let x = o.whxy;

		if ( o.right ) {
			let r = this.x + this.w;
			let w = r - x;
			if ( w < 0 ) {
				return null; }
			let dx = w - this.w;
			let dy = 0;
			let g = d3.select ( '#' + this.eleId );
			this.onSize2 ( this, g, dx, dy );
			if ( ! this.enabled ) {
				sizeDisabledRect ( this ); } }

		return x;
		
	}	//	ControlData.prototype.evalX()

	ControlData.prototype.evalY = function ( s ) {
		const sW = serviceId + ' evalY()';
		//	String format -
		//		[:b] [[<name>:b|t] | n%] [n]
		//	:b
		//		Set bottom side of control. The height of the control is 
		//		adjusted so that the bottom side of the control appears in the 
		//		same location.
		//	<name>
		//		Name of another control to set this one's y relative to.
		//	:b|t
		//		What appears after <name>. Specfies which edge, bottom or top,
		//		of the control of <name> to set this control's y relative to.
		//	n%
		//		n is a number that is interpreted as a percentage of the 
		//		parent's height.
		//	n
		//		The second n. Number of pixels. May be negative. If 
		//		<name>:b|t or n% are also specified then this will be an offset 
		//		from whatever value is interpreted from those. Otherwise this
		//		value will be the y in which case it should not be negative.
		//	Returns y or null on error.

		let o = { s: s, orientation: 'vert', whxy: null, bottom: false };

		this.evalWHXY_firstPart ( o );

		if ( ! uc.isNumber ( o.whxy ) ) {
			return null; }

		let y = o.whxy;

		if ( o.bottom ) {
			let b = this.y + this.h;
			let h = b - y;
			if ( h < 0 ) {
				return null; }
			let dx = 0;
			let dy = h - this.h;
			let g = d3.select ( '#' + this.eleId );
			this.onSize2 ( this, g, dx, dy ); 
			if ( ! this.enabled ) {
				sizeDisabledRect ( this ); } }

		return y;
		
	}	//	ControlData.prototype.evalY()

	ControlData.prototype.disallowEdits = function() {
		var sW = serviceId + ' ControlData.prototype.disallowEdits()';
		this.noEdits = true;
	}	//	ControlData.prototype.disallowEdits()

	function sizeDisabledRect ( d ) {
		//	a rect over all else of the control to make it appear disabled
		let w = d.w + 2;
		w += d.type === uc.TYPE_INPUT ? 6 : 0;
		let h = d.h + 2;
		h += d.type === uc.TYPE_INPUT ? 2 : 0;
		d3.select ( '#' + d.eleId + '-disabled' )
			.attr ( 'x',      -1 )
			.attr ( 'y',      -1 )
			.attr ( 'width',   w )
			.attr ( 'height',  h );
	}	//	sizeDisabledRect()

	ControlData.prototype.setZOrder = function ( newZ ) {
		let z = this.zorder;
		if ( uc.isNumber ( newZ ) && (newZ === z) ) {
			return; }
		let s = d3.select ( '#' + this.eleId );
		let n = <HTMLElement>s.node();
		let p = n.parentNode;
		if ( ! uc.isNumber ( newZ ) ) {
			newZ = z; }
		//	Know that that the first child of the parent is a rect.
		//	So the child controls are indexed from 1 to p.children.length - 1.
		if ( (newZ < 1) || (newZ >= p.children.length) ) {
			return; }
		if ( newZ < p.children.length - 1 ) {
			//	Insert before the current one at z so that this will take its
			//	place.
			if ( newZ > z ) {
				p.insertBefore ( n, p.children[newZ + 1] ); }
			else {
				p.insertBefore ( n, p.children[newZ] ); } }
		else {
			//	At the end.
			p.insertBefore ( n, null ); }
		this.zorder = newZ;
	};	//	ControlData.prototype.setZOrder()

	ControlData.prototype.setIsVisible = function ( bVisible ) {
		//	Note that when bVisible is true setting the attr null will 
		//	remove the visibility attribute which will normally make the
		//	node visible.
		d3.select ( '#' + this.eleId )
			.attr ( 'visibility', bVisible ? null : 'hidden' );
	}	//	ControlData.prototype.setIsVisible()

	ControlData.prototype.enable = function ( bEnable ) {
		let s = d3.select ( '#' + this.eleId + '-disabled' );
		while ( bEnable ) {
			if ( s.empty() ) {		//	there is nothing that has "disabled" it
				break; }
			s.remove();
			break; }
		while ( ! bEnable ) {
			if ( ! s.empty() ) {	//	already appears disabled?
				break; }
		//	//	a rect over all else of the control to make it appear disabled
		//	let w = this.w + 2;
		//	w += this.type === uc.TYPE_INPUT ? 6 : 0;
		//	let h = this.h + 2;
		//	h += this.type === uc.TYPE_INPUT ? 2 : 0;
			d3.select ( '#' + this.eleId )
				.append ( 'rect' )
					.attr ( 'id',     ( d: any ) => d.eleId + '-disabled' )
		//			.attr ( 'x',      -1 )
		//			.attr ( 'y',      -1 )
		//			.attr ( 'width',   w )
		//			.attr ( 'height',  h )
					.attr ( 'class',  'u34-disabled' )
					.on ( 'click', clickDisabled )
					.on ( 'mouseover', mouseoverDisabled );
			sizeDisabledRect ( this );
			break; }
		this.enabled = !! bEnable;
	};	//	ControlData.prototype.enable()

	ControlData.prototype.deltaXYWH = function ( o ) {
		if ( o.dx || o.dy ) {
			d3.select ( '#' + this.eleId )
				.attr ( 'transform', ( d: any ) => { 
					return 'translate(' + (d.x += o.dx) + ',' 
										+ (d.y += o.dy) + ')'; } );
			if ( this.propCB ) {			//	update the properties board?
				this.propCB ( 'x', this.x );
				this.propCB ( 'y', this.y ); } }

		if ( o.dw || o.dh ) {
			let e = document.getElementById ( this.eleId + '-size' )
			this.onSize ( this, -1, e, o.dw, o.dh );
			if ( this.propCB ) {
				this.propCB ( 'w', this.w );
				this.propCB ( 'h', this.h ); } }
	};	//	ControlData.prototype.deltaXYWH()

	ControlData.prototype.parentSized = function() {
		const sW = 'ControlData.parentSized()';
		let pd = this.parentPanel.data;
		let n, g  = d3.select ( '#' + this.eleId );
		if ( this.xPct || this.xEval || this.yPct || this.yEval ) {
			n = this.x;
			if ( this.xPct ) {
				n = this.xPct;
				n = Math.round ( pd.w * (n / 100) ); }
			if ( this.xEval ) {
				n = this.evalX ( this.xEval ); }
			if ( uc.isNumber ( n ) ) {
				this.x = n; }
			n = this.y;
			if ( this.yPct ) {
				n = this.yPct;
				n = Math.round ( pd.h * (n / 100) ); }
			if ( this.yEval ) {
				n = this.evalY ( this.yEval ); }
			if ( uc.isNumber ( n ) ) {
				this.y = n; }
			d3.select ( '#' + this.eleId )
				.attr ( 'transform', function ( d: any, i ) { 
					return 'translate(' + d.x + ',' + d.y + ')'; 
				} );
			this.parentPanel.updateSclrs(); }
//		if ( this.name === 'treNames' ) {
//			cmn.log ( sW, 'y h: ' + this.y + '  ' + this.h ); }
		let dx = 0, dy = 0;
		if ( this.wEval ) {
			let	n = this.evalW ( this.wEval  );
			if ( uc.isNumber ( n ) ) {
				dx = n - this.w; } }
		if ( this.wPct ) {
			let n  = this.wPct;
			n = Math.round ( pd.w * (n / 100) ); 
			dx = n - this.w; }
		if ( this.hEval ) {
			let	n = this.evalH ( this.hEval  );
			if ( uc.isNumber ( n ) ) {
				dy = n - this.h; } }
		if ( this.wPct ) {
			let n  = this.wPct;
			n = Math.round ( pd.h * (n / 100) ); 
			dx = n - this.h; }
		this.onSize2 ( this, g, dx, dy );
		if ( ! this.enabled ) {
			sizeDisabledRect ( this ); }
	};	//	ControlData.prototype.parentSized()


	ControlData.prototype.focus = function() {
		var sW = serviceId + ' ControlData.prototype.focus() ' 
						   + this.type + '  ' + this.name;
		cmn.log ( sW );
		let d = this;
		let w = d.w, h = d.h;
		if ( d.type === uc.TYPE_TEXTAREA ) {
			w += 11;	h += 7; }
		else 
		if ( d.type === uc.TYPE_EDITOR ) {
			w += 11;	h += 7; }
		else 
		if ( d.type === uc.TYPE_PANEL ) {
			w += 5;		h += 5; }
		else {
			w += 4;		h += 4; }
		d3.select ( '#' + d.eleId )
			.append ( 'rect' ) 
			.attr ( 'id',      d.eleId + '-focus' )
			.attr ( 'x',       0 - 2 )
			.attr ( 'y',       0 - 2 )
			.attr ( 'width',   w )
			.attr ( 'height',  h )
			.attr ( 'class',   'u34-focus-rect' )
			.style ( 'stroke', 'blue' )
			.transition()
			.duration ( 3000 )
			.style ( 'stroke', 'transparent' );

		//	Change and maintain the panel's border blue while the panel
		//	or one of its controls is focused.
		if ( 	(d.type        === uc.TYPE_PANEL     )
			 &&	(d.borderClass === 'u34-panel-border') 
		//	 && (d.rpd.id      !== d.id              ) ) {
			 && (d.rpd.eleId   !== d.eleId           ) ) {
			d3.select ( '#' + d.eleId + '-panel-border' )
				.attr ( 'class',  'u34-panel-border-blue' ); }

	};	//	ControlData.prototype.focus()

	ControlData.prototype.unfocus = function() {
		const sW = serviceId + ' ControlData.prototype.unfocus() '
						     + this.type + '  ' + this.name;
		cmn.log ( sW );

		d3.select ( '#' + this.eleId + '-focus' )
			.remove();

		let d = this;

		//	Restore the panel's border color.
		if ( 	(d.type        === uc.TYPE_PANEL     )
			 &&	(d.borderClass === 'u34-panel-border') 
		//	 && (d.rpd.id      !== d.id              ) ) {
			 && (d.rpd.eleId   !== d.eleId           ) ) {
			d3.select ( '#' + d.eleId + '-panel-border' )
				.attr ( 'class',  ( d: any ) => d.borderClass ); }

	};	//	ControlData.prototype.unfocus()

	ControlData.prototype.focusWH = function() {
		var sW = serviceId + ' ControlData.prototype.focusWH()';
		cmn.log ( sW );
		let d = this;
		d3.select ( '#' + d.eleId )
			.append ( 'rect' ) 
			.attr ( 'id',     d.eleId + '-focus-wh' )
			.attr ( 'x',      d.w - uc.SIZE_HANDLE_WIDTH  - 2 )
			.attr ( 'y',      d.h - uc.SIZE_HANDLE_HEIGHT - 2 )
			.attr ( 'width',  uc.SIZE_HANDLE_WIDTH  + 4 )
			.attr ( 'height', uc.SIZE_HANDLE_HEIGHT + 4 )
			.attr ( 'class',  'u34-focus-rect' )
			.style ( 'stroke', 'blue' )
			.transition()
			.duration ( 1000 )
			.style ( 'stroke', 'transparent' );

	};	//	ControlData.prototype.focusWH()

	ControlData.prototype.unfocusWH = function() {
		const sW = serviceId + ' ControlData.prototype.unfocusWH()';
		cmn.log ( sW );

		d3.select ( '#' + this.eleId + '-focus-wh' )
			.remove();

	};	//	ControlData.prototype.unfocusWH()

	ControlData.prototype.indicateSelected = function() {
		var sW = serviceId + ' ControlData.prototype.indicateSelected() ' 
						   + this.type + '  ' + this.name;
		cmn.log ( sW );
		let d = this;
		d3.select ( '#' + d.eleId )
			.append ( 'rect' ) 
			.attr ( 'id',     d.eleId + '-select' )
			.attr ( 'x',        0 - 2 )
			.attr ( 'y',        0 - 2 )
			.attr ( 'width',  d.w + 4 )
			.attr ( 'height', d.h + 4 )
			.attr ( 'class',  'u34-selected-rect' );

	};	//	ControlData.prototype.indicateSelected()

	ControlData.prototype.unindicateSelected = function() {
		const sW = serviceId + ' ControlData.prototype.unindicateSelected() '
						     + this.type + '  ' + this.name;
		cmn.log ( sW );

		d3.select ( '#' + this.eleId + '-select' )
			.remove();

	};	//	ControlData.prototype.unindicateSelected()

	ControlData.prototype.getPaneId = function() {
		const sW = serviceId + ' ControlData.prototype.getPaneId() '
						     + this.type + '  ' + this.name;
		cmn.log ( sW );
		let paneId = null;
		if ( cmn.isNumber ( this.paneId ) ) {
			paneId = this.paneId; }
		else {
		if ( cmn.isObject ( this.rpd ) && cmn.isNumber ( this.rpd.paneId ) ) {
			paneId = this.rpd.paneId; } }
		return paneId;
	}	//	ControlData.prototype.getPaneId()

	svc.newControlData = function() {
		return new ControlData ( null );
	};

	svc.callControlData = function ( it, o ) {
		return ControlData.call ( it, o );
	};

	svc.disallowEdits = function ( it ) {
		return ControlData.prototype.disallowEdits.call ( it );
	};

	svc.setProperty = function ( it, name, value ) {
		return ControlData.prototype.setProperty.call ( it, name, value );
	};

	svc.listProperties = function ( it, props ) {
		return ControlData.prototype.listProperties.call ( it );
	};

/*	Unnecessary to implement any of this in derived controls. Clients
	call deltaXYWH() here directly.  So this interface is not used. 
	svc.deltaXYWH = function ( it, o ) {
		return ControlData.prototype.deltaXYWH.call ( it, o );
	};
*/

	return svc;

})();

