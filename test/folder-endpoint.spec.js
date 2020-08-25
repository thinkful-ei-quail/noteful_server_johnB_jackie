const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app.js')

const { makeFoldersArray } = require('./folders.fixtures')

describe('Folders endpoint', () => {

  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db)
  })

  after('destroy connection to db', () => db.destroy())
  
  

  describe('GET /api/folders', () => {
    context('Given no data in the folders table', () => {
      it('responds with 200 and empty array', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, [])
      })
    })
    context('Given data in the folders table', () => {
      beforeEach('insert folder data', () => {
        const testFolders = makeFoldersArray()
        return db('folders')
          .insert(testFolders)
      })

      it('responds with 200 and folders', () => {

      })
    })
  })
})