import playwright from 'playwright'

/**
 * Searches the web for the given query
 * @param {string} query The query to search for
 * @returns {string} The search results
 */
const webSearch = async query => {
  const browser = await playwright.firefox.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('https://yandex.com')

  // Wait for page to load (auto-waiting is enabled by default)
  await page.waitForLoadState('domcontentloaded')

  // Type the query in the search box
  await page.fill('input[name="text"]', query)

  // Submit the form
  await page.press('input[name="text"]', 'Enter')

  // Wait for page to load (auto-waiting is enabled by default)
  await page.waitForLoadState('domcontentloaded')

  // Extract all titles and hrefs joining them in a single object
  const data = await page.$$eval('a', elements =>
    elements.map(element => ({
      title: element.textContent,
      href: element.href,
    }))
  )

  // remove all yandex.com links from the results
  const filteredData = data.filter(item => !item.href.includes('yandex.com'))

  console.log(filteredData)

  await browser.close()

  return filteredData
}

export default webSearch
