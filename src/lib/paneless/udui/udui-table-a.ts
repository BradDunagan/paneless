
//  app/partials/udui/udui-table-a.js

//	Maybe see -
//
//		Fiddle - SVG Table (using d3)
//		http://jsfiddle.net/christopheviau/v6VMf/
//
//		D3 Dynamic Array of Tables
//		https://bl.ocks.org/boeric/e16ad218bc241dfd2d6e

import * as d3 		from 'd3';

import { cmn }		from '../common';
import { uc } 		from './udui-common';
import { uCD } 		from './udui-control-data-a';

const TitleAreaHeight = 20;

export var uTable = (function() { 

	'use strict';

	var serviceId = 'uTable';

	/* jshint validthis: true */

	var svc: any = {};

	var builtInStyles = {
		divStatic: 		new StyleData ( { id:   1,
										  name: 'divStatic',
										  list: [
											{ property: 'display',    value: 'inline-block' },
											{ property: 'overflowX',  value: 'hidden' },
											{ property: 'paddingTop', value: '4px' },
											{ property: 'width',      value: '40px' },
											{ property: 'whiteSpace', value: 'nowrap' },
										  ] } ),

		tdStatic: 		new StyleData ( { id:   2,
										  name: 'tdStatic',
										  list: [
											{ property: 'borderLeft',  value: 'transparent' },
										  	{ property: 'borderRight', value: 'transparent' },
										  ] } ),

		tdSplitter: 	new StyleData ( { id:   3,
										  name: 'tdSplitter',
										  list: [
											{ property: 'borderLeft',      value: 'none' },
											{ property: 'borderRight',     value: 'none' },
											{ property: 'cursor',          value: 'col-resize' },
											{ property: 'backgroundColor', value: 'lightgray' },
										  ] } ),

		divEditable: 	new StyleData ( { id:   4,
										  name: 'divEditable',
										  list: [
											{ property: 'display',    value: 'inline-block' },
											{ property: 'overflowX',  value: 'hidden' },
											{ property: 'paddingTop', value: '4px' },
											{ property: 'width',      value: '40px' },
										  ] } ),

		tdEditable: 	new StyleData ( { id:   5,
										  name: 'tdEditable',
										  list: [
											{ property: 'borderLeft',  value: 'transparent' },
										  	{ property: 'borderRight', value: 'transparent' },
										  ] } ),
	};

	var firstCustomStyleId = 6;

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

	function click ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' click()';
		cmn.log ( sW );
		evt.stopPropagation();
		if ( evt.shiftKey && uc.isFunction ( d.shiftClickCB ) ) {
			let otherMenuItems = null;
			d.shiftClickCB ( evt, d, otherMenuItems ); 
			return;
		}
		if ( uc.isFunction ( d.cb ) ) {
		//	cmn.log ( sW, ' d.name: ' + d.name + '  callback ...' );
			d.cb ( d );
		}
	}	//	click()

	function mousedownCellDiv ( evt: PointerEvent, d: any ) {
//		var sW = serviceId + ' mousedownCellDiv()';
//		cmn.log ( sW, 'Name: ' + d.name + '  event.altKey: ' + event.altKey );
		evt.stopPropagation();
	}	//	mousedownCellDiv()

	function clickCellDiv ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' clickCellDiv()';
		cmn.log ( sW, 'Name: ' + d.name );
		evt.stopPropagation();
	}	//	clickCellDiv()

	function clickCellLong ( evt: PointerEvent, d: any ) {
		var sW = serviceId + ' clickCellLong()';
		let td = d.tableData;
		cmn.log ( sW, 'Table name: ' + td.name );
		if ( ! (   cmn.isObject ( d.input ) 
				&& cmn.isFunction ( d.input.longCB )) ) {
			cmn.error ( sW, 'd.input.longCB is not set' ); 
			return; }
		evt.stopPropagation();
		d.input.longCB ( d );
	}	//	clickCellLong()

	function inputInput ( evt, d ) {
		var sW = serviceId + ' inputInput()';
		var inputEle = evt.target;
		cmn.log ( sW, 'row col: ' + d.iRow + ' ' + d.iCol + '  value: ' + inputEle.value );
		evt.stopPropagation();

		//	set value where?  for what data?
		//
		//	this table is a properties dialog thing -
		//
		//		TableData must have a  propertiy ...
		//
		//			clientData			?
		//
		//			clientCallBack		?
		//
		//			changeCallBack		?			<--

		if ( d.tableData.inputCB )
			d.tableData.inputCB ( d, inputEle.value );
	}	//	inputInput()

	function inputChange ( evt, d ) {
		var sW = serviceId + ' inputChange()';
		var inputEle = evt.target;
		cmn.log ( sW, 'row col: ' + d.iRow + ' ' + d.iCol + '  value: ' + inputEle.value );
		evt.stopPropagation();
		if ( d.tableData.changeCB )
			d.tableData.changeCB ( d, inputEle.value );
	}	//	inputChange()

	function sized2 ( d, g, dx, dy ) {
	//	let ele = window.getElementById ( d.eleId + '-size' );
	//	sized ( d, i, ele,  dx, dy );
		sized ( d, 0, null, dx, dy );
	}	//	sized2()

	function sized ( d, i, ele, dx, dy ) {
		var sW = serviceId + ' sized()';
	//	var tableData = d, j, nCol, k, cellD, dCellWidthTotal, oldCellW, newCellW, newCellW2, sumCellWidth, wAdd = 0;
		var tableData = d, j, nCol, k, cellD,                  oldCellW, newCellW, newCellW2, sumCellWidth, wAdd = 0;
		var baseWidth, divWidth, divWidthF, dw;
		var parentPanel     = tableData.parentPanel;
		var parentPanelData = parentPanel.data;
		var bd = parentPanelData.baseData[0];
		var filledBy, sx = 0, sy = 0;

		cmn.log ( sW, ' d.name: ' + d.name 
					+ '   w h: ' + d.w + ' ' + d.h 
					+ '   dx y: ' + dx + ' ' + dy );

		if ( tableData.fillsPanel ) {
			if ( (dx > 0) && (bd.x < 0) ) {				//	scroll/pan first
				filledBy = parentPanelData.filledBy;
				sx = dx;
				if ( sx > -(bd.x + 0.5) ) {
					sx = -(bd.x + 0.5); }
//				cmn.log ( sW, ' d.name: ' + d.name 
//							+ '   sx: ' + sx );
				dx -= sx; }
			if ( (dy > 0) && (bd.y < 0) ) {				//	scroll/pan first
				filledBy = parentPanelData.filledBy;
				sy = dy;
				if ( sy > -(bd.y + 0.5) ) {
					sy = -(bd.y + 0.5); }
//				cmn.log ( sW, ' d.name: ' + d.name 
//							+ '   sy: ' + sy );
				dy -= sy; }
			if ( sx || sy ) {
				parentPanelData.filledBy = null;
				parentPanel.scroll ( { dx: sx, dy: sy } );
				parentPanelData.filledBy = filledBy; } 
			baseWidth = bd.w; }
		else {
			baseWidth = tableData.w; }

		let vw = 0;
	
//		d.w += dx;
//	//	d.h += dy;				d.h is fixed == td.tableY + td.tableEle.clientHeight
//		//	2023-May-12
		//	Similarly, d.w is not fixed, but d.w is not always/directly set by
		//	the size of the pane/parent-panel. 
		if ( tableData.fillsPanel ) {
		//	vw = baseWidth + 2 + dx; }
			vw = baseWidth + 0 + dx; }
		else {
			d.w += dx;
			vw   = d.w; }
		
		divWidth  = baseWidth < uc.TABLE_MIN_WIDTH ? uc.TABLE_MIN_WIDTH : baseWidth;

		if ( baseWidth < uc.TABLE_MIN_WIDTH ) {
			if ( tableData.fillsPanel ) {
				dx = uc.TABLE_MIN_WIDTH - baseWidth;
				vw = baseWidth;	}
			else {
				dx = divWidth - d.w;
				vw = d.w = divWidth; } }

		//	2023-May-11		Making the horz scroll work better in the parent 
		//					panel.
	//	let eContent = document.getElementById ( d.eleId + '-tbody' );
	//	if ( eContent ) {
	//		let wContent = Math.round ( eContent.getBoundingClientRect().width );
	//		if ( wContent > divWidth ) {
	//			divWidth = wContent; } }
	//	//	2023-May-12		That isn't it. But maybe this -
		//	-	Below, instead of d.w, baseWidth (+ dx?).
		//		-	This might be called vw (i.e., "visible width").
		//		-	I.e., let vw = baseWidth + dx;
		//	-	Then  d.w  can be the "content width".  d.w is set at the
		//		end here.

//		cmn.log ( sW, ' d.name: ' + d.name 
//					+ '   w h: ' + d.w + ' ' + d.h 
//					+ '   dx y: ' + dx + ' ' + dy
//					+ '   baseWidth: ' + baseWidth
//					+ '   divWidth: ' + divWidth
//					+ '   vw: ' + vw );

		var g: any = ele ? d3.select ( ele.parentNode ) : d3.select ( '#' + d.eleId );
		g.select ( '#' + d.eleId + '-rect' )
	//		.attr ( 'width',  function ( d, i ) { return d.w; } )
			.attr ( 'width',  function ( d, i ) { return  vw; } )
			.attr ( 'height', function ( d, i ) { 
				return d.h + (parentPanelData.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH); 
			} );
		g.select ( '#' + d.eleId + '-title' )
	//		.attr ( 'x',      function ( d, i ) { return d.w / 2; } )
			.attr ( 'x',      function ( d, i ) { return  vw / 2; } )
			.attr ( 'y',      function ( d, i ) { return d.fs + 2; } );

//		g.select ( '#' + d.eleId + '-fo' )
//	//		.attr ( 'width',  d => { return (d.w - 1) + 'px'; } )
//			.attr ( 'width',  d => { return ( vw - 0) + 'px'; } )
//			.attr ( 'height', d => { return (d.h    ) + 'px'; } );
//		2023-May-12		Moved this below, after new d.w.

		g.select ( '#' + d.eleId + '-size' )
	//		.attr ( 'x',      function ( d, i ) { return d.w - uc.SIZE_HANDLE_WIDTH;  } )
			.attr ( 'x',      function ( d, i ) { return  vw - uc.SIZE_HANDLE_WIDTH;  } )
			.attr ( 'y',      function ( d, i ) { return d.h - uc.SIZE_HANDLE_HEIGHT; } );
		d3.select ( '#cp-' + d.eleId + '-rect' )
			.attr ( 'width',  d => cpSizeRectW ( d, dx ) )
			.attr ( 'height', d => cpSizeRectH ( d, dy ) );

		//	size columns to maintain table filling control
		//
		divWidthF = divWidth - (d.cols.length * d.colsPaddingLeft);

		if ( (divWidthF > 0) && (tableData.nColAdj > 0) ) {
			for ( j = 0; j < tableData.rows.length; j++ ) {
				nCol = sumCellWidth = 0;
				for ( k = 0; k < tableData.cols.length; k++ ) {
					if ( nCol >= tableData.nColAdj ) {				//	this should not happen
						break; }
					cellD = tableData.rows[j].cells[k];
					if ( (! cellD.divEle) || cellD.isSplitter) {
						continue; }
					nCol++;
					oldCellW  = parseInt ( cellD.divEle.style.width );

					newCellW2 = newCellW = Math.round ( tableData.dwr[k] * divWidthF );
					
					if ( (newCellW >= uc.TABLE_MIN_COL_WIDTH) && (oldCellW >= uc.TABLE_MIN_COL_WIDTH) ) {
						if ( nCol === tableData.nColAdj ) {
							newCellW2 = divWidthF - sumCellWidth;
						}
					} else {
						if ( j === 0 ) {
							wAdd += uc.TABLE_MIN_COL_WIDTH - newCellW; }
						newCellW2 = uc.TABLE_MIN_COL_WIDTH;
//						cmn.log ( 'divWidthF: ' + divWidthF + ' k: ' + k + ' dwr: ' + tableData.dwr[k] + ' oldCellW: ' + oldCellW + ' newCellW: ' + newCellW + ' newCellW2: ' + newCellW2 );
					}
					sumCellWidth += newCellW2;
					if ( ! (   cmn.isObject ( cellD.input ) 
							&& cellD.input.longCB) ) {
						cellD.divEle.style.width = '' + newCellW2 + 'px'; }
				}
			}
		}

		//	2024-May-12
		let eContent = document.getElementById ( d.eleId + '-tbody' );
		if ( ! eContent ) {
			cmn.error ( sW, 'tbody not found' ); }
		else {
			//	- 2 because, I can't figure it out. The ...-tbody extends
			//	past the div right side by ~ 2 px.
			d.w = Math.round ( eContent.getBoundingClientRect().width - 2); }

		g.select ( '#' + d.eleId + '-fo' )
	//		.attr ( 'width',  d => { return ( d.w >= 1 ? (d.w - 1) : 0) + 'px'; } )
			.attr ( 'width',  d => (d.w >= 1 ? (d.w - 1) : 0) + 'px' )
	//		.attr ( 'width',  d => { return ( vw - 0) + 'px'; } )
	//		.attr ( 'height', d => { return (d.h    ) + 'px'; } );
			.attr ( 'height', d => (d.h    ) + 'px' );

		g.select ( '#' + d.eleId + '-fo-body-div' )
			.style ( 'width',  '' + divWidth + 'px' );
		d.parentPanel.updateSclrs();
	}	//	sized()

	function moved ( d, i, ele, x, y ) {
		var sW = serviceId + ' moved()';
//		cmn.log ( sW, ' d.name: ' + d.name + '   x y: ' + x + ' ' + y );
		let sel = null;
		if ( ele ) {
			sel = d3.select ( ele.parentNode ); }
		else {
			sel = d3.select ( '#' + d.eleId ); }
		sel.attr ( 'transform', function ( d, i ) { 
			return 'translate(' + (d.x = x) + ',' + (d.y = y) + ')'; 
		} );
		d.parentPanel.updateSclrs();
	}	//	moved()

	function split ( d, i, ele, dx, dy ) {
		var sW = serviceId + ' split()';
		var colD = d;

//		var lcE = colD.tableData.cols[colD.iCol - 1].ele;		//	left column element
//		var rcE = colD.tableData.cols[colD.iCol + 1].ele;		//	right 
//
//		var lcEw = parseInt ( lcE.style.width ) + dx;
//		var rcEw = parseInt ( rcE.style.width ) - dx;
//
//		if ( (lcEw < 2) || (rcEw < 2) )
//			return;
//
//		lcE.style.width = '' + lcEw + 'px';
//		rcE.style.width = '' + rcEw + 'px';
//		//
		//	<col> width has some, but not complete, control over the width 
		//	of the column.
		//	
		//	Generally, a <td>'s minimum width is the width of its contents.
		//	
		//	Therefore a <td>'s contents (except splitter columns) is a 
		//	<div> whose width can be set explicitly and its overflow can be 
		//	hidden. (Splitter columns' width does not change, then do not 
		//	have a div, their <td> width is set/fixed with the width style
		//	property.)
		//	
		//	A <td> element's (not a splitter column) clientWidth is 
		//	maintained in the DOM as the width of the <div> plus any left
		//	and right padding. The total width of the table is the sum of
		//	each <td>'s (of one row, of course) clientWidth.
		//	
		//	To change the table's size the width of the <div> of one or 
		//	more <td> is changed.

		let tD = colD.tableData, baseWidth, j, cellDL, cellDR, wL, wR;
		if ( colD.tableData.fillsPanel ) {
			baseWidth = colD.tableData.parentPanel.data.baseData[0].w; }
		else {
			baseWidth = colD.tableData.w; }

		var divWidth  = baseWidth < uc.TABLE_MIN_WIDTH ? uc.TABLE_MIN_WIDTH : baseWidth;
		var divWidthF = divWidth - (tD.cols.length * tD.colsPaddingLeft);

		for ( j = 0; j < tD.rows.length; j++ ) {
			cellDL = tD.rows[j].cells[colD.iCol - 1];
			cellDR = tD.rows[j].cells[colD.iCol + 1];
			
			//	div width ratio 
			if ( (! cellDL.divEle) || (! cellDR.divEle) ) {
				continue; }
			if ( cellDL.divEle.style.width !== 'unset' ) {
				wL = parseInt ( cellDL.divEle.style.width ) + dx;
				if ( wL >= 2 ) {
					cellDL.divEle.style.width = '' + wL + 'px';
					colD.tableData.dwr[colD.iCol - 1] = wL / divWidthF; } }
			if ( cellDR.divEle.style.width !== 'unset' ) {
				wR = parseInt ( cellDR.divEle.style.width ) - dx;
				if ( wR >= 2 ) {
					cellDR.divEle.style.width = '' + wR + 'px';
					colD.tableData.dwr[colD.iCol + 1] = wR / divWidthF;	} }
		}

	}	//	split()

