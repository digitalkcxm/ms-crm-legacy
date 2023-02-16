exports.up = (knex, Promise) => {
  return knex.raw(`
    ALTER TABLE customer ADD COLUMN responsible_user_id VARCHAR(20) DEFAULT '0';
  `)
}

exports.down = (knex, Promise) => {
  return knex.raw(`
    ALTER TABLE customer DROP COLUMN responsible_user_id;
  `)
}
