import type { Page } from '@playwright/test';
import type { Locator } from '@playwright/test';

export async function frameNew ( page:	 Page,
                                 title?: string )
							: Promise<null | Locator> {
	await page.getByTestId ( 'paneless-app-title-text' )
	          .click();
	await page.getByTestId ( 'paneless-app-menu-Frame' )
	          .click();
	await page.getByTestId ( 'paneless-app-menu-Frame-New' )
	          .click();

    //  There might be multiple frames. Find the frame we just created.

	//	Frame title?
    if ( typeof title === 'string' ) {
        await page.getByTestId ( 'paneless-frame-burger' )
            .click();
        await page.getByTestId ( 'paneless-frame-menu-FrameName' )
            .click();
        let locator = page.getByTestId ( 'paneless-dlg-name' );
	    await locator.getByRole ( "textbox" )
                     .fill ( "Test Frame" );
	    await locator.getByRole ( "button" )
                     .filter ( { hasText: "OK" } )
                     .click(); }

	return null;	//	for now
}	//	frameNew()

