# Franchise Intel Backend - Database Schema & Sample Data Guide

## Database Information
- **Database Name**: franchiseManager
- **Username**: dharanish
- **Password**: 1234
- **Host**: localhost
- **Port**: 5432

## Step-by-Step Setup Instructions

### 1. Create Database
```sql
CREATE DATABASE "franchiseManager";
```

### 2. Connect to Database
```bash
psql -U dharanish -h localhost -d franchiseManager
```

---

## Table Schemas

### 1. STORES Table
```sql
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zip_code VARCHAR(20),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    revenue NUMERIC(15,2),
    status VARCHAR(50) DEFAULT 'ACTIVE'
);
```

**Sample Data:**
```sql
INSERT INTO stores (name, location, address, city, state, country, zip_code, phone_number, email, revenue, status)
VALUES
    ('Manhattan Flagship', '5th Avenue', '350 5th Avenue', 'New York', 'NY', 'USA', '10118', '212-555-0101', 'manhattan@franchise.com', 1500000.00, 'ACTIVE'),
    ('Downtown Hub', 'Market Street', '123 Market Street', 'San Francisco', 'CA', 'USA', '94102', '415-555-0102', 'downtown@franchise.com', 1200000.00, 'ACTIVE'),
    ('Tech Center', 'Sunset Boulevard', '456 Sunset Boulevard', 'Los Angeles', 'CA', 'USA', '90028', '323-555-0103', 'techcenter@franchise.com', 950000.00, 'ACTIVE'),
    ('Chicago Station', 'State Street', '789 State Street', 'Chicago', 'IL', 'USA', '60611', '312-555-0104', 'chicago@franchise.com', 1100000.00, 'ACTIVE'),
    ('Boston Heritage', 'Newbury Street', '101 Newbury Street', 'Boston', 'MA', 'USA', '02116', '617-555-0105', 'boston@franchise.com', 850000.00, 'ACTIVE'),
    ('Miami Beach', 'Ocean Drive', '222 Ocean Drive', 'Miami', 'FL', 'USA', '33139', '305-555-0106', 'miami@franchise.com', 1050000.00, 'ACTIVE'),
    ('Seattle Sound', 'Pike Place', '333 Pike Place', 'Seattle', 'WA', 'USA', '98101', '206-555-0107', 'seattle@franchise.com', 900000.00, 'ACTIVE'),
    ('Austin Trail', '6th Street', '444 6th Street', 'Austin', 'TX', 'USA', '78701', '512-555-0108', 'austin@franchise.com', 800000.00, 'ACTIVE');
```

---

### 2. CUSTOMERS Table
```sql
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zip_code VARCHAR(20),
    company_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE'
);
```

**Sample Data:**
```sql
INSERT INTO customers (first_name, last_name, email, phone_number, address, city, state, country, zip_code, company_name, status)
VALUES
    ('John', 'Smith', 'john.smith@email.com', '212-555-1001', '100 Park Avenue', 'New York', 'NY', 'USA', '10017', 'Smith Enterprises', 'ACTIVE'),
    ('Sarah', 'Johnson', 'sarah.johnson@email.com', '415-555-1002', '200 Mission Street', 'San Francisco', 'CA', 'USA', '94105', 'Johnson Industries', 'ACTIVE'),
    ('Michael', 'Williams', 'michael.williams@email.com', '323-555-1003', '300 Wilshire Boulevard', 'Los Angeles', 'CA', 'USA', '90010', 'Williams Corp', 'ACTIVE'),
    ('Emily', 'Brown', 'emily.brown@email.com', '312-555-1004', '400 Lake Shore Drive', 'Chicago', 'IL', 'USA', '60611', 'Brown Solutions', 'ACTIVE'),
    ('David', 'Davis', 'david.davis@email.com', '617-555-1005', '500 Boylston Street', 'Boston', 'MA', 'USA', '02116', 'Davis & Associates', 'ACTIVE'),
    ('Jessica', 'Rodriguez', 'jessica.rodriguez@email.com', '305-555-1006', '600 Biscayne Boulevard', 'Miami', 'FL', 'USA', '33131', 'Rodriguez Group', 'ACTIVE'),
    ('Robert', 'Martinez', 'robert.martinez@email.com', '206-555-1007', '700 Pine Street', 'Seattle', 'WA', 'USA', '98101', 'Martinez Traders', 'ACTIVE'),
    ('Lisa', 'Anderson', 'lisa.anderson@email.com', '512-555-1008', '800 Congress Avenue', 'Austin', 'TX', 'USA', '78701', 'Anderson Retail', 'ACTIVE'),
    ('James', 'Taylor', 'james.taylor@email.com', '212-555-1009', '900 Madison Avenue', 'New York', 'NY', 'USA', '10016', 'Taylor Holdings', 'ACTIVE'),
    ('Patricia', 'Lee', 'patricia.lee@email.com', '415-555-1010', '1000 Market Street', 'San Francisco', 'CA', 'USA', '94103', 'Lee Distributors', 'ACTIVE');
```

---

