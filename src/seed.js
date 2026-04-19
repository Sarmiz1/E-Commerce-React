import 'dotenv/config'

if (process.env.NODE_ENV === 'production') {
    throw new Error("❌ Seed blocked in production")
}

if (process.env.RUN_SEED !== 'true') {
    throw new Error("❌ Run with RUN_SEED=true")
}




import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

// =========================
// CONFIG (BIG DATA)
// =========================
const SELLER_COUNT = 150
const BUYER_COUNT = 350
const PRODUCT_COUNT = 2500
const OFFICIAL_RATIO = 0.15 
const BATCH_SIZE = 100 // To prevent timeouts

const categories = [
    'Fashion',
    'Electronics',
    'Home & Garden',
    'Beauty & Health',
    'Sports & Outdoors',
    'Automotive',
    'Books & Audible',
    'Gaming'
]

// =========================
// 1. CREATE USERS (AUTH + PROFILES)
// =========================
async function createUsers(count, prefix, role) {
    const users = []
    const { data: existingUsers } = await supabase.auth.admin.listUsers({
        perPage: 1000 // Aim for all
    })
    const userPool = existingUsers?.users || []

    for (let i = 0; i < count; i++) {
        const email = `${prefix}${i + 1}@market.dev`
        const isOfficial = role === 'seller' && Math.random() < OFFICIAL_RATIO

        const existing = userPool.find(u => u.email === email)

        if (existing) {
            users.push({
                id: existing.id,
                is_official_store: existing.user_metadata?.is_official_store || false,
                name: existing.user_metadata?.full_name || email,
                role
            })
            continue
        }

        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password: 'password123',
            email_confirm: true,
            user_metadata: {
                full_name: role === 'seller' ? faker.company.name() : faker.person.fullName(),
                role: role,
                is_official_store: isOfficial
            }
        })

        if (error) {
            console.log(`Auth Error (${email}):`, error.message)
            continue
        }

        users.push({
            id: data.user.id,
            is_official_store: isOfficial,
            name: data.user.user_metadata.full_name,
            role
        })
    }

    // Sync to profiles table
    const profileChunks = []
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const chunk = users.slice(i, i + BATCH_SIZE).map(u => ({
            id: u.id,
            full_name: u.name,
            role: u.role,
            is_official_store: u.is_official_store || false,
            store_type: u.is_official_store ? 'official' : (u.role === 'seller' ? 'independent' : 'buyer')
        }))
        profileChunks.push(supabase.from('profiles').upsert(chunk))
    }
    await Promise.all(profileChunks)

    console.log(`✅ ${role === 'seller' ? 'Sellers' : 'Buyers'} ready: ${users.length}`)
    return users
}

// =========================
// 2. CREATE ADDRESSES
// =========================
async function createAddresses(users) {
    const addresses = []
    for (const user of users) {
        const count = Math.random() < 0.3 ? 2 : 1 // 30% have two addresses
        for (let j = 0; j < count; j++) {
            addresses.push({
                user_id: user.id,
                full_name: user.name,
                phone: faker.phone.number(),
                line1: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                postal_code: faker.location.zipCode(),
                country: 'NG', // As per schema default
                is_default_shipping: j === 0,
                is_default_billing: j === 0
            })
        }
    }

    for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
        await supabase.from('addresses').insert(addresses.slice(i, i + BATCH_SIZE))
    }
    console.log(`✅ Addresses created: ${addresses.length}`)
}

// =========================
// 2. CREATE CATEGORIES
// =========================
async function createCategories() {
    const categoryMapping = {}
    const items = categories.map(name => ({
        name,
        slug: name.toLowerCase()
    }))

    const { data, error } = await supabase
        .from('categories')
        .upsert(items, { onConflict: 'slug' })
        .select('id, name')

    if (error) {
        console.error('Category insert error:', error.message)
        return {}
    }

    data.forEach(c => {
        categoryMapping[c.name] = c.id
    })

    console.log('✅ Categories synced')
    return categoryMapping
}

// =========================
// 3. CREATE PROFILES
// =========================
async function createProfiles(sellers) {
    const profiles = sellers.map(s => ({
        id: s.id,
        full_name: s.name,
        role: 'seller',
        is_verified: s.is_official_store,
        is_official_store: s.is_official_store,
        store_type: s.is_official_store ? 'official' : 'independent'
    }))

    const { error } = await supabase.from('profiles').upsert(profiles)

    if (error) {
        console.error('Profile insert error:', error.message)
    } else {
        console.log('✅ Profiles synced')
    }
}

