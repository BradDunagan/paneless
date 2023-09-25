/*
		 1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

import PanelBase 		from './panel-base';
import { cmn }			from '$lib/paneless/common';
import { uc } 			from '$lib/paneless/udui-common';
/*
import { cmnTree }		from '../common/tree';
import { uList }		from 'paneless';
import { db,
		 type RecordData,
		 type GusRecordData,
		 type NameIdTypeData }	from '../db/db';

import { record }		from '../db/record';

import { userAuth } 	from '../user-auth';
import context			from '../context/context';
import GraphTypes		from '../graph/graph-types';
import { post }			from '../net/net';
*/


class DlgSelectRobotSystem3 extends PanelBase {

	appFrameFnc:		any;
	args:				any;
	systemData:			any;
	rootTypeName:		string;
	curType:			any;
	grpId:				number;
	grpMbrId:			number;
	thdId:				number;
	frame:				any;
	dropdownUserId:		number;
	rootTypeId:			null | number;
	gt:					any;
	grpNodes:			any;
	systemSelected:		any;
	regSpec:			any;
	bRegistered:		boolean;

	constructor ( o ) {
		super ( o );

		this.appFrameFnc	= o.appFrameFnc;
		this.args			= o.args;

		this.updateRegistration
							= this.updateRegistration.bind ( this );

		this.systemData		= cmn.isObject ( o.args ) ? o.args.systemData 
													  : null;

		this.rootTypeName	= '';
		this.curType 		= null;		//	currently selected type
		this.grpId			= 0;		//	currently selected group
		this.grpMbrId		= 0;		//	userId of selected group member

		this.thdId		= this.clientAppFnc ( { do: 'get-app-thd-id' } );

		this.frame		= this.clientAppFnc ( { do:			'get-frame',
												frameId:	o.frameId } );
		
		this.dropdownUserId	= 0;

		this.edtInput	= this.edtInput.bind ( this );
		this.onOptions	= this.onOptions.bind ( this );

		this.rootTypeId = null;
		
		this.gt = null;

		this.grpNodes		= {};
		this.systemSelected = null;
		this.regSpec		= null;	
		this.bRegistered	= false;

//		this.doAll			= this.doAll.bind ( this );

		this.appFrameFnc ( { do:	'set-call-down',
							 to:	'active-dialog',
					//		 fnc:	this.doAll } );
							 fnc:	this.uduiFnc } );

	}	//	constructor()

//	doAll ( o ) {
//		if ( o.do === 'identify' ) {
//			return { name:		'DlgGroups',
//					 fnc:		this.doAll,
//					 uduiInfo:	this.uduiFnc ( { do: 'get-info' } ) }; }
//		if ( o.do === 'keyboard-key-down' ) {
//			return this.keyDown ( o ); }
//	}	//	doAll()

	loaded() {
		const sW = 'DlgSelectRobotSystem3 loaded()';

		super.loaded ( { sW: sW, paneKind: 'select-system' } );
		
	}	//	loaded()

getControl ( type, name ) {
		const sW = 'DlgSelectRobotSystem3 getControl()';
		let cd = this.frame.frameFnc ( { do:	'get-control',
										 type:	type,
										 name:	name } );
		if ( ! cmn.isObject ( cd ) ) {
			cmn.error ( sW, name + ' not found' );
			return null; }
		return cd
	}	//	getControl()

	showOptions ( sW, bShow ) {
		let	cD = this.getControl ( uc.TYPE_PANEL, 'pnlOptions' );
		if ( ! cD ) {
			cmn.error ( sW, 'pnlOptions not found' ); 
			return; }
		cD.setIsVisible ( bShow );
		if ( ! bShow ) {
			return; }
	//	window.setTimeout ( () => {
			let cdG = this.getControl ( uc.TYPE_GRAPH, 'grfTypes' );
			if ( ! cdG ) {
				cmn.error ( sW, 'grfTypes not found' );
				return; }
			let cbD = null;
			cbD = cD.getControl ( uc.TYPE_CHECKBOX, 'chkOptionsShowByGroup' );
			if ( cbD ) {
				cbD.setChecked ( cdG.dsrc.bShowGroup ); }
			else {
				cmn.error ( sW, 'chkOptionsShowByGroup not found' ); }

			cbD = cD.getControl ( uc.TYPE_CHECKBOX, 'chkOptionsShowByMember' );
			if ( cbD ) {
				cbD.setChecked ( cdG.dsrc.bShowUser ); }
			else {
				cmn.error ( sW, 'chkOptionsShowByMember not found' ); }

			cbD = cD.getControl ( uc.TYPE_CHECKBOX, 'chkOptionsShowInSystem' );
			if ( cbD ) {
				cbD.setChecked ( cdG.dsrc.bShowSystem ); }
			else {
				cmn.error ( sW, 'chkOptionsShowInSystem not found' ); }
	//	}, 100 );
	}	//	showOptions()

