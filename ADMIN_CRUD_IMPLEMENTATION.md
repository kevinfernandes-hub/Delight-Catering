# Admin CRUD Implementation Guide

## ✅ Completed: Customer Management

### What Was Built
1. **CustomerForm Component** - Fully functional add/edit form
   - Validation: Name, Email (regex), Phone, Address required
   - Error handling: Inline error messages on validation failure
   - API Integration: POST for create, PUT for update
   - Loading states: Spinner on button during save
   - Form reset: Closes and refreshes list on success

2. **Customer Listing Page** 
   - Card-based grid layout with customer info
   - Avatar with auto-generated color based on name
   - Quick stats: Total orders + Total spent
   - Search/filter by name or email
   - Edit button → Opens CustomerForm in modal
   - Delete button → Confirmation dialog → DELETE API
   - View Details → CustomerModal with order history

### How to Use Customer CRUD
```
1. Navigate to /admin/customers
2. Click "Add New Customer" button (top right)
3. Fill form fields (validates as you type)
4. Click "Add Customer" to submit
5. Form auto-closes and list refreshes
6. To edit: Click Edit icon on any customer card
7. To delete: Click Delete icon → Confirm → Records erased
8. To view details: Click on customer card
```

### API Endpoints Used
- `POST /api/customers` - Create new customer
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer  
- `GET /api/customers` - Fetch all customers (with order history)

---

## 🔄 To Implement: Menu Item CRUD

### Form Structure (MenuItemForm Component)
```typescript
Fields:
- name (string) - Dish name, required
- category (select) - Appetizers, Mains, Sides, Desserts, Packages
- price (number) - ₹, required
- unit (select) - per plate, per piece, per lb, per serving
- description (textarea) - Item description/ingredients
- available (checkbox) - Toggle availability

Validation:
- name required + min 3 chars
- category selected
- price > 0
- description optional

API Calls:
- POST /api/menu - Create
- PUT /api/menu/[id] - Update  
- DELETE /api/menu/[id] - Delete
```

### Menu Listing Page Features
```
- Card grid layout (5-6 cards per row)
- Search by name or description
- Filter by category dropdown
- Category badge on each card
- Availability toggle (green/gray badge)
- Price display with unit
- Edit/Delete buttons
- Add New Item button (top right)
```

### Implementation Steps
1. Create MenuItemForm component (copy CustomerForm structure)
2. Add form to /admin/menu/page.tsx
3. Update existing menu list to use form
4. Test POST, PUT, DELETE against /api/menu endpoints

---

## 🔄 To Implement: Order Management CRUD

### Form Structure (OrderForm Component)
```typescript
Fields:
- customer_id (select) - Dropdown of existing customers
- event_type (select) - Wedding, Corporate, Birthday, Other
- event_date (date) - Date picker
- guest_count (number) - Number of guests
- items[] (array) - Menu items selected + quantities
- total_amount (number) - Auto-calculated from items
- status (select) - Pending, Confirmed, Completed, Cancelled
- notes (textarea) - Special requests

Validation:
- customer required
- event_date must be today or future
- guest_count > 0
- items at least 1
- total_amount auto-calculated

API Calls:
- POST /api/orders - Create new order
- PUT /api/orders/[id] - Update order + status
- DELETE /api/orders/[id] - Cancel order
- GET /api/orders/[id] - Fetch order details with items
```

### Order Listing Page Features
```
- Table format (better for orders with many columns)
- Columns: Customer, Event Date, Type, Guest Count, Total, Status
- Status color badges: Pending (yellow), Confirmed (blue), Completed (green), Cancelled (red)
- Search by customer name
- Filter by status (tabs: All, Pending, Confirmed, Completed)
- Order ID, Created date
- Edit button → Update status, quantities
- Delete button → Cancel order
- View details → Modal with order items breakdown + invoice option
```

### Implementation Steps
1. Create OrderForm component with customer dropdown + menu item selection
2. Implement item selection UI (add items to cart within form)
3. Show running total that auto-calculates
4. Add to /admin/orders/page.tsx
5. Create OrderDetailsModal showing items + quantities
6. Test full order creation/edit/delete flow

---

## 🔄 To Implement: Invoice/Bills Management

