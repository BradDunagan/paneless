
let lastPaneId = 0;

export function getPaneId(): number {
	return ++lastPaneId;
}

export function getLastPaneId(): number {
	return lastPaneId;
}

export function setLastPaneId ( paneId: number ) {
	lastPaneId = paneId;
}

