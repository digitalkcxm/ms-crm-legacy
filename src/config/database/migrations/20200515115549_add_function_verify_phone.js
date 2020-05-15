exports.up = (knex, Promise) => {
  return knex.raw(`
  CREATE OR REPLACE FUNCTION public.verify_phone(
    integer,
    text)
      RETURNS boolean
      LANGUAGE 'sql'
  
      COST 100
      VOLATILE STRICT 
  AS $BODY$
    SELECT true FROM phone WHERE id_customer = $1 AND number = $2 LIMIT 1;
  $BODY$;
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`DROP FUNCTION IF EXISTS verify_phone(integer,text) CASCADE`)
}