### Form Structure (InvoiceForm Component)
```typescript
Note: Invoices are typically generated FROM orders, not standalone

Fields:
- order_id (select) - Link to existing order
- amount (number) - From order total (auto-populate)
- tax_amount (number) - Calculated (5-18% based on order value)
- discount_amount (number, optional) - Admin override
- payment_received (number) - Amount customer paid
- payment_method (select) - Cash, Card, Transfer, Cheque
- payment_date (date) - When payment received
- notes (textarea) - Payment notes

Validation:
- order_id required (unique, 1 invoice per order)
- payment_received <= total_amount
- payment_date <= today

API Calls:
- POST /api/invoices - Create invoice from order
- PUT /api/invoices/[id] - Update payment status
- GET /api/invoices/[id] - Get invoice + download PDF
```

### Invoice Listing Page Features
```
- Table format
- Columns: Invoice ID, Customer, Order, Total, Paid, Balance, Status, Date
- Status badges: Pending (red), Paid (green), Partial (yellow)
- Payment status: Amount overdue (red text)
- Search by invoice ID or customer
- Filter by status
- Download PDF button
- Mark as Paid button
- Edit payment details button
- Email invoice button (integrates with email service)
```

### Implementation Steps
1. Create InvoiceForm component with order selector
2. Auto-populate order total + calculate taxes
3. Show payment remaining after input
4. Add to /admin/bills/page.tsx
5. Implement PDF generation (use library like PDFKit)
6. Add email integration for sending invoices

---

## 📋 Implementation Order Recommendation

### Phase 1 (Quick Wins - 2-3 hours)
1. ✅ Customer CRUD ← COMPLETED
2. Menu Item CRUD (high value, simple form)
3. Test all customer CRUD operations

### Phase 2 (Complex Logic - 4-5 hours)
1. Order CRUD (requires item selection UI)
2. Order details modal with breakdown
3. Full order lifecycle testing

### Phase 3 (Integrations - 3 hours)
1. Invoice generation from orders
2. PDF download functionality
3. Email invoice functionality
4. Payment tracking

---

## 🛠️ Code Templates

### Template: Basic CRUD Form (Copy from CustomerForm)
```typescript
const MyForm = ({ item, onClose, onSave, showToast }) => {
  const [formData, setFormData] = useState({...item or defaults});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => { /* validation logic */ };
  
  const handleSubmit = async (e) => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch(
        item?.id ? `/api/path/${item.id}` : '/api/path',
        {
          method: item?.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      );
      if (!response.ok) throw new Error('Failed');
      showToast('Success', 'success');
      onSave();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Form JSX */}
      </div>
    </div>
  );
};
```

### Template: Listing Page Structure
```typescript
export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/path').then(/* load items */);
  }, []);

  return (
    <div>
      {/* Header + Add Button */}
      {/* Search/Filter */}
      {/* Items Grid/Table */}
      {showForm && <MyForm onClose={close} onSave={reload} />}
    </div>
  );
}
```

---

## 📊 Progress Tracker

| Feature | Status | Completion | Priority |
|---------|--------|-----------|----------|
| Customer CRUD | ✅ Complete | 100% | 🔴 Critical |
| Menu Item CRUD | ⏳ Ready | 0% | 🔴 Critical |
| Order CRUD | ⏳ Ready | 0% | 🔴 Critical |
| Invoice CRUD | ⏳ Ready | 0% | 🟡 High |
| Dashboard Stats | ⏳ Ready | 0% | 🟡 High |
| Email Notifications | ⏳ Ready | 0% | 🟠 Medium |
| PDF Generation | ⏳ Ready | 0% | 🟠 Medium |

---

## 🧪 Testing Checklist

### Customer CRUD Tests
- [ ] Add new customer (empty form validation)
- [ ] Fill all fields correctly + submit
- [ ] Verify customer appears in list
- [ ] Edit existing customer (change name/email)
- [ ] Verify changes saved
- [ ] Delete customer + confirm dialog
- [ ] Verify customer removed from list
- [ ] Search filters results by name
- [ ] Search filters by email

### Menu CRUD Tests (When Built)
- [ ] Add menu item with all fields
- [ ] Add with missing required fields (shows errors)
- [ ] Edit existing item
- [ ] Toggle availability
- [ ] Delete item
- [ ] Filter by category
- [ ] Search by name/description

### Order CRUD Tests (When Built)
- [ ] Create order with customer + items
- [ ] Add multiple items to order
- [ ] Verify total auto-calculates
- [ ] Change order status (Pending → Confirmed)
- [ ] View order details with item breakdown
- [ ] Generate invoice from order
- [ ] Download invoice PDF

---

## 🚀 Next Steps
1. Start Menu Item CRUD (copy CustomerForm template)
2. Test against /api/menu endpoints
3. Move to Order CRUD (most complex)
4. Implement invoice generation
5. Add email & PDF integrations

Total estimated time for all CRUD: 8-10 hours
