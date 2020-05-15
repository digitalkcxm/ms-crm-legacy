exports.up = (knex, Promise) => {
  return knex.raw(`
  CREATE OR REPLACE FUNCTION public.verify_address(
    integer,
    text,
    text)
      RETURNS boolean
      LANGUAGE 'sql'
  
      COST 100
      VOLATILE STRICT 
  AS $BODY$
    SELECT true FROM address WHERE id_customer = $1 AND UPPER(TRIM(street)) = UPPER(TRIM($2)) AND TRIM(cep) = TRIM($3) LIMIT 1;
  $BODY$;
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`DROP FUNCTION IF EXISTS verify_address(integer,text,text) CASCADE`)
}