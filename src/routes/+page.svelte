<script lang="ts">
	import { tick }				from 'svelte';
	import { cmn }				from '$lib/paneless/common.ts';
	import AppFrame				from '$lib/paneless/app-frame.svelte';
	import { getFrameId }		from '$lib/paneless/frame-id.ts';
	import { getPaneId }		from '$lib/paneless/pane-id.ts';
	import ContentExample1		from './content-example-1.svelte';
	   
    import type { Item as HdrItem}	from '$lib/paneless/interfaces.ts';
	
    let HdrItems: HdrItem[] = [
		{ name: 		'',
		  selection:	'',
		  onClick:		null },
		{ name: 		'',
		  selection:	'',
		  onClick:		null },
		{ name: 		'',
		  selection:	'',
		  onClick:		null },
    ];

/*	Index Signatures
	Keyed objects
https://stackoverflow.com/questions/39256682/how-to-define-an-interface-for-objects-with-dynamic-keys
https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures

In devdocs -
	TypeScript			4.5.2
		Object Types
https://devdocs.io/typescript/2/objects (look for Index Signitures)
*/
interface FrameContent {
	type:			string;
	central:		any;
	frameFnc:		( any );
}

interface Frames {
	[key: string|number]:		FrameContent;
}

interface PaneContent {
	frameId:		number;
	ccEleId:		string;
	paneContentFnc:	( any );
	paneFnc:		( any );
	initialized:	boolean;
	install:		any;
	contentFnc:		( any );
	state:			null | PaneState;
	typeName:		null | string;
}

interface Panes {
	[key: string|number]:		PaneContent;
}

interface FrameState {
	frameType:		string;
	frameId:		number;
	paneId:			number;
	hdrVisible:		boolean;
	ftrVisible:		boolean;
	frameName:		string;
	style:			any;
}

interface PaneState {
	typeName:		string;
	paneName:		string;
	ccState:		any;
}	

let	lastCCId = 0;

class ClassPanelessDemo {

	frames:				Frames;
	content: 			Panes;

	appFrameFnc:		any;
	appContentFnc:		any;
	appContentEleId:	string;
	
	helpFrameId:		number;
	
	appDialogFnc:		any;

	constructor() {

		this.frames 			= {};
		this.content			= {};

		this.appFrameFnc		= null;
		this.appContentFnc		= null;
		this.appContentEleId	= '';
	
		this.helpFrameId		= 0;

		this.appDialogFnc		= null;
	
		this.initCentral		= this.initCentral.bind ( this );
		this.frameSubmenu		= this.frameSubmenu.bind ( this );
		this.newFrame			= this.newFrame.bind ( this );
		this.addFrame			= this.addFrame.bind ( this );
		this.destroyFrame		= this.destroyFrame.bind ( this );
		this.definePaneContent	= this.definePaneContent.bind ( this );
		this.deletePanesContent	= this.deletePanesContent.bind ( this );
		this.frameDestroyed		= this.frameDestroyed.bind ( this );
		this.clearLayout		= this.clearLayout.bind ( this );
		this.showAppTitleMenu 	= this.showAppTitleMenu.bind ( this );
		this.clickAppTitle		= this.clickAppTitle.bind ( this );
		this.loadExample1		= this.loadExample1.bind ( this );
		this.loadFrameRecord	= this.loadFrameRecord.bind ( this );
		this.fixIds				= this.fixIds.bind ( this );
		this.restoreFrame		= this.restoreFrame.bind ( this );
		this.defineInstall		= this.defineInstall.bind ( this );
		this.setCallDown		= this.setCallDown.bind ( this );
		this.doAll				= this.doAll.bind ( this );
	}

	initCentral ( o ) {	
		const sW = 'App initCentral()';

		if ( o.frameType === 'Example' ) {
			return Promise.resolve ( null ); }

		if ( o.frameType === 'Viewport' ) {
			return Promise.resolve ( null ); }

		if ( o.frameType === 'TBD' ) {
			return Promise.resolve ( null ); }

		return Promise.reject ( 'Unrecognized type: ' + o.frameType ); 

	}	//	initCentral()

	frameSubmenu ( item ) {
		const sW = 'App frameSubmenu()';
		cmn.log ( sW, item.text );

		let mnu: any [] = [];
		mnu.push ( { type: 'item', disabled: false,
					 text: 'New', 		fnc: this.newFrame } );
		mnu.push ( { type: 'item', disabled: false,
					 text: 'Example 1',	fnc: this.loadExample1 } );
		return mnu;
	}	//	frameSubMenu()
	
	newFrame() {
		const sW = 'App newFrame()';
		cmn.log ( sW );
		this.addFrame ( { type: 'TBD' } );
	}	//	newFrame()
	
