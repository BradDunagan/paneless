
let lastFrameId = 0;


export function getFrameId(): number {
	return ++lastFrameId;
}

export function getLastFrameId(): number {
	return lastFrameId;
}

export function setLastFrameId ( frameId: number ) {
	lastFrameId = frameId;
}

