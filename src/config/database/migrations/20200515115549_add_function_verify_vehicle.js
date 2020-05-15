exports.up = (knex, Promise) => {
  return knex.raw(`
  CREATE OR REPLACE FUNCTION public.verify_vehicle(
    integer,
    text)
      RETURNS boolean
      LANGUAGE 'sql'
  
      COST 100
      VOLATILE STRICT 
  AS $BODY$
    SELECT true FROM vehicle WHERE id_customer = $1 AND UPPER(TRIM(plate)) = UPPER(TRIM($2)) LIMIT 1;
  $BODY$;
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`DROP FUNCTION IF EXISTS verify_vehicle(integer,text) CASCADE`)
}