	addFrame ( o ) {
		const sW = 'App addFrame()';
		//	New frame. The frame initially has one pane for its entire
		//	content.
		let ids = 	  (o && o.frameId && o.paneId) 
					? { frameId: 	o.frameId,
						paneId:		o.paneId }
					: this.appContentFnc ( { do: 'get-new-frame-id' } );

		let type		= o && o.type ? o.type : null;
		let remoteURL	= o && o.remoteURL ? o.remoteURL : null;
		let pms = this.initCentral ( { frameType: 	type, 
									   frameId:		ids.frameId, 
									   paneId:		ids.paneId, 
									   remoteURL:	remoteURL } );
		pms.then ( ( central ) => {

			this.frames[ids.frameId] = { type: 		type,
										 frameFnc:	null,
										 central:	central };

			this.definePaneContent ( { frameId: ids.frameId,
									   paneId:	ids.paneId, }, 0, false );

			//	We don't define the install of the pane's content here.

			this.appContentFnc ( {
				do:				'add-frame',
				hdrVisible:		(o && o.hdrVisible) ? o.hdrVisible : true,
				ftrVisible:		(o && o.ftrVisible) ? o.ftrVisible : true,
				frameType:		type,
				frameName:		(o && o.frameName) ? o.frameName : null,
				frameId:		ids.frameId,
				central:		central,
				paneId:			ids.paneId,
				style:	{
					left:			(o && o.left)   	? o.left   	: '40px',
					top:			(o && o.top)    	? o.top    	: '20px',
					width:			(o && o.width)  	? o.width  	: '300px',
					height:			(o && o.height) 	? o.height 	: '200px' },
				iconized:		(o && o.iconized)	? o.iconized	: null,
			} );
		} );

		return ids;

	}	//	addFrame()
	
	destroyFrame ( frameId ) {
		const sW = 'App destroyFrame()  frameId: ' + frameId;
		cmn.log ( sW );

		//	Showing a mobile dialog?
		if ( this.appDialogFnc ) {
			//	Assume this might be something like a Help frame ...
			if ( this.appDialogFnc ( {  do:			'destroy-frame',
									    frameId:	frameId } ) ) {
				this.deletePanesContent ( frameId );
				return; } 
			let otherFrameId = 
				this.appDialogFnc ( { do: 'get-other-frame-id' } );
			if ( otherFrameId > 0 ) {
				this.deletePanesContent ( otherFrameId ); }	}
		
		//	Regular frame, or the mobile dialog frame itself.
		this.appContentFnc ( { do:		'destroy-frame',
							   frameId:	frameId } );

	}	//	destroyFrame()

	definePaneContent ( o, paneId:		null | number, 
						   initialized:	null | boolean )
					: null | PaneContent {
		if ( ! paneId ) {
			paneId = <number>o.paneId; }
		const sW = 'App definePaneContent()  paneId ' + paneId;
		if ( this.content[paneId] ) {
			cmn.error ( sW, 'content is already defined' );
			return null; }
		let ccEleId = 'rr-cc-' + ++lastCCId;
		this.content[paneId] = { 
			frameId:		o.frameId,
			ccEleId:		ccEleId,
			paneContentFnc:	o.paneContentFnc ? o.paneContentFnc : null,
			paneFnc:		null,
			initialized:	typeof initialized === 'boolean' 
												?  initialized 
												: false,
			install:		null,
			contentFnc:		null,
			state:			null,
			typeName:		null };
		return this.content[paneId];

	}	//	definePaneContent()

	deletePanesContent ( frameId ) {
		let pa: number[] = [];
		for ( let paneId in this.content ) {
			let c = this.content[paneId];
			if ( c.frameId === frameId ) {
				pa.push ( parseInt ( paneId ) ); } }
		let self = this;
		pa.forEach ( paneId => delete self.content[paneId] );
	}	//	deletePanesContent()

	frameDestroyed ( o ) {
		const sW = 'App frameDestroyed()  frameId: ' + o.frameId;
		cmn.log ( sW );

		let frm = this.frames[o.frameId];
		if ( frm ) {
			if ( frm.central ) {
				frm.central.terminate(); }
		}

		this.deletePanesContent ( o.frameId );

		delete this.frames[o.frameId];

		if ( o.frameId === this.helpFrameId ) {
			this.helpFrameId = 0; }

	}	//	frameDestroyed();

	clearLayout() {
		const sW = 'App clearLayout()';
		cmn.log ( sW );
		this.appContentFnc ( { do: 'clear' } );
		
		//	Let frames unmount, unregister, etc..
		let self = this;
		tick().then ( () => {
			self.frames = {};
			self.content = {};
		} );
	}	//	clearLayout()

