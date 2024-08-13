/**
 * Processes an array of data chunks. If a chunk's text length is less than or equal to a specified threshold,
 * it attempts to merge the chunk with the next non-empty chunk. The function skips empty chunks and adds chunks that are
 * not short or cannot be merged to the processed data.
 *
 * @param {Array} data - An array of data chunks. Each chunk is an object with a 'text' property.
 * @param {number} shortTextThreshold - The maximum length of text for a chunk to be considered short. Default is 15.
 * @returns {Array} - An array of processed data chunks.
 */
const processShortChunks = (data, shortTextThreshold = 15) => {
  return data.reduce((processedData, currentChunk, i) => {
    // Skip empty chunks
    if (currentChunk.text.trim() === '') return processedData

    // If the current chunk is short, try to merge it with the next non-empty chunk
    if (currentChunk.text.length <= shortTextThreshold && i < data.length - 1) {
      const nextNonEmptyChunkIndex = data.findIndex(
        (chunk, j) => j > i && chunk.text.trim() !== ''
      )
      if (nextNonEmptyChunkIndex !== -1) {
        data[nextNonEmptyChunkIndex].text =
          currentChunk.text + ' ' + data[nextNonEmptyChunkIndex].text
        return processedData // Merge successful, skip adding current chunk
      }
    }

    // If not short or no suitable merge, add it to the processed data
    processedData.push(currentChunk)
    return processedData
  }, [])
}

export default processShortChunks
