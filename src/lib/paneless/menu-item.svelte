<script lang="ts">

	import { beforeUpdate }	    from 'svelte';

	export let prpText 		= '';
	export let prpHotkey	= '';
	export let prpDisabled	= false;

	function stringifyStyle ( style: any ): string {
		let s = '';
		for ( const p in style ) {
			s += p + ': ' + style[p] + '; '; };
		return s;
	}	//	stringifyStyle()


let self = {

		state:  {
			itemStyle: {
				color:	prpDisabled ? 'lightgray' : 'black' },

            itemStyleString:    '',
		},

        iOB:            0,
        iCB:            0,
        isDecorated:    false,

};  //  self

    self.state.itemStyleString = stringifyStyle ( self.state.itemStyle );

    beforeUpdate ( () => {
		self.iOB = prpText.indexOf ( '[' );
		self.iCB = prpText.indexOf ( ']' );
		self.isDecorated = (self.iCB - self.iOB === 2);
    } ) //  beforeUpdate

</script>

<menu-item>

    <div class	= 'menu-item' >
        <div class = 'menu-item-text'
                style = { self.state.itemStyleString }>
            {#if self.isDecorated }
                <span>
                    <!-- all one line - otherwise, unwanted spaces -->
                    {prpText.slice ( 0, self.iOB )}<span style = "text-decoration: underline">{prpText[self.iOB + 1]}</span>{prpText.slice ( self.iCB + 1 )}
                </span>
            {:else}
                { prpText }
            {/if}
        </div>
        <div class = 'menu-item-hotkey'
                style = { self.state.itemStyleString }>
            { prpHotkey }
        </div>
    </div>

</menu-item>

<style>

    .menu-item {
        min-width:			200px;	
        display:			flex;
        flex-direction:		row;
    }

    .menu-item-text {
        cursor:             pointer;
        margin-right:		20px;
        flex:				1 1 auto;
    }

    .menu-item-hotkey {
        flex: 				1 1 auto;
        text-align: 		right;
    }

</style>
