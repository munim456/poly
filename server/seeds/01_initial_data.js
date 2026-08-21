import bcrypt from 'bcryptjs'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Clean existing data
  await knex('negotiation_messages').del()
  await knex('negotiation_threads').del()
  await knex('orders').del()
  await knex('quality_batches').del()
  await knex('products').del()
  await knex('staff_accounts').del()
  await knex('buyer_accounts').del()

  // Create owner account
  const ownerPasswordHash = await bcrypt.hash('owner123', 10)
  await knex('staff_accounts').insert({
    name: 'Admin Owner',
    email: 'admin@polyconnect.com',
    password_hash: ownerPasswordHash,
    role: 'owner',
    is_active: true,
  })

  // Create sales staff
  const salesPasswordHash = await bcrypt.hash('sales123', 10)
  await knex('staff_accounts').insert({
    name: 'Sales Manager',
    email: 'sales@polyconnect.com',
    password_hash: salesPasswordHash,
    role: 'sales',
    is_active: true,
  })

  // Create quality staff
  const qualityPasswordHash = await bcrypt.hash('quality123', 10)
  await knex('staff_accounts').insert({
    name: 'Quality Inspector',
    email: 'quality@polyconnect.com',
    password_hash: qualityPasswordHash,
    role: 'quality',
    is_active: true,
  })

  // Create sample products
  const products = [
    {
      name: 'HDPE Woven Sacks',
      name_bn: 'এইচডিপিই ওভেন স্যাক',
      category: 'hdpe_bags',
      description: 'Heavy-duty HDPE woven sacks for industrial packaging. Available in various sizes and GSM weights.',
      description_bn: 'শিল্প প্যাকেজিংয়ের জন্য ভারী-শক্তিশালী এইচডিপিই ওভেন স্যাক। বিভিন্ন আকার এবং জিএসএম ওজনে পাওয়া যায়।',
      images: JSON.stringify(['/images/hdpe-sack-1.svg', '/images/hdpe-sack-2.svg']),
      base_specs: JSON.stringify({
        material: 'HDPE',
        gsm: 80,
        width: 60,
        height: 90,
        tensile_strength: '15 MPa',
        color: 'White',
      }),
      regular_price: 45.00,
      wholesale_price_tiers: JSON.stringify([
        { min_qty: 1000, price: 42.00 },
        { min_qty: 5000, price: 38.00 },
        { min_qty: 10000, price: 35.00 },
      ]),
      regular_moq: 500,
      wholesale_moq: 1000,
      is_bargaining_allowed: true,
      is_active: true,
    },
    {
      name: 'BOPP Printed Film',
      name_bn: 'বিওপিপি প্রিন্টেড ফিল্ম',
      category: 'bopp_film',
      description: 'High-quality BOPP film for packaging and lamination. Excellent clarity and printability.',
      description_bn: 'প্যাকেজিং এবং ল্যামিনেশনের জন্য উচ্চ মানের বিওপিপি ফিল্ম। চমৎকার স্বচ্ছতা এবং মুদ্রণযোগ্যতা।',
      images: JSON.stringify(['/images/bopp-film-1.svg', '/images/bopp-film-2.svg']),
      base_specs: JSON.stringify({
        material: 'BOPP',
        thickness: 20,
        width: 1000,
        clarity: '92%',
        tensile_strength: '120 MPa',
        seal_strength: '8 N/15mm',
      }),
      regular_price: 180.00,
      wholesale_price_tiers: JSON.stringify([
        { min_qty: 500, price: 170.00 },
        { min_qty: 2000, price: 155.00 },
        { min_qty: 5000, price: 140.00 },
      ]),
      regular_moq: 100,
      wholesale_moq: 500,
      is_bargaining_allowed: true,
      is_active: true,
    },
    {
      name: 'PP Yarn',
      name_bn: 'পিপি ইয়ার্ন',
      category: 'yarn',
      description: 'Polypropylene yarn for weaving and knitting applications. Consistent quality and strength.',
      description_bn: 'বোনা এবং বোধাই প্রয়োগের জন্য পলিপ্রোপাইলিন ইয়ার্ন। সামঞ্জস্যপূর্ণ মান এবং শক্তি।',
      images: JSON.stringify(['/images/pp-yarn-1.svg', '/images/pp-yarn-2.svg']),
      base_specs: JSON.stringify({
        material: 'PP',
        denier: 600,
        tenacity: '5.5 g/d',
        elongation: '18%',
        color: 'Natural',
        uv_stabilized: true,
      }),
      regular_price: 95.00,
      wholesale_price_tiers: JSON.stringify([
        { min_qty: 100, price: 90.00 },
        { min_qty: 500, price: 85.00 },
        { min_qty: 1000, price: 80.00 },
      ]),
      regular_moq: 25,
      wholesale_moq: 100,
      is_bargaining_allowed: true,
      is_active: true,
    },
    {
      name: 'LDPE Shrink Film',
      name_bn: 'এলডিপিই শ্রিঙ্ক ফিল্ম',
      category: 'ldpe_film',
      description: 'Premium LDPE shrink film for product packaging. Excellent shrinkage properties and clarity.',
      description_bn: 'পণ্য প্যাকেজিংয়ের জন্য প্রিমিয়াম এলডিপিই শ্রিঙ্ক ফিল্ম। চমৎকার সংকোচন বৈশিষ্ট্য এবং স্বচ্ছতা।',
      images: JSON.stringify(['/images/ldpe-shrink-1.svg', '/images/ldpe-shrink-2.svg']),
      base_specs: JSON.stringify({
        material: 'LDPE',
        thickness: 30,
        width: 500,
        shrink_rate: '35-45%',
        temperature: '130-160°C',
        clarity: '90%',
      }),
      regular_price: 120.00,
      wholesale_price_tiers: JSON.stringify([
        { min_qty: 200, price: 115.00 },
        { min_qty: 1000, price: 105.00 },
        { min_qty: 3000, price: 95.00 },
      ]),
      regular_moq: 50,
      wholesale_moq: 200,
      is_bargaining_allowed: true,
      is_active: true,
    },
  ]

  await knex('products').insert(products)
}
