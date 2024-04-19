<script lang="ts">

	import { onMount, beforeUpdate, afterUpdate, tick }	from 'svelte';
	import { cmn }    			from './common';
	import MenuItemsSeparator 	from './menu-item-separator.svelte';
	import MenuItem 			from './menu-item.svelte';

	export let prpEleId 				= '';
	export let prpStyle: any			= { };
	export let prpItems: any [] 		= [ ];
	export let prpAppFrameFnc: any		= null;
	export let prpScreenFnc: any 		= null;
	export let prpUpFnc: any			= null;
	export let prpCtx: any				= null;
	export let prpIsSubMenu: boolean	= false;
	export let prpRes: any				= null;
	export let prpRej: any				= null;
	export let prpSelectedItemIndex: any 	= null;
    
	function stringifyStyle ( style: any ): string {
		let s = '';
		for ( const p in style ) {
			s += p + ': ' + style[p] + '; '; };
		return s;
	}	//	stringifyStyle()

let self = {

	state:	{
		listItems:  []
	},

	styleString:		'',

	curItem:			<any>null,

	itemEleIdPrefix:	prpEleId + '-menu-item-',

	prevGAMF:			null,
	
	bFirstUpdate:		true,


	setGlobalActiveMenuFnc ( fnc ) {
		self.prevGAMF = prpAppFrameFnc ( { do:	'set-call-down',
										   to:	'active-menu',
										   fnc:	fnc } );
	},	//	setGlobalActiveMenuFnc()

	clickItem ( text ) {
		const sW = 'BurgetMenu clickItem() ' + text;
		cmn.log ( sW );
		let i = prpItems.findIndex ( item => item.text === text );
		if ( i < 0 ) {
			cmn.error ( sW, 'not found' );
			return; }
	//	self.selectItem ( i );
		let ele: null | HTMLElement = 
			document.getElementById ( self.itemEleIdPrefix + i );
		if ( ele ) {
			ele.click();
			ele.focus(); }
	},	//	clickItem()

	selectItem ( i ) {
		let item = prpItems[i];
		let bDisabled = cmn.isBoolean ( item.disabled ) && item.disabled;
		if ( bDisabled ) {
			return; }
		if ( item.bSubmenu ) {
			if ( item.fnc ) {
				let menuItems = item.fnc ( item ); 
				if ( ! menuItems ) {
					return; }
				let ele = <HTMLElement>document.getElementById ( prpEleId );

				let x = Number.parseInt ( prpStyle.left );
				if ( x >= 0 ) {
					x = x + ele.clientWidth + 4; }
				else {
				}
				let y =   Number.parseInt ( prpStyle.top )
						+ 1;
				prpScreenFnc ( {
					do:				'push-sub-menu',
					menuEleId:		prpEleId + '-s',
					menuX:			x,
					menuY:			y,
					menuItems:		menuItems,
					appFrameFnc: 	prpAppFrameFnc,
					screenFnc:		prpScreenFnc,
					upFnc:			prpUpFnc,
					ctx:			prpCtx } );
				return; }
			return; }
		prpScreenFnc ( { do: 'menu-dismiss' } );
	//	self.setGlobalActiveMenuFnc ( self.prevGAMF );
		self.setGlobalActiveMenuFnc ( null );
		tick().then ( () => {
			if ( item.fnc ) {
				item.fnc ( item ); 
				return; }
			prpUpFnc ( { do: 			prpCtx.after,
						 menuItemText:	item.text } );
		} );
	},	//	selectItem()

	setCurItem ( i: number, ele? : any ) {
		if ( self.curItem && self.curItem.ele ) {
			self.curItem.ele.style['background-color'] = 'white'; }
		if ( ! ele ) {
			ele = <null | HTMLElement>
				  document.getElementById ( self.itemEleIdPrefix + i ); }
		if ( ! ele ) {
			return; }
		ele.style['background-color'] = 'lightgray';
		self.curItem = {
			idx:	i,
			ele:	ele };
	},	//	setCurItem()

	keyDown ( ev ) {
		let sW = 'BurgerMenu keyDown()';
	//	cmn.log ( sW, '  ' + prpEleId + '  ' + ev.key );
		let i, j;
		let items  = prpItems;
		let nItems = items.length;
		function decoratedCharacter ( item ) {
			let iOB = item.text.indexOf ( '[' );
			let iCB = item.text.indexOf ( ']' );
			let isDecorated = (iCB - iOB === 2);
			if ( ! isDecorated ) {
				return null; }
			return item.text[iOB+1].toLowerCase();
		}	//	decoratedCharacter()
		function nextMatching ( ci, dc ) {
			let j = (ci + 1) % nItems;
			while ( j !== ci ) {
				if ( decoratedCharacter ( items[j] ) === dc ) {
					return j; }
				j = (j + 1) % nItems; }
			return -1;
		}	//	nextMatching()
		if ( ev.key === 'Enter' ) {
			if ( self.curItem ) {
				self.selectItem ( self.curItem.idx );
				return true; }
			return false; }
		//	key is an item's decorated character ?
		for ( i = 0; i < nItems; i++ ) {
			if ( ev.altKey ) {		//	frame, pane, control navigation
				break; }
			let dc = decoratedCharacter ( items[i] );
			if ( ! dc ) {
				continue; }
			if ( ev.key.toLowerCase() === dc ) {
				let ci = self.curItem ? items[self.curItem.idx] : null;
				//	multiple items have the same character decorated ?
				if ( ci && (decoratedCharacter ( ci ) === dc) ) {
					if ( (j = nextMatching ( self.curItem.idx, dc )) >= 0 ) {
						self.setCurItem ( j );
						return true; } }
				self.setCurItem ( i );
				if ( nextMatching ( i, dc ) >= 0 ) {
					return true; }
				self.selectItem ( i );
				return true;
			} }
		if ( ev.key === 'ArrowDown' ) {
			i = self.curItem ? self.curItem.idx + 1 : 0;
			if ( i >= nItems ) {
				i = 0; }
			j = i;
			while ( items[i].type !== 'item' ) {
				i += 1;
				if ( i >= nItems ) {
					i = 0; }
				if ( j === i ) {
					return true; } }
			self.setCurItem ( i );
			return true;	}
		if ( ev.key === 'ArrowUp' ) {
			i = self.curItem ? self.curItem.idx - 1 : nItems - 1;
			if ( i < 0 ) {
				i = nItems - 1; }
			j = i;
			while ( items[i].type !== 'item' ) {
				i -= 1;
				if ( i < 0 ) {
					i = nItems - 1; }
				if ( j === i ) {
					return true; } }
			self.setCurItem ( i );
			return true; }
		if ( ev.key === 'ArrowRight' ) {
			if ( ! self.curItem ) {
				return false; }
			let i    = self.curItem.idx;
			let item = prpItems[i];
			if ( item.bSubmenu ) {
				self.selectItem ( i ); }
			return true; }
		if ( ev.key === 'ArrowLeft' ) {
			if ( ! prpIsSubMenu ) {
				return false; }
			self.setGlobalActiveMenuFnc ( self.prevGAMF );
			prpScreenFnc ( { do: 'pop-sub-menu' } );
			return true; }
		for ( i = 0; i < nItems; i++ ) {
			if ( ev.altKey ) {		//	frame, pane, control navigation
				break; }
			let item = items[i];
			if ( ! item.hotKey ) {
				continue; }
			if ( item.hotKey === ev.key ) {
				self.selectItem ( i );
				return true; }
		}	//	for
		return false;
	},	//	keyDown()

	mouseEnter ( i, ev ) {
		let sW = 'BurgerMenu mouseEnter()';
	//	cmn.log ( sW, '  ' + ev.target.innerText );
		self.setCurItem ( i );
	},	//	mouseEnter()

	mouseLeave ( i, ev ) {
		let sW = 'BurgerMenu mouseLeave()';
	//	cmn.log ( sW, '  ' + ev.target.innerText );
	//	ev.target.style['background-color'] = 'white';
		let ele = <null | HTMLElement>
				  document.getElementById ( self.itemEleIdPrefix + i );
		if ( ele ) {
			ele.style['background-color'] = 'white'; }
		self.curItem = null;
	},	//	mouseLeave()
	
	click ( i, ev ) {
		let sW = 'BurgerMenu click()';
	//	cmn.log ( sW, '  ' + ev.target.innerText );
		ev.stopPropagation();
		self.selectItem ( i );
	},	//	click()

	doAll ( o ) {
		if ( o.do === 'is-app-title-menu' ) {
			let ctx = prpCtx;
			if ( (! ctx) || (typeof ctx.what !== 'string') ) {
				return false; }
			return ctx.what === 'app title';
		}
		if ( o.do === 'keyboard-escape' ) {
			if ( prpIsSubMenu ) {
				prpScreenFnc ( { do: 'pop-sub-menu' } );
				self.setGlobalActiveMenuFnc ( self.prevGAMF );
				return; }
			prpScreenFnc ( { do: 'menu-dismiss' } );
			self.setGlobalActiveMenuFnc ( self.prevGAMF );
			return;
		}
		if ( o.do === 'keyboard-key-down' ) {
			return self.keyDown ( o.ev );
		}
		if ( o.do === 'being-dismissed' ) {
			if ( typeof prpCtx.dismiss === 'string' ) {
				prpUpFnc ( { do: prpCtx.dismiss } ); }
			return;
		}
		if ( o.do === 'click' ) {
			self.clickItem ( o.text );
			return;
		}
	},	//	doAll()

};	//	self

	self.styleString = stringifyStyle ( prpStyle );

	prpItems.forEach ( item => {
		if ( ! cmn.isString ( item.hotKey ) ) {
			item.hotKey = ''; }
	} );

	onMount ( () => {
		self.setGlobalActiveMenuFnc ( self.doAll );
		if ( 	cmn.isNumber ( prpSelectedItemIndex ) 
			 && (prpSelectedItemIndex >= 0) ) {
			self.setCurItem ( prpSelectedItemIndex ); }
		else {
			self.setCurItem ( 0 ); }
	} )	//	onMount()
	
	beforeUpdate ( () => {
		const sW = 'paneless BurgerMenu beforeUpdate()';
	//	cmn.log ( sW );
	} )	//	beforeUpdate()

	afterUpdate ( () => {
		const sW = 'paneless BurgerMenu afterUpdate()';
	//	cmn.log ( sW );
		let x = Number.parseInt ( prpStyle.left );
		if ( x < 0 ) {
			let ce = <null | HTMLElement>
					 document.getElementById ( prpEleId );
			if ( ce ) {
				let r  = ce.getBoundingClientRect();
				ce.style.left = ((-x) - r.width) + 'px'; } }
		if ( self.bFirstUpdate ) {
			if ( cmn.isFunction ( prpRes ) ) {
				prpRes ( 'BurgerMenu - first update' );
			self.bFirstUpdate = false; } }
	} )	//	afterUpdate()


