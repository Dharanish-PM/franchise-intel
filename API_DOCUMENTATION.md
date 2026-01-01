# Franchise Intel Backend API Documentation

## Base URL
```
http://localhost:8080
```

## Authentication
Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format
All API responses follow this standard format:
```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {}, // Response data
  "errors": [] // Error messages (if any)
}
```

## Pagination
Paginated endpoints support the following query parameters:
- `pageNumber`: Page number (0-indexed, default: 0)
- `pageSize`: Number of items per page (default: 10)

Paginated responses include:
```json
{
  "content": [], // Array of items
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 100,
  "totalPages": 10,
  "isFirst": true,
  "isLast": false,
  "hasNext": true,
  "hasPrevious": false
}
```

## Endpoints

### Franchises API

#### GET /api/franchises
Get all franchises with pagination
- **Query Parameters**: `pageNumber`, `pageSize`
- **Response**: Paginated list of franchises

#### GET /api/franchises/{id}
Get franchise by ID
- **Path Parameter**: `id` (Long)
- **Response**: Single franchise object

#### POST /api/franchises
Create new franchise
- **Request Body**: FranchiseDTO
```json
{
  "franchiseName": "string",
  "contactPerson": "string",
  "contactEmail": "string",
  "headquartersAddress": "string",
  "startDate": "2024-01-01",
  "franchiseLogo": "string",
  "websiteUrl": "string"
}
```

#### PUT /api/franchises/{id}
Update existing franchise
- **Path Parameter**: `id` (Long)
- **Request Body**: FranchiseDTO

#### DELETE /api/franchises/{id}
Delete franchise
- **Path Parameter**: `id` (Long)

### Stores API

#### GET /api/stores
Get all stores with pagination
- **Query Parameters**: `pageNumber`, `pageSize`
- **Response**: Paginated list of stores

#### GET /api/stores/{id}
Get store by ID
- **Path Parameter**: `id` (Long)
- **Response**: Single store object

#### POST /api/stores
Create new store
- **Request Body**: StoreDTO
```json
{
  "name": "string",
  "location": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "zipCode": "string",
  "phoneNumber": "string",
  "email": "string",
  "revenue": 0.0,
  "status": "string",
  "operationalStatus": true,
  "storeImage": "string",
  "storeWebsite": "string",
  "franchiseId": 1
}
```

#### PUT /api/stores/{id}
Update existing store
- **Path Parameter**: `id` (Long)
- **Request Body**: StoreDTO

#### DELETE /api/stores/{id}
Delete store
- **Path Parameter**: `id` (Long)

### Activity Logs API

#### GET /api/activitylogs
Get all activity logs with pagination (sorted by timestamp desc)
- **Query Parameters**: `pageNumber`, `pageSize`
- **Response**: Paginated list of activity logs

#### GET /api/activitylogs/{id}
Get activity log by ID
- **Path Parameter**: `id` (Long)
- **Response**: Single activity log object

#### POST /api/activitylogs
Create new activity log
- **Request Body**: ActivityLogDTO
```json
{
  "action": "string",
  "userId": "string",
  "userRole": "string",
  "entityType": "string",
  "entityId": "string",
  "details": "string"
}
```

### Notifications API

#### GET /api/notifications
Get all notifications with pagination (sorted by timestamp desc)
- **Query Parameters**: `pageNumber`, `pageSize`
- **Response**: Paginated list of notifications

#### GET /api/notifications/{id}
Get notification by ID
- **Path Parameter**: `id` (Long)
- **Response**: Single notification object

#### POST /api/notifications
Create new notification
- **Request Body**: NotificationDTO
```json
{
  "title": "string",
  "message": "string",
  "type": "string",
  "targetUrl": "string",
  "priority": "string",
  "storeId": 1,
  "customerId": 1
}
```

#### PUT /api/notifications/{id}
Update existing notification
- **Path Parameter**: `id` (Long)
- **Request Body**: NotificationDTO

#### PUT /api/notifications/{id}/read
Mark notification as read
- **Path Parameter**: `id` (Long)

#### DELETE /api/notifications/{id}
Delete notification
- **Path Parameter**: `id` (Long)

### Customers API

#### GET /api/customers
Get all customers with pagination
- **Query Parameters**: `pageNumber`, `pageSize`
- **Response**: Paginated list of customers

#### GET /api/customers/{id}
Get customer by ID
- **Path Parameter**: `id` (Long)
- **Response**: Single customer object

