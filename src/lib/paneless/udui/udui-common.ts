//  udui-common.ts

import * as d3				from 'd3';

import { cmn }				from '../common';

let lastUduiId = 0;

let lastUduiSvgEleId = 0

export let uc = (function() { 

	'use strict';

	var serviceId = 'uduiCommon';

	/* jshint validthis: true */

	let fullScreenClick = null;

	var svc: any = {};

//	svc.svg = null;

	//	So far, two root panels: header and client.  The client root panel is 
	//	sometimes called the app panel or just the root panel.
	//	The data of the client root panel is at rootData.data[0].
	//	To focus/force attention and actions to a popup menu or modal dialog, 
	//	for examples, a screen panel is displayed over all the app - that 
	//	screen panel is also a root panel and the popup or dialog is a child 
	//	of it.
//	svc.rootData = {		
//		nextId: 	0,		//	Each item in data[] must have a unique Id.  
//		data: 		[]		//	nextId is set by the panel service - uPanel.
//	};

	svc.getUduiSvgEleId = function() {
		return ++lastUduiSvgEleId;
	}

	svc.getUduiId = function() {
		return ++lastUduiId;
	}

	svc.getLastUduiId = function() {
		return lastUduiId;
	}

	 svc.setLastUduiId = function( uduiId ) {
		lastUduiId = uduiId;
	}

	svc.appPanelClick 	= null;		//	When clicking on the client root panel.

	svc.panelSvc 		= null;		//	To avoid circular reference issues, I think.

//	svc.ROOT_UDUI_ID 	= 0;

	svc.APP_CLIENT_ROOT_PANEL_NAME 			= 'client-root-panel';
//	svc.APP_CLIENT_ROOT_PANEL_ELE_ID 		= '0';
	svc.APP_CLIENT_ROOT_PANEL_ELE_ID 		= 'app-client-root';
	svc.APP_CLIENT_ROOT_PANEL_STORE_ID 		= 1;		//	some panel store Ids are reserved - this is one
	svc.APP_CLIENT_ROOT_PANEL_STORE_NAME	= 'RRWebApp';

	svc.SAVE_AS_DLG_STORE_ID 		= 2;		//	another one
	svc.SAVE_AS_DLG_STORE_NAME 		= 'RRDlgSaveAs';

	svc.PROPERTIES_DLG_STORE_ID		= 3;
	svc.PROPERTIES_DLG_STORE_NAME 	= 'RRDlgProperties';

	svc.NEW_LABEL_DLG_STORE_ID 		= 4;
	svc.NEW_LABEL_DLG_STORE_NAME 	= 'RRDlgNewLabel';

	svc.GRID_DLG_STORE_ID 			= 5;
	svc.GRID_DLG_STORE_NAME 		= 'RRDlgGrid';

	svc.PROPERTIES_BOARD_STORE_ID	= 6;
	svc.PROPERTIES_BOARD_STORE_NAME = 'RRBoardProperties';

	svc.LOAD_DLG_STORE_ID 			= 7;
	svc.LOAD_DLG_STORE_NAME 		= 'RRDlgLoad';


	svc.APP_HEADER_ROOT_PANEL_NAME 			= 'header-panel';
//	svc.APP_HEADER_ROOT_PANEL_ELE_ID 		= '1';
	svc.APP_HEADER_ROOT_PANEL_ELE_ID 		= 'app-header-root';
	svc.APP_HEADER_ROOT_PANEL_STORE_ID 		= 8;
	svc.APP_HEADER_ROOT_PANEL_STORE_NAME	= 'RRWebAppHeader';
	svc.APP_HEADER_ROOT_PANEL_HEIGHT		= 26;

	svc.LOGIN_DLG_STORE_ID 			= 9;
	svc.LOGIN_DLG_STORE_NAME		= 'RRDlgLogin';
	
	svc.SIGN_IN_BUTTON_WIDTH 		= 120;


	svc.FIRST_PANEL_STORE_ID 		= 101;		//	first not-reserved store Id


	svc.OFFS_4_1_PIX_LINE		= 0.5;		//	without this SVG antialiasing makes 1 pix lines appear to be 2 wide

	svc.PANEL_BORDER_WIDTH		= 1;		//	same for the outside border of a splitter

	svc.SCROLL_BORDER_WIDTH		= 1;

	svc.VERT_SCROLL_WIDTH  		= 7;
	svc.HORZ_SCROLL_HEIGHT 		= 7;

	svc.VERT_GEN_SCROLL_WIDTH	= 10;
	svc.HORZ_GEN_SCROLL_HEIGHT	= 10;

	svc.MOVE_HANDLE_WIDTH  		= 7;
	svc.MOVE_HANDLE_HEIGHT 		= 7;

	svc.SIZE_HANDLE_WIDTH		= 7;
	svc.SIZE_HANDLE_HEIGHT		= 7;

	svc.SAVE_HANDLE_WIDTH 		= 7;
	svc.SAVE_HANDLE_HEIGHT 		= 7; 

	svc.CLOSE_HANDLE_WIDTH 		= 7;
	svc.CLOSE_HANDLE_HEIGHT 	= 7; 

	svc.CONNECTOR_WIDTH			= 11;
	svc.CONNECTOR_HEIGHT		= 11;

	svc.SPLITTER_WH				= 7;		//	width (for horz splitter) / height (for vert splitter) of
											//	splitter bar

	svc.INPUT_BORDER_WIDTH 		= 1;
	svc.INPUT_PADDING_LEFT 		= 2;		//	See .u34-input in app.css.
	svc.INPUT_PADDING_RIGHT		= 2;		//	See .u34-input in app.css.

	svc.SPLITTER_BORDER_W 		= 1;		//	i.e., the splitter bar border width

	svc.LIST_BORDER_WIDTH		= 1;		//	same for the outside border of a splitter
	svc.TREE_BORDER_WIDTH		= 1;		//	same for the outside border of a splitter

	svc.CHECKBOX_BOX_WIDTH 		= 10;
	svc.CHECKBOX_BOX_HEIGHT 	= 10;

	svc.TABS_TABS_TAHA 			= 3;		//	TAHA: 	Text Area Height Addition
	svc.TABS_TABS_EAWL			= 4;		//	EAWL: 	Empty Area Width - to left of tabs
	svc.TABS_TABS_EAWR			= 12;		//	EAWR: 	Empty Area Width - to right of tabs
	svc.TABS_TABS_EAH 			= 5;		//			and height of empty area below tabs
	svc.TABS_TABS_PLUS_W 		= 20;		//	Width of always-present tab the user clicks on to add a tab.

	svc.TABLE_MIN_WIDTH 		= 80;		//	controller width can go to 0
	svc.TABLE_MIN_COL_WIDTH 	= 10;		//	min width of what is displayed in a cell  -  that is, min 
											//	width of <td>'s <div>

											
	svc.TYPE_ANY				= 'any';
	
	svc.TYPE_BUTTON 			= 'button';
	svc.TYPE_CHECKBOX 			= 'checkbox';
	svc.TYPE_INPUT 				= 'input';
	svc.TYPE_LABEL 				= 'label';
	svc.TYPE_TEXTAREA 			= 'textarea';
	svc.TYPE_EDITOR				= 'editor';
	svc.TYPE_CANVAS				= 'canvas';
	svc.TYPE_LIST 				= 'list';
	svc.TYPE_LISTITEM			= 'list-item';
	svc.TYPE_TREE 				= 'tree';
	svc.TYPE_GRAPH				= 'graph';
	svc.TYPE_PANEL0				= 'panel0';
	svc.TYPE_PANEL 				= 'panel';
	svc.TYPE_PANEL_BASE 		= 'panel-base';
	svc.TYPE_TABLE 				= 'table';
	svc.TYPE_TABLE_CELL			= 'table-cell';
	svc.TYPE_TABS0				= 'tabs0';
	svc.TYPE_TABS 				= 'tabs';
	svc.TYPE_TABS_TAB 			= 'tabs-tab';
	svc.TYPE_SPLITTER			= 'splitter';

	svc.dragee  				= null;
	svc.isDragging 				= false;

	svc.offsX = 0;
	svc.offsY = 0;

//	svc.rootPanel = null;

	svc.appHeader = {};						//	Members - signin button, etc.

//	var appScreenPanels = [];				//	When a modal dialog is displayed it will go on a screen.
											//	Then if a popu menu, for example, is displayed it is easier
											//	to just put up another screen.
	svc.mouseOp = null;

	svc.localXY = function ( ctrlData, eventClientX, eventClientY, baseX, baseY ) {
		//	calc X Y local to the panel
		var x  = eventClientX - svc.offsX - baseX;
		var y  = eventClientY - svc.offsY - baseY;
		var cd = ctrlData;
		while ( (cd.parentPanel) || (cd.parent) ) {
			x -= Math.round ( cd.x );
			y -= Math.round ( cd.y );
			if ( cd.parentPanel )
				cd = cd.parentPanel.data;
			else
				cd = cd.parent.data;
		}
		if ( (cd !== ctrlData) && (cd.type === svc.TYPE_PANEL) ) {
			var bd = cd.baseData[0];		//	adjust for root panel pan 
			x -= Math.round ( bd.x );
			y -= Math.round ( bd.y );
		}
		return { x: x, y: y };
	};	//	localXY()

	svc.pageXY = function ( ctrlData, eventClientX, eventClientY, baseX, baseY ) {
		//	calc X Y on the web page
		//	(this is just a guess - i.e., this needs work)
		var x  = eventClientX - svc.offsX - baseX;
		var y  = eventClientY - svc.offsY - baseY;
		var cd = ctrlData;
		while ( (cd.parentPanel) || (cd.parent) ) {
			x += Math.round ( cd.x );
			y += Math.round ( cd.y );
			if ( cd.parentPanel )
				cd = cd.parentPanel.data;
			else
				cd = cd.parent.data;
		}
		if ( (cd !== ctrlData) && (cd.type === svc.TYPE_PANEL) ) {
			var bd = cd.baseData[0];		//	adjust for root panel pan 
			x += Math.round ( bd.x );
			y += Math.round ( bd.y );
		}
		return { x: x, y: y };
	};	//	pageXY()

	svc.initiateDrag = function ( panelData, w, h ) {
		var sW  = serviceId + ' initiateDrag()';
		var svc = this;
		var pd  = panelData, x, y, rootPanel = null;
		cmn.log ( sW, 'mouse x y ' + svc.mouseOp.x + ' ' 
					+ svc.mouseOp.y 
					+ '  ele x y ' + svc.mouseOp.eleX + ' ' 
					+ svc.mouseOp.eleY );
		//	drag on top of all else, in root panel's coordinates
		x = pd.x;
		y = pd.y;
		pd = pd.parentPanel ? pd.parentPanel.data : null;
		while ( pd ) {
			if ( pd.name === svc.APP_CLIENT_ROOT_PANEL_NAME )
				rootPanel = pd.panel;
			else {
				x += pd.x;
				y += pd.y;
			}
			pd = pd.parentPanel ? pd.parentPanel.data : null;
		}
		if ( ! rootPanel )
			return;

		var bd = rootPanel.data.baseData[0];	//	adjust for root panel pan 
		x += Math.round ( bd.x );
		y += Math.round ( bd.y );

		svc.dragee = {
			x:  x,	
			y:  y,	
			w:  w,	
			h:  h,	
			dx:	0,	
			dy:	0,
			dragCtrlData: 	panelData,
			rootPanel: 		rootPanel
		};
		svc.isDragging = true;
	};	//	initiateDrag()


	svc.isDefined = function ( a ) {
		return (typeof a !== 'undefined');
	};	//	isDefined()

	svc.isObject = function ( a ) {
		return (typeof a === 'object') && (a !== null) && ! this.isArray ( a );
	};
	
	svc.isBoolean = function ( a ) {
		return (typeof a === 'boolean');
	};	//	isBoolean()

	svc.isString = function ( a ) {
		return (typeof a === 'string');
	};	//	isString()

	svc.isNumber = function() {
		if ( arguments.length <= 0 ) {
			return false; }
		for ( let i = 0; i < arguments.length; i++ ) {
			if ( typeof arguments[i] !== 'number' ) {
				return false; } }
		return true;
	};	//	isNumber()

	svc.isFunction = function ( a ) {
		return (typeof a === 'function');
	};	//	isFunction()

	svc.isArray = function ( a ) {
		return Array.isArray ( a );
	};	//	isArray()
	
	svc.upAppScreen = function ( o ) {
		var sW = o.sc + ' ' + serviceId + ' upAppScreen()';
//		cmn.log ( sW );
		let rpd = o.rpd;
		var svc = this;

		var x = 0.0;
		var y = 0.0;
		var w = rpd.w;
		var h = rpd.h;

		let fr, prvOnClick = null;
		function full ( e ) {
			cmn.log ( sW, ' full()' );
			let x = e.clientX;
			let y = e.clientY;
			if ( 	(x < fr.x) 
				 || (y < fr.y)
				 || (x > fr.x + fr.width )
				 || (y > fr.y + fr.height) ) {
				e.stopPropagation = true;
				if ( (e.type === 'click') && o.clickCB ) {
					o.clickCB ( null ); } } 
		//	else {
		//		e.preventDefault(); }

		//	let a = document.getElementsByClassName ( 'rr-app-frame' );
		//	a[0].dispatchEvent ( e );
		}
		if ( o.bFullScreen ) {
			let p = rpd.svg.node().parentElement;
		//	let r = p.getBoundingClientRect();
		//	x = -r.x;
		//	y = -r.y;
		//	w = window.innerWidth;
		//	h = window.innerHeight;
			fr = p.getBoundingClientRect();
		//	fullScreenClick = { prvOnClick: window.onclick };
		//	window.onclick = full; }

		//	fullScreenClick = { prvOnClick:		document.onclick,
		//						prvMouseDown:	document.mousedown,
		//						prvMouseUp:		document.mouseup };
		//	document.onclick	= full;
		//	document.mousedown	= full;
		//	document.mouseup	= full; 

			fullScreenClick = { blockElementId: 'rr-app-full-block' };
		
			let block	= document.createElement ( 'div' );
			block.id		= fullScreenClick.blockElementId;
			block.className	= 'u34-popupmenu-full-screen';
			block.onclick	= full;
		//	let ar = document.getElementById ( 'rr-app-root' );
		//	ar.appendChild ( block );

		//	p.insertBefore ( block, rpd.svg.node() );
			p.appendChild ( block );
		}

		var panel = null;

		//	a panel (probably invisible) that covers the entire app

		var asd = svc.panelSvc.createTemporaryPanelData (  { 	//	App Screen Data
			rpd:			rpd,
			x: 		 		x,
			y: 		 		y,
			w: 		 		w, 
			h: 		 		h, 
			name: 	 		'app-screen-' + rpd.appScreenPanels.length,
			clickCB: 		o.clickCB ? o.clickCB : null,
			baseClass: 		o.baseClass,
			borderClass: 	'u34-panel-border-transparent' ,
			hasBorder: 		false,
			bMoveRect: 		false,
			bSizeRect: 		false,
			bVertSB: 		false,
			bHorzSB: 		false } );

		asd.eleId  = 'rr-udui-screen';							//	Normally the parent panel sets this.  Since this 
	 	asd.eleId += '-' + rpd.appScreenPanels.length;			//	panel has no parent we do it here.
		rpd.rootData.data.push ( asd );
		panel = svc.panelSvc.createPanel ( rpd.svg, rpd.rootData, true );
		rpd.appScreenPanels.push ( panel );
		return panel;
	};	//	upAppScreen()

	svc.appScreenPanel = function ( rpd ) {
		var i = rpd.appScreenPanels.length - 1;
		if ( i < 0 ) 
			return null;
		return rpd.appScreenPanels[i];
	};	//	appScreenPanel()

	svc.downAppScreen = function ( rpd ) {
		var sW = serviceId + ' downAppScreen()';
		cmn.log ( sW );
		var svc = this;

	//	if ( ! svc.rootPanel )
	//		return;

		if ( fullScreenClick ) {
		//	window.onclick = fullScreenClick.prvOnClick;

		//	document.onclick	= fullScreenClick.prvOnClick;
		//	document.mousedown	= fullScreenClick.prvMouseDown;
		//	document.mouseup	= fullScreenClick.prvMouseUp;
		
			let block = document.getElementById ( 
							fullScreenClick.blockElementId );
			block.parentElement.removeChild ( block );
			fullScreenClick = null; 
		}
		
		var panel = svc.appScreenPanel ( rpd );
		if ( ! panel )
			return;

	//	rpd.panel.rmvControl ( panel );
	//	The screen panel is a root panel. It is not a control of rpd.panel 
	//	(which is also a root panel).

		svc.panelSvc.rmvClipPaths ( panel.data );

		d3.select ( '#' + panel.data.eleId )
			.remove();
		rpd.rootData.data.pop();

		rpd.appScreenPanels.pop();
	};	//	downAppScreen()

	svc.appScreenPanelEleId = function ( rpd ) {
		var svc = this;
		var panel = svc.appScreenPanel ( rpd );
		if ( ! panel )
			return;
		return panel.data.eleId;
	};	//	appScreenPanelEleId()
	
	svc.isAppScreenPanel = function ( panel ) {
		var svc = this;
		var screenPanel = svc.appScreenPanel ( panel.data.rpd );
		if ( ! screenPanel )
			return;
		return panel.data.eleId === screenPanel.data.eleId;
	};	//	isAppScreenPanel()

	//	This was menuItemHTML() in udui-list-b.js.  Moved here to try to 
	//	use it for labels also.
	svc.textHTML = function ( d, i ) {
		let	text, iconHTML, textHTML,
			html;
		let ld = d;
		let textClass = 'u34-label-text';
		let isListItem = (d.type === svc.TYPE_LISTITEM);
		if ( isListItem ) {
			ld = d.ld;
			textClass = 'u34-list-item-text'; }
		//	submenu or dialog
		if ( d.text.endsWith ( '>' ) ) {
			text = d.text.slice ( 0, -1 ).trimRight();
			iconHTML = 
				'<i '
			+		'class="fa fa-chevron-right" '
		//	+		'style="padding-top: 1px;">'
			+		'style="padding-right: 4px; padding-top: 2px;">'	//	2018-Apr-21
			+	'</i>';

		} else
		if ( d.text.endsWith ( '...' ) ) {
			text = d.text.slice ( 0, -3 ).trimRight();
		//	iconHTML = '<span>...</span>';
			iconHTML = '<span style="padding-right: 4px;">...</span>';
		} else {
			text = d.text;
			iconHTML = '';
		}

		//	look for hot key
		let iOB = text.indexOf ( '[' );
		let iCB = text.indexOf ( ']' );
		if ( iCB - iOB === 2 ) {
			textHTML = 
		//		'<span>'
		//		'<span style="padding-left: 6px">'		//	2018-Apr-21
				(isListItem ? '<span style="padding-left: 6px">' : '<span>')
			+		text.slice ( 0, iOB ) 
			+ 		'<span style="text-decoration: underline;">' + text[iOB + 1] + '</span>' 
			+ 		text.slice ( iCB + 1 )
			+	'</span>';
		} else
			textHTML = text;

		let align = "";
		if ( 	(d.type === svc.TYPE_LABEL)
			 && (d.horzAlign        === 'right'    ) ) {
			align = 'text-align: right'; }

		html = 
			'<div '
		+		'class="' + textClass + '" '
		+		'style="width: ' + (ld.w - 2) + 'px; '
		+              'font-family: ' + ld.ff + '; '
		+              'font-size: ' + ld.fs + 'px; '
		+              align + '">'
		+		textHTML
		+		iconHTML
		+	'</div>';

		return html;					
	}	//	textHTML()

	svc.varValHTML = function ( d, i ) {
		//	d is expected to have -
		//	-	text			variable name
		//	-	input {
		//			val				value of the variable
		//			bEditable		is valText editable
		//			type			number or text
		//			step			if type is number	
		let	varNameHTML, valHTML,
			html;
		let textClass = 'u34-label-text';

		varNameHTML = 
			'<div '
		+		'id="' + d.td.eleId + '-' + d.id + '-input-div-div">'
		+		d.text + ': '
		+	'</div>';

		let val = d.input.val;
		if ( cmn.isString ( val ) ) {
			val = val.replace ( /\"/gi, '&quote;' ); }

		valHTML = 
			'<input '
			+	'id="' + d.td.eleId + '-' + d.id + '-input-div-input" '
			+	'type="' + d.input.type + '" '
			+	'step="' + d.input.step + '" '
			+	'autocorrect="off" '
		//	+	'disabled="' + (d.input.bEditable ? 'false" ' : 'true" ')
			+	(d.input.bEditable ? '' : 'disabled ')
			+	'spellcheck="false" '
			+	'class="u34-input" '
			+	'style="height: 15px; '
					+  'border: none; '
					+  'padding-top: 0px; '
					+  'flex: 1; '
					+  'color: black; '
					+  'background-color: white;" '
		//		.on ( 'input', inputInput )		//	fires on any change
		//		.on ( 'change', inputChange )	//	fires when focus lost or on Enter key
			+	'value="' + val + '">'
		+   '</input>';

		html = 
			'<div '
		+		'id="' + d.td.eleId + '-' + d.id + '-input-div" '
		+		'class="' + textClass + '" '
	//	+		'style=' + d.style() + '>' 
		+		'style="width: ' + d.inputWidth() + 'px; '
		+              'font-family: ' + d.td.ff + '; '
		+              'font-size: ' + d.td.fs + 'px; '
		+			   'display: flex; '
		+			   'flex-direction: row;">'
		+		varNameHTML
		+       valHTML
		+	'</div>';

		return html;					
	}	//	varValHTML()

	svc.booleanify = function ( value ) {
		let s: any = Number ( value );
		if ( Number.isNaN ( s ) ) {
			s = value.toLowerCase().trim();
			s = (s === 'true') ? s : 'false'; }
		else {
			s = (s !== 0) ? 'true' : 'false'; }
		return s === 'true';
	}	//	booleanify()

	svc.Zoom = function ( o ) {

		function zoom() {
			const sW = serviceId + ' Zoom() zoom()';
			let e = d3.event;
			if ( ! e.sourceEvent ) {
				return; }
			let tgtId = e.sourceEvent.currentTarget.id;
		//	cmn.log ( sW, tgtId );
		//	if ( ! self.grfD ) {
		//		return; }

			let g = o.zge.g;

			g.attr ( "transform",  ( d: any ) => {
				//	D3 maintains separate zoom transforms for each element.
				//	This zoom event is fired for the element the mouse is
				//	over at the time. But we want to scale just the main grfD
				//	element - r. So if the zoom here is not of that element 
				//	we multiply that zomm by r's and set r. And we reset
				//	the event element's zoom transform to 1 which seems to
				//	ellimnate jitters.
				let etk = d3.event.transform.k;
				let r = o.rect;
				let k = 1;
				if ( tgtId !== r ) {	//	Not the tranform we're looking for?
					let sr: any = d3.select ( '#' + r );
					let t : any = d3.zoomTransform ( sr.node() );
				//	cmn.log ( sW, 't.k ' + t.k + '   etk ' + etk );
					k = t.k = t.k * etk;
					if ( k < o.zge.lowerExtent ) {
						k = o.zge.lowerExtent; }
					if ( k > o.zge.upperExtent ) {
						k = o.zge.upperExtent; }
					d3.event.transform.k = 1; }
				else {
					k = etk; }


				//	Use o.d because d (of g above) may not be that of the
				//	control (for example, its the base in the panel).
				o.d.scale = k;

				let panX = o.d.panX / o.d.scale;
					panX = Math.round ( panX * 2 ) / 2;
				let panY = o.d.panY / o.d.scale;
					panY = Math.round ( panY * 2 ) / 2;
				let st =   "scale(" + o.d.scale + ") "
						 + "translate(" + panX + "," + panY + ")";
			//	cmn.log ( sW, 'transform: ' + st );
				return st; } );

			o.cb();
		}	//	zoom();

		return zoom; 
	}	//	Zoom()

	svc.ZoomFilter = function() {

	//	function zoomFilter ( rg ) {
		function zoomFilter ( e : MouseEvent ) {
			//	Zoom events. d3 docs say filtering ctrlKey and butt are the
			//	defaults.
			//	Adding mousedown, mouseup and mousemove so those can be used
			//	for panning.  See udui-graph-a.js.
	//		let e = d3.event;
			return 	   (! e.ctrlKey)
					&& (! e.button)
					&& (  e.type !== 'mousedown')
					&& (  e.type !== 'mouseup')
					&& (  e.type !== 'mousemove');
		}	//	zoomFilter

		return zoomFilter;
	}	//	ZoomFilter()

	return svc;

})();

export { uc as default }