// =========================
// 4. CREATE PRODUCTS
// =========================
async function createProducts(sellers, categoryMapping) {
    const products = []

    for (let i = 0; i < PRODUCT_COUNT; i++) {
        const seller = sellers[Math.floor(Math.random() * sellers.length)]
        const categoryName = categories[Math.floor(Math.random() * categories.length)]
        const categoryId = categoryMapping[categoryName]

        const basePrice = Math.floor(Math.random() * 20000 + 1000)
        const name = faker.commerce.productName()

        const product = {
            name: name,
            slug: faker.helpers.slugify(name + '-' + faker.string.alphanumeric(5) + '-' + i).toLowerCase(),
            seller_id: seller.id,
            category_id: categoryId,
            brand: faker.company.name(),
            short_description: faker.commerce.productDescription(),
            full_description: faker.lorem.paragraphs(2),
            price_cents: basePrice,
            is_active: true,
            is_featured: Math.random() < 0.1,
            image: `https://picsum.photos/seed/p_${i}/600/600`
        }

        products.push(product)
    }

    const createdIds = []
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const { data, error } = await supabase
            .from('products')
            .insert(products.slice(i, i + BATCH_SIZE))
            .select('id, price_cents')

        if (error) {
            console.error('Product Batch Error:', error.message)
            continue
        }
        createdIds.push(...data)
    }

    console.log(`✅ Products created: ${createdIds.length}`)
    return createdIds
}

// =========================
// 5. CREATE VARIANTS + IMAGES
// =========================
async function createVariantsAndImages(products) {
    const variants = []
    const images = []

    for (let i = 0; i < products.length; i++) {
        const p = products[i]
        const variantCount = Math.floor(Math.random() * 3) + 1 // 1-3 variants per product

        for (let v = 0; v < variantCount; v++) {
            variants.push({
                product_id: p.id,
                sku: `SKU-${i}-${v}-${faker.string.alphanumeric(4)}`,
                color: faker.color.human(),
                size: ['S', 'M', 'L', 'XL', 'XXL'][Math.floor(Math.random() * 5)],
                price_cents: p.price_cents + (Math.random() < 0.3 ? 500 : 0),
                stock_quantity: Math.floor(Math.random() * 200) + 10
            })
        }

        // images (3-5 per product)
        const imgCount = Math.floor(Math.random() * 3) + 3
        for (let img = 0; img < imgCount; img++) {
            images.push({
                product_id: p.id,
                image_url: `https://picsum.photos/seed/${p.id}-${img}/600/600`,
                sort_order: img
            })
        }
    }

    // Batch Variants
    for (let i = 0; i < variants.length; i += BATCH_SIZE * 2) {
        const { error } = await supabase.from('product_variants').insert(variants.slice(i, i + BATCH_SIZE * 2))
        if (error) console.error('Variant Error:', error.message)
    }

    // Batch Images
    for (let i = 0; i < images.length; i += BATCH_SIZE * 2) {
        const { error } = await supabase.from('product_images').insert(images.slice(i, i + BATCH_SIZE * 2))
        if (error) console.error('Image Error:', error.message)
    }

    console.log(`✅ Variants (${variants.length}) and Images (${images.length}) created`)
    return variants
}

// =========================
// 6. CREATE METRICS + REVIEWS
// =========================
async function createMetricsAndReviews(products, users) {
    const metrics = []
    const reviews = []
    const buyers = users.filter(u => u.role === 'buyer')

    console.log('📊 Generating metrics and reviews...')

    for (const p of products) {
        // 1:1 Metrics
        metrics.push({
            product_id: p.id,
            view_count: Math.floor(Math.random() * 10000),
            purchase_count: Math.floor(Math.random() * 500),
            search_count: Math.floor(Math.random() * 1000),
            wishlisted_count: Math.floor(Math.random() * 200)
        })

        // Reviews (0-5 per product)
        const revCount = Math.floor(Math.random() * 6)
        for (let r = 0; r < revCount; r++) {
            const buyer = buyers[Math.floor(Math.random() * buyers.length)]
            reviews.push({
                product_id: p.id,
                user_id: buyer.id,
                rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars for good data
                review_text: faker.lorem.sentences(Math.floor(Math.random() * 2) + 1),
                is_verified: Math.random() < 0.8,
                created_at: faker.date.past()
            })
        }
    }

    // Batch Metrics
    for (let i = 0; i < metrics.length; i += BATCH_SIZE * 2) {
        await supabase.from('product_metrics').upsert(metrics.slice(i, i + BATCH_SIZE * 2))
    }

    // Batch Reviews
    for (let i = 0; i < reviews.length; i += BATCH_SIZE * 2) {
        await supabase.from('product_reviews').insert(reviews.slice(i, i + BATCH_SIZE * 2))
    }

    console.log(`✅ Metrics created and ${reviews.length} reviews posted`)
}

// =========================
// 7. CREATE COUPONS
// =========================
async function createCoupons() {
    const codes = ['SAVE10', 'WELCOME20', 'BLACKFRIDAY', 'SUPERMARKET', 'GHOST', 'FLASH50', 'FESTIVE']
    const items = codes.map(code => ({
        code,
        discount_type: Math.random() < 0.5 ? 'percentage' : 'fixed',
        discount_value: Math.random() < 0.5 ? 15 : 1000, // 15% or $10.00
        min_order_cents: 2000,
        max_uses: 500,
        used_count: Math.floor(Math.random() * 100),
        is_active: true,
        starts_at: faker.date.past(),
        expires_at: faker.date.future()
    }))

    const { data, error } = await supabase.from('coupons').upsert(items, { onConflict: 'code' }).select('id, code')
    if (error) console.error('Coupon Error:', error.message)
    
    console.log('✅ Coupons generated')
    return data
}