//	function tdMouseDown ( evt ) {
//		var sW = serviceId + ' tdMouseDown()';
//		var td = this;				//	<td> element
//		var cd = td.__data__;		//	CellData
//
//		cmn.log ( sW );
//
//		evt.stopPropagation();
//
//		cd.msDown   = true;
//		cd.msDnPt.x = evt.clientX;
//		cd.msDnPt.y = evt.clientY;
//
//		var lcE = cd.tableData.cols[cd.iCol - 1].ele;		//	left column element
//		var rcE = cd.tableData.cols[cd.iCol + 1].ele;		//	right 
//
//		cd.lrcW = { lw: parseInt ( lcE.style.width ),
//					rw: parseInt ( rcE.style.width ) };
//	}	//	tdMouseDown()

//	function tdMouseMove ( evt ) {
//		var sW = serviceId + ' tdMouseMove()';
//		var td = this;				//	<td> element
//		var cd = td.__data__;		//	CellData
//
//		cmn.log ( sW );
//
//		evt.stopPropagation();
//
//		if ( ! cd.msDown )
//			return;
//
//		var dx  = evt.clientX - cd.msDnPt.x;
//
//		var lcEw = cd.lrcW.lw + dx;					//	left  column Element width
//		var rcEw = cd.lrcW.rw - dx;					//	right
//		if ( (lcEw < 2) || (rcEw < 2) )
//			return;
//
//		var lcE = cd.tableData.cols[cd.iCol - 1].ele;		//	left column element
//		var rcE = cd.tableData.cols[cd.iCol + 1].ele;		//	right 
//
//		lcE.style.width = '' + lcEw + 'px';
//		rcE.style.width = '' + rcEw + 'px';
//	}	//	tdMouseMove()

