import { exec } from 'child_process'
import util from 'util'
import { promises as fsPromises } from 'fs'
import path from 'path'

const execPromise = util.promisify(exec)

const main = async job => {
  try {
    const { videoId, useCache = true } = job.data

    if (!videoId) {
      throw new Error('videoId is required')
    }

    const outputDir = `/tmp/agentjs/${videoId}`

    if (useCache) {
      try {
        const files = await fsPromises.readdir(outputDir)
        const subtitleFile = files.find(file => file.endsWith('.json3'))
        if (subtitleFile) {
          const filePath = path.join(outputDir, subtitleFile)
          return { cached: true, path: filePath }
        }
      } catch {
        // Ignore errors
      }
    }

    try {
      await fsPromises.access(outputDir)
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fsPromises.mkdir(outputDir, { recursive: true })
      } else {
        throw err
      }
    }

    // First, try to get automatic subtitles
    const autoCommand = [
      'yt-dlp',
      '--no-warnings',
      '--write-auto-subs',
      '--sub-format=json3',
      '--skip-download',
      `--output="${outputDir}/%(id)s"`,
      videoId,
    ].join(' ')

    try {
      const { stdout, stderr } = await execPromise(autoCommand)
      await fsPromises.writeFile(`${outputDir}/yt-dlp.log`, stdout)
      if (stderr) {
        console.error('Stderr:', stderr)
        await fsPromises.writeFile(`${outputDir}/yt-dlp.error.log`, stderr)
      }
    } catch (error) {
      console.error('Error getting automatic subtitles:', error)
    }

    // Check if automatic subtitles were successfully downloaded
    const files = await fsPromises.readdir(outputDir)
    let subtitleFile = files.find(file => file.endsWith('.json3'))

    // If no automatic subtitles, try to get manually uploaded subtitles
    if (!subtitleFile) {
      console.log(
        'No automatic subtitles found. Trying manually uploaded subtitles...'
      )
      const manualCommand = [
        'yt-dlp',
        '--no-warnings',
        '--write-subs',
        '--sub-format=json3',
        '--skip-download',
        `--output="${outputDir}/%(id)s"`,
        videoId,
      ].join(' ')

      try {
        const { stdout, stderr } = await execPromise(manualCommand)
        await fsPromises.writeFile(`${outputDir}/yt-dlp_manual.log`, stdout)
        if (stderr) {
          console.error('Stderr:', stderr)
          await fsPromises.writeFile(
            `${outputDir}/yt-dlp_manual.error.log`,
            stderr
          )
        }
      } catch (error) {
        console.error('Error getting manual subtitles:', error)
      }

      // Check again for subtitle file
      const updatedFiles = await fsPromises.readdir(outputDir)
      subtitleFile = updatedFiles.find(file => file.endsWith('.json3'))
    }

    if (!subtitleFile) {
      throw new Error('No subtitle file found (automatic or manual)')
    }

    const filePath = path.join(outputDir, subtitleFile)
    return { cached: false, path: filePath }
  } catch (error) {
    console.error('Error executing command:', error)
    throw error
  }
}

export default main