#### POST /api/customers
Create new customer
- **Request Body**: CustomerDTO
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phoneNumber": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "zipCode": "string",
  "companyName": "string",
  "status": "string"
}
```

#### PUT /api/customers/{id}
Update existing customer
- **Path Parameter**: `id` (Long)
- **Request Body**: CustomerDTO

#### DELETE /api/customers/{id}
Delete customer
- **Path Parameter**: `id` (Long)

### Orders API

#### GET /api/orders
Get all orders with pagination
- **Query Parameters**: `pageNumber`, `pageSize`
- **Response**: Paginated list of orders

#### GET /api/orders/{id}
Get order by ID
- **Path Parameter**: `id` (Long)
- **Response**: Single order object

#### POST /api/orders
Create new order
- **Request Body**: OrderDTO
```json
{
  "orderNumber": "string",
  "customerId": 1,
  "storeId": 1,
  "totalAmount": 0.0,
  "status": "string",
  "orderDate": "2024-01-01T00:00:00",
  "deliveryDate": "2024-01-01T00:00:00",
  "shippingAddress": "string",
  "paymentMethod": "string",
  "notes": "string"
}
```

#### PUT /api/orders/{id}
Update existing order
- **Path Parameter**: `id` (Long)
- **Request Body**: OrderDTO

#### DELETE /api/orders/{id}
Delete order
- **Path Parameter**: `id` (Long)

### Inventory Items API

#### GET /api/inventoryitems
Get all inventory items with pagination
- **Query Parameters**: `pageNumber`, `pageSize`
- **Response**: Paginated list of inventory items

#### GET /api/inventoryitems/{id}
Get inventory item by ID
- **Path Parameter**: `id` (Long)
- **Response**: Single inventory item object

#### POST /api/inventoryitems
Create new inventory item
- **Request Body**: InventoryItemDTO
```json
{
  "itemName": "string",
  "sku": "string",
  "category": "string",
  "quantity": 0,
  "reorderLevel": 0,
  "unitPrice": 0.0,
  "storeId": 1,
  "location": "string",
  "status": "string",
  "description": "string"
}
```

#### PUT /api/inventoryitems/{id}
Update existing inventory item
- **Path Parameter**: `id` (Long)
- **Request Body**: InventoryItemDTO

#### DELETE /api/inventoryitems/{id}
Delete inventory item
- **Path Parameter**: `id` (Long)

#### GET /admin/stores
Get stores with pagination (legacy endpoint)
- **Query Parameters**: `pageNumber`, `pageSize`

#### GET /admin/orders
Get orders with pagination (legacy endpoint)
- **Query Parameters**: `pageNumber`, `pageSize`

#### GET /admin/customers
Get customers with pagination (legacy endpoint)
- **Query Parameters**: `pageNumber`, `pageSize`

#### GET /admin/inventoryitems
Get inventory items with pagination (legacy endpoint)
- **Query Parameters**: `pageNumber`, `pageSize`

### User Controller (S3 Integration)

#### GET /user-controller/getAllUsers
Get all users from S3
- **Response**: List of users from S3 storage

#### GET /user-controller/{id}
Get user by ID from S3
- **Path Parameter**: `id` (String)

## Error Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **404**: Not Found
- **500**: Internal Server Error

## Database Tables

### franchises
- id (SERIAL PRIMARY KEY)
- franchise_name (VARCHAR)
- contact_person (VARCHAR)
- contact_email (VARCHAR)
- headquarters_address (VARCHAR)
- start_date (DATE)
- franchise_logo (VARCHAR)
- website_url (VARCHAR)

### activity_logs
- id (SERIAL PRIMARY KEY)
- action (VARCHAR)
- timestamp (TIMESTAMP)
- user_id (VARCHAR)
- user_role (VARCHAR)
- entity_type (VARCHAR)
- entity_id (VARCHAR)
- details (TEXT)

### notifications
- id (SERIAL PRIMARY KEY)
- title (VARCHAR)
- message (TEXT)
- type (VARCHAR)
- is_read (BOOLEAN)
- timestamp (TIMESTAMP)
- target_url (VARCHAR)
- priority (VARCHAR)
- store_id (BIGINT FK)
- customer_id (BIGINT FK)

### stores (Updated)
- Added: franchise_id (BIGINT FK)
- Added: operational_status (BOOLEAN)
- Added: store_image (VARCHAR)
- Added: store_website (VARCHAR)

## Setup Instructions

1. Run the initial schema: `schema.sql`
2. Run the migration: `migration.sql`
3. Load sample data: `sample_data.sql` and `sample_data_new.sql`
4. Start the Spring Boot application
5. Access APIs at `http://localhost:8080`