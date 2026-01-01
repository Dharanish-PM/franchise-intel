# Inventory Request & Shipment Management System

## Overview
This system enables Store Managers to request inventory items from Brand Managers, who can approve/deny requests and create shipments. Store Managers confirm receipt of shipments, which updates inventory stocks.

## Pages Created

### 1. InventoryRequestsPage (Store Manager)
**File:** `src/components/pages/InventoryRequestsPage.tsx`
**Role:** `store`

**Features:**
- Create new inventory item requests
- View all requests with status (Pending, Approved, Denied)
- Filter requests by item name and status
- See brand manager comments on requests
- KPI cards showing pending, approved, and denied counts

**Key Actions:**
- Click "New Request" to create a request
- Select item, quantity, priority (Low/Medium/High)
- Add optional notes
- Submit request to brand manager

---

### 2. RequestManagementPage (Brand Manager)
**File:** `src/components/pages/RequestManagementPage.tsx`
**Role:** `admin`

**Features:**
- View all inventory requests from all stores
- Filter by store, priority, and status
- Approve or deny requests with comments
- KPI cards showing pending, approved, and denied counts

**Key Actions:**
- Click green checkmark to approve a request
- Click red X to deny a request
- Add mandatory comment when denying
- Add optional comment when approving

---

### 3. ShipmentsPage (Both Roles)
**File:** `src/components/pages/ShipmentsPage.tsx`
**Roles:** `admin` (Brand Manager) and `store` (Store Manager)

**Brand Manager Features:**
- Create new shipments with multiple items
- Select destination store
- Add items with quantities
- Mark shipments as "Delivered"
- View all shipments across all stores

**Store Manager Features:**
- View shipments for their store
- Confirm receipt of delivered shipments
- Track shipment status (In Transit, Delivered, Confirmed)
- Filter shipments by status

**Shipment Workflow:**
1. Brand Manager creates shipment → Status: "In Transit"
2. Brand Manager marks as delivered → Status: "Delivered"
3. Store Manager confirms receipt → Status: "Confirmed"
4. Inventory stocks are updated (on confirmation)

---

## Integration Steps

### 1. Add Routes
Add these routes to your routing configuration:

```typescript
// For Store Manager
<Route path="/inventory-requests" element={<InventoryRequestsPage role="store" />} />
<Route path="/shipments" element={<ShipmentsPage role="store" />} />

// For Brand Manager (Admin)
<Route path="/request-management" element={<RequestManagementPage role="admin" />} />
<Route path="/shipments" element={<ShipmentsPage role="admin" />} />
```

### 2. Add Navigation Links
Update your navigation menu/sidebar:

**For Store Manager:**
```typescript
{ name: 'Inventory Requests', path: '/inventory-requests', icon: Package },
{ name: 'Shipments', path: '/shipments', icon: Truck },
```

**For Brand Manager:**
```typescript
{ name: 'Request Management', path: '/request-management', icon: ClipboardList },
{ name: 'Shipments', path: '/shipments', icon: Truck },
```

### 3. Backend API Integration
Replace mock data with actual API calls:

**InventoryRequestsPage:**
```typescript
// Fetch requests
const response = await fetch(`/api/inventory-requests?storeId=${selectedStoreId}`);

// Create request
await fetch('/api/inventory-requests', {
  method: 'POST',
  body: JSON.stringify(newRequest)
});
```

**RequestManagementPage:**
```typescript
// Fetch all requests
const response = await fetch('/api/inventory-requests');

// Approve/Deny request
await fetch(`/api/inventory-requests/${requestId}`, {
  method: 'PATCH',
  body: JSON.stringify({ status, comment })
});
```

**ShipmentsPage:**
```typescript
// Fetch shipments
const response = await fetch(`/api/shipments?storeId=${selectedStoreId}`);

// Create shipment
await fetch('/api/shipments', {
  method: 'POST',
  body: JSON.stringify(newShipment)
});

// Update shipment status
await fetch(`/api/shipments/${shipmentId}`, {
  method: 'PATCH',
  body: JSON.stringify({ status })
});

// Confirm receipt (updates inventory)
await fetch(`/api/shipments/${shipmentId}/confirm`, {
  method: 'POST'
});
```

### 4. Database Schema Suggestions

**inventory_requests table:**
```sql
- id (primary key)
- store_id (foreign key)
- item_id (foreign key)
- quantity (integer)
- priority (enum: Low, Medium, High)
- status (enum: Pending, Approved, Denied)
- notes (text)
- brand_manager_comment (text)
- request_date (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

**shipments table:**
```sql
- id (primary key)
- shipment_number (string, unique)
- store_id (foreign key)
- status (enum: In Transit, Delivered, Confirmed)
- shipment_date (timestamp)
- delivery_date (timestamp, nullable)
- confirmation_date (timestamp, nullable)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

**shipment_items table:**
```sql
- id (primary key)
- shipment_id (foreign key)
- item_id (foreign key)
- quantity (integer)
- created_at (timestamp)
```

---

## Workflow Summary

### Complete Flow:
1. **Store Manager** creates inventory request → Status: Pending
2. **Brand Manager** reviews request in Request Management page
3. **Brand Manager** approves/denies with comment
4. **Store Manager** sees updated status in Inventory Requests page
5. **Brand Manager** creates shipment with approved items
6. **Brand Manager** marks shipment as delivered when shipped
7. **Store Manager** sees delivered shipment in Shipments page
8. **Store Manager** confirms receipt → Inventory stocks updated
9. Shipment status changes to "Confirmed"

---

## Styling Notes
All pages follow the existing design system:
- Same card components and layouts
- Consistent color scheme (primary, secondary, background)
- Motion animations using Framer Motion
- Responsive grid layouts
- Badge components for status indicators
- Modal dialogs for forms
- Filter sections with consistent styling

---

## Next Steps
1. Add these pages to your routing configuration
2. Update navigation menus for both roles
3. Implement backend API endpoints
4. Connect to your database
5. Add real-time notifications (optional)
6. Implement email notifications for request approvals (optional)
7. Add inventory stock update logic on shipment confirmation
