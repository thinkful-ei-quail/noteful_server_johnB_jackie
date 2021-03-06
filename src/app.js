require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')

const { NODE_ENV } = require('./config')
const foldersRouter = require('./folders/foldersRouter')
const notesRouter= require('./notes/notesRouter')
const app = express()

const morganOptions = NODE_ENV === 'production' ? 'tiny' : 'dev'

app.use(morgan(morganOptions))
app.use(helmet())
app.use(cors())

// Routers go here
app.use('/api/folders', foldersRouter)
app.use('/api/notes', notesRouter)
// eslint-disable-next-line no-unused-vars
app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    // eslint-disable-next-line no-console
    console.error(error);
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app