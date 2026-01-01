# Brand Manager Login Fix

## Issue
When logging in as a Brand Manager, the system was showing the "Store Manager" UI and redirecting to `/store/dashboard` instead of the Admin Portal at `/admin/dashboard`.

## Root Cause
The login redirect logic in `LoginPage.tsx` was treating `BRAND_MANAGER` role the same as `STORE_MANAGER` role, sending both to the store dashboard.

## Changes Made

### 1. LoginPage.tsx (Line 58)
**Before:**
```typescript
const dashboardPath = data.data.role === 'ADMIN' ? '/admin/dashboard' : 
                      (data.data.role === 'STORE_MANAGER' || data.data.role === 'BRAND_MANAGER') ? '/store/dashboard' : '/store/dashboard';
```

**After:**
```typescript
const dashboardPath = data.data.role === 'ADMIN' || data.data.role === 'BRAND_MANAGER' ? '/admin/dashboard' : '/store/dashboard';
```

**Explanation:** Brand Managers now redirect to `/admin/dashboard` along with ADMIN users.

---

### 2. HomePage.tsx
**Added Import:**
```typescript
import { useUserStore } from '@/store/userStore';
```

**Updated getDashboardLink function:**
```typescript
const { user } = useUserStore();

const getDashboardLink = () => {
  if (user?.role === 'ADMIN' || user?.role === 'BRAND_MANAGER') {
    return "/admin/dashboard";
  }
  return "/store/dashboard";
};
```

**Explanation:** Homepage now properly checks user role from the store and redirects Brand Managers to admin dashboard.

---

## Role Mapping

### Admin Routes (`/admin/*`)
Used by:
- ✅ `ADMIN` role
- ✅ `BRAND_MANAGER` role

Features:
- Full system access
- Request Management (approve/deny inventory requests)
- Create shipments
- View all stores' data
- Analytics across all locations

### Store Routes (`/store/*`)
Used by:
- ✅ `STORE_MANAGER` role

Features:
- Store-specific access
- Create inventory requests
- Confirm shipment receipt
- View own store's data only

---

## Testing

### To Test Brand Manager Login:
1. Login with Brand Manager credentials
2. Should redirect to `/admin/dashboard`
3. Sidebar should show "Admin Portal" (not "Store Manager")
4. Navigation should include:
   - Dashboard
   - Brands
   - Stores
   - Order Analytics
   - Customer Analytics
   - Inventory
   - **Request Management** ← New
   - **Shipments** ← New
   - Reports
   - Activity Logs

### To Test Store Manager Login:
1. Login with Store Manager credentials
2. Should redirect to `/store/dashboard`
3. Sidebar should show "Store Manager"
4. Navigation should include:
   - Dashboard
   - Orders
   - Customers
   - Inventory
   - **Inventory Requests** ← New
   - **Shipments** ← New
   - Reports

---

## Expected Behavior After Fix

### Brand Manager Login:
```
Login → /admin/dashboard
Sidebar: "Admin Portal"
Role Badge: "👤 Admin" or "👔 Brand Manager"
Access: All admin features + Request Management + Shipments
```

### Store Manager Login:
```
Login → /store/dashboard
Sidebar: "Store Manager"
Role Badge: "🏪 Store Manager"
Access: Store features + Inventory Requests + Shipments
```

---

## Files Modified
1. ✅ `src/components/pages/LoginPage.tsx` - Fixed redirect logic
2. ✅ `src/components/pages/HomePage.tsx` - Fixed dashboard link logic

---

## Status
✅ **FIXED** - Brand Managers now properly redirect to Admin Portal with full admin access including Request Management and Shipments pages.
