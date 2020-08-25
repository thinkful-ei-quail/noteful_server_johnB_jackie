const express = require('express')
const xss = require('xss')
const path = require('path')

const notesService = require('./notes-service')

const notesRouter = express.Router()
const bodyParser = express.json()

const serializenote = note => ({
  id: note.id,
  name: xss(note.id),
  modified: note.modified
})

notesRouter 
  .route('/')
  .get((req, res, next) => {
    notesService.getAllnotes(req.app.get('db'))
      .then(notes => 
        res.json(notes.map(serializenote))
      )
      .catch(next)
  })

module.exports = notesRouter