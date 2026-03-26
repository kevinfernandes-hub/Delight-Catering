// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// User/Customer Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string | null;
  created_at: Date;
}

// Menu Types
export interface MenuItem {
  id: string;
  name: string;
  category: 'Appetizers' | 'Mains' | 'Sides' | 'Desserts' | 'Packages';
  description?: string;
  price: number;
  unit: string;
  available: boolean;
  created_at: Date;
}

// Order Item Types
export interface OrderItem {
  id: string;
  order_id: string;
  order?: Order;
  menu_id: string;
  menuItem?: MenuItem;
  quantity: number;
  unit_price: number;
  created_at: Date;
}

// Order Types
export interface Order {
  id: string;
  customer_id: string;
  customer?: Customer;
  event_date: Date;
  event_type: string;
  guest_count: number;
  status: 'Pending' | 'Confirmed' | 'In-Progress' | 'Completed' | 'Cancelled';
  total_amount: number;
  venue: string;
  notes?: string | null;
  created_at: Date;
  invoice?: Invoice;
  orderItems?: OrderItem[];
}

// Invoice Types
export interface Invoice {
  id: string;
  order_id: string;
  order?: Order;
  invoice_number: string;
  issue_date: Date;
  due_date: Date;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: 'Paid' | 'Unpaid';
  paid_date?: Date;
  created_at: Date;
}

// Contact Types
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: Date;
  guest_count: number;
  message?: string;
  created_at: Date;
}

// Menu Package Types
export interface PackageItem {
  id: string;
  package_id: string;
  menu_id: string;
  menuItem?: MenuItem;
  quantity: number;
  created_at: Date;
}

export interface MenuPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  items: PackageItem[];
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Menu Order Types (from MenuBuilder)
export interface MenuOrder {
  id: string;
  customer_name: string;
  guest_count: number;
  items: string; // JSON string of selected items
  subtotal: number;
  tax_amount: number;
  total_price: number;
  status: 'Pending' | 'Confirmed' | 'Rejected';
  created_at: Date;
  updated_at: Date;
}

// Admin Session Types
export interface AdminSession {
  email: string;
  token: string;
  loginTime: string;
}

// Stats Types
export interface DashboardStats {
  revenue: number;
  customers: number;
  recentOrders: Order[];
  pendingInvoices: number;
  todayOrders: number;
}