	showAppTitleMenu() {
		const sW = 'App showAppTitleMenu()';

		let ce = <HTMLElement>document.getElementById ( this.appContentEleId );
		let r  = ce.getBoundingClientRect();

		let items = [

			{ type: 'item',	disabled: false,
		 	  text:	'[F]rame >',			fnc: this.frameSubmenu,
			  bSubmenu:	true },

			{ type: 'separator', 	text: '' },

			{ type: 'item',	disabled: false,
			  text: '[C]lear Layout',		fnc: this.clearLayout,
			  opts: { bPutSystem: true } },
		];


		this.appFrameFnc ( { 
			do: 		'show-menu',
			menuEleId:	'app-title-menu',
			menuX:		r.x + 10,
			menuY:		r.y + 10,
			upFnc:		this.doAll,
			menuItems:	items,
			ctx:		{ clientRect:	r,
						  what:			'app title',
						  after:		'menu-item' }
		} );
		
	}	//	showAppTitleMenu()

	clickAppTitle() {
		const sW = 'App clickAppTitle()';
		cmn.log ( sW );
		this.showAppTitleMenu();
	}

	loadExample1() {
		const sW = 'App loadExample1()';

		//	Fake a record and use loadFrameRecord().

		let record = {
			data: {
				frameType:	'Example',
				frameId:	0,				//	fixIds() will set these.
				paneId:		0,				//
				frameName:	'Content Example 1',
				style:		{ 
					left:	 '40px',
					top:	 '20px',
					width:	'300px',
					height:	'250px' },
				hdrVisible:	true,
				ftrVisible:	true,
				iconized:	null,
				content:	null,
				paneState:	{
					typeName:	'ContentExample1',
					ccState:	null,
				},
			},
		};

		this.loadFrameRecord ( record );

	}	//	loadExample1()

	loadFrameRecord ( record: any, asDialog?: string, dlgArgs?: any ) {
		const sW = 'App loadFrameRecord()';
		cmn.log ( sW );

		let state = record.data;
		
		this.fixIds ( state, 'state', 0 ); 

		let pms = this.restoreFrame ( state, state.paneState ); 

		return new Promise ( ( res, rej ) => {
			pms.then ( frameId => {
				res ( frameId );
			} ).catch ( err => {
				cmn.error ( sW, err.message );
				rej ( err );
			} );
		} );
	}	//	loadFrameRecord()

	fixIds ( o, name, depth ) {
		const sW = 'App fixIds()';
		let self = this;
		//	Fix frame and pane ids.
		//	Such ids must be unique in each  * layout *.  This function
		//	loadFrameByRecordId(), loads a frame (and its panes) separate 
		//	from the layout. So, ids must be fixed. Also note -
		//		-	the start of the app or loading a layout initializes 
		//			the last frame and pane ids.
		//		-	when loading a layout frames such as are loaded 
		//			separate from the current layout are closed.
		for ( let k in o ) {
			if ( k === 'paneId' ) {
				cmn.log ( sW, ' fixIds(): ' 
							+ ' '.repeat ( depth * 2 )
							+ name + ' - new pane id' );
				o[k] = getPaneId(); 
				continue; }
			if ( k === 'frameId' ) {
				cmn.log ( sW, ' fixIds(): ' 
							+ ' '.repeat ( depth * 2 )
							+ name + ' - new frame id' );
				o[k] = getFrameId(); 
				continue; }
			let v = o[k];
			if ( cmn.isObject ( v ) ) {
				self.fixIds ( v, k, depth + 1 ); } }
	}	//	fixIds()

	restoreFrame ( frm: FrameState, ps: PaneState ) 
				: Promise<any> {
		const sW = 'App restoreFrame()';
		cmn.log ( sW );
		let self = this;
		return new Promise ( ( res, rej ) => {
			self.initCentral ( frm ).then ( central => {

				self.frames[frm.frameId] = { type:		frm.frameType,
											 frameFnc:	null,
											 central:	central };

				let c = self.definePaneContent ( frm, 0, false );
				if ( ! c ) {
					rej ( { message: 'no pane content' } );
					return; }

				let tn = ps.typeName;
				let dn = 	ps.ccState 
						 && ps.ccState.dataName 
						  ? ps.ccState.dataName : '';
				if ( tn ) {
					c.install = this.defineInstall ( tn, dn, frm.frameId, 
															 frm.paneId, 
													 c.ccEleId ); }
				c.state = ps;

				//	pane having splits - later - see restoreFrames()

				this.appContentFnc ( {
					do:				'add-frame',
					hdrVisible:		frm.hdrVisible,
					ftrVisible:		frm.ftrVisible,
					frameType:		frm.frameType,
					frameName:		frm.frameName,
					frameId:		frm.frameId,
					central:		central,
					paneId:			frm.paneId,
					style:			frm.style,
					iconized:		null,
				} );

				res ( frm.frameId );
			} );
		} );
	}	//	restoreFrame()
	
