exports.up = (knex, Promise) => {
  return knex.schema.createTable('cpc_address', (table) => {
    table.increments()
    table.integer('id_customer').notNullable()
    table.integer('id_address').notNullable()
    table.integer('user_id').notNullable()
    table.string('username')
    table.timestamps(true, true)
    table.foreign('id_customer').references('customer.id')
    table.foreign('id_address').references('address.id')
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTableIfExists('cpc_address')
}