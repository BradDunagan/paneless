
<script lang="ts">
	import { onMount, onDestroy, afterUpdate }		from 'svelte';
	import clone 					from 'clone';
	import { cmn }					from '$lib/paneless/common.ts';

	export let prpEleId			= '';
	export let prpAppFrameFnc: any		= null;
	export let prpFrameId		= 0;
	export let prpPaneId		= 0;
	export let prpAppContentFnc: any	= null;
	export let prpClientAppFnc: any		= null;

let stateStyle		= '';
let stateText		= '';
let stateNClicks	= 0;

class ClassContentExample1 {

	isMountified:	boolean;

	state:	{
		style:	{
			margin:		string;
			border:		string;
			padding:	string;
			visibility:	string;		//	Until 'init-new' or possibly
		};								//	'set-state'.
		text:			string;
		nClicks:    	number;
	};
	
	constructor() {

		this.isMountified	= false,

		this.state =	{
			style:	{
				margin:		'5px',
				border:		'solid blue 1px',
				padding:	'5px',
				visibility:	'hidden',		//	Until 'init-new' or possibly
			},								//	'set-state'.
			text:			'hola',
			nClicks:    	0 };
			
		this.click 			= this.click.bind ( this );
		this.burgerClick	= this.burgerClick.bind ( this );
		this.doAll			= this.doAll.bind ( this );
	}

	click ( ev: any ) {
		const sW = 'ContentExample1 click()';
		this.state.nClicks += 1;
		stateNClicks = this.state.nClicks;
		cmn.log ( sW, 'nClicks ' + this.state.nClicks );
	}	//  click()

	burgerClick ( o: any ) {
		let sW = 'ContentExample1 burgerClick()';
		cmn.log ( sW );
		let pe = <HTMLElement>
				 document.getElementById ( o.paneEleId );
		let r  = pe.getBoundingClientRect();
		prpAppFrameFnc ( { 
			do: 		'show-menu',
			menuEleId:	prpEleId + '-burger-menu',
			menuX:		r.x - 1,
			menuY:		r.y - 1,
			menuItems:	[ { type: 'item', text: 'Client' },
						  { type: 'item', text: 'Content' },
						  { type: 'item', text: 'Burger' },
						  { type: 'item', text: 'Menu' },
						  { type: 'item', text: 'Items' } ],
			upFnc:		this.doAll,
			ctx:		{ what:		'content example-1 burger',
						  after:	'menu-item' }
		} );
	}	//	burgerClick()

	doAll ( o: any ) {
		let sW = 'ContentExample1 doAll() ' + o.do;
		if ( o.to ) {
			sW += ' to ' + o.to; }
		if ( o.do === 'identify' ) {
			return { name:		'ContentExample1',
					 fnc:		this.doAll,
					 frameId:	prpFrameId,
					 paneId:	prpPaneId }; }
		//	'init-new' is commanded  * one *  time in the entire life time
		//	of the data of this component - that includes multiple lifes of 
		//	this component as an element in the DOM because of things like 
		//	pane splits, persisting, etc.  In other words, talking about the 
		//	life time of the data not just life in the DOM.
		if ( o.do === 'init-new' ) {
			this.state.style.visibility = 'visible';
			this.state.text 	= 'Hello, World?';
			this.state.nClicks	= 0;
			stateStyle   = cmn.stringifyStyle ( this.state.style );
			stateText    = this.state.text;
			stateNClicks = this.state.nClicks;
			return;
		}
		if ( o.do === 'get-state' ) {
			return { state: clone ( this.state ) };
		}
		if ( o.do === 'set-state' ) {
			if ( ! this.isMountified ) {
				this.state = o.state.state; }
			else {
				this.state = clone ( o.state.state );
				stateStyle   = cmn.stringifyStyle ( this.state.style ); }
				stateText    = this.state.text;
				stateNClicks = this.state.nClicks;
			return;
		}
		if ( o.do === 'pane-burger-click' ) {
			this.burgerClick ( o );
			return;
		}
		if ( o.do === 'menu-item' ) {
			return;
		}
	}	//	doAll()

};	//	class	ClassContentExample1

	let self = new ClassContentExample1();

	stateStyle   = cmn.stringifyStyle ( self.state.style );
	stateText    = self.state.text;
	stateNClicks = self.state.nClicks;

	onMount ( () => {
		const sW = 'ContentExample1 onMount()'
		self.isMountified = true;

		prpAppContentFnc ( { do:        'set-call-down',
							 to:        'client-content',
							 frameId:   prpFrameId,
							 paneId:	prpPaneId,
							 fnc:       self.doAll } );

		//	This must be done here (after mounting) because it results 
		//	in this being commanded 'init-new' which sets state.
		//	However, with the check of self.isMountified in that command
		//	handler (see o.do === 'set-state' above), this may not matter.
		prpClientAppFnc ( { do: 		'set-call-down',
							to:			'client-content',
							paneId:		prpPaneId,
							fnc:		self.doAll } );
	} )	//	onMount()

	afterUpdate ( () => {
		const sW = 'ContentExample1 afterUpdate()';
	} )	//	afterUpdate()

	onDestroy ( () => {
		const sW = 'ContentExample1 onDestroy()';
	} )	//	onDestroy()


</script>

<content-example-1>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div id         = { prpEleId }
		 style		= { stateStyle }
		 on:click	= { self.click } >
		<p>{ stateText }</p>
		<p>nClicks: { stateNClicks }</p>
	</div>

</content-example-1>

<style>

</style>

