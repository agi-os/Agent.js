import getQueue from './getQueue.js'

/**
 * Defines the configuration for the job to be added to the queue
 * with max 6 attempts & exponential backoff (0s, 0.5s, 1s, 2s, 4s, 8s)
 * @type {object}
 */
export const jobConfig = {
  attempts: 6,
  backoff: {
    type: 'exponential',
    delay: 500,
  },
}

/**
 * Adds a job to the specified queue.
 * @param {string} queueName - The name of the queue to which the payload will be added.
 * @param {object} payload - The data to be added to the queue.
 * @returns {Promise} A promise that resolves when the payload has been successfully added to the queue.
 */
const addToQueue = async (queueName, payload) =>
  getQueue(queueName).add(queueName, payload, jobConfig)

export default addToQueue
