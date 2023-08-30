<script lang="ts">

	import { onMount, afterUpdate }	from 'svelte';
	import { tick }		from 'svelte';
	import { cmn }    	from './common';
	import Tabs			from './tabs.svelte';
	import NoContent 	from './no-content.svelte';

	export let prpEleId 		= '';
	export let prpAtFrameTop	= false;
	export let prpFrameId 		= 0;
	export let prpPaneId		= 0;
	export let prpPaneFnc: any			= null;
	export let prpFrameFnc: any 		= null;
	export let prpAppContentFnc: any	= null;
	export let prpClientFnc: any		= null;
	export let prpTabs: any				= false;

	function stringifyStyle ( style: any ): string {
		let s = '';
		for ( const p in style ) {
			s += p + ': ' + style[p] + '; '; };
		return s;
	}	//	stringifyStyle()

let self = {

	state:{
			style:			{},
			styleString:	'',
			typeName:		'NoContent',
			content:		{
				comp:	NoContent,
				props:	null 
			},
		},

	mouseDown ( ev ) {
		const sW = 'paneless PaneContent ' + prpPaneId + ' mouseDown() ';
		cmn.log ( sW );
		prpAppContentFnc ( { do:		'set-pane-focus',
							 frameId:	prpFrameId,
							 paneId:	prpPaneId } ); 
	},	//	mouseDown()

	doAll ( o: any ) {
		const sW = 'paneless PaneContent ' + prpPaneId + ' doAll(): ' + o.do;
	//	cmn.log ( sW );
	switch ( o.do ) {
		case 'install-client-content': {
		//	this.setState ( { style:	o.parentStyle,
		//					  typeName:	o.contentTypeName,
		//					  content:	o.content		   }, () => {
			self.state.style = o.parentStyle;
			self.state.styleString = stringifyStyle ( self.state.style );
			self.state.typeName = o.contentTypeName;
			self.state.content  = o.content;
			tick().then ( () => {
			//	cmn.log ( sW, 'done?' );
				prpClientFnc ( { do:	'set-state-changed' } ); } );

			if ( prpPaneFnc && o.initialTabText ) {
				prpPaneFnc ( { do: 				'set-initial-tab-text',
							   initialTabText: 	o.initialTabText } ); }
			return;
		}

		case 'is-content-installed':
			return ! self.state.content;

		case 'empty':
			self.state = { style:		{},
						   styleString:	'',
						   typeName:	'NoContent',
						   content:		{
		   						comp:	NoContent,
				   				props:	null } };
			self.state.styleString = stringifyStyle ( self.state.style );
			tick().then ( () => {
				prpPaneFnc ( { do: 		'set-call-down',
							   to: 		'empty-client-content',
							   paneId:	prpPaneId,
							   fnc:		null } );
				prpClientFnc ( { do:	'set-state-changed' } ); } );
			return true;

		default:
			cmn.error ( sW, 'unrecognized do - ' + o.do )
	}	//	switch ( o.do )
	},	//	doAll()

};	//	self

	self.state.styleString = stringifyStyle ( self.state.style );
	
	onMount ( () => {
		const sW = 'paneless PaneContent ' + prpPaneId + ' onMount()';
	//	cmn.log ( sW );

		//	Do this here (after mounting) because the client might command
		//	'install-client-content' which will setState().
		prpClientFnc ( { do: 			'set-call-down',
						 to:			'pane-content',
						 paneId:		prpPaneId,
						 paneFnc:		prpPaneFnc,
						 contentFnc:	self.doAll,
						 tabs:			prpTabs } );

		prpPaneFnc ( { do: 		'set-call-down-correct',
					   to:		'pane-content',
					   fnc:		self.doAll } );
	} )	//	onMount()

	afterUpdate ( () => {
		const sW = 'paneless PaneContent ' + prpPaneId + ' afterUpdate()';
		prpClientFnc ( { do: 		'pane-content-update',
						 paneId:	prpPaneId,
						 tabs:		prpTabs,
						 typeName:	self.state.typeName } );
	})	//	afterUpdate()

</script>

<pane-content>

    {#if prpTabs }
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div id 			= { prpEleId }
			 class			= 'pane-content'
			 on:mousedown	= { self.mouseDown } >
			<Tabs prpEleId			= { prpEleId + '-tabs' } 
				  prpAtFrameTop		= { prpAtFrameTop }
				  prpFrameId 		= { prpFrameId }
				  prpPaneFnc		= { prpPaneFnc }
				  prpAppContentFnc	= { prpAppContentFnc }
				  prpFrameFnc		= { prpFrameFnc }
				  prpClientFnc		= { prpClientFnc } />
		</div>
    {:else}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div id 			= { prpEleId }
			 class			= 'pane-content'
			 style 			= { self.state.styleString } 
			 on:mousedown	= { self.mouseDown } >
			<svelte:component this = { self.state.content.comp } 
									 { ...self.state.content.props } />
		</div>
    {/if}

</pane-content>

<style>

	.pane-content {
		background-color: 	#fff;
		height:				100%;
	}

</style>