//	function tdMouseUp ( evt ) {
//		var sW = serviceId + ' tdMouseUp()';
//		var td = this;				//	<td> element
//		var cd = td.__data__;		//	CellData
//
//		cmn.log ( sW );
//
//		evt.stopPropagation();
//
//		cd.msDown = false;
//
//	}	//	tdMouseUp()

	function tdClick ( evt ) {
		var sW = serviceId + ' tdClick()';
	//	var td = this;							Is this right?
	//	var tD = td.__data__;
		cmn.log ( sW );
		evt.stopPropagation();
	//	Later.  Is td, above, right? 
	//	if ( evt.shiftKey && uc.isFunction ( d.shiftClickCB ) ) {
	//		d.shiftClickCB ( d );
	//		return;
	//	}
	}	//	tdClick()

	function StyleData ( o ) {	//	A collection of these is maintained in TableData
		this.id = 		o.id ? o.id : 0;
		this.name = 	o.name;
		//	See -
		//		https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Properties_Reference
		this.list = 	o.list ? o.list : [];		//	array of objects like, e.g.,  { property: 'width', value: '20px' }
	}	//	StyleData

	function ColumnData ( tableData, o ) {
		this.id  = 0;			//	set from tableData.nextId in createColumn().
		this.ele = null;
		this.tableData = 		tableData;
		this.iCol = 			o.iCol;

		this.colStyleId = 		o.colStyleId;								//	for the <col>
		this.colStyle = 		tableData.findStyle ( o.colStyleId );

		//	these are for each <td> (i.e., cell) of the column
		this.divStyleId = 		o.divStyleId;
		this.divStyle = 		tableData.findStyle ( o.divStyleId );
		this.tdStyleId = 		o.tdStyleId;
		this.tdStyle = 			tableData.findStyle ( o.tdStyleId );
		this.hasDiv =			o.hasDiv;
		this.isSplitter = 		o.isSplitter;
		this.isStatic =      	(uc.isDefined ( o.isStatic ) ? o.isStatic : false);
		this.isEditable = 		(uc.isDefined ( o.isEditable ) ? o.isEditable : false);
	}	//	ColumnData

	function RowData ( rgs ) {
		this.id    = 0;						//	set in Table.prototype.update()
		this.cells = rgs.cells;				//	array of CellData
	}	//	RowData()


