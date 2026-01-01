-- Script to convert enum columns to VARCHAR in inventory request tables

-- Step 1: Alter inventory_requests table
ALTER TABLE inventory_requests 
    ALTER COLUMN status TYPE VARCHAR(50) USING status::text;

-- Step 2: Alter inventory_request_items table
ALTER TABLE inventory_request_items 
    ALTER COLUMN priority TYPE VARCHAR(20) USING priority::text,
    ALTER COLUMN status TYPE VARCHAR(50) USING status::text;

-- Step 3: Alter shipments table (if you plan to use it)
ALTER TABLE shipments 
    ALTER COLUMN status TYPE VARCHAR(50) USING status::text;

-- Verify the changes
SELECT 
    table_name, 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns
WHERE table_name IN ('inventory_requests', 'inventory_request_items', 'shipments')
    AND column_name IN ('status', 'priority')
ORDER BY table_name, column_name;
