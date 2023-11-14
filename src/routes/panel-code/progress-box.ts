
/*
		 1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

import PanelBase 		from './panel-base';
import { cmn }			from '$lib/paneless/common';
import { uc } 			from '$lib/paneless/udui-common';


class ProgressBox extends PanelBase {

	args:			any;
	frame:			any;
	text:			string;
	statusText:		string;
	bLoaded:		boolean;

	constructor ( o ) {
		super ( o );
		this.args			= o.args;

		this.frame		= this.clientAppFnc ( { do:			'get-frame',
												frameId:	o.frameId } );

		this.progress		= this.progress.bind ( this );
		this.status			= this.status.bind ( this );

		this.statusText = '';

		if ( cmn.isObject ( this.args ) ) {
			if ( ! cmn.isFunction ( this.args.fncCB ) ) {
				cmn.error ( 'ProgressBox: no args.fncCB' ); }
			else {
				this.args.fncCB ( { do: 			'set-progress-fnc',
									fncProgress:	this.progress } );  
				this.args.fncCB ( { do: 			'set-status-fnc',
									fncStatus:		this.status} ); } 
			if ( cmn.isString ( this.args.status ) ) {
				this.statusText = this.args.status; } }

		this.text			= '';
		this.bLoaded		= false;
	}

	loaded() {
		const sW = 'ProgressBox loaded()';
		super.loaded ( { sW: sW, paneKind: 'progress-box' } );
		let cd: any = null;

		this.bLoaded = true;
		
		if ( ! cmn.isObject ( this.args ) ) {
			cmn.log ( sW, 'no args - assuming dev/test mode? ' );
			return; }

		if ( this.args && cmn.isString ( this.args.dlgTitle ) ) {
			cd = this.rpd.getControl ( uc.TYPE_LABEL, 'lblTitle' );
			if ( cd ) {
				cd.setText ( this.args.dlgTitle ); } }
		
		if ( this.args.disallowPaneEdits ) {
			this.frame.frameFnc ( { do: 'disallow-pane-edits' } );
		//	this.frame.frameFnc ( { do: 'disallow-transient-header' } );
			//	Allow the transient header so the dialog can be moved.
			//	But don't display the stuff in the header.
			this.frame.frameFnc ( { 
				do: 'disallow-transient-header-burger' } );
			this.frame.frameFnc ( { 
				do: 'disallow-transient-header-title' } );
			this.frame.frameFnc ( { 
				do: 'disallow-transient-header-iconize' } );
			this.frame.frameFnc ( { 
				do: 'disallow-transient-header-destroy' } ); }

		cd = this.rpd.getControl ( uc.TYPE_LABEL, 'lblStatus' );
		if ( cd ) {
			cd.setText ( this.statusText ); } 
		
		cd = this.rpd.getControl ( uc.TYPE_TEXTAREA, 'txtProgress' );
		if ( cd ) {
			cd.setText ( this.text ); } 
	}	//	loaded()

	keyDown ( o ) {
		let sW = 'ProgressBox keyDown()';
		if ( o.ev.altKey ) {
			sW += ' alt' }
		sW += ' ' + o.ev.key;
		cmn.log ( sW );

		let ctrlD = o.focusedCtrlD;

		if ( ctrlD ) {
			switch ( ctrlD.type ) {
				default:
					cmn.log ( sW, ' Error: unrecognized control' );
			} }

		return false;
	}	//	keyDown()

	progress ( o ) {
		const sW = 'ProgressBox progress()';
		let self = this;
		this.text += o.text;
		let cd = this.rpd.getControl ( uc.TYPE_TEXTAREA, 'txtProgress' );
		if ( cd ) {
			cd.setText ( this.text, { bScrollToBottom:	true } ); 
		//	let e = document.getElementById ( cd.eleId + '-textarea' );
		//	if ( e ) {
		//		e.scrollTop = e.scrollHeight; } 
		}
		if ( o.text === 'done' ) {
			window.setTimeout ( () => {
				self.uduiFnc ( { do: 'close-frame' } ); 
				cmn.log ( sW, 'all text -\n' + this.text + '\n' );
			}, 1000 ); 
		}
	}	//	progress()

	status ( o ) {
		const sW = 'ProgressBox status()';
		let cd = this.rpd.getControl ( uc.TYPE_LABEL, 'lblStatus' );
		if ( cd ) {
			cd.setText ( o.text ); }
		this.statusText = o.text;
	}	//	status()

	cancel() {
		const sW = 'ProgressBox cancel()';
		cmn.log ( sW );
		if ( cmn.isFunction ( this.args.fncCB ) ) {
			this.args.fncCB ( { do: 'cancel' } ); }
		this.uduiFnc ( { do: 'close-frame' } );
		return true;
	}	//	cancel()

	btnClick ( d, i, ele ) {
		const sW = 'ProgressBox btnClick()';
		cmn.log ( sW );
		if ( d.name === 'btnCancel' ) {
			return this.cancel(); }
		cmn.error ( 'unrecognized button - ' + d.name );
		return false;
	}	//	btnClick()
	
}	//	class ProgressBox 

export { ProgressBox as default }


