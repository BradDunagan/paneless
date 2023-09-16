
import { test, expect } from '@playwright/test';

import { frameNew }     from './common/frame';

test ( 'frame w/header w/footer', async ( { page } ) => {
	await page.waitForTimeout ( 2000 );
	await page.goto('localhost:5173');

	await frameNew ( page, "" );

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	await locatorFrame.getByText ( 'specify content' )
					  .evaluate ( node => node.textContent = '' );
	
	await locatorFrame.screenshot ( { path: 'tests/screenshots/frame-w-header-w-footer.png' } );

} )

test ( 'frame no/header w/footer', async ( { page } ) => {
	await page.waitForTimeout ( 2000 );
	await page.goto('localhost:5173');

	await frameNew ( page, "" );

	await page.getByTestId ( 'paneless-frame-burger' )
		.click();

	await page.getByTestId ( 'paneless-frame-menu-HideHeader' )
		.click();

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	await locatorFrame.getByText ( 'specify content' )
					  .evaluate ( node => node.textContent = '' );
	
	await locatorFrame.screenshot ( { path: 'tests/screenshots/frame-no-header-w-footer.png' } );

} )

test ( 'frame w/header no/footer', async ( { page } ) => {
	await page.waitForTimeout ( 2000 );
	await page.goto('localhost:5173');

	await frameNew ( page, "" );

	await page.getByTestId ( 'paneless-frame-burger' )
		.click();

	await page.getByTestId ( 'paneless-frame-menu-HideFooter' )
		.click();

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	await locatorFrame.getByText ( 'specify content' )
					  .evaluate ( node => node.textContent = '' );
	
	await locatorFrame.screenshot ( { path: 'tests/screenshots/frame-w-header-no-footer.png' } );

} )

test ( 'frame no/header no/footer', async ( { page } ) => {
	await page.waitForTimeout ( 2000 );
	await page.goto('localhost:5173');

	await frameNew ( page, "" );

	await page.getByTestId ( 'paneless-frame-burger' )
		.click();

	await page.getByTestId ( 'paneless-frame-menu-HideHeader' )
		.click();

	await page.getByTestId ( 'paneless-frame-burger' )
		.click();

	await page.getByTestId ( 'paneless-frame-menu-HideFooter' )
		.click();

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	await locatorFrame.getByText ( 'specify content' )
					  .evaluate ( node => node.textContent = '' );
	
	await locatorFrame.screenshot ( { path: 'tests/screenshots/frame-no-header-no-footer.png' } );

} )

test ( 'frame split vert', async ( { page } ) => {
	await page.waitForTimeout ( 2000 );
	await page.goto('localhost:5173');

	await frameNew ( page, "" );

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	await locatorFrame.getByText ( 'specify content' )
					  .evaluate ( node => node.textContent = '' );
	
	await locatorFrame.getByAltText ( "button split vertical" )
		.hover();

	await locatorFrame.screenshot ( { path: 'tests/screenshots/frame-split-vert-button.png' } );


	//	Need splitter button location to move away from it after the split.
	let splitV = locatorFrame.getByAltText ( "button split vertical" );
	let bb = await splitV.boundingBox();
	expect ( bb ).toBeTruthy();
	if ( ! bb ) {
		return; }
	
	await splitV.click();

	//	Move mouse off the button bar.
	let x  = bb.x;
	let y  = bb.y + bb.height + 4;
	await page.mouse.move ( x, y );
	

	let locators = await locatorFrame.locator ( '.pane-content' ).all();

	let pcIds: string[] = [];

	for ( const f of locators ) {
		let id = await f.getAttribute ( 'id' );
		if ( id ) {
			pcIds.push ( id ); } }

	for ( let i = 0; i < pcIds.length; i++ ) {
		let id = pcIds[i];
		let loc = page.locator ( '#' + id );
		await loc.getByText ( 'specify content' )
				 .evaluate ( node => node.textContent = '' ); }

	await locatorFrame.screenshot ( 
			{ path: 'tests/screenshots/frame-split-vert.png' } );

	//	Move splitter to minimize bottom pane (move down).
	//
	//	First, get the height of the bottom pane.
	let h = 0;
	for ( let i = 0; i < pcIds.length; i++ ) {
		let id = pcIds[i];
		if ( ! id.includes ( '-bot-' ) ) {
			continue; }
		h = await page.locator ( '#' + id )
			.evaluate ( node => {
				if ( node.parentElement && node.parentElement.parentElement ) {
					return parseInt ( node.parentElement.parentElement.style.height ); } 
				return 0;
			} );
		break; }
		
	expect ( h ).toBeGreaterThan ( 0 );

	let locator = await locatorFrame.locator ( '.pane-vsplitter' );
	
	bb = await locator.boundingBox();
	
	expect ( bb ).toBeTruthy();
	if ( ! bb ) {
		return; }
	x  = bb.x + Math.round ( bb.width / 2 );
	y  = bb.y + Math.round ( bb.height / 2 );
	await page.mouse.move ( x, y );
	await page.mouse.down();
	await page.mouse.move ( x, y + h );
	await page.mouse.up(); 
		
	await locatorFrame.screenshot ( 
			{ path: 'tests/screenshots/frame-split-bottom-pane-minimized.png' } );
} );

