
//  app/udui/udui-tabs-a.js

//	Next - Want a tabs control to fill a panel -
//
//		splitters separating that panel and others
//
//		no scrolling/panning the panel - each tab's content will be a panel 
//		with that capability
//
//		some UI/indicator allowing user to drag that panel that contains the 
//		tabs control so as to dock it somewhere else or float it 
//
//	Why? -
//
//		to integrate with splitter and drag/drop functionalities
//
//	"host panel" - 
//
//		what the panel that is filled by the tabs control is called 
//
//		probably does not need the base <g> or base <rect> - unless that would 
//		mess up splitter and drag/drop functionalities
//
//	drag/drop -
//
//		how to drag/drop the entire tabs control?  vs one of the tab's content 
//		panels? what to click on and drag?
//
//		maybe this -
//
//			alt-click on a tab with content then drag/drop that content panel 
//			- allows moving tab to another position in the same tabs control - 
//			if the tab is dragged to another panel/tabs then remove it from 
//			the source tabs control
//
//			alt-click on the + tab then drag/drop the host panel (with the 
//			tabs control in it)

import * as d3 		from 'd3';

import { cmn }		from '../common';
import { uc } 		from './udui-common';
import { uCD } 		from './udui-control-data-a';
import { uLabel } 	from './udui-label-b';

