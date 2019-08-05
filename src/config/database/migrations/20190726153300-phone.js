exports.up = (knex, Promise) => {
  return knex.schema.createTable('phone', (table) => {
    table.increments(),
    table.string('number').notNullable(),
    table.string('type'),
    table.integer('id_customer').notNullable(),
    table.timestamps(true, true),
    table.foreign('id_customer').references('customer.id')
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTableIfExists('phone')
}