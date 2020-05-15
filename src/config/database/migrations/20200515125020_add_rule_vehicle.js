exports.up = (knex, Promise) => {
  return knex.raw(`
  CREATE OR REPLACE RULE vehicle_rule AS
    ON INSERT TO public.vehicle WHERE verify_vehicle(new.id_customer, new.plate)
    DO INSTEAD
  (UPDATE vehicle SET 
    model = new.model, 
    year = new.year, 
    renavam = new.renavam, 
    chassi = new.chassi, 
    license = new.license, 
    updated_at = new.updated_at
  WHERE ((vehicle.id_customer = new.id_customer) 
    AND (upper(btrim((vehicle.plate)::text)) = upper(btrim((new.plate)::text)))))
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`DROP RULE IF EXISTS vehicle_rule ON vehicle CASCADE`)
}