require('dotenv').config()
const NotesService = require('../src/notes/notes-service')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeNotesArray } = require('./notes.fixtures')

describe('notes endpoint', () => {
  let db
  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db)
  })
  after('disconnect from db', () => db.destroy())
  before('clean the table', () => db('notes').truncate())
  afterEach('cleanup',() => db('notes').truncate())

  describe('GET /api/notes', () => {
    context('Given no data in the notes table', () => {
      it('responds with 200 and empty array', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, [])
      })
    })
    context('Given data in the notes table', () => {
      const testNotes = makeNotesArray()
      beforeEach('insert note data', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })
      it('responds with 200 and notes', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, testNotes)
      })
    })
  })

  describe(`GET /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 999
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `note doesn't exist` } })
      })
    })
    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray()

      beforeEach('insert notes', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })
      describe(`POST /api/notes`, () => {
        it(`creates a note, responding with 201 and the new note`, () => {
          const newNote = {
            name: 'Test note 1',
            modified: "2019-01-03T00:00:00.000Z",
            folderId: "b0715efe-ffaf-11e8-8eb2-f2801f1b9fd1",
            content: "Test content"
          }
          return supertest(app)
            .post('/api/notes')
            .send(newNote)
            .expect(201)
            .expect(res => {
              expect(res.body.name).to.eql(newNote.name)
              expect(res.body.folderId).to.eql(newNote.folderId)
              expect(res.body.content).to.eql(newNote.content)
              expect(res.body).to.have.property('id')
              expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
              const expected = new Date(res.body.modified).toLocaleString()
              expect(actual).to.eql(expected)
            })
            .then(res =>
              supertest(app)
                .get(`/api/notes/${res.body.id}`)
                .expect(res.body)
            )
        })

        const requiredFields = ['title']

        requiredFields.forEach(field => {
          const newNote = {
            title:'test title'
          }

          it(`responds with 400 and an error message when the '${field}' is missing`, () => {
            delete newNote[field]

            return supertest(app)
              .post('/api/notes')
              .send(newnNote)
              .expect(400, {
                error: { message: `Missing '${field}' in request body` }
              })
          })
        })
      })

      describe(`DELETE /api/notes/:note_id`, () => {
        context(`Given no notes`, () => {
          it(`responds with 404`, () => {
            const noteId = 123456
            return supertest(app)
              .delete(`/api/notes/${noteId}`)
              .expect(404, { error: { message: `note doesn't exist` } })
          })
        })

        context('Given there are notes in the database', () => {
          const testNotes = makeNotesArray()

          beforeEach('insert notes', () => {
            return db
              .into('blogful_notes')
              .insert(testNotes)
          })

          it('responds with 204 and removes the note', () => {
            const idToRemove = 1
            const expectedNotes = testNotess.filter(note => note.id !== idToRemove)
            return supertest(app)
              .delete(`/api/notes/${idToRemove}`)
              .expect(204)
              .then(res =>
                supertest(app)
                  .get(`/api/notes`)
                  .expect(expectedNotes)
              )
          })
        })
      })

      describe(`PATCH /api/notes/:notes_id`, () => {
        context(`Given no notes`, () => {
          it(`responds with 404`, () => {
            const notesId = 123456
            return supertest(app)
              .delete(`/api/notes/${notesId}`)
              .expect(404, { error: { message: `notes doesn't exist` } })
          })
        })

        context('Given there are notes in the database', () => {
          const testnotess = makeNotesArray()

          beforeEach('insert notes', () => {
            return db
              .into('notes')
              .insert(testNotes)
          })

          it('responds with 204 and updates the notes', () => {
            const idToUpdate = 1
            const updateNotes = {
              title: 'updated notes title'
            }
            const expectednotes = {
              ...testNotess[idToUpdate - 1],
              ...updateNotes
            }
            return supertest(app)
              .patch(`/api/notes/${idToUpdate}`)
              .send(updateNotes)
              .expect(204)
              .then(res =>
                supertest(app)
                  .get(`/api/notes/${idToUpdate}`)
                  .expect(expectedNotes)
              )
          })

          it(`responds with 400 when no required fields supplied`, () => {
            const idToUpdate = 2
            return supertest(app)
              .patch(`/api/notes/${idToUpdate}`)
              .send({ irrelevantField: 'nope' })
              .expect(400, {
                error: {
                  message: `Request body must content either ''`
                }
              })
          })

          it(`responds with 204 when updating only a subset of fields`, () => {
            const idToUpdate = 2
            const updateNotes = {
              title: 'updated notes title',
            }
            const expectedNotes = {
              ...testNotes[idToUpdate - 1],
              ...updateNotes
            }

            return supertest(app)
              .patch(`/api/notes/${idToUpdate}`)
              .send({
                ...updateNotes,
                fieldToIgnore: 'should not be in GET response'
              })
              .expect(204)
              .then(res =>
                supertest(app)
                  .get(`/api/notes/${idToUpdate}`)
                  .expect(expectedotes)
              )
          })
        })
      })
    })
  })
})

