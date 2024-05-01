import playwright from 'playwright'

/**
 * Loads a web page and returns the main content of the page in plain text
 * @param {string} url The URL of the web page to load
 * @returns {string} The main content of the web page in plain text
 */
const webScrape = async url => {
  const browser = await playwright.firefox.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(url)

  // Wait for page to load (auto-waiting is enabled by default)
  await page.waitForLoadState('domcontentloaded')

  // Extract the text content of the body
  const text = await page.$eval('body', element => element.textContent)

  // Split the text into paragraphs
  const paragraphs = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  // Log the paragraphs
  console.log(paragraphs)

  await browser.close()

  return paragraphs
}

export default webScrape
