<script lang="ts">

	import { onMount, onDestroy, afterUpdate }	from 'svelte';
	import clone 		from 'clone';	//	In tsconfig.json, "allowjs": true	
	import { cmn }    	from './common';

	export let prpAtFrameTop	= false;
	export let prpBsrId			= 0;        //  button split restore id
	export let prpPaneFnc: any		= null; 
	export let prpFrameFnc: any		= null;
	export let prpContainerFnc: any	= null;

    function stringifyStyle ( style: any ): string {
        let s = '';
        for ( const p in style ) {
            s += p + ': ' + style[p] + '; '; };
        return s;
    }	//	stringifyStyle()

let self = {

	eleId:			'rr-btn-split-restore-' + prpBsrId,

	state:	{
		style: {
			display:			'null',
			left:				'0px',
			top:				'0px',
			height:				'20px',
			'background-color':	'transparent',
			opacity:			'0.0',
		},

		styleString:		'',
	},

	isFrameHeaderTransient:		false,

	frameHdrWasHidden:	true,
//	disallowShow:		false,

	bShow:				false,
    prevRatio:          0,

	show ( o ) {
		const sW = 'BtnSplitRestore show()';

		if ( (! self.bShow) && ! o.bShow ) {
			return; }

		if ( self.bShow && ! o.bShow ) {
			cmn.log ( sW, '    unshowing ...' ); }

		let style: any = {
			height:					'20px',
            display:                o.bShow ? 'null' : 'none',
			'background-color':		'white',
			opacity:                '0.9' };
		let isFrameHeaderTransient =
			prpFrameFnc ( { do: 'is-header-transient' } );
		if ( prpAtFrameTop && isFrameHeaderTransient ) {
			style.top = '18px'; }

		self.state.style = style;
		self.state.styleString = stringifyStyle ( self.state.style );
        
        if ( o.bShow ) {
            self.prevRatio = o.prevRatio; }
       
		self.bShow = o.bShow;

        return null;
	},	//	show()

    click ( e ) {
		prpPaneFnc ( { do: 		'splitter-restore',
					   b0:		true,
					   ratio:	self.prevRatio } );
    },  //  click()

	doAll ( o: any ) {
		let sW = 'BtnSplitRestore doAll() ' + o.do;
		if ( o.to ) {
			sW += ' to ' + o.to; }
		if ( o.do === 'set-call-down' ) {
			return null; }
		if ( o.do === 'show' ) {
            return self.show ( o ); }
	//	if ( o.do === 'disallow-pane-edits' ) {
	//		self.disallowShow = true; 
	//		let style = clone ( self.state.style );
	//		style.display = 'none';
	//		self.state.style = style;
	//		self.state.styleString = stringifyStyle ( self.state.style );
	//		return null; }
        cmn.error ( sW, 'unrecognized do' );
        return null;
	},	//	doAll()

};  //  self

	self.isFrameHeaderTransient =
		prpFrameFnc ( { do: 'is-header-transient' } );

	if ( prpAtFrameTop && self.isFrameHeaderTransient ) {
		self.state.style.top = '18px'; }

	self.state.styleString = stringifyStyle ( self.state.style );

	onMount ( () => {
		const sW = 'paneless BtnSplitRestore  onMount()';
	//	cmn.log ( sW );
		if ( prpContainerFnc ) {
			prpContainerFnc ( { do: 			'set-call-down',
								to:				'btn-split-restore',
								bbEleId:		self.eleId,
								bsrFnc:			self.doAll  } ); }

		prpPaneFnc ( { do: 		'set-call-down',
					   to:		'btn-split-restore',
					   bbEleId:	self.eleId,
					   bsrFnc:	self.doAll } );	
	} )	//	onMount()

</script>

<btn-split-restore>

	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div id				= { self.eleId }
		 class			= 'rr-btn-split-restore' 
		 style 			= { self.state.styleString }
         on:click       = { self.click } >
        restore
	</div>

</btn-split-restore>

<style>

	.rr-btn-split-restore {
		position:               absolute;
		top:					0px;
		width:					100%;
		text-align:				center;
		cursor:					default;
	}
</style>