	keyDown ( o ) {
		let sW = 'DlgSelectRobotSystem3 keyDown()';
		if ( o.ev.altKey ) {
			sW += ' alt'; }
		sW += ' ' + o.ev.key;
	//	cmn.log ( sW );

		let ctrlD = o.focusedCtrlD;

		if ( ! ctrlD ) {
			return false; }

		switch ( ctrlD.type ) {
			case uc.TYPE_GRAPH: 
				if ( ctrlD.dsrc && uc.isFunction ( ctrlD.dsrc.keyDown) ) {
					if ( ctrlD.dsrc.keyDown ( o ) ) {
						return true; } }
				return false;
			case uc.TYPE_INPUT:
				break;
			default:
				cmn.log ( sW, ' Error: unrecognized control' );
		}	//	switch()

		return false;
	}	//	keyDown()


	graphFirstNodes ( dsrc ) {
		const sW = 'DlgSelectRobotSystem3 graphFirstNodes()';
		cmn.log ( sW );

		//	This is called indirectly from loaded(). See -
		//	-	cd.dsrc.initialNodes ( this ); }

	}	//	graphFirstNodes()

	mayAddGraphNode ( o ) {
		//	o is like that of nodeSelected().  o is probably this.curType.
		
		//	If group is private then -
		//		-	Policy. 
		//			-	Does current user have permission to add a type
		//				to the specified type (that of o) (its would-be
		//				parent type)?
		//	else -
		//		-	Return true.

		//	Requires going to Share.
		//	-	Share must already maintain the current active group for this 
		//		user's current session.

		return true;		//	for now

	}	//	mayAddGraphNode()

	nodeSelected ( o ) {
		this.typeSelected ( o );
	}	//	nodeSelected()

	newGraphNodeData ( o ) {
		const sW = 'DlgSelectRobotSystem3 newGraphNodeData()'
		cmn.log ( sW );
	}	//	newGraphNodeData()

	filterByCurrentGUS() {
		let bFiltered = false;

		return bFiltered;
	}	//	filterByCurrentGUS()

	graphNodeName ( rd ) {
		return rd.name === '<new>' ? '' : rd.name;
	}	//	graphNodeName()

	updateGraphNodeName ( rd, name ) {
		const sW = 'DlgSelectRobotSystem3 updateGraphNodeName() ' + rd.name;
		rd.name = name;

	}	//	updateGraphNodeName()

	dropDown ( d, i, ele ) {
		const sW = 'DlgSelectRobotSystem3 dropDown()';
		cmn.log ( sW );

		return false;
	}	//	dropDown()

	dropDownClick ( btnD, itemD, i, ele ) {
		const sW = 'DlgSelectRobotSystem3 dropDownClick() ' + btnD.name;
		cmn.log ( sW );

		if ( btnD.name === 'btnGroup' ) {
			return this.dropDownClickGroup ( btnD, itemD, i, ele ); }

		if ( btnD.name === 'btnGroupMember' ) {
			return this.dropDownClickGroupMember ( btnD, itemD, i, ele ); }

		cmn.error ( sW, 'unrecognized control ' + btnD.name );
		return null;
	}	//	dropDownClick()

