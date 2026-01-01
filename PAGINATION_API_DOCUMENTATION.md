# Pagination API Documentation

## Overview
All 4 Admin APIs now support both non-paginated and paginated endpoints. Use the non-paginated endpoints to get all data at once, or use the paginated endpoints for better performance with large datasets.

---

## Non-Paginated Endpoints

### 1. GET /api/admin/stores
Retrieves all stores without pagination.

**Request:**
```
GET http://localhost:8080/api/admin/stores
```

**Response:**
```json
{
  "status": 200,
  "message": "Stores retrieved successfully",
  "data": [
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
  ],
  "errors": null
}
```

---

### 2. GET /api/admin/orders
Retrieves all orders without pagination.

**Request:**
```
GET http://localhost:8080/api/admin/orders
```

**Response:**
```json
{
  "status": 200,
  "message": "Orders retrieved successfully",
  "data": [
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
  ],
  "errors": null
}
```

---

### 3. GET /api/admin/customers
Retrieves all customers without pagination.

**Request:**
```
GET http://localhost:8080/api/admin/customers
```

**Response:**
```json
{
  "status": 200,
  "message": "Customers retrieved successfully",
  "data": [
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
  ],
  "errors": null
}
```

---

### 4. GET /api/admin/inventoryitems
Retrieves all inventory items without pagination.

**Request:**
```
GET http://localhost:8080/api/admin/inventoryitems
```

**Response:**
```json
{
  "status": 200,
  "message": "Inventory items retrieved successfully",
  "data": [
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
  ],
  "errors": null
}
```

---

## Paginated Endpoints

### 1. GET /api/admin/stores/paginated
Retrieves stores with pagination support.

**Request:**
```
GET http://localhost:8080/api/admin/stores/paginated?pageNumber=0&pageSize=5
```

**Query Parameters:**
- `pageNumber` (optional, default=0): Page number (0-indexed)
- `pageSize` (optional, default=10): Number of items per page

**Response:**
```json
{
  "status": 200,
  "message": "Paginated stores retrieved successfully",
  "data": {
    "content": [
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
      },
      ...more items
    ],
    "pageNumber": 0,
    "pageSize": 5,
    "totalElements": 8,
    "totalPages": 2,
    "isFirst": true,
    "isLast": false,
    "hasNext": true,
    "hasPrevious": false
  },
  "errors": null
}
```

---

### 2. GET /api/admin/orders/paginated
Retrieves orders with pagination support.

**Request:**
```
GET http://localhost:8080/api/admin/orders/paginated?pageNumber=0&pageSize=5
```

**Query Parameters:**
- `pageNumber` (optional, default=0): Page number (0-indexed)
- `pageSize` (optional, default=10): Number of items per page

**Response:**
```json
{
  "status": 200,
  "message": "Paginated orders retrieved successfully",
  "data": {
    "content": [
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
      },
      ...more items
    ],
    "pageNumber": 0,
    "pageSize": 5,
    "totalElements": 10,
    "totalPages": 2,
    "isFirst": true,
    "isLast": false,
    "hasNext": true,
    "hasPrevious": false
  },
  "errors": null
}
```

---

### 3. GET /api/admin/customers/paginated
Retrieves customers with pagination support.

**Request:**
```
GET http://localhost:8080/api/admin/customers/paginated?pageNumber=0&pageSize=5
```

**Query Parameters:**
- `pageNumber` (optional, default=0): Page number (0-indexed)
- `pageSize` (optional, default=10): Number of items per page

**Response:**
```json
{
  "status": 200,
  "message": "Paginated customers retrieved successfully",
  "data": {
    "content": [
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
      },
      ...more items
    ],
    "pageNumber": 0,
    "pageSize": 5,
    "totalElements": 10,
    "totalPages": 2,
    "isFirst": true,
    "isLast": false,
    "hasNext": true,
    "hasPrevious": false
  },
  "errors": null
}
```

---

### 4. GET /api/admin/inventoryitems/paginated
Retrieves inventory items with pagination support.

**Request:**
```
GET http://localhost:8080/api/admin/inventoryitems/paginated?pageNumber=0&pageSize=5
```

**Query Parameters:**
- `pageNumber` (optional, default=0): Page number (0-indexed)
- `pageSize` (optional, default=10): Number of items per page

**Response:**
```json
{
  "status": 200,
  "message": "Paginated inventory items retrieved successfully",
  "data": {
    "content": [
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
      },
      ...more items
    ],
    "pageNumber": 0,
    "pageSize": 5,
    "totalElements": 15,
    "totalPages": 3,
    "isFirst": true,
    "isLast": false,
    "hasNext": true,
    "hasPrevious": false
  },
  "errors": null
}
```

---

## Pagination Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `content` | Array | List of items in the current page |
| `pageNumber` | Integer | Current page number (0-indexed) |
| `pageSize` | Integer | Number of items per page |
| `totalElements` | Long | Total number of items across all pages |
| `totalPages` | Integer | Total number of pages |
| `isFirst` | Boolean | True if this is the first page |
| `isLast` | Boolean | True if this is the last page |
| `hasNext` | Boolean | True if there are more pages after this one |
| `hasPrevious` | Boolean | True if there are pages before this one |

---

## Usage Examples

### Example 1: Get first page of stores with 5 items per page
```bash
curl -X GET "http://localhost:8080/api/admin/stores/paginated?pageNumber=0&pageSize=5"
```

### Example 2: Get second page of orders with 10 items per page
```bash
curl -X GET "http://localhost:8080/api/admin/orders/paginated?pageNumber=1&pageSize=10"
```

### Example 3: Get all customers (non-paginated)
```bash
curl -X GET "http://localhost:8080/api/admin/customers"
```

### Example 4: Get all inventory items with default pagination (10 items)
```bash
curl -X GET "http://localhost:8080/api/admin/inventoryitems/paginated"
```

---

## Error Handling

All endpoints return error responses with status 500 if something goes wrong:

```json
{
  "status": 500,
  "message": "Error retrieving stores",
  "data": null,
  "errors": ["Database connection error"]
}
```

---

## Key Features

✅ **Non-paginated endpoints** - Get all data at once
✅ **Paginated endpoints** - Efficient data retrieval with pagination
✅ **Default values** - pageNumber defaults to 0, pageSize defaults to 10
✅ **Metadata** - Includes pagination metadata (totalPages, isFirst, hasNext, etc.)
✅ **Type-safe** - Returns strongly-typed DTOs
✅ **Error handling** - Proper error responses with messages
✅ **Logging** - Detailed logging for debugging

---

## Files Modified/Created

1. ✅ `PaginationRequest.java` - NEW
2. ✅ `PaginatedResponse.java` - NEW
3. ✅ `AdminService.java` - UPDATED with pagination methods
4. ✅ `AdminServiceImplementation.java` - UPDATED with pagination implementation
5. ✅ `AdminController.java` - UPDATED with pagination endpoints

