const FoldersService = {
  getAllFolders(knex) {
    console.log(knex)
    return knex
      .select('*')
      .from('folders')
  },
}

module.exports = FoldersService