<script lang="ts">

	import { onMount, onDestroy }	from 'svelte';
	import { cmn }		    		from './common';

	export let prpEleId 		= 'paneless-icon';
	export let prpStyle: any	= {};
	export let prpAppFnc: any			= null;
	export let prpAppContentFnc: any	= null;
	export let prpFrameFnc: any			= null;
	export let prpFrameId		= 0;
	export let prpFrameName		= 'frame';

	function stringifyStyle ( style: any ): string {
		let s = '';
		for ( const p in style ) {
			s += p + ': ' + style[p] + '; '; };
		return s;
	}	//	stringifyStyle()

let self = {

	state:	{
		style:					prpStyle,
		styleString:			'',
		iconName:	{ 
	//		visibility: 'hidden' },
			visibility: prpStyle.visibility },
		iconNameStyleString:	'',
		frameName:				prpFrameName 
	},

	iconSlot:		null,

	appFnc:			prpAppFnc,
	frameFnc: 		prpFrameFnc,

	iconize2() {
		window.setTimeout ( () => {
			if ( ! self.iconSlot ) {
				return; }
			let slot = <{ x: string; y: number;}>self.iconSlot;
			self.state.style = {
				left:					slot.x + 'px',
				top: 					slot.y + 'px',
				width:					'50px',
				height:					'60px',
				'border-color':			'black',
				'transition-property':	'left, top, width, height',
				'transition-duration':	'200ms' };
			self.state.styleString = stringifyStyle ( self.state.style );

			self.state.iconName = {
				visibility: 	'hidden' };
			self.state.iconNameStyleString = 
									stringifyStyle ( self.state.iconName );

			self.iconSlot = null;
		}, 50 );
	},	//	iconize2()

	iconize ( o: any ) {
		self.state.style = {
			left:					o.start.left,
			top: 					o.start.top,
			width:					o.start.width,
			height:					o.start.height,
			'border-color':			'black',
			'transition-property': 	'left, top, width, height',
			'transition-duration':	'200ms' };
		self.state.styleString = stringifyStyle ( self.state.style );

		self.state.iconName = {
				visibility: 	'hidden' };
		self.state.iconNameStyleString = 
								stringifyStyle ( self.state.iconName );


		if ( ! self.iconSlot ) {
			self.iconSlot = prpAppContentFnc ( { 
											do: 		'get-icon-slot',
											frameId: 	prpFrameId } ); }
		self.iconize2();
		return null;
	},	//	iconize()
	
	restore ( o ) {
		self.state.style = {
				left:					o.end.left,
				top: 					o.end.top,
				width:					o.end.width,
				height:					o.end.height,
				'border-color':			'black',
				'transition-property': 	'left, top, width, height',
				'transition-duration':	'200ms' };
		self.state.styleString = stringifyStyle ( self.state.style );

		self.state.iconName = {
				visibility: 	'hidden' };
		self.state.iconNameStyleString = 
								stringifyStyle ( self.state.iconName );

		//	After a delay, restore the frame.
		window.setTimeout ( () => {
			self.state.style = {
					visibility:		'hidden' };
			self.state.styleString = stringifyStyle ( self.state.style );

			self.state.iconName = {
					visibility:		'hidden' };
			self.state.iconNameStyleString = 
									stringifyStyle ( self.state.iconName );
		}, 200 );
		return null;
	},	//	restore()

	transitionEnd ( ev ) {
		let sW = 'paneless Icon transitionEnd()';
		cmn.log ( sW );

		//	This fires for each of the left, top, width, height 
		//	transition properties. That is, four times.  Simply set 
		//	the icon's name visiblity on the event that indicates one 
		//	of the transitions to icon is ended.
		if ( self.state.style.visibility !== 'hidden' ) {
			if ( self.state.iconName.visibility !== 'visible' ) {
			//	let style = self.state.style;
			//	this.setState ( { 
			//		style: {
			//			left:			style.left,
			//			top: 			style.top,
			//			width:			style.width,
			//			height:			style.height,
			//			'border-color':	style['border-color'],
			//			transitionProperty: 'left, top, width, height',
			//			transitionDuration:	'200ms' },
				self.state.iconName = {
						visibility: 'visible' };
				self.state.iconNameStyleString = 
										stringifyStyle ( self.state.iconName );
			//	} ); } }
		} }
	},	//	transitionEnd()

	setBorderColor ( o ) {
		let sW = 'paneless Icon setBorderColor() ' + o.color;
		cmn.log ( sW );
		self.state.style['border-color'] = o.color;
		self.state.styleString = stringifyStyle ( self.state.style );
	},	//	setBorderColor()

	setFrameName ( o ) {
		let sW = 'paneless Icon setFrameName() ' + o.name;
		cmn.log ( sW );
		self.state.frameName = o.name;
	},	//	setFrameName()

	doAll ( o ) {
		const sW = 'paneless Icon doAll() do ' + o.do;
	//	cmn.log ( sW );
		switch ( o.do ) {
			case 'iconize':
				return self.iconize ( o );
			case 'restore':
				return self.restore ( o );
			case 'set-border-color':
				return self.setBorderColor ( o );
			case 'set-frame-name':
				return self.setFrameName ( o );
			case 'get-style':
				return self.state.style;
			default:
				cmn.error ( sW, 'unrecognized do' );
		}
	},	//	doAll()

	mouseDown ( ev ) {
		let sW = 'paneless mouseDown()';
	//	cmn.log ( sW );
		ev.stopPropagation();
	},	//	mouseDown()

	mouseUp ( ev ) {
		let sW = 'paneless mouseUp()';
	//	cmn.log ( sW );
		ev.stopPropagation();
	},	//	mouseUp()

	mouseMove ( ev ) {
		let sW = 'paneless mouseMove()';
	//	cmn.log ( sW );
		ev.stopPropagation();
	},	//	mouseMove()

	click ( ev ) {
		let sW = 'paneless click()';
	//	cmn.log ( sW );
		ev.stopPropagation();
		self.frameFnc ( { do: 'un-iconize' } );
	},	//	click()

};

	onMount ( () => {
		let sW = prpFrameId + ' paneless Icon onMount()';
		prpFrameFnc ( { do: 	'set-call-down',
						to:		'icon',
						fnc:	self.doAll } );

		let e = document.getElementById ( prpEleId );
		if ( ! e ) {
			cmn.error ( sW, 'element not found' );
			return; }
		e.addEventListener ( 'transitionend', self.transitionEnd );
	} )	//	onMount()

	onDestroy ( () => {
		let sW = prpFrameId + ' paneless Icon onDestroy()';
		prpFrameFnc ( { do: 	'set-call-down',
						to:		'icon',
						fnc:	null } );

	} )	//	onDestroy()

	self.state.styleString			= stringifyStyle ( self.state.style );
	self.state.iconNameStyleString	= stringifyStyle ( self.state.iconName );

</script>

<icon>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div id				= { prpEleId }
		 class 			= 'rr-pe-frame'
		 style 			= { self.state.styleString }
		 on:click		= { self.click } >
		<div class	 	= 'rr-iconized-frame-name'
			 style 		= { self.state.iconNameStyleString } >
			{ self.state.frameName }
		</div>
	</div>


</icon>

<style>

	.rr-pe-frame {
		position:           absolute;
		border:             solid 1px black;
		background-color:   white;
	}

	.rr-iconized-frame-name {
		position:			absolute;
		left:				-10px;
		top:				62px;
		width: 				70px;
		text-align: 		center;
		word-wrap:	 		break-word;
		background-color:	white;
		line-height:		12px;
	}

</style>

