exports.up = (knex, Promise) => {
  return knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_customer_name_cpfcnpj ON customer(company_token, name, cpfcnpj);
    CREATE INDEX IF NOT EXISTS idx_email_id_customer ON email(id_customer, email);
    CREATE INDEX IF NOT EXISTS idx_phone_id_customer ON phone(id_customer, number);
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`
    DROP INDEX IF EXISTS idx_customer_name_cpfcnpj;
    DROP INDEX IF EXISTS idx_email_id_customer;
    DROP INDEX IF EXISTS idx_phone_id_customer;
  `)
}