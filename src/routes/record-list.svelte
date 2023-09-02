<script lang="ts">
/*
		 1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/
import { onMount, tick }	from 'svelte';
import { cmn }				from '$lib/paneless/common';
import RecordListItem		from './record-list-item.svelte';

export let prpFrameId		= 0;
export let prpPaneId		= 0;
export let prpDlg			= null;
export let prpName			= '';
export let prpWidth			= null;
export let prpHeight		= null;
export let prpLeft			= null;
export let prpPosition		= null;

let listItems = [];

class ClassRecordList {

	state:			any;
	style:			any;
	styleString:	string;
	list:			any[];

	constructor() {
		this.state = {
			iSelected:      -1
		};
		this.style = {
			height:			prpHeight,
			'overflow-y':	'scroll'
		};
		if ( prpWidth ) {
			this.style.width = prpWidth; }
		if ( prpLeft ) {
			this.style.left = prpLeft; }
		if ( prpPosition ) {
			this.style.position = prpPosition; }

		this.list = [];

		this.load			= this.load.bind ( this );
		this.keyDown		= this.keyDown.bind ( this );
		this.select			= this.select.bind ( this );
		this.isUniqueName	= this.isUniqueName.bind ( this );
		this.doAll			= this.doAll.bind ( this );
	}	//	constructor()

	load ( o ) {
		const sW = 'RecordList load()';
		let self = this;

		this.list = o.list.map ( r => {
			return { hRec:		r.handle_id,
					 recId:		r.rec_id,
					 name:		r.name,
					 styleFnc:	null }; } );

		listItems = this.list.map ( ( r: any, i ) => {
			return { key:		r.recId,
					 idx:		i, 
					 hRec:		r.hRec,
					 recId:		r.recId,
					 style:		{ 'background-color': 'white' },
					 name:		r.name,
					 list:		self.doAll }; } );
		tick();
	}	// load()

	keyDown ( o ) {
		let sW = 'RecordList keyDown()';
		if ( o.ev.altKey ) {
			sW += ' alt' }
		sW += ' ' + o.ev.key;
	//	cmn.log ( sW );

		if ( o.ev.key === 'ArrowUp' ) {
			let n = listItems.length;
			let i = this.state.iSelected;
			if ( --i < 0 ) {
				i = n - 1; }
			this.select ( i );
			return true; }
		if ( o.ev.key === 'ArrowDown' ) {
			let n = listItems.length;
			let i = this.state.iSelected;
			if ( ++i >= n ) {
				i = 0; }
			this.select ( i );
			return true; }
		return false;
	}	//	keyDown()

	select ( idx ) {
		let sW = 'RecordList select()';
		cmn.log ( sW, 'selected recId ' + this.list[idx].recId );
		if ( this.state.iSelected >= 0 ) {
		//	let item = listItems[this.state.iSelected];
		//	item.style['background-color'] = 'white'; 
		//	tick(); 
			let item = this.list[this.state.iSelected];
			item.styleFnc ( { 'background-color': 'white' } ); }
		if ( idx !== this.state.iSelected ) {
		//	let item = listItems[idx];
		//	item.style['background-color'] = 'lightgrey';
			this.state.iSelected = idx;
		//	tick();
			this.list[idx].styleFnc ( { 'background-color': 'lightgray' } );
			prpDlg ( { do:  	'record-selected', 
					   comp:	prpName,
					   hRec:	this.list[idx].hRec,
					   recId: 	this.list[idx].recId,
					   recName:	this.list[idx].name} );
		//	item.ref.current.scrollIntoViewIfNeeded(); 
		}
		else {
			this.state.iSelected = -1;
			prpDlg ( { do:		'record-selected', 
					   comp:	prpName,
					   hRec:	0,
					   recId:	0,
					   recName:	'' } ) }
	}	//	select()

	isUniqueName ( o ) {
		const sW = 'RecordList isUniqueName()';
		cmn.log ( sW, o.name );
		if ( this.list.length === 0 ) {
			return true; }
		return this.list.every ( r => r.name !== o.name );
	}	//	isUniqueName()

	doAll ( o ) {
		const sW = 'RecordList doAll() ' + o.do;
		if ( o.do === 'identify' ) {
			return { name:		'RecordList',
					 fnc:		this.doAll,
					 frameId:	prpFrameId,
					 paneId:	prpPaneId }; }
		if ( o.do === 'load' ) {
			this.load ( o );
			return; }
		if ( o.do === 'keyboard-key-down' ) {
			return this.keyDown ( o ); }
		if ( o.do == 'set-item-style-fnc' ) {
			this.list[o.idx].styleFnc = o.fnc;
			return; }
		if ( o.do === 'select' ) {
			this.select ( o.idx );
			return; }
		if ( o.do === 'is-unique-name' ) {
			return this.isUniqueName ( o ); }
	}	//	doAll()

}	//	ClassRecordList

	let self = new ClassRecordList();

	self.styleString = cmn.stringifyStyle ( self.style );

	onMount ( () => {

		//	Call up to set a call down to self.doAll().
		prpDlg ( { do: 		'set-call-down', 
				   to: 		'RecordList',
				   comp:	prpName,
				   fnc: 	self.doAll } );

		//	Have the dialog provide the list contents.
		prpDlg ( { do:		'provide-list',
				   comp:	prpName } );
	} )	//	onMount()

</script>

<record-list class = "rr-record-list"
			 style = { self.styleString } >
	<ul>
		{#each listItems as item ( item.key ) }
			<RecordListItem prpIdx			= { item.idx }
							prpStyleString	= { cmn.stringifyStyle ( item.style ) }
							prpName			= { item.name }
							prpList			= { item.list } />
		{/each}
	</ul>
</record-list>

<style>

	.rr-record-list {
		position:           relative;
		border:             solid 1px gray;
		width:              260px;
		left:               45px;
		padding-top:	    5px;
		display:		    flex;
		flex-direction:     column;
		overflow:			hidden;
	}

	.rr-record-list ul {
		list-style: 		none;
		padding-left: 		0px;
		margin-top: 		0px;	
	}

</style>