	defineInstall ( typeName: null | string, 
					dataName: string, 
					frameId: number, 
					paneId: number, 
					ccEleId: string, 
					initialTabText?: null | string,
					state?: any ) {
		const sW = 'App defineInstall()  frameId ' + frameId
									+ '  paneId ' + paneId;
		if ( ! typeName ) {
			typeName = 'ContentExample1'; }
		if ( ! initialTabText ) {
			initialTabText = null; }
		if ( ! state ) {
			state = null; }
		let install = {
			parentStyle:	{ 
				position:		'relative',
				'overflow-y':	'hidden' },
			contentTypeName:	typeName,
			contentDataName:	dataName,
			content:			{
				comp:	<any>null, 
				props:	<any>null },
			initialTabText:		initialTabText };

		if ( typeName === 'ContentExample1' ) {
			install.content = {
				comp:		ContentExample1,
				props:	{
					prpFrameId:			frameId,
					prpPaneId:			paneId,
					prpEleId:			ccEleId,
					prpClientAppFnc: 	this.doAll,
					prpAppFrameFnc: 	this.appFrameFnc,
					prpAppContentFnc:	this.appContentFnc } }; }	

		if ( ! install.content.comp ) {
			cmn.error ( sW, 'unrecognized typeName \"' + typeName + '\"' ); 
			return null; }
		return install;
	}	//	defineInstall()

	setCallDown ( o ) {
		let sW = 'App setCallDown() ' + o.to;
		cmn.log ( sW );

		if ( o.to === 'hdr-item-' ) {
			return; }
		if ( o.to === 'app-header-sign-in' ) {
		
			return; }
		if ( o.to === 'app-frame' ) {
			this.appFrameFnc = o.fnc;
			return; }
		if ( o.to === 'app-content' ) {
			this.appContentFnc	 = o.fnc;
			this.appContentEleId = o.eleId;
			return;
		}
		if ( o.to === 'pane-content' ) {
			//	A pane has just been mounted. 
			//	Getting the pane's content function and install client specific 
			//	content (if it has been defined).
			let content = this.content[o.paneId];
			if ( ! content ) {
				cmn.error ( sW, ' set-call-down to pane-content'
							  + ' ERROR(?): unrecognized paneId'
							  + ' (' + o.paneId + ')' );
				return; }
			content.paneFnc 		= o.paneFnc;
			content.paneContentFnc	= o.contentFnc;
			if ( content.install ) {			//	Client content defined?
				content.paneContentFnc ( Object.assign ( 
					{ do: 'install-client-content' }, content.install ) );
				return; }

			//	Auto-create a frame.

			return;
		}
		if ( o.to === 'client-content' ) {
			let content = this.content[o.paneId];
			if ( ! content ) {
				cmn.error ( sW, ' set-call-down to client-content'
							  + ' ERROR: unrecognized paneId' 
							  + ' (' + o.paneId + ')' );
				return; }
			content.contentFnc = o.fnc;

			if ( ! content.initialized ) {
				content.contentFnc ( { do: 'init-new' } );
				content.initialized = true;
			} 	//	I think that is unnecessary.  Currently there are no comps 
				//	that process 'init-new' (in this app).
				//	However, ContentExample1 ...
			
			return;
		}
		if ( o.to === 'frame' ) {
		//	cmn.log ( sW, "frameId " + o.frameId );
			let f = this.frames[o.frameId];
			if ( ! f ) {
				f = this.frames[o.frameId] = { type:		'',
											   central:		null,
											   frameFnc:	null }; }
			f.frameFnc = o.frameFnc;
			let c = this.content[o.paneId];
			if ( c.state ) {
				f.frameFnc ( { do: 'set-state' } ); }
			return; }
		cmn.error ( sW, 'unrecognized to - ' + o.to );
	}	//	setCallDown()

	doAll ( o: any ) {
		let sW = 'App doAll() ' + o.do;
		if ( o.to ) {
			sW += ' to ' + o.to; }
		cmn.log ( sW );
		switch ( o.do ) {
			case 'set-call-down':
				this.setCallDown ( o );
				break;
			case 'destroy-frame':
				return this.destroyFrame ( o.frameId );
			case 'frame-destroyed':
				return this.frameDestroyed ( o );
		}	//	switch

	}	//	doAll()
}	//	class	ClassPanelessDemo

	let self = new ClassPanelessDemo();

</script>


<svelte:head>
	<title>paneless demo</title>
	<meta name="description" content="This demostrates paneless - a window manager for web apps." />
</svelte:head>


<AppFrame 
	appTitle            = '<App Name>'
	items				= { HdrItems }
	profound1	        = '<something profound>'
	profound2	        = ''
	clientFnc           = { self.doAll }
	onClickTitle        = { self.clickAppTitle }
/>
