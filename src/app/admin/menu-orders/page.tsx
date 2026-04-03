'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Trash2, Loader2, Pencil } from 'lucide-react';
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

interface ParsedMenuOrderPayload {
  package?: {
    name?: string;
    category?: string;
    per_plate_price?: number;
  };
  customer_phone?: string;
}

export default function MenuOrdersPage() {
  const [orders, setOrders] = useState<MenuOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MenuOrder | null>(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [pricingOrder, setPricingOrder] = useState<MenuOrder | null>(null);
  const [priceForm, setPriceForm] = useState({ subtotal: '', tax_amount: '', total_price: '' });
  const [priceSaving, setPriceSaving] = useState(false);
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

  const handleEditPricing = (order: MenuOrder) => {
    const computedTotal = Number(order.subtotal) + Number(order.tax_amount);
    setPricingOrder(order);
    setPriceForm({
      subtotal: String(order.subtotal),
      tax_amount: String(order.tax_amount),
      total_price: String(computedTotal),
    });
    setShowPriceModal(true);
  };

  const updatePricingField = (field: 'subtotal' | 'tax_amount', value: string) => {
    setPriceForm(prev => {
      const next = { ...prev, [field]: value };
      const subtotal = Number(next.subtotal) || 0;
      const tax = Number(next.tax_amount) || 0;
      return {
        ...next,
        total_price: String(subtotal + tax),
      };
    });
  };

  const closePriceModal = () => {
    setShowPriceModal(false);
    setPricingOrder(null);
    setPriceForm({ subtotal: '', tax_amount: '', total_price: '' });
  };

  const handleSavePricing = async () => {
    if (!pricingOrder) return;

    const subtotal = Number(priceForm.subtotal);
    const tax_amount = Number(priceForm.tax_amount);
    const total_price = Number(priceForm.total_price);

    if (!Number.isFinite(subtotal) || !Number.isFinite(tax_amount) || !Number.isFinite(total_price)) {
      showToast('Please enter valid numeric values', 'error');
      return;
    }

    try {
      setPriceSaving(true);
      const response = await fetch(`/api/menu-orders/${pricingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtotal, tax_amount, total_price }),
      });

      if (!response.ok) {
        showToast('Failed to update pricing', 'error');
        return;
      }

      const updated = await response.json();
      setOrders(prev => prev.map(o => (o.id === pricingOrder.id ? updated : o)));
      showToast('Pricing updated successfully', 'success');
      closePriceModal();
    } catch (error) {
      console.error('Error updating pricing:', error);
      showToast('Failed to update pricing', 'error');
    } finally {
      setPriceSaving(false);
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
                {(() => {
                  const parsed = parseItems(order.items) as ParsedMenuOrderPayload | any[];
                  const phone = Array.isArray(parsed) ? '' : parsed.customer_phone || '';
                  return (
                    <>
                <div>
                  <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.25rem' }}>CUSTOMER</p>
                  <p style={{ fontWeight: 'bold', color: '#fff' }}>{order.customer_name}</p>
                  {phone && <p style={{ color: '#bbb', fontSize: '0.82rem', marginTop: '0.2rem' }}>{phone}</p>}
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
                  <button
                    onClick={() => handleEditPricing(order)}
                    title="Edit Pricing"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C9A84C',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Pencil size={16} />
                  </button>
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
                    </>
                  );
                })()}
              </div>

              {/* Items Breakdown */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
                <p style={{ color: '#C9A84C', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 'bold' }}>PACKAGE DETAILS:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  {(() => {
                    const parsed = parseItems(order.items) as ParsedMenuOrderPayload | any[];

                    if (!Array.isArray(parsed) && parsed.package) {
                      return (
                        <>
                          <span style={{ backgroundColor: '#0a0a0a', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.85rem', color: '#ccc' }}>
                            Package: {parsed.package.name || 'Custom Package'}
                          </span>
                          <span style={{ backgroundColor: '#0a0a0a', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.85rem', color: '#ccc' }}>
                            Tier: {parsed.package.category || 'N/A'}
                          </span>
                          <span style={{ backgroundColor: '#0a0a0a', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.85rem', color: '#ccc' }}>
                            Per Plate: ₹{parsed.package.per_plate_price || 0}
                          </span>
                        </>
                      );
                    }

                    return (Array.isArray(parsed) ? parsed : []).map((item: any, idx: number) => (
                      <span key={idx} style={{
                        backgroundColor: '#0a0a0a',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.85rem',
                        color: '#ccc',
                      }}>
                        Item × {item.quantity}
                      </span>
                    ));
                  })()}
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

      {showPriceModal && pricingOrder && (
        <div
          onClick={closePriceModal}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '0.6rem',
              padding: '1rem',
            }}
          >
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '0.4rem' }}>Edit Pricing</h3>
            <p style={{ color: '#999', marginTop: 0, marginBottom: '1rem', fontSize: '0.9rem' }}>
              {pricingOrder.customer_name} ({pricingOrder.guest_count} people)
            </p>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceForm.subtotal}
                onChange={(e) => updatePricingField('subtotal', e.target.value)}
                placeholder="Subtotal"
                style={{ padding: '0.7rem', borderRadius: '0.4rem', border: '1px solid #444', backgroundColor: '#111', color: '#fff' }}
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceForm.tax_amount}
                onChange={(e) => updatePricingField('tax_amount', e.target.value)}
                placeholder="Tax amount"
                style={{ padding: '0.7rem', borderRadius: '0.4rem', border: '1px solid #444', backgroundColor: '#111', color: '#fff' }}
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceForm.total_price}
                readOnly
                placeholder="Total price"
                style={{ padding: '0.7rem', borderRadius: '0.4rem', border: '1px solid #444', backgroundColor: '#0d0d0d', color: '#C9A84C' }}
              />
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                onClick={closePriceModal}
                style={{ padding: '0.6rem 0.9rem', borderRadius: '0.4rem', border: '1px solid #444', backgroundColor: '#222', color: '#ddd', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePricing}
                disabled={priceSaving}
                style={{ padding: '0.6rem 0.9rem', borderRadius: '0.4rem', border: 'none', backgroundColor: '#C9A84C', color: '#111', cursor: priceSaving ? 'not-allowed' : 'pointer', fontWeight: 700 }}
              >
                {priceSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
