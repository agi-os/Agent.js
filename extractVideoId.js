/**
 * Extracts a YouTube video ID from a given string.
 *
 * This function takes a string as input, which can be either a full YouTube URL
 * or a YouTube video ID. If the input is a full URL, the function extracts the
 * video ID from it. If the input is already a valid YouTube video ID, the function
 * returns it as is.
 *
 * @param {string} videoId - The string from which to extract the YouTube video ID.
 * @returns {string} The extracted YouTube video ID.
 */
const extractVideoId = videoId => {
  // Sanity check
  if (typeof videoId !== 'string') {
    throw new Error('Invalid input: videoId must be a string')
  }

  // Remove any leading or trailing whitespace
  videoId = videoId.trim()

  // Check if the videoId is already a valid YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return videoId
  }

  // Remove the protocol and domain from the URL
  videoId = videoId.replace(
    /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/,
    ''
  )

  // If there are any query parameters, remove them
  if (videoId.includes('&')) {
    videoId = videoId.split('&')[0]
  }

  return videoId
}

export default extractVideoId
