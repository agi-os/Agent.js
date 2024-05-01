import echo from './echo.js'
import webSearch from './webSearch.js'
import reflection from './reflection.js'
import planning from './planning.js'
import webScrape from './webScrape.js'

/**
 * Router for actions
 */
const router = async ({ tool, args }) => {
  switch (tool) {
    case 'echo':
      return await echo(args)

    case 'planning':
      return await planning(args)

    case 'reflection':
      return await reflection(args)

    case 'webSearch':
      return await webSearch(args)

    case 'webScrape':
      return await webScrape(args)

    default:
      return `Tool ${tool} not found.`
  }
}

export default router
