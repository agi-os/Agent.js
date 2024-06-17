// List of file extensions to fulfill with an empty body
const emptyBodyExtensions = ['.png', '.jpg', '.css']

// List of paths to fulfill with an empty body
const emptyBodyPaths = [
  'favicon.ico',
  'web-vitals',
  'intake.pbstck.com',
  'yield.h5v.eu',
]

/**
 * Checks if the given URL should be fulfilled with an empty body based on its extension or filename.
 *
 * @param {string} url - The URL to check.
 * @returns {boolean} True if the URL should be fulfilled with an empty body.
 */
const shouldFulfillWithEmptyBody = url => {
  // Check if the URL ends with any of the specified extensions or filenames
  return (
    emptyBodyExtensions.some(extension => url.endsWith(extension)) ||
    emptyBodyPaths.some(filename => url.includes(filename))
  )
}

export default shouldFulfillWithEmptyBody
