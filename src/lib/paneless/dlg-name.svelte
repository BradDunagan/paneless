<script lang="ts">

	import { onMount }			from 'svelte';
	import { cmn }		    	from './common';
	import NameNotIdentifier	from './name-not-identifier.svelte';

	export let prpAppFrameFnc	= null;
	export let prpUpFnc			= null;
	export let prpCtx			= null;
	

	function stringifyStyle ( style: any ): string {
		let s = '';
		for ( const p in style ) {
			s += p + ': ' + style[p] + '; '; };
		return s;
	}	//	stringifyStyle()

let	okDisabled = true;

let self = {

	state:	{
		styleMain: {
			width:          '350px',
		},
		styleMainString:	'',

		name:           '',
	},

	setGlobalActiveDialogFnc ( fnc ) {
		prpAppFrameFnc ( { do:	'set-call-down',
						   to:	'active-dialog',
						   fnc:	fnc } );
	},	//	setGlobalActiveDialogFnc()

	keyDown ( ev ) {
		let sW = 'DlgName keyDown()';
	//	cmn.log ( sW, '  ' + ev.key );
		let i;
		if ( ev.key === 'Enter' ) {
			if ( okDisabled ) {
				return false; }
			self.clickOK();
			return true; }
		if ( ev.key === 'Escape' ) {
			self.clickCancel();
			return true; }
		return false;
	},	//	keyDown()

	clickCancel() {
		cmn.log ( 'DlgName clickCancel()' );
		self.setGlobalActiveDialogFnc ( null );
		prpAppFrameFnc ( { do: 'close-dlg' } );
	},

	clickOK() {
		cmn.log ( 'DlgName clickOK()' );
		self.setGlobalActiveDialogFnc ( null );
		prpAppFrameFnc ( { do: 'close-dlg' } );
		prpUpFnc ( { 
			do:   prpCtx.after ? prpCtx.after 
									   : 'ok-record-name',
			ctx:  prpCtx,
			name: self.state.name } );
	},

	doAll ( o ) {
		if ( o.do === 'invalid' ) {
			okDisabled	= true;
			self.state.name 		= '';
		} else
		if ( o.do === 'valid' ) {
			okDisabled	= false;
			self.state.name 		= o.name;
		}
	//	if ( o.do === 'keyboard-escape' ) {
	//		self.setGlobalActiveDialogFnc ( null );
	//		prpAppFrameFnc ( { do: 'close-dlg' } );
	//		return;
	//	}
		if ( o.do === 'keyboard-key-down' ) {
			return self.keyDown ( o.ev );
		}
	},

};	//	self

	self.state.styleMainString = stringifyStyle ( self.state.styleMain );

	onMount ( () => {
		const sW = 'paneless DlgName onMount()'
		self.setGlobalActiveDialogFnc ( self.doAll );
		//  Set focus on the name editor.
		const selector = '.dlg-name-dlg .dlg-name-input';
		let ele: any = document.querySelectorAll ( selector );
		if ( ele.length < 1 ) {
			cmn.log ( sW, ' ERROR: name element not found' );
			return; }
		if ( ele.length > 1 ) {
			cmn.log ( sW, ' ERROR: multiple name elements' );
			return; }
		ele[0].focus();
	} )	//  onMount()

</script>

<dlg-name>

	<div class = "dlg-name-dlg"
			style = {self.state.styleMainString}>
		<div class = "dlg-name-main">
			<div class = "dlg-name-title">
				{prpCtx.title ? prpCtx.title 
										: 'Name Record'}
			</div>

			<NameNotIdentifier prpDlg 		= { self.doAll }
							   prpLabel		= { prpCtx.nameLabel }
							   prpCurText	= { prpCtx.curName } />
			<div class = "dlg-name-buttons-container">
					<button style = { "visibility: hidden;" }>
					nothing
				</button>
				<button class = "general-button"
						disabled = { okDisabled }
						on:click = { self.clickOK } >
					OK
				</button>
				<button class = "general-button"
						on:click = { self.clickCancel }>
					Cancel
				</button>
			</div>
		</div>
	</div>
</dlg-name>

<style>

	.dlg-name-dlg {
		display:            flex;
		flex-direction:     row;
		height:             135px;
		border:             solid 1px black;
		background-color:   white;
	}

	.dlg-name-main {
		flex:               1 1 auto;
	/*	height:             400px;			*/
		width:              350px;
	}

	.dlg-name-title {
		position:           relative;
		left:               45px;
		top:                7px;
		width:              260px;
		height:             36px;
		font-size:          18px;
		text-align:         center;
	}

	.dlg-name-buttons-container {
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

	.general-button {
		font-family:        Verdana; 		/*	sans-serif, 'Roboto';			*/
		font-size:          10px;
		color:				black;
		background:         white;
		border-style:       solid;
		border-width:       1px;
		border-color:       gray;
		padding:            2px 8px 3px 8px;
		min-width:          60px;    
	}

</style>
