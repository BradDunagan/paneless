
<script lang="ts">
	import { onMount }		from 'svelte';
	import { cmn }		    from './common';
	import AppHeader		from './app-header.svelte';
	import AppContent		from './app-content.svelte';
	import AppFooter		from './app-footer.svelte';	
	import AppDialog 		from './app-dialog.svelte';
	import { appStatus }	from './stores';
	import type { Item }	from './interfaces';

	export let appTitle: null | string = null;
//	export let groupName: null | string = null;
//	export let onClickGroup: null;
	export let items: Item[] = [];
	export let onClickTitle: (e: any) => void;

	export let profound1: string = '';
	export let profound2: string = '';

	export let clientFnc: ( o: any ) => void;

let appDialog: any [] = [];

class ClassAppFrame {

	dlgList:	any [];

	appContentFnc:		any;
	activeMenuFnc: 		any;
	activeDialogFnc:	any;
	focusedFrameFnc:	any;
	focusedPaneFnc:		any;
	focusedFrameAs:		any;

	frameMoving: {
		moverMouseDown: 	boolean;
		frameFnc:			any;
		startX: 			number;	
		startY: 			number;	
	};

	frameSizing: {
		sizerMouseDown: 	boolean;
		frameFnc:			any;
		startX: 			number;
		startY: 			number;	
	};

	constructor() {

		this.dlgList		= [];
		
		this.appContentFnc		= null;
		this.activeMenuFnc		= null;
		this.activeDialogFnc	= null;
		this.focusedFrameFnc	= null;
		this.focusedPaneFnc		= null;
		this.focusedFrameAs		= null;

		this.frameMoving	= {
			moverMouseDown: 	false,
			frameFnc:			null,
			startX: 			0,
			startY: 			0
		};

		this.frameSizing	= {
			sizerMouseDown: 	false,
			frameFnc:			null,
			startX: 			0,
			startY: 			0
		};

		this.mouseMove	= this.mouseMove.bind ( this );
		this.mouseUp	= this.mouseUp.bind ( this );
		this.doAll		= this.doAll.bind ( this );
	}

