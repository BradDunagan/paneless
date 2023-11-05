<script lang="ts">

	import { cmn }		    	from './common';
    import AppHeaderUser        from './app-header-user.svelte';

	export let prpClientFnc: any	= null;

	let displayName = null;

class ClassAppHeaderSignIn {

	constructor() {

		this.clickSignIn	= this.clickSignIn.bind ( this );
		this.doAll			= this.doAll.bind ( this );

		prpClientFnc( { do: 'set-call-down', 
						to: 'app-header-sign-in',
						fnc: this.doAll } );
	}	//	constructor()

	doAll ( o: any ) {
		const sW = 'paneless AppHeaderSignIn doAll()';
		if ( o.do === 'display-user' ) {
			displayName = o.displayName; 
			return; }
		cmn.error ( sW, 'unrecognized do - ' + o.do );
	}   //  doAll()

	clickSignIn ( e ) {
		cmn.log ( 'paneless AppHeaderSignIn clickSignIn()' );
		prpClientFnc( { do: 'show-sign-in-dlg' } );
	}   //  clickSignIn()

}	//	ClassAppHeaderSignIn

	let self = new ClassAppHeaderSignIn();

</script>

<app-header-sign-in>
	{#if displayName !== null }
		<AppHeaderUser prpClientFnc   = { prpClientFnc }
					   prpDisplayName = { displayName } />
	{:else}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!--
		<div 
			class = "app-header-sign-in"
			on:click = { self.clickSignIn } >
			Sign In
		</div>
		-->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div 
			class = "app-header-sign-in">
			Sign In
		</div>
	{/if}
</app-header-sign-in>

<style>
	app-header-sign-in {
	    justify-self:	end;
	}
	.app-header-sign-in {
		display:        flex;
		padding-top:    6px;
		padding-right:  5px;
		/*
		cursor:         pointer;    
		*/
		cursor:			default;
		color:  		lightgray;
	}
</style>

