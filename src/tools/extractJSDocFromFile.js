import doctrine from 'doctrine'
import fs from 'fs'

/**
 * Extract JSDoc comments from a file
 * @param {string} filePath - The path to the file
 * @returns {object[]} - An array of JSDoc objects
 */
const extractJSDocFromFile = filePath => {
  // Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf-8')

  // Regex to match JSDoc comments
  const regex = /\/\*\*([\s\S]*?)\*\//gm

  let match
  const jsdocComments = []

  // Loop through all JSDoc comments in the file
  while ((match = regex.exec(fileContent))) {
    const comment = match[1]
    const ast = doctrine.parse(comment, { unwrap: true })
    jsdocComments.push(ast)
  }

  return jsdocComments
}

export default extractJSDocFromFile