	dropDownClickGroup ( btnD, itemD, i, ele ) {
		const sW = 'DlgSelectRobotSystem3 dropDownClickGroup()';
		cmn.log ( sW );

		if ( ! cmn.setButton ( this, sW, 'btnGroup', itemD.text ) ) {
			return; }

		//	Set Group Member to '- all members -'. The user must select a 
		//	member to list by that member.
		if ( ! cmn.setButton ( this, sW, 
							   'btnGroupMember', '- all members -' ) ) {
			return; }

		this.grpId    = itemD.data.grp_id;
		this.grpMbrId = 0;		//	all members of the group

		return { close: true }; 
	}	//	dropDownClickGroup()

	dropDownClickGroupMember ( btnD, itemD, i, ele ) {
		const sW = 'DlgSelectRobotSystem3 dropDownClickGroupMember()';
		cmn.log ( sW );
		
		return { close: true }; 
	}	//	dropDownClickGroupMember()

	typeSelected ( o ) {
		const sW = 'DlgSelectRobotSystem3 typeSelected()';
	
	}	//	typeSelected()

	enableSystemList ( bEnable ) {
		let cD: any = null;
		cD = this.getControl ( uc.TYPE_LABEL, 'lblSystemNames' );
		if ( cD ) {
			cD.enable ( bEnable ); }
		cD = this.getControl ( uc.TYPE_LIST, 'lstSystemNames' );
		if ( cD ) {
			if ( ! bEnable ) {
				cD.clear(); }
			cD.enable ( bEnable ); }
		cD = this.getControl ( uc.TYPE_LABEL, 'lblNewSystem' );
		if ( cD ) {
			cD.enable ( bEnable ); }
		cD = this.getControl ( uc.TYPE_INPUT, 'edtNewSystem' );
		if ( cD ) {
			if ( ! bEnable ) {
				cD.setText ( '' ); }
			cD.enable ( bEnable ); }
		cD = this.getControl ( uc.TYPE_LABEL, 'lblNewSystemError' );
		if ( cD ) {
			cD.setText ( '' );
			cD.enable ( bEnable ); }
		cD = this.getControl ( uc.TYPE_BUTTON, 'btnAdd' );
		if ( cD ) {
			if ( ! bEnable ) {
				cD.enable ( false ); }
			else {
				let eD = this.getControl ( uc.TYPE_INPUT, 'edtNewSystem' );
				if ( eD ) {
					let systemName = eD.getText();
					this.validate ( null, systemName ); } } }
	}	//	enableSystemList()

	loadSystemList() {
		const sW = 'DlgSelectRobotSystem3 loadSystemList()';
	}	//	loadSystemList()

	listAddItem ( listName, o ) {
		const sW = 'DlgSelectRobotSystem3 listAddItem()';
	}	//	listAddItem()

	setSystemSelected ( o ) {
		const sW = 'DlgSelectRobotSystem3 setSystemSelected()';
		let cD;

		let bEnable = cmn.isObject ( o );

		cD = this.getControl ( uc.TYPE_LABEL, 'lblAboutSystem' );
		if ( cD ) {
			cD.enable ( bEnable ); }

		cD = this.getControl ( uc.TYPE_TABS, 'tbsAboutSystem' );
		if ( cD ) {
			cD.enable ( bEnable ); }

		cD = this.getControl ( uc.TYPE_INPUT, 'edtNewSystem' );
		if ( cD ) {
			cD.setText ( '' ); }

		cD = this.getControl ( uc.TYPE_LABEL, 'lblNewSystemError' );
		if ( cD ) {
			cD.setText ( '' ); }

		cD = this.getControl ( uc.TYPE_BUTTON, 'btnAdd' );
		if ( cD ) {
			cD.enable ( false ); }

		cD = this.getControl ( uc.TYPE_BUTTON, 'btnOK' );
		if ( cD ) {
			cD.enable ( bEnable ); }

		this.systemSelected = o;
		
	}	//	setSystemSelected()

	edtChange ( d, i, ele ) {	//	input control lost focus or enter key
		let sW = 'DlgSelectRobotSystem3 edtChange()';

		if ( d.name === 'edtNewSystem' ) {
			//	Validate

			//	Create instance record and add to instance list.
			
			//	Select in list.

			//	Enable OK button.

			return;
		}

		cmn.log ( sW, ' Error: unrecognized control name - "' 
					+ d.name + '"' );
	}	//	edtChange()

