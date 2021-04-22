exports.up = (knex, Promise) => {
  return knex.raw(`
    ALTER TABLE customer ADD COLUMN token_search_indexed VARCHAR(100000);
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`
    ALTER TABLE customer DROP COLUMN token_search_indexed;
  `)
}