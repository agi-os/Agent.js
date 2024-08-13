import Groq from 'groq-sdk'

import dotenv from 'dotenv'
dotenv.config()

// Create a new client instance
const getClient = () =>
  new Groq({
    apiKey: process.env.GROQ_API_KEY,
  })

export default getClient