//	function CellData ( o ) {
//		this.tableData = 	o.tableData;
	function CellData ( tableData, o ) {
		this.type = 		uc.TYPE_TABLE_CELL;
		this.tableData = 	tableData;
		this.iRow =  		o.iRow;			
		this.iCol = 		o.iCol;
//		this.divStyle = 	o.divStyle;		//	one of the Styles maintained in TableData
//		this.tdStyle = 		o.tdStyle;		//	one of the Styles maintained in TableData
//		this.hasDiv = 		o.hasDiv;
		//	set by createCell()
		this.isSplitter = 	o.isSplitter ? o.isSplitter : false;
		this.text = 		o.text       ? o.text       : null;
	//	this.long =			cmn.isBoolean ( o.long ) ? o.long : false;
		this.divEle = 		null;			//	the <td> <div> (if hasDiv)
		this.inputEle = 	null;			//	the <input> if div has one
		this.mouseDown = 	null;
		this.mouseMove = 	null;
		this.mouseUp = 		null;
		this.click = 		null;
		this.msDn = 		false;
		this.msDnPt = { x: 0,  y: 0 };
	}	//	CellData

	function Table ( d ) {
		this.data = d;
	}	//	Table

	Table.prototype.update = function ( rgs ) {
		const sW = 'uTable + update()';
		var tableData = this.data;
		var cs  = d3.select ( '#' + tableData.eleId + '-colgroup' )
					.selectAll ( 'col' )
			.data ( tableData.cols, function ( d: any ) {
				return d.id;
			} );
		cs.exit()
			.remove();
		cs.enter()
			.append ( 'col' )
			.each ( function ( d: any, i, g ) {
				var list, j;
				d.ele = g[i];				//	easy, quick reference to the <col> element
			//	cmn.log ( 'each col ... ' );
				if ( d.colStyle ) {
					list = d.colStyle.list;
					for ( j = 0; j < list.length; j++ )
						d.ele.style[list[j].property] = list[j].value;
				}
			} );

		var rs = d3.select ( '#' + tableData.eleId + '-tbody' ).selectAll ( 'tr' )
			.data ( tableData.rows, function ( d: any ) {
				return d.id;
			} );
		rs.exit()
			.remove();

		function colHasDiv ( col, it ) {
			d3.select ( it )
				.append ( 'td' )
				.each ( function ( d, i, g ) {
					var td = g[0], list, j;
				//	cmn.log ( 'each td ... ' );
//							if ( d.tdStyle ) {
//								list = d.tdStyle.list;
					if ( col.tdStyle ) {
						list = col.tdStyle.list;
						for ( j = 0; j < list.length; j++ )
							td.style[list[j].property] = list[j].value;
					}
				} )
				.append ( 'div' )
				.each ( function ( d: any, i, g ) {
					var div = d.divEle = g[0], list, j;
			//		cmn.log ( 'each td div ... ' );
					if ( col.divStyle ) {
						list = col.divStyle.list;
						for ( j = 0; j < list.length; j++ )
							div.style[list[j].property] = list[j].value;
						if ( d.input && d.input.longCB ) {
							div.style.display             = 'grid';
							div.style.gridTemplateColumns = 'auto 17px';
							div.style.paddingRight        = '4px';
							div.style.width               = 'unset'; }
					}
					if ( d.input ) {	//	note that  d  is the CellData
						let style = 'outline:none; border:none; margin:0px;';
						if ( ! d.input.longCB ) {
							style = 'width:100%; ' + style; }
						d3.select ( this ) 
							.on ( 'mousedown', mousedownCellDiv )
							.on ( 'click',     clickCellDiv )
							.append ( 'input' )
								.attr ( 'id',   d.tableData.eleId 
											  + 'r' + d.iRow + 'c' + d.iCol )
								.attr ( 'type', d.input.type )
								.attr ( 'step', d.input.step)
								.attr ( 'autocomplete', 'off' )
								.attr ( 'autocorrect', 'off' )
								.attr ( 'spellcheck', 'false' )
								.attr ( 'class', 'u34-input' )
							//	.attr ( 'style', 'width:100%; outline:none; border:none;' )
								.attr ( 'style', style )
								.attr ( 'value', d.input.value )
								.on ( 'input', inputInput )		//	fires on any change
								.on ( 'change', inputChange )	//	fires when focus lost or on Enter key
								.each ( function ( d: any, i, g ) {
									d.inputEle = g[i];
							} );
						if ( d.input.longCB ) {
							style =   'display: inline-block; '
									+ 'border: gray 1px solid; '
									+ 'font-family: verdana; '
									+ 'padding-left: 2px; '
									+ 'padding-right: 2px; '
									+ 'cursor: pointer; '
									+ 'margin-top: -2px;';
							d3.select ( this ) 
								.append ( 'div' )
								.attr ( 'style', style )
								.text ( '...' )
								.on ( 'click',     clickCellLong ); }
					}
					if ( d.text ) {
						d3.select ( this )
							.text ( d.text ); }
				} );
		}	//	colHasDiv()

		rs.enter()
			.append ( 'tr' )
			.selectAll ( 'td' )
			.data ( function ( d: any ) { 
			//	return d.row;
				return d.cells;
			} )
			.enter()
			//	.append ( 'td' )
			//		.text ( function ( d, i ) { 
			//			return d; 
			//		} );
				.each ( function ( d: any, i, g ) {
					var col = tableData.cols[d.iCol];
					if ( typeof ( d ) === 'string' )
						d3.select ( this )
							.append ( 'td' )
								.text ( d );
					else
					if ( typeof ( d ) === 'object' )
						if ( d.type === uc.TYPE_TABLE_CELL ) {
			//				if ( d.hasDiv ) 
							if ( col.hasDiv ) {
								colHasDiv ( col, this );
							}
							else {
								d3.select ( this )
									.append ( 'td' )
									.each ( function ( d: any, i, g ) {
										var td = g[0], list, j;
									//	cmn.log ( 'each td ... ' );
				//						if ( d.tdStyle ) {
				//							list = d.tdStyle.list;
										if ( col.tdStyle ) {
											list = col.tdStyle.list;
											for ( j = 0; j < list.length; j++ )
												td.style[list[j].property] = list[j].value;
										}
									//	if ( d.mouseDown ) 
									//		td.onmousedown = tdMouseDown;
									//	if ( d.mouseMove ) 
									//		td.onmousemove = tdMouseMove;
									//	if ( d.mouseUp ) 
									//		td.onmouseup = tdMouseUp;
										if ( d.isSplitter ) {
											d3.select ( td ).on ( 'mousedown', uCD.mousedownSplitter );
											d.onSplit = split;
										}

										td.onclick = tdClick;
									} )
									.text ( d.text );
							}
						}
						else
						if ( d.divClass ) 
							d3.select ( this )
								.append ( 'td' )
									.append ( 'div' )
									.attr ( 'class', d.divClass )
									.text ( d.text )
									.each ( function ( d, i, g ) {
								//		cmn.log ( 'each td div ... ' );
									} );
						else
							d3.select ( this )
								.append ( 'td' )
								.attr ( 'class', function ( d: any ) { 
									return d.class ? d.class : null; } )
								.text ( d.text )
								.each ( function ( d: any, i, g ) {
									var td = g[0];
								//	cmn.log ( 'each td ... ' );
									if ( d.mouseDown ) 
										td.onmousedown = d.mouseDown;
								} );
				} );

		//	Calc dwr (div width ratio)s. Do this when all the columns are 
		//	defined and the <table> element's width is set, here.
		//
		//	The table's width, when not explicitly set, is the sum of a row's 
		//	<td> widths.
		//
		//	Each row's <td> width - for a column - is the same.  Therefore we 
		//	need only look at the first row.
		//
		if ( (! rgs) || (! rgs.bFirstUpdate) )	//	only when control is being 
			return; 							//	defined

		//	This control is being defined.  Want the table to fill the control 
		//	width (i.e., tableDate.w).
		//
		//	If the control width is greater than the table width then 
		//		increase the last column's width to make the table fill the 
		//		control
		//	else
		//	If the control width is a little less than the table width then 
		//		decrease each column's width
		//	else
		//		do nothing - the control (it's panel) should show a 
		//		scroll/panning indicator - to see columns to the right then 
		//		schroll/pan left

		if ( tableData.fillsPanel ) {
			//	horzontally, fill the panel, for now
			tableData.w = tableData.parentPanel.data.baseData[0].w;	}	

		//	vertically, per table height (number of rows)
		tableData.h = tableData.tableY + tableData.tableEle.clientHeight;	

		d3.select ( '#' + tableData.eleId + '-rect' )
			.attr ( 'width',  function ( d: any, i ) { return d.w; } )
			.attr ( 'height', function ( d: any, i ) { 
			//	cmn.log ( sW, ' d.h: ' + d.h );
				return d.h; 
			//	return d.h + (parentPanelData.hasBorder 
			//								   ? 0 : uc.PANEL_BORDER_WIDTH); 
			} );
		
		//	Assumptions (for now) -
		//
		//		number of table data (<td>) rows > 0

		var baseWidth = tableData.w;
		if ( tableData.fillsPanel ) {
			baseWidth = tableData.parentPanel.data.baseData[0].w; }

		var divWidth  = baseWidth < uc.TABLE_MIN_WIDTH ? uc.TABLE_MIN_WIDTH 
													   : baseWidth;

		var tdSel = d3.select ( '#' + tableData.eleId + '-tbody' )
					  .select ( 'tr' ).selectAll ( 'td' );
		tableData.nColAdj = 0;	//	number of columns whose width may be 
								//	adjusted
		tdSel.each ( function ( d: any, i, g ) { 
			tableData.nColAdj += d.isSplitter ? 0 : 1; 
		} );

		var tableSel = d3.select ( '#' + tableData.eleId )
						 .select ( 'table' );
		var tableWidth = 0, dwTotal, dwEach, dwLast;
		tableSel.each ( ( d, i, g: any ) => { tableWidth = g[i].clientWidth; } );
		if ( tableWidth <= 0 )
			return;
		function setDWR() {
			for ( let j = 0; j < tableData.rows.length; j++ ) {
				let nCol = 0, w = 0;
				for ( let k = 0; k < tableData.cols.length; k++ ) {
					let cellD = tableData.rows[j].cells[k];
					if ( (! cellD.divEle) || cellD.isSplitter) {
						continue; }
					if ( cmn.isObject ( cellD.input ) && cellD.input.longCB ) {
						continue; }
					nCol++;
					if ( nCol < tableData.nColAdj )
						w = parseInt ( cellD.divEle.style.width ) + dwEach;
					else
						w = parseInt ( cellD.divEle.style.width ) + dwLast;
					cellD.divEle.style.width = '' + w + 'px';
					if ( (j === 0) && (typeof tableData.dwr[k] !== 'number') )
						tableData.dwr[k] = 
							w / (divWidth - (  tableData.cols.length 
											 * tableData.colsPaddingLeft));
				}	//	for ( k < tableData.cols.length )
			}	//	for j < tableData.rows.length
		}	//	setDWR()
		if ( tableData.w > tableWidth ) {
			dwTotal = tableData.w - tableWidth;
			dwEach  = Math.floor ( dwTotal / tableData.nColAdj );
			dwLast  = dwEach + (dwTotal % tableData.nColAdj);
			setDWR();
		} else
			dwEach  = 0;
			dwLast  = 0;
			setDWR();
			if ( tableData.w + 10 >= tableWidth ) {	//	10 === uc.TABLE_MIN_WIDTH ?
				dwTotal = tableWidth - tableData.w;

			} else {

		}

//		ds.each ( function ( d, i, g ) {
//
//		} );
//
//		d3.select ( '#' + )
//		tableData.dwr[d.iCol] = div.clientWidth / tableData.w;

	};	//	Table.prototype.update()

