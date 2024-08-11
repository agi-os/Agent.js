import { exec } from 'child_process'
import util from 'util'
import { getName } from './getName.js'

// Convert the 'exec' function into a Promise-based function using 'util.promisify'
const execPromise = util.promisify(exec)

// Export a default async function that takes a 'job' object as an argument
const main = async job => {
  // Destructure the 'command' property from the 'data' property of the 'job' object
  // const { command } = job.data

  const name = await getName(job.data)

  try {
    // Execute the command using the Promise-based 'execPromise' function
    // The 'stdout' and 'stderr' properties of the result object are destructured
    // const { stdout, stderr } = await execPromise(command)

    const { stdout, stderr } = await execPromise('date')

    // If there is an error message in 'stderr', log it to the console
    if (stderr) {
      console.error('Stderr:', stderr)
    }

    // Return the standard output of the command
    return stdout + ' ' + name
  } catch (error) {
    // If there is an error executing the command, log it to the console and rethrow the error
    console.error('Error executing command:', error)
    throw error
  }
}

export default main
