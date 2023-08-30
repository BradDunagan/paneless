
<script lang="ts">
    export let groupName = 'Group Name';
    export let onClick = () => {};
</script>

<app-header-group on:click = { onClick } >
    Group: 
    <span class = "group-name">
        { groupName }
    </span>
</app-header-group>

<style>
    app-header-group {
        justify-self:	center;
        font-size:		14px;
        padding-top:    4px;
        padding-right:  5px;
        cursor:         pointer;    
    }
    .group-name {
        padding-left:	8px;
        font-weight:	500;
    }
</style>