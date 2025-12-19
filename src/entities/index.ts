/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: activitylogs
 * Interface for ActivityLogs
 */
export interface ActivityLogs {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  action?: string;
  /** @wixFieldType datetime */
  timestamp?: Date | string;
  /** @wixFieldType text */
  userId?: string;
  /** @wixFieldType text */
  userRole?: string;
  /** @wixFieldType text */
  entityType?: string;
  /** @wixFieldType text */
  entityId?: string;
  /** @wixFieldType text */
  details?: string;
  /** @wixFieldType multi_reference */
  customers?: Customers[];
}


/**
 * Collection ID: customers
 * Interface for Customers
 */
export interface Customers {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  customerName?: string;
  /** @wixFieldType multi_reference */
  notifications?: Notifications[];
  /** @wixFieldType multi_reference */
  activitylogs?: ActivityLogs[];
  /** @wixFieldType multi_reference */
  orders?: Orders[];
  /** @wixFieldType text */
  email?: string;
  /** @wixFieldType text */
  phoneNumber?: string;
  /** @wixFieldType date */
  dateOfBirth?: Date | string;
  /** @wixFieldType text */
  gender?: string;
  /** @wixFieldType number */
  totalOrders?: number;
  /** @wixFieldType number */
  totalSpend?: number;
  /** @wixFieldType datetime */
  lastActivityDate?: Date | string;
  /** @wixFieldType datetime */
  registrationDate?: Date | string;
}


/**
 * Collection ID: franchises
 * Interface for Franchises
 */
export interface Franchises {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  franchiseName?: string;
  /** @wixFieldType multi_reference */
  stores?: Stores[];
  /** @wixFieldType text */
  contactPerson?: string;
  /** @wixFieldType text */
  contactEmail?: string;
  /** @wixFieldType text */
  headquartersAddress?: string;
  /** @wixFieldType date */
  startDate?: Date | string;
  /** @wixFieldType image */
  franchiseLogo?: string;
  /** @wixFieldType url */
  websiteUrl?: string;
}


/**
 * Collection ID: inventoryitems
 * Interface for InventoryItems
 */
export interface InventoryItems {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  itemName?: string;
  /** @wixFieldType multi_reference */
  notifications?: Notifications[];
  /** @wixFieldType text */
  sku?: string;
  /** @wixFieldType number */
  currentStock?: number;
  /** @wixFieldType number */
  reorderLevel?: number;
  /** @wixFieldType number */
  unitCost?: number;
  /** @wixFieldType image */
  itemImage?: string;
  /** @wixFieldType multi_reference */
  stores?: Stores[];
  /** @wixFieldType multi_reference */
  orders?: Orders[];
}


/**
 * Collection ID: notifications
 * Interface for Notifications
 */
export interface Notifications {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  message?: string;
  /** @wixFieldType text */
  type?: string;
  /** @wixFieldType boolean */
  isRead?: boolean;
  /** @wixFieldType datetime */
  timestamp?: Date | string;
  /** @wixFieldType url */
  targetUrl?: string;
  /** @wixFieldType text */
  priority?: string;
  /** @wixFieldType multi_reference */
  stores?: Stores[];
  /** @wixFieldType multi_reference */
  customers?: Customers[];
  /** @wixFieldType multi_reference */
  inventoryitems?: InventoryItems[];
}


/**
 * Collection ID: orders
 * Interface for Orders
 */
export interface Orders {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType multi_reference */
  ordereditems?: InventoryItems[];
  /** @wixFieldType text */
  orderNumber?: string;
  /** @wixFieldType datetime */
  orderDate?: Date | string;
  /** @wixFieldType text */
  customerName?: string;
  /** @wixFieldType text */
  storeName?: string;
  /** @wixFieldType number */
  totalAmount?: number;
  /** @wixFieldType text */
  orderStatus?: string;
  /** @wixFieldType text */
  paymentMethod?: string;
  /** @wixFieldType multi_reference */
  stores?: Stores[];
  /** @wixFieldType multi_reference */
  customers?: Customers[];
}


/**
 * Collection ID: stores
 * Interface for Stores
 */
export interface Stores {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType multi_reference */
  inventoryitems?: InventoryItems[];
  /** @wixFieldType multi_reference */
  notifications?: Notifications[];
  /** @wixFieldType multi_reference */
  orders?: Orders[];
  /** @wixFieldType text */
  storeName?: string;
  /** @wixFieldType text */
  address?: string;
  /** @wixFieldType text */
  phoneNumber?: string;
  /** @wixFieldType text */
  emailAddress?: string;
  /** @wixFieldType boolean */
  operationalStatus?: boolean;
  /** @wixFieldType image */
  storeImage?: string;
  /** @wixFieldType url */
  storeWebsite?: string;
  /** @wixFieldType multi_reference */
  franchises?: Franchises[];
}
