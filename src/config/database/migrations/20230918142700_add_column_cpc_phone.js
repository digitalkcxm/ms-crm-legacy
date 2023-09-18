exports.up = (knex, Promise) => {
  return knex.raw(`
    ALTER TABLE cpc_phone ADD COLUMN cpc BOOL DEFAULT FALSE;
  `)
}

exports.down = (knex, Promise) => {
  return knex.raw(`
    ALTER TABLE cpc_phone DROP COLUMN cpc;
  `)
}
