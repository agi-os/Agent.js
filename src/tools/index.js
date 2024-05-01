import echo from './echo.js'
import webSearch from './webSearch.js'

/**
 * Router for actions
 */
const router = async ({ tool, args }) => {
  switch (tool) {
    case 'echo':
      return await echo(args)

    case 'Web search':
      return await webSearch(args)

    default:
      return `Tool ${tool} not found.`
  }
}

export default router
