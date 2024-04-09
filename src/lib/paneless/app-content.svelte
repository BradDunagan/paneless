
<script lang="ts">
	import { onMount }		from 'svelte';
	import { tick }			from 'svelte';
	import clone 			from 'clone';		//	In tsconfig.json, "allowjs": true	
	import { cmn }			from './common';
	import { getFrameId, setLastFrameId, getLastFrameId }	from './frame-id';
	import { getPaneId, getLastPaneId, setLastPaneId }		from './pane-id';
	import AppSizeDictator	from './app-size-dictator.svelte';
	import Frame 			from './frame.svelte';

	export let profound1: string =	'';
	export let profound2: string =	'';
	export let appFrameFnc: any =	null;	
	export let clientFnc: any =		null;

	let eleId = 'paneless-app-content';

	let e2eCmdInputEleId	= "paneless-0-e2et-cmd-input-input";
	let e2eCmdOutputEleId	= "paneless-0-e2et-cmd-output-input";
	let e2eCmdCnt			= 0;
	
	let asdFnc: any	= null;		//	App Size Dictator

	let frames			= {};
	let aframes: any []	= [];

    class ClassAppContent {

		focusedFrameId:	null | number;
		focusedPaneId:	null | number;

		constructor() {

			this.focusedFrameId =	null;
			this.focusedPaneId =	null;
			
			this.doAll			= this.doAll.bind ( this );
		}

		e2eCmdChange ( ev ) {
			let sW = 'AppContent e2eCmdChange()';
			let e: any = document.getElementById ( e2eCmdInputEleId );
			let s = e.value;
			cmn.log ( sW, ' s: ' + s );
			let len = s.length;
			if ( len < 4 ) {
				return; }
			if ( s.slice ( -4 ) !== '}eoc' ) {
				return; }
			
			e2eCmdCnt += 1;
		//	this.e2eSetOutput ( { result: {
		//						  text: 	'whoa',
		//						  cmdCnt:	e2eCmdCnt } } );
			cmn.log ( sW, ' s: ' + s + '  len: ' + len );
			let cmd = s.slice ( 0, len - 3 );
			cmn.log ( sW, ' cmd: ' + cmd )
			clientFnc ( { do: 	'e2e-test',
						  cmd:	cmd } );
		}	//	e2eCmdChange()

	//	e2eCmdInput ( ev ) {
	//		let sW = 'AppContent e2eCmdInput()';
	//		cmn.log ( sW );
	//	}	//	e2eCmdInput()

		e2eClearOutput ( o ) {
			let sW = 'AppContent e2eClearOutput()';
			let e: any = document.getElementById ( e2eCmdOutputEleId );
			e.value = '';
		}	//	e2eClearOutput()

		e2eSetOutput ( o ) {
			let sW = 'AppContent e2eSetOutput()';
			let e: any = document.getElementById ( e2eCmdOutputEleId );
			e.value = JSON.stringify ( o.result );
		}	//	e2eSetOutput()

		keyDown ( o ): boolean {
			let sW = 'AppContent keyDown()';
		//	cmn.log ( sW, '  ' + o.ev.key );
			let frameId = this.focusedFrameId;
			if ( ! frameId ) {
				return false; }
			let frame = frames[frameId];
			if ( ! frame ) {
				return false; }
			return frame.frameFnc ( o );
		}	//	keyDown()

		setFrameFocus2 ( frameId: number ): any {
			let frame = frames[frameId];
			if ( ! frame ) {
				return null; }
			this.focusedFrameId = frameId;
			frame.frameFnc ( { do: 'z-top' } );
			let paneFnc = frame.frameFnc ( { do: 'focus' } );
			return { frameFnc: 	frame.frameFnc,
					paneFnc:	paneFnc };
		}	//	setFrameFocus2()

		setFrameFocus ( frameId: number ): any {
			let sW = 'AppContent setFrameFocus()';
			if ( this.focusedFrameId === frameId ) {
				return null; }
			if ( typeof this.focusedFrameId === 'number' ) {	
				if ( this.focusedFrameId === 0 ) {
					appFrameFnc ( { 
						do: 'not-focus-app-title' } ); }
				else {
					frames[this.focusedFrameId].frameFnc ( { 
						do: 'not-focus' } ); }
			}
			if ( frameId === null ) {
				this.focusedFrameId = null;
				return null; }
			return this.setFrameFocus2 ( frameId );
		}	//	setFrameFocus()

		setPaneFocus ( frameId: number, paneId: number ): any {
			let sW = 'AppContent setPaneFocus()';
			sW += ' current F ' + this.focusedFrameId 
				+         ' P ' + this.focusedPaneId
				+    '   to F ' + frameId 
				+         ' P ' + paneId;
			cmn.log ( sW );

		//	if (   (this.focusedFrameId === frameId)
		//		&& (this.focusedPaneId  === paneId ) ) {
		//		return null; }
		//	Even if the pane is already the currently focused pane
		//	redraw the indicator (termporary offset blue border).

			let frame = frames[frameId];
			if ( ! frame ) {
				return null; }
			this.focusedFrameId = frameId;

			frame.frameFnc ( { do: 'z-top' } );
			//	This focusing stuff might be called in the middle of mouse
			//	events (down, up, click). If we mess with the z ordering by
			//	moving the frame element in the DOM, it seems, the click event
			//	does not happen. The uncertain fix here is to delay the z
			//	ordering.
		//	window.setTimeout ( () => {
		//		frame.frameFnc ( { do: 'z-top' } ); }, 1000 );
		//	Now this timeout seems to be unnecessary because this focusing
		//	stuff is called in the click event (before the calling the app's
		//	click callbacks).

			let paneFnc = frame.frameFnc ( { do:	'focus',
											paneId:	paneId } );
			if ( ! cmn.isFunction ( paneFnc ) ) {
				return null; }
			this.focusedPaneId = paneId;
			return { frameFnc: 	frame.frameFnc,
					 paneFnc:	paneFnc };
		}	//	setPaneFocus()

		cycleFrameFocus() {
			let sW = 'AppContent cycleFrameFocus()';
			let frame: any, frameId: number; 
			let frameIds: any = Object.keys ( frames );
			frameIds.forEach ( ( x, i ) => { 
				frameIds[i] = Number.parseInt ( x ) } );
			frameIds.sort();
			if ( typeof this.focusedFrameId === 'number' ) {
				if ( this.focusedFrameId === 0 ) {
					appFrameFnc ( { do: 'not-focus-app-title' } );
					if ( ! frameIds[0] ) {
						return null; }
					frameId = this.focusedFrameId = frameIds[0]
					frame = frames[frameId];
					let paneFnc = frame.frameFnc ( { do: 'focus' } );
					frame.frameFnc ( { do: 'z-top' } );
					return { frameFnc: 	frame.frameFnc,
							paneFnc:	paneFnc };
				}
				frameId = this.focusedFrameId;
				let i = frameIds.indexOf ( frameId );
				if ( i >= 0 ) {
					frames[frameId].frameFnc ( { do: 'not-focus' } ); 
					i++; }
				else {
					i = 0; }
				if ( frameIds[i] ) {
					frameId = this.focusedFrameId = frameIds[i]
					frame = frames[frameId];
					let paneFnc = frame.frameFnc ( { do: 'focus' } );
					frame.frameFnc ( { do: 'z-top' } );
					return { frameFnc: 	frame.frameFnc,
							paneFnc:	paneFnc };
				}
			}
			//	First focus on app title display its menu.
			appFrameFnc ( { do: 'focus-app-title' } );
			this.focusedFrameId = 0;	//	Indicates app title menu.
			return null;
		}	//	cycleFrameFocus()

		addFrame ( o ) {
			const sW = 'AppContent addFrame()';
			let fa: any [] = [];

			frames[o.frameId] = { type:		o.frameType,
								  frameFnc:	null,
								  iconSlot:	null };

			if ( o.frameType === 'dialog' ) {
				//	Frame is rendered by AppDialog.
				return; }

			frames[o.frameId].props = { hdrVisible:		o.hdrVisible,
									    ftrVisible:		o.ftrVisible,
									    frameName:		o.frameName,
									    frameType:		o.frameType,
									    frameId: 		o.frameId,
									    paneId:			o.paneId,
									    appFrameFnc: 	appFrameFnc, 
									    appContentFnc:	this.doAll,
									    left: 			o.style.left,
									    top:			o.style.top,
									    width: 			o.style.width,
									    height:			o.style.height,
									    iconized:		o.iconized,
									    clientFnc:		clientFnc };

			for ( var id in frames ) {
				fa.push ( frames[id] ); }

			aframes = fa;

		//	this.updateAppSizeDictator ( sW );
		//	Called after frameFnc is set.

			let self = this;
			tick().then ( () => {
				let focus = self.setFrameFocus ( o.frameId );
				appFrameFnc ( { do:		'set-focused-frame-fnc',
								focus:	focus } ); 
				clientFnc ( { do:	'set-state-changed',
							  what:	'frame-added' } ); 
				clientFnc ( { do:		'relayout-frames',
							  frameIds:	[o.frameId] } ); } );

			return o.frameId;
		}	//	addFrame()

		addFrames ( a: [any] ) {
			const sW = 'AppContent addFrames()';
			let props: any = null, fa: any [] = [];
			let frameIds: number [] = [];
			for ( let i = 0; i < a.length; i++ ) {
				let o = a[i];
				props = { hdrVisible:	o.hdrVisible,
						  ftrVisible:	o.ftrVisible,
						  frameName:	o.frameName,
						  frameType:	o.frameType,
						  frameId: 		o.frameId,
						  paneId:		o.paneId,
						  appFrameFnc: 	appFrameFnc, 
						  appContentFnc:	this.doAll,
						  left: 		o.style.left,
						  top:			o.style.top,
						  width: 		o.style.width,
						  height:		o.style.height,
						  iconized:		o.iconized,
						  clientFnc:	clientFnc };
				frames[o.frameId] = { frameFnc:	null,
									  iconSlot:	null,
									  props:	props };
				fa.push ( frames[o.frameId] );
				frameIds.push ( o.frameId );
			}	//	for ( ... )

			aframes = fa;

		//	this.updateAppSizeDictator ( sW );
		//	Called after frameFnc is set.

			tick().then ( () => {
				clientFnc ( { do:	'set-state-changed',
							  what:	'frame-added' } );
				clientFnc ( { do:		'relayout-frames',
							  frameIds:	frameIds } ); } );
		}	//	addFrames()

		destroyFrame ( o: any ) {
			const sW = 'AppContent destroyFrame()  frameId: ' + o.frameId;
			cmn.log ( sW );
			if ( (! cmn.isNumber ( o.frameId )) || (o.frameId <= 0) ) {
				if (   (typeof this.focusedFrameId !== 'number')
					|| (this.focusedFrameId <= 0) ) {
					return; } 
				o.frameId = this.focusedFrameId; }
			if ( o.frameId === this.focusedFrameId ) {
				this.focusedFrameId = null; }
			let frm  = frames[o.frameId];
			if ( frm.type === 'dialog' ) {
				delete frames[o.frameId];
				//	Frame is (was) rendered by AppDialog.
				appFrameFnc ( { do: 	'close-dlg' } );
				return; }
			let keys = Object.keys ( frames );
			let fa: any [] = [];
			keys.forEach ( frameId => {
				if ( Number.parseInt ( frameId ) === o.frameId ) {
					return; }
				fa.push ( frames[frameId] ); } );

			aframes = fa;

			this.updateAppSizeDictator ( sW );

			tick().then ( () => {
				cmn.log ( sW, ' deleting frames[' + o.frameId + '] ...' );
				delete frames[o.frameId];
				clientFnc ( { do:	'set-state-changed',
							  what:	'frame-destroyed' } ); } );
		}	//	destroyFrame()

		updateAppSizeDictator ( sW: string ) {
			if ( ! cmn.isFunction ( asdFnc ) ) {
				cmn.error ( sW, 'asdFnc is not set' );
				return null; }
			asdFnc ( { do:		'update',
					   frames:	aframes } );
			return null;
		} //	updateAppSizeDictator()

		doAll ( o: any ): any {
			let sW = 'paneless AppContent doAll() ' + o.do;
			if ( o.to ) {
				sW += ' to ' + o.to; }
		//	cmn.log ( sW );
			switch ( o.do ) {
				case ( 'e2e-clear-output' ): {
					this.e2eClearOutput ( o );
					return; }
				case ( 'e2e-set-output' ): {
					this.e2eSetOutput ( o );
					return; }
				case ( 'set-call-down' ): {
					if ( o.to === 'app-size-dictator' ) {
						asdFnc = o.asdFnc;
						return;
					}
					if ( o.to === 'frame' ) {
						let frame = frames[o.frameId];
						if ( ! frame ) {
							cmn.log ( sW, ' frame of frameId ' + o.frameId 
										+ ' not found' );
							return; }
						frame.frameFnc = o.frameFnc;
						this.updateAppSizeDictator ( sW );
						return;
					}
					if ( o.to === 'client-content' ) {
						let frame = frames[o.frameId];
						frame.frameFnc ( o )
						return;
					}
					cmn.log ( sW, 'ERROR set-call-down: unrecognized frame' )
					return; }
				case ( 'keyboard-key-down' ): {
					return this.keyDown ( o ); }
				case ( 'cycle-frame-focus' ): {
					return this.cycleFrameFocus(); }
				case ( 'set-frame-focus' ): {
					let focus = this.setFrameFocus ( o.frameId );
					appFrameFnc ( { do:			'set-focused-frame-fnc',
									frameAs:	o.frameAs,
									focus:		focus } );
					return; }
				case ( 'set-pane-focus' ): {
					return this.setPaneFocus ( o.frameId, o.paneId ); }
				case ( 'menu-dismiss' ): {
					if ( this.focusedFrameId === 0 ) {		// App title menu?
						this.focusedFrameId = null; }
					return; }
				case ( 'get-new-frame-id' ): {
					return { frameId:	getFrameId(),
							 paneId:	getPaneId() }; }
				case ( 'add-frame' ): {
					return this.addFrame ( o ); }
				case ( 'add-frames' ): {
					this.addFrames ( o.frames ); 
					return null; }
				case ( 'destroy-frame' ): {
					appFrameFnc ( { do:		'set-focused-frame-fnc',
									focus:	null } );
					this.destroyFrame ( o );
					return; }
				case ( 'get-empty-state' ): {
					let state = { lastFrameId: 	getLastFrameId(),
								  lastPaneId:	getLastPaneId(),
								  frames:		{} };
					return state; }
				case ( 'get-state' ): {
					let state = { lastFrameId: 	getLastFrameId(),
								  lastPaneId:	getLastPaneId(),
								  frames:		{} };
					for ( let frameId in frames ) {
						let frm = frames[frameId];
						state.frames[frameId] = {
							frame:		frm.frameFnc ( o ),
							iconSlot:	clone ( frm.iconSlot ) } }
					return state; }
				case ( 'set-state' ): {
					setLastFrameId ( o.state.lastFrameId );
					setLastPaneId ( o.state.lastPaneId );
					//	The rest is done by the app.
					return; }
				case ( 'clear' ): {
					if ( asdFnc ) {
						asdFnc ( { do: 'reset' } ); }
					frames = {};
					this.focusedFrameId = null;
					aframes = []; 
					return null; }
				case ( 'ensure-frame-z-is-top' ): {
					//	Put frame o.frameId last to be rendered.
					let i: number, j: number, fa = aframes;

					for ( i = 0; i < fa.length; i++ ) {
						if ( fa[i].props.frameId === o.frameId ) {
							break; } }
					if ( i >= fa.length ) {
						return; }
				//	cmn.log ( sW, ' ensure-frame-z-is-top i: ' + i );
					if ( i === fa.length - 1 ) {
						return;	}

					fa = [];

					for ( j = 0; j < aframes.length; j++ ) {
						if ( j === i ) {
							continue; }
						fa.push ( aframes[j] ); }
					fa.push ( aframes[i] )

					aframes = fa;
					return; }
				case ( 'extract-frame' ): {
					if ( ! frames[o.frameId] ) {
						cmn.error ( sW, 'frame not found' );
						return; }
					//	Take a from its current location in the DOM to, 
					//	probably, place it somewhere else (e.g., a help frame
					//	above the app screen).
					let i: number, j: number, fa = aframes;

					for ( i = 0; i < fa.length; i++ ) {
						if ( fa[i].props.frameId === o.frameId ) {
							break; } }
					if ( i >= fa.length ) {
						return null; }

	  				if ( this.focusedFrameId === o.frameId ) {
						this.focusedFrameId = 0; }

					delete frames[o.frameId];
					
	 				let frm = fa[i];		//	return it
					fa = [];

					for ( j = 0; j < aframes.length; j++ ) {
						if ( j === i ) {
							continue; }
						fa.push ( aframes[j] ); }

					aframes = fa;

					return frm; }
				case ( 'insert-frame' ): {
					let fa: any [] = [];
					aframes.forEach ( f => fa.push ( f ) );
					fa.push ( o.frame );
					frames[o.frame.props.frameId] = o.frame;
					aframes = fa;
					return; }
				case ( 'get-icon-slot' ): {
					let x = 20;
					let y = 20;
					let lookAgain = true;
					while ( lookAgain ) {
						lookAgain = false;
						for ( var id in frames ) {
							let frm = frames[id];
							if ( Number.parseInt ( id ) === o.frameId ) {
								if ( frm.iconSlot ) {
									return frm.iconSlot; 
								} 
							}
							if ( frm.iconSlot && (frm.iconSlot.y === y) ) {
								y += 95;	lookAgain = true;
								break; 
							}
						}	//	for ( ...
					}	//	while ( ...
					let iconSlot = {
						x: 		x,
						y:		y 
					};
					frames[o.frameId].iconSlot = iconSlot;
					return iconSlot; }
				case ( 'append-menu-items' ): {
					clientFnc ( o );
					return; }
				case ( 'menu-item' ): {
					clientFnc ( o );
					return; }
				case ( 'get-focused-frame-id' ): {
					return cmn.isNumber ( this.focusedFrameId ) 
								? this.focusedFrameId 
								: 0; }
				case ( 'update-app-size-dictator' ) : {
					return this.updateAppSizeDictator ( sW );
				}
				default:
					cmn.error ( sW, 'unrecognized do' );
			}	//	switch
		}   //  doAll()

    //  doAll ( o: any ): any {
	//		const sW = 'appConent this doAll()';
	//		console.log ( sW );
    //      return null;
    //  }
	};	//	class ClassAppContent

	let self = new ClassAppContent();

	onMount ( async() => {
		const sW = 'AppContent componentDidMount()';

		appFrameFnc ( { do: 	'set-call-down',
					    to:		'app-content',
					    fnc:	self.doAll } );
		clientFnc ( { do: 	'set-call-down',
					  to: 	'app-frame',
					  fnc:	appFrameFnc } );
		clientFnc ( { do: 		'set-call-down',
					  to: 		'app-content',
					  eleId:	eleId,
					  fnc:		self.doAll } );
	} )

