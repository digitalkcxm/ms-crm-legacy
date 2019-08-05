exports.up = (knex, Promise) => {
  return knex.schema.createTable('vehicle', (table) => {
    table.increments(),
    table.string('plate'),
    table.string('model'),
    table.string('year'),
    table.string('renavam'),
    table.string('chassi'),
    table.string('license'),
    table.integer('id_customer').notNullable().unsigned(),
    table.timestamps(true, true),
    table.foreign('id_customer').references('customer.id')
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTableIfExists('vehicle')
}