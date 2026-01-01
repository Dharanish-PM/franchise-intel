-- Schema for Franchise Intel Backend
-- Database: franchiseManager

-- Stores Table
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

-- Customers Table
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

-- Orders Table
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

-- Inventory Items Table
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

-- Create Indexes for better performance
CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_inventory_store_id ON inventory_items(store_id);
CREATE INDEX idx_inventory_status ON inventory_items(status);
CREATE INDEX idx_inventory_sku ON inventory_items(sku);

