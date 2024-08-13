const { Client } = require('pg')

// Import the dotenv package
require('dotenv').config()

// Database connection configuration
const dbConfig = {
  user: process.env.PG_USER,
  password: process.env.PG_PW,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DB,
}

// Create a new client instance
const client = new Client(dbConfig)

// Connect to the database
async function connectAndQuery() {
  try {
    await client.connect()
    console.log('Connected to PostgreSQL database')

    // Execute SQL queries here
    const result = await client.query('SELECT data FROM test WHERE id = 2')
    console.log('Query result:', result.rows)

    // Close the connection when done
    await client.end()
    console.log('Connection to PostgreSQL closed')
  } catch (err) {
    console.error('Error connecting or querying PostgreSQL database', err)
  }
}

// Call the async function
connectAndQuery()
