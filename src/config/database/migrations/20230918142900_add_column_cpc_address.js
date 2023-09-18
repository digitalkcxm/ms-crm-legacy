exports.up = (knex, Promise) => {
  return knex.raw(`
    ALTER TABLE cpc_address ADD COLUMN cpc BOOL DEFAULT FALSE;
  `)
}

exports.down = (knex, Promise) => {
  return knex.raw(`
    ALTER TABLE cpc_address DROP COLUMN cpc;
  `)
}
