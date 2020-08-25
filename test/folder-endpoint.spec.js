const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app.js')

const { makeFoldersArray } = require('./folders.fixtures')
const { expect } = require('chai')

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

  afterEach('clean tables', () => {
    return db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE')
  })



  describe('GET /api/folders endpoint', () => {
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
  describe('GET /api/folders/:folderId endpoint', () => {
    context('given no data in folders table', () => {
      it('should respond 404', () => {
        const folderId = 123456
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(404, {
            error: { message: 'Folder Not Found' }
          })
      })
    })
    context('Given data in folders table', () => {
      const testFolders = makeFoldersArray()

      beforeEach('insert folders into table', () => {
        return db
          .into('folders')
          .insert(testFolders)
      })

      

      it('should respond 200 with folder matching id', () => {
        const expectedId = 1
        const expectedFolder = testFolders[expectedId - 1]
        return supertest(app)
          .get(`/api/folders/${expectedId}`)
          .expect(200, expectedFolder)
      })
    })
  })
  describe('POST /api/folders endpoint', () => {
    context('Given no data in folders table', () => {
      it('should respond with 201 and location header', function() {
        this.retries(3)
        const newFolder = {
          name: 'New Test Folder'
        }
        return supertest(app)
          .post('/api/folders')
          .send(newFolder)
          .set({
            'content-type': 'application/json'
          })
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id')
            expect(res.body.name).to.eql(newFolder.name)
            const expected = new Date().toLocaleString
            const actual = new Date(res.body.modified).toLocaleString
            expect(actual).to.eql(expected)  
          })
      })
      it('should respond with 400 if required fields not provided', () => {
        const newFolder ={
          id: 3
        }
        return supertest(app)
          .post('/api/folders')
          .send(newFolder)
          .set({
            'content-type': 'application/json'
          })
          .expect(400, {
            error: { message: 'Name is required' }
          })
      })
    })
  })
  describe('DELETE /api/folders/:folderId endpoint', () => {
    context('Given no data in folders table', () => {
      it('should respond with 404', () => {
        const folderId = 123456
        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(404, {
            error: { message: 'Folder Not Found' }
          })
      })
    })
    context('Given data in folders table', () => {
      const testFolders = makeFoldersArray()
      beforeEach('insert folders into db', () => {
        return db
          .insert(testFolders)
          .into('folders')
      })
      it.only('should remove folder with matching id from db', () => {
        const idToRemove = 1
        const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove)
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .expect(204)
          .then(() => {
            return supertest(app)
              .get('/api/folders')
              .expect(expectedFolders)
          })
      })
    })
  })
})
