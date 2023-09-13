import { test, expect } from '@playwright/test';
import type { Locator } from '@playwright/test';

async function frameNew ( page ): Promise<Locator> {
	let locator = page.getByTestId ( 'paneless-app-title-text' );

	await locator.hover();
	await locator.click();

	locator = page.getByTestId ( 'paneless-app-menu-Frame' );

	await locator.hover();
	await locator.click();

	locator = page.getByTestId ( 'paneless-app-menu-Frame-New' );

	await locator.hover();
	await locator.click();

	return locator;
}	//	frameNew()

test ( 'multiple frames', async ( { page } ) => {
	await page.goto('localhost:5173');

	let locator: null | Locator = null;
	
	locator = await frameNew ( page );

	//	Another frame.
	locator = await frameNew ( page );

	//	Multiple frames? Get their locators, element Ids.
	let locators = page.getByTestId ( 'paneless-frame' ).all();

	let frames: { locator: Locator; id: string } [] = [];

	for ( const f of await locators ) {
		let id = await f.getAttribute ( 'id' );
		if ( id ) {
			frames.push ( { locator: f, id: id } ); } }
	
});