</script>

<burger-menu>

	<div id			= { prpEleId }
		 style		= { self.styleString }
		 class		= 'burger-menu' >
		<ul>
	{#each prpItems as mi, i }
		{#if mi.type === 'separator' }
			<li >
				<MenuItemsSeparator />
			</li>
		{:else}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<li id		= { self.itemEleIdPrefix + i }
				data-testid 	= { mi.testId }
				on:mouseenter	= { self.mouseEnter.bind ( self, i ) }
				on:mouseleave	= { self.mouseLeave.bind ( self, i ) }
				on:click		= { self.click.bind ( self, i ) } >
				<MenuItem prpText	= { mi.text }
						prpHotKey	= { mi.hotKey }
						prpDisabled	= { cmn.isBoolean ( mi.disabled )
													 && mi.disabled } />
			</li>
		{/if}
	{/each}
		</ul>
	</div>

</burger-menu>

<style>

	.burger-menu {
		position:			fixed;
		border:				solid 1px black;
		background-color:	white;
	}

	.burger-menu ul {
		margin:				2px 4px 0px 8px;
		padding:			0px;
	}

	.burger-menu ul li {
		list-style-type:	none;
		text-align:			left;
		margin-bottom:		4px;
		padding-left:		4px;
		padding-right:		2px;
		cursor:				default;
	}

</style>
