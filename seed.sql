-- Create admin user (password: admin123)
INSERT OR IGNORE INTO users (email, password_hash, company_name, contact_name, phone, role, approved) 
VALUES (
  'admin@honestpharmco.com',
  'c4f8d4397e3173ffaf2de3dda245a4053cd865d2016f8f2dc089ec6b5d38c481',
  'Honest Pharmco',
  'System Admin',
  '555-0100',
  'admin',
  1
);

-- Create sample customer (password: demo123)
INSERT OR IGNORE INTO users (email, password_hash, company_name, contact_name, phone, role, approved)
VALUES (
  'demo@customer.com',
  'a4790461bbb796fd0226ca2d4e6ce3c4c462179d81c33c64bed902c315fb66f2',
  'Demo Dispensary',
  'John Doe',
  '555-0101',
  'customer',
  1
);

-- Insert sample products from the Excel data
INSERT OR IGNORE INTO products (product_name, strain, thc_percentage, price, case_size, category, in_stock)
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
  ('Jive Dark Chocolate Minis', NULL, '100mg', 12.0, 30, 'Edibles', 1);