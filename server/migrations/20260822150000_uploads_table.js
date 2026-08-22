export async function up(knex) {
  await knex.schema.createTable('uploads', (table) => {
    table.increments('id').primary()
    table.string('filename', 255).notNullable()
    table.string('mime_type', 100).notNullable()
    table.integer('size_bytes').notNullable()
    table.binary('data').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('uploads')
}