	keyDown ( ev: any ) {
		let sW = 'paneless AppFrame keyDown()';

		if ( 	cmn.isUndefined ( ev.key )
			 && cmn.isUndefined ( ev.ctrlKey )
			 && cmn.isUndefined ( ev.altKey ) ) {
			return; }

		if ( ev.key === 'F1' ) {		//	Docs/Help?
			ev.preventDefault();
			//	For now, "global" help frame/pane. Later, if the active
			//	(in focus) frame has a help pane then set focus there.
			clientFnc ( { do: 'click-help' } );
			return; }

		if ( 	this.activeMenuFnc 
			 && this.activeMenuFnc ( { do: 'keyboard-key-down', ev: ev } ) ) {
			return; }

		if ( 	this.activeDialogFnc 
			 && this.activeDialogFnc ( { do: 'keyboard-key-down', ev: ev } ) ) {
			return; }

		if (    this.focusedPaneFnc 
			 && this.focusedPaneFnc ( { do: 'keyboard-key-down', ev: ev } ) ) {
			cmn.log ( sW, 'pane got it' );
			ev.preventDefault();
			return; }

		if (    this.appContentFnc
			 && this.appContentFnc ( { do: 'keyboard-key-down', ev: ev } ) ) {
			return; }

	//	if ( ev.ctrlKey ) {
	//		cmn.log ( sW, ' ctrl ' + ev.key ); }

	//	if ( ev.altKey ) {
	//		cmn.log ( sW, ' alt ' + ev.key ); }

		//	Alt-F 	cycle focus on frames and the app title menu.
		//	Alt-P 	cycle focus on panes within a frame.
		//	Alt-B 	show burger menu. First focused pane's then a second
		//			alt-B to show the focused frame's.
		//	Alt-T 	cycle tabs (if the focused pane is that of a tab). 
		if ( ev.altKey ) {
	//		cmn.log ( sW, ' shift ' + ev.key ); 
	//		cmn.log ( sW, ' alt ' + ev.key ); 
	//		if ( ev.key === 'Tab' ) {

			if ( ev.key === 'Enter' ) {
				cmn.log ( sW, ' alt ' + ev.key );
				ev.preventDefault();
				ev.stopPropagation();
				return; }

			let key = ev.key.toUpperCase();
			while ( key === 'F' ) {
				ev.preventDefault();
				if ( this.focusedFrameAs === 'dialog' ) {
					break; }
				//	If menu and not app title menu then close it.
				if ( 	this.activeMenuFnc 
					 && ! this.activeMenuFnc ( { do: 'is-app-title-menu' } ) ) {
					this.activeMenuFnc ( { do: 'keyboard-escape' } ); }
				//	Focus on next frame. Or show the app title menu.
				let focus = this.appContentFnc ( { do: 'cycle-frame-focus' } );
				if ( focus ) {
					this.focusedFrameFnc = focus.frameFnc;
					this.focusedPaneFnc  = focus.paneFnc; }
				else {
					this.focusedFrameFnc = null;
					this.focusedPaneFnc  = null; }
				return; } 
			if ( key === 'P' ) {
				if ( typeof this.focusedFrameFnc === 'function' ) {
					this.focusedPaneFnc = this.focusedFrameFnc ( 
						{ do: 'cycle-pane-focus' } ); }
				return; }
			if ( key === 'B' ) {
				if ( typeof this.focusedFrameFnc === 'function' ) {
					this.focusedFrameFnc ( { do: 'key-burger-menu' } ); }
				return; }
			if ( key === 'T' ) {
				if ( typeof this.focusedPaneFnc === 'function' ) {
					let x = this.focusedPaneFnc ( { do: 'cycle-tab-focus' } ); 
					if ( ! x ) {
						this.focusedPaneFnc = null; 
						return; }
					if ( typeof x === 'function' ) {
						this.focusedPaneFnc = x;
						return; }
					//	assume its a promise
					this.focusedPaneFnc = null;
					x.then ( ( fnc: any ) => {
						this.focusedPaneFnc = fnc;
					} )
					.catch ( ( err: any ) => { 
						cmn.log ( sW, ' error: ' + err.message );
					} ); 
				return; } }
		}

		if ( ev.key === 'Escape' ) {
			if ( this.activeMenuFnc ) {
				this.activeMenuFnc ( { do: 'keyboard-escape' } );
				return;
			}
		}
	}	//	keyDown()

	keyUp ( ev ) {
		let sW = 'AppFrame keyUp()';
		if ( ev.altKey ) {
			if ( ev.key === 'Enter' ) {
				cmn.log ( sW, ' alt ' + ev.key );
				ev.preventDefault();
				ev.stopPropagation();
				return; }
		}
	}	//	keyUp()

	mouseMove ( ev ) {
		let sW = 'mouseMove()';
	//	cmn.log ( sW );
		if ( this.frameMoving.moverMouseDown ) {
			this.frameMoving.frameFnc ( { do: 	'move',
										  dX:	ev.pageX - this.frameMoving.startX,
										  dY:	ev.pageY - this.frameMoving.startY } );
			ev.preventDefault();
			return;	}
		if ( this.frameSizing.sizerMouseDown ) {
			this.frameSizing.frameFnc ( { do: 	'size',
										  dX:	ev.pageX - this.frameSizing.startX,
										  dY:	ev.pageY - this.frameSizing.startY,
										  visitedPanes:	{} } );
			ev.preventDefault();
			return;	}
	}	//	mouseMove()

