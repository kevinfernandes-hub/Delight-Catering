'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Eye, 
  ShoppingBag,
  History,
  TrendingUp,
  X
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/app/components/admin/Toast';
import ConfirmDialog from '@/app/components/admin/ConfirmDialog';

/* eslint-disable @typescript-eslint/no-explicit-any */

const getAvatarColor = (name: string) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#C9A84C'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const CustomerModal = ({ customer, onClose, showToast }: { customer: any, onClose: () => void, showToast: any }) => {
  const totalSpent = customer.orders?.reduce((acc: number, o: any) => acc + o.total_amount, 0) || 0;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             <div style={{ 
               width: '64px', height: '64px', borderRadius: '50%', backgroundColor: getAvatarColor(customer.name),
               display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff'
             }}>
               {customer.name[0].toUpperCase()}
             </div>
             <div>
                <h2 style={{ margin: 0 }}>{customer.name}</h2>
                <p style={{ color: '#64748b', margin: '0.25rem 0 0 0' }}>{customer.email}</p>
             </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <div style={{ padding: '2rem' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="stat-card">
                 <p>Total Orders</p>
                 <h3>{customer.orders?.length || 0}</h3>
              </div>
              <div className="stat-card">
                 <p>Total Spent</p>
                 <h3>{formatCurrency(totalSpent)}</h3>
              </div>
              <div className="stat-card">
                 <p>Member Since</p>
                 <h3>{formatDate(customer.created_at)}</h3>
              </div>
           </div>

           <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} /> Order History
           </h3>
           
           <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead style={{ position: 'sticky', top: 0, backgroundColor: '#1a1a1a' }}>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                       <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem' }}>Event Type</th>
                       <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem' }}>Date</th>
                       <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem' }}>Amount</th>
                       <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem' }}>Status</th>
                    </tr>
                 </thead>
                 <tbody>
                    {(!customer.orders || customer.orders.length === 0) ? (
                       <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No orders found</td></tr>
                    ) : customer.orders.map((order: any) => (
                       <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '1rem' }}>{order.event_type}</td>
                          <td style={{ padding: '1rem' }}>{formatDate(order.event_date)}</td>
                          <td style={{ padding: '1rem' }}>{formatCurrency(order.total_amount)}</td>
                          <td style={{ padding: '1rem' }}>
                             <span style={{ fontSize: '0.75rem', color: '#C9A84C' }}>{order.status}</span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => showToast('Editing is not yet implemented for this beta', 'info')}>Edit Profile</button>
           </div>
        </div>
      </div>
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.5rem; }
        .modal-content { background: #111; border: 1px solid #333; border-radius: 1rem; color: #fff; max-height: 90vh; overflow-y: auto; }
        .stat-card { background: #1a1a1a; padding: 1.25rem; border-radius: 0.75rem; text-align: center; border: 1px solid rgba(255,255,255,0.05); }
        .stat-card p { color: #64748b; font-size: 0.85rem; margin-bottom: 0.5rem; }
        .stat-card h3 { font-size: 1.5rem; color: #C9A84C; margin: 0; }
        .btn-secondary { background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 0.6rem 1.2rem; border-radius: 0.5rem; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { showToast } = useToast();

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/customers/${deleteConfirm}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Customer and all their history deleted', 'success');
        fetchCustomers();
      }
    } catch (error) {
      showToast('Failed to delete customer', 'error');
    }
    setDeleteConfirm(null);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Customer Database</h1>
          <p style={{ color: '#A3A3A3' }}>Your client relationships and their full historical data.</p>
        </div>
        <button className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New Customer
        </button>
      </div>

      <div style={{ marginBottom: '2rem', position: 'relative', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input 
          type="text" 
          placeholder="Search customers by name or email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', backgroundColor: '#111', 
            border: '1px solid #333', borderRadius: '0.5rem', color: '#fff', outline: 'none'
          }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <p style={{ color: '#64748b' }}>Consulting records...</p>
        ) : filteredCustomers.map(customer => {
          const totalSpent = customer.orders?.reduce((acc: number, o: any) => acc + o.total_amount, 0) || 0;
          return (
            <div key={customer.id} className="card customer-card" onClick={() => setSelectedCustomer(customer)}>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '50%', backgroundColor: getAvatarColor(customer.name),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff'
                  }}>
                    {customer.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                     <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{customer.name}</h3>
                     <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>{customer.email}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     <button className="icon-btn" onClick={e => { e.stopPropagation(); showToast('Edit coming soon', 'info'); }}><Edit2 size={14} /></button>
                     <button className="icon-btn delete" onClick={e => { e.stopPropagation(); setDeleteConfirm(customer.id); }}><Trash2 size={14} /></button>
                  </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="mini-stat">
                     <ShoppingBag size={14} color="#64748b" />
                     <span>{customer.orders?.length || 0} Orders</span>
                  </div>
                  <div className="mini-stat">
                     <TrendingUp size={14} color="#10b981" />
                     <span>{formatCurrency(totalSpent)}</span>
                  </div>
               </div>

               <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>- {customer.phone}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}><MapPin size={14} /> {customer.address}</div>
               </div>
               
               <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                  <button className="text-btn">View History <Eye size={14} /></button>
               </div>
            </div>
          );
        })}
      </div>

      {selectedCustomer && <CustomerModal customer={selectedCustomer} showToast={showToast} onClose={() => setSelectedCustomer(null)} />}
      
      <ConfirmDialog 
        isOpen={deleteConfirm !== null}
        title="Permanently Delete Customer?"
        message="This will erase all historical data, order history, and invoices linked to this client. This action is irreversible."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmVariant="danger"
        confirmLabel="Erase Records"
      />

      <style jsx>{`
        .customer-card { cursor: pointer; transition: 0.3s; border: 1px solid rgba(255,255,255,0.05); }
        .customer-card:hover { transform: translateY(-4px); border-color: rgba(201,168,76,0.3); background-color: rgba(255,255,255,0.02); }
        
        .mini-stat { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #fff; }
        .text-btn { background: none; border: none; color: #C9A84C; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }
        
        .icon-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #333; background: #050505; color: #64748b; cursor: pointer; display: flex; alignItems: center; justifyContent: center; }
        .icon-btn:hover { border-color: #C9A84C; color: #C9A84C; }
        .icon-btn.delete:hover { border-color: #ef4444; color: #ef4444; }
        
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
