exports.up = (knex, Promise) => {
  return knex.raw(`
    ALTER TABLE customer ALTER COLUMN business_template_list TYPE JSONB;
  `)
}

exports.down = (knex, Promise) => {
  return knex.raw(`
  ALTER TABLE customer ALTER COLUMN business_template_list TYPE JSON;
  `)
}
