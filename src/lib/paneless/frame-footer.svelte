<script lang="ts">
	import { onMount, beforeUpdate, onDestroy }	from 'svelte';
	import { cmn }		    					from './common';
    export let frameEleId       = '';
    export let style            = null;
    export let frameFnc         = null;

    const eleId = frameEleId + '-footer';

    function stringifyStyle(): string {
        let s = '';
        for ( const p in self.state.style ) {
            s += p + ': ' + self.state.style[p] + '; '; };
        return s;
    }

let self = {
	state:	{
		style:			style,
		styleString:	"",
	},

	height:	0,

	isVisible() {
		if ( ! (self.state.style && self.state.style.display) ) {
			return true; }
		return self.state.style.display !== 'none'; 
	},	//	isVisible()

	doAll ( o ) {
		if ( o.do === 'is-visible' ) {
			return self.isVisible(); }
	},	//	doAll()

};

	self.state.styleString = stringifyStyle();

	onMount ( () => {
		const sW = 'paneless FrameFooter onMount()';
		let e    = document.getElementById ( eleId );
		if ( ! e ) {
			cmn.log ( sW, ' Error: no element' ); }
		else {
			self.height = e.offsetHeight; };

		frameFnc ( { do: 	'set-call-down',
					 to:	'frame-footer',
					 fnc:	self.doAll } );
    } ) //  onMount()


	beforeUpdate ( () => {
		self.state.style = style;
		self.state.styleString = stringifyStyle();
	} )	//	beforeUpdate()

	onDestroy ( () => {
		frameFnc ( { do: 	'set-call-down',
					 to:	'frame-footer',
					 fnc:	null } );
    } ) //  onDestroy()


</script>

<frame-footer
	id			= { eleId }
	style		= { self.state.styleString } >

</frame-footer>

<style>
    frame-footer {
        position:			absolute;
        width:				100%;
        height:				18px;
        border-top:         solid 1px black;
    }

</style>

