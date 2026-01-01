#!/bin/bash

# Franchise Intel Backend - Complete Database Setup Script
# This script sets up the complete database with all tables and sample data

# Database configuration
DB_NAME="franchiseManager"
DB_USER="dharanish"
DB_HOST="localhost"
DB_PORT="5432"
export PGPASSWORD="1234"

echo "🚀 Starting Franchise Intel Backend Database Setup..."

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database if it doesn't exist
echo "📊 Creating database if it doesn't exist..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "Database already exists"

# Run initial schema
echo "🏗️  Running initial schema..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Initial schema created successfully"
else
    echo "❌ Failed to create initial schema"
    exit 1
fi

# Run migration for new tables
echo "🔄 Running migration for new tables..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migration.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully"
else
    echo "❌ Failed to run migration"
    exit 1
fi

# Load initial sample data
echo "📝 Loading initial sample data..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f sample_data.sql

if [ $? -eq 0 ]; then
    echo "✅ Initial sample data loaded successfully"
else
    echo "❌ Failed to load initial sample data"
    exit 1
fi

# Load new sample data
echo "📝 Loading new sample data..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f sample_data_new.sql

if [ $? -eq 0 ]; then
    echo "✅ New sample data loaded successfully"
else
    echo "❌ Failed to load new sample data"
    exit 1
fi

# Verify tables
echo "🔍 Verifying database setup..."
TABLE_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

echo "📊 Database setup complete!"
echo "   - Database: $DB_NAME"
echo "   - Tables created: $TABLE_COUNT"
echo "   - Host: $DB_HOST:$DB_PORT"

echo ""
echo "🎉 Franchise Intel Backend is ready!"
echo "   - Start your Spring Boot application"
echo "   - API will be available at: http://localhost:8080"
echo "   - Check API_DOCUMENTATION.md for endpoint details"

echo ""
echo "📋 Available tables:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"

echo ""
echo "🔗 Quick test endpoints:"
echo "   - GET http://localhost:8080/api/franchises"
echo "   - GET http://localhost:8080/api/stores"
echo "   - GET http://localhost:8080/api/activitylogs"
echo "   - GET http://localhost:8080/api/notifications"