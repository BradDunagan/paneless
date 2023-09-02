
/*
		 1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/
import * as d3 		from 'd3';
import { cmn }		from '../common';
import { uc } 		from './udui-common';


function ClipPathData ( eleId, x, y, w, h ) {
	this.eleId = eleId;
	this.x = x + 1;
	this.y = y + 1;
	this.w = w;
	this.h = h;
}	//	ClipPathData()


class uDsrcGraph {
	
	grfEleId:		string;

	code:			any;
	grfD:			any;
	defs:			any;
	gClip:			any;
	svgGroup:		any;
	link:			any;
	clipPathsData:	any;

	minX:			number;
	minY:			number;
	spcX:			number;
	spcY:			number;
	nodeW:			number;
	nodeH:			number;
	nodeLineH:		number;

	expandBtnClass:		string;
	expandBtnWidth:		number;
	expandBtnHeight:	number;

	expandBtnXOffs:		number;
	expandBtnYOffs:		number;

	bExpandToLeaves:	boolean;

	nodeWidthExtention:	number;

	nodeBorderColor:	string;

	lastDataId:			number;
	lastLinkId:			number;

	//	"Raw" data. All data, including that which is not rendered
	//	as nodes (because, for example, the parent's children are not
	//	expanded). Keys are the recIds.
	//		recId, name, children, parent
	rawD:				any;

	//	Data rendered as nodes of the graph. 
	//		x, y, rd
	data:				any;
	links:				any;

	focusedData:		any;
	prevFocusedData:	any;

	bEditingNodeText:	boolean;

	zoomListener:		any;
	//	Zoome G, Extents
	zge:	{
		g:				any,
		lowerExtent:	number,
		upperExtent:	number };

	nTransitions:		number;
	transitionResolve:	any;
	transitions:		any;

	durationUpdate:		number;

	bShowGroup:			boolean;
	bShowUser:			boolean;
	bShowSystem:		boolean;
	GUSLabelWidth:		number;

	constructor() {
		this.grfEleId	= '';

		this.code			= null;
		this.grfD			= null;
		this.defs			= null;
		this.gClip			= null;
		this.svgGroup		= null;
		this.link			= null;
		this.clipPathsData 	= [];

		this.bShowGroup			= false;
		this.bShowUser 			= false;
		this.bShowSystem		= false;
		this.GUSLabelWidth		= 15;

		this.minX	=  20;
		this.minY	=  20;
		this.spcX 	= 160;		//	Space between drawn nodes.
		
		this.spcY 	=  20;		//	Space between tops of nodes.
		if ( this.bShowGroup ) {
			this.spcY 	+=  20; }
		if ( this.bShowUser ) {
			this.spcY 	+=  20; }
		if ( this.bShowSystem ) {
			this.spcY 	+=  20; }

		this.nodeW 	= 100;
		
		this.nodeH		= 16;
		this.nodeLineH	= 13;	//	How much node height is increased per
								//	extra line of text.
		if ( this.bShowGroup ) {
			this.nodeH	+=  this.nodeLineH; }
		if ( this.bShowUser ) {
			this.nodeH	+=  this.nodeLineH; }
		if ( this.bShowSystem ) {
			this.nodeH	+=  this.nodeLineH; }

		this.expandBtnClass	 = 'u34-tree-expand-btn-stroke-transparent';
		this.expandBtnWidth  = 10;
		this.expandBtnHeight = 10;

		this.expandBtnXOffs	 = this.expandBtnWidth + 3;
		this.expandBtnYOffs	 =	3;

		this.bExpandToLeaves = false;

		this.nodeWidthExtention	= 9 + this.expandBtnWidth; 

		if ( this.bShowGroup || this.bShowUser || this.bShowSystem ) {
			this.nodeBorderColor	= 'lightgray'; }
		else {
			this.nodeBorderColor	= 'transparent'; }

		this.lastDataId = 4;
		this.lastLinkId = 3;

		//	"Raw" data. All data, including that which is not rendered
		//	as nodes (because, for example, the parent's children are not
		//	expanded). Keys are the recIds.
		//		recId, name, children, parent
		this.rawD		= {};
		;
		//	Data rendered as nodes of the graph. 
		//		x, y, rd
		this.data		= [];
		this.links		= [];

		this.focusedData		= null;
		this.prevFocusedData	= null;

		this.bEditingNodeText	= false;

		this.zoomListener		= null;
		//	Zoome G, Extents
		this.zge				= { g:				null,
									lowerExtent:	0.1,
									upperExtent:	1.2 };

		this.nTransitions		= 0;
		this.transitionResolve	= null;
		this.transitions		= [];

		this.durationUpdate		= 200;

		this.keyDown			= this.keyDown.bind ( this );
		this.firstFocus			= this.firstFocus.bind ( this );
		this.changeFocusUpOrDown 	= this.changeFocusUpOrDown.bind ( this );
		this.changeFocusLeftOrRight	= this.changeFocusLeftOrRight.bind ( this );
		this.addData			= this.addData.bind ( this );
		this.nodeClick			= this.nodeClick.bind ( this );
		this.setFocus			= this.setFocus.bind ( this );
		this.setExtents			= this.setExtents.bind ( this );
		this.getExtents			= this.getExtents.bind ( this );
		this.spaceHorz			= this.spaceHorz.bind ( this );
		this.spaceVert			= this.spaceVert.bind ( this );
		this.initialNodes		= this.initialNodes.bind ( this );
		this.showGroup			= this.showGroup.bind ( this );
		this.showUser			= this.showUser.bind ( this );
		this.showSystem			= this.showSystem.bind ( this );
		this.showChange 		= this.showChange.bind ( this );
		this.findNodeByRecId	= this.findNodeByRecId.bind ( this );
		this.createGraph		= this.createGraph.bind ( this );
		this.pushTransition		= this.pushTransition.bind ( this );
		this.popTransition		= this.popTransition.bind ( this );
		this.incTransitions		= this.incTransitions.bind ( this );
		this.transitionInterrupt =
							this.transitionInterrupt.bind ( this );
		this.transitionEnd		= this.transitionEnd.bind ( this );
		this.loadGraph			= this.loadGraph.bind ( this );
		this.addClipPath		= this.addClipPath.bind ( this );
		this.rmvClipPath		= this.rmvClipPath.bind ( this );
	//	this.existingRecords	= this.existingRecords.bind ( this );
	//	this.onInput			= this.onInput.bind ( this );
		this.grfClick			= this.grfClick.bind ( this );
		this.textClick			= this.textClick.bind ( this );
		this.expand				= this.expand.bind ( this );
		this.collapse			= this.collapse.bind ( this );
		this.expandToLeaves 	= this.expandToLeaves.bind ( this );
		this.clickExpandCollapse	
								= this.clickExpandCollapse.bind ( this );
		this.appendGraphNodeContents
								= this.appendGraphNodeContents.bind ( this );
		this.removeText			= this.removeText.bind ( this );
	//	this.textGroup			= this.textGroup.bind ( this );
	//	this.textUser			= this.textUser.bind ( this );
	//	this.textSystem			= this.textSystem.bind ( this );
		this.textGUS			= this.textGUS.bind ( this );
		this.textTypeName		= this.textTypeName.bind ( this );
		this.fixGraphNodeContents
								= this.fixGraphNodeContents.bind ( this );

	}

	keyDown ( o ) {
		let sW = 'uDsrcGraph keyDown()';
		if ( o.ev.altKey ) {
			sW += ' alt' }
		sW += ' ' + o.ev.key;
	//	cmn.log ( sW );

		if ( o.ev.key === '+' ) {
			this.addData ( this.focusedData ); 
			return true; }

		if ( o.ev.key === 'Escape' ) {
			if ( this.focusedData ) {
				this.prevFocusedData = this.focusedData;
				this.setFocus ( null ); }
			return true; }

		//	To cycle focus on a node maybe see how it is done on child
		//	controls in a UDUI.

		if ( (o.ev.key === 'ArrowDown') || (o.ev.key === 'ArrowUp') ) {
			if ( ! this.focusedData ) {
				this.firstFocus(); 
				return true; }
			this.changeFocusUpOrDown ( o.ev ); 
			return true; }

		if ( (o.ev.key === 'ArrowRight') || (o.ev.key === 'ArrowLeft') ) {
			if ( ! this.focusedData ) {
				this.firstFocus(); 
				return true; }
			this.changeFocusLeftOrRight ( o.ev ); 
			return true; }

		return false;
	}	//	keyDown()

	firstFocus() {
		if ( this.prevFocusedData ) {
			this.setFocus ( this.prevFocusedData ); 
			return; }
		//	Start with the top left node.
		let data = this.data;
		let topLeftD = null;
		let mostLeft = [];
		let i = 0;
		for ( i = 0; i < data.length; i++ ) {
			let d = data[i];
			if ( mostLeft.length == 0 ) {
				mostLeft.push ( d );
				continue; }
			if ( d.x < mostLeft[0].x ) {
				mostLeft = [];
				mostLeft.push ( d );
				continue; }
			if ( d.x == mostLeft[0].x ) {
				mostLeft.push ( d ); } }
		for ( i = 0; i < mostLeft.length; i++ ) {
			let d = mostLeft[i];
			if ( ! topLeftD ) {
				topLeftD = d;
				continue; }
			if ( d.y < topLeftD.y ) {
				topLeftD = d; } }
		if ( ! topLeftD ) {
			return; }
		this.setFocus ( topLeftD );
	}	//	firstFocus()

	changeFocusUpOrDown ( ev ) {
		let sW = 'uDsrcGraph changeFocusUpOrDown()';
		let data = this.data;
		let x = this.focusedData.x;
		let xa = [];
		data.forEach ( d => {
			if ( d.x === x ) {
				xa.push ( d ) } } );
		if ( xa.length <= 1 ) {
			return; }
		xa.sort ( ( a, b ) => {
			if ( a.y < b.y ) {
				return -1; }
			if ( a.y > b.y ) {
				return  1; }
			return; } );
		let id = this.focusedData.id;
		let i = xa.findIndex ( d => d.id === id );
		if ( i < 0 ) {
			cmn.error ( sW, 'not found' );
			return; }
		if ( (ev.key === 'ArrowUp') && (i > 0) ) {
			id = xa[i-1].id; }
		if ( (ev.key === 'ArrowDown') && (i < xa.length - 1) ) {
			id = xa[i+1].id; }
		if ( id != this.focusedData.id ) {
			let d = data.find ( d => d.id === id );
			if ( d ) {
				this.setFocus ( d ); } }
	}	//	changeFocusUpOrDown()

	changeFocusLeftOrRight ( ev ) {
		//	There may be multiple "children" and "parents". Which
		//	child (right) or parent (left) to move to?
		//	Ans (for now): Try to stay close to the current y at 
		//	this move. Then the user may move up/down to get to the
		//	correct parent or child (but it will be easy at that time
		//	to move up or down to data that is not in the current
		//	lineage).
		let fd = this.focusedData;
		let xa = [];
		if ( ev.key === 'ArrowLeft' ) {
			//	Any parent data? If none then we are as far left as
			//	we can go.
			this.links.forEach ( l => {
				if ( l.target.id === fd.id ) {
					xa.push ( l.source); } } ); }
		else {
			//	Something similar moving to the right.
			this.links.forEach ( l => {
				if ( l.source.id === fd.id ) {
					xa.push ( l.target); } } ); }
		if ( xa.length == 0 ) {
			return; }

		//	Of the data in xa[] select that that is closest in y
		//	to the current.
		let delta = Number.MAX_SAFE_INTEGER;
		let dNext = null;
		xa.forEach ( d => {
			let d0 = Math.abs ( d.y - fd.y );
			if ( d0 < delta ) {
				delta = d0;
				dNext = d; } } );
		if ( dNext ) {
			this.setFocus ( dNext ); }
	}	//	changeFocusLeftOrRight()

	addData ( parentD ) {
		const sW = 'uDsrcGraph addData()';

		let self = this;
		let data = this.data;
		let x = this.minX;
		let y = this.minY;

		let parentRecId   = 0;
		let parentRecName = '';

		
		if ( parentD ) {
			parentRecId   = parentD.rd.recId;
			parentRecName = parentD.rd.name;
			//	The new data will be a child of the specified parent.
			//	Which means it will appear to the right of parentD.
			//	But at what y?
			//	Ans: At the same y as the parent.  For now.
			y = parentD.y;
			//	For x, find an existing child of the same parent.
			let child = this.data.find ( d => {
				let rd = d.rd;
				if ( rd.recId === parentRecId ) {
					return false; }
				for ( let ip = 0; ip < rd.parents.length; ip++ ) {
					if ( rd.parents[ip].recId === parentRecId ) {
						return true; } }
				return false; } );
			if ( child ) {
				x = child.x; }
			else {
				x = parentD.x + this.spcX; } }

		//	Is add enabled? -
		//	-	for types -
		//		-	if active group (app session group) is public
		//			then yes, enabled.
		//		-	if active group is private then add permission
		//			is determined by policy.
		//	Therefore -
		//	-	need some kind of callback here to determine permision.
		if ( ! uc.isObject ( this.code ) ) {		//	Possibly in design mode?
			cmn.error ( sW, 'no code (design mode?)' );
			return; }
		if ( parentD && ! this.code.mayAddGraphNode ( parentD.rd ) ) {
			return; }

		let newD = null;
		let bPanCheckNecessary = true;;

		this.newD ( parentRecName, parentRecId ).then ( nd => {
			if ( ! nd ) {
				//	user might have canceled a dialog
				return 'ok'; }

			newD = nd;

			//	Is it, somehow (maybe another "<new>" child alrady exists?), 
			//	...
			if ( cmn.isBoolean ( newD.bNotNew ) && newD.bNotNew ) {
				if ( parentD && ! parentD.isExpanded ) {
					return self.expand ( parentD ); }
				return 'ok'; }

			//	Existing data at the new data's x and at that y or below will 
			//	need to be moved down.
			data.forEach ( d => {
				if ( (d.x === x) && (d.y >= y) ) {
					d.y += self.spcY; } } ); 
			
			
			let gd: any = { rd:	newD };	//	Used in two case below - no 
			gd.x = x;					//	parent or parent is already 	
			gd.y = y;					//	expanded. Otherwise this is
			gd.w = self.nodeW;			//	not used as it is created when
			gd.h = self.nodeH;			//	the parent is expanded - but no
			gd.isExpanded = false		//	big deal.

			if ( ! parentD ) {
				gd.id = ++self.lastDataId;
				newD.gd = gd;
				self.data.push ( gd ); }
			else {	
				parentD.rd.children.push ( { recId: newD.recId, 
											 name:	newD.name } ); 

				if ( parentD.isExpanded ) {
					gd.id = ++self.lastDataId;
					newD.gd = gd;
					self.data.push ( gd );
					self.links.push ( { id:			++self.lastLinkId,
										source:		parentD,
										target:		newD.gd } ); }
				else {
					if ( ! self.gotExpandPathEle ( parentD ) ) {
						let g = d3.select ( '#' + self.grfEleId 
												+ '-' + parentD.id );
						if ( g.empty() ) {
							cmn.error ( sW, 'parent g not found' ); }
						else {
							self.appendExpandPath ( parentD, g ); } } 

					bPanCheckNecessary = false; 
				//	return self.clickExpandCollapse ( parentD ); } }
					return self.expand ( parentD ); } }
				
			return Promise.resolve ( 'ok' );
			
		} ).then ( () => {

			if ( ! newD ) {
				return 'ok'; }
				
		//	self.loadGraph ( sW );
			self.spaceVert();
			return self.spaceHorz();	//	calls loadGraph()

		} ).then ( () => {

			if ( ! newD ) {
				return 'ok'; }
				
			self.setFocus ( newD.gd );
				
			self.edit ( newD.gd, bPanCheckNecessary );
			return 'ok';
		} ) .catch ( err => {
			cmn.errorCatch ( sW, err );
		} );
	}	//	addData()

	nodeClick ( d, i, ele ) {
		const sW = 'uDsrcGraph nodeClick()';
	//	cmn.log ( sW );
		if ( this.focusedData && (this.focusedData.id === d.id) ) {
			this.setFocus ( null );
			return; }
		this.setFocus ( d );
	}	//	nodeClick()

	setFocus ( d ) {
		const sW = 'uDsrcGraph setFocus()';
		cmn.log ( sW, ' d.id: ' + (d ? d.id : '(d is null)') );
		let self = this;
		let code = this.code;

		if ( ! uc.isObject ( code ) ) {		//	Possibly in design mode?
			cmn.error ( sW, 'no code (design mode?)' );
			return; }

		if ( this.focusedData ) {
			let s = '#' + this.grfEleId + '-' + this.focusedData.id;
			d3.select ( s )
			//	.style ( 'cursor', 'pointer' )
				.select ( 'rect' )
					.style ( 'stroke', self.nodeBorderColor )
					.style ( 'stroke-width', '1px' );
			this.focusedData = null; 
			code.nodeSelected ( null ); }

		if ( cmn.isFunction ( code.grfFocus ) ) {
			code.grfFocus(); }

		if ( ! d ) {
			return; }
		
		let s = '#' + this.grfEleId + '-' + d.id;
		d3.select ( s )
		//	.style ( 'cursor', 'unset' )
			.select ( 'rect' )
		//		.style ( 'stroke', 'blue' )
				.style ( 'stroke', ( d: any ) => {
					return d.rd.bFiltered ? 'yellowgreen' : 'blue' } )
				.style ( 'stroke-width', '1px' );
			
		this.focusedData = d;
		code.nodeSelected ( d.rd );
	
		//	Pan to position the new node away from the borders?
		let box = { x:	d.x,		//	the area we want to be in view
					y:	d.y,
					w:	d.w,
					h:	d.h,
					dx:	0,			//	how much to pan
					dy:	0 };
		if ( this.grfD.isPanNecessary ( box ) ) {
			this.setExtents();
			this.incTransitions ( this.grfD.eleId );
			this.grfD.pan ( box.dx, box.dy, this.transitionEnd,
											this.transitionInterrupt ); }
	}	//	setFocus()

	setExtents() {
		if ( ! this.grfD ) {
			return; }
		let extents = this.getExtents();
		this.grfD.ex = extents.maxX - extents.minX;
		this.grfD.ey = extents.maxY - extents.minY;
	}	//	setExtents()

	getExtents() {
		let extents = { minX:	0,
						maxX:	Number.MIN_VALUE,
						minY:	0,
						maxY:	Number.MIN_VALUE };
		this.data.forEach ( d => {
		//	if ( d.x < extents.minX ) {
		//		extents.minX = d.x; }
			if ( d.x + d.w > extents.maxX ) {
				extents.maxX = d.x + d.w; }
		//	if ( d.y < extents.minY ) {
		//		extents.minY = d.y; }
			if ( d.y + d.h > extents.maxY ) {
				extents.maxY = d.y + d.h; } } );
		extents.maxX += this.minX / 2;
		extents.maxY += this.minY / 2;
		return extents;
	}	//	getExtents()
	
	spaceHorz() {
		const sW = 'uDsrcGraph spaceHorz()';
		let self = this;
		let atX  = {};		//	all nodes at a particular x

		function pushAtX ( d, x ) {
			if ( ! atX[x] ) {
				atX[x] = { ad: [] }; }
			atX[x].ad.push ( d ); }
		
		this.data.forEach ( d => { pushAtX ( d, d.x ); } );

		let xes = Object.keys ( atX );
		xes.sort ( ( a, b ) => {
			let ia = Number.parseInt ( a );
			let ib = Number.parseInt ( b );
			if ( ia < ib ) {
				return -1; }
			if ( ia > ib ) {
				return  1; }
			return 0; } );
		
		//	Adjust horizontal spacing. It may be that all items at
		//	a particular x have short (or one is significantly longer) 
		//	texts. The items at the next x should be moved left (or
		//	right) to make things look better.
		let newX = self.minX;
		xes.forEach ( ( x, ix ) => {
			if ( ix === xes.length - 1 ) {
				return Promise.resolve ( 'ok' ); }
			let ad = atX[x].ad;
			let maxW = 0;
			ad.forEach ( d => { if ( d.w > maxW ) maxW = d.w; } );

			newX += maxW + (self.spcX / 4);
			ad = atX[xes[ix+1]].ad;
			ad.forEach ( d => d.x = newX );
		} );

		//	Just call loadGraph() to update the positions of the nodes and 
		//	paths.
		return this.loadGraph ( sW );
	}	//	spaceHorz()

	spaceVert() {
		const sW = 'uDsrcGrap spaceVert()';

		let roots = [];
	//	let nodes = {};

		//	Get roots, nodes.
		this.data.forEach ( d => {
			if ( d.rd.parents.length === 0 ) {
				roots.push ( d ); } } );
	//		nodes[d.rd.recId] = { d:		d,
	//						  children:	[] }; } );

		//	Get children.
	//	this.data.forEach ( d => {
	//		d.parents.forEach ( p => {
	//			nodes[p.recId].children.push ( nodes[d.recId] ); } ); } );

		let self = this;

		function setY ( o ) {
			let ch = 0;
	//		if ( o.node.children.length === 0 ) {
			if ( o.d.rd.children.length === 0 ) {
				ch = self.spcY;
	//			o.node.d.y = o.offs + (ch / 2); }
				o.d.y      = o.offs + (ch / 2); }
			else {
				let lastOffs = o.offs;
	//			o.node.children.forEach ( node => {
	//				let h = setY ( { node: node, offs: lastOffs } );
				o.d.rd.children.forEach ( child => {
					let gd = self.rawD[child.recId].gd;
					if ( ! gd ) {	//	not visible (parent not expanded)?
						return; }
					let h = setY ( { d:		gd, 
									 offs:	lastOffs } );
					lastOffs += h;
					ch += h; } );
				if ( ch === 0 ) {
					ch = self.spcY; }
	//			o.node.d.y = o.offs + (ch / 2); }
				o.d.y      = o.offs + (ch / 2); }
			return ch; }

		let offs = this.spcY / 2;
		roots.forEach ( root => {
	//		let ch = setY ( { node: nodes[root.recId],        offs: offs } ); 
			let ch = setY ( { d:    self.rawD[root.rd.recId].gd, 
							  offs: offs } ); 
			offs += ch; } );

		this.setExtents();
	}	//	spaceVert()

	initialNodes ( code: null | any ) {
		const sW = 'uDsrcGraph initialNodes()';
	//	cmn.log ( sW );

		this.code = code;

		if ( ! uc.isObject ( code ) ) {		//	Possibly in design mode?
			return Promise.resolve ( 'ok' ); }

		if ( uc.isFunction ( code.graphInitialNodes ) ) {
			code.graphInitialNodes ( this );
			return Promise.resolve ( 'ok' ); }

		if ( ! uc.isFunction ( code.graphFirstNodes ) ) {
			return Promise.resolve ( 'ok' ); }

		let self = this;

	//	this.existingRecords().then ( msg => {
		return code.graphFirstNodes ( this ).then ( msg => {

			//	Which of rawD to render first?  All? Only the root nodes?
			//	The root nodes and their first children?
			//
			//	All that was just gotten. Maybe limit what was gotten. As
			//	the user clicks on the expansion buttons then get those 
			//	nodes' data.
			self.data  = [];
			self.links = [];
			let keys = Object.keys ( self.rawD );
			keys.forEach ( recId => {
				let rd = self.rawD[recId];
				if ( rd.parents.length > 0 ) {	//	Just the root nodes.
					rd.gd = null;
					return; }
				let gd = { rd:	rd, isExpanded: false };
					rd.gd = gd;
				self.data.push ( gd );
			} );

			let data = self.data;

			let atX = {};		//	all nodes at a particular x

			function pushAtX ( d, x ) {
				if ( ! atX[x] ) {
					atX[x] = { ad: [] }; }
				atX[x].ad.push ( d ); }

			function maxAncestry ( d ) {
				let prnts = d.rd.parents;
				if ( (! uc.isArray ( prnts )) || (prnts.length === 0) ) {
					return 0; }
				let naMax = 0;
				for ( let i = 0; i < prnts.length; i++ ) {
					let parentD = self.rawD[prnts[i].recId].gd;
					let nA = maxAncestry ( parentD );
					if ( nA > naMax ) {
						naMax = nA; } }
				return naMax + 1;
			}	//	maxAncestry()

			data.forEach ( d => {
				let nA = maxAncestry ( d );
				pushAtX ( d, self.minX + (nA * self.spcX) ); } );

			let xes = Object.keys ( atX );
			xes.sort ( ( a, b ) => {
				let ia = Number.parseInt ( a );
				let ib = Number.parseInt ( b );
				if ( ia < ib ) {
					return -1; }
				if ( ia > ib ) {
					return  1; }
				return 0; } );

			let ad, nRows, maxRows = 0;
			xes.forEach ( x => {
				ad = atX[x].ad;
				nRows = ad.length;
				if ( nRows > maxRows ) {
					maxRows = nRows; } } );

			xes.forEach ( ( x, ix ) => {
				ad = atX[x].ad;
				nRows = ad.length;
				let y = self.minY + (((maxRows - nRows) / 2) * self.spcY);
				ad.forEach ( ( d, iy ) => {
					d.id = ++self.lastDataId;
					d.x = self.minX + (ix * self.spcX);
					d.y = y + (iy * self.spcY);
					d.w = self.nodeW;
					d.h = self.nodeH; 
			
					let prnts = d.rd.parents;
					if ( ! uc.isArray ( prnts ) ) {
						return; }
					prnts.forEach ( parent => {
						let parentD = self.rawD[parent.recId].gd;
						self.links.push ( { id:			++self.lastLinkId,
											source:		parentD,
											target:		d } ); } );
				} ); 
			} );

		//	self.loadGraph ( sW );
			self.spaceVert();
			return self.spaceHorz(); 	//	Calls loadGraph() too.
		} ).then ( () => {

				//	After the first loadGraph() widths of items are set. This
				//	then will compact things.
			return self.spaceHorz();	//	Calls loadGraph() too.
		} ).then ( () => {
			return 'ok';
		}) .catch ( err => {
			cmn.errorCatch ( sW, err );
		} ); 
	}	//	initialNodes()

	showGroup ( bShow ) {
		const sW = 'uDsrcGraph showGroup()';
	//	cmn.log ( sW, ' ' + bShow );
		this.bShowGroup = bShow;
		this.showChange();
	}	//	showGroup()

	showUser ( bShow ) {
		const sW = 'uDsrcGraph showUser()';
	//	cmn.log ( sW, ' ' + bShow );
		this.bShowUser = bShow;
		this.showChange();
	}	//	showUser()

	showSystem ( bShow ) {
		const sW = 'uDsrcGraph showSystem()';
	//	cmn.log ( sW, ' ' + bShow );
		this.bShowSystem = bShow;
		this.showChange();
	}	//	showSystem()

	showChange() {
		this.spcY 	=  20;
		if ( this.bShowGroup ) {
			this.spcY 	+=  20; }
		if ( this.bShowUser ) {
			this.spcY 	+=  20; }
		if ( this.bShowSystem ) {
			this.spcY 	+=  20; }

		this.nodeH	=  16;
		if ( this.bShowGroup ) {
			this.nodeH	+=  this.nodeLineH; }
		if ( this.bShowUser ) {
			this.nodeH	+=  this.nodeLineH; }
		if ( this.bShowSystem ) {
			this.nodeH	+=  this.nodeLineH; }

		if ( this.bShowGroup || this.bShowUser || this.bShowSystem ) {
			this.nodeBorderColor	= 'lightgray'; }
		else {
			this.nodeBorderColor	= 'transparent'; }
		
		let self = this;
		this.data.forEach ( d => { 
			self.fixGraphNodeContents ( d ); } );
		this.spaceVert();			//	Considers spcY.
		//	Calls loadGraph() too.
		return this.spaceHorz().then ( () => {
			self.setExtents();
			return 'ok';
		} );

	}	//	showChange()

	findNodeByRecId ( recId: number ) {
		const sW = 'uDsrcGraph findNodeByRecId()';
	//	cmn.log ( sW );
		return this.data.find ( gd => gd.rd.recId === recId );
	}	//	findNodeByRecId()

	createGraph ( parentG, grfD) {
		const sW = 'uDsrcGraph createGraph()';
	//	cmn.log ( sW );
		
		let self = this;

		self.grfD     = grfD;
		self.defs     = grfD.rpd.svg.select ( 'defs' );
		self.grfEleId = grfD.eleId + '-grf';

		self.link = d3.linkHorizontal().source ( function ( d: any ) {
			// Calculate the (x, y) position for the link attachment
			// on the source node.
			return [
				d.source.x +  d.source.w - 2,
				d.source.y + (d.source.h / 2)
			]
		} ).target ( function ( d: any ) {
			return [
				d.target.x,
				d.target.y + (d.target.h / 2)
			];
		} );

		function zoomCB() {
			self.grfD.checkPan ( 0, 0 );	//	Checks/limits panX, panY.
			self.grfD.updateSclrs();
		}	//	zoomCB()

		let zoom = new uc.Zoom ( { zge:		self.zge,
								   rect:	self.grfD.eleId + '-rect',
								   d:		self.grfD,
								   cb:		zoomCB } );

		let zoomFilter = new uc.ZoomFilter();

		this.zoomListener = d3.zoom()
								.scaleExtent ( [self.zge.lowerExtent, 
												self.zge.upperExtent] )
								.on ( "zoom", zoom )
								.filter ( zoomFilter );

		d3.select ( '#' + grfD.eleId + '-rect' )
			.call ( this.zoomListener );
			
		self.gClip = parentG.append ( 'g' )
			.attr ( 'clip-path', d => 'url(#cp-' + d.eleId + ')' );

		self.svgGroup = self.gClip.append ( 'g' )
							.attr ( 'id', d => d.eleId + '-grf-main' );

		self.zge.g = self.svgGroup;

		this.initialNodes ( null );

	}	//	createGraph()

	pushTransition ( sW, cb ) {
		if ( this.transitions.length === 0 ) {
			cb(); }
		this.transitions.push ( { sW: sW, cb: cb } );
	}	//	pushTransition()

	popTransition() {
		if ( this.transitions.length === 0 ) {
			return; }
		let t = this.transitions.shift();
		t.cb();
	}	//	popTransition()

	incTransitions ( eleId ) {
		this.nTransitions++;
	//	let t = this.transitions[eleId];
	//	if ( ! t ) {
	//		this.transitions[eleId] = t = { cnt: 0 }; }
	//	t.cnt++;
	}	//	incTransitions()


	transitionInterrupt ( d, i ) {
		const sW = 'uDsrcGraph transitionInterrupt()';
		this.nTransitions -= 1;
	//	cmn.log ( sW, 'nTransitions ' + this.nTransitions );
		if ( this.nTransitions === 0 ) {
			this.popTransition(); 
			if ( cmn.isFunction ( this.transitionResolve ) ) {
				this.transitionResolve ( 'ok' );
				this.transitionResolve = null; } }
	}	//	transitionInterrupt()

	transitionEnd ( d, i ) {
		const sW = 'uDsrcGraph transitionEnd()';
		if ( ! this.grfD ) {
			return; }
		this.nTransitions -= 1;
	//	cmn.log ( sW, 'nTransitions ' + this.nTransitions );
		if ( this.nTransitions === 0 ) {
			this.setExtents();
			this.grfD.updateSclrs(); 
			this.popTransition(); 
			if ( cmn.isFunction ( this.transitionResolve ) ) {
				this.transitionResolve ( 'ok' );
				this.transitionResolve = null; } }
	}	//	transitionEnd()

	loadGraph ( sC ) {
		let sW = 'uDsrcGraph loadGraph()';
		let self = this;
		let data = this.data;
		let g = this.svgGroup;

		//	Promise resolved when transitions are done.

		if ( this.nTransitions > 0 ) {
			return Promise.reject ( sW + ': outstanding transitions' ); }
	
		return new Promise ( ( res, rej ) => {

			let s = null;

			s = g.selectAll ( 'g' )
				.data ( data, d => {
					if ( d ) {
					//	cmn.log ( sW, ' .data-key():  id ' + d.id );
						return d.id; }
					cmn.log ( sW, ' .data-key(): d is null' );
					return 0; 
				} );

			//	Update
			s.each ( function ( d, i, group ) {
				self.incTransitions ( this.id );
				d3.select ( this ).transition()
					.duration ( self.durationUpdate )
					.attr ( 'transform', ( d: any ) => { 
						return 'translate ( ' + d.x + ', ' + d.y + ')' } )
					.on ( 'end', self.transitionEnd )
					.on ( 'interrupt', self.transitionInterrupt ); } );

			//	New
			let newG = s.enter()
				.append ( 'g' )
					.attr ( 'id', d => self.grfEleId + '-' + d.id )
					.attr ( 'transform', d => { 
						return 'translate ( ' + d.x + ', '
											  + d.y + ')' } );

			newG.each ( d => {
				self.addClipPath ( d ); } );
				
			newG
				.append ( 'rect' )
					.attr ( 'id', d => self.grfEleId + '-' + d.id + '-rect' )
					.attr ( 'x', d => 0 )
					.attr ( 'y', d => 0 )
					.attr ( 'width', d => d.w )
					.attr ( 'height', d => d.h )
		//			.style ( 'fill', 'white' )
					.style ( 'fill', d => d.rd.bFiltered 
												? 'rgb(248,248,248)'
												: 'white' )
		//			.style ( 'stroke', self.nodeBorderColor )
					.style ( 'stroke', d => d.rd.bFiltered 
												? 'lightgray'
												: self.nodeBorderColor )
					.style ( 'stroke-width', '1px' )
					.call ( this.zoomListener );

		//	this.appendGraphNodeContents ( newG );
			newG.each ( ( d, i ) => {
			//	self.appendGraphNodeContents ( newG, d ) } );
			 	let s = d3.select ( newG._groups[0][i] );
				self.appendGraphNodeContents ( s, d ) } );
						
			//	Adjust node widths to their contents.
			newG.select ( 'rect' )
				.attr ( 'width', d => d.w );


			//	Old (remove)
			let oldG = s.exit();

			oldG.each ( d => {
			//	cmn.log ( 'oldG id ' + d.id ); 
				self.rmvClipPath ( d ); } );

			oldG.remove();

			//	Likewise the paths.
			//
			//	child paths but not further descendents (the expand/collapse
			//	arc paths)
			let parentEleId = this.grfEleId + '-main';
			s = g.selectAll ( 'path' ).filter ( function ( d, i ) {
					let e = this;
					if ( e.parentElement.id !== parentEleId ) {
						return null; }
					return this;
				} )
				.data ( self.links, d => {
					if ( d ) {
						return d.id; }
					return 0; 
				} );

			//	New
			s.enter()
				.append ( 'path' )
					.attr ( 'id', d => {
						return self.grfEleId + '-path-' + d.id; } )
					.attr ( 'd', self.link )
					.style ( 'fill', 'none' )
					.style ( 'stroke', 'gray' )
					.style ( 'stroke-width', '0.5px' )
					.call ( self.zoomListener );

			//	Update
			s.each ( function ( d, i, group ) {
				self.incTransitions ( this.id );
				d3.select ( this ).transition()
					.duration ( self.durationUpdate )
					.attr ( 'd', self.link )
					.on ( 'end', self.transitionEnd )
					.on ( 'interrupt', self.transitionInterrupt ); } );

			//	Remove 
			s.exit()
				.remove();

			if ( self.nTransitions === 0 ) {
				res ( 'ok' ); }
			else {
				self.transitionResolve = res; }
		} );	//	Promise
	}	//	loadGraph()

	addClipPath ( d ) {
		let self = this;
		let rpd  = self.grfD.rpd;
		
		//	Clip path - Offset by 2 from group/rect x and y, -4 on 
		//	group/rect w and h.  This should probably be the "root" 
		//	panel - where all the <defs> data goes.
		rpd.clipPathsData.push ( new ClipPathData ( this.grfEleId + '-cp-' 
																  + d.id, 
													2,  2, d.w - 5, 
														   d.h - 5 ) );

		//	Evidently having multiple <defs> messes things up.  Putting all 
		//	the clip paths under one <defs>.
		this.defs.selectAll ( 'clipPath' )
			.data ( self.clipPathsData, function ( d ) { 
				return d.id || (d.id = ++rpd.nextClipPathId); 
			} )
			.enter()
			.append ( 'clipPath' )
			.attr ( 'id', function ( d, i ) { 
		//		cmn.log ( 'clipPath ' + d.eleId );
				return d.eleId; } )					//	e.g., 'cp-base' and/or 'cp-btnA'
			.append ( 'rect' )
			.attr ( 'id',     function ( d, i ) { return d.eleId + '-rect'; } )		//	e.g., 'cp-base-rect' and/or 'cp-btnA-rect'
			.attr ( 'x',      function ( d, i ) { return d.x; } )
			.attr ( 'y',      function ( d, i ) { return d.y; } )
			.attr ( 'width',  function ( d, i ) { return d.w; } )
			.attr ( 'height', function ( d, i ) { return d.h; } );
	};	//	addClipPath()

	rmvClipPath ( d ) {
		this.defs.select ( '#' + this.grfEleId + '-cp-' + d.id )
			.remove();
	}	//	rmvClipPath()

	get graphTitle() {
		return 'Record Types';
	}	//	graphTitle()

	newD ( parentRecName, parentRecId ) {
		const sW = 'uDsrcGraph newD()';
		let self = this;

		let code = this.code;

		if ( ! uc.isObject ( code ) ) {		//	Possibly in design mode?
			cmn.error ( sW, 'no code (design mode?)' );
			return; }

		if ( ! code.newGraphNodeData ) {
			return Promise.resolve ( null ); }
		
		return new Promise ( ( res, rej ) => {
			//	Default name - "<new>" - user can click on and change it.
			code.newGraphNodeData ( { 
				parentRecName:	parentRecName,
				parentRecId:	parentRecId } ).then ( d => {
				if ( ! d ) {
					//	! d  could mean the user canceled the operation.
					res ( null );
					return; }

				let rd = null;
				if ( cmn.isBoolean ( d.bExists ) && d.bExists ) {
					rd = self.rawD[d.recId];	
					if ( ! rd ) {
						let err = { message: 'bExists but not in rawD' };
						cmn.error ( sW, err.message );
						rej ( err );
						return; }
					rd.bNotNew = true; }
				else {
					rd = self.rawD[d.recId] = d; }

				res ( rd );
			} ).catch ( err => {
				cmn.errorCatch ( sW, err, rej );
			} ); 
		} );
	}	//	newD()

	maxTextLength ( d ) {
		let ctl = 0;
		let eIdN = this.grfEleId + '-text-' + d.id;
		let ctlN = (<SVGTextContentElement>
					<unknown>document.getElementById ( eIdN ))
					.getComputedTextLength();
		if ( ctlN > ctl ) {
			ctl = ctlN; }
		if ( this.bShowGroup ) {
			let eIdG = this.grfEleId + '-text-group-' + d.id;
			let ctlG = (<SVGTextContentElement>
						<unknown>document.getElementById ( eIdG ))
						.getComputedTextLength();
			if ( ctlG > ctl ) {
				ctl = ctlG; } }
		if ( this.bShowUser ) {
			let eIdU = this.grfEleId + '-text-user-' + d.id;
			let ctlU = (<SVGTextContentElement>
						<unknown>document.getElementById ( eIdU ))
						.getComputedTextLength();
			if ( ctlU > ctl ) {
				ctl = ctlU; } }
		if ( this.bShowSystem ) {
			let eIdS = this.grfEleId + '-text-system-' + d.id;
			let ctlS = (<SVGTextContentElement>
						<unknown>document.getElementById ( eIdS ))
						.getComputedTextLength();
			if ( ctlS > ctl ) {
				ctl = ctlS; } }
		//	Add for any gus label letters.
		if ( this.bShowGroup || this.bShowUser || this.bShowSystem ) {
			ctl += this.GUSLabelWidth; }
		return ctl;
	}	//	maxTextLength()

	edit ( d, bDoPan?: boolean ) {
		const sW = 'uDsrcGraph edit()';
	//	cmn.log ( sW );
		let self = this;
		let code = this.code;

		if ( ! uc.isObject ( code ) ) {		//	Possibly in design mode?
			cmn.error ( sW, 'no code (design mode?)' );
			return; }

		if ( this.bEditingNodeText ) {
			return; }

	//	let focusedDid = this.focusedData ? this.focusedData.id : 0;
	//	if ( focusedDid ) {
	//		//	If not this node ...
	//		if ( focusedDid !== d.id ) {
	//			//	Unfocus the other node.
	//			this.setFocus ( null ); 
	//			//	Set focus to this node.
	//			this.setFocus ( d );
	//			//	The user must click this node again to edit, or hit Escape
	//			//	to unset focus.
	//			return; } }
	//	else {
	//		//	No node had focus. Set focus to this node. 
	//		this.setFocus ( d );
	//		//	The user must click this node again to edit, or hit Escape
	//		//	to unset focus.
	//		return; }
	//	Moved to textClick().
	
		d3.select ( '#' + self.grfEleId + '-text-' + d.id )
			.remove();

		self.bEditingNodeText = true;
		let curName = code.graphNodeName ( d.rd );
		let newName = '';

		function endEdit() {
			function updateParentChildName ( rd ) {
				let sW2 = sW + ' updateParentChildName()';
				rd.parents.forEach ( p => {
					let pD = self.rawD[p.recId];
					if ( ! pD ) {
						cmn.error ( sW2, 'pD not found' );
						return; }
					let c = pD.children.find ( c => c.recId === rd.recId );
					if ( ! c ) {
						cmn.error ( sW2, 'child ref in parent not found' );
						return; }
					c.name = rd.name; } ); }
			function updateChildParentName ( rd ) {
				let sW2 = sW + ' updateChildParentName()';
				rd.children.forEach ( c => {
					let cD = self.rawD[c.recId];
					if ( ! cD ) {
						cmn.error ( sW2, 'cD not found' );
						return; }
					let p = cD.parents.find ( p => p.recId === rd.recId );
					if ( ! p ) {
						cmn.error ( sW2, 'parent ref in child not found' );
						return; }
					p.name = rd.name; } ); }
			if ( newName !== '' ) {
				code.updateGraphNodeName ( d.rd, newName );
				updateParentChildName ( d.rd );
				updateChildParentName ( d.rd ); }
			d3.select ( '#' + self.grfEleId + '-fo-' + d.id )
				.remove();
			let g = d3.select ( '#' + self.grfEleId + '-' + d.id );
			self.appendText ( g, d );
			
		//	let eId = self.grfEleId + '-text-' + d.id;
		//	let ctl = (<SVGTextContentElement><unknown>document.getElementById ( eId ))
		//				.getComputedTextLength();
			let ctl = self.maxTextLength ( d );
			d.w = Math.round ( ctl ) + self.nodeWidthExtention;
			
			g.select ( 'rect' )
				.attr ( 'width', ( d: any ) => d.w );

			g.select ( 'rect ~ rect' )	//	expand button rect
				.attr ( 'x', ( d: any ) => d.w - self.expandBtnXOffs );

			self.spaceHorz().then ( () => { 
				self.setExtents();
				//	The area we want to be in view - the node of d.
				let box = { x:	d.x,
							y:	d.y,
							w:	d.w,
							h:	d.h,
							dx:	0,			//	how much to pan
							dy:	0 };
				//	Also checks against etxtents.
				if ( self.grfD.isPanNecessary ( box ) ) {
					//	transitionEnd() will update scrollers.
					self.incTransitions ( self.grfD.eleId );
					self.grfD.pan ( box.dx, box.dy, self.transitionEnd,
													self.transitionInterrupt ); } 
				else {
					self.grfD.updateSclrs(); }
			} ).catch ( err => {
				cmn.errorCatch ( sW, err );
			} );
		}	//	endEdit()

		function inputKeydown ( evt: KeyboardEvent ) {
			if ( ! self.bEditingNodeText ) {
				return; }
			evt.stopPropagation();
			if ( evt.key === 'Escape' ) {
				self.bEditingNodeText = false;
				newName = '';
				endEdit();
				return; }
			if ( evt.key === 'Enter' ) {
				self.bEditingNodeText = false;
				newName = (<HTMLInputElement>evt.target).value;
				endEdit();
				return; }
		}	//	inputKeydown

		function inputClick ( evt: PointerEvent, d ) {
		//	cmn.log ( sW, ' click()' );
			evt.stopPropagation();
		}	//	inputClick()

		let sInputHTML =
				'<input '
			+		'id="' + self.grfEleId + '-input-' + d.id + '" '
			+		'type="text" '
			+		'autocorrect="off" '
			+		'spellcheck="false" '
			+		'class="u34-input" '
			+		'style="width:'  + (d.w - 4) + 'px; '
						+  'height:' + (     12) + 'px; '
						+  'border: none; '
						+  'text-align: left;" '
			+		'value="' + curName + '">'
			+	'</input>';

		d3.select ( '#' + self.grfEleId + '-' + d.id )
			.append ( 'foreignObject' )
				.attr ( 'id',     ( d: any ) => self.grfEleId + '-fo-' + d.id )
				.attr ( 'x',      1 )
				.attr ( 'y',      2 )
				.attr ( 'width',  ( d: any ) => (d.w - 4) + 'px' )
				.attr ( 'height', ( d: any ) => (     12) + 'px' )
				.append ( 'xhtml:body' )
					.style ( 'font', '10px "verdana"' )
					.html ( sInputHTML )
					.on ( 'keydown', inputKeydown )
					.on ( 'click',	 inputClick );
				//	.on ( 'input',	 self.onInput );	//	fires on any change

		let e = document.getElementById ( self.grfEleId + '-input-' + d.id );

		e.addEventListener ( 'change', evt => {
			if ( ! self.bEditingNodeText ) {
				return; }
			self.bEditingNodeText = false;
		//	cmn.log ( 'change ' + (<HTMLElement>evt.target).id );
		//	d.typeName = evt.target.value;
			newName    = (<HTMLInputElement>evt.target).value;
		} );

		e.addEventListener ( 'blur', evt => {
			if ( ! self.bEditingNodeText ) {
				return; }
			self.bEditingNodeText = false;
		//	cmn.log ( 'blur ' + (<HTMLElement>evt.target).id + ':  newName ' + newName ); 
			endEdit();
		} );

		e.focus();
		
		//	Pan to position the new node from intersecting the borders?
		if ( cmn.isBoolean ( bDoPan ) && ! bDoPan ) {
			return; }

		let box = { x:	d.x,		//	the area we want to be in view
					y:	d.y,
					w:	d.w,
					h:	d.h,
					dx:	0,			//	how much to pan
					dy:	0 };
		this.setExtents();
		if ( this.grfD.isPanNecessary ( box ) ) {
			//	transitionEnd() will update scrollers.
			this.incTransitions ( this.grfD.eleId );
			this.grfD.pan ( box.dx, box.dy, this.transitionEnd,
											this.transitionInterrupt ); } 
		else {
			this.grfD.updateSclrs(); }
	}	//	edit()

//	onInput ( d, i, ele ) {
//		const sW = 'uDsrcGraph onInput()';
//		cmn.log ( sW );
//	}	//	onInput()

	grfClick ( d, i, ele ) {
		const sW = 'uDsrcGraph grfClick()';
		cmn.log ( sW );
		this.setFocus ( null ); 
	}	//	grfClick()

	textClick ( evt: PointerEvent, d ) {
		const sW = 'uDsrcGraph textClick()';
	//	cmn.log ( sW );
		evt.stopPropagation();
		if ( ! cmn.isBoolean ( d.rd.bFiltered ) ) {
			cmn.error ( sW, 'no d.rd.bFiltered' );
			return; }

	//	if ( d.rd.bFiltered ) {			//	Not selectable?, Ignore?
	//		return; }
	//	Focusable but not selectable?
	//		bFiltered  >>>  not selectable
	//	Possibly focusable.

	//	if ( d.rd.name[0] === '^' ) {	//	A root node?
	//		return; }
	//	Possibly focusable.

		let focusedDid = this.focusedData ? this.focusedData.id : 0;
		if ( focusedDid ) {
			//	If not this node ...
			if ( focusedDid !== d.id ) {
				//	Unfocus the other node.
				this.setFocus ( null ); 
				//	Set focus to this node.
				this.setFocus ( d );
				//	The user must click this node again to edit, or hit Escape
				//	to unset focus.
				return; } }
		else {
			//	No node had focus. Set focus to this node. 
			this.setFocus ( d );
			//	The user must click this node again to edit, or hit Escape
			//	to unset focus.
			return; }
		
		if ( (! d.rd.bFiltered) && (d.rd.name[0] !== '^') ) {
			this.edit ( d ); }
	}	//	textClick()

//	expand ( d, i?: any, ele?: any ) {
	expand ( d,          ele?: any ) {
		const sW = 'uDsrcGraph expand()';
		cmn.log ( sW );
		
		if ( d.rd.children.length === 0 ) {
			return Promise.resolve ( 'ok' ); }

		if ( ! ele ) {
//			ele = [this.getExpandPathEle ( d )];
//			i   = 0; }
			ele =  this.getExpandPathEle ( d ); }

		let self = this;

		function cousinX() {
			//	If any sibling of d is expanded then want x of one of it's 
			//	children.
			let x = d.x + self.spcX;		//	default
			for ( let i = 0; i < self.data.length; i++ ) {
				let sd = self.data[i];		//	sibling of d
				if ( (sd.id === d.id) || (sd.x !== d.x) || ! sd.isExpanded ) {
					continue; }
				let cd = self.rawD[sd.rd.children[0].recId];
				x = cd.gd.x;
				break; }
			return x; }

		let x = cousinX();
		d.rd.children.forEach ( child => {
			let rd = this.rawD[child.recId];
			let gd = { rd:			rd, 
					   isExpanded:	false,
					   id:			 ++this.lastDataId,
					   x:			x,
					   y:			d.y,
					   w:			this.nodeW,
					   h:			this.nodeH }; 
				rd.gd = gd;
			this.data.push ( gd );
			this.links.push ( { id:			++this.lastLinkId,
								source:		d,
								target:		gd } ); } );
		d.isExpanded = true;
		//	Remove the + in the expand/collapse button.
//		d3.select ( ele[i].parentElement ).selectAll ( 'line' ).remove();
		d3.select (    ele.parentElement ).selectAll ( 'line' ).remove();
		//	To set initial widths of new nodes.
		return this.loadGraph ( sW ).then ( () => {
			self.spaceVert();
			return self.spaceHorz();		//	Calls loadGraph() again.
		} ).then ( () => {
			self.setExtents();
			//	The area we want to be in view - the center child.
			let child = self.rawD[d.rd.children[0].recId];
			if ( child ) {
				let box = { x:	child.gd.x,
							y:	d.y,		//	child at same y as parent
							w:	self.nodeW,	//	guesstimate
							h:	self.nodeH,
							dx:	0,			//	how much to pan
							dy:	0 };
				if ( self.grfD.isPanNecessary ( box ) ) {
					//	transitionEnd() will update scrollers.
					self.incTransitions ( self.grfD.eleId );
					self.grfD.pan ( box.dx, box.dy, 
									self.transitionEnd,
									self.transitionInterrupt ); 

					return new Promise ( ( res, rej ) => {
						self.transitionResolve = res;
					} ); }
				else {
					self.grfD.updateSclrs(); } }
			else {
				self.grfD.updateSclrs(); }
			return 'ok';
		} ).catch ( err => {
			cmn.errorCatch ( sW, err );
			throw err;
		} );
	}	//	expand()

//	collapse ( d, i, ele ) {
	collapse ( d,    ele?: any ) {
		const sW = 'uDsrcGraph collapse()';
	//	cmn.log ( sW );

		if ( d.rd.children.length === 0 ) {
			return Promise.resolve ( 'ok' ); }

		if ( ! ele ) {
//			ele = [this.getExpandPathEle ( d )];
//			i   = 0; }
			ele =  this.getExpandPathEle ( d ); }

		let self = this;

		function removeLink ( targetRecId ) {
			let il = 
				self.links.findIndex ( l => l.target.rd.recId === targetRecId );
			if ( il < 0 ) {
				return; }
			let gd = self.rawD[targetRecId].gd;
			if ( gd && gd.isExpanded ) {
				gd.rd.children.forEach ( c => removeLink ( c.recId ) ); }
			self.links.splice ( il, 1 );
		}	//	removeLink()

		function removeNode ( nodeRecId ) {
			let iN =
				self.data.findIndex ( d => d.rd.recId === nodeRecId );
			if ( iN < 0 ) {
				return; }
			let rd = self.rawD[nodeRecId];
			let gd = rd.gd;
			rd.gd = null;
			if ( gd &&  gd.isExpanded ) {
				gd.rd.children.forEach ( c => removeNode ( c.recId ) ); }
			self.data.splice ( iN, 1 );
		}	//	removeNode()

		//	Remove descendents of d.
		d.rd.children.forEach ( c => {
			removeLink ( c.recId );
			removeNode ( c.recId ); } );
		d.isExpanded = false;
		//	Add the + in the expand/collapse button.
//		this.appendExpandPlus ( d, d3.select ( ele[i].parentElement ) );
		this.appendExpandPlus ( d, d3.select (    ele.parentElement ) );
		this.spaceVert();

		return this.spaceHorz().then ( () => {		//	Calls loadGraph().
			self.setExtents();
			//	The area we want to be in view - the node of d.
			let box = { x:	d.x,
						y:	d.y,
						w:	d.w,
						h:	d.h,
						dx:	0,			//	how much to pan
						dy:	0 };
			//	Also checks against etxtents.
			if ( self.grfD.isPanNecessary ( box ) ) {
				//	transitionEnd() will update scrollers.
				self.incTransitions ( self.grfD.eleId );
				self.grfD.pan ( box.dx, box.dy, self.transitionEnd,
												self.transitionInterrupt );  

				return new Promise ( ( res, rej ) => {
					self.transitionResolve = res;
				} ); }
			else {
				self.grfD.updateSclrs(); }

			return 'ok';
		} ).catch ( err => {
			cmn.errorCatch ( sW, err );
			throw err;
		} );
	}	//	collapse()
	
	expandToLeaves ( d ) {
		const sW = 'uDsrcGraph expandToLeaves() ' + d.rd.name;
		cmn.log ( sW );
		let self = this;
		return new Promise ( ( res, rej ) => {
			this.expand ( d ).then ( ( s: string ) => {
				let iChild = 0;
				function nextChild() {
					if ( iChild >= d.rd.children.length ) {
						res ( 'ok' );
						return; } 
					let child	= d.rd.children[iChild];
					let childD	= self.findNodeByRecId ( child.recId );
					if ( ! childD ) {
						cmn.error ( sW, 'child ' + child.name + ' not found' );
						return; }
					self.expandToLeaves ( childD ).then ( ( s ) => {
						iChild += 1;
						nextChild();
					} );
				}	//	nextChild()
				nextChild();
			} );
		} );
	}	//	expandToLeaves()

//	clickExpandCollapse ( d, i, ele ) {
	clickExpandCollapse ( evt: PointerEvent, d ) {
		const sW = 'uDsrcGraph clickExpandCollapse() ' + d.rd.name;
		cmn.log ( sW );
		evt.stopPropagation();

		if ( this.nTransitions > 0 ) {
			return; }

		let ele = evt.target;

		if ( ! d.isExpanded ) {
			if ( this.bExpandToLeaves ) {
			this.expandToLeaves ( d ); }
			else {
				this.expand ( d, ele ).then ( ( s: string ) => {
					cmn.log ( sW, s );
				} ); }
		}
		else {
			this.collapse ( d, ele ).then ( ( s: string ) => {
				cmn.log ( sW, s );
			} ); 
		}
	}	//	clickExpandCollapse()

	appendText ( g, d ) {
		let self = this;
		let nLines = 0;
		//	Group that created the type.
		if ( this.bShowGroup ) {
			nLines += 1;	
		//	g.append ( 'text' )
		//		.call ( this.textGroup, nLines ); }
			g.append ( 'text' )
				.call ( this.textGUS, nLines,  3,  'group-label', 'G:' ); 
			g.append ( 'text' )
				.call ( this.textGUS, nLines,  3 + this.GUSLabelWidth,  
											   'group',
											   d.rd.createdByGrpName ); }
		if ( this.bShowUser ) {
			nLines += 1;	
		//	g.append ( 'text' )
		//		.call ( this.textUser, nLines ); }
			g.append ( 'text' )
				.call ( this.textGUS, nLines,  3,  'user-label', 'M:' ); 
			g.append ( 'text' )
				.call ( this.textGUS, nLines,  3 + this.GUSLabelWidth,  
											   'user',
											   d.rd.createdByUserName ); }
		//	System that the type was created in.
		if ( this.bShowSystem ) {
			nLines += 1;	
		//	g.append ( 'text' )
		//		.call ( this.textSystem, nLines ); }
			g.append ( 'text' )
				.call ( this.textGUS, nLines,  3,  'system-label', 'S:' ); 
			g.append ( 'text' )
				.call ( this.textGUS, nLines,  3 + this.GUSLabelWidth,  
											   'system',
											   d.rd.createdInSysName ); }
		//	The type name.
		nLines += 1;
		g.append ( 'text' )
			.call ( this.textTypeName, nLines ); 
	}	//	appendText()

	getExpandPathEle ( d ) {
		return document.getElementById ( this.grfEleId + '-expand-' + d.id );
	}	//	getExpandPathEle()

	gotExpandPathEle ( d ) {
		return !! this.getExpandPathEle ( d );
	}	//	gotExpandPathEle()

	appendExpandPath ( d, g ) {
		let x = d.w - this.expandBtnXOffs;
	//	let y = this.expandBtnYOffs;
		let y = (d.h - this.expandBtnHeight) / 2;
		let arc  = d3.arc();
		let path = 	arc ( { innerRadius:	0,
							outerRadius:	this.expandBtnWidth / 2,
							startAngle:		0,
							endAngle:		Math.PI * 2 } );
		let self = this;
		g.append ( 'path' )
			.attr ( 'id', d => self.grfEleId + '-expand-' + d.id )
			.attr ( 'd', path )
			.attr ( 'transform', 'translate ( ' 
										+ (x + (self.expandBtnWidth / 2))
								 + ', ' + (y + (self.expandBtnHeight / 2))
								 + ' )' )
			.style ( 'fill', 'white' )
			.style ( 'stroke', 'gray' )
			.style ( 'stroke-width', '0.5px' )
			.style ( 'cursor', 'pointer' )
			.on ( 'click', self.clickExpandCollapse ) 
			.call ( self.zoomListener );
	}	//	appendExpandPath()

	appendExpandPlus ( d, g ) {
		let x = d.w - this.expandBtnXOffs;
	//	let y = this.expandBtnYOffs;
		let y = (d.h - this.expandBtnHeight) / 2;
		let self = this;
		g.append ( 'line' )
			.attr ( 'x1', x + 1 )
			.attr ( 'y1', y + (self.expandBtnHeight / 2) )
			.attr ( 'x2', x + self.expandBtnWidth - 1 )
			.attr ( 'y2', y + (self.expandBtnHeight / 2) )
			.attr ( 'class', 'u34-tree-expand-h-line' );
		g.append ( 'line' )
			.attr ( 'x1', x + (self.expandBtnWidth / 2) )
			.attr ( 'y1', y + 1 )
			.attr ( 'x2', x + (self.expandBtnWidth / 2) )
			.attr ( 'y2', y + self.expandBtnHeight - 1 )
			.attr ( 'class', 'u34-tree-expand-v-line' );
	}	//	appendExpandPlus()

	appendGraphNodeContents ( newG, d ) {
		let sW = 'uDsrcGraph appendGraphNodeContents()';
		let self = this;

		this.appendText ( newG, d );

		newG.each ( d => {
			let ctl = self.maxTextLength ( d );
		//	cmn.log ( sW, 'ctl ', ctl ); 
			d.w = Math.round ( ctl ) + self.nodeWidthExtention;
		} );
	
		newG.each ( function ( d ) {
			let x = d.w - self.expandBtnXOffs;
		//	let y = self.expandBtnYOffs;
			let y = (d.h - self.expandBtnHeight) / 2;
			let g = d3.select ( this );
			g.append ( 'rect' )
				.attr ( 'id', ( d : any ) =>         self.grfEleId 
											 + '-' + d.id 
											 + '-expand-rect' )
				.attr ( 'x',      x )
				.attr ( 'y',      y )
				.attr ( 'width',  self.expandBtnWidth )
				.attr ( 'height', self.expandBtnHeight )
				.attr ( 'class',  self.expandBtnClass )
				.call ( self.zoomListener );

			if ( d.rd.children.length === 0 ) {
				return; }
			
			self.appendExpandPath ( d, g );

			if ( d.isExpanded ) {
				return; }

			self.appendExpandPlus ( d, g );
		} );

	}	//	appendGraphNodeContents()

	removeText ( d ) {
		d3.select ( '#' + this.grfEleId + '-' + d.id )
			.selectAll ( 'text' )
				.remove();
	}	//	removeText()

//	textGroup ( selection, nLines ) {
//		let self = this;
//		selection
//			.attr ( 'id', ( d : any ) =>   self.grfEleId 
//										 + '-text-group-' + d.id )
//			.attr ( 'x',  d =>  3 )
//			.attr ( 'y',  d => (nLines * 12) )
//			.attr ( 'class', 'u34-graph-node-text' )
//			.attr ( 'style', 'font-family: verdana; font-size: 10px;' )
//			.attr ( 'fill', 'gray' )
//			.attr ( 'stroke-width', 0.02 )
//			.attr ( 'clip-path', ( d: any ) =>   'url(#' + self.grfEleId 
//											   + '-cp-' + d.id + ')' )
//			.text ( ( d : any ) => {
//				if ( ! cmn.isString ( d.rd.createdByGrpName ) ) {
//					return ''; }
//				return d.rd.createdByGrpName;
//			} )
//			.call ( this.zoomListener ); 
//	}	//	textGroup()
//
//	textUser ( selection, nLines ) {
//		let self = this;
//		selection
//			.attr ( 'id', ( d : any ) =>   self.grfEleId 
//										 + '-text-user-' + d.id )
//			.attr ( 'x',  d =>  3 )
//			.attr ( 'y',  d => (nLines * 12) )
//			.attr ( 'class', 'u34-graph-node-text' )
//			.attr ( 'style', 'font-family: verdana; font-size: 10px;' )
//			.attr ( 'fill', 'gray' )
//			.attr ( 'stroke-width', 0.02 )
//			.attr ( 'clip-path', ( d: any ) =>   'url(#' + self.grfEleId 
//											   + '-cp-' + d.id + ')' )
//			.text ( ( d : any ) => {
//				if ( ! cmn.isString ( d.rd.createdByUserName ) ) {
//					return ''; }
//				return d.rd.createdByUserName;
//			} )
//			.call ( this.zoomListener ); 
//	}	//	textUser()
//
//	textSystem ( selection, nLines ) {
//		let self = this;
//		selection
//			.attr ( 'id', ( d : any ) =>   self.grfEleId 
//										 + '-text-system-' + d.id )
//			.attr ( 'x',  d =>  3 )
//			.attr ( 'y',  d => (nLines * 12) )
//			.attr ( 'class', 'u34-graph-node-text' )
//			.attr ( 'style', 'font-family: verdana; font-size: 10px;' )
//			.attr ( 'fill', 'gray' )
//			.attr ( 'stroke-width', 0.02 )
//			.attr ( 'clip-path', ( d: any ) =>   'url(#' + self.grfEleId 
//											   + '-cp-' + d.id + ')' )
//			.text ( ( d : any ) => {
//				if ( ! cmn.isString ( d.rd.createdInSysName ) ) {
//					return ''; }
//				return d.rd.createdInSysName;
//			} )
//			.call ( this.zoomListener ); 
//	}	//	textSystem()
	textGUS ( selection, nLines, x, what, text ) {
		let self = this;
		selection
			.attr ( 'id', ( d : any ) =>   self.grfEleId 
										 + '-text-' + what + '-' + d.id )
			.attr ( 'x',  d =>  x )
			.attr ( 'y',  d => (nLines * 12) )
			.attr ( 'class', 'u34-graph-node-text' )
			.attr ( 'style', 'font-family: verdana; font-size: 10px;' )
			.attr ( 'fill', 'gray' )
			.attr ( 'stroke-width', 0.02 )
			.attr ( 'clip-path', ( d: any ) =>   'url(#' + self.grfEleId 
											   + '-cp-' + d.id + ')' )
			.text ( ( d : any ) => {
				if ( ! cmn.isString ( text ) ) {
					return ''; }
				return text;
			} )
			.call ( this.zoomListener ); 
	}	//	textGUS()

	textTypeName ( selection, nLines ) {
		let self = this;
		selection
			.attr ( 'id', ( d : any ) => self.grfEleId + '-text-' + d.id )
			.attr ( 'x',  d =>  3 )
			.attr ( 'y',  d => (nLines * 12) )
			.attr ( 'class', 'u34-graph-node-text' )
			.attr ( 'style', 'font-family: verdana; font-size: 10px;' )
			.attr ( 'clip-path', ( d : any ) =>   'url(#' + self.grfEleId 
												+ '-cp-' + d.id + ')' )
			.text ( ( d : any ) => d.rd.name )
		//	.style ( 'cursor', 'pointer' )
			.attr ( 'fill', ( d : any ) => {
				if ( d.rd.bFiltered ) {
					return 'gray'; }
				return 'black'; } )
			.style ( 'cursor', ( d : any ) => {
		//		if ( d.rd.bFiltered || (d.rd.name[0] === '^') ) {
		//		Possibly focusable.
				if (                   (d.rd.name[0] === '^') ) {
					return 'unset'; }
				return 'pointer'; } )
			.on ( 'click', self.textClick )
			.call ( this.zoomListener );
	}	//	textTypeName()

	fixGraphNodeContents ( d ) {
		let self = this;
		let g =	d3.select ( '#' + this.grfEleId + '-' + d.id );

		//	Remove all text.
		self.removeText ( d );

		//	Reinsert text.
		let eleExpandId = '#' + self.grfEleId + '-' + d.id + '-expand-rect';
		let nLines = 0;
		//	Group that created the type.
		if ( this.bShowGroup ) {
			nLines += 1;	
		//	g.insert ( 'text', eleExpandId )
		//		.call ( this.textGroup, nLines ); }
			g.insert ( 'text', eleExpandId )
				.call ( this.textGUS, nLines,  3,  'group-label', 'G:' ); 
			g.insert ( 'text', eleExpandId )
				.call ( this.textGUS, nLines,  3 + this.GUSLabelWidth,  
											   'group',
											   d.rd.createdByGrpName ); }
		//	User that created the type.
		if ( this.bShowUser ) {
			nLines += 1;	
		//	g.insert ( 'text', eleExpandId )
		//		.call ( this.textUser, nLines ); }
			g.insert ( 'text', eleExpandId )
				.call ( this.textGUS, nLines,  3,  'user-label', 'M:' ); 
			g.insert ( 'text', eleExpandId )
				.call ( this.textGUS, nLines,  3 + this.GUSLabelWidth,  
											   'user',
											   d.rd.createdByUserName ); }
		//	System the type was created in.
		if ( this.bShowSystem ) {
			nLines += 1;	
		//	g.insert ( 'text', eleExpandId )
		//		.call ( this.textSystem, nLines ); }
			g.insert ( 'text', eleExpandId )
				.call ( this.textGUS, nLines,  3,  'system-label', 'S:' ); 
			g.insert ( 'text', eleExpandId )
				.call ( this.textGUS, nLines,  3 + this.GUSLabelWidth,  
											   'system',
											   d.rd.createdInSysName ); }
		//	The type name.
		nLines += 1;
		g.insert ( 'text', eleExpandId )
			.call ( this.textTypeName, nLines );

		//	Fix the node rect.
		let ctl = self.maxTextLength ( d );
		d.w = Math.round ( ctl ) + self.nodeWidthExtention; 
		
		g.select ( '#' + self.grfEleId + '-' + d.id + '-rect' )
			.attr ( 'width',  ( d : any ) => d.w )
			.attr ( 'height', ( d : any ) => { 
				d.h = self.nodeH;
				return d.h; } ) 
	//		.style ( 'stroke', self.nodeBorderColor );
			.style ( 'stroke', ( d : any ) => d.rd.bFiltered
										? 'lightgray'
										: self.nodeBorderColor );


		//	And its clippath.
		let rpd     = self.grfD.rpd;
		let cpEleId = self.grfEleId + '-cp-' + d.id; 
		let cpD     = rpd.clipPathsData.find ( d => d.eleId === cpEleId );
		if ( cpD ) {
			cpD.w = d.w - 5;
			cpD.h = d.h - 5; }

		d3.select ( '#' + cpEleId ).select ( 'rect' )
			.attr ( 'width',  ( d : any ) => { return d.w; } )
			.attr ( 'height', ( d : any ) => { return d.h; } );


		//	The expand button.	
		let x =  d.w - self.expandBtnXOffs;
		let y = (d.h - self.expandBtnHeight) / 2;
		g.select ( eleExpandId )
			.attr ( 'x',      x )
			.attr ( 'y',      y );

		//	The path button.
		if ( d.rd.children.length === 0 ) {
			return; }
		
		x =  d.w - this.expandBtnXOffs;
		y = (d.h - this.expandBtnHeight) / 2;
		g.select ( '#' + self.grfEleId + '-expand-' + d.id )
			.attr ( 'transform', 'translate ( ' 
										+ (x + (self.expandBtnWidth / 2))
								 + ', ' + (y + (self.expandBtnHeight / 2))
								 + ' )' );

		if ( d.isExpanded ) {
			return; }

		x =  d.w - this.expandBtnXOffs;
		y = (d.h - this.expandBtnHeight) / 2;
		g.select ( 'line' )
			.attr ( 'x1', x + 1 )
			.attr ( 'y1', y + (self.expandBtnHeight / 2) )
			.attr ( 'x2', x + self.expandBtnWidth - 1 )
			.attr ( 'y2', y + (self.expandBtnHeight / 2) );
		g.select ( 'line + line' )
			.attr ( 'x1', x + (self.expandBtnWidth / 2) )
			.attr ( 'y1', y + 1 )
			.attr ( 'x2', x + (self.expandBtnWidth / 2) )
			.attr ( 'y2', y + self.expandBtnHeight - 1 );

	}	//	fixGraphNodeContents()
	
}	//	class uDsrcGraph 

export { uDsrcGraph as default }


