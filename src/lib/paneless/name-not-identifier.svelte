<script lang="ts">

	import { onMount }		from 'svelte';
	import { cmn }		    from './common';

	export let prpDlg 		= null;
	export let prpLabel		= '';
	export let prpCurText	= '';

	function stringifyStyle ( style: any ): string {
		let s = '';
		for ( const p in style ) {
			s += p + ': ' + style[p] + '; '; };
		return s;
	}	//	stringifyStyle()

let self = {

		state:  {
			errorText:        '',
		},

		nameText:       prpCurText,

	error ( msg ) {
		self.state.errorText = msg;
		prpDlg ( { do: 'invalid' } );
	},

	valid ( name ) {
		self.state.errorText = '';
		prpDlg ( { do: 'valid', name: name } );
	},

	keypress ( e ) {
	//	cmn.log ( 'keypress() ' + e.key );
	},

	change ( e ) {
		const sW = 'paneless NameNotIdentifier change()'
	//	cmn.log ( sW,  e.target.value );
		let name  = e.target.value;
		self.nameText = name;
		if ( name.length === 0 ) {
			self.error ( '' );
			return;
		}

		//	This name, not being an identifier, almost anything goes.
		self.valid ( name );
	},

	input ( e ) {
		const sW = 'paneless NameNotIdentifier input()'
	//	cmn.log ( sW, e.target.value );
		//	This name, not being an identifier, almost anything goes.
		self.valid ( e.target.value ); 
	},

};	//	self

//	self.state.styleMainString = stringifyStyle ( self.state.styleMain );

	onMount ( () => {
		const sW = 'paneless NameNotIdentifier onMount()'

	} )	//  onMount()

</script>

<name-not-identifier>

	<div class = "dlg-name-container">
		<div class = "label-input">
			<div class = "dlg-name-label">
				{ prpLabel ? prpLabel : 'Name:' }
			</div>
			<input class 		= "dlg-name-input"
				   spellCheck	= { false }
				   value		= { self.nameText }
				   on:keypress 	= { self.keypress }
				   on:change 	= { self.change }
				   on:input 	= { self.input } />
		</div>
		<div class = "input-error">
			{ self.state.errorText }
		</div>
	</div>

</name-not-identifier>

<style>

	.dlg-name-container { 
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

	.label-input {
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

	.dlg-name-label {
		flex:               1 1 auto;
		max-width:          55px;
	/*  border:             dashed 1px lightgray;   */
		text-align:         right;
	}

	.dlg-name-input {
		flex:               1 1 auto;
		max-width:          190px;
		font-family:        Verdana, Geneva, Tahoma, sans-serif;
		font-size:          12px;
		padding-left:		2px;
		height:				20px;
		margin-top:			6px;
		outline: 			none;
	}

	.input-error {
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
