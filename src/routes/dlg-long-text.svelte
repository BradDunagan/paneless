<script lang="ts">

/*
         1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/
	import { onMount, afterUpdate, tick }		from 'svelte';

	import { cmn }		from '$lib/paneless/common';
	import clone 		from 'clone';

	/*  Based on -
			https://github.com/Microsoft/monaco-editor-samples/blob/master/browser-esm-webpack/index.js

		Docs -
			https://microsoft.github.io/monaco-editor/api/modules/monaco.editor.html
	*/
	import * as monaco		from '../../node_modules/monaco-editor';


	export let prpEleId			= '';
	export let prpAppFrameFnc	= null;
	export let prpOnOK			= null;
	export let prpTitle			= '';
	export let prpText			= '';
	


	let styleString				= '';
	let mainStyleString			= '';
	let titleStyleString		= '';
	let styleRightSideString	= '';

class ClassLongText {

	state:	{
		style:			any;
		mainStyle:		any;
		titleStyle:		any;
		showingNotes:	boolean;
		notesText:		string;
		styleRightSide:	any;
	}

	eleId:					string;
	monacoContainerEleId:	string;
	editor:					any;
	bIgnoreChange:			boolean;

	constructor() {
		this.state = {
			style:      	{ 'grid-template-columns': '600px 0px' },
			mainStyle:		{ 'border-right': 'none' },
			titleStyle:		{ display: 'block' },
			showingNotes:   false,
			notesText:      'Help',
			styleRightSide: {
				display:        'none',
			}
		}

		this.eleId  = prpEleId;		//	"rr-pe-monaco-container-" + prppeId;
		
		this.monacoContainerEleId 	= prpEleId + '-monaco-container';
		this.editor = null;

		this.contentChanged	= this.contentChanged.bind ( this );
		
		this.onKeyDown      = this.onKeyDown.bind ( this );
		this.onKeyUp        = this.onKeyUp.bind ( this );
		this.clickNotes		= this.clickNotes.bind ( this );
		this.clickOK		= this.clickOK.bind ( this );
		this.clickCancel	= this.clickCancel.bind ( this );
		this.setGlobalActiveDialogFnc =
							this.setGlobalActiveDialogFnc.bind ( this );
		this.doAll          = this.doAll.bind ( this );

		this.bIgnoreChange 	= true;;
	}

	contentChanged ( e ) {
		const sW = 'LongText contentChanged()';
		if ( this.bIgnoreChange ) {
		//	cmn.log ( sW, 'ignoring change' );
			return; }

		this.bIgnoreChange = true;
	}   //  contentChanged()

	onKeyDown ( e ) {
		const sW = 'LongText onKeyDown()';
	//	cmn.log ( sW, 'e.code: ' + e.code + '  alt: ' + e.altKey 
	//				+ '  ctrl: ' + e.ctrlKey
	//				+ '  shift: ' + e.shiftKey );

		//	Read-only.
	//	e.preventDefault();
	}	//	onKeyDown()

	onKeyUp ( e ) {
		const sW = 'LongText onKeyUp()';
	//	cmn.log ( sW, 'code: ' + e.code + '  alt: ' + e.altKey 
	//				+ '  ctrl: ' + e.ctrlKey
	//				+ '  shift: ' + e.shiftKey );

		//	Read-only.
		e.preventDefault();
	}	//	onKeyUp

	clickNotes() {
		const sW = 'LongText clickNotes()';
		cmn.log ( sW );
		if ( ! this.state.showingNotes ) {
			let s = clone ( this.state );
				s.style = { 'grid-template-columns': '600px 300px' };
				s.mainStyle = { 'border-right': 'solid lightgray 1px' };
			  	s.showingNotes = true;
				s.notesText = 'Hide Help';
				s.styleRightSide = { display: 'block' };

			styleString				= cmn.stringifyStyle ( s.style );
			mainStyleString			= cmn.stringifyStyle ( s.mainStyle );
			styleRightSideString	= cmn.stringifyStyle ( s.styleRightSide ); }
		else {
			let s = clone ( this.state );
				s.style = { 'grid-template-columns': '600px 0px' };
				s.mainStyle = { 'border-right': 'none' };
			  	s.showingNotes = false;
				s.notesText = 'Help';
				s.styleRightSide = { display: 'none' };
			
			styleString				= cmn.stringifyStyle ( s.style );
			mainStyleString			= cmn.stringifyStyle ( s.mainStyle );
			styleRightSideString	= cmn.stringifyStyle ( s.styleRightSide );
			tick(); }
	}	//	clickNotes()

	clickOK ( e ) {
		const sW = 'LongText clickOK()';
		cmn.log ( sW );
		this.setGlobalActiveDialogFnc ( null );
		prpAppFrameFnc ( { do: 'close-dlg' } );
		if ( ! cmn.isFunction ( prpOnOK ) ) {
			cmn.error ( sW, 'props.onOK is not set' );
			return; }
		prpOnOK ( { text: this.editor.getValue() } );
	}	//	clickOK()

	clickCancel ( e ) {
		const sW = 'LongText clickCancel()';
		cmn.log ( sW );
		this.setGlobalActiveDialogFnc ( null );
		prpAppFrameFnc ( { do: 'close-dlg' } );
	
	}	//	clickCancel()

