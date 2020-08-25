const app = require('./app')
const knex = require('knex')

const { PORT, DATABASE_URL } = require('./config')

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
})

app.set('db', db)

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening in ${NODE_ENV} mode on port ${PORT}`)
})