<script lang="ts">

	import { tick, onMount, beforeUpdate }			from 'svelte';
	import { cmn }					from '$lib/paneless/common';

	export let prpFrameId			= 0;
	export let prpPaneId			= 0;
	export let prpDlg				= null;
	export let prpStyle				= {};
	export let prpInitialValue		= '';
	export let prpName				= '';
	export let prpDisplay			= null; 
	export let prpWidth				= null;
	export let prpPosition			= null;
	export let prpLeft				= null;
	export let prpTop				= null;
	export let prpPaddingTop		= null;
	export let prpLabelInputWidth	= null;
	export let prpLabelFlex			= null;
	export let prpInputFlex			= null;
	export let prpInputWidth		= null;

class ClassRecordName {

	state:		any;

	constructor() {
		this.state = {
			value:			prpInitialValue,
			errorText:		'',
		};
		this.validate 	= this.validate.bind ( this );
		this.error 		= this.error.bind ( this );
		this.valid 		= this.valid.bind ( this );
		this.keypress 	= this.keypress.bind ( this );
		this.checkName 	= this.checkName.bind ( this );
		this.change 	= this.change.bind ( this );
		this.input 		= this.input.bind ( this );
		this.doAll		= this.doAll.bind ( this );
	}

	validate ( name ) {
		if ( name.length === 0 ) {
			this.error ( '' );
			return;
		}
		if ( name.match ( /\s/ ) ) {
			this.error ( 'Space, tab and the like are not allowed.' );
			return;
		}
		if ( name[0].match ( /\d/ ) ) {
			this.error ( 'First character may not be a digit.' );
			return;
		}
		if ( ! name[0].match ( /[A-Za-z]/ ) ) {
			this.error ( 'First character must be A-Z or a-z.' );
			return;
		}
		if ( name.match ( /[^A-Za-z0-9_]/ ) ) {
			this.error ( 'Valid characters: A-Z, a-z, digits, _.' );
			return;
		}

		//	Do not check for name being used already.  Multiple records with 
		//	the same name is allowed.  
		this.valid ( name );
	}	//	validate()

	error ( msg ) {
		this.state.errorText = msg;
		prpDlg ( { do: 'invalid', comp: prpName } );
	}

	valid ( name ) {
		this.state.errorText = '';
		prpDlg ( { do: 'valid', comp: prpName,
								name: name } );
	}

	keypress ( e ) {
	//  cmn.log ( 'keypress() ' + e.key );
	}

	checkName ( name: string ) {
		this.state.value = name;
		let self = this;
		tick().then ( () => {
			self.validate ( name );
		} );
	}	//	checkName()

	change ( e ) {
		const sW = 'RecordName change()';
	//  cmn.log ( sW, 'change() ' + e.target.value );
	//	let name = e.target.value;
	//	this.state.value = name;
	//	let self = this;
	//	tick().then ( () => {
	//		self.validate ( name );
	//	} );
		this.checkName ( e.target.value );
	}	//	change()

	input ( e ) {
		const sW = 'RecordName input()';
	//	cmn.log ( sW, 'input() ' + e.target.value );
		this.checkName ( e.target.value );
	}	//	input()

	doAll ( o ) {
		const sW = 'RecordName doAll() do: ' + o.do;
		if ( o.do === 'identify' ) {
			return { name:		'RecordName',
					 fnc:		this.doAll,
					 frameId:	prpFrameId,
					 paneId:	prpPaneId }; }
		if ( o.do === 'set-name' ) {
			this.state.value = o.name;
			let self = this;
			tick().then ( () => {
				self.validate ( o.name );
			} );
			return; }
		if ( o.do === 'set-error' ) {
			this.error ( o.msg );
			return; }
		cmn.error ( sW, 'unrecognized do' );
	}	//	doAll()

}   //  ClassRecordName

	let self = new ClassRecordName();

	let	styleString				= '';
	let	labelInputStyleString	= '';
	let	labelStyleString		= '';
	let	inputStyleString		= '';

	onMount ( () => {
		prpDlg ( { do:        'set-call-down',
				   to:        'record-name',
				   comp:	  prpName,
				   fnc:       self.doAll } );
	} )	//	onMount()

	beforeUpdate ( () => {
		let style:any = {};
		if ( prpStyle ) {
			style = prpStyle; }
		if ( prpDisplay ) {
			style.display = prpDisplay; }
		if ( prpWidth ) {
			style.width = prpWidth; }
		if ( prpPosition ) {
			style.position = prpPosition; }
		if ( prpLeft ) {
			style.left = prpLeft; }
		if ( prpTop ) {
			style.top = prpTop; }
		if ( prpPaddingTop ) {
			style['padding-top'] = prpPaddingTop; }
		styleString = cmn.stringifyStyle ( style );
		
		let labelInputStyle:any = {};
		if ( prpLabelInputWidth ) {
			labelInputStyle.width = prpLabelInputWidth; }
		labelInputStyleString = cmn.stringifyStyle ( labelInputStyle );

		let labelStyle:any = {};
		if ( prpLabelFlex ) {
			labelStyle.flex = prpLabelFlex; }
		labelStyleString = cmn.stringifyStyle ( labelStyle );

		let	inputStyle:any = {};
		if ( prpInputFlex ) {
			inputStyle.flex = prpInputFlex; }
		if ( prpInputWidth ) {
			inputStyle.width = prpInputWidth; }
		inputStyleString = cmn.stringifyStyle ( inputStyle );
	} )	//	beforeUpdate()

</script>

<record-name class = "rr-pe-dlg-name-container"
		 	 style = { styleString } > 
	<div style = { labelInputStyleString }
			class = "rr-app-label-input">
		<div style = { labelStyleString }
				class = "rr-pe-dlg-name-label">
			Name:
		</div>
		<input style		= { inputStyleString }
				class		= "rr-pe-dlg-name-input"
				value		= { self.state.value }
				spellCheck	= { false }
				on:keypress	= { self.keypress }
				on:change	= { self.change }
				on:input		= { self.input } />
	</div>
	<div class = "rr-app-input-error">
		{ self.state.errorText }
	</div>
</record-name>

<style>

	.rr-pe-dlg-name-container { /* identical to rr-app-sign-in-email-container? */
		display:            flex;
		flex-direction:     column;
		position:           relative;
		left:               45px;
		top:                10px;
		width:              260px;
		height:             36px;
		justify-content:    space-between;  /*  main-axis                       */
		align-items:        center;         /*  cross-axis                      */
	}

	.rr-app-label-input {
		display:            flex;
		flex-direction:     row;
		position:           relative;
		left:               0px;
		top:                0px;
		width:              260px;
		height:             26px;
		justify-content:    space-between;  /*  main-axis                       */
		align-items:        center;         /*  cross-axis                      */
	}

	.rr-pe-dlg-name-label {
		flex:               1 1 auto;
		max-width:          55px;
	/*  border:             dashed 1px lightgray;   */
		text-align:         right;
	}

	.rr-pe-dlg-name-input {
		flex:               1 1 auto;
		max-width:          190px;
		font-family:        Verdana, Geneva, Tahoma, sans-serif;
		font-size:          12px;
		border:				solid 1px gray;
		padding-left:		2px;
	}

	.rr-app-input-error {
		flex:               1 1 auto;
		position:           relative;
		left:               0px;
		top:                0px;
		width:              260px;
		height:             10px;
		text-align:         right;
		font-size:          10px;
		color:              red;
	}

</style>
