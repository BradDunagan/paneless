<script lang="ts">

	import { cmn }    		from './common';

	export let prpEleId			= '';
	export let prpText			= 'tab-name';
	export let prpTabsFnc: any	= null;

	function stringifyStyle ( style: any ): string {
		let s = '';
		for ( const p in style ) {
			s += p + ': ' + style[p] + '; '; };
		return s;
	}	//	stringifyStyle()

let self = {

	state:	{
		style:			{},
		styleString:	'',
	},
	
	mouseDown ( ev ) {
		const sW = 'TabName mouseDown()';
		cmn.log ( sW );
		ev.stopPropagation();
	},	//	mouseDown()

	click ( ev ) {
		prpTabsFnc  ( { do: 		'name-click',
						nameEleId: 	prpEleId } );
	},	//	click()

	doAll ( o ) {
		if ( o.do === 'select' ) {
			if ( o.selected ) {
				self.state.style = {
					'border-top':	'solid 1px white',
					'padding-top':	'3px',
					'color':		'blue' };
				self.state.styleString = stringifyStyle ( self.state.style ); 
			} else {
				self.state.style = {};
				self.state.styleString = stringifyStyle ( self.state.style ); 
			}
			return;
		}
	},	//	doAll()

};

	self.state.styleString = stringifyStyle ( self.state.style ); 

	prpTabsFnc  ( { do:			'set-call-down',
					to:			'tab-name',
					nameEleId:	prpEleId,
					nameFnc:	self.doAll } );

</script>

<tab-name>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div id				= { prpEleId }
		 class			= 'tab-page-name'
		 style			= { self.state.styleString } 
		 on:mousedown	= { self.mouseDown }
		 on:click		= { self.click } >
		{ prpText }
	</div>

</tab-name>

<style>

	.tab-page-name {
		margin-top:			-1px;
		padding-left:		8px;
		padding-right:		8px;
		padding-top:		4px;
		padding-bottom:		4px;
		border-right:		solid 1px gray;
		cursor:				pointer;
	}

</style>

