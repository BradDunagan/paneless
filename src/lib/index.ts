import { cmn }				from '$lib/paneless/common';
import AppFrame				from '$lib/paneless/app-frame.svelte';
import { getFrameId }		from '$lib/paneless/frame-id';
import { getPaneId }		from '$lib/paneless/pane-id';
import type { Item }	    from '$lib/paneless/interfaces';

export default AppFrame;
export type { Item };
export { cmn, getFrameId, getPaneId };