### 3. ORDERS Table
```sql
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    total_amount NUMERIC(15,2),
    status VARCHAR(50) DEFAULT 'PENDING',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP,
    shipping_address VARCHAR(500),
    payment_method VARCHAR(50),
    notes TEXT
);
```

**Sample Data:**
```sql
INSERT INTO orders (order_number, customer_id, store_id, total_amount, status, order_date, delivery_date, shipping_address, payment_method, notes)
VALUES
    ('ORD-001-2025', 1, 1, 5500.00, 'DELIVERED', '2025-12-01', '2025-12-05', '100 Park Avenue', 'CREDIT_CARD', 'Express delivery requested'),
    ('ORD-002-2025', 2, 2, 8200.00, 'SHIPPED', '2025-12-03', '2025-12-10', '200 Mission Street', 'BANK_TRANSFER', 'Standard delivery'),
    ('ORD-003-2025', 3, 3, 4500.00, 'PROCESSING', '2025-12-04', NULL, '300 Wilshire Boulevard', 'CREDIT_CARD', 'Pending warehouse processing'),
    ('ORD-004-2025', 4, 4, 6750.00, 'DELIVERED', '2025-11-25', '2025-12-02', '400 Lake Shore Drive', 'DEBIT_CARD', 'Priority handling'),
    ('ORD-005-2025', 5, 5, 3200.00, 'SHIPPED', '2025-12-05', '2025-12-12', '500 Boylston Street', 'CREDIT_CARD', 'Fragile items - handle carefully'),
    ('ORD-006-2025', 6, 6, 7100.00, 'DELIVERED', '2025-11-20', '2025-11-28', '600 Biscayne Boulevard', 'BANK_TRANSFER', 'Bulk order'),
    ('ORD-007-2025', 7, 7, 5900.00, 'PROCESSING', '2025-12-06', NULL, '700 Pine Street', 'CREDIT_CARD', 'Awaiting payment confirmation'),
    ('ORD-008-2025', 8, 8, 4200.00, 'SHIPPED', '2025-12-02', '2025-12-09', '800 Congress Avenue', 'DEBIT_CARD', 'Standard shipping'),
    ('ORD-009-2025', 9, 1, 6800.00, 'DELIVERED', '2025-11-18', '2025-11-25', '900 Madison Avenue', 'CREDIT_CARD', 'Regular order'),
    ('ORD-010-2025', 10, 2, 5400.00, 'PROCESSING', '2025-12-07', NULL, '1000 Market Street', 'BANK_TRANSFER', 'Custom specifications requested');
```

---

### 4. INVENTORY_ITEMS Table
```sql
CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    quantity INTEGER DEFAULT 0,
    reorder_level INTEGER,
    unit_price NUMERIC(10,2),
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    description TEXT
);
```

**Sample Data:**
```sql
INSERT INTO inventory_items (item_name, sku, category, quantity, reorder_level, unit_price, store_id, location, status, description)
VALUES
    ('Premium Coffee Beans', 'SKU-001-COFFEE', 'Beverages', 450, 100, 25.50, 1, 'Shelf A-1', 'ACTIVE', 'High-quality arabica coffee beans from Ethiopia'),
    ('Espresso Machine Pro', 'SKU-002-MACHINE', 'Equipment', 12, 5, 899.99, 1, 'Storage Room 1', 'ACTIVE', 'Commercial-grade espresso machine'),
    ('Tea Selection Pack', 'SKU-003-TEA', 'Beverages', 280, 75, 15.99, 2, 'Shelf B-2', 'ACTIVE', 'Assorted premium teas from around the world'),
    ('Ceramic Mugs', 'SKU-004-MUGS', 'Drinkware', 650, 200, 12.50, 2, 'Shelf C-1', 'ACTIVE', 'Durable ceramic coffee mugs'),
    ('Pastry Display Case', 'SKU-005-CASE', 'Equipment', 8, 3, 1299.99, 3, 'Storage Room 2', 'ACTIVE', 'Refrigerated pastry display case'),
    ('Chocolate Bars', 'SKU-006-CHOCO', 'Food', 890, 250, 8.75, 3, 'Shelf D-3', 'ACTIVE', 'Premium chocolate assortment'),
    ('Milk Frother', 'SKU-007-FROTHER', 'Equipment', 35, 10, 149.99, 4, 'Shelf E-2', 'ACTIVE', 'Automatic milk frothing machine'),
    ('Sugar Cubes', 'SKU-008-SUGAR', 'Supplies', 1200, 400, 4.99, 4, 'Shelf F-1', 'ACTIVE', 'Premium sugar cubes'),
    ('Napkins & Tissues', 'SKU-009-NAPKINS', 'Supplies', 5000, 1000, 0.99, 5, 'Shelf G-2', 'ACTIVE', 'Bulk paper napkins and tissues'),
    ('Grinder Machine', 'SKU-010-GRINDER', 'Equipment', 25, 8, 349.99, 5, 'Storage Room 3', 'ACTIVE', 'Professional coffee bean grinder'),
    ('Honey Jar', 'SKU-011-HONEY', 'Food', 180, 50, 18.75, 6, 'Shelf H-1', 'ACTIVE', 'Organic raw honey'),
    ('Sandwich Maker', 'SKU-012-SANDWICH', 'Equipment', 15, 4, 189.99, 6, 'Storage Room 4', 'ACTIVE', 'Commercial sandwich maker'),
    ('Cookies & Biscuits', 'SKU-013-COOKIES', 'Food', 420, 150, 6.50, 7, 'Shelf I-2', 'ACTIVE', 'Assorted gourmet cookies'),
    ('Coffee Filters', 'SKU-014-FILTERS', 'Supplies', 2500, 500, 1.99, 7, 'Shelf J-1', 'ACTIVE', 'Disposable paper coffee filters'),
    ('Toaster Oven', 'SKU-015-TOASTER', 'Equipment', 10, 2, 249.99, 8, 'Storage Room 5', 'ACTIVE', 'Commercial toaster oven');
```

