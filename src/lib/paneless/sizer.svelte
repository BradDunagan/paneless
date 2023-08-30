<script lang="ts">
	import { onMount }		from 'svelte';
	export let frameId			= 0;
    export let frameFnc: any	= null;
    export let frameEleId   	= '';

    function stringifyStyle(): string {
        let s = '';
        for ( const p in self.state.style ) {
            s += p + ': ' + self.state.style[p] + '; '; };
        return s;
    }	//	stringifyStyle()

let self = {
	eleId:  'sizer-' + frameEleId,
	state:  {
		style: {
			left:	'0px',
			top:	'0px',
			width:	'0px',
			height:	'0px'
		},
		styleString:	'',
	},

	sizeX0:     0,
	sizeY0:     0,

	doAll ( o: any ) {
		let sW = frameId + ' Sizer doAll() ' + o.do;
		if ( o.do === 'size' ) {
			self.state.style = {
				left:	(self.sizeX0 + o.dX) + 'px',
				top:	(self.sizeY0 + o.dY) + 'px',
				width:	self.state.style.width,
				height:	self.state.style.height };
			self.state.styleString = stringifyStyle();
			return;
		}
	},

	mouseDown ( ev: any ) {
		let sW = 'mouseDown()';
	//	cmn.log ( sW );
		self.sizeX0 = parseInt ( self.state.style.left );
		self.sizeY0 = parseInt ( self.state.style.top );
		frameFnc ( { do: 	'size-start',
					 ev: 	ev } );
	},	//	mouseDown()

	mouseUp ( ev: any ) {
		let sW = 'mouseUp()';
	//	cmn.log ( sW );
	},	//	mouseUp()
	
};  //  self

	self.state.styleString = stringifyStyle();

	onMount ( () => {
		const sW = 'paneless ' + frameId + ' Sizer onMount()';
		frameFnc ( { do: 		'set-call-down',
					 to:		'sizer',
					 sizerFnc:  self.doAll } );

		let e = <HTMLElement>
				document.getElementById ( self.eleId );
		let p = e.parentElement;
		if ( ! p ) {
			return; }
		self.state.style = { left:	(p.clientWidth  - 19) + 'px',
							 top:	(p.clientHeight - 19) + 'px',
							 width: '18px',
							 height:'18px' }
		self.state.styleString = stringifyStyle();
    } ) //  onMount()


</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<sizer
	id				= { self.eleId }
	style			= { self.state.styleString }
	on:mousedown	= { self.mouseDown }
	on:mouseup      = { self.mouseUp } >

</sizer>

<style>
	sizer {
		position:       		absolute;
		border-left:       		solid 1px lightgray;
		border-top:       		solid 1px lightgray;
		cursor:         		nwse-resize;
		background-color:       transparent;
		opacity:                0.0;
		transition-property:    background-color, 
								opacity, 
								border-left, 
								border-top;
		transition-duration:    300ms;
	}

	sizer:hover {
		background-color:       white;
		opacity:                0.9;
	}

</style>
