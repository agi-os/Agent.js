import playwright from 'playwright-extra'
import { WebExtensionBlocker } from '@cliqz/adblocker-webextension'
import shouldFulfillWithEmptyBody from './shouldFulfillWithEmptyBody.js'
import UserAgent from 'user-agents'

const userAgent = new UserAgent({ deviceCategory: 'desktop' })

import stealth from 'puppeteer-extra-plugin-stealth'
const pluginStealth = stealth()

pluginStealth.enabledEvasions.delete('user-agent-override')

playwright.firefox.use(pluginStealth)

/**
 * Captures a POST request from UI, upgrades the original requests to be actually useful
 * @param {Object} props - The properties of the call
 * @param {string} props.query - The search query
 * @param {string} props.domain - The domain of search engine to use
 * @param {string} props.placeholder - The placeholder value we wish to modify
 * @param {string} props.value - The value we wish to set the placeholder to
 * @returns {string} The search results
 */
const webZombie = async ({
  query = 'why is sky blue',
  domain = 'etools.ch',
  placeholder = 'why is sky blue',
  value = 'is tomato a fruit',
}) => {
  // Launch a new instance of Firefox browser in non-headless mode
  const browser = await playwright.firefox.launch({
    // Disable headless mode to see the browser in action
    headless: false,
  })

  // Spin up spam blocker
  const blocker = await WebExtensionBlocker.fromPrebuiltAdsAndTracking()
  await blocker.enableBlockingInBrowser(browser)

  // Create a new browser context. This is like a separate session in the browser.
  const context = await browser.newContext({
    // Set the user agent to a desktop user agent to mimic a real user
    userAgent: userAgent.toString(),

    // Disable service workers to prevent any background scripts from running
    serviceWorkers: 'block',

    // Prevent 403 errors from blocking the search
    ignoreHTTPSErrors: true,

    // Bypass Content Security Policy to allow for more flexibility
    bypassCSP: true,

    // Set the viewport size to the user agent's viewport size
    viewport: {
      width: userAgent.data.viewportWidth,
      height: userAgent.data.viewportHeight,
    },
  })

  // Remove the 'webdriver' property to prevent misconfigured websites from breaking
  await context.addInitScript(
    `const defaultGetter = Object.getOwnPropertyDescriptor(
      Navigator.prototype,
      "webdriver"
    ).get;
    defaultGetter.apply(navigator);
    defaultGetter.toString();
    Object.defineProperty(Navigator.prototype, "webdriver", {
      set: undefined,
      enumerable: true,
      configurable: true,
      get: new Proxy(defaultGetter, {
        apply: (target, thisArg, args) => {
          Reflect.apply(target, thisArg, args);
          return false;
        },
      }),
    });
    const patchedGetter = Object.getOwnPropertyDescriptor(
      Navigator.prototype,
      "webdriver"
    ).get;
    patchedGetter.apply(navigator);
    patchedGetter.toString();`
  )

  // Upgrade the context with our request upgrade feature, changing requests in flight
  await context.route('**/*', async (route, request) => {
    try {
      // Check if the request should be fulfilled with an empty body
      if (shouldFulfillWithEmptyBody(request.url())) {
        return route.fulfill({ body: Buffer.from('') })
      }

      // Check if we should intercept the request
      if (request.method() === 'POST') {
        console.log('Intercepted request:', request.url())
        const originalBody = await request.postData()
        console.log('Original Request Body:', originalBody) // Log for debugging

        if (originalBody) {
          // Parse the URL-encoded query parameters
          const params = new URLSearchParams(originalBody)

          // Scan all parameters for our placeholder and modify it if found
          for (const [key, val] of params.entries()) {
            if (val === placeholder) {
              params.set(key, value)
              break
            }
          }

          // Continue with the modified body
          await route.continue({ postData: params.toString() })
          return
        }
      }
    } catch (error) {
      console.error('Error parsing/modifying request:', error)
    }

    // Continue with the original request if no modifications were made
    await route.continue()
  })

  // Open a new page in the browser context.
  const page = await context.newPage()

  // Navigate to the search engine's homepage using the provided domain.
  await page.goto('https://' + domain)

  // Wait for page to load (auto-waiting is enabled by default)
  await page.waitForLoadState('domcontentloaded')

  // Detect if we have an autofocused input field and if so, type the query in it
  const autofocusedInput = await page.$('*[autofocus]')
  if (autofocusedInput) {
    await autofocusedInput.fill(query)
  } else {
    // If no autofocused input field is found, look for inputMode search
    const searchInput = await page.$('input[type="search"]')
    if (searchInput) {
      await searchInput.fill(query)
    } else {
      // If no search input field is found, focus first visible input field and type the query in it
      const firstInput = await page.$('input:visible')
      if (firstInput) {
        await firstInput.fill(query)
      } else {
        // If no input field is found, throw an error
        throw new Error('No search input field found')
      }
    }
  }

  // Submit the form emulating a return keypress
  await page.keyboard.press('Enter')

  // Wait for short time to ensure the search was successful
  await page.waitForTimeout(800)

  // Wait for page to load (auto-waiting is enabled by default)
  await page.waitForLoadState('domcontentloaded')

  // Get an a href locator
  const hrefLocator = page.locator('a')

  // Wait for more than 10 href links to be visible
  await hrefLocator.filter({ hasText: /\S/ }).first().waitFor({ timeout: 5000 })

  // TODO: handle the workaround for search.gmx.com, alexandria.org and other low-q sites
  // $$('a').filter(a => a.innerHTML.length > 40).filter(a => a.href.length > 35).map(a => a.href)

  // Wait for at least 10 href links to have a non-empty innerText and href attribute
  await page.waitForFunction(
    domain =>
      Array.from(document.querySelectorAll('a'))
        .filter(link => link?.innerText.length > 10)
        .filter(link => !link.href.includes(domain))
        .filter(link => link.href.length > 10).length > 10,
    domain
  )

  // Extract all titles and href joining them in a single object
  const data = await hrefLocator.evaluateAll((elements, domain) => {
    let data = elements
      .filter(link => link?.innerText.length > 10)
      .filter(link => !link.href.includes(domain))
      .filter(link => link.href.length > 10)
      .map(element => ({
        title: element.innerText,
        href: element.href,
      }))

    // Remove duplicates by href content
    data = data.filter(
      (value, index, self) =>
        index === self.findIndex(t => t.href === value.href)
    )
    // Remove duplicates by title content
    data = data.filter(
      (value, index, self) =>
        index === self.findIndex(t => t.title === value.title)
    )

    return data
  }, domain)

  console.log(data)

  // Delete all the data in context
  await context.close()

  // Close the browser instance
  await browser.close()

  // Return the extracted data
  return data
}

export default webZombie
