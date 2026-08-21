export async function up(knex) {
  await knex.schema.createTable('password_reset_tokens', (table) => {
    table.increments('id').primary()
    table
      .integer('buyer_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('buyer_accounts')
      .onDelete('CASCADE')
    table.string('token_hash', 64).notNullable()
    table.timestamp('expires_at', { useTz: true }).notNullable()
    table.timestamp('used_at', { useTz: true })
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())

    table.index(['token_hash'], 'prt_token_hash_idx')
    table.index(['buyer_id'], 'prt_buyer_id_idx')
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('password_reset_tokens')
}