//	Table.prototype.parentSized = function ( w, h )  { 		//	i.e., this control's "client" area has been resized
	Table.prototype.parentSized = function ( dx, dy )  { 		//	i.e., this control's "client" area has been resized
		var td = this.data;
//		var dx = w - td.w + 1;
//		var dy = h - td.h + 1;
		sized ( td, null, null, dx, dy );
	};	//	Table.prototype.parentSized()

	Table.prototype.parentSizedAbsolute = function ( w, h )  { 	//	i.e., this control's "client" area has been resized
		let	td = this.data;
		let dx = 0, dy = 0;
		let	parentPanelData = td.parentPanel.data;
		let	bd = parentPanelData.baseData[0];
		if ( td.fillsPanel ) {
			dx = w - bd.w + 1;
			dy = h - bd.h + 1; }
		else {
			dx = w - td.w + 1;
			dy = h - td.h + 1; }
		sized ( td, null, null, dx, dy );
	};	//	Table.prototype.parentSizedAbsolute()

	Table.prototype.parentScrolled = function ( mt, evt ) {
		//	i.e., this control's "client" area has been scrolled/panned
		var td = this.data;								//	table data
		var bd = td.parentPanel.data.baseData[0];		//	parent panel's base data
	//	var divW   = parseInt ( td.divEle.style.width );
		let tableW = document.getElementById ( td.eleId + '-tbody' )
							 .getBoundingClientRect().width;
		var tableH = td.tableEle.clientHeight;

	//	var ax = divW - (bd.w - (bd.x - 0.5)) + evt.dx;
		var ax = (td.tableX + tableW) - (bd.w - (bd.x - 0.5)) + evt.dx;
	//	var ay = td.h - (bd.w - (bd.y - 0.5)) + evt.dy;
		var ay = (td.tableY + tableH) - (bd.h - (bd.y - 0.5)) + evt.dy;
	//	let edY = (mt === uc.TYPE_PANEL_BASE ? evt.dy : -evt.dy);
	//	let ay = (td.tableY + tableH) - (bd.h - (bd.y - 0.5)) + edY
		
	//	cmn.log ( 'bd.x: ' + bd.x + '  bd.w: ' + bd.w + '  divW: ' + divW + '  evt.dx: ' + evt.dx + '  ax: ' + ax );
		cmn.log ( 'bd.x: ' + bd.x + '  bd.w: ' + bd.w + '  tableW: ' + tableW + '  evt.dx: ' + evt.dx + '  ax: ' + ax );

	//	if ( bd.x + evt.dx > 0.5 )	//	don't allow panning right (past origin)
	//		evt.dx = 0.5 - bd.x;		//	will set bd.x === 0.5
	//	//	2017-May-08
		var bdX = bd.x + (! bd.panelData.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);
		if ( bdX  + evt.dx > 0.5 )	//	don't allow panning right (past origin)
			evt.dx = 0.5 - bdX;			//	will set bd.x === 0.5
		else
		if ( ax <= 0 )
			evt.dx = 0;

	//	if ( bd.y + evt.dy > 0.5 )	//	don't allow panning down (past origin)
	//		evt.dy = 0.5 - bd.y;		//	will set bd.y === 0.5
	//	//	2017-May-08
		let bdY = bd.y + (! bd.panelData.hasBorder ? uc.PANEL_BORDER_WIDTH : 0);
		if ( bdY  + evt.dy > 0.5 ) {	//	don't allow panning down (past origin)
	//	if ( bdY  + edY    > 0.5 ) {	//	don't allow panning down (past origin)
			evt.dy = 0.5 - bdY;			//	will set bd.y === 0.5
			if ( mt !== uc.TYPE_PANEL_BASE ) {
				evt.dy = -evt.dy; } }
		else
		if ( ay <= 0 )
			evt.dy = 0;

	};	//	Table.prototype.parentScrolled()

	function TableData ( o ) {
		//	Initialize the "base" of this object, ControlData -
		o.type      = uc.TYPE_TABLE;
		o.hasBorder = uc.isBoolean ( o.hasBorder ) ? o.hasBorder : false;
		o.class     = uc.isString ( o.class )
					  ? o.class
					  : (o.hasBorder ? 'u34-table-with-border' : 'u34-table')
		uCD.callControlData ( this, o );

		//	Initialize the rest of this object -
		this.fillsPanel   = uc.isBoolean ( o.fillsPanel )    ? o.fillsPanel
														  	 : false;
		this.title		  = uc.isString ( o.title )          ? o.title 
													: 'table title goes here';
		this.cb           = uc.isFunction ( o.cb )           ? o.cb           
															 : null;
		this.shiftClickCB = uc.isFunction ( o.shiftClickCB ) ? o.shiftClickCB 
															 : null;
		this.onProperties = uc.isFunction ( o.onProperties ) ? o.onProperties 
															 : null;
		this.ff = 'verdana';				//	font family
		this.fs = 10;						//	font size, pixels

		this.styles = [];
		this.nextStyleId = firstCustomStyleId;

		//	not including splitters
		this.nCols		  = uc.isNumber ( o.nCols )          ? o.nCols
															 : 0;

		//	Array of ColumnData - defined with createColumn().
		//	Includes splitters.
		this.cols = [];
		this.nextColId = 0;

		//	Array of RowData - each RowData contains an array of CellData
		this.rows = [];		
		this.nextRowId = 0;

		this.dwr = o.dwr ? o.dwr : [];		//	<Div> Width Ratio, i.e., each col's <div> width / table width  
											//	- to maintain col relative widths when table (control) width changes

		this.nColAdj = 0;		//	number of columns whose width may be adjusted

		this.tableEle = null;	//	the <table> element
		this.divEle = null;		//	the <div> element the table is in 

		this.tableY = TitleAreaHeight;		//	to make room for title above the table
		if ( this.title.length <= 0 ) {
			this.tableY = 0; }		//	hide the title area

		this.colsPaddingLeft = 3;	//	all columns' left padding - matches CSS .u34-table-fo-body-div-table tbody tr td

		this.inputCB  = o.inputCB  ? o.inputCB  : null;		//	when a cell's <input> changes
		this.changeCB = o.changeCB ? o.changeCB : null;		//	when focus is lost, or Enter key on cell's <input>

		this.table = null;		//	reference (circular) to Table - set by defineTable()

		//	Override some "base" (those in ControlData) properties -
		this.onSize  = sized;
		this.onSize2 = sized2;
		this.onMove  = moved;
	}	//	TableData()

