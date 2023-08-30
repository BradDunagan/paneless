<script lang="ts">
	import { cmn }		    	from './common';
    
    export let prpClientFnc             = null;
    export let prpDisplayName: string   = '';

    function clickDisplayName ( e ) {
        const sW = 'paneless AppHeaderUser clickDisplayName()';
        cmn.log ( sW );
        prpClientFnc ( { do: 'click-user-display-name' } );
    }
</script>

<app-header-user>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div 
        class = "rr-app-header-user"
        on:click = { clickDisplayName }>
        { prpDisplayName }
    </div>
</app-header-user>


<style>
    app-header-user {
        display:        flex;
        padding-top:    6px;
        padding-right:  5px;
        cursor:         pointer;    
    }
</style>