	edtInput ( d, i, ele ) {	//	input control value change
		let sW = 'DlgSelectRobotSystem3 edtInput()';
		//	Called when input's value changes - key press, delete, paste, etc..
	//	var inputEle = ele[i].children[0];
		let inputEle = ele[i];
	//	cmn.log ( sW, d.name + '  eleId: ' + d.eleId + '  ' 
	//				+ inputEle.value );

		let bValid = false;

		if ( d.name === 'edtNewSystem' ) {
			bValid = this.validate ( d, inputEle.value ); }

		if ( ! cmn.isObject ( this.args ) ) {
			cmn.log ( sW, 'no args - assuming dev/test mode? - '
						+ ' ignoring input' ); 
			return; }

		if ( d.name === 'edtNewSystem' ) {
			let cdAdd = this.getControl ( uc.TYPE_BUTTON, 'btnAdd' );
			if ( cdAdd ) {
				cdAdd.enable ( bValid ); }
			return; }

	}	//	edtInput()

	validate ( d, value ) {
		let cdAdd = this.getControl ( uc.TYPE_BUTTON, 'btnAdd' );
		if ( cdAdd ) {
			cdAdd.enable ( false ); }

		if ( value.length === 0 ) {
			if ( d ) {
				this.error ( d, '' ); }
			return false; }
		if ( value.match ( /\s/ ) ) {
			if ( d ) {
				this.error ( d, 'Space, tab and the like are not allowed.' ); }
			return false; }
		if ( value[0].match ( /\d/ ) ) {
			if ( d ) {
				this.error ( d, 'First character may not be a digit.' ); }
			return false; }
		if ( ! value[0].match ( /[A-Za-z]/ ) ) {
			if ( d ) {
				this.error ( d, 'First character must be A-Z or a-z.' ); }
			return false; }
		if ( value.match ( /[^A-Za-z0-9_]/ ) ) {
			if ( d ) {
				this.error ( d, 'Valid characters: A-Z, a-z, digits, _.' ); }
			return false; }

		if ( d ) {
			this.error ( d, '' ); }	//	clear error

	//	//	Do not check for value being used already.  Multiple records with 
	//	//	the same value is allowed.  
	//	this.valid ( value );
		return true;
	}	//	validate()

	error ( d, msg ) {
		const sW = 'DlgSelectRobotSystem3 error()';
		let lblName = null, lblD = null;
		if ( d.name === 'edtNewSystem' ) {
			lblName = 'lblNewSystemError'; }
		else {
			cmn.log ( sW, ' Error: unrecognized control - "' 
						+ d.name + '"' );
			return; }
		lblD = this.getControl ( uc.TYPE_LABEL, lblName );
		if ( ! lblD ) {
			cmn.log ( sW, ' Error: label not found - "' 
						+ lblName + '"' );
			return; }
		if ( lblD.text === msg ) {
			return; }
		lblD.setText ( msg );
	}	//	error()

	add() {
		const sW = 'DlgSelectRobotSystem3 add()';
		return true;
	}	//	add()

	ok() {
		const sW = 'DlgSelectRobotSystem3 ok()';
		cmn.log ( sW );


		if ( cmn.isFunction ( this.args.onOK ) ) {
			let item = this.systemSelected;
			this.args.onOK ( { byGrpId:				item.data.made_by_grp_id,
							   byUserId:			item.data.made_by_user_id,
					//	->	   selectedSysHandle:	item.data.hRec, ?
							   selectedSysId:		item.textId,
							   selectedSysName:		item.text } ); }

		this.uduiFnc ( { do: 'close-frame' } );
		return true;
	}	//	ok()

	cancel() {
		const sW = 'DlgSelectRobotSystem3 cancel()';
		cmn.log ( sW );
		this.uduiFnc ( { do: 'close-frame' } );
	}	//	cancel()

	help() {
		const sW = 'DlgSelectRobotSystem3 help()';
		cmn.log ( sW );
		this.clientAppFnc ( { do:		'show-help',
							  topic:	'' } );
		return true;
	}	//	help()

