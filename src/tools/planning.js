import createChatCompletion from './ai.js'
import { z } from 'zod'

const Plan = z
  .object({
    steps: z.array(z.string()).describe('Simple steps to achieve the goal'),
    ideas: z.array(z.string()).optional().describe('Ideas to improve the plan'),
  })
  .describe('Steps of the plan to achieve the goal in chronological order')

/**
 * Uses AI to divide and conquer the steps to achieve a goal
 * @param {string} query The goal to achieve after completing the steps
 * @returns {string} Plan the steps to achieve the goal
 */
const planning = async query => {
  const response = await createChatCompletion({
    query,
    systemMessage: 'Plan the steps to achieve the goal',
    schema: Plan,
  })

  return response
}

export default planning
