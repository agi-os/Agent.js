/**
 * Converts an subtitle data object into an array of strings.
 * Each string in the array represents the concatenated words that occur at a specific second in the event timeline.
 * The function ignores special blocks (like [Music]) and does not add a word to the array if it is the same as the last word added.
 *
 * @param {Object} data - The data object containing the events to be converted.
 * @returns {Array} secondsArray - An array of strings, where each string is the concatenated words that occur at a specific second in the event timeline.
 */
const converter = data => {
  const secondsArray = []
  let lastWord = ''

  data.events.forEach(event => {
    if (event.segs) {
      event.segs.forEach(seg => {
        const offset = Math.floor(
          (event.tStartMs + (seg.tOffsetMs || 0)) / 1000
        )

        // Ensure the array is long enough
        while (secondsArray.length <= offset) {
          secondsArray.push('')
        }

        // Add the word only if it's not a special block (like [Music])
        if (!seg.utf8.startsWith('[') || !seg.utf8.endsWith(']')) {
          // Add the word only if it's different from the last added word
          if (seg.utf8 !== lastWord) {
            secondsArray[offset] += seg.utf8 + ' '
            lastWord = seg.utf8
          }
        }
      })
    }
  })

  // Trim all array elements, removing invisibles and extra spaces
  for (let i = 0; i < secondsArray.length; i++) {
    secondsArray[i] = secondsArray[i].trim().replace(/\s+/g, ' ')
  }

  // Return proceeded array
  return secondsArray
}

export default converter
