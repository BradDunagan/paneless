<script lang="ts">

	export let frameId      = 0;
    export let titleText    = '';

	const eleId 	= 'paneless-rr-frame-title-' + frameId;
</script>

<frame-title
	id			= { eleId } >
	{ titleText }
</frame-title>


<style>

    frame-title {
        flex: 				1 1 auto;
        overflow-x: 		hidden;
        text-align: 		left;
        text-overflow: 		ellipsis;
        white-space: 		nowrap;
        padding-left: 		5px;
        margin-left:		5px;
        margin-right: 		5px;
        margin-top: 		1px;
        font-family:		sans-serif, 'Roboto';
        font-size:			14px;
        cursor:				move;
    }
</style>