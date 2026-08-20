/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Create custom enums
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE purchase_type AS ENUM ('regular', 'wholesale');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE order_status AS ENUM (
        'quote_requested', 'negotiating', 'confirmed', 
        'in_production', 'ready', 'dispatched', 'cancelled'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE negotiation_status AS ENUM ('open', 'accepted', 'rejected', 'countered');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE sender_role AS ENUM ('buyer', 'sales', 'owner');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE buyer_type AS ENUM ('regular', 'wholesale_preferred');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE staff_role AS ENUM ('sales', 'quality', 'owner');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // BuyerAccounts table
  await knex.schema.createTable('buyer_accounts', (table) => {
    table.increments('id').primary()
    table.string('company_name').notNullable()
    table.string('contact_person').notNullable()
    table.string('phone').notNullable()
    table.string('email').notNullable().unique()
    table.string('password_hash').notNullable()
    table.text('address')
    table.string('city')
    table.string('country').defaultTo('Bangladesh')
    table.specificType('buyer_type', 'buyer_type').defaultTo('regular')
    table.specificType('verification_status', 'verification_status').defaultTo('unverified')
    table.boolean('is_active').defaultTo(true)
    table.timestamps(true, true)
  })

  // StaffAccounts table
  await knex.schema.createTable('staff_accounts', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.string('email').notNullable().unique()
    table.string('password_hash').notNullable()
    table.specificType('role', 'staff_role').notNullable()
    table.boolean('is_active').defaultTo(true)
    table.timestamps(true, true)
  })

  // Products table
  await knex.schema.createTable('products', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.string('name_bn')
    table.string('category').notNullable()
    table.text('description')
    table.text('description_bn')
    table.json('images').defaultTo('[]')
    table.json('base_specs').defaultTo('{}')
    table.decimal('regular_price', 10, 2)
    table.json('wholesale_price_tiers').defaultTo('[]')
    table.integer('regular_moq')
    table.integer('wholesale_moq')
    table.boolean('is_bargaining_allowed').defaultTo(true)
    table.boolean('is_active').defaultTo(true)
    table.timestamps(true, true)
    
    table.index('category')
    table.index('is_active')
  })

  // QualityBatches table
  await knex.schema.createTable('quality_batches', (table) => {
    table.increments('id').primary()
    table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE')
    table.date('batch_date').notNullable()
    table.integer('tested_by').unsigned().references('id').inTable('staff_accounts')
    table.json('measured_values').defaultTo('{}')
    table.string('certification_file_url')
    table.specificType('approval_status', 'approval_status').defaultTo('pending')
    table.boolean('visible_to_public').defaultTo(false)
    table.timestamps(true, true)
    
    table.index('product_id')
    table.index('approval_status')
    table.index('visible_to_public')
  })

  // Orders table
  await knex.schema.createTable('orders', (table) => {
    table.increments('id').primary()
    table.integer('buyer_id').unsigned().references('id').inTable('buyer_accounts')
    table.integer('product_id').unsigned().references('id').inTable('products')
    table.specificType('purchase_type', 'purchase_type').notNullable()
    table.integer('quantity').notNullable()
    table.specificType('status', 'order_status').defaultTo('quote_requested')
    table.decimal('requested_price', 10, 2)
    table.decimal('current_offer_price', 10, 2)
    table.decimal('final_agreed_price', 10, 2)
    table.date('delivery_deadline')
    table.text('notes')
    table.timestamps(true, true)
    
    table.index('buyer_id')
    table.index('product_id')
    table.index('status')
  })

  // NegotiationThreads table
  await knex.schema.createTable('negotiation_threads', (table) => {
    table.increments('id').primary()
    table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE')
    table.specificType('status', 'negotiation_status').defaultTo('open')
    table.timestamps(true, true)
    
    table.index('order_id')
    table.index('status')
  })

  // NegotiationMessages table
  await knex.schema.createTable('negotiation_messages', (table) => {
    table.increments('id').primary()
    table.integer('thread_id').unsigned().references('id').inTable('negotiation_threads').onDelete('CASCADE')
    table.specificType('sender_role', 'sender_role').notNullable()
    table.integer('sender_id').notNullable()
    table.decimal('offered_price', 10, 2)
    table.text('note')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    
    table.index('thread_id')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('negotiation_messages')
  await knex.schema.dropTableIfExists('negotiation_threads')
  await knex.schema.dropTableIfExists('orders')
  await knex.schema.dropTableIfExists('quality_batches')
  await knex.schema.dropTableIfExists('products')
  await knex.schema.dropTableIfExists('staff_accounts')
  await knex.schema.dropTableIfExists('buyer_accounts')
  
  await knex.raw('DROP TYPE IF EXISTS approval_status CASCADE')
  await knex.raw('DROP TYPE IF EXISTS staff_role CASCADE')
  await knex.raw('DROP TYPE IF EXISTS verification_status CASCADE')
  await knex.raw('DROP TYPE IF EXISTS buyer_type CASCADE')
  await knex.raw('DROP TYPE IF EXISTS sender_role CASCADE')
  await knex.raw('DROP TYPE IF EXISTS negotiation_status CASCADE')
  await knex.raw('DROP TYPE IF EXISTS order_status CASCADE')
  await knex.raw('DROP TYPE IF EXISTS purchase_type CASCADE')
}