	mouseUp ( ev ) {
		let sW = 'mouseUp()';
	//	cmn.log ( sW );
		if ( this.frameMoving.moverMouseDown ) {
			this.frameMoving.moverMouseDown	= false;
			this.frameMoving.frameFnc		= null;
			clientFnc ( { do: 'set-state-changed' } );
			return;	}
		if ( this.frameSizing.sizerMouseDown ) {
			this.frameSizing.sizerMouseDown	= false;
			this.frameSizing.frameFnc		= null;
			this.appContentFnc ( { do: 'update-app-size-dictator' } );
			clientFnc ( { do: 'set-state-changed' } );
			return;	}
	}	//	mouseUp()

	updateDialogState() {
		clientFnc ( { do:		'set-state-menu-or-dialog',
					  depth:	this.dlgList.length } );
		let self = this;
		appDialog = self.dlgList.map ( ( r, i ) => {
			if ( r.dlg === 'app-dialog-frame' ) {
			//	return ( <AppDialog key 		  = { i }
			//						appFrameFnc   = { this.doAll }
			//						appContentFnc = { this.appContentFnc }
			//						clientFnc	  = { this.props.clientFnc }
			//						frameType	  = { r.frameType }
			//						frame 		  = { r.frame } /> );
				return { key:	i,
						 props:	{ prpAppFrameFnc:	self.doAll,
								  prpAppContentFnc:	self.appContentFnc,
								  prpClientFnc:		clientFnc,
								  prpFrame:			r.frame,
								  prpOtherData:		r.otherData } };
			}
			if ( r.dlg === 'app-dialog' ) {
			//	return ( <AppDialog key 		= { i }
			//						appFrameFnc = { this.doAll }
			//						comp 		= { r.comp }
			//						screenClass	= { r.screenClass } /> );
				return { key:	i,
						 props:	{ prpAppFrameFnc:	self.doAll,
						 		  prpComp:			r.comp,
								  prpScreenClass:	r.screenClass } };
			}
			if ( ! r.mnu ) {
			//	return ( <AppDialog key = {i}
			//						appFrameFnc = {this.doAll}
			//						upFnc = {r.upFnc}
			//						ctx = {r.ctx}
			//						dlg = {r.dlg}
			//						mnu = {r.mnu} /> );
				return { key:	i,
						 props:	{ prpAppFrameFnc:	self.doAll,
								  prpUpFnc:			r.upFnc,
						  		  prpCtx:			r.ctx,
								  prpDlg:			r.dlg,
								  prpMnu:			r.mnu  } };
			} else {
				return { key:	i,
						 props:	{ prpAppFrameFnc:	self.doAll,
								  prpDlg:			r.dlg,
								  prpMnu:			r.mnu } };
			}
		} );
	}	//	updateDialogState()

