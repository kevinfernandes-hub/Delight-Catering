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
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatDate, formatOrderId } from '@/lib/utils';
import { useToast } from '@/app/components/admin/Toast';
import ConfirmDialog from '@/app/components/admin/ConfirmDialog';

/* eslint-disable @typescript-eslint/no-explicit-any */

const ORDER_TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

const NewOrderModal = ({ onClose, onSave }: { onClose: () => void, onSave: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    event_type: 'Wedding',
    event_date: '',
    guest_count: '',
    total_amount: '',
    venue: '',
    address: ''
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', width: '95%' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Create New Order</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <form style={{ padding: '2rem' }} onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
             <section>
                <h3 style={{ fontSize: '0.9rem', color: '#C9A84C', marginBottom: '1rem', textTransform: 'uppercase' }}>Customer Info</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="input-label">Full Name</label>
                  <input required type="text" className="admin-input" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="input-label">Email Address</label>
                  <input required type="email" className="admin-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="input-label">Phone Number</label>
                  <input required type="tel" className="admin-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
             </section>

             <section>
                <h3 style={{ fontSize: '0.9rem', color: '#C9A84C', marginBottom: '1rem', textTransform: 'uppercase' }}>Event Details</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="input-label">Event Type</label>
                  <select className="admin-input" value={formData.event_type} onChange={e => setFormData({...formData, event_type: e.target.value})}>
                     <option>Wedding</option>
                     <option>Corporate</option>
                     <option>Birthday</option>
                     <option>Other</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="input-label">Event Date</label>
                  <input required type="date" className="admin-input" value={formData.event_date} onChange={e => setFormData({...formData, event_date: e.target.value})} />
                </div>
                <div>
                  <label className="input-label">Guest Count</label>
                  <input required type="number" className="admin-input" value={formData.guest_count} onChange={e => setFormData({...formData, guest_count: e.target.value})} />
                </div>
             </section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
             <div>
                <label className="input-label">Venue / Location</label>
                <input required type="text" className="admin-input" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
             </div>
             <div>
                <label className="input-label">Total Amount (INR)</label>
                <input required type="number" className="admin-input" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} />
             </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
             <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', border: '1px solid #333', color: '#fff', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
             <button type="submit" className="btn-gold" style={{ padding: '0.75rem 2rem' }}>Create Order</button>
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { showToast } = useToast();

  const fetchOrders = useCallback(() => {
    setLoading(true);
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateOrder = async (data: any) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast('New order created successfully', 'success');
        setIsNewOrderModalOpen(false);
        fetchOrders();
      }
    } catch (error) {
      showToast('Failed to create order', 'error');
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        fetchOrders();
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
        showToast('Order and associated invoice deleted', 'success');
        fetchOrders();
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
        <button className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsNewOrderModalOpen(true)}>
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
                       <button onClick={() => setSelectedOrder(order)} className="action-btn"><Eye size={16} /></button>
                       <button onClick={() => setDeleteConfirm(order.id)} className="action-btn delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      {isNewOrderModalOpen && <NewOrderModal onClose={() => setIsNewOrderModalOpen(false)} onSave={handleCreateOrder} />}
      
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
