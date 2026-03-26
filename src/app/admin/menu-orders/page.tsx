'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Trash2, Loader2, ChevronRight } from 'lucide-react';
import { useToast } from '@/app/components/admin/Toast';
import ConfirmDialog from '@/app/components/admin/ConfirmDialog';

interface MenuOrder {
  id: string;
  customer_name: string;
  guest_count: number;
  items: string;
  subtotal: number;
  tax_amount: number;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function MenuOrdersPage() {
  const [orders, setOrders] = useState<MenuOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MenuOrder | null>(null);
  const { showToast } = useToast();

  const statusColors: Record<string, string> = {
    'Pending': '#FFA500',
    'Confirmed': '#4CAF50',
    'Rejected': '#FF6B6B',
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menu-orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/menu-orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        showToast(`Order ${newStatus.toLowerCase()}`, 'success');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Failed to update order', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/menu-orders/${selectedOrder.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrders(orders.filter(o => o.id !== selectedOrder.id));
        showToast('Order deleted', 'success');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast('Failed to delete order', 'error');
    } finally {
      setShowConfirm(false);
      setSelectedOrder(null);
    }
  };

  const parseItems = (itemsJson: string) => {
    try {
      return JSON.parse(itemsJson);
    } catch {
      return [];
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff' }}>
          Custom Menu Orders
        </h1>
        <p style={{ color: '#999' }}>Pending orders from the Menu Builder</p>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid #333',
        paddingBottom: '1rem',
        flexWrap: 'wrap',
      }}>
        {['All', 'Pending', 'Confirmed', 'Rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: filter === status ? '#C9A84C' : 'transparent',
              color: filter === status ? '#000' : '#999',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#C9A84C' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: '1rem' }}>Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: '#1a1a1a',
          borderRadius: '0.5rem',
          border: '1px solid #333',
          color: '#999',
        }}>
          <p>No {filter !== 'All' ? filter.toLowerCase() : ''} orders found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredOrders.map(order => (
            <div
              key={order.id}
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '0.5rem',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 200px', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.25rem' }}>CUSTOMER</p>
                  <p style={{ fontWeight: 'bold', color: '#fff' }}>{order.customer_name}</p>
                </div>
                <div>
                  <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.25rem' }}>GUESTS</p>
                  <p style={{ fontWeight: 'bold', color: '#C9A84C' }}>{order.guest_count} people</p>
                </div>
                <div>
                  <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.25rem' }}>TOTAL PRICE</p>
                  <p style={{ fontWeight: 'bold', color: '#C9A84C' }}>₹{order.total_price.toFixed(0)}</p>
                </div>
                <div>
                  <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.25rem' }}>STATUS</p>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    backgroundColor: statusColors[order.status] + '20',
                    color: statusColors[order.status],
                    borderRadius: '0.25rem',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                  }}>
                    {order.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  {order.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(order.id, 'Confirmed')}
                        title="Confirm Order"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4CAF50',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'Rejected')}
                        title="Reject Order"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#FF6B6B',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowConfirm(true);
                    }}
                    title="Delete Order"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#FF6B6B',
                      cursor: 'pointer',
                      padding: '0.5rem',
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Items Breakdown */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
                <p style={{ color: '#C9A84C', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 'bold' }}>SELECTED ITEMS:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  {parseItems(order.items).map((item: any, idx: number) => (
                    <span key={idx} style={{
                      backgroundColor: '#0a0a0a',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.85rem',
                      color: '#ccc',
                    }}>
                      Item × {item.quantity}
                    </span>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <p style={{ color: '#999', marginBottom: '0.25rem' }}>Subtotal:</p>
                    <p style={{ fontWeight: 'bold', color: '#fff' }}>₹{order.subtotal.toFixed(0)}</p>
                  </div>
                  <div>
                    <p style={{ color: '#999', marginBottom: '0.25rem' }}>Tax (8%):</p>
                    <p style={{ fontWeight: 'bold', color: '#fff' }}>₹{order.tax_amount.toFixed(0)}</p>
                  </div>
                  <div>
                    <p style={{ color: '#999', marginBottom: '0.25rem' }}>Total:</p>
                    <p style={{ fontWeight: 'bold', color: '#C9A84C', fontSize: '1rem' }}>₹{order.total_price.toFixed(0)}</p>
                  </div>
                </div>

                {/* Date */}
                <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '1rem' }}>
                  Created: {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Order"
        message={`Are you sure you want to delete this custom menu order from ${selectedOrder?.customer_name}?`}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowConfirm(false);
          setSelectedOrder(null);
        }}
        confirmVariant='danger'
        confirmLabel='Delete'
      />
    </div>
  );
}