//	TableData.prototype = uCD.newControlData();
//	TableData.prototype.constructor = TableData;
//	See svc.createTableData()
	
	function TableData_listProperties() {
		var sW = serviceId + ' TableData.prototype.listProperties()';
		var whiteList = [ 'title', 'ff', 'fs', 'hasBorder', 'nCols', 
						  'fillsPanel' ];
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
				case 'hasBorder': 	displayName = 'has border';			break;
				case 'ff': 			displayName = 'font';				break;
				case 'fs': 			displayName = 'font size';			break;
				case 'nCols':		displayName = 'number of columns';	break;
				case 'fillsPanel':	displayName = 'fills panel';		break;
			}
			cmn.log ( sW, '   key: ' + key + '  value: ' + value );
			props.push ( { property: key, value: value, displayName: displayName } );
		}
		return props;
	};	//	TableData.prototype.listProperties()

	function TableData_setProperty ( name, value ) {
		var sW = serviceId + ' TableData.prototype.setProperty()';
		function toBoolean ( value ) {
			let n = Number ( value );
			if ( n !== n ) {				//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
				if ( typeof value === 'string' )
					value = (value === 'true');
				else
					value = false;
			} else
				value = (n !== 0);
			return value; }
		//	handle x, y, w, h, name properties in the "base class" ControlData
		let n, g, rtn, bTitleStyleChange = false;
		rtn = uCD.setProperty ( this, name, value );
		if ( rtn )
			return rtn;
		if ( name === 'title' ) {
			this.setTitle ( value ); }

		if ( name === 'hasBorder' ) {
		//	n = Number ( value );
		//	if ( n !== n ) {				//	Good Grief!  ... testing for NaN ...	got'a love JS :(	
		//		if ( typeof value === 'string' )
		//			value = (value === 'true');
		//		else
		//			value = false;
		//	} else
		//		value = (n !== 0);
			value = toBoolean ( value );
			this[name] = !! value;
			this.class = this[name] ? 'u34-table-with-border' : 'u34-table';
			d3.select ( '#' + this.eleId + '-rect' )
				.attr ( 'class',  function ( d: any, i ) { return d.class; } ); }

		if ( name === 'ff' ) {
			this[name] = value;
			bTitleStyleChange = true; }

		if ( name === 'fs' ) {
			n = Number ( value );
			if ( n !== n ) 					//	Good Grief!  ... testing for NaN ...	got'a love JS 
				return;
			this[name] = n;
			bTitleStyleChange = true; }

		if ( name === 'nCols' ) {
			n = Number ( value );
			if ( n !== n ) 					//	Good Grief!  ... testing for NaN ...	got'a love JS 
				return;
			this[name] = n;
			this.createColumns();
			this.table.update ( { bFirstUpdate: true } ); }

		if ( name === 'fillsPanel' ) {
			let wasFillsPanel = this[name];
			value = toBoolean ( value );
			let nowFillsPanel = this[name] = !! value;
			let ppd = this.parentPanel.data;
			let dx = 0, dy = 0;
			if ( nowFillsPanel && ! wasFillsPanel ) {
				ppd.filledBy = this.table;
				moved ( this, null, null, 0, 0); 
				dx = ppd.w - this.w; 
				dy = 0; }
			if ( wasFillsPanel && ! nowFillsPanel ) {
				ppd.filledBy = null; }
			sized ( this, null, null, dx, dy ); }

		if ( bTitleStyleChange ) {
			d3.select ( '#' + this.eleId + '-title' )
				.attr ( 'style', ( d: any, i ) => { 
					return 'font-family: ' + d.ff + '; font-size: ' + d.fs + 'px;'; } ); }
	};	//	TableData.prototype.setProperty()


//	TableData.prototype.findStyle = function ( styleId ) {
	function TableData_findStyle ( styleId ) {
		var style;
		if ( styleId < firstCustomStyleId ) {
			for ( var pprty in builtInStyles ) {
				if ( ! builtInStyles.hasOwnProperty ( pprty ) )
					continue;
				style = builtInStyles[pprty];
				if ( style.id === styleId )
					return style;
			}
		} else
		for ( var i = 0; i < this.styles.length; i++ ) {
			if ( this.styles[i].id === styleId )
				return this.styles[i];
		}
		return null;
	}	//	TableData.prototype.findStyle()

//	TableData.prototype.createStyle = function ( o ) {
	function TableData_createStyle ( o ) {
		var style = new StyleData ( o );
		if ( style.id === 0 )
			style.id = ++this.nextStyleId;
		this.styles.push ( style );
		return style;
	}	//	TableData.prototype.createStyle()

