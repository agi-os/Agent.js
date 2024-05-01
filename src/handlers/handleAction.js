import tools from '../tools/index.js'

const handleAction = socket => async (action, callback) => {
  try {
    const { tool, args } = action

    console.log('action:', { tool, args })

    const response = await tools({ tool, args })

    if (callback && typeof callback === 'function') {
      callback(response)
    }
  } catch (error) {
    console.error('error:', error)
    if (callback && typeof callback === 'function') {
      callback(error)
    }
  }
}

export default handleAction
