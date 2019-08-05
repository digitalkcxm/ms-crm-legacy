exports.up = (knex, Promise) => {
  return knex.schema.createTable('address', (table) => {
    table.increments(),
    table.string('street').notNullable(),
    table.string('city'),
    table.string('cep'),
    table.string('state'),
    table.string('district'),
    table.string('type'),
    table.integer('id_customer').notNullable(),
    table.timestamps(true, true),
    table.foreign('id_customer').references('customer.id')
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTableIfexists('address')
}