
import { cmn }					from '$lib/paneless/common';

import clone 					from 'clone';

class PanelBase {
	
	clientAppFnc:		any;
	uduiFnc:			any;
	frameId:			number;
	rpd:				any;
	paneKind:			null | string;
	isLoaded:			boolean;
	regSpec:			any;
	bRegistered:		boolean;

	constructor ( o ) {
		this.clientAppFnc	= o.clientAppFnc;
		this.uduiFnc		= o.uduiFnc;
		this.frameId		= o.frameId;
		this.rpd 			= o.rpd;
		this.paneKind		= null;

		this.isLoaded		= false;
		this.bRegistered	= false;
		
		this.updateRegistration = this.updateRegistration.bind ( this );

	}	//	constructor()

	loaded ( o: { sW: 		string;
			   	  paneKind:	string }) {

		this.isLoaded = true;
		this.paneKind = o.paneKind;

		try {
			this.regSpec = cmn.isString ( this.rpd.regSpec ) 
								? JSON.parse ( this.rpd.regSpec )
								: clone ( this.rpd.regSpec );
			
			this.checkRegSpec ( this.regSpec );
			
			this.clientAppFnc ( { do: 		'register',
								  frameId:	this.frameId,
								  fnc:		this.doAll,
								  paneKind:	this.paneKind,
								  regSpec:	this.regSpec } );
			this.bRegistered = true;
		} catch ( err ) {
			this.regSpec = null;
			cmn.error ( o.sW, 'failed to parse regSpec, or register' ); }
	
	}	//	loaded()
	
	checkRegSpec ( rs ) {
	}

	updateRegistration ( newRegSpec ) {
		const sW = 'PanelBase ' + this.paneKind;
		if ( ! cmn.isObject ( newRegSpec ) ) {
			cmn.error ( sW, 'newRegSpec is not an object' );
			return; }
		if ( this.bRegistered ) {
			this.clientAppFnc ( { do: 		'unregister',
								  frameId:	this.frameId,
								  fnc:		this.doAll,
								  paneKind:	this.paneKind,
								  regSpec:	this.regSpec } );
			this.bRegistered = false; }
		
		this.regSpec = clone ( newRegSpec );
		
		this.clientAppFnc ( { do: 		'register',
							  frameId:	this.frameId,
							  fnc:		this.doAll,
							  paneKind:	this.paneKind,
							  regSpec:	this.regSpec } );
		this.bRegistered = true;
	}	//	updateRegistration()

	willUnmount() {
		if ( cmn.isObject ( this.regSpec ) && this.bRegistered ) {
			this.clientAppFnc ( { do:		'unregister',
								  frameId:	this.frameId,
								  fnc:		this.doAll,
								  paneKind:	this.paneKind,
								  regSpec:	this.regSpec } ); }
	}	//	willUnmount()

	doAll ( o ) {

		return null;		//	not processed here.	
	}	

};	//	class	PanelBase

export { PanelBase as default };
