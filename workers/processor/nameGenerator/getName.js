import { data } from './data.js'
import { getRandomItem } from './getRandomItem.js'

export const getName = ({
  type,
  customPrefix = null,
  customName = null,
} = {}) => {
  // Sanity check
  if (!type) {
    throw new Error('Type is required')
  }

  const animal = data[type]
  if (!animal) {
    throw new Error(
      `Invalid animal type: ${type}. Supported types: ${Object.keys(data).join(
        ', '
      )}`
    )
  }

  const prefix = customPrefix || getRandomItem(animal.prefixes)
  const name = customName || getRandomItem(animal.names)

  return `${prefix}${name}`
}
