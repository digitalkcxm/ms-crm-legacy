exports.up = (knex, Promise) => {
  return knex.schema.createTable('email', (table) => {
    table.increments(),
    table.string('email').notNullable(),
    table.integer('id_customer').notNullable().unsigned(),
    table.timestamps(true, true),
    table.foreign('id_customer').references('customer.id')
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTableIfExists('email')
}