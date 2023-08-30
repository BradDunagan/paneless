import { uc } 			from './udui-common';

export let cmn = {

	isUndefined ( a: any ): boolean {
		return (typeof a === 'undefined');
	},	//	isDefined()

	isDefined ( a: any ): boolean {
		return (typeof a !== 'undefined');
	},	//	isDefined()

	isObject ( a: any ): boolean {
		return 	   (typeof a === 'object') 
				&& (a !== null) 
				&& ! this.isArray ( a );
	},

	isPromise ( a: any ): boolean {
		return this.isObject ( a ) && this.isFunction ( a.then );
	},
	
	isBoolean ( a: any ): boolean {
		return (typeof a === 'boolean');
	},	//	isBoolean()

	isString ( a: any ): boolean {
		return (typeof a === 'string');
	},	//	isString()

	isInteger ( a?: any ): boolean {
		if ( arguments.length <= 0 ) {
			return false; }
		for ( let i = 0; i < arguments.length; i++ ) {
			if ( ! Number.isInteger ( arguments[i] ) ) {
				return false; } }
		return true;
	},	//	isInteger()

	isNumber ( a?: any ): boolean {
		if ( arguments.length <= 0 ) {
			return false; }
		for ( let i = 0; i < arguments.length; i++ ) {
			if ( typeof arguments[i] !== 'number' ) {
				return false; } 
			if ( Number.isNaN ( arguments[i] ) ) {
				return false; } }
		return true;
	},	//	isNumber()

	isFunction( a: any ): boolean {
		return (typeof a === 'function');
	},	//	isFunction()

	isArray( a: any ): boolean {
		return Array.isArray ( a );
	},	//	isArray()

	checkChangeResponse ( response: any ) {
		if ( response.status !== 200 ) {
			let s =   'unrecognized server response status (' 
					+ response.status + ')';
			throw { message: s }; }
	},	//	checkChangeResponse()

	getControl ( dlg: any, sW: string, ctrlType: string, 
                                       ctrlName: string ): any {
		let cd;
		if ( this.isFunction ( dlg.getControl ) ) {
			cd = dlg.getControl ( ctrlType, ctrlName ); }
		else {
			cd = dlg.rpd.getControl ( ctrlType, ctrlName ); }
		if ( ! cd ) {
			console.error ( sW + ': control not found - "' + ctrlName + '"' );
			return null; }
		return cd;
	},//	getControl()

	show ( dlg: any, sW: string, ctrlType: string, 
                                 ctrlName: string, 
                                 bShow: boolean ): boolean {
		let cd = this.getControl ( dlg, sW, ctrlType, ctrlName );
		if ( ! cd ) {
			return false; }
		cd.setIsVisible ( !! bShow );
		return true;
	},	//	show()

	enable ( dlg: any, sW: string, ctrlType: string, 
                                   ctrlName: string, 
                                   bEnable: boolean ): boolean {
		let cd = this.getControl ( dlg, sW, ctrlType, ctrlName );
		if ( ! cd ) {
			return false; }
		cd.enable ( !! bEnable );
		return true;
	},	//	enable()

	setLabel ( dlg: any, sW: string, lblName: string, 
                                     text: string, 
                                     color?: string ): boolean {
		let lblD = this.getControl ( dlg, sW, uc.TYPE_LABEL, lblName );
		if ( ! lblD ) {
			return false; }
		if ( lblD.text !== text ) {
			lblD.setText ( text ); }
		if ( this.isString ( color ) ) {
			lblD.setColor ( color ); }
		return true;
	},	//	setLabel()

	setButton ( dlg: any, sW: string, btnName: string, 
                                      text: string ): boolean {
		let btnD = this.getControl ( dlg, sW, uc.TYPE_BUTTON, btnName );
		if ( ! btnD ) {
			return false; }
		if ( btnD.text !== text ) {
			btnD.setText ( text ); }
		return true;
	},	//	setButton()

	setInput ( dlg: any, sW: string, edtName: string, 
                                     text: string ): boolean {
		let edtD = this.getControl ( dlg, sW, uc.TYPE_INPUT, edtName );
		if ( ! edtD ) {
			return false; }
		edtD.setText ( text );
		return true;
	},	//	setInput()

	getInput ( dlg: any, sW: string, edtName: string ): boolean | string {
		let edtD = this.getControl ( dlg, sW, uc.TYPE_INPUT, edtName );
		if ( ! edtD ) {
			return false; }
		return edtD.getText();
	},	//	getInput()
	
	noExtraSpaces ( s: string ): string {
		//	Eliminate spaces at the ends, and multiple consecutive spaces
		//	btween words.
		let a  = s.split ( ' ' );
		let s2 = '';
		a.forEach ( w => {
			if ( w === '' ) {
				return; }
			s2 += w + ' '; } );
		return s2.trimEnd();
	},	//	noExtraSpaces()

	unquote ( name: string ): string {
		if ( name.startsWith ( '"""' ) ) {
			name = name.slice ( 3 ); }
		if ( name.endsWith ( '"""' ) ) {
			name = name.slice ( 0, -3 ); }
		if ( name.startsWith ( '"' ) ) {
			name = name.slice ( 1 ); }
		if ( name.endsWith ( '"' ) ) {
			name = name.slice ( 0, -1 ); }
		return name;
	},	//	unquote()

	//	Hopefully some consistency, coherency in log, error handling.
	//
	log ( sW: string, s?: string ) {
		if ( ! this.isString ( sW ) ) {
			sW = '' + sW; }
		if ( sW.includes ( '%s' ) ) {
			console.log.apply ( console, arguments );
			return; }
		let text = sW;
		if ( this.isDefined ( s ) ) {
			text += ': ' + s; }
		console.groupCollapsed ( text );
		console.trace();
		console.groupEnd();
	},	//	log()

	info ( sW: string, s?: string ) {
		if ( ! this.isString ( sW ) ) {
			sW = '' + sW; }
		if ( sW.includes ( '%s' ) ) {
			console.info.apply ( console, arguments );
			return; }
		let text = sW;
		if ( this.isDefined ( s ) ) {
			text += ': ' + s; }
		console.info ( text );
	},	//	info()

	error ( sW: string, err?: any ): string {
		if ( ! this.isString ( sW ) ) {
			sW = '' + sW; }
		if ( sW.includes ( '%s' ) ) {
			console.error.apply ( console, arguments );
			return; }
		if ( ! this.isDefined ( err ) ) {
			err = sW; 
			sW  = null; }
		let s = null;
		if ( this.isString ( err ) ) {
			s = err; }
		else
		if ( this.isString ( err.message ) ) {
			s = err.message; }
		else {
			s = JSON.stringify ( err ); }
		if ( sW === null ) {
			console.error ( s ); }
		else {
			console.error ( sW + ': ' + s ); }
		return s;
	},	//	error()

	errorResolve ( sW: string, err: any, res: any ) {
		//	First replaced code in admin/admin_1.js typesReset() catch().
		let s = this.error ( sW, err );
		res ( s );
	},	//	errorResolve()

	errorCatch ( sW: string, err: any, rej?: any ): string {
		this.error ( sW, err );
		let msg = null;
		if ( 	this.isObject ( err.response )
			 && (err.response.status === 401)
			 && this.isObject ( err.response.data )
			 && this.isString ( err.response.data.msg ) ) {
			msg = err.response.data.msg;
			this.error ( sW, msg ); }
		if ( rej ) {
			rej ( err ); }
		return msg;
	},	//	errorCatch()

	errorThrow ( sW: string, err: any ) {
		this.error ( sW, err );
		throw err;
	},	//	errorThrow()


	checkRegSpec ( rs: any, expectedSndTo: string[], 
							expectedRcvFm: string[] ) {

		/*
		//	rs is expected to be -
		//
		//		{ "frame":	"<name of registering pane's frame>",
		//		  "pane":	"<name of registering pane>",
		//		  "rcvFm": [ { "frame":	"<name of frame>",
		//		  			   "<PT>":	"<name of pane>" },
		//		  		     ... ],
		//	  	  "sndTo": [ ... ] } }

		let self = this;

		function expectedNames ( oName: string, expected: string[] ) {
			//	oName		rs' "sndTo" or "rcvFm".
			//	expected	the array of names in object rs[oName].  Ignore
			//				those that end with "(opt)".
			let nRequired = 0;
			expected.forEach ( n => nRequired += n.endsWith ( '(opt)' ) ? 0 
																		: 1 );
			let names = null;
			names = Object.keys ( rs[oName] );

			if ( names.length < nRequired ) {
				throw { message:   'required ' + nRequired + ' ' + oName 
								 + ' named ids' }; }

			expected.forEach ( n => {
				if ( n.endsWith ( '(opt)' ) ) {
				//	n = n.slice ( 0, n.indexOf ( '(opt)' ) );
					return; }
				if ( names.findIndex ( n2 => n2 === n ) < 0 ) {
					throw { message:   'pane named "' + n + '" required in '
									 + oName }; }
				let o = rs[oName][n];
				if ( ! self.isObject ( o ) ) {
					throw { message:   'expect ' + oName + ' pane "' + n + '" '
									 + 'to be an object' }; }
			} );
		}	//	expectedNames()
		
		if ( rs.frame && ! this.isString ( rs.frame ) ) {
			throw { message:   'expected frame to be the name of the '
							 + 'registering frame' }; }
		if ( ! this.isString ( rs.pane ) ) {
			throw { message:   'expected pane to be the name of the '
							 + 'registering pane'}; }
		if ( ! this.isObject ( rs.sndTo ) ) {
			throw { message:   'expect sndTo object of named ids (possibly '
							 + 'empty)' }; }
		if ( ! this.isObject ( rs.rcvFm ) ) {
			throw { message:   'expect rcvFm object of named ids (possibly '
							 + 'empty)' }; }
		expectedNames ( 'sndTo', expectedSndTo );
		expectedNames ( 'rcvFm', expectedRcvFm );
		*/
	},	//	checkRegSpec()

	stringifyStyle ( style: any ): string {
		let s = '';
		for ( const p in style ) {
			s += p + ': ' + style[p] + '; '; };
		return s;
	},	//	stringifyStyle()
	
	setRegisteredCallee ( sW, rs, callees, o ) {
		if ( ! this.isString ( o.paneKind ) ) {
			cmn.error ( sW, 'no paneKind' );
			return null; }
		let sndTo = rs.sndTo[o.paneKind];
		if ( ! sndTo ) {
			cmn.error ( sW, 'pane kind "' + o.paneKind + '" is not '
						+	'registered here' );
			return null; }
		let fncs = callees[o.paneKind];
		if ( ! fncs ) {
			fncs = callees[o.paneKind] = {}; }
		if ( o.pki ) {
			let pki = sndTo[o.pki];
			if ( ! pki ) {
				cmn.error ( sW, 'no instance of pane kind '
							+	'"' + o.paneKind + '" is '
							+	'registered here' );
				return null; }
			if ( 	(o.pane  === pki.pane )
				 && (o.frame === pki.frame) ) {
				//	e.g., callees['udui']['CloneControls'] = o.fnc;
				fncs[o.pki] = o.fnc;
				return o.fnc; } }
		if ( 	(o.pane  === sndTo.pane )
			 && (o.frame === sndTo.frame) ) {
			//	e.g., callees['udui']['udui'] = o.fnc;
			fncs[o.paneKind] = o.fnc;	 
			return o.fnc; }
		return null;
	},	//	setRegisteredCallee()

//			if ( o.pane === this.rs.sndTo['udui'].pane ) {
//				this.uiFnc = null; }
	unsetRegisteredCallee ( sW, rs, callees, o ) {
		let sndTo = rs.sndTo[o.paneKind];
		if ( ! sndTo ) {
			cmn.error ( sW, 'pane kind "' + o.paneKind + '" is not '
						+	'registered here' );
			return; }
		let fncs = callees[o.paneKind];
		if ( ! fncs ) {
			fncs = callees[o.paneKind] = {}; }
		if ( o.pki ) {
			let pki = sndTo[o.pki];
			if ( ! pki ) {
				cmn.error ( sW, 'no instance of pane kind '
							+	'"' + o.paneKind + '" is '
							+	'registered here' );
				return; }
			if ( 	(o.pane  === pki.pane )
				 && (o.frame === pki.frame) ) {
				//	e.g., callees['udui']['CloneControls'] = o.fnc;
				fncs[o.pki] = o.fnc;
				return; } }
		if ( 	(o.pane  === sndTo.pane )
			 && (o.frame === sndTo.frame) ) {
			//	e.g., callees['udui']['udui'] = o.fnc;
			fncs[o.paneKind] = o.fnc;	 
			return; }
	},	//	unsetRegisteredCallee()

	oneCallee ( sW: string, callees: object, 
							paneKind: string, bCritical?: boolean ) {
		//	Provide the function of just one callee.  If there are multiple
		//	callees then error() and return null.
		if ( ! callees[paneKind] ) {
			if ( this.isBoolean ( bCritical ) && ! bCritical ) {
				return null; }
			this.error ( sW, 'no functions of kind "' + paneKind + '"' );
			return null; }
		let ks = Object.keys ( callees[paneKind] );
		if ( ks.length > 1 ) {
			this.error ( sW, 'Multiple panes of kind "' + paneKind + '" are '
						 +	 'connected, which one? Must specify pane.' );
			return null; }
		let fnc = callees[paneKind][ks[0]];
		return fnc;	
	},	//	oneCallee()

	script ( sW, callees, paneKind, o ) {

		//	Example call from PlasticOne-clone-2-ui-a.py (paneKind is 'udui') -
		//
		//		//	Note here 'udui' is the pane kind and its the item that 
		//		//	specifies the  * pane kind instance * (PKI) - "Clone-It".
		//		//	The PKI is always the name of the pane specified at the
		//		//	begining of the pane's registration specification.
		//		//
		//		r = ui ( [ { 'cmd':       'enable', 
		//					 'udui':      'Clone-It',
		//					 'ctrl-name': 'edtCloneBaseName',
		//					 'enable':    bEnable } ] );
		//	or -
		//		r = ui ( [ { 'cmd':       'enable', 
		//					 'ctrl-name': 'edtCloneBaseName',
		//					 'enable':    bEnable } ] );

		let fnc = null;
	//	if ( cmn.isString ( o[paneKind] ) ) {
	//		fnc = callees[paneKind][o[paneKind]];
		if ( cmn.isString ( o.pki ) ) {
			fnc = callees[paneKind][o.pki];
			if ( ! this.isFunction ( fnc ) ) {
				return [ {
					status: 'error',
					msg:   'pane kind "' + paneKind + '", '
						 + 'instance "' + o.pki + '" '
						 + 'is not registered' } ]; } }
		else {
			fnc = null;
			if ( this.isObject ( callees[paneKind] ) ) {
				fnc = callees[paneKind][paneKind]; }
			if ( ! this.isFunction ( fnc ) ) {
				return [ {
					status: 'error',
					msg: 'no pane kind "' + paneKind + '" is registered' } ]; } }

		return fnc ( { do:		'script', 
					   script:	o } ); 

	},	//	script()
	
	script2 ( sW, callees, paneKind, script ) {
		cmn.log ( sW, ' script: ' + script );
		if ( ! callees[paneKind] ) {
			return [ { 
				status: 'error',
				msg: 'pane-kind ' + paneKind + ' is not registered' } ]; }
		try {
			let s = script.replace ( /\'/gi, '\"' );
			let o = JSON.parse ( s );
			return this.script ( sW, callees, paneKind, o );
		}	//	try
		catch ( e ) {
			cmn.error ( sW, ' error: ' + e.message + '\n' + e.stack ); 
			return [ { 
				status: 'error',
				msg: 'possibly internal, check browser debug console' } ];
		}	//	catch

	}	//	script2()


};

