//
//  Copied from https://playwright.dev/docs/extensibility
//
import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

// Must be a function that evaluates to a selector engine instance.
const createTagNameEngine = () => ({
    // Returns the first element matching given selector in the root's subtree.
    query(root, selector) {
        return root.querySelector(selector);
    },

    // Returns all elements matching given selector in the root's subtree.
    queryAll(root, selector) {
        return Array.from(root.querySelectorAll(selector));
    }
} );

export const test = base.extend<{}, { selectorRegistration: void }>({
    // Register selectors once per worker.
    selectorRegistration: [async ({ playwright }, use) => {
        // Register the engine. Selectors will be prefixed with "tag=".
        await playwright.selectors.register('tag', createTagNameEngine);
        await use();
    }, { scope: 'worker', auto: true }],
} );
