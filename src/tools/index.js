/**
 * Echoes the message for testing purposes
 * @param {string} msg - The message to echo
 * @returns {string} - The echoed message
 */
export const echo = async msg => {
  console.log('starting echo')
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('echo:', msg)
      resolve(msg + ' (echoed)')
    }, 500)
  })
}
