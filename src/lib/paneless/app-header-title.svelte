
<script lang="ts">
    export let appTitleImgPath: null | string           = null;
    export let appTitle: string                         = 'app title goes here';
	export let onClickTitle: null | ((e: any) => void)  = null;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<app-header-title on:click = { onClickTitle }>
    {#if typeof appTitleImgPath  === 'string'}
		<img alt   = "app title" 
			 src   = { appTitleImgPath }
			 class = "title-img" />
	{:else}
		<span/>
    {/if}
    <span class = "title-span"
          data-testid = "paneless-app-title-text">
        { appTitle }
    </span>
</app-header-title>

<style>
    app-header-title {
        display:        grid;
        grid-template-columns:	24px 180px;
        font-family:    sans-serif, 'Roboto';
        font-size:      16px;
        padding-left:   5px;
        padding-top:	2px;
        cursor:         pointer;
    }
    .title-img {
        margin-right:   16px;
        height:         20px;
    }
    .title-span {
	    margin-top:			1px;
    }
</style>