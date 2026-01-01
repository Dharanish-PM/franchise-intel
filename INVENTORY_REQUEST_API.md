# Inventory Request Management API

## Create Inventory Request

**Endpoint:** `POST /api/inventory-requests`

**Description:** Creates a new inventory request with multiple items for a store.

### Request Body

```json
{
  "storeId": 1,
  "notes": "Weekly stock replenishment",
  "items": [
    {
      "itemId": 1,
      "quantityRequested": 50,
      "priority": "High"
    },
    {
      "itemId": 2,
      "quantityRequested": 40,
      "priority": "Medium"
    }
  ]
}
```

### Request Fields

- `storeId` (Long, required): The ID of the store making the request
- `notes` (String, optional): Additional notes for the request
- `items` (Array, required): List of items to request
  - `itemId` (Long, required): The ID of the inventory item
  - `quantityRequested` (Integer, required): Quantity requested
  - `priority` (String, required): Priority level - "Low", "Medium", or "High"

### Response

**Status Code:** `201 Created`

```json
{
  "status": "success",
  "message": "Inventory request created successfully",
  "data": {
    "id": "11111111-1111-1111-1111-111111111111",
    "requestNumber": "REQ-STR1-001",
    "storeId": 1,
    "status": "Pending",
    "notes": "Weekly stock replenishment",
    "requestDate": "2025-12-24T10:30:00",
    "items": [
      {
        "id": "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
        "itemId": 1,
        "quantityRequested": 50,
        "quantityApproved": 0,
        "quantityShipped": 0,
        "priority": "High",
        "status": "Pending",
        "brandManagerComment": null
      },
      {
        "id": "aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
        "itemId": 2,
        "quantityRequested": 40,
        "quantityApproved": 0,
        "quantityShipped": 0,
        "priority": "Medium",
        "status": "Pending",
        "brandManagerComment": null
      }
    ]
  }
}
```

### Response Fields

- `id` (UUID): Unique identifier for the request
- `requestNumber` (String): Auto-generated request number (format: REQ-STR{storeId}-{sequence})
- `storeId` (Long): Store ID
- `status` (String): Request status - "Pending", "Approved", "Rejected", "Partially_Approved", "Shipped", "Completed"
- `notes` (String): Request notes
- `requestDate` (DateTime): Timestamp when request was created
- `items` (Array): List of requested items with details

## Enums

### Priority (request_item_priority)
- `Low`
- `Medium`
- `High`

### RequestStatus (inventory_request_status)
- `Pending`
- `Partially_Approved` (maps to "Partially Approved" in DB)
- `Fully_Approved` (maps to "Fully Approved" in DB)
- `Denied`
- `Completed`

### RequestItemStatus (request_item_status)
- `Pending`
- `Approved`
- `Partially_Approved` (maps to "Partially Approved" in DB)
- `Denied`

## Example cURL Request

```bash
curl -X POST http://localhost:8080/api/inventory-requests \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": 1,
    "notes": "Weekly stock replenishment",
    "items": [
      {
        "itemId": 1,
        "quantityRequested": 50,
        "priority": "High"
      },
      {
        "itemId": 2,
        "quantityRequested": 40,
        "priority": "Medium"
      }
    ]
  }'
```
