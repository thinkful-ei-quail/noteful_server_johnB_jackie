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

  before('truncate tables', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

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
      const testFolders = makeFoldersArray()
      
      beforeEach('insert folder data', () => {  
        return db('folders')
          .insert(testFolders)
      })

      afterEach('clean table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

      it('responds with 200 and folders', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, testFolders)
      })
    })
  })
})