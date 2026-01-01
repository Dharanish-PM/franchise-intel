-- Migration script to add new tables for Franchise Intel Backend
-- Run this after the initial schema.sql

-- Franchises Table
CREATE TABLE IF NOT EXISTS franchises (
    id SERIAL PRIMARY KEY,
    franchise_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    headquarters_address VARCHAR(500),
    start_date DATE,
    franchise_logo VARCHAR(500),
    website_url VARCHAR(500)
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(100),
    user_role VARCHAR(50),
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    details TEXT
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target_url VARCHAR(500),
    priority VARCHAR(50),
    store_id BIGINT REFERENCES stores(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE
);

-- Add franchise_id column to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS franchise_id BIGINT REFERENCES franchises(id) ON DELETE SET NULL;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS operational_status BOOLEAN DEFAULT TRUE;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_image VARCHAR(500);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_website VARCHAR(500);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_franchises_name ON franchises(franchise_name);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_role ON activity_logs(user_role);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_store_id ON notifications(store_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_stores_franchise_id ON stores(franchise_id);
