/**
 * This function takes a video transcript and a number of chunks as input,
 * and splits the transcript into the specified number of chunks.
 *
 * @param {Array} transcript - An array of strings representing the video transcript.
 * @param {Number} numChunks - The number of chunks to split the transcript into.
 *
 * @returns {Array} An array of objects, where each object represents a chunk of the transcript.
 *                  Each object has a 'start' property (the index of the first item in the chunk)
 *                  and a 'text' property (the text of the chunk).
 */
const splitVideoTranscriptIntoChunks = (transcript, numChunks) => {
  // Calculate total duration (assuming each item is 1 second)
  const totalDuration = transcript.length

  // Calculate the target duration for each chunk
  const targetChunkDuration = Math.ceil(totalDuration / numChunks)

  let chunks = []
  let currentChunk = []
  let currentDuration = 0
  let startTime = 0

  for (let i = 0; i < transcript.length; i++) {
    currentChunk.push(transcript[i])
    currentDuration++

    // If we've reached the target duration or it's the last item
    if (currentDuration >= targetChunkDuration || i === transcript.length - 1) {
      chunks.push({
        start: startTime,
        text: currentChunk.join(' '),
      })

      startTime = i + 1
      currentChunk = []
      currentDuration = 0

      // If we've created the desired number of chunks, add any remaining items to the last chunk
      if (chunks.length === numChunks - 1 && i < transcript.length - 1) {
        chunks.push({
          // make start time in MM:SS format for ease of use
          start: startTime,
          text: transcript.slice(i + 1).join(' '),
        })
        break
      }
    }
  }

  // Replace all starts with MM:SS for ease of use
  chunks = chunks.map(chunk => ({
    ...chunk,
    start: new Date(chunk.start * 1000).toISOString().slice(14, 19),
  }))

  // Clean up any double spaces in the text
  chunks = chunks.map(chunk => ({
    ...chunk,
    text: chunk.text.replace(/\s+/g, ' ').trim(),
  }))

  // Return the chunks
  return chunks
}

export default splitVideoTranscriptIntoChunks
