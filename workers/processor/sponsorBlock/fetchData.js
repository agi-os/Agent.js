import axios from 'axios'

const fetchData = async url => {
  try {
    const response = await axios.get(url)

    // Check if data is usable
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid data format', response.data)
    }

    // Return the response data
    return response.data
  } catch (error) {
    console.error(error)
    return []
  }
}

export default fetchData
