exports.up = (knex, Promise) => {
  return knex.raw(`
  CREATE OR REPLACE FUNCTION public.verify_business_partner(
    integer,
    text)
      RETURNS boolean
      LANGUAGE 'sql'
  
      COST 100
      VOLATILE STRICT 
  AS $BODY$
    SELECT true FROM business_partner WHERE id_customer = $1 AND TRIM(cnpj) = TRIM($2) LIMIT 1;
  $BODY$;
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`DROP FUNCTION IF EXISTS verify_business_partner(integer,text) CASCADE`)
}