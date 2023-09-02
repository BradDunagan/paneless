
//  app/partials/udui/udui-splitter-b.js

import * as d3 		from 'd3';

import { cmn }		from '../common';
import { uc } 		from './udui-common';

export var uSplitter = (function() { 

	'use strict';

	var serviceId = 'uduiSplitterB';

	/* jshint validthis: true */

	var svc: any = {};

	//	This is just the bar (what the user clicks on and drags) of the splitter 
	//	functionality.
	//
	//	This bar is simply a child of a panel.
	//
	//	The panel (that this bar is on) has two other child controls - two panels 
	//	that are placed on either side of this bar.
	//
	//	This bar, when dragged, simply calls the panel (its parent element) to move 
	//	this bar and change the size of the two child panels and move one of them
	//	(moves the right panel if this is a horz splitter, the bottom panel if this 
	//	is a vert splitter).

	//	Splitter Move
	//
	function dragMoveStarted ( d, i, ele ) {
		var sW = serviceId + ' dragMoveStarted()';
		cmn.log ( sW );
		d3.select ( this )			//	select group
			.select ( 'rect' )		//	select rect from group
			.classed ( 'u34-splitter-rect',          false )
			.classed ( 'u34-splitter-rect-dragging', true  );
	}	//	dagMoveStarted()

	function dragMoved ( d, i, ele ) {
		var sW = serviceId + ' dragMoved()';
//		cmn.log ( sW );
//		cmn.log ( sW, ' d.x: ' + d.x + '   d3.event.x: ' + d3.event.x + '   d3.event.dx: ' + d3.event.dx );
	//	if ( d.vh === 'horz' )
	//		d3.select ( this )
	//			.attr ( 'transform', function ( d, i ) { return 'translate(' + (d.x = d3.event.x) + ',' + d.y + ')'; } );
	//	if ( d.vh === 'vert' )
	//		d3.select ( this )
	//			.attr ( 'transform', function ( d, i ) { return 'translate(' + d.x + ',' + (d.y = d3.event.y) + ')'; } );
//		cmn.log ( sW, ' d.y: ' + d.y );
	//	d.parentPanel.splitterMove ( d3.event.dx, d3.event.dy );
		d.move ( this, d3.event.x, d3.event.y, d3.event.dx, d3.event.dy );
	}	//	dragMoved()

	function dragMoveEnded ( d, i, ele ) {
		var sW = serviceId + ' dragMoveEnded()';
		cmn.log ( sW );
		d3.select ( this )
			.select ( 'rect' )
			.classed ( 'u34-splitter-rect',          true )
			.classed ( 'u34-splitter-rect-dragging', false );
	}	//	dragMoveEnded()

//	function SplitterData ( x, y, w, h, name, vh ) {
	function SplitterData ( o ) {
		this.type = uc.TYPE_SPLITTER;
		this.x = o.x;
		this.y = o.y;
		this.w = o.w;
		this.h = o.h;
		this.name = o.name;
	
		this.vh = o.vh;						//	'vert' or 'horz'
	
		this.panel = null;					//	set by the panel the splitter is on
		this.eleId = null;					//	set by the panel the splitter is on

	}	//	SplitterData()


//	svc.createSplitterData = function ( x, y, w, h, name, vh ) {
	svc.createSplitterData = function ( o ) {

		return new SplitterData ( o );

	};	//	svc.createSplitterData()

	SplitterData.prototype.move = function ( g, x, y, dx, dy ) {
		var sW   = serviceId + ' SplitterData.prototype.move()';
		if ( this.vh === 'horz' )
			d3.select ( g )
				.attr ( 'transform', function ( d: any, i ) { 
					return 'translate(' + (d.x = x) + ',' + d.y + ')'; } );
		if ( this.vh === 'vert' )
			d3.select ( g )
				.attr ( 'transform', function ( d: any, i ) { 
					return 'translate(' + d.x + ',' + (d.y = y) + ')'; } );
//		cmn.log ( sW, ' d.y: ' + d.y );
		this.parentPanel.splitterMove ( dx, dy );
	};	//	SplitterData.prototype.move()

	svc.defineSplitter = function ( panel ) {
		var sW = serviceId + ' defineSplitter()';
	//	Evidently having multiple <defs> messes things up.  Putting all the clip paths 
		//	under one <defs>.  See Panel.prototype.addControls().
		var data = null;
	//	var g = panel.data.base.selectAll ( 'g' )
	//		.data ( panel.data.childData.data, function ( d ) { 

		var s = panel.data.base.selectAll ( '#' + panel.data.eleId + '-base' + ' > g' );
		cmn.log ( sW, '  s length: ' + s._groups[0].length );

		var g = s
			.data ( panel.data.childData.data, function ( d ) { 
					data = d;
					return d.id || (d.id = ++panel.data.childData.nextId); 
			} )
			.enter()
			.each ( function ( d ) { cmn.log ( 'defineSplitter() - g - new data: ' + d.name ); } )
			.append ( 'g' )
			.attr ( 'id',        function ( d, i ) { return d.eleId; } )
			//	group has no x, y - must transform -
			.attr ( 'transform', function ( d, i ) { return 'translate(' + d.x + ',' + d.y + ')'; } );

		g
			.call ( d3.drag()
				.on ( 'start', dragMoveStarted )
				.on ( 'drag',  dragMoved )
				.on ( 'end',   dragMoveEnded ) );

		g.each ( function ( d ) {
			var r = g.append ( 'rect' )
				.attr ( 'id',     function ( d ) { return d.eleId + '-splitter-bar'; } )
				.attr ( 'x',      0 )
				.attr ( 'y',      0 )
				.attr ( 'width',  function ( d ) { return d.w; } )
				.attr ( 'height', function ( d ) { return d.h; } );
			if ( d.vh === 'horz') {
				r.attr ( 'class',  'u34-splitter-rect   u34-splitter-horz' );
				g.append ( 'line' ) 
					.attr ( 'id',    d.eleId + '-splitter-left-border' )
					.attr ( 'x1',    0 )
					.attr ( 'y1',    0 )
					.attr ( 'x2',    0 )
					.attr ( 'y2',    d.h )
					.attr ( 'class', 'u34-splitter-border2' );
				g.append ( 'line' ) 
					.attr ( 'id',    d.eleId + '-splitter-right-border' )
					.attr ( 'x1',    d.w )
					.attr ( 'y1',    0 )
					.attr ( 'x2',    d.w )
					.attr ( 'y2',    d.h )
					.attr ( 'class', 'u34-splitter-border2' );
			}
			if ( d.vh === 'vert') {
				r.attr ( 'class',  'u34-splitter-rect   u34-splitter-vert' );
				g.append ( 'line' ) 
					.attr ( 'id',    d.eleId + '-splitter-top-border' )
					.attr ( 'x1',    0 )
					.attr ( 'y1',    0 )
					.attr ( 'x2',    d.w )
					.attr ( 'y2',    0 )
					.attr ( 'class', 'u34-splitter-border2' );
				g.append ( 'line' ) 
					.attr ( 'id',    d.eleId + '-splitter-bottom-border' )
					.attr ( 'x1',    0 )
					.attr ( 'y1',    d.h )
					.attr ( 'x2',    d.w )
					.attr ( 'y2',    d.h )
					.attr ( 'class', 'u34-splitter-border2' );
			}
		} );

		return { g: g, data: data };

	};	//	svc.defineSplitter()

	return svc;

})();
