/*
         1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890

*/
import { cmn }			from '$lib/paneless/common';

interface	SystemTreeNode {
	node_depth:		number;
	type_id:		number;
	sys_id:			number;
	node_name:		string;
	parent_node_id:	number;
	node_id:		number;
};

let cmnTree = (function () {

	let self: any = {};

	self.prepTreeItems = function ( eByRecId ) {
		const sW = 'cmnTree prepTreeItems()';
		//	eByRecId is expected to be a collection of objects -
		//		{ name:		,
		//		  parentId:	,
		//		  data:		,			//	optional
		//		  childIds:	[], }		//	Empty!
		//	keyed by recId.
		//	->	childIds is empty coming in. It is filled here.
		//	See, for example, Viewport.getEntitiesForTree().
		//	Go through each of those and set children.
		let ek = Object.keys ( eByRecId );
		let roots = [];			//	no parent then a "root" object
		ek.forEach ( ( recId: any ) => {
			recId = parseInt ( recId );
			let e = eByRecId[recId];
			if ( e.parentId ) {
				let p = eByRecId[e.parentId];
				if ( ! p ) {
					cmn.error ( sW, 'parent not found' ); 
					return; }
				p.childIds.push ( recId ); }
			else {
				roots.push ( recId ); } } );
	
		//	Prepare tree items.  Roots first, then children recursively.
		let items: any[] = [];
		function addItem ( recId ) {
			let e = eByRecId[recId];
			items.push ( { parentTextId:	e.parentId,
						   newTextId:		recId, 
						   newText:			e.name,
						   data:			cmn.isObject ( e.data ) ? e.data 
						   											: null,
						   expandParent:	false } );
			e.childIds.forEach ( recId => addItem ( recId ) ); }
		roots.forEach ( recId => addItem ( recId ) );
		return items;
	};	//	prepTreeItems()

	self.prepTreeRoots = function ( sW, aIn ) {
		let roots = [];			//	no parent then a "root" object
		aIn.forEach ( o => {
			if ( o.parentId ) {
				let p = aIn.find ( o2 => o2.id === o.parentId );
				if ( ! p ) {
					cmn.error ( sW, 'parent not found' ); 
					return; }
				p.childIds.push ( o.id ); }
			else {
				roots.push ( o.id ); } } );
		return roots;
	};	//	prepTreeRoots()

	self.prepTreeItems2 = function ( aIn ) {
		const sW = 'cmnTree prepTreeItems2()';
		//	aIn is expected to be an array of objects -
		//		{ id:		,
		//		  name:		,
		//		  parentId:	,
		//		  childIds:	[], }		//	Empty!
		//	->	childIds is empty coming in. It is filled here.
		//	See, for example, HelpTOC.loaded().
		//	Go through each of those and set children.
	//	let roots = [];			//	no parent then a "root" object
	//	aIn.forEach ( o => {
	//		if ( o.parentId ) {
	//			let p = aIn.find ( o2 => o2.id === o.parentId );
	//			if ( ! p ) {
	//				cmn.error ( sW, 'parent not found' ); 
	//				return; }
	//			p.childIds.push ( o.id ); }
	//		else {
	//			roots.push ( o.id ); } } );
		let roots = this.prepTreeRoots ( sW, aIn );
	
		//	Prepare tree items.  Roots first, then children recursively.
		let items = [];
		function addItem ( id ) {
			let o = aIn.find ( o => o.id === id );
			items.push ( { parentTextId:	o.parentId,
						   newTextId:		id, 
						   newText:			o.name,
						   expandParent:	false } );
			o.childIds.forEach ( id => addItem ( id ) ); }
		roots.forEach ( id => addItem ( id ) );
		return items;
	};	//	prepTreeItems2()
	
	self.prepTreeItems3 = function ( aIn ) {
		const sW = 'cmnTree prepTreeItems3()';
		//	Like prepTreeItems2() but items may have these members -
		//		selectable,
		//		data,
		//		execute
		let roots = this.prepTreeRoots ( sW, aIn );
		let self  = this;

		//	Prepare tree items.  Roots first, then children recursively.
		let items = [];
		function addItem ( id ) {
			let o = aIn.find ( o => o.id === id );
			let item = { parentTextId:	cmn.isInteger ( o.parentId )
												  ? o.parentId : 0,
						 newTextId:		id, 
						 newText:		o.name,
						 xcells:		o.xcells  ? o.xcells  : null,
						 expandParent:	false,
						 selectable:	cmn.isBoolean ( o.selectable )
												  ? o.selectable : null,
						 data:			o.data    ? o.data    : null,
						 execute:		o.execute ? o.execute : null };
			items.push ( item );
			o.childIds.forEach ( id => addItem ( id ) ); }
		roots.forEach ( id => addItem ( id ) );
		return items;
	};	//	prepTreeItems3()

	self.showSelected = function ( treeD, itemParentId, itemId ) {
		const sW = 'cmnTree showSelected()';
		function expandParent ( pId ) {
			if ( ! pId ) {
				return true; }
			let itemD = treeD.findItem ( pId );
			if ( ! itemD ) {
				cmn.error ( sW, 'parent not found' );
				return false; }
			if ( itemD.parent ) {
				if ( ! expandParent ( itemD.parent.textId ) ) {
					return false; } }
			treeD.expandItem ( pId ); 
			treeD.update();
			return true;
		}	//	expandParent()

		if ( ! expandParent ( itemParentId ) ) {
			return false; }
		treeD.selectItem ( itemId ); 
		return true;
	}	//	showSelected()


	self.systemTree = function ( shareRows ) : SystemTreeNode[] {
		const sW = 'cmnTree systemTree()';
		//	Each row is a node in the tree. See Share system_tree()
		//	for the columns of the table of rows it returns.
		let a: SystemTreeNode[] = [];
		shareRows.forEach ( r => {
			let s = r.system_tree;
			if ( s.startsWith ( '(' ) ) {
				s = s.slice ( 1 ); }
			if ( s.endsWith ( ')' ) ) {
				s = s.slice ( 0, -1 ); }

			let b = s.split ( ',' );

		//	let name = b[3];
		//	if ( name.startsWith ( '"""' ) ) {
		//		name = name.slice ( 3 ); }
		//	if ( name.endsWith ( '"""' ) ) {
		//		name = name.slice ( 0, -3 ); }
		//	if ( name.startsWith ( '"' ) ) {
		//		name = name.slice ( 1 ); }
		//	if ( name.endsWith ( '"' ) ) {
		//		name = name.slice ( 0, -1 ); }

			a.push ( { 
				node_depth:		parseInt ( b[0] ),
				type_id:		parseInt ( b[1] ),
				sys_id:			parseInt ( b[2] ),
			//	node_name:		name,
				node_name:		cmn.unquote ( b[3] ),
				parent_node_id:	parseInt ( b[4] ),
				node_id:		parseInt ( b[5] ) } );
		} );
		return a;
	}	//	systemTree()

	self.prepSystemTreeNodes = function ( nodes: SystemTreeNode[] ) {
		//	Use cmnTree.prepTreeItems3(). It takes an array of items 
		//	where each item is like -
		//		{ id:		,
		//		  name:		,
		//		  parentId:	,
		//		  childIds:	[], }		//	Empty!

		let a = [];
		nodes.forEach ( ( node: SystemTreeNode ) => {
			a.push ( { id:			node.node_id,
					   name:		node.node_name,
					   parentId:	node.parent_node_id,
					   childIds:	[],
					   selectable:	node.sys_id > 0,
					   data:		node,
					   execute:		null } ); } );

		return self.prepTreeItems3 ( a );
	}	//	prepSystemTreeNodes()


	return self;
})();

export { cmnTree, type SystemTreeNode };
