import { z } from 'zod';

// Auth Validation
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// Customer Validation
export const CreateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;

// Menu Item Validation
export const CreateMenuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['Appetizers', 'Mains', 'Sides', 'Desserts', 'Packages']),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  unit: z.string().default('per plate'),
  available: z.boolean().default(true),
});

export type CreateMenuItemInput = z.infer<typeof CreateMenuItemSchema>;

// Order Item Validation
export const CreateOrderItemSchema = z.object({
  menu_id: z.string().min(1, 'Menu item ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().positive('Unit price must be positive'),
});

export type CreateOrderItemInput = z.infer<typeof CreateOrderItemSchema>;

// Order Validation
export const CreateOrderSchema = z.object({
  customer_id: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  address: z.string().optional(),
  event_type: z.string().min(1, 'Event type is required'),
  event_date: z.string().datetime('Invalid date'),
  guest_count: z.number().min(1, 'Guest count must be at least 1'),
  venue: z.string().optional(),
  total_amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
  items: z.array(CreateOrderItemSchema).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// Invoice Validation
export const UpdateInvoiceStatusSchema = z.object({
  status: z.enum(['Paid', 'Unpaid']),
});

export type UpdateInvoiceStatusInput = z.infer<typeof UpdateInvoiceStatusSchema>;

// Contact Form Validation
export const CreateContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  event_type: z.string().min(1, 'Event type is required'),
  event_date: z.string().datetime('Invalid date'),
  guest_count: z.number().min(1, 'Guest count must be at least 1'),
  message: z.string().optional(),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