// =========================
// 8. CREATE COMMERCE HISTORY (MASSIVE)
// =========================
async function createCommerceHistory(users, products, variants) {
    const buyers = users.filter(u => u.role === 'buyer')
    const orders = []
    const orderItems = []
    const payments = []
    const transactions = []
    const shipments = []
    const tracking = []
    const reservations = []

    console.log('🛍️ Simulating commerce history...')

    for (const buyer of buyers) {
        const orderCount = Math.floor(Math.random() * 6) + 1 // 1-6 orders per buyer
        for (let i = 0; i < orderCount; i++) {
            const status = faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
            const payStatus = status === 'pending' || status === 'cancelled' ? 'unpaid' : 'paid'
            
            const orderId = faker.string.uuid()
            const subtotal = Math.floor(Math.random() * 50000) + 1000

            orders.push({
                id: orderId,
                user_id: buyer.id,
                status,
                payment_status: payStatus,
                subtotal_cents: subtotal,
                total_cents: subtotal + 500, // +$5 shipping
                shipping_cents: 500,
                created_at: faker.date.past()
            })

            // Items (1-4 per order)
            const itemCount = Math.floor(Math.random() * 4) + 1
            for (let j = 0; j < itemCount; j++) {
                const variant = variants[Math.floor(Math.random() * variants.length)]
                const prod = products.find(p => p.id === variant.product_id)
                
                orderItems.push({
                    order_id: orderId,
                    product_id: prod.id,
                    variant_id: variant.id,
                    product_name: prod.name,
                    price_cents: variant.price_cents,
                    quantity: Math.floor(Math.random() * 2) + 1,
                    total_cents: variant.price_cents * 1
                })

                if (status !== 'delivered' && status !== 'cancelled') {
                    reservations.push({
                        variant_id: variant.id,
                        order_id: orderId,
                        user_id: buyer.id,
                        quantity: 1,
                        status: status === 'pending' ? 'reserved' : 'committed'
                    })
                }
            }

            if (payStatus === 'paid') {
                payments.push({
                    order_id: orderId,
                    provider: 'stripe',
                    provider_reference: `ch_${faker.string.alphanumeric(24)}`,
                    status: 'success',
                    amount_cents: subtotal + 500,
                    paid_at: faker.date.recent()
                })
                transactions.push({
                    user_id: buyer.id,
                    order_id: orderId,
                    type: 'payment',
                    status: 'success',
                    amount_cents: subtotal + 500,
                    provider: 'stripe'
                })
            }

            if (status === 'shipped' || status === 'delivered') {
                shipments.push({
                    order_id: orderId,
                    status: status,
                    tracking_number: `TRK${faker.string.numeric(12)}`,
                    courier: 'FedEx',
                    shipped_at: faker.date.past()
                })
                
                const events = ['Order Received', 'Packed', 'In Transit', 'Out for Delivery']
                events.forEach((msg, idx) => {
                    tracking.push({
                        order_id: orderId,
                        status: msg.toLowerCase().replace(/ /g, '_'),
                        message: msg,
                        location: faker.location.city(),
                        created_at: faker.date.recent()
                    })
                })
            }
        }
    }

    // Batch Inserts
    console.log('💾 Flushing commerce data to database...')
    await Promise.all([
        supabase.from('orders').insert(orders),
        supabase.from('order_items').insert(orderItems),
        supabase.from('payments').insert(payments),
        supabase.from('transactions').insert(transactions),
        supabase.from('shipments').insert(shipments),
        supabase.from('order_tracking_events').insert(tracking),
        supabase.from('inventory_reservations').insert(reservations)
    ])

    console.log(`✅ History synced: ${orders.length} orders, ${shipments.length} shipments.`)
}

// =========================
// RUN EVERYTHING
// =========================
async function runSeed() {
    console.log('🚀 Starting BIG DATA marketplace seed...')
    const start = Date.now()

    const sellers = await createUsers(SELLER_COUNT, 'seller', 'seller')
    const buyers = await createUsers(BUYER_COUNT, 'buyer', 'buyer')
    const allUsers = [...sellers, ...buyers]
    
    await createAddresses(allUsers)
    
    const categoryMapping = await createCategories()

    const products = await createProducts(sellers, categoryMapping)
    const variants = await createVariantsAndImages(products)
    
    await createMetricsAndReviews(products, allUsers)
    await createCoupons()
    
    await createCommerceHistory(allUsers, products, variants)

    const end = Date.now()
    console.log(`🎉 BIG DATA SEED COMPLETE in ${((end - start) / 1000).toFixed(2)}s`)
}

runSeed()

// Run this script using the command: node src/seed.js
// PowerShell: $env:RUN_SEED="true"; node src/seed.js
// Bash/Vercel: RUN_SEED=true node src/seed.js