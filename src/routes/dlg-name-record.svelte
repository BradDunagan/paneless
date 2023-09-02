<script lang="ts">

/*
         1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/
	import { beforeUpdate, tick }		from 'svelte';

	import { cmn }		from '$lib/paneless/common';
	import RecordList   from './record-list.svelte';
	import RecordName   from './record-name.svelte';
	import { db }		from './db';

	export let prpFrameId			= 0;
	export let prpPaneId			= 0;
	export let prpAppFrameFnc: any	= null;
	export let prpRecType			= null;
	export let prpCtx				= null;
	export let prpTitle				= '';

let okDisabled				= true;
let styleMainString			= '';
let okStyleString			= '';
let styleRightSideString	= '';

class ClassDlgNameRecord {

	state:	{
		styleMain:				any;
		hRec:					number;
		recId:					number;
		name:					string;
		okStyle:				any;
		showingNotes:			boolean;
		notesText:				string;
		styleRightSide:			any;
	}

	listFnc:		any;
	nameFnc:		any;

	constructor() {
		this.state = {
			styleMain: {
				width:          '350px',
			},
			hRec:					0,
			recId:					0,
			name:           		'',
			okStyle: 				{ color:	'lightgray' },
			showingNotes:   		false,
			notesText:      		'Notes',
			styleRightSide: 		{ display:	'none' },
		};
		this.listFnc = null;
		this.nameFnc = null;

		this.setGlobalActiveDialogFnc =
			this.setGlobalActiveDialogFnc.bind ( this );

		this.keyDown		= this.keyDown.bind ( this );
		this.doAll			= this.doAll.bind ( this );
		this.clickNotes		= this.clickNotes.bind ( this );
		this.clickCancel	= this.clickCancel.bind ( this );
		this.clickOK		= this.clickOK.bind ( this );
	}

	setGlobalActiveDialogFnc ( fnc ) {
		prpAppFrameFnc ( { do:	'set-call-down',
						   to:	'active-dialog',
						   fnc:	fnc } );
	}	//	setGlobalActiveDialogFnc()

	provideList ( o ) {
		const sW = 'DlgNameRecord provideList()';
		cmn.log ( sW );
		if ( ! this.listFnc ) {
			cmn.error ( sW, 'this.listFnc is null' );
			return; }
		if ( ! db ) {
			cmn.error ( sW, 'db is null' );
			return; }

		let self = this;

		function filter ( d ) {
			return d.type === prpRecType;	
		}
		db.allData ( filter ).then ( list => {

			self.listFnc ( { do: 'load', list: list } );

		} ).catch ( err => {
			cmn.error ( sW, err.message );
		} );
	}	//	provideList()

	keyDown ( o ) {
		let sW = 'DlgNameRecord keyDown()';
		if ( o.ev.altKey ) {
			sW += ' alt' }
		sW += ' ' + o.ev.key;
	//	cmn.log ( sW );

		if ( o.ev.key === 'Enter' ) {
			if ( ! okDisabled ) {
				this.clickOK();	}
			return true; }

		if ( o.ev.key === 'Escape' ) {
			this.clickCancel();
			return true; }

		if ( ! this.listFnc ) {
			return false; }

		if ( o.ev.key === 'ArrowUp' ) {
			return this.listFnc ( o ); }

		if ( o.ev.key === 'ArrowDown' ) {
			return this.listFnc ( o ); }

		return false;
	}	//	keyDown()

	doAll ( o ) {
		if ( o.do === 'identify' ) {
			return { name:		'DlgNameRecord',
					 fnc:		this.doAll,
					 frameId:	prpFrameId,
					 paneId:	prpPaneId }; }
		if ( o.do === 'set-call-down' ) {
			if ( o.to === 'record-name' ) {
				this.nameFnc = o.fnc;
				return;	}
			if ( o.to === 'RecordList' ) {
				this.listFnc = o.fnc;
				return; }
			return; }
		if ( o.do === 'provide-list' ) {
			return this.provideList ( o ); }
		if ( o.do === 'keyboard-key-down' ) {
			return this.keyDown ( o ); }
		if ( o.do === 'invalid' ) {
			this.state.okStyle		= { color: 'lightgray' };
			this.state.name			= ''; 
			okDisabled		= true;
			okStyleString	= cmn.stringifyStyle ( this.state.okStyle );
			tick(); }
		else
		if ( o.do === 'valid' ) {
			if ( prpCtx.after === 'new-unique-name' ) {
				if ( ! this.listFnc ( { do:		'is-unique-name',
										name:	o.name } ) ) {
					this.nameFnc ( { do: 	'set-error',
									 msg:	'new name must be unique' } );
					return; } }
			let recId = this.state.recId;
			if ( this.state.name !== o.name ) {
				recId = 0; }
			this.state.okStyle		= { color: 'black' };
			this.state.recId		= recId;
			this.state.name			= o.name;
			okDisabled		= false;
			okStyleString	= cmn.stringifyStyle ( this.state.okStyle );
			tick(); }
		else
		if ( o.do === 'record-selected' ) {
			if ( prpCtx.after === 'new-unique-name' ) {
				this.nameFnc ( { do: 	'set-error',
								 msg:	'new name must be unique' } );
				return; }
			if ( o.recId ) {
				this.state.okStyle		= { color: 'black' };
				this.state.hRec			= o.hRec;
				this.state.recId		= o.recId;
				this.state.name			= o.recName;
				okDisabled		= false;
				okStyleString	= cmn.stringifyStyle ( this.state.okStyle );  
				tick();
				if ( this.nameFnc ) {
					this.nameFnc ( { do: 'set-name', name: o.recName} ); } } 
			else {
				this.state.okStyle		= { color: 'lightgray' };
				this.state.hRec			= 0;
				this.state.recId		= 0;
				this.state.name			= '';
				okDisabled		= true;
				okStyleString	= cmn.stringifyStyle ( this.state.okStyle );  
				tick();
				if ( this.nameFnc ) {
					this.nameFnc ( { do: 'set-name', name: '' } ); } } 
		}
	}	//	doAll()

	clickNotes() {
		cmn.log ( 'DlgNameRecord clickNotes()' );
		if ( ! this.state.showingNotes ) {
			this.state.styleMain		= { width: '550px' };
			this.state.notesText		= 'Hide Notes';
			this.state.showingNotes		= true;
			this.state.styleRightSide	= { display: 'block' };
		} else {
			this.state.styleMain		= { width: '350px' };
			this.state.notesText		= 'Notes';
			this.state.showingNotes		= false;
			this.state.styleRightSide	= { display: 'none' };
		}

		styleMainString = cmn.stringifyStyle ( this.state.styleMain );
		styleRightSideString = cmn.stringifyStyle ( this.state.styleRightSide );  
	}

	clickCancel() {
		cmn.log ( 'DlgNameRecord clickCancel()' );
		this.setGlobalActiveDialogFnc ( null );
		prpAppFrameFnc ( { do: 'close-dlg' } );
	}

	clickOK() {
		cmn.log ( 'DlgNameRecord clickOK()' );
		this.setGlobalActiveDialogFnc ( null );
		prpAppFrameFnc ( { do: 'close-dlg' } );
		if ( prpCtx.after === 'new-unique-name' ) {
			prpCtx.fnc ( { do:		'ok-new',
								   ctx:		prpCtx,
								   recName:	this.state.name } );
			return; }
		if ( 	(prpCtx.after === 'save')
			 || (prpCtx.after === 'type') ) {
			prpCtx.fnc ( { do:		'ok-record-name',
								   ctx:		prpCtx,
								   recName:	this.state.name,
								   hRec:	this.state.hRec,
								   recId:	this.state.recId } );
			return; }
		if ( prpCtx.after === 'load' ) {
			//	Assuming using only IDB. Thus id.
			prpCtx.fnc ( { do: 		'ok-load',
								   ctx:		prpCtx,
								   recName:	this.state.name, 
								   hRec:	this.state.hRec,
								   recId:	this.state.recId } );
			return; }
	}

}	//	ClassDlgNameRecord

	let self		= new ClassDlgNameRecord();

	let show_name	= false;

	styleMainString = cmn.stringifyStyle ( self.state.styleMain );
	okStyleString = cmn.stringifyStyle ( self.state.okStyle ); 
	styleRightSideString = cmn.stringifyStyle ( self.state.styleRightSide );

	beforeUpdate ( () => {
		show_name =	   (prpCtx.after === 'new-unique-name')
					|| (prpCtx.after === 'save')
					|| (prpCtx.after === 'type');
	} )	//	beforeUpdate()

</script>

<dlg-name-record>

	<div class = "rr-pe-dlg-name-record"
		 style = { styleMainString }>
		<div class = "rr-pe-dlg-name-main">
			<div class = "rr-pe-dlg-name-notes">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<span class = "rr-app-click-text"
						on:click = { self.clickNotes }>
					{ self.state.notesText }
				</span>
			</div>
			<div class = "rr-pe-dlg-name-title">
				{ prpTitle ? prpTitle : 'Record' }
			</div>

			<div class = "rr-pe-dlg-names-current">
				Names of Current Records
			</div>
			<RecordList prpHeight = { show_name ? "130px" : "160px" }
						prpDlg = { self.doAll } /> 
			<RecordName prpDlg = {self.doAll}
						prpStyle = { { 
							display:  (show_name ? "flex" : "none") } } 
						prpInitialValue = '' />	

			<div class = "rr-pe-dlg-name-buttons-container">
				<button style = "visibility: hidden" >
					nothing
				</button>
				{#if okDisabled}
					<button class = "rr-general-button"
							style = { okStyleString }
							disabled
							on:click = { self.clickOK } >
						OK
					</button>
				{:else}
					<button class = "rr-general-button"
							style = { okStyleString }
							on:click = { self.clickOK } >
						OK
					</button>
				{/if}
				<button class = "rr-general-button"
						on:click = { self.clickCancel } >
					Cancel
				</button>
			</div>
		</div>
		<div class = "rr-pe-dlg-name-right-side"
			 style = { styleRightSideString }>
			<p>Description of selected record.</p>
		</div>
	</div>

</dlg-name-record>

<style>

	.rr-pe-dlg-name-record {
		display:            flex;
		flex-direction:     row;
		height:             295px;
		border:             solid 1px black;
		background-color:   white;
	}

	.rr-pe-dlg-name-main {
		flex:               1 1 auto;
		height:             400px;
		width:              350px;
	}

	.rr-pe-dlg-name-notes {
		height:             10px;
		font-size:          10px;
		text-align:         right;
		padding-right:      5px;
		cursor:             pointer;
	}

	.rr-pe-dlg-name-title {
		position:           relative;
		left:               45px;
		top:                7px;
		width:              260px;
		height:             36px;
		font-size:          18px;
		text-align:         center;
		cursor:				default;
	}

	.rr-pe-dlg-names-current {
		position:           relative;
		left:               45px;
		top:                0px;
		width:              260px;
		height:             15px;
		text-align:         left;
	}

	/*  These are similar to sign-in's, dlg-select's. */
	.rr-pe-dlg-name-buttons-container {
		display:            flex;
		flex-direction:     row;
		position:           relative;
		left:               45px;
		top:                20px;
		width:              260px;
		height:             26px;
		justify-content:    space-between;  /*  main-axis                       */
		align-items:        center;         /*  cross-axis                      */
	}

	.rr-pe-dlg-name-right-side {
		flex:               1 1 auto;
		height:             400px;
		width:              200px;
		padding-top:        10px;
		padding-left:       10px;
		padding-right:      5px;
	}

</style>
