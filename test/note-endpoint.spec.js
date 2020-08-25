require('dotenv').config()
const NotesService = require('../src/notes/notes-service')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')

describe('notes endpoint', () => {
  let db
  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    }) 
    app.set('db', db)
  })
  
  // before('truncate', () => db('notes').truncate());
  // before('truncate', () => db('notes').truncate());
 
  describe('GET /api/notes', () => {
    context('Given no data in the notes table', () => {
      it.skip('responds with 200 and empty array', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, [])
      })
    })
  })
})