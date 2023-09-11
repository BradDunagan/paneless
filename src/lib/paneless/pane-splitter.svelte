<script lang="ts">

	import { onMount, beforeUpdate, tick }	from 'svelte';
	import clone 		from 'clone';	//	In tsconfig.json, "allowjs": true	
	import { cmn }    	from './common';

	import dots_vert_img	from  "./images/split_vert_sml_1_gray.png";
	import dots_horz_img	from  "./images/split_horz_sml_1_gray.png";

	export let prpFrameId		= 0;
	export let prpPaneId		= 0;
	export let prpPaneFnc		= null;
	export let prpClientFnc		= null;
	export let prpPaneEleId		= '';
	export let prpHV			= '';
	export let prpStyle			= { };
	export let prpOnPointerDown	= null;
	export let prpOnPointerUp	= null;

//	function stringifyStyle ( style: any ): string {
//		let s = '';
//		for ( const p in style ) {
//			s += p + ': ' + style[p] + '; '; };
//		return s;
//	}	//	stringifyStyle()

let styleString = '';

let self = {

	state:  {
		prvPrpStyle:	null,
		style: 	        null,
    //  styleString:    '',
		locked:	        false,
		img:	        false	},

	name:		'',

	hvsplitter:	'',
	img_path:	'',
	minimized:	false,

	pointerDown ( evt ) {
		const sW = 'paneless PaneSplitter pointerDown()';
	//	cmn.log ( sW, 'top -  evt.pointerId ' + evt.pointerId );

		let we: any  = evt; 
		let shiftKey = we.shiftKey;
		let evt2 = { pointerId: evt.pointerId,
					 pageX:		evt.pageX,
					 pageY:		evt.pageY };

		//	Set focus, bring frame to top ...
		window.setTimeout ( () => {
			//	Now the rest ...
			if ( shiftKey && prpClientFnc ) {
				//	Load properties pane ...
				prpClientFnc ( { do:	'properties-of-pane-splitter',
										 frameId:	prpFrameId,
										 paneId:	prpPaneId,
										 shFnc:		self.doAll,
										 title:		prpHV === 'h'
															? 'horz splitter'
															: 'vert splitter',
										 properties:	[
					{ name: 	'background color',
					  value:	self.state.style['background-color'] },
					{ name:		'three dots',		//	true, false
						value:	self.state.img ? 'true' : 'false' },
					{ name:		'locked',	//	vert: false, 'top', 'bottom'
											//	horz: false, 'left', 'right'
						value:	self.state.locked } ] } );
				return; }

			if ( self.state.locked ) {
				return; }

			prpOnPointerDown ( evt2, self.state.locked  );
		}, 0 );

	},	//	pointerDown()

	pointerUp ( evt ) {
		const sW = 'paneless PaneSplitter pointerUp()';
	//	cmn.log ( sW );


		if ( self.state.locked ) {
			return; }

		prpOnPointerUp ( evt, self.state.locked );
	},	//	pointerUp()

	doAll ( o ) {
		let sW = 'paneless PaneSplitter' + ' doAll() ' + o.do;
		if ( o.to ) {
			sW += ' to ' + o.to; }

		switch ( o.do ) {
			case 'get-state':
				return { style:		self.state.style,
						 locked:	self.state.locked,
						 img:		self.state.img };
			case 'set-state':
				let p = o.properties;
	
	   			if ( p.style && p.style.backgroundColor ) {	//	fix React
					   let c = p.style.backgroundColor;		//	property in 
					   delete ( p.style.backgroundColor );	//	old db 
					   p.style['background-color'] = c; }

				self.state.style = cmn.isUndefined ( p.style ) 
									?  { 'background-color': 'lightgray' }
									:  p.style;
				self.state.locked = cmn.isUndefined ( p.locked )
											?  false
											:  p.locked;
				self.state.img = cmn.isUndefined ( p.img )
											?  false
											:  p.img;
				styleString = cmn.stringifyStyle ( self.state.style );
				break;
			case 'set-property':
				let style = clone ( self.state.style );
				let img   = self.state.img;
				switch ( o.propName ) {
					case 'background color':
						if ( 	cmn.isString ( o.propValue )
							 &&	(o.propValue.length >   0       ) ) {
							style['background-color'] = o.propValue; }
						else {
							style['background-color'] = 'lightgray'; }
						self.state.style = style;
						styleString = cmn.stringifyStyle ( self.state.style );
						break;
					case 'three dots':
						if ( 	cmn.isString ( o.propValue )
							 &&	(   (   o.propValue === 'true'  )
								 ||	(   o.propValue === '1'     )) ) {
							img = true; }
						else
						if ( 	(typeof o.propValue === 'number')
							 && (       o.proValue  === 1       ) ) {
							img = true; }
						else {
							img = false; };
						self.state.img = img;
						break;
					case 'locked':
						if ( cmn.isString ( o.propValue ) ) {
							let s = o.propValue.toLowerCase();
							if ( s === 'false' ) {
								self.state.locked = false;
								break; }
							//	This is correct. 'top' says to lock the top
							//	pane height. Etc..
							if ( 	(prpHV === 'v')
								 && (	(s === 'top'   )
									 ||	(s === 'bottom')) ) {
								self.state.locked = s;
								break; }
							if ( 	(prpHV === 'h')
								 && (	(s === 'left' )
									 ||	(s === 'right')) ) {
								self.state.locked = s; } }
						break;
					default:
						cmn.error ( sW, 'unrecognized property name' );
				}
				break;
			case 'get-locked':
				return self.state.locked;

			case 'get-style':
				return clone ( prpStyle );
			case 'set-style': {
				return new Promise ( ( res, rej ) => {
					if ( cmn.isNumber ( o.top ) ) {
						self.state.style.top = o.top + 'px'; }
					if ( cmn.isNumber ( o.left ) ) {
						self.state.style.left = o.left + 'px'; }
					if ( cmn.isNumber ( o.width ) ) {
						self.state.style.width = o.width + 'px'; }
					if ( cmn.isNumber ( o.height ) ) {
						self.state.style.height = o.height + 'px'; }
					styleString = cmn.stringifyStyle ( self.state.style );
					tick().then ( () => {
						res ( 'ok' ); } );
				} ); }
			case 'set-minimized':
				self.minimized = o.minimized;
				return null;
			case 'get-minimized':
				return self.minimized;

			default:
				cmn.error ( sW, 'unrecognized do - "' + o.do + '"' );
		}

	},	//  doAll()

};	//	self

	self.state.prvPrpStyle = prpStyle;
	self.state.style = clone ( prpStyle );
	self.state.style['background-color'] = 'lightgray';
	styleString = cmn.stringifyStyle ( self.state.style );


	onMount ( () => {
		const sW = 'panless PaneSplitter onMount()';
		if ( ! prpPaneFnc ) {
			cmn.error ( sW, 'no paneFnc' );
			return; }

		prpPaneFnc ( { do:			'set-call-down',
					   to:			'splitter',
					   splitterFnc:	self.doAll } );
	} )	//	onMount()

	function checkPrpStyle(): boolean {
		let bChanged = false;
		let sss: any = self.state.style;
		const k = Object.keys ( sss );
		for ( const p in prpStyle ) {
			if ( (k.indexOf ( p ) < 0) || (sss[p] !== prpStyle[p]) ) {
				sss[p] = prpStyle[p];
				bChanged = true; } }
		return bChanged;
	}	//	checkPrpStyle()

	beforeUpdate ( () => {
		const sW = 'panless PaneSplitter beforeUpdate()';
	//	cmn.log ( sW );
		
		if ( checkPrpStyle() ) {
			styleString = cmn.stringifyStyle ( self.state.style ); }

		self.hvsplitter = prpHV === 'h' ? '-hsplitter'  : '-vsplitter';
		self.img_path   = prpHV === 'h' ? dots_horz_img : dots_vert_img;
	} )	//	beforeUpdate()

