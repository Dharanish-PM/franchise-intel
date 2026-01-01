#!/bin/bash
# Database Setup Script for Franchise Intel Backend
# Run this script to set up the database and populate sample data

DB_USER="dharanish"
DB_HOST="localhost"
DB_NAME="franchiseManager"
DB_PORT="5432"

echo "========================================="
echo "Franchise Intel Backend - Database Setup"
echo "========================================="
echo ""

# Step 1: Create database
echo "Step 1: Creating database '$DB_NAME'..."
psql -U "$DB_USER" -h "$DB_HOST" -d postgres -c "CREATE DATABASE \"$DB_NAME\";" 2>&1 | grep -v "already exists" || true

# Step 2: Create schema
echo "Step 2: Creating database schema..."
psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -f schema.sql

# Step 3: Insert sample data
echo "Step 3: Inserting sample data..."
psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -f sample_data.sql

# Step 4: Verify setup
echo ""
echo "Step 4: Verifying setup..."
echo ""
echo "Database: $DB_NAME"
psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -c "\dt"

echo ""
echo "Row counts:"
psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -c "
SELECT 'Stores' as table_name, COUNT(*) as count FROM stores
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Inventory Items', COUNT(*) FROM inventory_items;
"

echo ""
echo "========================================="
echo "Database Setup Complete!"
echo "========================================="
echo ""
echo "Your application can now connect to:"
echo "  URL: jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME"
echo "  User: $DB_USER"
echo "========================================="

