'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  X,
  Calendar,
  Users as UsersIcon,
  MapPin,
  DollarSign,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatDate, formatOrderId } from '@/lib/utils';
import { useToast } from '@/app/components/admin/Toast';
import ConfirmDialog from '@/app/components/admin/ConfirmDialog';

/* eslint-disable @typescript-eslint/no-explicit-any */

const ORDER_TABS = ['All', 'Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'];
const EVENT_TYPES = ['Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Engagement', 'Reception', 'Other'];

interface OrderFormItem {
  menu_id: string;
  menuItem?: { id: string; name: string; price: number; unit: string };
  quantity: number;
  unit_price: number;
}

const OrderForm = ({ 
  order, 
  customers,
  menuItems,
  onClose, 
  onSave,
  showToast 
}: { 
  order?: any,
  customers: any[],
  menuItems: any[],
  onClose: () => void, 
  onSave: (data: any) => Promise<void>,
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
}) => {
  const [formData, setFormData] = useState({
    customer_id: order?.customer_id || '',
    event_type: order?.event_type || EVENT_TYPES[0],
    event_date: order?.event_date?.split('T')[0] || '',
    guest_count: order?.guest_count || '',
    venue: order?.venue || '',
    status: order?.status || 'Pending',
    notes: order?.notes || ''
  });
  
  const [items, setItems] = useState<OrderFormItem[]>(order?.orderItems || []);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemQty, setSelectedItemQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!formData.event_date) newErrors.event_date = 'Event date is required';
    const eventDate = new Date(formData.event_date);
    if (eventDate < new Date(new Date().toISOString().split('T')[0])) {
      newErrors.event_date = 'Event date must be today or later';
    }
    if (!formData.guest_count || parseInt(formData.guest_count) <= 0) newErrors.guest_count = 'Guest count must be greater than 0';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
    if (items.length === 0) newErrors.items = 'Add at least one menu item';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = () => {
    if (!selectedItemId) {
      showToast('Select a menu item first', 'error');
      return;
    }
    const menuItem = menuItems.find(m => m.id === selectedItemId);
    if (!menuItem) return;

    const alreadyExists = items.find(i => i.menu_id === selectedItemId);
    if (alreadyExists) {
      setItems(items.map(i => i.menu_id === selectedItemId ? { ...i, quantity: i.quantity + selectedItemQty } : i));
    } else {
      setItems([...items, { menu_id: selectedItemId, menuItem, quantity: selectedItemQty, unit_price: menuItem.price }]);
    }
    setSelectedItemId('');
    setSelectedItemQty(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        guest_count: parseInt(formData.guest_count),
        total_amount: totalAmount,
        orderItems: items.map(i => ({
          menu_id: i.menu_id,
          quantity: i.quantity,
          unit_price: i.unit_price
        }))
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#111', zIndex: 10 }}>
          <h2 style={{ margin: 0 }}>{order?.id ? 'Edit Order' : 'Create New Order'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* CUSTOMER & EVENT DETAILS */}
          <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#C9A84C', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Order Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: '#A3A3A3', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Customer *</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#050505',
                    border: `1px solid ${errors.customer_id ? '#ef4444' : '#333'}`,
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                >
                  <option value="">Select a customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} • {c.phone}</option>)}
                </select>
                {errors.customer_id && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.customer_id}</p>}
              </div>

              <div>
                <label style={{ display: 'block', color: '#A3A3A3', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Event Type *</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#050505',
                    border: '1px solid #333',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                >
                  {EVENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#A3A3A3', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Event Date *</label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#050505',
                    border: `1px solid ${errors.event_date ? '#ef4444' : '#333'}`,
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                {errors.event_date && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.event_date}</p>}
              </div>

              <div>
                <label style={{ display: 'block', color: '#A3A3A3', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Guest Count *</label>
                <input
                  type="number"
                  value={formData.guest_count}
                  onChange={(e) => setFormData({...formData, guest_count: e.target.value})}
                  min="1"
                  placeholder="100"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#050505',
                    border: `1px solid ${errors.guest_count ? '#ef4444' : '#333'}`,
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                {errors.guest_count && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.guest_count}</p>}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', color: '#A3A3A3', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Venue/Location *</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  placeholder="e.g., New York Marriott Downtown"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#050505',
                    border: `1px solid ${errors.venue ? '#ef4444' : '#333'}`,
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                {errors.venue && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.venue}</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: '#A3A3A3', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#050505',
                    border: '1px solid #333',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                >
                  {ORDER_TABS.slice(1).map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#A3A3A3', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Special Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Dietary restrictions, preferences..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#050505',
                    border: '1px solid #333',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
              </div>
            </div>
          </div>

          {/* MENU ITEMS SELECTION */}
          <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#C9A84C', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Menu Items</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px', gap: '1rem', marginBottom: '1rem' }}>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#050505',
                  border: '1px solid #333',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
              >
                <option value="">Add menu item...</option>
                {menuItems.filter(m => m.available).map(m => (
                  <option key={m.id} value={m.id}>{m.name} • ₹{m.price}</option>
                ))}
              </select>
              
              <input
                type="number"
                value={selectedItemQty}
                onChange={(e) => setSelectedItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#050505',
                  border: '1px solid #333',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  textAlign: 'center'
                }}
              />

              <button
                type="button"
                onClick={addItem}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#C9A84C',
                  color: '#000',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Add
              </button>
            </div>

            {errors.items && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '1rem' }}>{errors.items}</p>}

            {/* ITEMS TABLE */}
            {items.length > 0 ? (
              <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontSize: '0.75rem' }}>Dish</th>
                      <th style={{ textAlign: 'center', padding: '0.75rem', color: '#64748b', fontSize: '0.75rem' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '0.75rem', color: '#64748b', fontSize: '0.75rem' }}>Price</th>
                      <th style={{ textAlign: 'right', padding: '0.75rem', color: '#64748b', fontSize: '0.75rem' }}>Subtotal</th>
                      <th style={{ textAlign: 'center', padding: '0.75rem', color: '#64748b', fontSize: '0.75rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '0.75rem' }}>{item.menuItem?.name}</td>
                        <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => setItems(items.map((i, j) => j === idx ? { ...i, quantity: Math.max(1, parseInt(e.target.value) || 1) } : i))}
                            min="1"
                            style={{
                              width: '50px',
                              padding: '0.4rem',
                              backgroundColor: '#050505',
                              border: '1px solid #333',
                              borderRadius: '0.3rem',
                              color: '#fff',
                              textAlign: 'center'
                            }}
                          />
                        </td>
                        <td style={{ textAlign: 'right', padding: '0.75rem' }}>₹{item.unit_price}</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600', color: '#C9A84C' }}>₹{(item.unit_price * item.quantity).toFixed(2)}</td>
                        <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              border: '1px solid #ef4444',
                              borderRadius: '0.3rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', color: '#64748b' }}>
                Add menu items to create the order
              </div>
            )}

            {/* TOTAL */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#A3A3A3', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Subtotal:</p>
                <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#C9A84C', margin: 0 }}>₹{totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* FORM ACTIONS */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                color: '#fff',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#C9A84C',
                color: '#000',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {loading && <Loader2 size={16} />}
              {loading ? 'Creating...' : order?.id ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrderModal = ({ order, onClose }: { order: any, onClose: () => void }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Order Details - {formatOrderId(order.id)}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
             <div>
                <h3 style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Customer</h3>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{order.customer.name}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#A3A3A3' }}>{order.customer.email}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#A3A3A3' }}>{order.customer.phone}</p>
             </div>
             <div>
                <h3 style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Event Details</h3>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{order.event_type}</p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: '#A3A3A3' }}>Date: {formatDate(order.event_date)}</p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: '#A3A3A3' }}>Guests: {order.guest_count}</p>
             </div>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
             <h3 style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Venue</h3>
             <p style={{ margin: 0 }}>{order.venue || 'No venue specified'}</p>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ fontSize: '1.1rem' }}>Total Amount:</span>
             <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#C9A84C' }}>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/menu').then(r => r.json())
    ])
      .then(([orders, customers, menuItems]) => {
        setOrders(orders || []);
        setCustomers(customers || []);
        setMenuItems(menuItems || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        showToast('Failed to load data', 'error');
        setLoading(false);
      });
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveOrder = async (data: any) => {
    const url = editingOrder ? `/api/orders/${editingOrder.id}` : '/api/orders';
    const method = editingOrder ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        showToast(`✓ Order ${editingOrder ? 'updated' : 'created'} successfully`, 'success');
        setIsOrderFormOpen(false);
        setEditingOrder(null);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || `Failed to ${editingOrder ? 'update' : 'create'} order`, 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save order', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`✓ Status updated to ${newStatus}`, 'success');
        fetchData();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/orders/${deleteConfirm}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Order deleted successfully', 'success');
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to delete order', 'error');
      }
    } catch (error) {
      showToast('Failed to delete order', 'error');
    }
    setDeleteConfirm(null);
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'All' || order.status === activeTab;
    const matchesSearch = order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          formatOrderId(order.id).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Order Management</h1>
          <p style={{ color: '#A3A3A3' }}>Track ongoing events, manage confirmations, and handle cancellations.</p>
        </div>
        <button 
          className="btn-gold" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
          onClick={() => { setEditingOrder(null); setIsOrderFormOpen(true); }}
        >
          <Plus size={18} /> New Order
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="Search by customer name or ORD-xxx..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', backgroundColor: '#111', 
              border: '1px solid #333', borderRadius: '0.5rem', color: '#fff', outline: 'none'
            }} 
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {ORDER_TABS.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: activeTab === tab ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
                color: activeTab === tab ? '#C9A84C' : '#64748b',
                cursor: 'pointer',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Order ID</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Customer</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Event Specs</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Amount</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Consulting central database...</td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="table-row">
                  <td style={{ padding: '1.25rem', fontWeight: '600', color: '#C9A84C' }}>{formatOrderId(order.id)}</td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: '500' }}>{order.customer.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.customer.phone}</div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.875rem' }}>{order.event_type}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDate(order.event_date)} • {order.guest_count} guests</div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <select 
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className={`status-select status-${order.status.toLowerCase()}`}
                    >
                      {ORDER_TABS.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '1.25rem', fontWeight: 'bold' }}>{formatCurrency(order.total_amount)}</td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                       <button onClick={() => setSelectedOrder(order)} className="action-btn" title="View"><Eye size={16} /></button>
                       <button onClick={() => { setEditingOrder(order); setIsOrderFormOpen(true); }} className="action-btn" title="Edit"><Edit2 size={16} /></button>
                       <button onClick={() => setDeleteConfirm(order.id)} className="action-btn delete" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      
      {isOrderFormOpen && (
        <OrderForm 
          order={editingOrder} 
          customers={customers}
          menuItems={menuItems}
          onClose={() => { setIsOrderFormOpen(false); setEditingOrder(null); }} 
          onSave={handleSaveOrder}
          showToast={showToast}
        />
      )}
      
      <ConfirmDialog 
        isOpen={deleteConfirm !== null}
        title="Delete Order?"
        message="This will permanently remove the order and all associated financial records. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmVariant="danger"
        confirmLabel="Confirm Delete"
      />

      <style jsx global>{`
        .input-label { display: block; color: #A3A3A3; fontSize: 0.85rem; margin-bottom: 0.5rem; }
        .admin-input { width: 100%; padding: 0.75rem; backgroundColor: #050505; border: 1px solid #333; borderRadius: 0.5rem; color: #fff; outline: none; transition: 0.2s; }
        .admin-input:focus { border-color: #C9A84C; background-color: #0c0c0c; }
      `}</style>

      <style jsx>{`
        .table-row { border-bottom: 1px solid rgba(255,255,255,0.02); transition: 0.2s; }
        .table-row:hover { background-color: rgba(255,255,255,0.02); }
        
        .status-select {
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid transparent;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          background-color: #1a1a1a;
          color: #fff;
        }
        .status-pending { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-confirmed { background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .status-completed { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-cancelled { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .action-btn { 
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          background: #1a1a1a; border: 1px solid #333; color: #64748b; border-radius: 6px; cursor: pointer; transition: 0.2s;
        }
        .action-btn:hover { border-color: #C9A84C; color: #C9A84C; }
        .action-btn.delete:hover { border-color: #ef4444; color: #ef4444; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.5rem; }
        .modal-content { background: #111; border: 1px solid #333; border-radius: 1rem; color: #fff; overflowY: auto; max-height: 95vh; }
        
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