</script>

<pane-splitter>

	{#if self.state.img }
		<div id				= { prpPaneEleId + self.hvsplitter }
			 style			= { styleString }
			 class			= { 'pane' + self.hvsplitter }
			 on:pointerdown	= { self.pointerDown } 
			 on:pointerup	= { self.pointerUp } >
			<img alt		= 'pane splitter'
				 class		= 'pane-splitter-image'
				 src 		= { self.img_path } />
		</div>
	{:else}
		<div id				= { prpPaneEleId + self.hvsplitter }
			 style			= { styleString }
			 class			= { 'pane' + self.hvsplitter }
			 on:pointerdown	= { self.pointerDown } 
			 on:pointerup	= { self.pointerUp } >
		</div>
	{/if}

</pane-splitter>

<style>

	.pane-hsplitter {
		position:			absolute;
		display:			grid;
		align-items:		center;
		justify-items:		center;
		background-color:	lightgray;
		cursor:				col-resize;
		overflow:			hidden;
	}

	.pane-vsplitter {
		position:			absolute;
		display:			grid;
		align-items:		center;
		justify-items:		center;
		background-color:	lightgray;
		cursor:				row-resize;
		overflow:			hidden;
	}

	.pane-splitter-image {
		pointer-events:		none;
		user-select:		none;
	}
	
</style>

