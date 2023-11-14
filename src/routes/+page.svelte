<script lang="ts">
	import { tick }				from 'svelte';
	import clone 				from 'clone';
	import { cmn }				from '$lib/paneless/common.ts';
	import AppFrame				from '$lib/paneless/app-frame.svelte';
	import { getFrameId }		from '$lib/paneless/frame-id.ts';
	import { getPaneId }		from '$lib/paneless/pane-id.ts';
	import { db }				from './db';
	import type { Data }		from './db';
	import UDUI					from '$lib/paneless/udui/udui.svelte';
	import Properties 			from '$lib/paneless/udui/properties.svelte';
	import ContentExample1		from './content-example-1.svelte';
	import DlgNameRecord		from './dlg-name-record.svelte';
	import DlgLongText			from './dlg-long-text.svelte';
	import DlgMessageBox		from './dlg-message-box';
	import DlgSelectRobotSystem3
								from './panel-code/dlg-select-robot-system-3';
	import ProgressBox 			from './panel-code/progress-box';
	   
    import type { Item as HdrItem}	from '$lib/paneless/interfaces.ts';
	
    let HdrItems: HdrItem[] = [
		{ name: 		'',
		  selection:	'',
		  enabled:		true,
		  onClick:		null },
		{ name: 		'',
		  selection:	'',
		  enabled:		true,
		  onClick:		null },
		{ name: 		'',
		  selection:	'',
		  enabled:		true,
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
	registry:			object;

	appFrameFnc:		any;
	appContentFnc:		any;
	appContentEleId:	string;
	
	helpFrameId:		number;
	
//	stateMenuOrDialogDepth:	number;
	appDialogFnc:		any;
	
	fncProgress:		any;
	progressCount:		number;

	constructor() {

		this.frames 			= {};
		this.content			= {};
		this.registry			= {};

		this.appFrameFnc		= null;
		this.appContentFnc		= null;
		this.appContentEleId	= '';
	
		this.helpFrameId		= 0;

//		this.stateMenuOrDialogDepth = 0;
		this.appDialogFnc		= null;
		
		this.fncProgress 		= null;
		this.progressCount 		= 0;
	
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
		this.menuItem			= this.menuItem.bind ( this );
		this.instantiateCode	= this.instantiateCode.bind ( this );
		this.loadRecordDialog	= this.loadRecordDialog.bind ( this );
		this.okRecordName		= this.okRecordName.bind ( this );
		this.longTextDialog		= this.longTextDialog.bind ( this );
		this.make_id			= this.make_id.bind ( this );
		this.make_ids			= this.make_ids.bind ( this );
		this.setRegisteredCallee			
								= this.setRegisteredCallee.bind ( this );
		this.unsetRegisteredCallee			
								= this.unsetRegisteredCallee.bind ( this );
		this.register			= this.register.bind ( this );
		this.unregister			= this.unregister.bind ( this );
		this.showMenu			= this.showMenu.bind ( this );
		this.splitterProperties	= this.splitterProperties.bind ( this );
		this.fixPaneId			= this.fixPaneId.bind ( this );
		this.debug_restoreFrameAsDialog2 
								= this.debug_restoreFrameAsDialog2.bind ( this );
		this.logProgress		= this.logProgress.bind ( this );
		this.progressBox 		= this.progressBox.bind ( this );
		this.restorePaneContent	= this.restorePaneContent.bind ( this );
		this.loadPaneState		= this.loadPaneState.bind ( this );
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
		mnu.push ( { type:	 'item', disabled: false,
					 text:	 'New', 		fnc: this.newFrame,
					 testId: 'paneless-app-menu-Frame-New' } );
		mnu.push ( { type:	 'item', disabled: false,
					 text:	 'Example 1',	fnc: this.loadExample1 } );
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
			  bSubmenu:	true,
			  testId:	'paneless-app-menu-Frame' },

			{ type: 'separator', 	text: '' },

			{ type: 'item',	disabled: false,
			  text: '[C]lear Layout',		fnc: this.clearLayout,
			  opts: { bPutSystem: true } },

			{ type: 'separator', 	text: '' },

			{ type: 'item',	disabled: false,
			  text: 'progressBox()',		
	  								fnc: this.progressBox },
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
		if ( typeName === 'UDUI' ) {
			install.content = {
				comp:		UDUI,
				props:	{
					prpFrameId:			frameId,
					prpPaneId:			paneId,
					prpEleId:			ccEleId,
					prpClientAppFnc: 	this.doAll,
					prpAppFrameFnc: 	this.appFrameFnc,
				//	prpAppContentFnc:	this.appContentFnc,
					prpCommand:			false,
					prpState:			state } };
		}
		if ( typeName === 'Properties' ) {
			install.content = {
				comp:		Properties,
				props: 	{
					prpFrameId:			frameId,
					prpPaneId:			paneId,
					prpClientAppFnc:	this.doAll,
					prpAppFrameFnc:		this.appFrameFnc,
					prpAppContentFnc:	this.appContentFnc } };
		}

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

	menuItem ( o: any ) {
		let sW = 'App menuItem() ' + o.menuItemText;
		cmn.log ( sW );
		if ( ! o.paneId ) {
			cmn.error ( sW, 'No paneId. Frame menu item?')
			return; }

		//	Install (uninitialized) client content in a vacant pane.
		//
		let content: null | PaneContent = this.content[o.paneId];
		if ( ! content ) {
			content = this.definePaneContent ( o, 0, false ); }

		let self							= this;
		let compName: null | string			= null;
		let dataName						= '';
		let initialTabText: null | string	= null;

		function loadPane ( state?: null | any ) {
			if ( ! content ) {
				cmn.error ( sW, 'Pane content is null.' );
				return; }
			content.install = self.defineInstall ( compName, dataName,
															 o.frameId, 
															 o.paneId, 
															 content.ccEleId,
															 initialTabText,
															 state );
			content.paneContentFnc ( Object.assign ( 
				{ do: 'install-client-content' }, content.install ) );
		}	//	loadPane()

		switch ( o.menuItemText ) {
			case 'Controls':
				compName		= 'UDUI';
				initialTabText	= 'controls'
				break;
			case 'Properties':
				compName		= 'Properties';
				initialTabText	= 'properties'
				break;
			default:
				cmn.error ( sW, 'Unrecognized menu item - ' 
								+ o.menuItemText );
				return;
		}

		loadPane ( null );

	}	//	menuItem()

	instantiateCode ( o ) {
		const sW = 'App instantiateCode() ' + o.codeName;
		cmn.log ( sW );
		let code: any = null, title: any = null;
		switch ( o.codeName ) {
			case 'DlgMessageBox':
				code = new DlgMessageBox ( { 
					clientAppFnc:	this.doAll,
					frameId:		o.prpFrameId,
					uduiFnc:		o.uduiFnc,
					rpd: 			o.rpd,
					args:		o.state.dlgArgs ? o.state.dlgArgs 
												: null } ); 
				break;
			case 'DlgSelectRobotSystem3':
				code = new DlgSelectRobotSystem3 ( { 
					clientAppFnc:	this.doAll,
					appFrameFnc:	this.appFrameFnc,
					uduiFnc:		o.uduiFnc,
					frameId:		o.prpFrameId,
					rpd: 			o.rpd,
					args:		o.state.dlgArgs ? o.state.dlgArgs 
												: null } ); 
				break;

			case 'ProgressBox':
				code = new ProgressBox ( { 
					clientAppFnc:	this.doAll,
					uduiFnc:		o.uduiFnc,
					frameId:		o.frameId,
					rpd: 			o.rpd,
					args:		o.state.dlgArgs ? o.state.dlgArgs 
												: null } ); 
				break;
			default:
				cmn.error ( sW, 'unrecognized code name - "' 
								+ o.codeName + '"' ); }
		return { code:	code,
				 title:	title };

	}	//	instantiateCode()

	loadRecordDialog ( o ) {
		const sW = 'App loadRecordDialog()';
		cmn.log ( sW );

		//  Modal dialog to list existing layouts by name - and to select a
		//  layout.
		//	DlgNameRecord will call self.doAll() with 'ok-load' (wich calls
		//	this.okRecordName()) and the specified ctx on ok - loadRecord2() 
		//	will handle it.
		this.appFrameFnc ( { do: 		'app-dialog',
							 dlgComp: 	{
								 comp:	DlgNameRecord,
								 props:	{ prpAppFrameFnc: 	this.appFrameFnc,
										  prpTitle: 		o.title,
										  prpRecType:		o.recordType,
								//		  prpTypeId:		o.typeId,
										  prpCtx: {
											   fnc:			this.doAll,
											   recType:		o.recordType,
											   typeId:		o.typeId,
											   chgType:		o.chgType,
											   after:		'load',
											   afterCB:		o.afterCB
										 } },
							 screenClass:	null,
							} } );
	}	//	loadRecordDialog()
	
	okRecordName ( o ) {
		const sW = 'App okRecordName()';

		//	Use a simple IndexedDB store.
		if ( ! db ) {
			cmn.error ( sW, 'db is null' );
			return; }

		function addRecord ( data ) {
			if ( ! db ) {
				cmn.error ( sW, 'db is null' );
				return; }
			let d: Data = { id: 	o.recId,
							type:	o.recType,
							name:	o.recName,
							data:	data };
			db.addData ( d );
		}	//	addRecord()

		function updateRecord ( data ) {
			if ( ! db ) {
				cmn.error ( sW, 'db is null' );
				return; }
			let d: Data = { id: 	o.recId,
							type:	o.recType,
							name:	o.recName,
							data:	data };
			db.updateData ( d );
		}	//	updateRecord()

		if ( o.ctx.after === 'save' ) {
			if ( 	(typeof o.recId !== 'number') 
				 || (typeof o.recName  !== 'string') ) {
				return; }
			if ( o.recName === '' ) {
				return; }
			if ( typeof o.ctx.afterCB !== 'function' ) {
				return; }
			let data = o.ctx.afterCB();

			try {
				if ( o.recId <= 0 ) {
					addRecord ( data ); }
				else {
					db.loadData ( o.recId ).then ( ( r: any ) => {
						if ( o.recName === r.name ) {
							updateRecord ( data ); }
						else {
							addRecord ( data ); }
					} ); }
			}
			catch ( e: any ) {
				cmn.error ( sW, e.message ); }
			return; }

		if ( o.ctx.after === 'load' ) {
			if ( (typeof o.recId !== 'number') || (o.recId <= 0) ) {
				return; }
			if ( typeof o.ctx.afterCB === 'function' ) {
				db.loadData ( o.recId ).then ( ( r: any ) => {
					o.ctx.afterCB ( r.data ); } ); 
			} }
	}	//	okRecordName()

	longTextDialog ( o ) {
		this.appFrameFnc ( { do: 		'app-dialog',
							 dlgComp:	{
								comp: 	DlgLongText,
								props:	{ prpEleId:			'rr-longTextDialog',
										  prpAppFrameFnc:	this.appFrameFnc,
										  prpOnOK:			o.onOK,
										  prpTitle:			o.title,
										  prpText:			o.text },

							 } } );
	}	//	longTextDialog()

	make_id ( o, frame, pane ) {
		if ( cmn.isString ( frame ) ) {
			return { frame: frame, pane: pane }; } 
		return { frameId: o.frameId, pane: pane };
	}	//	make_id()

	make_ids ( o, frame, pane ) {
		let id = this.make_id ( o, frame, pane );
		return JSON.stringify ( id );
	}	//	make_ids()

	setRegisteredCallee ( o, reg, e, callerFnc, paneKind, regSpec, calleeFnc ) {
		//	o		What is passed to register() or unregister().
		//	reg		The already registered entry being considered
		//	e		The sndTo or rcvFm item of what is already registered.
		//	e may be, for example -
		//		udui: { pane: <pane>, frame: <frame> }
		//	or
		//		udui: { '<pki>': { pane: <pane>, frame: <frame> },
		//				..., }
		//	The second case is where there are multiple instances of a 
		//	paneKind.
		//
		//	callerFnc	Calling function, or sender.
		//	paneKind
		//	regSpec
		//	calleeFnc
		let e_ids: any = null;
		function tryIt() {
			if ( 	(e_ids !== reg.ids)
				 && ! (   (o.frameId === reg.frameId     )
					   && (e.pane    === reg.regSpec.pane)) ) {
				return false; }
			callerFnc ( { do:		'set-registered-callee',
						  paneKind:	paneKind,
						  frame:	regSpec.frame,
						  pane:		regSpec.pane,
						  fnc:		calleeFnc } );
			return true;
		}
		if ( cmn.isString ( e.pane ) ) {	//	typical, no pki ...
			e_ids = this.make_ids ( o, e.frame, e.pane ); 
			tryIt();
			return; }
		let keys = Object.keys ( e );	//	Multiple pki (Pane Kind Items).
		for ( let i = 0; i < keys.length; i++ ) {
			let pki = e[keys[i]];
			e_ids = this.make_ids ( o, pki.frame, pki.pane ); 
			if ( tryIt() ) {
				break; } 
		}
	}	//	setRegisteredCallee()

	unsetRegisteredCallee ( o, reg, e, callerFnc, paneKind, regSpec ) {
		//	Similar to setRegisteredCallee()
		let e_ids: any = null;
		function tryIt() {
			if ( e_ids !== reg.ids ) {
				return false; }
			callerFnc ( { do: 		'unset-registered-callee',
					  	  paneKind:	paneKind,
					      pane:		regSpec.pane } );
			return true;
		}
		if ( cmn.isString ( e.pane ) ) {	//	typical, no pki ...
			e_ids = this.make_ids ( o, e.frame, e.pane ); 
			tryIt();
			return; }
		let keys = Object.keys ( e );	//	Multiple pki (Pane Kind Items).
		for ( let i = 0; i < keys.length; i++ ) {
			let pki = e[keys[i]];
			e_ids = this.make_ids ( o, pki.frame, pki.pane ); 
			if ( tryIt() ) {
				break; } 
		}
	}	//	unsetRegisteredCallee()

	register ( o ) {
		let sW = 'App register()';
		let rs: any  = null;						//	regSpec
		let id: any  = null;
		let ids: any = null;
		
		if ( ! cmn.isObject ( o.regSpec ) ) {
			cmn.error ( sW, ' expected o.regSpec' );
			return; }
		if ( ! cmn.isString ( o.paneKind ) ) {
			cmn.error ( sW, ' expected o.paneKind' );
			return; }

		rs  = o.regSpec;
		id  = this.make_id ( o, rs.frame, rs.pane );
		ids = JSON.stringify ( id );
		sW += '  ' + ids;


		cmn.log ( sW );

	//	this.checkContent ( sW );
		
		//	This is called by a client component (after it is loaded) to set up
		//	function calls between it and other components that are somewhat
		//	mutually dependent on each other.
		//	In other words, the component that is registering expects to be 
		//	called by or to call certain other components.  Those other 
		//	components are specified in o.
		//
		//	o is expected to be -
		//	{	what:		The calling component.  The component's type name.
		//		frameId:	Frame  o.what  is in.
		//		paneId:		Pane  o.what  is in.
		//		fnc:		o.what's  function that other components may call.
		//		rcvFm:		An array of specs of other component that  o.what
		//					expectes to be called by.
		//		sndTo:		An array of specs of other components that  o.what
		//	}				will call.
		//
		//	rcvFm and sndTo component specs -
		//	{	what:		Component type name.
		//		frameId:	Frame the component is in.  Optional.
		//		paneId:		Pane the component is in.  Optional.
		//	}
		//
		//	Registry keys are simply the component type name. Each registry
		//	item is an array of components of that type that have been 
		//	registered.
		//
		//	Or -
		//
		//	Implementing regSpec in UDUI panels which has the user specify
		//	the registration as a panel property. 
		//
		//	In this case o is expected to be like -
		//
		//		{ do: 		'register',
		//		  id:		Uniquely identifies the panel in the layout,
		//		  fnc:		Function in panel's code,
		//		  rcvFm:		Array of other panel ids this panel might 
		//		  				recieve function calls from,
		//		  			or
		//		  				An object of named ids.
		//		  sndTo:	Array of other panel ids this panel might call.
		//		  			or
		//		  				An object of named ids.
		//
		//	Not "panel" but "pane". Yes, the regSpec is typically a property 
		//	of a UDUI panel but non-UDUI panes may register this way too. And, 
		//	so far, registration is not done between multiple panels in one 
		//	UDUI/pane.  So it is like this -
		//
		//		{ do:		"register",
		//		  frameId:	<the ID of the frame the registering pane is in>,
		//		  fnc:		<registering pane's doAll function>,
		//		  regSpec:	{ "frame":	"<name of registering pane's frame>",
		//					  "pane":	"<name of registering pane>",
		//		  			  "rcvFm": { "<PT>": { frame: "<name of frame>",
		//		  			  					   pane:  "<name of pane>"   },
		//		  			  			 ... }
		//		  			  "sndTo": { ... } } }
		//
		//
		//		The regSpec is what the user specifies for each pane that
		//		is to connect (interact) with (receive from, send to various
		//		things) other panes.
		//		
		//		The "frame" properties in regSpec, and rcvFrm, sndTo array
		//		items is optional. Specify "frame" when connecting to panes
		//		in other frames from the frame of the pane doing the 
		//		registering.
		//
		//		The "rcvFm" property in the regSpec is an object whose 
		//		properties specify what panes the registering pane expectes to
		//		receive things from. Each "<PT>" (described below) object
		//		must have a "pane" property whereas the "frame" property is
		//		optional and if present it specifies the name of the frame 
		//		that contains the specified pane.
		//
		//		The "sndTo" property is similar to "rcvFm" but it specifies 
		//		the panes the registering pane will send things to.
		//
		//		The "<PT>" properties in the rcvFrm and sndTo objects are
		//		app-defined strings that are a pane type. For example, help 
		//		panes are of these types -
		//		
		//			"help"			Displays help topics.
		//			"help-toc"		Displays the help table of contents.
		//			"help-edit"		A pane for editing help topics.
		//			"help-hist"		Displays a list of recently viewed help
		//							topics.

		//	2023-May-19		What about -
		//
		//	-	For a controls pane there are possibly two registrations -
		//		-	That of the UDUI itself (i.e., udui.svelte).
		//		-	And that of the UDUI code (e.g., vp_select_1.ts). 
		//		Possibly (i.e., not always) because not all UDUI panes have 
		//		code.
		//
		//	-	Some frames (e.g., dlg-select-robot-system-3.ts) have multiple
		//		UDUI/Controls panes. How are the UDUI registrations of those
		//		panes identified?  
		//
		//	Need -
		//
		//	-	Another dialog in UDUI panes. Like the registration for UDUIs
		//		that have code, the user needs to be able to specify/edit 
		//		the registration for UDUI panes that have no code.
		//	-	Furthermore, the user should specify a frame name in those
		//		registrations. The frame name need not be what appears in the
		//		frame's title bar; just something for identification that can
		//		be persistent (unlike the frame's ID).
		//	-	And both registrations should be persistent.

		if ( rs ) {
			//	A pane may only be registered with the specified id once.
			if ( this.registry[ids] ) {
				cmn.error ( sW, 'already registered' );
				return; }

			//	Now hook up. 
			//	First look for panes registered by "id".
			for ( let k in this.registry ) {
				let ra		  = this.registry[k];
				let keys: any = null;
				if ( ra.length < 1 ) {
					continue; }
				let r  = ra[0];		//	Always just one at [0].
				if ( ! cmn.isString ( r.ids ) ) {
					continue; }
				//	Already registered panes to call ids (i.e., the caller,
				//	what is registering now, rs) -
				keys = Object.keys ( rs.rcvFm );
				keys.forEach ( k => {		//	each pane that rs is expected 
					let e = rs.rcvFm[k];	//	to receive from 
				//	let e_ids = this.make_ids ( o, e.frame, e.pane );
				//	if ( 	(e_ids !== r.ids)
				//		 && ! (   (o.frameId === r.frameId     )
				//		 	   && (e.pane    === r.regSpec.pane)) ) {
				//		return; }
				//	r.fnc ( { do:		'set-registered-callee',
				//			  paneKind:	o.paneKind,
				//			  frame:	rs.frame,
				//			  pane:		rs.pane,
				//			  fnc:		o.fnc } );
			//		let e_id = this.make_e_id ( o, e );
					this.setRegisteredCallee ( o, r, e, r.fnc, o.paneKind, rs, o.fnc );
				} );
				
				//	rs.pane to call already registered panes -
				keys = Object.keys ( rs.sndTo );
				keys.forEach ( k => {		//	each pane that rs wants to send 
					let e = rs.sndTo[k];	//	to
				//	let e_ids = this.make_ids ( o, e.frame, e.pane );
				//	if ( 	(e_ids !== r.ids)
				//		 && ! (   (o.frameId === r.frameId     )
				//		 	   && (e.pane    === r.regSpec.pane)) ) {
				//		return; }
				//	o.fnc ( { do: 		'set-registered-callee',
				//			  paneKind:	r.paneKind,
				//			  frame:	r.regSpec.frame,
				//			  pane:		r.regSpec.pane,
				//			  fnc:		r.fnc } );
					this.setRegisteredCallee ( o, r, e, o.fnc, r.paneKind, r.regSpec, r.fnc );
				} );
			}	//	for ( k ...

			//	Now look for  components registered by "what".
			for ( let k in this.registry ) {
				let ra = this.registry[k];
				for ( let i = 0; i < ra.length; i++ ) {
					let r = ra[i];
					if ( cmn.isArray ( o.rcvFm ) ) {
						o.rcvFm.forEach ( e => {
							if ( e !== r.what ) {
								return; }
							r.fnc ( { do: 		'set-registered-callee',
									  what:		o.id,
									  frameId:	0,
									  paneId:	0,
									  fnc:		o.fnc } );
						} ); }
					if ( cmn.isObject ( o.rcvFm ) ) {
						let names = Object.keys ( o.rcvFm );
						names.forEach ( n => {
							let e = o.rcvFm[n];
							if ( e !== r.what ) {
								return; }
							r.fnc ( { do: 		'set-registered-callee',
									  what:		o.id,
									  frameId:	0,
									  paneId:	0,
									  fnc:		o.fnc } );
						} ); }
					if ( cmn.isArray ( o.sndTo ) ) {
						//	o.id to call already registered components -
						o.sndTo.forEach ( e => {
							if ( e !== r.what ) {
								return; }
							o.fnc ( { do: 	'set-registered-callee',
									  id:	r.what,
									  fnc:	r.fnc } );
						} ); }
					if ( cmn.isObject ( o.sndTo ) ) {
						let names = Object.keys ( o.sndTo );
						names.forEach ( n => {
							let e = o.sndTo[n];
							if ( e !== r.what ) {
								return; }
							o.fnc ( { do: 	'set-registered-callee',
									  id:	r.what,
									  fnc:	r.fnc } );
						} ); }
				}	//	for ( i ...
			}	//	for ( k ...

			//	But we still use an array in this case as otherwise.
			let o2 = clone ( o );
				o2.ids = ids;
			let a = this.registry[o2.ids] = [];
			a.push ( o2 );
		}
		else {
			//	Hook up.
			for ( let k in this.registry ) {
				let ra = this.registry[k];
				for ( let i = 0; i < ra.length; i++ ) {
					let r = ra[i];
					//	Already registered components to call o.what -
					if ( o.rcvFm ) {
						o.rcvFm.forEach ( e => {
							if ( e.what !== r.what ) {
								return; }
							if ( e.frameId && (e.frameId !== r.frameId ) ) {
								return; }
							if ( e.paneId && (e.paneId !== r.paneId) ) {
								return; }
							r.fnc ( { do: 		'set-registered-callee',
									  what:		o.what,
									  frameId:	o.frameId,
									  paneId:	o.paneId,
									  fnc:		o.fnc } );
						} ); } 
					if ( o.sndTo ) {
						//	o.what to call already registered components -
						o.sndTo.forEach ( e => {
							if ( e.what !== r.what ) {
								return; }
							if ( e.frameId && (e.frameId !== r.frameId ) ) {
								return; }
							if ( e.paneId && (e.paneId !== r.paneId) ) {
								return; }
							o.fnc ( { do: 		'set-registered-callee',
									  what:		r.what,
									  frameId:	r.frameId,
									  paneId:	r.paneId,
									  fnc:		r.fnc } );
						} ); }
			} } 
		
			//	Add to the registry.
			let a = this.registry[o.what];
			if ( ! a ) {
				a = this.registry[o.what] = []; }
			a.push ( o );
		}
	}	//	register()

	unregister ( o ) {
		let sW = 'App unregister()';
	//	if ( cmn.isString ( o.what ) ) {
	//		sW = 'App unregister() ' + o.what + '  frame ' + o.frameId 
	//										  + '  pane ' + o.paneId; }
	//	else 
	//	if ( cmn.isString ( o.id ) ) {			//	panel regSpec
	//		sW = 'App unregister() ' + o.id; }

		let rs = null;						//	regSpec
		let id  = null;
		let ids = null;

		if ( cmn.isString ( o.what ) ) {
			sW += o.what + '  frame ' + o.frameId + '  pane ' + o.paneId; }
		else {
		if ( cmn.isObject ( o.regSpec ) ) {			//	panel/pane regSpec
			rs  = o.regSpec;
			id  = this.make_id ( o, rs.frame, rs.pane );
			ids = JSON.stringify ( id );
			sW += '  ' + ids; } 
		else {
			cmn.error ( sW, ' expected o.what or o.regSpec' );
			return; } }
			
	//	diag ( [1, 2, 3], sW );
		cmn.log ( sW );

	//	this.checkContent ( sW );

		if ( cmn.isString ( ids ) ) {
			//	First remove o from the registry. If not found then return.
			let a = this.registry[ids];
			if ( ! a ) {
				cmn.error ( sW, 'pane not found' );
				return; }

			//	Undo the calls.
			for ( let k in this.registry ) {
				let ra = this.registry[k];
				for ( let i = 0; i < ra.length; i++ ) {
					let r = ra[i];
					//	Other components calling o.id -
					let keys = null;
					keys = Object.keys ( rs.rcvFm );
					keys.forEach ( k => {
						let e = rs.rcvFm[k];
					//	let e_id  = this.make_id ( o, e.frame, e.pane );
					//	let e_ids = JSON.stringify ( e_id );
					//	if ( e_ids !== r.ids ) {
					//		return; }
					//	r.fnc ( { do: 		'unset-registered-callee',
					//			  paneKind:	r.paneKind,
					//			  pane:		rs.pane } );
						this.unsetRegisteredCallee ( o, r, e, r.fnc, r.paneKind, rs );
					} );
					//	o.id calling other components -
					keys = Object.keys ( rs.sndTo );
					keys.forEach ( k => {
						let e = rs.sndTo[k];
					//	let e_id  = this.make_id ( o, e.frame, e.pane );
					//	let e_ids = JSON.stringify ( e_id );
					//	if ( e_ids !== r.ids ) {
					//		return; }
					//	o.fnc ( { do: 		'unset-registered-callee',
					//			  paneKind:	r.paneKind,
					//			  pane:		r.regSpec.pane } );
						this.unsetRegisteredCallee ( o, r, e, o.fnc, r.paneKind, r.regSpec );
					} );
			} }
			
			cmn.log ( sW, 'deleting ' + ids + ' from registry' );
			delete this.registry[ids];
		}
		else {
			//	First remove o from the registry. If not found then return.
			let a = this.registry[o.what];
			if ( ! a ) {
				return; }
			let i = a.findIndex ( e => { return    (e.frameId === o.frameId)
												&& (e.paneId === o.paneId) } );
			if ( i < 0 ) {
				return; }
			a.splice ( i, 1 );

			//	Undo the calls.
			for ( let k in this.registry ) {
				let ra = this.registry[k];
				for ( let i = 0; i < ra.length; i++ ) {
					let r = ra[i];
					//	Other components calling o.what -
					if ( o.rcvFm ) {
						o.rcvFm.forEach ( e => {
							if ( e.what !== r.what ) {
								return; }
							if ( e.frameId && (e.frameId !== r.frameId ) ) {
								return; }
							if ( e.paneId && (e.paneId !== r.paneId) ) {
								return; }
							r.fnc ( { do: 		'unset-registered-callee',
									  what:		o.what,
									  frameId:	o.frameId,
									  paneId:	o.paneId } );
						} ); }
					if ( o.sndTo ) {
						//	o.what calling other components -
						o.sndTo.forEach ( e => {
							if ( e.what !== r.what ) {
								return; }
							if ( e.frameId && (e.frameId !== r.frameId ) ) {
								return; }
							if ( e.paneId && (e.paneId !== r.paneId) ) {
								return; }
							o.fnc ( { do: 		'unset-registered-callee',
									  what:		r.what,
									  frameId:	r.frameId,
									  paneId:	r.paneId } );
						} ); }
			} }
		}
		
	//	this.checkContent ( sW );
	
	}	//	unregister()

	showMenu ( o ) {
		const sW = 'App showMenu()';
		cmn.log ( sW );

		let ce = <HTMLElement>
				 document.getElementById ( this.appContentEleId );
		let r  = ce.getBoundingClientRect();

		this.appFrameFnc ( { 
			do: 		'show-menu',
			menuEleId:	'app-menu',
			menuX:		o.x,
			menuY:		o.y,
			menuItems:	o.items,	//	each has its own function
			upFnc:		null,
			ctx:		{ clientRect:	r } } );
		//				  what:			o.what,
		//				  after:		o.after } } );
	}	//	showMenu()

	splitterProperties ( o ) {
		const sW = 'App splitterProperties()';
	//	cmn.log ( sW );
		
		//	Find a/the properties frame, if any. Relay the do.
		let a = this.registry['Properties'];
		if ( (! a) || (a.length === 0) ) {
			let ks = Object.keys ( this.registry );
			let i = ks.findIndex ( k => {
				try {
					let r = JSON.parse ( k );
					if ( r.frame === 'Properties' ) {
						return true; }
				} catch ( e ) { }
				return false;
			} );
			if ( i >= 0 ) {
				a = this.registry[ks[i]]; }
			else {
				cmn.log ( sW, 'no properties frame/pane is registered' );
				return false; } }

		//	Use the first.
		return a[0].fnc ( o );
	}	//	splitterProperties()

	fixPaneId ( o ) {
		const sW = 'App fixPaneId()  cur ' + o.curPaneId 
								+ '  new ' + o.newPaneId;
		cmn.log ( sW );
		
		let content = this.content[o.curPaneId];
		if ( ! content ) {
			cmn.error ( sW, 'unrecognized paneId' );
			return; }
		delete this.content[o.curPaneId];
		this.content[o.newPaneId] = content;

		if ( content.install ) {
			//	Note that the component name is in c.type.name which in this
			//	case is (for now) assumed to be ContentExample1.
			//
			//	Can't figure out where/how c.type.name is ever set.
			//	Should this be c.typeName?
			cmn.error ( sW, 'c.type.name?' ); 		//	for now
		}

		if ( o.reason === 'split' ) {
			//	The current pane is now split.  We need to maintain a content
			//	object for that pane - even though it no longer has "content"
			//	it will still have state. The state will be set later.
			this.content[o.curPaneId] = { frameId:			o.frameId,
										  ccEleId:			'',
										  paneContentFnc:	null,
										  paneFnc:			null,
										  initialized:		false,		//	?
										  install:			null,
										  contentFnc:		null,
										  state: 			null,
										  typeName:			null }; }
		return null;
	}	//	fixPaneId()

	
	restorePaneContent ( o, paneId, pcPane ) {
		const sW = 'App restorePaneContent()';

		if ( ! pcPane ) {
			return; }
		if ( pcPane.frameId !== o.frameId ) {
			return; }
		let c  = this.definePaneContent ( o, paneId, 
										  pcPane.initialized );
		if ( ! c ) {
			cmn.error ( sW, 'c is null' );
			return; }

		let tn = pcPane.typeName;
		let dn = 	pcPane.state 
				 && pcPane.state.ccState 
				 && pcPane.state.ccState.dataName 
				  ? pcPane.state.ccState.dataName : '';
		if ( tn ) {
			c.install = this.defineInstall ( tn, dn,
											 o.frameId, 
											 paneId, c.ccEleId ); }
		c.state = pcPane.state;
	}	//	restorePaneContent()

	loadPaneState ( o ) {
		const sW = 'App loadPaneState()  paneId ' + o.paneId;
		let content = this.content[o.paneId];
		if ( ! content ) {
			cmn.error ( sW, 'content not found'
						  + ' (paneId ' + o.paneId + ')' );
			return; }
		return content.state;
	}	//	loadPaneState()

	debug_restoreFrameAsDialog2 ( dlgArgs ) {
		const sW = 'App debug_restoreFrameAsDialog2()';
		cmn.log ( sW );

		//	ProgressBox
		const s_pc = '{"6":{"state":{"tabs":false,"style":{"top":"0px","left":"0px","width":"400px","height":"400px"},"ccState":{"state":null,"style":{"gridTemplateRows":"auto"},"title":"UDUI","regSpec":"","codeName":"ProgressBox","controls":[{"data":{"h":28,"w":390,"x":5,"y":20,"ff":"verdana","fs":18,"hPct":null,"name":"lblTitle","text":"Title - Progress","type":"label","wPct":null,"xPct":null,"yPct":null,"assoc":"","class":"u34-label","color":"black","eleId":"rr-5","hEval":null,"wEval":null,"xEval":null,"yEval":null,"hotKey":"","hasBorder":false,"horzAlign":"middle","vertAlign":"middle","fillsPanel":false},"storeName":null},{"data":{"h":18,"w":200,"x":5,"y":2,"ff":"verdana","fs":12,"hPct":null,"name":"lblRobotRecords","text":"Robot Records","type":"label","wPct":null,"xPct":null,"yPct":null,"assoc":"","class":"u34-label","color":"black","eleId":"rr-6","hEval":null,"wEval":null,"xEval":null,"yEval":null,"hotKey":"","hasBorder":false,"horzAlign":"left","vertAlign":"middle","fillsPanel":false},"storeName":null},{"data":{"h":24,"w":70,"x":165,"y":355,"ff":"verdana","fs":10,"hPct":null,"menu":"","name":"btnCancel","text":"Cancel","type":"button","wPct":null,"xPct":null,"yPct":null,"eleId":"rr-7","hEval":null,"wEval":null,"xEval":null,"yEval":null,"execute":"","onclick":null,"bDropdown":false,"bMoveRect":true,"bSizeRect":true,"hasBorder":true,"fillsPanel":false,"borderColor":"gray"},"storeName":null},{"data":{"h":252,"w":365,"x":20,"y":60,"ff":"consolas","fs":12,"hPct":null,"name":"txtProgress","type":"textarea","wPct":null,"xPct":null,"yPct":null,"class":"u34-textarea-no-border","eleId":"rr-8","hEval":null,"value":"","wEval":null,"xEval":null,"yEval":null,"bVertSB":true,"markdown":false,"hasBorder":false,"fillsPanel":false,"lineHeight":0,"letterSpacing":0},"storeName":null},{"data":{"h":20,"w":356,"x":20,"y":320,"ff":"verdana","fs":12,"hPct":null,"name":"lblStatus","text":"","type":"label","wPct":null,"xPct":null,"yPct":null,"assoc":"","class":"u34-label","color":"black","eleId":"rr-9","hEval":null,"wEval":null,"xEval":null,"yEval":null,"hotKey":"","hasBorder":false,"horzAlign":"left","vertAlign":"middle","fillsPanel":false},"storeName":null}],"titleStyle":{"display":"none"},"panningEnabled":false,"dlgArgs":{"dlgTitle":"Loading Robot System: hello","status":"please wait - possibly several seconds","disallowPaneEdits":true,"ctx":null}},"hasFocus":false,"typeName":"UDUI","splitHorz":null,"splitVert":null,"tabsState":false,"focusClass":null,"shLftStyle":null,"shRgtStyle":null,"svBotStyle":null,"svTopStyle":null,"containerH0":0,"containerStyle":null,"shSplitterStyle":null,"svSplitterStyle":null},"ccEleId":"rr-cc-9","frameId":2,"install":null,"typeName":"UDUI","initialized":false}}';
		const s_frm = '{"style":{"top":"191px","left":"40px","width":"400px","height":"400px","visibility":"visible","borderColor":"blue"},"paneId":6,"frameId":2,"frameName":"Paneless Frame - 2","frameType":"TBD","ftrVisible":false,"hdrVisible":false}';
		
		let pc  = JSON.parse ( s_pc );
		let frm = JSON.parse ( s_frm );

		let state = { content: pc };

				//	If the frame has splitters then not all pane's state
				//	will be client content (some panes will simply be the
				//	parent of the splitter and two other panes).  And only 
				//	one pane's client content should have its codeName set.
				let keys = Object.keys ( state.content );
				let i, nc = keys.length;
				for ( i = 0; i < nc; i++ ) {
					let ss = state.content[keys[i]].state;
					if ( ! cmn.isObject ( ss ) ) {
						continue; }
					if ( ! cmn.isObject ( ss.ccState ) ) {
						continue; }
					if ( ! 	(	cmn.isString ( ss.ccState.codeName )
							 && (ss.ccState.codeName.length > 0)) ) {
						continue; }
					ss.ccState.dlgArgs = dlgArgs;
					break; } 

		let self = this;
		let central = null;

		tick().then ( () => {
		
			self.frames[frm.frameId] = { type:		frm.frameType,
										 frameFnc:	null,
										 central:	central };

			for ( let id in pc ) {
				let paneId = Number.parseInt ( id );
				self.restorePaneContent ( frm, paneId, pc[paneId] ); }

			self.appContentFnc ( {
				do:				'add-frame',
				frameType:		'dialog',
				frameName:		frm.frameName,
				frameId:		frm.frameId,
				paneId:			frm.paneId,
			} );

			self.appFrameFnc ( { do: 		'app-dialog-frame',
								 frameType:	'dialog',
								 frame:		frm,
								 otherData:	null } ); 
		} );

	}	//	debug_restoreFrameAsDialog2()


	logProgress() {

		if ( this.fncProgress ) {
		//	if ( this.progressCount > 20 ) {
		//		debugger; }
			this.fncProgress ( { text: ' progress ' + (this.progressCount + 1) + '\n' } );
			
			this.progressCount += 1;

			if ( this.progressCount >= 30 ) {
				return; }

			let self = this;
			window.setTimeout ( () => {
				self.logProgress();
			}, 50 );
		}
	}

	progressBox() {
		const sW = 'App progressBox()';
		cmn.log ( sW );

		let self = this;
		
		function doProgress ( o ) {
			if ( o.do === 'set-progress-fnc' ) {
				self.fncProgress = o.fncProgress;
				return; }
			if ( o.do === 'set-status-fnc' ) {
		//		self.fncRestoreStatus = o.fncStatus;
				return; }
			if ( o.do === 'cancel' ) {
		//		bCancel = true;
				return; }
			cmn.error ( sW + ' doProgress()', 'unrecognized o.do' );
		//	bCancel = true;
		}	//	doProgress()
	
		let dlgArgs = { dlgTitle:	'This! Is a test!',
						status:		'some status',
						fncCB:		doProgress,
						disallowPaneEdits:	true,
						ctx:		null };		//	Passed to the callback

		this.debug_restoreFrameAsDialog2 ( dlgArgs );; 

		this.progressCount = 0;

		window.setTimeout ( () => {
			self.logProgress();
		}, 1000 );

	}	//	progressBox()

	
	doAll ( o: any ) {
		let sW = 'App doAll() ' + o.do;
		if ( o.to ) {
			sW += ' to ' + o.to; }
		cmn.log ( sW );
		switch ( o.do ) {
			case 'check-content':
			//	return this.checkContent ( o.sW );
			//	To debug certain issues.  Implement, maybe, later.
				return null;
			case 'set-call-down':
				this.setCallDown ( o );
				break;
			case 'destroy-frame':
				return this.destroyFrame ( o.frameId );
			case 'frame-destroyed':
				return this.frameDestroyed ( o );
			case 'set-state-changed':
			//	return this.setStateChanged ( o );
			//	Regards state and persistence. Ignore for now.
				return null;
			case 'set-state-menu-or-dialog':
			//	this.stateMenuOrDialogDepth = o.depth;
			//	Regards state and persistence. Ignore for now.
				return true;
			case 'append-menu-items':
				if ( o.to === 'pane-burger' ) {
					o.menuItems.push ( { type: 'item', 
										 text: 'Controls' } );
					o.menuItems.push ( { type: 'item', 
										 text: 'Properties' } );
					break; }
				break;
			case 'menu-item':
				this.menuItem ( o );
				break;
			case 'instantiate-code':
				return this.instantiateCode ( o );
			case 'load-record-dialog':
				this.loadRecordDialog ( o );
				break;
			case 'ok-load':
				this.okRecordName ( o );
				break;
			case 'long-text-dialog':
				this.longTextDialog ( o );
				break;
			case 'pane-content-update':
			//	this.paneContentUpdate ( o );
			//	Obsolete. Fix caller.
				break;
			case 'get-frame':
				return this.frames[o.frameId];
			case 'load-pane-state':
				return this.loadPaneState ( o );
				return null;
			case 'register':
				return this.register ( o );
			case 'unregister':
				return this.unregister ( o );
			case 'show-menu':
				return this.showMenu ( o );
			case 'properties-of-pane-splitter':
				return this.splitterProperties ( o );
			case 'store-pane-state':
				return null;
			case 'fix-pane-id':
				return this.fixPaneId ( o );
			case 'define-pane-content':
				return this.definePaneContent ( o, 0, false );
			case 'app-dialog-up':
				this.appDialogFnc = o.fnc;
				return null;
			case 'get-app-thd-id':
				//	This is probably unnecessary. Fix the caller.
				return 1;		//	for now
			default:
				cmn.error ( sW, 'unrecognized do "' + o.do + '"' );
				return null; 
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
