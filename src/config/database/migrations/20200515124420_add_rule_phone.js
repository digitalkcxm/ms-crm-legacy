exports.up = (knex, Promise) => {
  return knex.raw(`
  CREATE OR REPLACE RULE phone_rule AS
    ON INSERT TO public.phone WHERE verify_phone(new.id_customer, new.number)
    DO INSTEAD
  (UPDATE phone SET 
    type = new.type, 
    updated_at = new.updated_at
  WHERE ((phone.id_customer = new.id_customer) 
    AND ((phone.number)::text = (new.number)::text)))
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`DROP RULE IF EXISTS phone_rule ON phone CASCADE`)
}