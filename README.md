# Honest Pharmco - Online Ordering System

## Project Overview
- **Name**: Honest Pharmco Ordering System
- **Goal**: Simplify ordering for cannabis dispensary customers with a modern, professional web application
- **Features**: 
  - User authentication with registration/login
  - Admin dashboard for inventory management
  - Customer ordering interface with shopping cart
  - Excel-based inventory upload system
  - Order tracking and management
  - Responsive, modern design with Honest Pharmco branding

## URLs
- **Development**: https://3000-iv1o9jx05v0cpral5xscc-6532622b.e2b.dev
- **Production**: Will be deployed to Cloudflare Pages (pending)
- **GitHub**: Not yet configured

## Login Credentials
- **Admin Account**: 
  - Email: admin@honestpharmco.com
  - Password: admin123
- **Demo Customer**: 
  - Email: demo@customer.com
  - Password: demo123

## Data Architecture
- **Database**: Cloudflare D1 (SQLite)
- **Tables**:
  - `users`: Customer and admin accounts with approval system
  - `products`: Inventory items with pricing and stock info
  - `orders`: Customer orders with status tracking
  - `order_items`: Individual items within orders
  - `inventory_uploads`: Track Excel upload history
- **Storage**: 
  - D1 Database for relational data
  - KV Storage for session management (planned)
- **Data Flow**: 
  - Admin uploads Excel → Products updated in database
  - Customers browse products → Add to cart → Place orders
  - Admin manages orders and approves new customers

## Features

### Customer Features
- **Registration**: Sign up with company details
- **Product Browsing**: View available inventory with THC percentages, strains, and pricing
- **Shopping Cart**: Add/remove items, adjust quantities
- **Order Placement**: Submit orders with optional notes
- **Order History**: Track past orders and status

### Admin Features
- **User Management**: Approve/deny new customer registrations
- **Inventory Upload**: Import Excel spreadsheets to update product catalog
- **Order Management**: View all orders, update status
- **Dashboard**: Overview of pending approvals and recent orders

## User Guide

### For Customers:
1. **Register**: Click "Register" and fill in your dispensary details
2. **Wait for Approval**: Admin will review and approve your account
3. **Login**: Use your email and password to access the system
4. **Browse Products**: View available products with details
5. **Add to Cart**: Click "Add to Cart" on desired products
6. **Checkout**: Review cart, add notes, and place order
7. **Track Orders**: View order history and status in "My Orders"

### For Administrators:
1. **Login**: Use admin credentials
2. **Upload Inventory**: 
   - Click "Upload Inventory" in admin dashboard
   - Select Excel file (.xlsx format)
   - System will update product catalog
3. **Approve Users**: Review pending registrations and approve legitimate customers
4. **Manage Orders**: View all orders and update status as needed

## Excel File Format
The inventory Excel file should have these columns:
- **Product**: Product name
- **Strain**: Strain information (optional)
- **THC %**: THC percentage or content
- **Price**: Unit price
- **Case Size**: Units per case
- **Category**: Product category (optional)

Sample file available at: `/static/sample_inventory.xlsx`

## Technology Stack
- **Backend**: Hono framework on Cloudflare Workers
- **Frontend**: Vanilla JavaScript with Tailwind CSS
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT with Web Crypto API
- **Hosting**: Cloudflare Pages (edge deployment)
- **UI Libraries**: 
  - Tailwind CSS for styling
  - Font Awesome for icons
  - Axios for API calls

## Development

### Local Development
```bash
# Install dependencies
npm install

# Build project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# Apply database migrations
npm run db:migrate:local

# Seed database with sample data
npm run db:seed
```

### Deployment to Cloudflare Pages
```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## Project Structure
```
webapp/
├── src/
│   └── index.tsx         # Main Hono application
├── public/static/
│   ├── app.js           # Frontend JavaScript
│   ├── sample_inventory.xlsx  # Sample Excel file
│   └── sample_inventory.json  # Sample JSON data
├── migrations/
│   └── 0001_initial_schema.sql  # Database schema
├── ecosystem.config.cjs  # PM2 configuration
├── wrangler.jsonc       # Cloudflare configuration
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Deployment Options

### Ionos Hosting
- Export as static site with API backend
- Deploy backend to Cloudflare Workers
- Host frontend on Ionos with CDN

### GoDaddy Hosting
- Similar to Ionos approach
- Use GoDaddy hosting for frontend
- API backend on Cloudflare Workers

### Recommended: Cloudflare Pages (Full Stack)
- Integrated hosting and edge computing
- Global CDN included
- Seamless D1 database integration
- Better performance and scalability

## Currently Completed Features
✅ User authentication system with JWT
✅ Admin and customer role separation
✅ Product catalog with categories
✅ Shopping cart functionality
✅ Order placement system
✅ Admin dashboard
✅ User approval workflow
✅ Enhanced Honest Pharmco branding with gradient headers
✅ Public product browsing (no login required to view)
✅ Login required only for ordering
✅ Responsive design optimized for all devices
✅ Database schema and migrations
✅ Sample data seeding
✅ Professional cannabis industry design

## Features Not Yet Implemented
- [ ] Real Excel file parsing in Cloudflare Workers (currently placeholder)
- [ ] Email notifications for orders
- [ ] Advanced inventory tracking with stock levels
- [ ] Order status email updates
- [ ] Product search and filtering
- [ ] Product images
- [ ] Bulk order functionality
- [ ] Invoice generation
- [ ] Customer analytics dashboard
- [ ] Mobile app version

## Recommended Next Steps
1. **Deploy to Production**: Set up Cloudflare Pages deployment
2. **Configure Custom Domain**: Point your domain to Cloudflare Pages
3. **Implement Excel Upload**: Add proper XLSX parsing for Cloudflare Workers
4. **Add Email Notifications**: Integrate email service for order confirmations
5. **Enhance Product Management**: Add product images and detailed descriptions
6. **Implement Search**: Add product search and category filtering
7. **Add Reporting**: Create sales reports and analytics for admin
8. **Mobile Optimization**: Further optimize for mobile devices
9. **Security Hardening**: Add rate limiting and additional security measures
10. **Performance Optimization**: Implement caching strategies

## Support
For issues or questions about the ordering system, contact the Honest Pharmco IT team.

## License
Proprietary - Honest Pharmco © 2024