const NotesService = {
    getAllNotes(knex) {
      console.log(knex)
      return knex
        .select('*')
        .from('notes')
    },
  }
  
  module.exports = NotesService