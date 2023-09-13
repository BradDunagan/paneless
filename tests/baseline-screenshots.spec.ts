import { test, expect } from '@playwright/test';
import type { Locator } from '@playwright/test';

import { frameNew }     from './common/frame';

test ( 'frame w/header w/footer', async ( { page } ) => {
	await page.goto('localhost:5173');

	await frameNew ( page, "Test Frame" );

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	await locatorFrame.screenshot ( { path: 'tests/screenshots/frame-w-header-w-footer.png' } );

} )

test ( 'frame no/header w/footer', async ( { page } ) => {
	await page.goto('localhost:5173');

	await frameNew ( page, "Test Frame" );

	await page.getByTestId ( 'paneless-frame-burger' )
		.click();

	await page.getByTestId ( 'paneless-frame-menu-HideHeader' )
		.click();

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	await locatorFrame.screenshot ( { path: 'tests/screenshots/frame-no-header-w-footer.png' } );

} )

test ( 'frame w/header no/footer', async ( { page } ) => {
	await page.goto('localhost:5173');

	await frameNew ( page, "Test Frame" );

	await page.getByTestId ( 'paneless-frame-burger' )
		.click();

	await page.getByTestId ( 'paneless-frame-menu-HideFooter' )
		.click();

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	await locatorFrame.screenshot ( { path: 'tests/screenshots/frame-w-header-no-footer.png' } );

} )

test ( 'frame no/header no/footer', async ( { page } ) => {
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
	
	await locatorFrame.screenshot ( { path: 'tests/screenshots/frame-no-header-no-footer.png' } );

} )

