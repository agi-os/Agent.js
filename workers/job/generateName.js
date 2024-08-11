import addToQueue from '../queue/addToQueue.js'

const generateName = async ({
  type,
  customPrefix = null,
  customName = null,
} = {}) => {
  // Sanity check
  if (!type) {
    throw new Error('Type is required')
  }

  const jobData = { type }

  if (customPrefix) {
    jobData.customPrefix = customPrefix
  }

  if (customName) {
    jobData.customName = customName
  }

  await addToQueue('nameGenerator', jobData)
}

export default generateName
