import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { SignJWT, jwtVerify } from 'jose'
import * as XLSX from 'xlsx'

// Types
type Bindings = {
  DB: D1Database
  SESSIONS: KVNamespace
  JWT_SECRET: string
}

type Variables = {
  user: any
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Password utilities using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = 'honest-pharmco-salt-2024';
  const saltedData = encoder.encode(salt + password);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}

// JWT Secret
const getJWTSecret = (env: Bindings) => {
  return new TextEncoder().encode(env.JWT_SECRET || 'honest-pharmco-secret-2024')
}

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { payload } = await jwtVerify(token, getJWTSecret(c.env))
    c.set('user', payload)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

// Admin middleware
const adminMiddleware = async (c: any, next: any) => {
  const user = c.get('user')
  if (user.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403)
  }
  await next()
}

// Schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  company_name: z.string(),
  contact_name: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

// Initialize database tables
async function initDatabase(db: D1Database) {
  try {
    // Create tables if they don't exist
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        company_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        role TEXT DEFAULT 'customer',
        approved BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        strain TEXT,
        thc_percentage TEXT,
        price REAL NOT NULL,
        case_size INTEGER,
        category TEXT,
        description TEXT,
        in_stock BOOLEAN DEFAULT 1,
        stock_quantity INTEGER DEFAULT 0,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        order_number TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'pending',
        total_amount REAL NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `).run();

    // Create default admin user if doesn't exist
    const adminHash = await hashPassword('admin123');
    await db.prepare(`
      INSERT OR IGNORE INTO users (email, password_hash, company_name, contact_name, role, approved)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      'admin@honestpharmco.com',
      adminHash,
      'Honest Pharmco',
      'System Admin',
      'admin',
      1
    ).run();

    // Add sample products if table is empty
    const productCount = await db.prepare('SELECT COUNT(*) as count FROM products').first();
    if (productCount && productCount.count === 0) {
      await db.prepare(`
        INSERT INTO products (product_name, strain, thc_percentage, price, case_size, category, in_stock)
        VALUES 
          ('Jive High Note 1.25g pre roll Sativa (infused)', 'Chemmodo Dragon/Orange Creamsicle', 'Vape:88% Flwr:31%', 20.0, 25, 'Pre-rolls', 1),
          ('Jive High Note 1.25g pre roll Hybrid (infused)', 'Jamaican Strawberries/ Biscotti Skunk', 'Vape:95% Flwr:29%', 20.0, 25, 'Pre-rolls', 1),
          ('Jive High Note 1.25g pre roll Indica (infused)', 'Mandarin Zkittlez/ BlueBerry Ice Pop', 'Vape: 89% Flwr: 25%', 20.0, 25, 'Pre-rolls', 1),
          ('Jive Daytime Tinctures', NULL, '500mg THC, 250mg CBG, 250mg CBC', 22.5, 20, 'Tinctures', 1),
          ('Jive Nighttime Tinctures', NULL, '500mg THC, 250mg CBG, 250mg CBN', 22.5, 20, 'Tinctures', 1),
          ('Jukebox Prerolls Indica', NULL, '30.29%', 25.0, 10, 'Pre-rolls', 1),
          ('Jukebox Prerolls Sativa', NULL, '27.73%', 25.0, 10, 'Pre-rolls', 1),
          ('JIVE Duet Vape SSD/PP', NULL, '90.26%', 22.0, 20, 'Vapes', 1),
          ('JIVE Duet Vape TS/WG', NULL, '90.64%', 22.0, 20, 'Vapes', 1),
          ('Jive Dark Chocolate Minis', NULL, '100mg', 12.0, 30, 'Edibles', 1)
      `).run();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// API Routes

// Register
app.post('/api/auth/register', zValidator('json', registerSchema), async (c) => {
  const data = c.req.valid('json')
  const { env } = c

  await initDatabase(env.DB);

  try {
    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Insert user
    const result = await env.DB.prepare(`
      INSERT INTO users (email, password_hash, company_name, contact_name, phone, address, city, state, zip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.email,
      passwordHash,
      data.company_name,
      data.contact_name,
      data.phone || null,
      data.address || null,
      data.city || null,
      data.state || null,
      data.zip || null
    ).run()

    return c.json({ 
      success: true, 
      message: 'Registration successful. Please wait for admin approval.',
      userId: result.meta.last_row_id
    })
  } catch (error: any) {
    if (error.message.includes('UNIQUE')) {
      return c.json({ error: 'Email already registered' }, 400)
    }
    return c.json({ error: 'Registration failed' }, 500)
  }
})

// Login
app.post('/api/auth/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const { env } = c

  await initDatabase(env.DB);

  try {
    // Get user
    const user = await env.DB.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(email).first()

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash as string);
    if (!valid) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Check if approved
    if (!user.approved && user.role !== 'admin') {
      return c.json({ error: 'Account pending approval' }, 403)
    }

    // Create JWT
    const token = await new SignJWT({ 
      id: user.id,
      email: user.email,
      role: user.role,
      company_name: user.company_name
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(getJWTSecret(env))

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        company_name: user.company_name,
        contact_name: user.contact_name
      }
    })
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500)
  }
})

// Get products
app.get('/api/products', async (c) => {
  const { env } = c

  await initDatabase(env.DB);

  try {
    const products = await env.DB.prepare(`
      SELECT * FROM products WHERE in_stock = 1 ORDER BY product_name
    `).all()

    return c.json(products.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch products' }, 500)
  }
})

// Create order (protected)
app.post('/api/orders', authMiddleware, async (c) => {
  const { env } = c
  const user = c.get('user')
  const data = await c.req.json()

  try {
    // Generate order number
    const orderNumber = `HPC-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    // Calculate total
    let totalAmount = 0
    for (const item of data.items) {
      totalAmount += item.price * item.quantity
    }

    // Create order
    const orderResult = await env.DB.prepare(`
      INSERT INTO orders (user_id, order_number, total_amount, notes)
      VALUES (?, ?, ?, ?)
    `).bind(user.id, orderNumber, totalAmount, data.notes || null).run()

    const orderId = orderResult.meta.last_row_id

    // Add order items
    for (const item of data.items) {
      await env.DB.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        orderId,
        item.product_id,
        item.quantity,
        item.price,
        item.price * item.quantity
      ).run()
    }

    return c.json({
      success: true,
      order_id: orderId,
      order_number: orderNumber,
      total: totalAmount
    })
  } catch (error) {
    return c.json({ error: 'Failed to create order' }, 500)
  }
})

// Get user orders (protected)
app.get('/api/orders', authMiddleware, async (c) => {
  const { env } = c
  const user = c.get('user')

  try {
    const query = user.role === 'admin' 
      ? `SELECT o.*, u.company_name, u.contact_name 
         FROM orders o 
         JOIN users u ON o.user_id = u.id 
         ORDER BY o.created_at DESC`
      : `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`

    const orders = user.role === 'admin'
      ? await env.DB.prepare(query).all()
      : await env.DB.prepare(query).bind(user.id).all()

    return c.json(orders.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch orders' }, 500)
  }
})

// Upload inventory (admin only) - simplified version without file parsing
app.post('/api/admin/upload-inventory', authMiddleware, adminMiddleware, async (c) => {
  return c.json({
    success: true,
    message: 'File upload functionality requires additional setup for Cloudflare Workers',
    items_processed: 0
  })
})

// Approve user (admin only)
app.post('/api/admin/approve-user/:userId', authMiddleware, adminMiddleware, async (c) => {
  const { env } = c
  const userId = c.req.param('userId')

  try {
    await env.DB.prepare(`
      UPDATE users SET approved = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(userId).run()

    return c.json({ success: true, message: 'User approved successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to approve user' }, 500)
  }
})

// Get pending users (admin only)
app.get('/api/admin/pending-users', authMiddleware, adminMiddleware, async (c) => {
  const { env } = c

  try {
    const users = await env.DB.prepare(`
      SELECT id, email, company_name, contact_name, created_at
      FROM users
      WHERE approved = 0 AND role = 'customer'
      ORDER BY created_at DESC
    `).all()

    return c.json(users.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch pending users' }, 500)
  }
})

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Honest Pharmco - Ordering System</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          /* Custom styles for Honest Pharmco branding */
          .honest-gradient {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          }
          .silver-gradient {
            background: linear-gradient(135deg, #C0C0C0 0%, #808080 100%);
          }
          .text-silver {
            color: #C0C0C0;
          }
          .logo-shadow {
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
          }
          .btn-silver {
            background: linear-gradient(135deg, #C0C0C0 0%, #808080 100%);
            color: #000;
          }
          .btn-silver:hover {
            background: linear-gradient(135deg, #D0D0D0 0%, #909090 100%);
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <div id="app">
            <!-- Loading state -->
            <div class="min-h-screen flex items-center justify-center bg-black">
                <div class="text-center">
                    <img src="/static/honest-pharmco-logo.png" alt="Honest Pharmco" class="h-32 mx-auto mb-4 logo-shadow">
                    <div class="text-silver text-xl animate-pulse">Loading...</div>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app