export var uTabs = (function() { 

	'use strict';

	var serviceId = 'uduiTabsA';

	/* jshint validthis: true */

	var svc: any = {};

	function tabClick (  evt: PointerEvent, d: any ) {
		var sW = serviceId + ' tabClick()';
		cmn.log ( sW, 'd.id ' + d.id + '  d.text ' + d.text );
		evt.stopPropagation();
		evt.preventDefault();

		if ( d.name === 'plus' ) {		//	add a tab?
			d.tabs.addTab ( { name: 	'anotherTab',
							  text: 	'Tab Text' } );
			return; }

		//	show the tab's content
		d3.select ( '#' + d.panel.data.eleId ).raise();

		//	indicate in the tab that it is selected
		indicateTabDeselected ( d.tabs.data );			//	deselected currently selected tab if any
		indicateTabSelected ( d.tabs.data, d );

		let td = d.tabs.data;
		if (    evt.shiftKey 
			 && cmn.isFunction ( td.shiftClickCB ) ) {
			let otherMenuItems = null;
			td.shiftClickCB ( evt, td, otherMenuItems ); 
			return; }

		if ( cmn.isFunction ( td.cb ) ) {
			td.cb ( evt, d ); }
	}	//	tabClick()

	function panelClick ( pd, x, y ) {
		var sW = serviceId + ' panelClick()';
		cmn.log ( sW );

		//	pd:	PanelData
		//	pd.tabsData and pd.tabData should be set.


	}	//	panelClick()

	function panelShiftClick ( evt, pd, otherMenuItems, ms ) {
		var sW = serviceId + ' panelShiftClick()';
		cmn.log ( sW );

		//	pd:	PanelData
		//		pd.tabsData and pd.tabData should be set.
		//
		//	ms:	MultipleSelect
		//		undefined (or possibly null) when multiple selection is not
		//		involved.

		//	Call the udui.
		pd.tabsData.shiftClickCB ( evt, pd, otherMenuItems, ms );

	}	//	panelShiftClick()

	function indicateTabDeselected ( tabsData ) {
		if ( tabsData.tabs.iSelected < 0 )
			return;
		//	indicate previously selected tab as not selected
		var td = tabsData.tabs.data[tabsData.tabs.iSelected];
		var tg = d3.select ( '#' + td.eleId );
		var lines = tg.selectAll ( 'line' ).nodes();
		d3.select ( lines[0] )		//	top
			.attr ( 'stroke', 'gray' );
		d3.select ( lines[1] )		//	right
			.attr ( 'stroke', 'lightgray' );
		d3.select ( lines[2] )		//	bottom
			.attr ( 'stroke', 'lightgray' );
		d3.select ( lines[3] )		//	left
			.attr ( 'stroke', 'lightgray' );
	}	//	indicateTabDeselected()

	function indicateTabSelected ( tabsData, iTab: number | object ) {
		const sW = 'Tabs indicateTabSelected()';
		let td = null;
		if ( typeof iTab === 'number' ) {
			if ( (! cmn.isInteger ( iTab )) || (iTab < 0) ) {
				cmn.error ( sW, 'bad iTab' );
				return; }
			td = tabsData.tabs.data[iTab]; }
		if ( typeof iTab === 'object' ) {
			td = iTab;
			iTab = tabsData.tabs.data.findIndex ( d => d.id === td.id );
			if ( (! cmn.isInteger ( iTab )) || (iTab < 0) ) {
				cmn.error ( sW, 'iTab not found' );
				return; } }

		var tg = d3.select ( '#' + td.eleId );
		var lines = tg.selectAll ( 'line' ).nodes();
		d3.select ( lines[0] )		//	top
			.attr ( 'stroke', 'white' );
		d3.select ( lines[1] )		//	right
			.attr ( 'stroke', 'gray' );
		d3.select ( lines[2] )		//	bottom
			.attr ( 'stroke', 'gray' );
		d3.select ( lines[3] )		//	left
			.attr ( 'stroke', 'gray' );
		tabsData.tabs.iSelected = iTab;
		tg.raise();
	}	//	indicateTabSelected()

//	function tabDataName ( n, tabEleId ) {
//		var sW = serviceId + ' tabDataName()';
//		var s = d3.select ( '#' + tabEleId );
//		cmn.log ( sW, ' tabEleId: ' + tabEleId + '  n: ' + n + '  data.type: ' + s.nodes()[0].__data__.type );
//	}	//	tabDataName()

	function drawTabLines ( tg, x, y, w, h ) {
		var	lines = tg.selectAll ( 'line' ).nodes();
		d3.select ( lines[0] )		//	top
			.attr ( 'x1', x     ).attr ( 'y1', 0     ).attr ( 'x2', x + w ).attr ( 'y2', 0     );
		d3.select ( lines[1] )		//	right
			.attr ( 'x1', x + w ).attr ( 'y1', 0     ).attr ( 'x2', x + w ).attr ( 'y2', y + h );
		d3.select ( lines[2] )		//	bottom
			.attr ( 'x1', x + w ).attr ( 'y1', y + h ).attr ( 'x2', x     ).attr ( 'y2', y + h );
		d3.select ( lines[3] )		//	left
			.attr ( 'x1', x     ).attr ( 'y1', y + h ).attr ( 'x2', x     ).attr ( 'y2', 0     );
	}	//	drawTabLines()

	function sizeTabs ( d, dx, dy ) {
		var n, wTabArea, wTab, w, i, td, tg, x, y, h, lines;
		n = d.tabs.data.length;
		wTabArea = d.w - uc.TABS_TABS_EAWL - uc.TABS_TABS_EAWR - uc.TABS_TABS_PLUS_W;
		if ( n > 1 )
			wTab = Math.floor ( wTabArea / (n - 1) );
		for ( i = 0; i < n; i++ ) {
			td = d.tabs.data[i];

		//	tabDataName ( 1, td.eleId );

			if ( i === 0 ) {		//	the + tab
				td.x = wTabArea + uc.TABS_TABS_EAWL;
				td.w = w = uc.TABS_TABS_PLUS_W;
			} else {
				//	position WRT <g> of all tabs - last created, first on left - to fit multiple 
				//	tabs across bottom of entire control
				td.x = uc.TABS_TABS_EAWL + (wTab * (n - 1 - i));	
				td.w = w = wTab;
			}
			if ( i === 1 )			//	tab next to the + fills in 
				td.w = w = (wTabArea + uc.TABS_TABS_EAWL - td.x);
		
		//	tg = d.tabs.g.select ( '#' + td.eleId );		don't do this 
			tg = d3.select ( '#' + td.eleId );		//	prevent __data__ change in tg element
			tg
				.attr ( 'transform', 'translate(' + td.x + ',' + td.y + ')' );

			x = 0;	y = 0;	h = td.h - uc.TABS_TABS_EAH;
			drawTabLines ( tg, x, y, w, h );

			tg.select ( 'text' )
				.attr ( 'x', td.w / 2 );

			tg.select ( 'rect' )
				.attr ( 'width', td.w );

			d3.select ( '#cp-' + td.eleId + '-rect' )
				.attr ( 'x',      x + 1 )
				.attr ( 'y',      y + 1 )
				.attr ( 'width',  w - 2 )
				.attr ( 'height', h - 2 );

			//	content panel for the tab
			td.panel.data.onSize ( td.panel.data, -1, null, dx, dy );
		}
	}	//	sizeTabs();

	function sizeStart ( d, i, ele ) {
		var j, td, n = d.tabs.data.length;
		for ( j = 0; j < n; j++ ) {
			td = d.tabs.data[j];

			//	content panel for the tab
			td.panel.data.onSizeStart ( td.panel.data, null, null );
		}
	}	//	sizeStart()

//	function sized ( d, i, ele, dx, dy ) {
//		var sW = serviceId + ' sized()';
//	//	cmn.log ( sW, ' d.name: ' + d.name + '   dx y: ' + dx + ' ' + dy );
//		d.			+= dx;
//		d.			+= dy;
//		var g = d3.select ( ele.parentNode );
//
//		//	using udui-checkbox-b for an example
//		g.select ( '#' + d.eleId + '-rect' )
//			.attr ( 'width',  d.w )
//			.attr ( 'height', d.h );
//		d.content.select ( 'rect' )						//	content's rect
//			.attr ( 'width',  d.w )
//			.attr ( 'height', d.h - d.tabH );
//
//		d.tabs.g
//			.attr ( 'transform', 'translate(' + 0 + ',' + (d.h - d.tabH) + ')' );
//
//		sizeTabs ( d, dx, dy );
//
//		g.select ( '#' + d.eleId + '-size' )
//			.attr ( 'x',      d.w - uc.SIZE_HANDLE_WIDTH )
//			.attr ( 'y',      d.h - uc.SIZE_HANDLE_HEIGHT );
//
//		d.parentPanel.updateSclrs();
//	}	//	sized()
	function sized ( d, i, ele, dx, dy ) {
		var sW = serviceId + ' sized()';
		var g = d3.select ( ele.parentNode );
		sized2 ( d, g, dx, dy );
	}	//	sized()

	function sized2 ( d, g, dx, dy ) {
		d.w += dx;
		d.h += dy;

		//	using udui-checkbox-b for an example
		g.select ( '#' + d.eleId + '-rect' )
			.attr ( 'width',  d.w )
			.attr ( 'height', d.h );
		d.content.select ( 'rect' )						//	content's rect
			.attr ( 'width',  d.w )
			.attr ( 'height', d.h - d.tabH );

		d.tabs.g
			.attr ( 'transform', 'translate(' + 0 + ',' + (d.h - d.tabH) + ')' );

		sizeTabs ( d, dx, dy );

		g.select ( '#' + d.eleId + '-size' )
			.attr ( 'x',      d.w - uc.SIZE_HANDLE_WIDTH )
			.attr ( 'y',      d.h - uc.SIZE_HANDLE_HEIGHT );

		d.parentPanel.updateSclrs();
	}	//	sized2()

	function moved ( d, i, ele, x, y ) {
		var sW = serviceId + ' moved()';
		cmn.log ( sW, ' d.name: ' + d.name + '   x y: ' + x + ' ' + y );
		d3.select ( ele.parentNode )
			.attr ( 'transform', function ( d: any, i ) { 
				return 'translate(' + (d.x = x) + ',' + (d.y = y) + ')'; 
			} );
		d.parentPanel.updateSclrs();
	}	//	moved()


	function TabData ( o ) {		//	data of the a paticular tab
		this.id 	= 0;
		this.eleId 	= '';
		this.name 	= o.name;

		//	Initialize the "base" of this object, ControlData -
		o.type      = uc.TYPE_TABS_TAB;
		o.class     = o.class     === undefined ? 'u34-tabs-tab' : o.class;
		o.hasBorder = o.hasBorder === undefined ? false          : o.hasBorder;
		uCD.callControlData ( this, o );

		//	Initialize the rest of this object -
		this.text 	= o.text;

		this.panel 	= null;		//	content panel

		this.tabs 	= null;		//	the TabsData

	}	//	TabData()

	function createTabData ( o ) {

	//	if ( TabData.prototype.constructor.name === 'TabData' ) {
	//		//	Do this once, here to avoid cir ref issue
			TabData.prototype = uCD.newControlData();
			TabData.prototype.constructor = TabData;
	//	}

		return new TabData ( o );
	}

	function Tabs ( d ) {
		this.type = uc.TYPE_TABS0;
		this.data = d;
	}

	Tabs.prototype.addTab = function ( o ) {
		var sW = serviceId + ' addTab()';
		var thisCtrl = this;
		var tsd = thisCtrl.data;
		let rpd = tsd.rpd;

		//	got to resize the existing tabs to make room for the new
		//
		//	maybe just remove existing tabs and reinsert 
		//
		//	maybe not
		
		var x, y, w, h;
		var n = tsd.tabs.data.length;
			w = Math.floor ( (tsd.w - 2 - uc.TABS_TABS_EAWR - uc.TABS_TABS_PLUS_W) / (n + 1) );

		if ( o ) {
			o.rpd = rpd;
			o.x = 0;			//	position WRT <g> of all tabs
			o.y = 0;			//
			o.w = w;			//	to fit multiple tabs across bottom of entire control
			o.h = tsd.tabH;		//	

			var td = createTabData ( o );

		//	td.tabs = thisCtrl;		//	in the tab data, a back reference to the tabs control
			//	Set, more generally, below.

			tsd.tabs.data.push ( td ); }

		var tab = tsd.tabs.g.selectAll ( 'g' )
			.data ( tsd.tabs.data, function ( d ) {
				return d.id || (d.id = ++tsd.tabs.nextId);
			} )
			.enter()
			.each ( function ( d ) {
				cmn.log ( sW, ' id: ' + d.id + '   name: ' + d.name );
				d.eleId = tsd.eleId + '-tab-' + d.id;
				//	need a clippath for the tab (see the <text> element below)
				d.rpd.panel.addClipPath ( d );
			} )
			.append ( 'g' )
		//	.insert ( 'g', ':first-child' )
				.attr ( 'id',        function ( d, i ) { return d.eleId; } )
				.attr ( 'transform', function ( d, i ) { return 'translate(' + d.x + ',' + d.y + ')'; } );

		x = 0;	y = 0;	w = 0;		h = 0;				//	will be set by sizeTabs()
		tab.append ( 'line')				//	top
			.attr ( 'x1', x ).attr ( 'y1', 0 ).attr ( 'x2', x + w ).attr ( 'y2', 0 )
			.attr ( 'stroke', 'gray' )
			.attr ( 'stroke-width', 1 );
		tab.append ( 'line')				//	right
			.attr ( 'x1', x + w ).attr ( 'y1', 0 ).attr ( 'x2', x + w ).attr ( 'y2', y + h )
			.attr ( 'stroke', 'lightgray' )
			.attr ( 'stroke-width', 1 );
		tab.append ( 'line')				//	bottom
			.attr ( 'x1', x + w).attr ( 'y1', y + h ).attr ( 'x2', x ).attr ( 'y2', y + h )
			.attr ( 'stroke', 'lightgray' )
			.attr ( 'stroke-width', 1 );
		tab.append ( 'line')				//	left
			.attr ( 'x1', x ).attr ( 'y1', y + h ).attr ( 'x2', x ).attr ( 'y2', 0 )
			.attr ( 'stroke', 'lightgray' )
			.attr ( 'stroke-width', 1 );


		tab.append ( 'text' )
			.attr ( 'text-anchor', function ( d, i ) { return 'middle'; } )
			.attr ( 'x',           function ( d, i ) { return d.w / 2; } )
			.attr ( 'y',           function ( d, i ) { return tsd.fs + 0; } )
			.attr ( 'style',       function ( d, i ) { return 'font-family: ' + tsd.ff + '; font-size: ' + tsd.fs + 'px;'; } )
			.attr ( 'class',       function ( d, i ) { return 'u34-tabs-text'; } )
			.attr ( 'clip-path',   function ( d, i ) { return 'url(#cp-' + d.eleId + ')'; } )
			.text (                function ( d, i ) { return d.text; } );

		tab.append ( 'rect' )		//	transparent - to catch click over the whole tab
			.attr ( 'x',      0 )
			.attr ( 'y',      0 )
			.attr ( 'width',  function ( d, i ) { return d.w; } )
			.attr ( 'height', function ( d, i ) { return d.h; } )
			.attr ( 'class', 'u34-tabs-tab-rect' )
			.on ( 'click', tabClick );


		//	content - 
		//		There may be multiple tabs and their content being added here. 
		//		For example, when tabs' parent is split.
		//		So first, remove panelData from tsd.childData if it is already 
		//		there.
		tab.each ( function ( d, i, g ) {
			var j, cd = tsd.childData.data, n = cd.length;
			if ( ! d.panel )
				return;
			for ( j = 0; j < n; j++ ) {
				if ( cd[j].id === d.panel.data.id ) {
					tsd.childData.data.splice ( j, 1 );
					break; } }
		} );
		//	content -
		//		Now create each tab's panel.
		tab.each ( function ( d, i, g ) {	//	content 

			let panelData = null;

			d.tabs = thisCtrl;	//	In the tab data, a back reference to the 
								//	tabs control.

			if ( d.panel ) {				//	Recreating these tabs because 
				panelData = d.panel.data;	//	of, for example, adding a 
				panelData.baseData = []; }	//	splitter?
			else {
				panelData = tsd.createPanelData ( d ); }

			panelData.parent = thisCtrl;

			tsd.childData.data.push ( panelData );
			
			d.panel = tsd.panelSvc.createPanel ( tsd.content, tsd.childData, 
												 false );
		//	panelData.panel = d.panel;					//	2022-Sep-24

			d.panel.addClipPath ( panelData );			//	2017-May-28

			if ( d.panelStoreId    && tsd.childData.stored ) { while ( 1 ) {
		//	if ( panelData.storeId && tsd.childData.stored ) { while ( 1 ) {
				let i = 0, sd = tsd.childData.stored;
				for ( ; i < sd.length; i++ ) {
					if ( sd[i].storeId === d.panelStoreId    ) {
		//			if ( sd[i].storeId === panelData.storeId ) {
						break; } }
				if ( i >= sd.length ) {
					cmn.error ( sW, 'stored childData not found' );
					break; }
				d.panel.data.name = sd[i].name;
				let cb = tsd.childData.restorePanelCB;
				if ( ! uc.isFunction ( cb ) ) {
					cmn.error ( sW, 'restore callback not set' );
					break; }
				cb ( sd[i].childData.data, d.panel ); 
				break; } }
			else {
				tsd.panelSvc.addCtrls ( d.panel, panelData.childData ); }
		} );

		//	size to get everything drawn in their right places
		sizeTabs ( tsd, 0, 0 );

		var i = tsd.tabs.iSelected;
		indicateTabDeselected ( tsd );
		if ( o ) {			//	if a tab was added
			//	indicate this new tab as selected 
			indicateTabSelected ( tsd, tsd.tabs.data.length - 1 ); } 
		else {
			//	maintain the selection
			indicateTabSelected ( tsd, i );	}
	};	//	Tabs.prototype.addTab()

	Tabs.prototype.findTabByName = function ( tabName ) {
		var thisCtrl = this;
		var tsd = thisCtrl.data;
		var i, td;
		for ( i = 0; i < tsd.tabs.data.length; i++ ) {
			td = tsd.tabs.data[i];
			if ( td.name === tabName ) 
				return td;
		}
		return null;
	};	//	Tabs.prototype.findTabByName()

	Tabs.prototype.findTabByPanel = function ( panel ) {
		var thisCtrl = this;
		var tsd = thisCtrl.data;
		var pd = panel.data;
		var i, td;
		for ( i = 0; i < tsd.tabs.data.length; i++ ) {
			td = tsd.tabs.data[i];
			if ( td.panel.data.eleId === pd.eleId )
				return td;
		}
		return null;
	};	//	Tabs.prototype.findTabByPanel()

	Tabs.prototype.rmvTab = function ( panel ) {
		var sW = serviceId + ' rmvTab()';
		var thisCtrl = this;
		var tsd = thisCtrl.data;
		var td  = thisCtrl.findTabByPanel ( panel );
		if ( ! td )
			return;

		var tabsData = tsd.tabs.data;

		//	https://github.com/d3/d3-selection/blob/master/README.md#joining-data
		//		https://bost.ocks.org/mike/join/
					
		for ( var i = 0; i < tabsData.length; i++ ) {
			if ( tabsData[i].eleId === td.eleId ) {
				tabsData.splice ( i, 1 );
				break;
			}
		}

		//	Remove the tab element.
		var tab = tsd.tabs.g.selectAll ( 'g' )
			.data ( tabsData, function ( d ) { return d.id;	} )
			.exit()
			.each ( function ( d ) { 
				cmn.log ( sW, ' - tab - old data: ' + d.eleId ); 
			} )
			.remove();

		//	Seems that d3 event data indices need to be updated so that the correct index 
		//	is passed to event functions.
		tsd.tabs.g.selectAll ( 'g' )
			.data ( tabsData, function ( d ) { return d.id; } )
			.select ( 'rect' )
				.on ( 'click', tabClick );

		//	Remove the tab's content (panel).
		tsd.panelSvc.rmvControl2 ( tsd, panel, { parentEleId: tsd.eleId + '-content' } );

		//	As with addTab(), size to get everything drawn in their right places
		sizeTabs ( tsd, 0, 0 );

		i = tsd.tabs.iSelected;
		if ( i === tsd.tabs.data.length )
			i -= 1;
		if ( i > 0 ) {
			indicateTabSelected ( tsd, i );
			d3.select ( '#' + tsd.tabs.data[i].panel.data.eleId ).raise();
		}

	};	//	Tabs.prototype.rmvTab()


	function TabsData ( o ) {		//	data for the entire tabs control

		//	Initialize the "base" of this object, ControlData -
		o.type      = uc.TYPE_TABS;
		o.class     = o.class     === undefined ? 'u34-tabs' : o.class;
		o.hasBorder = o.hasBorder === undefined ? true       : o.hasBorder;
		uCD.callControlData ( this, o );

		//	Initialize the rest of this object -
		this.ff = 'verdana';		//	font family
		this.fs = 10;				//	font size, pixels
		this.cb = o.cb ? o.cb : null;
		
		this.shiftClickCB = uc.isFunction ( o.shiftClickCB ) ? o.shiftClickCB : null;
		this.onProperties = uc.isFunction ( o.onProperties ) ? o.onProperties : null;

		this.tabH      = 0;
		this.content   = null;		//	d3 selection of <g> of content area

		this.childData = { 			//	content panel for each tab
			nextId: 	0,
			data: 		[]
		};

		this.tabs = {
			g: 			null,		//	d3 selection of <g> of all tabs.
			nextId: 	0,			//	Id assigned to each TabData.
			data: 		[],			//	Array of TabData.
			iSelected: 	-1
		};

		this.classEmptyContent = 'u34-tabs-empty-content';

		this.panelSvc = o.panelSvc; 	//	all tabs' content is a panel

		//	Override some "base" properties -
		this.onSize  = sized;
		this.onSize2 = sized2;
		this.onMove  = moved;
		this.onSizeStart  = sizeStart;

	}	//	TabsData()

	TabsData.prototype.createPanelData = function ( td, o ) {
		let tsd = this;
		let rpd = tsd.rpd;
		let a = { rpd:			rpd,
				  x: 			-0.5,  
				  y: 			-0.5, 
				  w: 			tsd.w, 
				  h: 			tsd.h - tsd.tabH, 
				  name:			'tab-content-' + td.id, 
			//	  clickCB:		uc.appPanelClick };
				  bIsTabPanel:	true,
				  tabsData:		tsd,
				  tabData:		td,
				  clickCB:		panelClick,
				  shiftClickCB:	panelShiftClick,
				  bMoveRect:	false,	//	Should not move, size a tab panel.
				  bSizeRect:	false,
				  bVertSB:		false,	//	Nor scroll/pan. For now.
				  bHorzSB:		false,
				  bStore:		cmn.isObject ( o ) ? o.bStore  : undefined,
				  storeId:		cmn.isObject ( o ) ? o.storeId : 0,
				  onProperties:	tsd.onProperties };
		
		let panelData = tsd.panelSvc.createPanelData ( a );

		//	Normally the parent panel sets this (in addControl()).  But 
		//	since this panel's parent is a tabs control  we do it here.
		if ( td ) {
			panelData.eleId = td.eleId + '-pnl'; }
		
		panelData.hasBorder = true;		//	2017-May-26
		panelData.bMoveRect = false;
		panelData.bSizeRect = false; 
		return panelData;
	}	//	TabsData.prototype.createPanelData()

	TabsData.prototype.listProperties = function() {
		var sW = serviceId + ' TabsData.prototype.listProperties()';
		var whiteList = [ 'tabs', 'ff', 'fs' ];
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
				case 'tabs':	
					displayName = 'tab text';		
					value       = this.tabs.data[this.tabs.iSelected].text; 	
					break;
				case 'ff': 		displayName = 'font';			break;
				case 'fs': 		displayName = 'font size';		break;
			}
			cmn.log ( sW, '   key: ' + key + '  value: ' + value );
			props.push ( { property: key, value: value, displayName: displayName } );
		}
		return props;
	};	//	TabsData.prototype.listProperties()

	TabsData.prototype.setProperty = function ( name, value ) {
		var sW = serviceId + ' TabsData.prototype.setProperty()';
		var rtn, n, sel, i;
		rtn = uCD.setProperty ( this, name, value );
		if ( rtn )
			return rtn;
		if ( name === 'tabs' ) {
			this[name].data[this.tabs.iSelected].text = value;
			sel = d3.select ( '#' + this.tabs.data[this.tabs.iSelected].eleId ).select ( 'text' );
			sel.text ( value );
		}
		if ( name === 'ff' ) {
			this[name] = value;
			n = this.tabs.data.length;
			for ( i = 0; i < n; i++ ) {
				sel = d3.select ( '#' + this.tabs.data[i].eleId ).select ( 'text' );
				sel.attr ( 'style', 'font-family: ' + this.ff + '; font-size: ' + this.fs + 'px;' );
			}
		}
		if ( name === 'fs' ) {
			n = Number ( value );
			if ( n !== n ) 					//	Good Grief!  ... testing for NaN ...	got'a love JS :/
				return;
			this[name] = n;
			n = this.tabs.data.length;
			for ( i = 0; i < n; i++ ) {
				sel = d3.select ( '#' + this.tabs.data[i].eleId ).select ( 'text' );
				sel.attr ( 'style', 'font-family: ' + this.ff + '; font-size: ' + this.fs + 'px;' );
			}
		}
	};	//	TabsData.prototype.setProperty()
	
	TabsData.prototype.getSelectedTabPanel = function() {
		const sW = serviceId + ' TabsData.prototype.getSelectedTabPanel()';
		cmn.log ( sW );
		if ( this.tabs.iSelected < 0 ) {
			cmn.error ( sW, 'tab not selected' );
			return null; }
		let td = this.tabs.data[this.tabs.iSelected];
		if ( ! td ) {
			cmn.error ( sW, 'bad TabData' );
			return null; }
		if (    (! td.panel) 
			 || (! td.panel.data) 
			 || td.panel.data.type !== uc.TYPE_PANEL ) {
			cmn.error ( sW, 'bad tab panel' );
			return null; }	
		return td.panel;
	};	//	TabsData.prototype.getSelectedTabPanel()


	svc.createTabsData = function ( o ) {
		return new TabsData ( o );
	};	//	svc.createTabsData()



	svc.defineTabs = function ( panel ) {
		var sW = serviceId + ' defineTabs()';
	
		var tabs = null;
		var s = panel.data.base.selectAll ( '#' + panel.data.eleId + '-base' + ' > g' );
//		cmn.log ( sW, '  s length: ' + s._groups[0].length );

		var ctrlEles = s
			.data ( panel.data.childData.data, function ( d ) { 
					return d.id || (d.id = ++panel.data.childData.nextId); 
			} )
			.enter()
			.each ( function ( d ) { 
//				cmn.log ( sW, '- g - new data: ' + d.name ); 
				tabs = new Tabs ( d );
			} )
			.append ( 'g' )
				.attr ( 'id',        function ( d, i ) { return d.eleId; } )
				//	<g> has no x, y - must transform -
				.attr ( 'transform', function ( d, i ) { return 'translate(' + d.x + ',' + d.y + ')'; } );

		ctrlEles
			.on ( 'mouseover', uCD.mouseover )
			.on ( 'mouseout',  uCD.mouseleave )
			.on ( 'mousemove', uCD.mousemove )
			.on ( 'mousedown', uCD.mousedown )
			.on ( 'mouseup',   uCD.mouseup )
			.on ( 'click',     uCD.click );

		ctrlEles.append ( 'rect' )
			.attr ( 'id',     function ( d, i ) { return d.eleId + '-rect'; } )
			.attr ( 'width',  function ( d, i ) { return d.w; } )
			.attr ( 'height', function ( d, i ) { return d.h; } )
			.attr ( 'class',  function ( d, i ) { return d.class; } );

		//	Tabs.  But the contents of just one tab are visible at a time.  
		//	Generally, all tabs (what is clicked on to change the tab viewed) 
		//	are all visible - across the bottom, for now - the "tabs".
		//
		//	So, two areas (two <g>) -
		//
		//		content 	where the selected tab is shown - width of the tabs
		//					control - height of the tabs control minus the 
		//					height of the tabs
		//
		//		tabs 		what the user clicks on to select different content 
		//					- height determined by the font used for the text 
		//					that is the name/title of the tab and the content 
		//					is shown when the tab is selected as the content to
		//					be viewed
		//
		//	There is always at least one tab - even when no content for it is 
		//	defined in which case the text will be a + (plus sign) and when the 
		//	user clicks on it the following happens ...
		//
		//		After clicking on the + tab -
		//
		//			a new tab is added
		//
		//			the text is blank - the user can click there to enter the 
		//			text for the name/title of the content for that tab 
		//
		//	A new tabs control will therefore have one tab that runs the width 
		//	of the control and displays a simple + sign. The content area will 
		//	be gray, possibly with some indication (text) that the user may 
		//	drag a panel there.

		tabs.data.content = ctrlEles.append ( 'g' )
			.attr ( 'id',        d => d.eleId + '-content' )
			.attr ( 'transform', d => 'translate(' + 0 + ',' + 0 + ')' );

		tabs.data.tabH =   uLabel.measureText ( panel, tabs.data.ff, 
													   tabs.data.fs, '^j' ).h 
						 + uc.TABS_TABS_TAHA
						 + uc.TABS_TABS_EAH;

		tabs.data.content.append ( 'rect' )
			.attr ( 'id',     d => d.eleId + '-content-rect' )
			.attr ( 'width',  d => d.w )
			.attr ( 'height', d => d.h - d.tabH )
			.attr ( 'class',  d => d.classEmptyContent );

		tabs.data.tabs.g = ctrlEles.append ( 'g' )
			.attr ( 'id',        d => d.eleId + '-tabs' )
			.attr ( 'transform', d => 'translate(' + 0 + ',' 
												   + (d.h - d.tabH) + ')' );

		if ( tabs.data.tabs.data.length === 0 ) {
			tabs.addTab ( { name: 	'plus',		//	commented out to test/debug 
							text: 	'+' } );	//	one tab at a time
			tabs.addTab ( { name: 	'firstTab',
							text: 	'Tab Text' } ); }
		else {
			tabs.addTab(); }


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

		return tabs;
	};	//	svc.defineTabs()

	return svc;

})();
