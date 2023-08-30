<!--
         1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
-->
<script lang="ts">

	import { onMount, beforeUpdate, onDestroy, tick }	from 'svelte';
	import { cmn }		    	from './common';

    export let appContentFnc: any	= null;

const PADDING =	10;

let self = {
		state:		{
			style:  { left:             '0px',
					  top:              '0px',
					  width:            '1px',
					  height:           '1px' },

			styleString:	'',
		},

		frameMoving: {
			moverMouseDown: 	false,
			frameFnc:			null,
			startX: 			0,
			startY: 			0
		},

		frameSizing: {
			sizerMouseDown: 	false,
			frameFnc:			null,
			startX: 			0,
			startY: 			0
		},
	
		eleId: 			'paneless-app-size-dictator',

	doAll ( o ) {
		let sW = 'paneless AppSizeDictator doAll() ' + o.do;
		if ( o.to ) {
			sW += ' to ' + o.to; }
	//	cmn.log ( sW );
	switch ( o.do ) {
		case ( 'set-call-down' ): {
			cmn.error ( sW, 'not implemented' );
			return;
		}
		case ( 'reset' ) : {
			self.state.style =  { left:             '0px',
								  top:              '0px',
								  width:            '1px',
								  height:           '1px' };
			self.state.styleString	= cmn.stringifyStyle ( self.state.style );
			return;
		}
		case ( 'update' ) : {
			let l = 0, t = 0, r = 1, b = 1;		//	left, top, right, bottom
			o.frames.forEach ( ( f: any ) => {
				if ( ! cmn.isFunction ( f.frameFnc ) ) {
				//	cmn.error ( sW, 'f.frameFnc is not set' );
				//	Especially when a system (layout) is loaded, not all frames
				//	(their functions) may be set.
					return; }
				let n: number, fs: any = f.frameFnc ( { do: 'get-style' } );
				if ( ! fs ) {
					return; }
				n = parseInt ( fs.left );
				if ( n < l ) {
					l = n; }	
				n = n + parseInt ( fs.width );
				if ( n > r - PADDING ) {
					r = n + PADDING; }
				n = parseInt ( fs.top );
				if ( n < t ) {
					t = n; }	
				n = n + parseInt ( fs.height );
				if ( n > b - PADDING ) {
					b = n + PADDING; }
			} );
			self.state.style =  { left:             l + 'px',
								  top:              t + 'px',
								  width:            (r - l) + 'px',
								  height:           (b - t) + 'px' };
			self.state.styleString	= cmn.stringifyStyle ( self.state.style );
			return;
		}
		default:
			cmn.error ( sW, 'unrecognized do - "' + o.do + '"' );
	}	//	switch
	}	//	doAll()

};	//	self

	self.state.styleString	= cmn.stringifyStyle ( self.state.style );

	onMount ( () => {
		appContentFnc ( { do: 		'set-call-down',
						  to:		'app-size-dictator',
						  asdFnc:	self.doAll } );
		
	} )

</script>

<app-size-dictator
	id              = { self.eleId }
	style 			= { self.state.styleString } >

</app-size-dictator>


<style>

	app-size-dictator {
		position:	absolute;
		visibility: hidden;
	}

</style>

