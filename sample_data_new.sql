-- Sample data for new tables in Franchise Intel Backend

-- Insert sample franchises
INSERT INTO franchises (franchise_name, contact_person, contact_email, headquarters_address, start_date, website_url) VALUES
('FastFood Express', 'John Smith', 'john.smith@fastfoodexpress.com', '123 Main St, New York, NY 10001', '2020-01-15', 'https://fastfoodexpress.com'),
('Coffee Corner', 'Sarah Johnson', 'sarah@coffeecorner.com', '456 Oak Ave, Los Angeles, CA 90210', '2019-03-20', 'https://coffeecorner.com'),
('Pizza Palace', 'Mike Wilson', 'mike@pizzapalace.com', '789 Pine St, Chicago, IL 60601', '2021-06-10', 'https://pizzapalace.com');

-- Update existing stores to link with franchises
UPDATE stores SET franchise_id = 1 WHERE id IN (1, 2);
UPDATE stores SET franchise_id = 2 WHERE id IN (3, 4);
UPDATE stores SET franchise_id = 3 WHERE id IN (5, 6);

-- Insert sample activity logs
INSERT INTO activity_logs (action, user_id, user_role, entity_type, entity_id, details) VALUES
('LOGIN', 'admin001', 'admin', 'USER', 'admin001', 'Admin user logged into the system'),
('CREATE_STORE', 'admin001', 'admin', 'STORE', '1', 'Created new store: Downtown Location'),
('UPDATE_INVENTORY', 'manager001', 'store_manager', 'INVENTORY', '1', 'Updated inventory levels for SKU-001'),
('CREATE_ORDER', 'customer001', 'customer', 'ORDER', '1', 'New order placed for $45.99'),
('UPDATE_STORE', 'admin001', 'admin', 'STORE', '2', 'Updated store operational status'),
('DELETE_INVENTORY', 'manager002', 'store_manager', 'INVENTORY', '5', 'Removed discontinued item from inventory'),
('LOGIN', 'manager001', 'store_manager', 'USER', 'manager001', 'Store manager logged in'),
('CREATE_CUSTOMER', 'admin001', 'admin', 'CUSTOMER', '1', 'New customer registration completed');

-- Insert sample notifications
INSERT INTO notifications (title, message, type, priority, store_id, customer_id) VALUES
('Low Inventory Alert', 'Coffee beans are running low at Downtown Location', 'INVENTORY', 'HIGH', 1, NULL),
('New Order Received', 'Order #12345 has been placed and requires processing', 'ORDER', 'MEDIUM', 2, 1),
('System Maintenance', 'Scheduled maintenance will occur tonight from 2-4 AM', 'SYSTEM', 'LOW', NULL, NULL),
('Customer Feedback', 'New 5-star review received from customer', 'FEEDBACK', 'LOW', 3, 2),
('Payment Failed', 'Payment processing failed for order #12346', 'PAYMENT', 'HIGH', 1, 3),
('Store Opening', 'New store location is now operational', 'STORE', 'MEDIUM', 4, NULL);

-- Mark some notifications as read
UPDATE notifications SET is_read = TRUE WHERE id IN (3, 6);