	doAll ( o ) {
		let sW = 'paneless AppFrame doAll() ' + o.do;
		if ( o.to ) {
			sW += ' to ' + o.to; }
	//	cmn.log ( sW );
	switch ( o.do ) {
		case ( 'set-call-down' ): {
			if ( o.to === 'app-content' ) {
				this.appContentFnc = o.fnc; 
				return; }
			if ( o.to === 'active-menu' ) {
				let prevGAMF = this.activeMenuFnc;	//	Global Active Menu Func
				this.activeMenuFnc = o.fnc;
				return prevGAMF; }
			if ( o.to === 'active-dialog' ) {
				this.activeDialogFnc = o.fnc;
				return; }
			return;
		}
		case ( 'focus-app-title' ): {
			clientFnc ( o );
			return;
		}
		case ( 'get-active-menu' ): {
			return this.activeMenuFnc;
		}
		case ( 'not-focus-app-title' ): {
			if ( this.activeMenuFnc ) {
				this.activeMenuFnc ( { do: 'keyboard-escape' } ); }
			return;
		}
		case ( 'move-frame' ): {
			this.frameMoving.moverMouseDown	= true;
			this.frameMoving.frameFnc 		= o.frameFnc;
			this.frameMoving.startX			= o.ev.pageX;
			this.frameMoving.startY			= o.ev.pageY;
			return;
		}
		case ( 'size-frame' ): {
			this.frameSizing.sizerMouseDown	= true;
			this.frameSizing.frameFnc 		= o.frameFnc;
			this.frameSizing.startX			= o.ev.pageX;
			this.frameSizing.startY 		= o.ev.pageY;
			return;
		}
	//	case ( 'show-sign-in-dlg' ): {
	//		this.dlgList.push ( { dlg: 		'sign-in',
	//							  upFnc: 	this.doAll,
	//							  ctx: 		null } );
	//		this.updateDialogState();
	//		return;
	//	}
		case ( 'show-name-dlg' ): {
			this.dlgList.push ( { dlg: 		'dlg-name',
								  upFnc: 	o.upFnc,
								  ctx: 		o.ctx } );
			this.updateDialogState();
			return;
		}
		case ( 'app-dialog' ): {
			this.dlgList.push ( { dlg: 			'app-dialog',
								  comp:			o.dlgComp,
								  screenClass:	o.screenClass } );
			this.updateDialogState();
			return;
		}
		case ( 'app-dialog-frame' ): {
			this.dlgList.push ( { dlg:			'app-dialog-frame',
								  frame:		o.frame,
								  frameType:	o.frameType, 
								  otherData:	o.otherData } );
			this.updateDialogState();
			return;
		}
		case ( 'show-menu' ): {
			this.dlgList.push ( { dlg: 		'menu',
								  mnu:		o } );
			this.updateDialogState();
			return;
		}
		case ( 'menu-dismiss' ): {
			if ( this.activeMenuFnc ) {
				this.activeMenuFnc ( { do: 'being-dismissed' } ); }
			this.dlgList.pop();
			this.updateDialogState();
			this.activeMenuFnc = null;
			this.appContentFnc ( o );
			return;
		}
		case ( 'close-dlg' ): {
			this.dlgList.pop();
			this.updateDialogState();
			this.activeDialogFnc = null;
			return;
		}
		case ( 'set-focused-frame-fnc' ): {
			if ( o.focus ) {
				this.focusedFrameAs	  = o.frameAs;
				this.focusedFrameFnc  = o.focus.frameFnc;
				this.focusedPaneFnc   = o.focus.paneFnc; }
			else {
				this.focusedFrameAs   = null;
				this.focusedFrameFnc  = null;
				this.focusedPaneFnc   = null; }
			return;			
		}
		default:
			cmn.error ( sW, 'unrecognized do - "' + o.do + '"' );
	}	//	switch
	}	//	doAll()

};	//	class	ClassAppFrame

	let self = new ClassAppFrame();

	onMount ( () => {
		appStatus.set ( 'no status yet' );
		document.addEventListener ( 'keydown', self.keyDown );
		document.addEventListener ( 'keydown', self.keyUp );
	} )

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<app-frame
	on:mousemove	= { self.mouseMove } 
	on:mouseup 		= { self.mouseUp } >
	<AppHeader
		prpClientFnc		= { clientFnc }
		appTitle			= { appTitle ? appTitle : 'App Title' }
		items 				= { items }
		onClickTitle		= { onClickTitle }
	/>
	<AppContent 
		profound1	= { profound1 }
		profound2	= { profound2 } 
		clientFnc 	= { clientFnc }
		appFrameFnc	= { self.doAll }
	/>
	<AppFooter />
	{#each appDialog as d ( d.key ) }
		<AppDialog { ...d.props }/>
	{/each}
</app-frame>


<style>

	app-frame {            /*  Should fill the browser window without  */
		display:            grid;   /*  showing scroll bars.                    */
		grid-template-rows:	24px auto 24px;
		width:              100%;
		height:             100%;
		margin:             0px;
		font-family:		Verdana, Geneva, Tahoma, sans-serif;
		font-size: 			12px;
	}

</style>