	setGlobalActiveDialogFnc ( fnc ) {
		prpAppFrameFnc ( { do:	'set-call-down',
						   to:	'active-dialog',
						   fnc:	fnc } );
	}	//	setGlobalActiveDialogFnc()

	doAll ( o ) {
		let sW = 'LongText doAll() ' + o.do;
	//	cmn.log ( sW );
		if ( o.do === 'relayout' ) {
			this.editor.layout();
			return; }

		if ( o.do === 'append-menu-items' ) {
			let a = o.menuItems;
			return;
		}
		if ( o.do === 'menu-item' ) {
			//	Return true if the menu item is handled here.

			return false;
		}

		if ( o.do === 'keyboard-key-down' ) {
			return null; }
		if ( o.do === 'focus' ) {
			return; }
		if ( o.do === 'not-focus' ) {
			return; }

		cmn.error ( sW, 'unrecognized do: ' + o.do );
	}	//	doAll()

}	//	class	ClassLongText()

	let self = new ClassLongText();
	
	styleString				= cmn.stringifyStyle ( self.state.style );
	mainStyleString			= cmn.stringifyStyle ( self.state.mainStyle );
	titleStyleString		= cmn.stringifyStyle ( self.state.titleStyle );
	styleRightSideString	= cmn.stringifyStyle ( self.state.styleRightSide );

	onMount ( () => {
		const sW = 'LongText onMount()';
		self.setGlobalActiveDialogFnc ( self.doAll );
		let eleContainer = document.getElementById ( 
												self.monacoContainerEleId );
		//	Options -
		//	https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
		//		autoIndent:		seems to have no affect
		self.editor = monaco.editor.create ( eleContainer, {
			value: 					prpText,
		//	language: 				'json',		//	causes a require() call
			lineNumbers:			'off',
			renderLineHighlight:	'none',
			minimap:				{ enabled: false },
			fontSize:				12	
		} );
		self.editor.onKeyDown ( self.onKeyDown );
		self.editor.onKeyUp ( self.onKeyUp );
	//	self.editor.onDidType ( self.onDidType );

		self.editor.getModel().onDidChangeContent ( self.contentChanged )

		self.editor.focus();
	} )	//	onMount()

	afterUpdate ( () => {
		let sW = 'LongText afterUpdate()';
	//	cmn.log ( sW );
		self.editor.layout();
	} )	//	afterUpdate()

</script>


<dlg-long-text>

			<div class = "rr-long-text"
				 style = { styleString } >
				<div class = "rr-long-text-main"
					 style = { mainStyleString } >
					<div style = { "height: 12px" } >
						<div class  = "rr-long-text-app-name" >
							&LTApp Name&GT
						</div>
						<div class = "rr-long-text-notes">
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<span class = "rr-app-click-text"
								  on:click = { self.clickNotes }>
								{ self.state.notesText }
							</span>
						</div>
					</div>
					<div class  = "rr-long-text-title"
						 style 		= { titleStyleString }>
						{ prpTitle }
					</div>

					<div id 		= { self.monacoContainerEleId }
						 class 	= "rr-long-text-monaco-container" >
					</div>

					<div class  = "rr-long-text-controls" >
						<div />
						<button class    = "rr-general-button rr-long-text-ok"
								on:click = { self.clickOK } >
							OK
						</button>
						<button class	 = "rr-general-button rr-long-text-cancel"
								on:click = { self.clickCancel } >
							Cancel	
						</button>
					</div>
				</div>
				<div class = "rr-long-text-right-side"
					 style = { styleRightSideString } >
					<p>Help with long text.</p>
				</div>
			</div>
	
</dlg-long-text>


<style>
	.rr-long-text {
		display:            grid;
		height:             410px;
		border:             solid 1px black;
		background-color:   white;
	}

	.rr-long-text-main {
		display:            	grid;
		grid-template-rows:		10px 34px auto 39px;
		width:              	100%;
		height:					100%;
		border-right:			solid lightgray 1px;
	}

	.rr-long-text-app-name {
		display:				inline-block;
		position:				relative;
		top:					-4px;
		font-family:			verdana;
		font-size:				8px;
		padding-left:			2px;
	}

	.rr-long-text-notes {
		height:             10px;
		font-size:          10px;
		float:				right;
		padding-right:      5px;
		cursor:             pointer;
	}

	.rr-long-text-title {						/*	like rr-pe-diags-title		*/
		font-family:        	verdana;
		font-size:          	16px;
		padding-bottom:     	5px;
		cursor:					default;
		text-align: 			center;
	}

	.rr-long-text-monaco-container {	
		border:             	none;
		font-family:        	consolas;
		overflow:				hidden;
	}

	.rr-long-text-controls {
		display:            	grid;
		grid-template-columns:	33.3% 33.3% 33.3%;
		padding-top:			10px;
		font-family:			verdana;
		font-size:				12px;
		border-top:				lightgray 1px solid;
	}

	.rr-long-text-ok {
		width:					70px;
		height:					20px;
		justify-self:			center
	}

	.rr-long-text-cancel {
		width:					70px;
		height:					20px;
		justify-self:			right;
		margin-right:			10px;
	}

	.rr-long-text-right-side {
		flex:               1 1 auto;
		height:             400px;
		width:              200px;
		padding-top:        10px;
		padding-left:       10px;
		padding-right:      5px;
	}

</style>

