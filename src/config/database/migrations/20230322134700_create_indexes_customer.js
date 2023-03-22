exports.up = (knex, Promise) => {
  return knex.raw(`
    DROP INDEX IF EXISTS customer_company_token_search_indexed;
    CREATE INDEX IF NOT EXISTS idx_customer_company_token_search_indexed_business_template_lis ON public.customer USING gin (company_token gin_trgm_ops, token_search_indexed gin_trgm_ops, business_template_list)
  `)
}

exports.down = (knex, Promise) => {
  return knex.raw(`
    DROP INDEX IF EXISTS idx_customer_company_token_search_indexed_business_template_lis;
  `)
}
