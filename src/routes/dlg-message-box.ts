
/*
		 1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

import PanelBase 		from './panel-base';
import { cmn }			from '$lib/paneless/common';
import { uc } 			from '$lib/paneless/udui/udui-common';


class DlgMessageBox extends PanelBase {

	args:			any;
	frame:			any;
	intervalId:		number;
	
	constructor ( o ) {
		super ( o );

		this.intervalId		= 0;

		this.args			= o.args;

		this.frame	= this.clientAppFnc ( { do:			'get-frame',
											frameId:	o.frameId } );
	}

	loaded() {
		const sW = 'DlgMessageBox loaded()';
		super.loaded ( { sW: sW, paneKind: 'message-box' } );
		
		if ( ! cmn.isObject ( this.args ) ) {
			cmn.log ( sW, 'no args - assuming dev/test mode? ' );
			return; }

		let cd: any = null;
		if ( this.args && uc.isString ( this.args.dlgTitle ) ) {
			cd = this.rpd.getControl ( uc.TYPE_LABEL, 'lblTitle' );
			if ( cd ) {
				cd.setText ( this.args.dlgTitle ); } }
		if ( this.args && uc.isString ( this.args.message ) ) {
			cd = this.rpd.getControl ( uc.TYPE_TEXTAREA, 'txtMessage' );
			if ( cd ) {
				cd.setText ( this.args.message ); } }
		if ( this.args ) {
			let bShowOK = cmn.isBoolean ( this.args.bShowOK )
									   && this.args.bShowOK;
			cd = this.rpd.getControl ( uc.TYPE_BUTTON, 'btnOK' );
			if ( cd ) {
				//	'none'			not visible
				//	'unset'			default (i.e., visible)
				cd.setDisplay ( bShowOK ? 'unset' : 'none' ); } }
		if ( this.args && cmn.isString ( this.args.customOKText ) ) {
			cd = this.rpd.getControl ( uc.TYPE_BUTTON, 'btnOK' );
			if ( cd ) {
				cd.setText ( this.args.customOKText ); } }
		if ( this.args ) {
			let bShowCancel = cmn.isBoolean ( this.args.bShowCancel )
										   && this.args.bShowCancel;
			cd = this.rpd.getControl ( uc.TYPE_BUTTON, 'btnCancel' );
			if ( cd ) {
				//	'none'			not visible
				//	'unset'			default (i.e., visible)
				cd.setDisplay ( bShowCancel ? 'unset' : 'none' ); } }
		if ( this.args && cmn.isFunction ( this.args.onUpdate )
					   && cmn.isInteger ( this.args.updatePeriod )
					   && (this.args.updatePeriod >= 100) ) {
			let self = this;
			this.intervalId = window.setInterval ( () => {
				if ( self.intervalId === 0 ) {
					return; }
				let msg = self.args.onUpdate();
				cd = self.rpd.getControl ( uc.TYPE_TEXTAREA, 'txtMessage' );
				if ( cd ) {
					cd.setText ( msg ); }
			}, self.args.updatePeriod ); }
		else {
			this.intervalId = 0; }

		if ( this.args.disallowPaneEdits ) {
			this.frame.frameFnc ( { do: 'disallow-pane-edits' } );
			this.frame.frameFnc ( { do: 'disallow-transient-header' } ); }
	}	//	loaded()

	willUnmount() {
		let sW = 'DlgMessageBox willUnmount()';
		cmn.log ( sW );
		this.terminateInterval();
	}	//	willUnmount()

	keyDown ( o ) {
		let sW = 'DlgMessageBox keyDown()';
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

	terminateInterval() {
		if ( this.intervalId !== 0 ) {
			window.clearInterval ( this.intervalId ); 
			this.intervalId = 0; }
	}	//	terminateInterval()

	ok() {
		const sW = 'DlgMessageBox ok()';
		cmn.log ( sW );
		this.terminateInterval();
		this.uduiFnc ( { do: 'close-frame' } );
		if ( this.args && cmn.isFunction ( this.args.onOK ) ) {
			this.args.onOK(); }
		return true;
	}	//	ok()

	cancel() {
		const sW = 'DlgMessageBox cancel()';
		cmn.log ( sW );
		this.terminateInterval();
		this.uduiFnc ( { do: 'close-frame' } );
		if ( this.args && cmn.isFunction ( this.args.onCancel ) ) {
			this.args.onCancel(); }
		return true;
	}	//	()

	btnClick ( d, i, ele ) {
		const sW = 'DlgMessageBox btnClick()';
		cmn.log ( sW );
		if ( d.name === 'btnOK' ) {
			return this.ok(); }
		if ( d.name === 'btnCancel' ) {
			return this.cancel(); }
		cmn.error ( sW, 'unrecognized button - ' + d.name );
		return false;
	}	//	btnClick()
	
}	//	class DlgMessageBox 

export { DlgMessageBox as default }


