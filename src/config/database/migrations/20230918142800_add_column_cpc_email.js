exports.up = (knex, Promise) => {
  return knex.raw(`
    ALTER TABLE cpc_email ADD COLUMN cpc BOOL DEFAULT FALSE;
  `)
}

exports.down = (knex, Promise) => {
  return knex.raw(`
    ALTER TABLE cpc_email DROP COLUMN cpc;
  `)
}
