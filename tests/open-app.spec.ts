import { test, expect } from '@playwright/test';
import type { Locator } from '@playwright/test';

import { frameNew }     from './common/frame';

test ( 'has title', async ( { page } ) => {

	await page.waitForTimeout ( 2000 );
	await page.goto ( 'localhost:5173' );

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/paneless demo/);
} );

test ( 'frame w/header w/footer', async ( { page } ) => {

	await page.waitForTimeout ( 2000 );
	await page.goto('localhost:5173');

	await frameNew ( page, "Test Frame" );

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	expect ( await locatorFrame.screenshot() )
		.toMatchSnapshot ( 'frame-w-header-w-footer.png' );
} );

test ( 'frame no/header w/footer', async ( { page } ) => {

	await page.waitForTimeout ( 2000 );
	await page.goto('localhost:5173');

	await frameNew ( page, "Test Frame" );

	await page.getByTestId ( 'paneless-frame-burger' )
		.click();

	await page.getByTestId ( 'paneless-frame-menu-HideHeader' )
		.click();

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	expect ( await locatorFrame.screenshot() )
		.toMatchSnapshot ( 'frame-no-header-w-footer.png' );
} )

test ( 'frame w/header no/footer', async ( { page } ) => {

	await page.waitForTimeout ( 2000 );
	await page.goto('localhost:5173');

	await frameNew ( page, "Test Frame" );

	await page.getByTestId ( 'paneless-frame-burger' )
		.click();

	await page.getByTestId ( 'paneless-frame-menu-HideFooter' )
		.click();

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	expect ( await locatorFrame.screenshot() )
		.toMatchSnapshot ( 'frame-w-header-no-footer.png' );
} )

test ( 'frame no/header no/footer', async ( { page } ) => {

	await page.waitForTimeout ( 2000 );
	await page.goto('localhost:5173');

	await frameNew ( page, "Test Frame" );

	await page.getByTestId ( 'paneless-frame-burger' )
		.click();

	await page.getByTestId ( 'paneless-frame-menu-HideHeader' )
		.click();

	await page.getByTestId ( 'paneless-frame-burger' )
		.click();

	await page.getByTestId ( 'paneless-frame-menu-HideFooter' )
		.click();

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	expect ( await locatorFrame.screenshot() )
		.toMatchSnapshot ( 'frame-no-header-no-footer.png' );
} )

test('frame - size', async ({ page }) => {

	await page.waitForTimeout ( 2000 );
	await page.goto('localhost:5173');

	//	New frame, get its bounding box.
	await frameNew ( page );

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	let fbb = await locatorFrame.boundingBox();

	expect ( fbb ).toBeTruthy();
	if ( ! fbb ) {
		return; }

	//	Change the size of the frame with the mouse at the frame's lower right
	//	corner.
	let locatorSizer = page.getByTestId ( 'paneless-sizer' );

	const sbb = await locatorSizer.boundingBox();
	
	expect ( sbb ).toBeTruthy();
	if ( ! sbb ) {
		return; }
	let x  = sbb.x + Math.round ( sbb.width / 2 );
	let y  = sbb.y + Math.round ( sbb.height / 2 );
	await page.mouse.move ( x, y );
	await page.mouse.down();
	await page.mouse.move ( x + 40, y + 40 );
	await page.mouse.up(); 
	
	//	Frame's box should have changed by that amount.
	let fbb2 = await locatorFrame.boundingBox();

	expect ( fbb2 ).toBeTruthy();
	if ( ! fbb2 ) {
		return; }
	expect ( fbb2.width ).toBeCloseTo ( fbb.width + 40 );
	expect ( fbb2.height ).toBeCloseTo ( fbb.height + 40 );

});

