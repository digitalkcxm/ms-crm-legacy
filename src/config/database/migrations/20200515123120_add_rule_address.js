exports.up = (knex, Promise) => {
  return knex.raw(`
  CREATE OR REPLACE RULE address_rule AS
    ON INSERT TO public.address WHERE verify_address(new.id_customer, new.street, new.cep)
    DO INSTEAD
  (UPDATE address SET 
    city = new.city,
    state = new.state,
    district = new.district,
    type = new.type,
    updated_at = new.updated_at
  WHERE 
    ((address.id_customer = new.id_customer) 
    AND (upper(btrim((address.street)::text)) = upper(btrim((new.street)::text))) 
    AND (btrim((address.cep)::text) = btrim((new.cep)::text))))
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`DROP RULE IF EXISTS address_rule ON address CASCADE`)
}