//	TableData.prototype.createColumn = function ( o ) {
	function TableData_createColumn ( o ) {
		if ( ! uc.isDefined ( o.iCol ) )
			o.iCol = this.cols.length;
		if ( uc.isBoolean ( o.isSplitter ) && o.isSplitter ) {
			o.name       = uc.isString ( o.name ) ? o.name : 'splitter';
			o.colStyleId = 0;
			o.divStyleId = 0;
			o.tdStyleId  = uc.isDefined ( o.tdStyleId ) ? o.tdStyleId : builtInStyles.tdSplitter.id;
			o.hasDiv     = false;
			o.isStatic   = false;
			o.isEditable = false;
		} else 
		if ( uc.isString ( o.style ) && (o.style === 'static') ) {
			o.colStyleId = 0;
			o.divStyleId = uc.isDefined ( o.divStyleId ) ? o.divStyleId : builtInStyles.divStatic.id;
			o.tdStyleId  = uc.isDefined ( o.tdStyleId ) ? o.tdStyleId : builtInStyles.tdStatic.id;
			o.hasDiv     = true;
			o.isSplitter = false;
			o.isStatic   = true;
			o.isEditable = false;
		} else
		if ( uc.isString ( o.style ) && (o.style === 'editable') ) {
			o.colStyleId = 0;
			o.divStyleId = uc.isDefined ( o.divStyleId ) ? o.divStyleId : builtInStyles.divEditable.id;
			o.tdStyleId  = uc.isDefined ( o.tdStyleId ) ? o.tdStyleId : builtInStyles.tdEditable.id;
			o.hasDiv     = true;
			o.isSplitter = false;
			o.isStatic   = false;
			o.isEditable = true;
		} 

		var col = new ColumnData ( this, o );
		col.id = ++this.nextColId;
		this.cols.push ( col );
		return col;
	}	//	TableData.prototype.createColumn()

	function TableData_createColumns ( o ) {
		this.cols = [];
		this.rows = [];
		if ( ! uc.isObject ( o ) ) {		//	just create some dummy columns?
			if ( (! uc.isNumber ( this.nCols )) || (this.nCols < 1) ) {
				return; }
			let adjColW = 40;
			if ( this.nCols > 3 ) {
				adjColW = 30; }
			if ( this.nCols > 6 ) {
				adjColW = 20; }
			o = { nCols:		this.nCols,
				  adjColW: 		adjColW,
				  colNames: 	[] };
			for ( let i = 0; i < this.nCols; i++ ) {
				o.colNames.push ( '<name>' ); } }
		//	Note that o.nCols does not include the splitter columns.
		for ( let iCol = 0; iCol < o.nCols; iCol++ ) {
			let div = this.createStyle ( { name: 'styleCell-' + iCol + '-div' } );
				div.list.push ( { property: 'display',    value: 'inline-block' } );
				div.list.push ( { property: 'overflowX',  value: 'hidden' } );
				div.list.push ( { property: 'paddingTop', value: '4px' } );
				div.list.push ( { property: 'width',      value: '' + o.adjColW + 'px' } );
				div.list.push ( { property: 'whiteSpace', value: 'nowrap' } );
			let td = this.createStyle ( { name: 'styleCell-' + iCol + '-td' } );
			if ( iCol < o.nCols - 1 ) {
				td.list.push ( { property: 'borderRight', value: 'transparent' } ); }
			if ( iCol > 0 ) {
				td.list.push ( { property: 'borderLeft', value: 'transparent' } ); }
			this.createColumn ( { name: 		o.colNames[iCol],
								  colStyleId:	0,
								  divStyleId: 	div.id,
								  tdStyleId: 	td.id,
								  hasDiv: 		true,
								  isSplitter: 	false } );
			if ( iCol < o.nCols - 1 ) {
				//	create a splitter
				let td = this.createStyle ( { name: 'styleCell-' + iCol + '-' + (iCol+1) + '-td' } );
					td.list.push ( { property: 'borderLeft',      value: 'none' } );
					td.list.push ( { property: 'borderRight',     value: 'none' } );
					td.list.push ( { property: 'cursor',          value: 'col-resize' } );
					td.list.push ( { property: 'backgroundColor', value: 'lightgray' } );
				this.createColumn ( { name: 		'splitter',
									  colStyleId: 	0,
									  divStyleId: 	0,
									  tdStyleId: 	td.id,
									  hasDiv: 		false,
									  isSplitter: 	true } ); } 
		}	//	for ( icol
		this.nCols   = o.nCols;
		this.nColAdj = o.nCols;
		this.dwr     = [];
	//	//	Start with one dummy row.
	//	let	cells = [];
	//	for ( let iCol = 0; iCol < this.nCols; iCol++ ) {
	//		cells.push ( this.createCell ( { iCol: iCol * 2, iRow: 0 }, { text: '' } ) );
	//		if ( iCol < this.nCols - 1 ) {
	//			cells.push ( this.createCell ( { iCol: (iCol * 2) + 1, iRow: 0 }, { isSplitter: true } ) ); } }
	//	this.createRow ( { cells: cells } );
	//	2022-Oct-10		Commenting this out fixes -
	//		When the app populates the table with rows the widths of the
	//		columns of the first row are not right.
	}	//	TableData.prototype.createColumns()

//	TableData.prototype.createRow = function ( rgs ) {
	function TableData_createRow ( rgs ) {
		var row = new RowData ( rgs );
		row.id = ++this.nextRowId;
		this.rows.push ( row );
		return row;
	}	//	TableData.prototype.createRow()

//	TableData.prototype.createRows = function ( rgs ) {
	function TableData_createRows ( rgs ) {
		var sW = 'TableData_createRows()';
		var iRow, cells, iCol, iCell, col, row;
		for ( iRow = 0; iRow < rgs.length; iRow++ ) {
			cells = [];
			for ( iCell = 0, iCol = 0; iCol < this.cols.length; iCol++ ) {
				col = this.cols[iCol];
				if ( col.isSplitter ) {
					cells.push ( this.createCell ( { iCol: iCol, iRow: iRow }, 
												   { isSplitter: true } ) );
				} else
				if ( col.isStatic ) {
					cells.push ( this.createCell ( { iCol: iCol, iRow: iRow }, 
												   { text: rgs[iRow][iCell++] } ) );
				} else
				if ( col.isEditable ) {
					cells.push ( this.createCell ( { iCol: iCol, iRow: iRow }, 
												   { input: { value: '' + rgs[iRow][iCell++] } } ) );
				} else
					cmn.error ( sW, 'Unrecognized column type' );
			}

			row = new RowData ( { cells: cells } );
			row.id = ++this.nextRowId;
			this.rows.push ( row );
		}
	}	//	TableData.prototype.createRows()

//	TableData.prototype.createCell = function ( oCommon, o ) {
	function TableData_createCell ( oCommon, o ) {
		var cell = new CellData ( this, oCommon );
		for ( var prop in o ) {
			cell[prop] = o[prop];
		}
		return cell;
	}	//	TableData.prototype.createCell()

//	TableData.prototype.setTitle = function ( titleText ) {
	function TableData_setTitle ( titleText ) {
		const sW = 'TableData_setTitle()';
		cmn.log ( sW );
		this.title = cmn.isString ( titleText ) ? titleText : '';
		if ( this.title.length <= 0 ) {
			this.tableY = 0; 			//	hide the title area
		//	sized2 ( this, null, 0, 0 ); 
			d3.select ( '#' + this.eleId + '-g-fo' )
				.attr ( 'transform', function ( d: any, i ) {
					return 'translate(' + (       0 + uc.OFFS_4_1_PIX_LINE) + ','
										+ (d.tableY + uc.OFFS_4_1_PIX_LINE) + ')'; 
				} ); }
		else {
			let prevTableY = this.tableY;
			this.tableY = TitleAreaHeight;
			if ( this.tableY !== prevTableY ) {
			//	sized2 ( this, null, 0, 0 ); } 
				d3.select ( '#' + this.eleId + '-g-fo' )
					.attr ( 'transform', function ( d: any, i ) {
						return 'translate(' + (       0 + uc.OFFS_4_1_PIX_LINE) + ','
											+ (d.tableY + uc.OFFS_4_1_PIX_LINE) + ')'; 
					} ); } }
		this.h = this.tableY + this.tableEle.clientHeight;	
		d3.select ( '#' + this.eleId + '-title' )
			.text ( function ( d: any, i ) { return d.title; } ); 
	}	//	TableData.prototype.setTitle()

