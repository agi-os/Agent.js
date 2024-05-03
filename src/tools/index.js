import echo from './echo.js'
import webSearch from './webSearch.js'
import reflection from './reflection.js'
import planning from './planning.js'
import webScrape from './webScrape.js'

export const tools = {
  echo,
  planning,
  reflection,
  webSearch,
  webScrape,
}

/**
 * Router for tools
 */
const router = async ({ tool, args }) => {
  const toolFunction = tools[tool]
  if (toolFunction) {
    return await toolFunction(args)
  } else {
    return `Tool ${tool} not found.`
  }
}

export default router
