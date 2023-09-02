/*
		 1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

//  On promises -
//      https://developers.google.com/web/ilt/pwa/working-with-indexeddb

import { cmn }			from '$lib/paneless/common.ts';

interface	DemoDataId {
	id:		number;
};

interface	Data {
	id:		number;
	type:	string;
	name:	string;
	data:	any;
};

let db = (function () {

	if ( ! window.indexedDB ) {
		window.alert (   "Your browser doesn't support IndexedDB. " );
		return null; }

	let latestVersion = 1;
	
	let request = indexedDB.open ( 'paneless-demo', latestVersion );

	let db0: null | string	= null;
	let db: any				= null;

	request.onerror = function ( evt: any ) {
		const sW = 'db request.onerror()';
		cmn.error ( sW, evt.target.error.message );
	};

	request.onsuccess = function ( evt: any ) {
		cmn.log ( 'db request.onsuccess()' );
		if ( db0 === 'upgrade complete' ) {
			db = evt.target.result; }
		else {
			if ( evt.target.result.version === latestVersion ) {
				db = evt.target.result; }
			else {
				db0 = evt.target.result; } }
	};

	function upgradeToComplete ( e: any ) {
		cmn.log ( 'db upgradeToComplete()' );
		if ( ! db0 ) {
			db0 = 'upgrade complete'; }
		else {
			db = db0; }
	}	//	upgradeToComplete()

	function upgradeToError ( e: any ) {
		cmn.error ( 'upgradeToError()', e.target.error.message );
	}	//	upgradeToError()

	function setUpgradeNotifications ( to ) {
		to.oncomplete = upgradeToComplete;
		to.onerror    = upgradeToError;
	}	//	setUpgradeNotifications()

	function createMeta ( db: any ) {
		cmn.log ( 'creating meta object store ...' );
		let os = db.createObjectStore ( "meta", { keyPath: "name" } );
		return os;
	}	//	createMeta()

	function addMetaItem ( db, item ) {
		const sW = 'db addMetaItem() ' + item.name;
		return new Promise ( ( res, rej ) => {
			let to = db.transaction ( ['meta'], 'readwrite' );
			to.oncomplete = function ( e: any ) {
				cmn.log ( sW, 'Object store meta initialization transaction '
							+ 'done.' );
				res ( 'ok' ); }
			to.onerror = function ( e: any ) {
				cmn.log ( sW, 'Object store meta initialization transaction '
							+ 'failed.' );	
				cmn.error ( sW, e.target.error.message );
				rej ( { message: 'error' } ); }
			let req  = to.objectStore ( 'meta' ).add ( item );
			req.onsuccess = function ( e: any ) {
				if ( e.target.result !== item.name ) {
					cmn.log ( sW, 'Initialize meta  Error: expected name '
								+ 'result' ); 
					rej ( 'expected item.name' ); } 
				else {
					cmn.log ( sW, 'Initialized meta ok.' );
					res ( 'ok' ); } };
		} );	//	Promise
	}	//	addMetaItem()

	function populateMeta ( db: any ) {
		const sW = 'db populateMeta()';
		cmn.log ( sW, 'populating meta object store ...' );
		return addMetaItem ( db, { name: 'lastDataId',
							   	   id:   0 } ).then ( () => {

			return addMetaItem ( db, { name:	'lastPaneContentId',
									   lastId:	0 } );
		} ).then ( () => {
			return addMetaItem ( db, { name:		'areGuestRecordsLoaded',
									   areLoaded:	false } )
		} );
	}	//	populateMeta()

	
	function createData ( db: any ) {
		//	Fields -
		//		recId			key			number
		//		type						string
		//		name						string
		//		data						object
		//
		cmn.log ( 'creating data object store ...' );
		let os = db.createObjectStore ( "data", 
				{ keyPath: ["recId"] } );

		os.createIndex ( "index_data_type_name", 
						 ["type", "name"], 
						 { unique: true } );
		return os;
	}	//	createData()


	request.onupgradeneeded = function ( evt: any ) {
		const sW = 'db request.onupgradeneeded()';

		let os: any = null;
		let db = evt.target.result;

		cmn.log ( sW, 'db.version ' + db.version );

		setUpgradeNotifications ( evt.target.transaction );

		switch ( db.version ) {

			case 1:

				createData ( db );

				os = createMeta ( db );

				os.transaction.oncomplete = function ( evt ) {
					populateMeta ( db ); }
				os.transaction.onerror = function ( evt ) {
					cmn.error ( evt.target.error.message ); }

				break;

			default:
				cmn.error ( sW, 'Unrecognized db.version ' + db.version );
		}
	}	//	request.onupgradeneeded()


	let lastId	= 0;
	let nIds 	= 0;

	function trans ( res, rej, os, op, op2 ) : Promise<string> | any {
		if ( ! db ) {
			cmn.error ( 'db trans()', 'db is not set' );
			rej ( 'db is not set' );
			return null; }

		let to = db.transaction ( [os], op );
		let sw = os + ' ' + op2;
		to.oncomplete = function ( e ) {
		//	cmn.log ( 'db trans()', 'trans ' + os + ' complete' ); 
			res ( 'trans ' + os + ' completed ok' ); }
		to.onerror = function ( e ) {
			let msg =  'Object store ' + sw + ' transaction failed.  '
				  	  + e.target.error.message; 
			cmn.error ( 'db trans()', msg );
			rej ( msg ); }
		return to;
	}	//	trans()

	function checkResult ( t, o ) {
		let kp = t.source.keyPath;
		let r  = t.result;
		if ( cmn.isArray ( kp ) ) {
			if ( (! cmn.isArray ( r )) || (r.length !== kp.length) ) {
				return false; }
			for ( let i = 0; i < kp.length; i++ ) {
				if ( r[i] !== o[kp[i]] ) {
					return false; } }
			return true; }
		return r === o[kp];
	}	//	checkResult()

	function add ( sW, os, o ) : Promise<string> {
		return new Promise ( ( res, rej ) => {
			let to = trans ( res, rej, os, 'readwrite', 'add' );
			if ( ! to ) {
				cmn.error ( sW, 'add() - no to (error?)' );
				return; }
			let req  = to.objectStore ( os ).add ( o );
			req.onsuccess = function ( e ) {
				if ( ! checkResult ( e.target, o ) ) {
					cmn.error ( sW, 'expected key value result' ); } }
		//		else {
		//			res ( 'ok' ); } }
			req.onerror = function ( e ) {
				cmn.error ( sW, 'grpId ' + o.grpId
							  + '  userId ' + o.userId
							  + '  sysId ' + o.sysId
							  + '  hRec ' + o.hRec 
							  + '  name "' + o.name + '"  ' 
							  + req.error.message );
				cmn.error ( e.target.error.message );
				rej ( { message: 'error' } ); }
		} );
	}	//	add()

	function update ( sW, os, o ) {
		return new Promise ( ( res, rej ) => {
			let to = trans ( res, rej, os, 'readwrite', 'update' );
			if ( ! to ) {
				cmn.error ( sW, 'update() - no to (error?)' );
				return; }
			let req  = to.objectStore ( os ).put ( o );
			req.onsuccess = function ( e ) {
				if ( ! checkResult ( e.target, o ) ) {
					cmn.error ( sW, 'expected key value result' ); } 
				else {
				//	cmn.log ( sW, 'updated ' + os + ' success' );
					res ( 'updated ' + os + ' ok' ); } }
			req.onerror = function ( e ) {
				cmn.error ( sW, 'grpId ' + o.grpId
							  + '  userId ' + o.userId
							  + '  sysId ' + o.sysId
							  + '  hRec ' + o.hRec 
							  + '  name "' + o.name + '"  ' 
							  + req.error.message );
				cmn.error ( e.target.error.message );
				rej ( { message: 'error' } ); }
		} );
	}	//	update()

	function update2 ( sW, os, o ) : Promise<string> {
		return new Promise ( ( res, rej ) => {
			let to = trans ( res, rej, os, 'readwrite', 'update' );
			if ( ! to ) {
				cmn.error ( sW, 'update2() - no to (error?)' );
				return; }
			let req  = to.objectStore ( os ).put ( o );
			req.onsuccess = function ( e ) {
				if ( ! checkResult ( e.target, o ) ) {
					cmn.error ( sW, 'expected key value result' ); } 
			//	else {
			//		cmn.log ( sW, 'updated ' + os + ' success' ); } 
			//	//	res ( 'updated ' + os + ' ok' ); }
			}
			req.onerror = function ( e ) {
				cmn.error ( sW, 'grpId ' + o.grpId
							  + '  userId ' + o.userId
							  + '  sysId ' + o.sysId
							  + '  hRec ' + o.hRec 
							  + '  name "' + o.name + '"  ' 
							  + req.error.message );
				cmn.error ( e.target.error.message ); }
			//	rej ( { message: 'error' } ); }
		} );
	}	//	update2()


	function load ( os, key ) : Promise<any> {
		return new Promise ( ( res, rej ) => {
			let to = trans ( res, rej, os, 'readonly', 'load' );
			if ( ! to ) {
				cmn.error ( 'db load()', 'no transaction object' );
				res ( null );
				return; }
			let req  = to.objectStore ( os ).get ( key );
			req.onsuccess = function ( e ) {
				res ( e.target.result ); }
			req.onerror = function ( e ) {
				cmn.error ( e.target.error.message );
				res ( null ); }
		} );
	} 	//	load()

	function next ( osName, request ) {
		return new Promise ( ( res, rej ) => {
			if ( ! db ) {
				rej ( 'db is not set' );
				return; }

			function success ( evt ) {
				let cursor = evt.target.result;
				if ( cursor ) {
					request.cursor = cursor;
					res ( request ); }
				else {
					res ( null ); } }
			function error ( evt ) {
				cmn.error ( evt.target.error.message );
				rej ( { message: 'error' } ); }

			if ( ! request ) {
				let to = db.transaction ( [osName], 'readonly' );
				to.oncomplete = function ( e ) {
					cmn.log ( 'Object store '
								+ osName 
								+ ' cursor transaction done.' ); }
				request = to.objectStore ( osName ).openCursor();
				request.onsuccess = success;
				request.onerror = error; }
			else {
				request.onsuccess = success;
				request.onerror = error;
				request.cursor.continue(); }
		} );
	}	//	next()

	function destroy ( os, key ) {
		return new Promise ( ( res, rej ) => {
			let to = trans ( res, rej, os, 'readwrite', 'destroy' );
			if ( ! to ) {
				return; }
			let req  = to.objectStore ( os ).delete ( key );
			req.onsuccess = function ( e ) {
				res ( e.target.result ); }
			req.onerror = function ( e ) {
				cmn.error ( e.target.error.message );
				res ( null ); }
		} );
	} 	//	destroy()

	function nextByIndex ( osName, idxName, request, key ) {
		const sW = 'db nextByIndex()';
		return new Promise ( ( res, rej ) => {
			if ( ! db ) {
				rej ( 'db is not set' );
				return; }

			function success ( evt ) {
				let cursor = evt.target.result;
				if ( cursor ) {
					request.cursor = cursor;
					res ( request ); }
				else {
					res ( null ); } }
			function error ( evt ) {
				cmn.error ( evt.target.error.message );
				rej ( { message: 'error' } ); }

			if ( ! request ) {
				let to = db.transaction ( [osName] );
				to.oncomplete = function ( e ) {
					cmn.log ( sW, 'Cursor transaction done.' ); }
				let keyRange = IDBKeyRange.only ( key );
				request = to.objectStore ( osName )
							.index ( idxName )
							.openCursor ( keyRange );
				request.onsuccess = success;
				request.onerror   = error; }
			else {
				request.onsuccess = success;
				request.onerror   = error;
				request.cursor.continue(); }
		} );
	}	//	nextByIndex()

	function loadByTypeName ( os, 
							  type,
							  name ) : Promise<null | Data> {
		const sW = 'db loadByTypeName()';
		cmn.log ( sW );
		return new Promise ( ( res, rej ) => {
			if ( ! db ) {
				let o = { message: 'db is not set' };
				cmn.error ( sW, o.message );
				rej ( o );
				return; }
			function success ( evt ) {
				if ( evt.target.result ) {
					let d: any = evt.target.result;
					res ( d ); }
				else {
					res ( null ); } }
			function error ( evt ) {
				let o = { message: evt.target.error.message };
				cmn.error ( sW, o.message );
				rej ( o ); }
			let to = db.transaction ( [os] );
			to.oncomplete = function ( e ) {
				cmn.log ( sW, 'Object store record cursor '
							+ 'transaction done.' ); }
			request = to.objectStore ( os )
				//		.index ( 'index_records3_type_name' )
						.index ( 'index_data_type_name' )
						.get ( [type, name] );
			request.onsuccess = success;
			request.onerror   = error; 
		} );
	}	//	loadByTypeName() 
	


	let self = {

		rootTypes:		{},

		loadMeta:		function ( name: string ) {
			return self.waitForDB().then ( () => {
				return load ( 'meta', name );
			} );
		},	//	loadMeta()

		addMeta:		function ( o: any ) {
			const sW = 'db addMeta()';
			return add ( sW, 'meta', o );
		},	//	addMeta()

		updateMeta:		function ( o: any ) {
			const sW = 'db updateMeta()';
			return update ( sW, 'meta', o );
		},	//	updateMeta()

		waitForDB:		function() {
			const sW = 'db waitForDB()';
		//	cmn.log ( sW );
			return new Promise ( ( res, rej ) => {
				let waitCnt = 0;
				function wait4db() {
					if ( db ) {
						res ( waitCnt );
						return; }
					if ( ++waitCnt > 10 ) {
						rej ( 'no db' );
						return; }
					cmn.log ( sW, ' waiting for db ' + waitCnt );
					window.setTimeout ( () => {
						wait4db();
					}, 1000 ); }
				wait4db();
			} );
		},	//	waitForDB()

		demoNewDataId:		function(): Promise<DemoDataId> {
			let r: DemoDataId = { id:		0 };
			return this.loadMeta ( 'lastDataId' ).then ( ( lri: any ) => {
				if ( ! lri ) {
					throw { message: 'failed to get meta lastDataId' }; }
				r.id = lri.id + 1;
				return this.updateMeta ( { name:	'lastDataId',
										   id:		r.id } );
			} ).then ( ( ) => {
				return r;
			} );
		},	//	demoNewDataId()

		loadData_ByTypeName: function ( type:	string, 
										name:	string ) 
						   	: Promise<null | Data> {
			const sW = 'db loadData_ByTypeName()';
			cmn.log ( sW );

			let pms = loadByTypeName ( 'data', type, name );
			return pms.then ( ( d: null | Data ) => {
				return d;
			} );
		},	//	loadData_ByTypeName() 

		loadData:	function ( id:	number ) 
				: Promise<Data> {
			const sW = 'db loadData()';
			//	Promising a LocalRecord3.  
			//	?	-	What about its hRec?
			//	Should be promising a DataRecord?
			return load ( 'data', [id] );
		},	//	loadData()

		addData:	function ( d: Data ) : Promise<string> {
			const sW = 'db addData()';
			if ( cmn.isObject ( d.data.change ) ) {
				cmn.error ( sW, 'change should be an array' );
				return Promise.reject ( { message: 'error' } ); }
			if ( cmn.isObject ( d.data.name ) && cmn.isUndefined ( d.data.name.chgId ) ) {
				cmn.error ( sW, 'name.chgId is undefined' );
				return Promise.reject ( { message: 'error' } ); }
			if ( cmn.isObject ( d.data['type-id'] ) && cmn.isUndefined ( d.data['type-id'].chgId ) ) {
				cmn.error ( sW, '[\'type-id\'].chgId is undefined' );
				return Promise.reject ( { message: 'error' } ); }
			return add ( sW, 'data', d );
		},	//	addData()
		
		updateData:	function ( d: Data ) : Promise<string> {
			const sW = 'db updateData()';
			if ( cmn.isObject ( d.data.change ) ) {
				cmn.error ( sW, 'change should be an array' );
				return Promise.reject ( { message: 'error' } ); }
			if ( cmn.isObject ( d.data.name ) && cmn.isUndefined ( d.data.name.chgId ) ) {
				cmn.error ( sW, 'name.chgId is undefined' );
				return Promise.reject ( { message: 'error' } ); }
			if ( cmn.isObject ( d.data['type-id'] ) && cmn.isUndefined ( d.data['type-id'].chgId ) ) {
				cmn.error ( sW, '[\'type-id\'].chgId is undefined' );
				return Promise.reject ( { message: 'error' } ); }
			return update2 ( sW, 'data', d );
		},	//	updateData()

		
		nextData:	function ( request: any ) {
			return next ( 'data', request );
		},	//	nextData()

		allData ( dfCB ) : Promise<Data[]> {
			const sW = 'db allData()';
			return new Promise ( ( res, rej ) => {
				let a: Data[] = [];
				function nextD ( request: any ) {
					self.nextData ( request ).then ( ( request: any ) => {
						if ( ! request ) {
							res ( a );
							return; }
						let d = request.cursor.value;
						if ( (! d) || dfCB ( d ) ) {
							nextD ( request );
							return; }
						//	As if it came from Share?
						a.push ( d );
						nextD ( request );	
					} );
				}	//	nextD()
				nextD ( null )
			} );
		},	//	allData()

	};	//	self

	return self;
} )();

export { db, type Data,
			 type DemoDataId  };

