exports.up = (knex, Promise) => {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION update_search_indexed()
      RETURNS TRIGGER
      LANGUAGE PLPGSQL
      AS          
      $$                               
      BEGIN
        UPDATE customer                                                                   
        SET token_search_indexed = t.search_indexed
        FROM (
        SELECT c.id, concat_ws(':', c.name, c.cpfcnpj, string_agg(distinct e.email, ':'), string_agg(distinct p.number, ':')) AS search_indexed
        FROM customer c
        LEFT JOIN email e ON c.id = e.id_customer
        LEFT JOIN phone p ON c.id = p.id_customer
        WHERE c.id = old.id_customer
        GROUP BY c.id) as t 
        WHERE customer.id = old.id_customer;
        RETURN NEW;
      END;
      $$
      ;
    
    CREATE OR REPLACE FUNCTION update_search_indexed_on_insert()
      RETURNS TRIGGER
      LANGUAGE PLPGSQL
      AS          
      $$                               
      BEGIN
        UPDATE customer                                                                   
        SET token_search_indexed = t.search_indexed
        FROM (
        SELECT c.id, concat_ws(':', c.name, c.cpfcnpj, string_agg(distinct e.email, ':'), string_agg(distinct p.number, ':')) AS search_indexed
        FROM customer c
        LEFT JOIN email e ON c.id = e.id_customer
        LEFT JOIN phone p ON c.id = p.id_customer
        WHERE c.id = new.id_customer
        GROUP BY c.id) as t 
        WHERE customer.id = new.id_customer;
        RETURN NEW;
      END;
      $$
      ;
    
    CREATE OR REPLACE FUNCTION update_search_indexed_on_update_customer()
      RETURNS TRIGGER
      LANGUAGE PLPGSQL
      AS          
      $$                               
      BEGIN
        UPDATE customer                                                                   
        SET token_search_indexed = t.search_indexed
        FROM (
        select c.id, concat_ws(':', c.name, c.cpfcnpj, string_agg(distinct e.email, ':'), string_agg(distinct p.number, ':')) AS search_indexed
        FROM customer c
        LEFT JOIN email e ON c.id = e.id_customer
        LEFT JOIN phone p ON c.id = p.id_customer
        WHERE c.id = new.id
        GROUP BY c.id
        ) as t 
        WHERE customer.id = t.id;
        return new;
      END;
      $$
      ;
    
    CREATE OR REPLACE FUNCTION update_search_indexed_on_insert_customer()
      RETURNS TRIGGER
      LANGUAGE PLPGSQL
      AS          
      $$                               
      BEGIN
        UPDATE customer                                                                   
        SET token_search_indexed = t.search_indexed
        FROM (
        SELECT c.id, concat_ws(':', c.name, c.cpfcnpj, string_agg(distinct e.email, ':'), string_agg(distinct p.number, ':')) AS search_indexed
        FROM customer c
        LEFT JOIN email e ON c.id = e.id_customer
        LEFT JOIN phone p ON c.id = p.id_customer
        WHERE c.id = new.id
        GROUP BY c.id) as t 
        WHERE customer.id = new.id;
        RETURN NEW;
      END;
      $$
      ;
    
    -- TRIGGERS
    DROP TRIGGER IF EXISTS update_search_indexed_email ON email;
    CREATE TRIGGER update_search_indexed_email
    AFTER UPDATE 
    ON email 
    FOR EACH ROW
    EXECUTE PROCEDURE update_search_indexed();
    
    DROP TRIGGER IF EXISTS insert_search_indexed_email ON email;
    CREATE TRIGGER insert_search_indexed_email
    AFTER INSERT                              
    ON email                                  
    FOR EACH ROW
    EXECUTE PROCEDURE update_search_indexed_on_insert();
    
    DROP TRIGGER IF EXISTS delete_search_indexed_email ON email;
    CREATE TRIGGER delete_search_indexed_email
    AFTER DELETE                              
    ON email                                  
    FOR EACH ROW
    EXECUTE PROCEDURE update_search_indexed();
    
    DROP TRIGGER IF EXISTS update_search_indexed_phone ON phone;
    CREATE TRIGGER update_search_indexed_phone
    AFTER UPDATE 
    ON phone 
    FOR EACH ROW
    EXECUTE PROCEDURE update_search_indexed();
    
    DROP TRIGGER IF EXISTS insert_search_indexed_phone ON phone;
    CREATE TRIGGER insert_search_indexed_phone
    AFTER INSERT                              
    ON phone                                  
    FOR EACH ROW
    EXECUTE PROCEDURE update_search_indexed_on_insert();
    
    DROP TRIGGER IF EXISTS delete_search_indexed_phone ON phone;
    CREATE TRIGGER delete_search_indexed_phone
    AFTER DELETE                              
    ON phone                                  
    FOR EACH ROW
    EXECUTE PROCEDURE update_search_indexed();
    
    DROP TRIGGER IF EXISTS update_search_indexed_customer ON customer;
    CREATE TRIGGER update_search_indexed_customer
    AFTER UPDATE OF NAME, cpfcnpj
    ON customer
    FOR EACH ROW
    EXECUTE PROCEDURE update_search_indexed_on_update_customer();
    
    DROP TRIGGER IF EXISTS insert_search_indexed_customer ON customer;
    CREATE TRIGGER insert_search_indexed_customer
    AFTER INSERT                              
    ON customer                                  
    FOR EACH ROW
    EXECUTE PROCEDURE update_search_indexed_on_insert_customer();
  `)
}

exports.down = (knex, Promise) => { 
  return knex.raw(`
    DROP TRIGGER IF EXISTS insert_search_indexed_customer ON customer;
    DROP TRIGGER IF EXISTS update_search_indexed_customer ON customer;
    DROP TRIGGER IF EXISTS delete_search_indexed_phone ON phone;
    DROP TRIGGER IF EXISTS insert_search_indexed_phone ON phone;
    DROP TRIGGER IF EXISTS update_search_indexed_phone ON phone;
    DROP TRIGGER IF EXISTS delete_search_indexed_email ON email;
    DROP TRIGGER IF EXISTS insert_search_indexed_email ON email;
    DROP TRIGGER IF EXISTS update_search_indexed_email ON email;
    DROP FUNCTION IF EXISTS update_search_indexed();
    DROP FUNCTION IF EXISTS update_search_indexed_on_insert();
    DROP FUNCTION IF EXISTS update_search_indexed_on_update_customer();   
    DROP FUNCTION IF EXISTS update_search_indexed_on_insert_customer();
  `)
}