	grfFocus ( d ) {
		const sW = 'DlgSelectRobotSystem3 grfFocus()';
		if ( ! cmn.isObject ( d ) ) {
			d = this.getControl ( uc.TYPE_GRAPH, 'grfTypes' );
			if ( ! d ) {
				cmn.error ( sW, 'grfTypes not found.' );
				return; } }
		this.uduiFnc ( { do:		'click-focus',
						 frameAs:	'dialog',
						 ctrlD:		d,
						 paneId:	d.getPaneId() } );
	}	//	grfFocus()

	grfClick ( d, i, ele ) {
		const sW = 'DlgSelectRobotSystem3 grfClick()';
		cmn.log ( sW );

		this.grfFocus ( d );
		return false;
	}	//	grfClick()

	lblClick ( d, i, ele ) {
		const sW = 'DlgSelectRobotSystem3 lblClick()';
		cmn.log ( sW );

		if ( d.name === 'lblHelp' ) {
			return this.help(); }

	//	cmn.error ( 'unrecognized label - ' + d.name );
		return false;
	}	//	lblClick()

	btnClick ( d, i, ele ) {
		const sW = 'DlgSelectRobotSystem3 btnClick()';
		cmn.log ( sW );

		if ( d.name === 'btnOptionsClose' ) {
			this.showOptions ( sW, false );
			return true; }
		
		if ( d.name === 'btnAdd' ) {
		//	return this.add(); }
			return true; }

		if ( d.name === 'btnOK' ) {
			return this.ok(); }

		if ( d.name === 'btnCancel' ) {
			return this.cancel(); }

		cmn.error ( 'unrecognized button - ' + d.name );

		return false;
	}	//	btnClick()
	
	lstClick ( d, i, ele ) {
		const sW = 'DlgSelectRobotSystem3 lstClick()';
		cmn.log ( sW, '  List: ' + d.ld.name + '  Item Id: ' + d.textId
					+ '  Item Text: ' + d.text );
		if ( d.ld.name !== 'lstSystemNames' ) {
			cmn.error ( sW, 'expected lstSystemNames' );
			return false ; }
			
		cmn.log ( sW + (d.ld.itemSelected ? ':  ' : ':  not ') 
					+ 'selected' );

		if ( ! d.ld.itemSelected ) {
			this.setSystemSelected ( null ); }
		else {
			this.setSystemSelected ( d.ld.itemSelected ); }

		return true; 
	}	//	lstClick()

	chkClick ( d, i, ele ) {
		const sW = 'DlgSelectRobotSystem3 chkClick()';
		cmn.log ( sW );

		let cd = this.getControl ( uc.TYPE_GRAPH, 'grfTypes' );
		if ( ! cd ) {
			cmn.error ( sW, 'graph not found' );
			return false; }

		if ( d.name === 'chkOptionsShowByGroup' ) {
			let bChecked = !! d.value;
			cd.dsrc.showGroup ( bChecked );
			return true; }

		if ( d.name === 'chkOptionsShowByMember' ) {
			let bChecked = !! d.value;
			cd.dsrc.showUser ( bChecked );
			return true; }

		if ( d.name === 'chkOptionsShowInSystem' ) {
			let bChecked = !! d.value;
			cd.dsrc.showSystem ( bChecked );
			return true; }

		cmn.error ( sW, 'unrecognized checkbox - ' + d.name );

		return false;
	}	//	chkClick()

	onOptions ( ) {
		const sW = 'DlgSelectRobotSystem3 onOptions()';
		cmn.log ( sW );
		//	Show a panel with various controls -
		//		-	a close button (an X at upper right of panel)
		//		-	show-created-by checkbox
		let	cD = this.getControl ( uc.TYPE_PANEL, 'pnlOptions' );
		if ( cD ) {
			cD.setIsVisible ( true ); }
		else {
			cmn.error ( sW, 'pnlOptions not found' ); }
	}	//	onOptions()

	shiftClickMenu() {
		let items = [];

		items.push ( { type:	'separator', 	text: '' } );
		
		items.push ( { type:	'item', 	text: '[O]ptions ...', 
					   fnc:		this.onOptions } );

		return items;
	}	//	shiftClickMenu()

}	//	class DlgSelectRobotSystem3 

export { DlgSelectRobotSystem3 as default }


