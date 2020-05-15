exports.up = (knex, Promise) => {
  return knex.raw(`
  CREATE OR REPLACE RULE email_rule AS
    ON INSERT TO public.email WHERE verify_email(new.id_customer, new.email)
    DO INSTEAD
    SELECT * FROM public.email WHERE id_customer = new.id_customer AND email = new.email;
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`DROP RULE IF EXISTS email_rule ON email CASCADE`)
}