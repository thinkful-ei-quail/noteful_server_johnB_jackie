const FoldersService = {
  getAllFolders(knex) {
    return knex
      .select('*')
      .from('folders')
  },

  getById(knex, id) {
    return knex
      .select('*')
      .from('folders')
      .where({ id })
      .first()
  },

  insertFolder(knex, data) {
    return knex
      .insert(data)
      .into('folders')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },

  deleteFolder(knex, id) {
    return knex('folders')
      .where( { id })
      .delete()
  }
}

module.exports = FoldersService