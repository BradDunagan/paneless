<script lang="ts">

	export let prpText 			= '';
	export let prpTabId			= 0;
	export let prpTabsFnc		= null;

let self = {

	doAll ( o ) {

		switch ( o.do ) {
			case 'set-style':
				return Promise.resolve();
		}

	}	//	doAll()
};

	prpTabsFnc ( { do:			'set-call-down',
				   to:			'tab-page-pane',
				   tabId:		prpTabId,
				   tabPaneFnc:	self.doAll } ); 

</script>

<dbg-a>

	dbg-a {prpText}

</dbg-a>

<style>

</style>
