require('dotenv').config()
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')

describe('Folders endpoint', () => {
  let db
  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db)
  })
  
  // before('truncate', () => db('folders').truncate());
  // before('truncate', () => db('folders').truncate());
  

  describe('GET /api/folders', () => {
    context('Given no data in the folders table', () => {
      it('responds with 200 and empty array', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, [])
      })
    })
  })
})