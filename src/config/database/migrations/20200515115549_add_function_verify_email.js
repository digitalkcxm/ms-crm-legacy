exports.up = (knex, Promise) => {
  return knex.raw(`
  CREATE OR REPLACE FUNCTION public.verify_email(
    integer,
    text)
      RETURNS boolean
      LANGUAGE 'sql'
  
      COST 100
      VOLATILE STRICT 
  AS $BODY$
    SELECT true FROM email WHERE id_customer = $1 AND email = $2 LIMIT 1;
  $BODY$;
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`DROP FUNCTION IF EXISTS verify_email(integer, text) CASCADE`)
}