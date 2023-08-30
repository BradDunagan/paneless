<script lang="ts">

	import { onMount, afterUpdate }	from 'svelte';
	import { tick }			from 'svelte';
	import { cmn }    		from './common';
	import { getPaneId }	from './pane-id';
	import { getNextTabId }	from './tab-next-id';
	import Pane 			from './pane.svelte';
	import DbgA				from './dbg-a.svelte';
	import TabName 			from './tab-name.svelte';	
	import TabPages			from './tab-pages.svelte';
	import TabPageNames		from './tab-page-names.svelte';

	export let prpEleId			= '';
	export let prpAtFrameTop	= false;
	export let prpFrameId 		= 0;
	export let prpPaneFnc		= null;
	export let prpAppContentFnc	= null;
	export let prpFrameFnc		= null;
	export let prpClientFnc		= null;

let self = {

	state:	{
		page:		null,
		pageKey:	0,
		names:  	[],
	},

	stateStack:		[],
	
	tabPagesEleId:		prpEleId + '-pages',
	tabPageNamesEleId:	prpEleId + '-names',

	isMountified:	false,
	oState:			null,

	pages:		{},

	nameFncs:	{},
	names:		{},
	selectedNameEleId:	null,

	focusedTabId:		0,
	tabFocusTimeoutId:	0,

	getNamesWH ( o ) {
		let e = document.getElementById ( self.tabPageNamesEleId );
		//	This is called to get an adjustment for the height of the page
		//	pane (as opposed to the height of the pane containing the pages
		//	and tab names). 
		//	Add 1 to the tab-names height to account for the border 
		//	line that is defined by the bottom of the pages container.
		return { width:  e.clientWidth,
			//	 height: e.clientHeight + 1 };
				 height: e.clientHeight };
	},	//	getNamesWH()

	addTabPageName ( paneId, text, textUserSet, cbPageName ) {

		let tabId  = getNextTabId();
		if ( paneId === 0 ) {
			paneId = getPaneId(); }

//		prpClientFnc ( {
//			do:			'define-pane-content',
//			frameId:	prpFrameId,
//			paneId:		paneId } );
//	//	Unnecessary here. See addFrame() in app.svelte.		?
//	//	Is necessary when user clicks on the + (add tab).
//		Put in the caller where necessary (i.e., addTab()).

		//	Pane should fill the page.
		let e = document.getElementById ( self.tabPagesEleId );
		let style = { width:  e.clientWidth + 'px',
					  height: e.clientHeight + 'px' };

		self.pages[tabId] = { 
			page: {	key:	tabId,
					comp:	Pane,
					props: {
					  prpFrameId: 		prpFrameId,
					  prpAtFrameTop:	prpAtFrameTop,
					  prpPaneId: 		paneId,
					  prpTabId:			tabId,
					  prpTabsFnc:		self.doAll,
					  prpAppContentFnc:	prpAppContentFnc,
					  prpFrameFnc:		prpFrameFnc,
					  prpParentFnc:		prpPaneFnc,
					  prpStyle: 		style,
					  prpClientFnc:		prpClientFnc,
					  prpTabs:			false } },
			paneId: 	paneId,
			paneFnc:	null,
		//	state:		null 
		};
/*
		self.pages[tabId] = { 
			page: {	key:	tabId,
					comp:	DbgA,
					props: {
					  prpTabId:		tabId,
					  prpTabsFnc:	self.doAll,
					  prpText:		'tabId ' + tabId } },
			paneId: 	paneId,
			paneFnc:	null,
		//	state:		null 
		};
*/
		let eleId = 'rr-tab-name-' + tabId;
		self.names[eleId] = { tabId:		tabId,
							  text:			text ? text : null,
							  textUserSet:	textUserSet };
		self.setPageNamesState ( cbPageName, eleId );

	},	//	addTabPageName()

	showPage ( tabId ) {
		const sW = 'paneless Tabs showPage()';
	//	cmn.log ( sW, 'tabId: ' + tabId );
		return new Promise ( ( res, rej ) => {
			self.pushState ( null,
							{ page:  self.pages[tabId].page }, 
							() => {
				let page = self.pages[tabId];
				if ( page.paneFnc ) {
					//	Update the page pane's style from what was set in
					//	addTabPageName() because the container (these tabs)
					//	size may have changed. Quirky fix (this might not
					//	seem necessary) because we call 'set-state' next just
					//	below, but in that, the state state style is ignored
					//	- see pane's doSetState().
					let e = document.getElementById ( self.tabPagesEleId );
					let pms = page.paneFnc ( { do:		'set-style',
											   width:	e.clientWidth,
											   height:	e.clientHeight } );
					pms.then ( () => {
						//	paneFnc() will load state from client app.
						//	However note that the client state is not set here 
						//	(bNotCC: true) because the client gets its state 
						//	with/during 'set-call-down' (when the client is 
						//	created).
						page.paneFnc ( { do:		'set-state',
										 bNotCC:	true  } ); } ); }
				res ( 'ok' );
			} );
		} );
	},	//	showPage()

	setPageNamesState ( cbPageName, prmPageName?: string ) {
		const sW = 'paneless Tabs setPageNamesState()';
		let tna = [];		//	Tab Name Array
		let key = 0;
		for ( var eleId in self.names ) {
			tna.push ( ' ' + eleId ); }
	//	cmn.log ( sW, ' PN eleIds: ' + tna );
		tna = [];
		for ( var eleId in self.names ) {
			let d = self.names[eleId];
			d.name = { key:		++key,
					   comp:	TabName,
					   props: { prpEleId:		eleId,
								prpText:		d.text,
								prpTabsFnc: 	self.doAll } };
			tna.push ( d.name );
		}
	//	self.setState ( { names: tna }, () => {
		self.pushState ( null, { names: tna }, () => {
			if ( cbPageName ) {
				cbPageName ( prmPageName ); }
		} );
	},	//	setPageNamesState()

	selectTab ( eleId ) {
		if ( eleId === self.selectedNameEleId ) {
			return null; }
		if ( self.selectedNameEleId ) {
			let page = self.pages[self.names[self.selectedNameEleId].tabId];
		//	page.state = page.paneFnc ( { do: 'get-state' } );
			//	Have the pane get its state and store it in the client app.
			page.paneFnc ( { do: 'get-state' } );
			self.nameFncs[self.selectedNameEleId] ( { do: 		'select',
													  selected:	false } ); 
		}
		self.nameFncs[eleId] ( { do: 		'select',
								 selected:	true } );
		self.selectedNameEleId = eleId;
		return self.showPage ( self.names[eleId].tabId );
	},	//	selectTab()

	addTab ( cb, paneId ) {
		const sW = 'paneless Tabs addTab()';
		if ( (! cmn.isInteger ( paneId )) || (paneId <= 0) ) {
			cmn.error ( sW, 'unexpected paneId' );
			return; }
		prpClientFnc ( {
			do:			'define-pane-content',
			frameId:	prpFrameId,
			paneId:		paneId } );
		self.addTabPageName ( paneId, 'Tab Name', false, ( eleId ) => {
			self.nameFncs[eleId] ( { do: 		'select',
									 selected:	true } );
			let pms = self.selectTab ( eleId );
			if ( pms ) {
				cmn.log ( sW, 'waiting on promise...' );
				pms.then ( ( s: string ) => {
					cmn.log ( sW, 'promise kept' );
					if ( cb ) {
						cb ( eleId ); }
				} ); }
			else {
				cmn.log ( sW, 'no promise' );
				if ( cb ) {
					cb ( eleId ); } }
		} );
	},	//	addTab()

	getNameEleIdByTabId ( tabId ) {
		for ( let eleId in self.names ) {
			let d = self.names[eleId];
			if ( d.tabId === tabId ) {
				return eleId; } }
		return null;
	},
	
	nameTab ( o ) {
		let curName = '';
		for ( var eleId in self.names ) {
			let d = self.names[eleId];
			if ( d.tabId !== o.tabId ) {
				continue; }
			curName = d.text;
			break; }
		prpFrameFnc ( { do: 	'show-name-dlg',
								upFnc: 	self.doAll,
								ctx: 	{ title:	'Tab Name',
										  curName:	curName,
										  after: 	'name-tab-name',
										  tabId:	o.tabId } } );
	},	//	nameTab()

	nameTabName ( o ) {
		for ( var eleId in self.names ) {
			let d = self.names[eleId];
			if ( d.tabId !== o.ctx.tabId ) {
				continue; }

			//	do not set initial-tab-name if the user has set the name
			if ( ! o.initialTabName ) {
				d.textUserSet = true; }
			else {
				if ( d.textUserSet ) {
					break; } }

			d.text = o.name;
			self.setPageNamesState ( null );
			break; }
	},	//	nameTabName()
	
	oSetState2 ( o ) {
		let selectedEleId = null;
		let names = Object.entries ( o.state.names );
		let i = 0, len = names.length;
		function eachName() {
			if ( i >= len ) {
				if ( (len === 0) || ! selectedEleId ) {
					return;	}
				self.nameFncs[selectedEleId] ( { do: 		'select',
												 selected:	true } );
				self.selectTab ( selectedEleId );
				return; }
			let name: any = names[i++]
			let page = o.state.pages[name[1].tabId];
			self.addTabPageName ( page.paneId, 
								  name[1].text, 
								  name[1].textUserSet, ( eleId ) => {
				if ( name[0] === o.state.selectedNameEleId ) {
					selectedEleId = eleId; }
				eachName();
			} );
		}	//	eachName()
		eachName();
	},	//	oSetState2();

	oSetState ( o ) {
		//	First, clear - no tabs.
	//	self.setState ( { page: 	null,
	//					  names:	[] }, () => {
		self.pushState ( () => {
			self.pages 		= {};			//	after all pending states are
			self.nameFncs 	= {};			//	set, before the next state
			self.names 		= {};
		},
		{ page: 	null,					//	the next state
		  names:	[] }, 
		() => {
			//	Now restore tabs (add).		//	after the next state
			self.oSetState2 ( o );
		} );
	},	//	oSetState()

	pushState ( cbBfor, s, cbAftr ) {
		if ( (! self.isMountified) || (self.stateStack.length > 0) ) {
			self.stateStack.push ( { state: s, bfor: cbBfor, aftr: cbAftr } );
			return; }
		if ( cbBfor ) {
			cbBfor(); }
		function finish() {
			for ( let k in s ) {
				self.state[k]  = s[k]; }
			//	if ( k === 'page' ) {
			//		self.state.page    = s[k]; 
			//		self.state.pageKey = s[k].key; }
			//	if ( k === 'names' ) {
			//		self.state.names = s[k]; } }
			tick().then ( cbAftr );
		}
		//	To get the Pane to change ...
		//	If we are setting a page and the current page is not null then
		//	we got to null the current page first.
		let bChangePage = false;
		for ( let k in s ) {
			if ( (k === 'page') && s[k] && self.state.page ) {
				bChangePage = true;
				break; } }
		if ( bChangePage ) {
			self.state.page = null;
			tick().then ( () => {
				finish(); } ); }
		else {
			finish(); }
	},	//	pushState()

	submitState() {
		if ( self.stateStack.length < 1 ) {
			return; }
		let s = self.stateStack[0];
		if ( s.bfor ) {
			s.bfor(); }
	//	self.setState ( s.state, s.aftr );
		self.state.page = s.state.page;			//	Execute s.aftr in 
		self.state.names = s.state.names;		//	componentDidUpdate()
	},	//	submitState()

	updatePageProps ( o ) {
		const sW = 'Tabs updatePageProps()';
	},	//	updatePageProps()

	startTabFocusTimer() {
		if ( self.tabFocusTimeoutId ) {
			window.clearTimeout ( self.tabFocusTimeoutId ); }
		self.tabFocusTimeoutId = window.setTimeout ( () => {
			self.tabFocusTimeoutId = 0;
		}, 4000 );
	},	//	startTabFocusTimer()

	cycleTabFocus() {
		const sW = 'Tabs cycleTabFocus()';
		let paneFnc, tabId, tabIds: any = Object.keys ( self.pages );
		tabIds.forEach ( ( x, i ) => { 
			tabIds[i] = Number.parseInt ( x ) } );
		tabIds.sort();

		function focus( i ) {
			tabId = self.focusedTabId = tabIds[i]
			let nameEleId = self.getNameEleIdByTabId ( tabId );
			if ( ! nameEleId ) {
				return Promise.reject ( 'nameEleId not found' ); }
			cmn.log ( sW, ' focus():  i ' + i 
						+ '  tabId ' + tabId
						+ '  nameEleId ' + nameEleId );
			return new Promise ( ( res, rej ) => {
				self.selectTab ( nameEleId )
					.then ( () => {
						paneFnc = self.pages[tabId].paneFnc;
						paneFnc ( { do: 'focus' } );
						self.startTabFocusTimer();
						res ( paneFnc );
						return;
					} );
			} );
		}

		if ( self.focusedTabId === 0 ) {
			if ( ! tabIds[0] ) {
				return null; }
			return focus ( 0 );
		}
		tabId = self.focusedTabId;
		let i = tabIds.indexOf ( tabId );
		if ( i >= 0 ) {
			//	If the timeout has elapsed then show again which tab/pane has 
			//	the focus, do not cycle. The user must repeat hitting the 
			//	keyboard key faster in order to cycle.
			if ( self.tabFocusTimeoutId === 0 ) {
				return focus ( i ); }
			self.pages[tabId].paneFnc ( { do: 'not-focus' } ); 
			i++; 
			if ( i >= tabIds.length ) {
				i = 0; } }
		else {
			i = 0; }
		if ( tabIds[i] ) {
			return focus ( i );
		}
		return null;
	},	//	cycleTabFocus()

	relayToPane ( o ) {
		if ( self.state.page ) {
			let key = self.state.page.key;
			if ( self.pages[key] && self.pages[key].paneFnc ) {
				self.pages[key].paneFnc ( o ); } }
	},	//	relayToPane()

	doAll ( o ) {
		let sW = 'Tabs doAll() ' + o.do;
		if ( o.to ) {
			sW += ' to ' + o.to; }
//		cmn.log ( sW );
	switch ( o.do ) {

		case 'set-call-down': {
			if ( o.to === 'tab-name' ) {
				self.nameFncs[o.nameEleId] = o.nameFnc;
				return;
			}
			if ( o.to === 'tab-page-pane' ) {
				let pg = self.pages[o.tabId];
				if ( ! pg ) {
					if ( ! o.tabPaneFnc ) {
						return; }
					cmn.error ( sW , 'page not found' );
					return; }
				self.pages[o.tabId].paneFnc = o.tabPaneFnc;
				return;
			}
			return;
		}
		case 'name-click': {
			self.selectTab ( o.nameEleId );
			return;
		}
		case 'add-tab': {
			let paneId = getPaneId();
			self.addTab ( null, paneId );
			return paneId;
		}
		case 'name-tab': {
			self.nameTab ( o );
			return;
		}
		case 'name-tab-name': {
			self.nameTabName ( o );
			return;
		}
		case 'get-state': {
			let names = {};
			let pages = {};
			for ( let eleId in self.names ) {
				let name = self.names[eleId];
				names[eleId] = { tabId: 		name.tabId,
								 text:			name.text,
								 textUserSet:	name.textUserSet };
				let page = self.pages[name.tabId];
				pages[name.tabId] = {
					paneId:		page.paneId,
				}
				if ( eleId === self.selectedNameEleId ) {
					page.paneFnc ( { do: 'get-state' } );
				}
			}
			let state = {
				selectedNameEleId:	self.selectedNameEleId,
				names:				names,
				pages:				pages
			};
			return state;
		}
		case 'get-state-2': {
			cmn.log ( sW, ' Error: state-2 is not implemented here' );
			return null; }
		case 'set-state': {
		//	if ( ! self.isMountified ) {
		//		self.oState = o;
		//		return; }
			self.oSetState ( o );
			return;
		}
		case 'size': {
			self.updatePageProps ( o );
			return;
		}
		case 'focus': {
			self.relayToPane ( o );
			return;
		}
		case 'not-focus': {
			self.relayToPane ( o );
			return;
		}
		case 'cycle-tab-focus': {
			return self.cycleTabFocus();
		}
		case 'key-burger-menu': {
			self.relayToPane ( o );
			return;
		}
		case 'get-tab-names-wh': {
			return self.getNamesWH ( o );
		}
		case 'is-tab-page-pane': {
			let paneFnc = null, tabIds = Object.keys ( self.pages );
			tabIds.forEach ( id => {
				if ( self.pages[id].paneId === o.paneId ) {
					paneFnc = self.pages[id].paneFnc; } } );
			return paneFnc;
		}
	}	//	switch ( o.do )
	}	//	doAll()

};	//	self

	prpPaneFnc ( { do:		'set-call-down',
				   to:		'tabs',
				   tabsFnc:  self.doAll } );

	onMount( () => {
		let sW = 'paneless Tabs onMount()';
		self.isMountified = true;
	} )	//	onMount()

	afterUpdate( () => {
		let sW = 'paneless Tabs afterUpdate()';
		let len = self.stateStack.length;
		let s = self.stateStack.splice ( 0, 1 );
		if ( (len > 0) && s[0].aftr ) {
			s[0].aftr(); }		
		if ( len > 1 ) {
			self.submitState(); }
	} )	//	afterUpdate()

</script>

<tabs>

	<div id			= { prpEleId } >
		<TabPages prpEleId		= { self.tabPagesEleId }
				  prpPageKey	= { self.state.pageKey }
				  prpPage		= { self.state.page } />
		<TabPageNames prpEleId		= { self.tabPageNamesEleId }
					  prpTabsFnc	= { self.doAll } 
					  prpNames		= { self.state.names } />
	</div>

</tabs>

<style>

	tabs {
		display:			grid;
		grid-template-rows:	auto 22px;
		width:				100%;
		height:				100%;
	}

</style>

