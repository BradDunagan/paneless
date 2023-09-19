<script lang="ts">

	import { onMount, beforeUpdate, tick }	from 'svelte';
	import clone 		from 'clone';	//	In tsconfig.json, "allowjs": true	
	import { cmn }    	from './common';

	import dots_vert_img	from  "./images/split_vert_sml_1_gray.png";
	import dots_horz_img	from  "./images/split_horz_sml_1_gray.png";
	import split_restore_up	from  "./images/split-restore-up-17x10.png";

	export let prpFrameId		= 0;
	export let prpPaneId		= 0;
	export let prpPaneFnc: any	= null; 
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

const vrbH 	= 12;		//	Restore Bar Height (for vertical splitter)
const vrbW	= 22;		//	Restore Bar Width
const hrbH 	= 22;		//	Restore Bar Height (for horizontal splitter)
const hrbW	= 12;		//	Restore Bar Width

let styleString		= '';
let botRestoreStyleString 	= '';	//	Bottom ...	(above the splitter)
let topRestoreStyleString 	= '';	//	Top ...		(below the splitter)
let rgtRestoreStyleString 	= '';	//	Right ...	(left of the splitter)
let lftRestoreStyleString 	= '';	//	Left ...	(right of the splitter)

let self = {

	state:  {
		prvPrpStyle:		null,
		style: 	        	null,
		botRestoreStyle: 	{ display:	'none',
							  top:		'0px',
							  left: 	'0px',
							  height: 	vrbH + 'px',
							  width: 	vrbW + 'px' },
		topRestoreStyle: 	{ display:	'none',
							  top:		'0px',
							  left: 	'0px',
							  height: 	vrbH + 'px',
							  width: 	vrbW + 'px' },
		lftRestoreStyle: 	{ display:	'none',
							  top:		'0px',
							  left: 	'0px',
							  height: 	hrbH + 'px',
							  width: 	hrbW + 'px' },
		rgtRestoreStyle: 	{ display:	'none',
							  top:		'0px',
							  left: 	'0px',
							  height: 	hrbH + 'px',
							  width: 	hrbW + 'px' },
    //  styleString:    	'',
		locked:	        	false,
		img:	        	false	},

	name:		'',

	hvsplitter:	'',
	img_path:	'',
	minimized:	false,
//	bShowRestoreBar: 	false,
    prevRatio:  0,

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

	setMinimized ( o ) {
		const sW = 'paneless PaneSplitter setMinimized()';
		if ( self.minimized === o.minimized ) {
			return null; }
		cmn.log ( sW, o.minimized );

		if ( self.minimized && ! o.minimized ) {
			cmn.log ( sW, '    not showing restore button ...' ); 
			let s = self.state;
			if ( self.minimized === 'bottom' ) {
				s.botRestoreStyle.display = 'none';
				botRestoreStyleString = cmn.stringifyStyle ( s.botRestoreStyle ); }
			if ( self.minimized === 'top' ) {
				s.topRestoreStyle.display = 'none';
				topRestoreStyleString = cmn.stringifyStyle ( s.topRestoreStyle ); }
			if ( self.minimized === 'right' ) {
				s.rgtRestoreStyle.display = 'none';
				rgtRestoreStyleString = cmn.stringifyStyle ( s.rgtRestoreStyle ); }
			if ( self.minimized === 'left' ) {
				s.lftRestoreStyle.display = 'none';
				lftRestoreStyleString = cmn.stringifyStyle ( s.lftRestoreStyle ); }
		} else {
			cmn.log ( sW, '        showing restore button ...' ); 
			let s = self.state;
			if ( o.minimized === 'bottom' ) {
				s.botRestoreStyle.display = 'unset';
				botRestoreStyleString = cmn.stringifyStyle ( s.botRestoreStyle ); }
			if ( o.minimized === 'top' ) {
				s.topRestoreStyle.display = 'unset';
				topRestoreStyleString = cmn.stringifyStyle ( s.topRestoreStyle ); }
			if ( o.minimized === 'right' ) {
				s.rgtRestoreStyle.display = 'unset';
				rgtRestoreStyleString = cmn.stringifyStyle ( s.rgtRestoreStyle ); }
			if ( o.minimized === 'left' ) {
				s.lftRestoreStyle.display = 'unset';
				lftRestoreStyleString = cmn.stringifyStyle ( s.lftRestoreStyle ); }
		}
        
        if ( !! o.minimized) {
            self.prevRatio = o.prevRatio; }
       
		self.minimized = o.minimized;
        return null;
	},	//	setMinimized()

	click ( evt ) {
		const sW = 'paneless PaneSplitter click()';
		cmn.log ( sW );

		prpPaneFnc ( { do: 		'splitter-restore',
					   ratio:	self.prevRatio } );
	},	//	click()

	doAll ( o ) {
		let sW = 'paneless PaneSplitter' + ' doAll() ' + o.do;
		if ( o.to ) {
			sW += ' to ' + o.to; }
	//	cmn.log ( sW );
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
				return self.setMinimized ( o );
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
	styleString		= cmn.stringifyStyle ( self.state.style );

	topRestoreStyleString = cmn.stringifyStyle ( self.state.topRestoreStyle ); 
	botRestoreStyleString = cmn.stringifyStyle ( self.state.botRestoreStyle ); 
	lftRestoreStyleString = cmn.stringifyStyle ( self.state.lftRestoreStyle ); 
	rgtRestoreStyleString = cmn.stringifyStyle ( self.state.rgtRestoreStyle ); 


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

	function setBBBStyle() {
		const sW = 'panless PaneSplitter setBBBStyle()';
		let s  = self.state;
		let ss = self.state.style;
		if ( prpHV === 'v' ) {
			const eleId	= prpPaneEleId;
			let e  = <HTMLElement>document.getElementById ( eleId );
			if ( ! e ) {
				cmn.log( sW, 'no pane element' );
				return; }
			let w  = e.getBoundingClientRect().width;

			//	above the splitter
			s.botRestoreStyle.top  = (parseInt ( ss.top ) - vrbH) + 'px';
			s.botRestoreStyle.left = (w - vrbW) + 'px';
			botRestoreStyleString = cmn.stringifyStyle ( s.botRestoreStyle ); 

			//	below the splitter
			s.topRestoreStyle.top  = (parseInt ( ss.top ) + cmn.vsH) + 'px';
			s.topRestoreStyle.left = (w - vrbW) + 'px';
			topRestoreStyleString = cmn.stringifyStyle ( s.topRestoreStyle ); }

		if ( prpHV === 'h' ) {
			//	left of the splitter
			s.rgtRestoreStyle.top  = (parseInt ( ss.top ) + 25) + 'px';
			s.rgtRestoreStyle.left = (parseInt ( ss.left ) - hrbW - 4) + 'px';
			rgtRestoreStyleString = cmn.stringifyStyle ( s.rgtRestoreStyle ); 

			//	right of the splitter
			s.lftRestoreStyle.top  = (parseInt ( ss.top ) + 25) + 'px';
			s.lftRestoreStyle.left = (parseInt ( ss.left ) + cmn.hsW) + 'px';
			lftRestoreStyleString = cmn.stringifyStyle ( s.lftRestoreStyle ); }
	}	//	setBBBStyle()

	beforeUpdate ( () => {
		const sW = 'panless PaneSplitter beforeUpdate()';
	//	cmn.log ( sW );

		self.hvsplitter = prpHV === 'h' ? '-hsplitter'  : '-vsplitter';
		self.img_path   = prpHV === 'h' ? dots_horz_img : dots_vert_img;

		setBBBStyle();
		if ( checkPrpStyle() ) {
			styleString = cmn.stringifyStyle ( self.state.style ); }
	} )	//	beforeUpdate()

</script>


<pane-splitter>

	{#if prpHV === 'v'}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div id 			= { prpPaneEleId + '-vsplitter-brb' }
			 class 			= 'pane-vsplitter-brb'
			 style    		= { botRestoreStyleString } 
         	 on:click       = { self.click } >
			<img alt			= 'split restore up'
				 class			= "split-restore-up"
				 src			= { split_restore_up } >
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div id 			= { prpPaneEleId + '-vsplitter-trb' }
			 class 			= 'pane-vsplitter-trb'
			 style    		= { topRestoreStyleString }  
         	 on:click       = { self.click } >
			<img alt			= 'split restore down'
				 class			= "split-restore-down"
				 src			= { split_restore_up } >
		</div>
	{/if}
	{#if prpHV === 'h'}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div id 			= { prpPaneEleId + '-hsplitter-rrb' }
			 class 			= 'pane-hsplitter-rrb'
			 style    		= { rgtRestoreStyleString } 
         	 on:click       = { self.click } >
			<img alt			= 'split restore left'
				 class			= "split-restore-left"
				 src			= { split_restore_up } >
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div id 			= { prpPaneEleId + '-hsplitter-lrb' }
			 class 			= 'pane-hsplitter-lrb'
			 style    		= { lftRestoreStyleString }  
         	 on:click       = { self.click } >
			<img alt			= 'split restore right'
				 class			= "split-restore-right"
				 src			= { split_restore_up } >
		</div>
	{/if}
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

	.pane-vsplitter-brb {	/*	bottom restore bar	*/
		position: 			absolute;
		background-color:   white;
		opacity: 			0.9;
	}

	.split-restore-up {
		position:			absolute;
		width: 				17px;
		height:				10px;
		cursor: 			default;
	}

	.pane-vsplitter-trb { 	/*	top restore bar		*/
		position: 			absolute;
		background-color:   white;
		opacity: 			0.9;
	}

	.split-restore-down {
		position:			absolute;
		width: 				17px;
		height:				10px;
		cursor: 			default;
		rotate:  			180deg;
		top:				2px;
	}

	.pane-hsplitter-lrb { 	/*	left restore bar		*/
		position: 			absolute;
		background-color:   white;
		opacity: 			0.9;
	}

	.split-restore-right {
		position:			absolute;
		width: 				17px;
		height:				10px;
		cursor: 			default;
		rotate:  			90deg;
		top:				2px;
	}

	.pane-hsplitter-rrb { 	/*	right restore bar		*/
		position: 			absolute;
		background-color:   white;
		opacity: 			0.9;
	}

	.split-restore-left {
		position:			absolute;
		width: 				17px;
		height:				10px;
		cursor: 			default;
		rotate:  			-90deg;
		top:				2px;
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

