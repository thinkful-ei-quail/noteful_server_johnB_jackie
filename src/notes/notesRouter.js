const express = require('express')
const xss = require('xss')
const path = require('path')

const notesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

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
  .post(jsonParser, (req, res, next) => {
    const { id, name, modified, folderId, content } = req.body
    const newNote = { id, name, modified, folderId, content }

    for (const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    NotesService.insertArticle(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note))
      })
      .catch(next)
  })

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    NotesService.getById(
      req.app.get('db'),
      req.params.note_id
    )
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: `note doesn't exist` }
          })
        }
        res.note = note
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note))
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(
      req.app.get('db'),
      req.params.note_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { name, modified, folderId, content } = req.body
    const noteToUpdate = { name, modified, folderId, content }

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either name, modified, folderId, content`
        }
      })

    NotesService.updateNote(
      req.app.get('db'),
      req.params.note_id,
      noteToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = notesRouter