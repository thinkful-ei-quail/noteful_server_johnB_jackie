const express = require('express')
const xss = require('xss')
const path = require('path')

const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const bodyParser = express.json()

const serializeFolder = folder => ({
  id: folder.id,
  name: xss(folder.id),
  modified: folder.modified
})

foldersRouter 
  .route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get('db'))
      .then(folders => 
        res.json(folders.map(serializeFolder))
      )
      .catch(next)
  })

module.exports = foldersRouter
