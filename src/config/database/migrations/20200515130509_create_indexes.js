exports.up = (knex, Promise) => {
  return knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_customer_key_fields ON customer(company_token, cpfcnpj);
    CREATE INDEX IF NOT EXISTS idx_address_customer ON address(id_customer, street, cep);
    CREATE INDEX IF NOT EXISTS idx_business_partner_customer ON business_partner(id_customer, cnpj);
    CREATE INDEX IF NOT EXISTS idx_email_customer ON email(id_customer, email);
    CREATE INDEX IF NOT EXISTS idx_phone_customer ON phone(id_customer, number);
    CREATE INDEX IF NOT EXISTS idx_vehicle_customer ON vehicle(id_customer, plate);
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`
    DROP INDEX IF EXISTS idx_customer_key_fields;
    DROP INDEX IF EXISTS idx_address_customer;
    DROP INDEX IF EXISTS idx_business_partner_customer;
    DROP INDEX IF EXISTS idx_email_customer;
    DROP INDEX IF EXISTS idx_phone_customer;
    DROP INDEX IF EXISTS idx_vehicle_customer;
  `)
}