</script>

<app-content id = { eleId }>
	<div class = "rr-mird-container">
		<span class = "rr-mird-span">
			<p> { profound1 } </p>
			<p> { profound2 } </p>
		</span>
	</div>
	<AppSizeDictator appContentFnc = { self.doAll } />
	{#each aframes as f ( f.props.frameId ) }
		<Frame {...f.props}/>
	{/each}
</app-content>


<style>
	/*  
	Absolute positioning elements within scrollable div 
	https://stackoverflow.com/questions/985134/absolute-positioning-elements-within-scrollable-div 
	*/
	app-content {
		user-select:		none;
		background-color:	white;
		
		border-top:     solid 1px lightsteelblue;
		border-bottom:  solid 1px lightsteelblue;

		/*  This   position: relative   affects child elements. */
		position:       relative;   /*  set child ps abs rltv to content div  */
		overflow:       auto;       /*  show scrolls when necessary           */
	}
	.rr-mird-container {
		text-align: 	center;
		position: 		absolute;
		width: 			100%;
	}
	.rr-mird-span {
		font-family:	verdana;
		font-size:		10px;
		font-weight:	normal;
/*		color:          steelblue;	*/
		color:			#4682b475;	/*	steelblue, 1/2 alpha				  */
		letter-spacing: normal;
		cursor:			default;
	}
	.rr-mird-span p {
		margin:			0px;
	}
</style>

