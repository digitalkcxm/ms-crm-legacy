exports.up = (knex, Promise) => {
  return knex.schema.alterTable('customer', (table) => {
    table.json('business_list')
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.alterTable('customer', (table) => {
      table.dropColumn('business_list')
  })
}