---

## Database Indexes

The following indexes have been created for optimal performance:

```sql
CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_inventory_store_id ON inventory_items(store_id);
CREATE INDEX idx_inventory_status ON inventory_items(status);
CREATE INDEX idx_inventory_sku ON inventory_items(sku);
```

---

## API Endpoints

### 1. GET /api/admin/stores
Returns all stores with their details.

**Response Format:**
```json
{
  "status": 200,
  "message": "Stores retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Manhattan Flagship",
        "location": "5th Avenue",
        "address": "350 5th Avenue",
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "zipCode": "10118",
        "phoneNumber": "212-555-0101",
        "email": "manhattan@franchise.com",
        "revenue": 1500000.00,
        "status": "ACTIVE"
      }
      // ... more stores
    ]
  },
  "errors": null
}
```

### 2. GET /api/admin/customers
Returns all customers with their contact and company information.

**Response Format:**
```json
{
  "status": 200,
  "message": "Customers retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Smith",
        "email": "john.smith@email.com",
        "phoneNumber": "212-555-1001",
        "address": "100 Park Avenue",
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "zipCode": "10017",
        "companyName": "Smith Enterprises",
        "status": "ACTIVE"
      }
      // ... more customers
    ]
  },
  "errors": null
}
```

### 3. GET /api/admin/orders
Returns all orders with customer, store, and transaction details.

**Response Format:**
```json
{
  "status": 200,
  "message": "Orders retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "orderNumber": "ORD-001-2025",
        "customerId": 1,
        "storeId": 1,
        "totalAmount": 5500.00,
        "status": "DELIVERED",
        "orderDate": "2025-12-01T00:00:00",
        "deliveryDate": "2025-12-05T00:00:00",
        "shippingAddress": "100 Park Avenue",
        "paymentMethod": "CREDIT_CARD",
        "notes": "Express delivery requested"
      }
      // ... more orders
    ]
  },
  "errors": null
}
```

### 4. GET /api/admin/inventoryitems
Returns all inventory items with stock levels and pricing information.

**Response Format:**
```json
{
  "status": 200,
  "message": "Inventory items retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "itemName": "Premium Coffee Beans",
        "sku": "SKU-001-COFFEE",
        "category": "Beverages",
        "quantity": 450,
        "reorderLevel": 100,
        "unitPrice": 25.50,
        "storeId": 1,
        "location": "Shelf A-1",
        "status": "ACTIVE",
        "description": "High-quality arabica coffee beans from Ethiopia"
      }
      // ... more items
    ]
  },
  "errors": null
}
```

---

## How to Execute Setup

### Option 1: Using psql Command Line

```bash
# 1. Create database
psql -U dharanish -h localhost -d postgres -c "CREATE DATABASE \"franchiseManager\";"

# 2. Create schema
psql -U dharanish -h localhost -d franchiseManager -f schema.sql

# 3. Insert sample data
psql -U dharanish -h localhost -d franchiseManager -f sample_data.sql

# 4. Verify (optional)
psql -U dharanish -h localhost -d franchiseManager -c "SELECT COUNT(*) as store_count FROM stores;"
```

### Option 2: Using SQL Files in Database Client
1. Open your PostgreSQL client (pgAdmin, DBeaver, etc.)
2. Create new database: `franchiseManager`
3. Execute `schema.sql`
4. Execute `sample_data.sql`

---

## Entity-Relationship Diagram

```
STORES (1) ──────┬─ (Many) ORDERS
                 │
                 └─ (Many) INVENTORY_ITEMS

CUSTOMERS (1) ──── (Many) ORDERS
```

### Relationships:
- **STORES → ORDERS**: One store can have many orders (store_id foreign key)
- **STORES → INVENTORY_ITEMS**: One store can have many inventory items (store_id foreign key)
- **CUSTOMERS → ORDERS**: One customer can have many orders (customer_id foreign key)

---

## Notes
- All timestamps use UTC/server timezone
- Status fields support: ACTIVE, INACTIVE, PENDING, PROCESSING, SHIPPED, DELIVERED
- Revenue and pricing use NUMERIC(15,2) for financial accuracy
- Foreign keys have ON DELETE CASCADE for referential integrity
- Indexes are created on frequently queried columns for performance optimization