//	TableData.prototype.setCell = function ( iRow, iCol, value ) {
	function TableData_setCell ( iRow, iCol, value ) {
		var cellD = this.rows[iRow].cells[iCol];
		if ( cellD.inputEle )
			cellD.inputEle.value = '' + value;
		else
		if ( cellD.divEle )
			cellD.divEle.innerHtml = '' + value;
	}	//	TableData.prototype.setCell()

	function TableData_update() {
		this.table.update();
	}	//	TableData.prototype.update()

	function TableData_clear() {
		const sW = 'TableData_clear()';
		cmn.log ( sW );
		this.rows = [];
		this.table.update();
		this.h = this.title.length > 0 ? TitleAreaHeight : 0;
		let ppd = this.parentPanel.data;
		d3.select ( '#' + this.eleId + '-fo' )
			.attr ( 'height', ( d: any ) => { return d.h + 'px'; } );
		d3.select ( '#' + this.eleId + '-rect' )
			.attr ( 'height', function ( d: any ) { 
				return d.h + (ppd.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH) 
							+ 'px';  } );
	}	//	TableData.prototype.clear()

	svc.createTableData = function ( o ) {

	//	if ( TableData.prototype.constructor.name === 'TableData' ) {
	//		//	Do this once, here to avoid cir ref issue
			TableData.prototype = uCD.newControlData();
			TableData.prototype.constructor = TableData;
			TableData.prototype.listProperties = TableData_listProperties;
			TableData.prototype.setProperty = TableData_setProperty;
			TableData.prototype.findStyle = TableData_findStyle;
			TableData.prototype.createStyle = TableData_createStyle;
			TableData.prototype.createColumn = TableData_createColumn;
			TableData.prototype.createColumns = TableData_createColumns;
			TableData.prototype.createRow = TableData_createRow;
			TableData.prototype.createRows = TableData_createRows;
			TableData.prototype.createCell = TableData_createCell;
			TableData.prototype.setTitle = TableData_setTitle;
			TableData.prototype.setCell = TableData_setCell;
			TableData.prototype.update = TableData_update;
			TableData.prototype.clear = TableData_clear;
	//	}

		return new TableData ( o );
	};	//	svc.createTableData()


	function defineTableElement ( div ) {
		var table = div.append ( 'table' )
			.attr ( 'class', 'u34-table-fo-body-div-table' )
		//	.attr ( 'style', 'width: 100%;');
			.each ( function ( d, i, g ) {
				d.tableEle = g[i];
			} );

	//	var colgroup = table
	//		.append ( 'colgroup' );
	//	colgroup
	//		.append ( 'col' )
	//			.attr ( 'class', 'u34-table-col-prop-name' );
	//	colgroup
	//		.append ( 'col' )
	//			.attr ( 'class', 'u34-table-col-splitter' );
	//	colgroup
	//		.append ( 'col' )
	//			.attr ( 'class', 'u34-table-col-prop-value' );

	//	table
	//		.append ( 'col' )
	//			.attr ( 'class', 'u34-table-col-prop-name' );
	//	table
	//		.append ( 'col' )
	//			.attr ( 'class', 'u34-table-col-splitter' );
	//	table
	//		.append ( 'col' )
	//			.attr ( 'class', 'u34-table-col-prop-value' );

		var colgroup = table
			.append ( 'colgroup' )
				.attr ( 'id', function ( d ) { return d.eleId + '-colgroup'; } );
	//	colgroup
	//		.append ( 'col' );
	//			.attr ( 'class', 'u34-table-col-prop-name' );
	//	colgroup
	//		.append ( 'col' );
	//			.attr ( 'class', 'u34-table-col-splitter' );
	//	colgroup
	//		.append ( 'col' );
	//			.attr ( 'class', 'u34-table-col-prop-value' );

		table
			.append ( 'tbody' )
				.attr ( 'id', function ( d ) { return d.eleId + '-tbody'; } );

	} 	//	defineTableElement()

	svc.defineTable = function ( panel ) {
		var sW = serviceId + ' defineTable()';
	
		var table = null;
		var pd    = panel.data;
		var s = pd.base.selectAll ( '#' + pd.eleId + '-base' + ' > g' );
		cmn.log ( sW, '  s length: ' + s._groups[0].length );

		var ctrlEles = s
			.data ( pd.childData.data, function ( d ) { 
					return d.id || (d.id = ++pd.childData.nextId); 
			} )
			.enter()
			.each ( function ( d ) { 
//				cmn.log ( sW, '- g - new data: ' + d.name ); 
				table = d.table = new Table ( d );
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
			.on ( 'click',     click );

		ctrlEles.append ( 'rect' )
			.attr ( 'id',     function ( d, i ) { return d.eleId + '-rect'; } )
			.attr ( 'x',      function ( d, i ) { 
				return pd.hasBorder || (pd.docked && pd.parentPanel.data.hasBorder) ? 0.5 : -0.5;
			} )
			.attr ( 'y',      function ( d, i ) { 
				return pd.hasBorder || (pd.docked && pd.parentPanel.data.hasBorder) ? 0.5 : -0.5;
			} )
			.attr ( 'width',  function ( d, i ) { 
			//	cmn.log ( sW, ' rect width: ' + d.w );
				return d.w; 
			} )
			.attr ( 'height', function ( d, i ) { 
			//	cmn.log ( sW, ' rect height: ' + d.h );
				return d.h + (pd.hasBorder ? 0 : uc.PANEL_BORDER_WIDTH); 
			} )
			.attr ( 'class',  function ( d, i ) { return d.class; } );

		ctrlEles.append ( 'text' )													//	title
			.attr ( 'id',          function ( d, i ) { return d.eleId + '-title'; } )
			.attr ( 'text-anchor', function ( d, i ) { return 'middle'; } )
			.attr ( 'x',           function ( d, i ) { return d.w / 2; } )
			.attr ( 'y',           function ( d, i ) { return d.fs + 4; } )
			.attr ( 'style',       function ( d, i ) { return 'font-family: ' + d.ff + '; font-size: ' + d.fs + 'px;'; } )
			.attr ( 'class',       function ( d, i ) { return 'u34-label-text'; } )
			.attr ( 'clip-path',   function ( d, i ) { return 'url(#cp-' + d.eleId + ')'; } )
			.text (                function ( d, i ) { return d.title; } );


		var div = ctrlEles.append ( 'g' )
			.attr ( 'id',        function ( d, i ) { return d.eleId + '-g-fo'; } )
		//	.attr ( 'transform', 'translate(0.5,20.5)' )
			.attr ( 'transform', function ( d, i ) {
			//	return 'translate(' + (       0 + uc.OFFS_4_1_PIX_LINE) + ',' 
			//	return 'translate(' + (       0 - uc.OFFS_4_1_PIX_LINE) + ',' 		//	2017-May-04 	Why - ?
			//						+ (d.tableY + uc.OFFS_4_1_PIX_LINE) + ')'; 
				return 'translate(' + (       0 + uc.OFFS_4_1_PIX_LINE) + ',' 		//					changing back to + .
									+ (d.tableY + uc.OFFS_4_1_PIX_LINE) + ')'; 
			} )
			.append ( 'foreignObject' )
				.attr ( 'id',          function ( d, i ) { return d.eleId + '-fo'; } )
				.attr ( 'x', 0 )
				.attr ( 'y', 0 )
			//	.attr ( 'width',  function ( d, i ) { return d.w - 1; } )
			//	.attr ( 'height', 1 ) 	//	function ( d, i ) { return d.h; } )
				.attr ( 'width',  d => { return (d.w - 1) + 'px'; } )
				.attr ( 'height', d => { return (d.h    ) + 'px'; } )
				.append ( 'xhtml:body' )
					.attr ( 'id',          function ( d, i ) { return d.eleId + '-fo-body'; } )
					.style ( 'font-size', '10px' )
					.style ( 'font-family', 'consolas, monospace' )
					.style ( 'margin', '0px' )
					.append ( 'div' )
						.attr ( 'id', function ( d, i ) { return d.eleId + '-fo-body-div'; } )
						.each ( function ( d, i, g ) {
							d.divEle = g[i];
						} );

		defineTableElement ( div );

		table.update ( { bFirstUpdate: true } );


		ctrlEles.each ( function ( d ) { 
			if ( d.fillsPanel )
				return;						//	i.e., use the panel's move, size handles

			ctrlEles.append ( 'rect' )		//	size handle - invisible until mouse is over
				.attr ( 'id',     function ( d, i ) { return d.eleId + '-size'; } )
				.attr ( 'x',      function ( d, i ) { 
				//	cmn.log ( sW, ' size handle d.w: ' + d.w );
					return d.w - uc.SIZE_HANDLE_WIDTH; } )
				.attr ( 'y',      function ( d, i ) { 
				//	cmn.log ( sW, ' size handle d.h: ' + d.h );
					return d.h - uc.SIZE_HANDLE_HEIGHT; } )
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
		} );

		return table;
	};	//	svc.defineTable()

	return svc;

})();
