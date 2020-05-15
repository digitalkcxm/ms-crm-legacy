exports.up = (knex, Promise) => {
  return knex.raw(`
  CREATE OR REPLACE RULE business_partner_rule AS
    ON INSERT TO public.business_partner WHERE verify_business_partner(new.id_customer, new.cnpj)
    DO INSTEAD
  (UPDATE business_partner SET 
    fantasy_name = new.fantasy_name,
    status = new.status,
    foundation_date = new.foundation_date,
    updated_at = new.updated_at
  WHERE ((business_partner.id_customer = new.id_customer) 
  AND (btrim((business_partner.cnpj)::text) = btrim((new.cnpj)::text))))
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`DROP RULE IF EXISTS business_partner_rule ON business_partner CASCADE`)
}