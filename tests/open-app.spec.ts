import { test, expect } from '@playwright/test';
import type { Locator } from '@playwright/test';

import { frameNew }     from './common/frame';

test ( 'has title', async ( { page } ) => {

	await page.waitForTimeout ( 5000 );
	await page.goto ( 'localhost:5173' );

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/paneless demo/);
} );

test ( 'frame w/header w/footer', async ( { page } ) => {

	await page.waitForTimeout ( 5000 );
	await page.goto('localhost:5173');

	await frameNew ( page, "" );

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	await locatorFrame.getByText ( 'specify content' )
					  .evaluate ( node => node.textContent = '' );
	
	expect ( await locatorFrame.screenshot() )
		.toMatchSnapshot ( 'frame-w-header-w-footer.png' );
} );

test ( 'frame no/header w/footer', async ( { page } ) => {

	await page.waitForTimeout ( 5000 );
	await page.goto('localhost:5173');

	await frameNew ( page, "" );

	await page.getByTestId ( 'paneless-frame-burger' )
		.click();

	await page.getByTestId ( 'paneless-frame-menu-HideHeader' )
		.click();

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	await locatorFrame.getByText ( 'specify content' )
					  .evaluate ( node => node.textContent = '' );
	
	expect ( await locatorFrame.screenshot() )
		.toMatchSnapshot ( 'frame-no-header-w-footer.png' );
} )

test ( 'frame w/header no/footer', async ( { page } ) => {

	await page.waitForTimeout ( 5000 );
	await page.goto('localhost:5173');

	await frameNew ( page, "" );

	await page.getByTestId ( 'paneless-frame-burger' )
		.click();

	await page.getByTestId ( 'paneless-frame-menu-HideFooter' )
		.click();

	let locatorFrame = page.getByTestId ( 'paneless-frame' );
	
	await locatorFrame.getByText ( 'specify content' )
					  .evaluate ( node => node.textContent = '' );
	
	expect ( await locatorFrame.screenshot() )
		.toMatchSnapshot ( 'frame-w-header-no-footer.png' );
} )

test ( 'frame no/header no/footer', async ( { page } ) => {

	await page.waitForTimeout ( 5000 );
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
	
	expect ( await locatorFrame.screenshot() )
		.toMatchSnapshot ( 'frame-no-header-no-footer.png' );
} )

test('frame - size', async ({ page }) => {

	await page.waitForTimeout ( 5000 );
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

} );

test ( 'frame split vert', async ( { page } ) => {

	await page.waitForTimeout ( 5000 );
	await page.goto('localhost:5173');

	await frameNew ( page, "" );

	let locatorFrame = page.getByTestId ( 'paneless-frame' );

	await locatorFrame.getByText ( 'specify content' )
					  .evaluate ( node => node.textContent = '' );
	
	//	Check snapshot of button bar.
	await locatorFrame.getByAltText ( "button split vertical" )
		.hover();

	expect ( await locatorFrame.screenshot() )
		.toMatchSnapshot ( 'frame-split-vert-button.png' );


	//	Split vertically. Check snapshot of frame with two panes.

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

	expect ( await locatorFrame.screenshot() )
		.toMatchSnapshot ( 'frame-split-vert.png' );

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
		
	expect ( await locatorFrame.screenshot() )
		.toMatchSnapshot ( 'frame-split-bottom-pane-minimized.png' );
} );

