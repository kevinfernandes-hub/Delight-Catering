'use client';

import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

interface CustomMenuBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onBuild: (items: any[], totalPrice: number, customerName: string, guestCount: number) => void;
}

export default function CustomMenuBuilder({ isOpen, onClose, menuItems, onBuild }: CustomMenuBuilderProps) {
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [category, setCategory] = useState('All');
  const [customerName, setCustomerName] = useState('');
  const [guestCount, setGuestCount] = useState(1);

  const categories = ['All', 'Appetizers', 'Mains', 'Sides', 'Desserts', 'Packages'];
  const filteredItems = category === 'All' ? menuItems : menuItems.filter(m => m.category === category);

  const addItem = (itemId: string, price: number) => {
    const newMap = new Map(selectedItems);
    const currentQty = newMap.get(itemId) || 0;
    newMap.set(itemId, currentQty + 1);
    setSelectedItems(newMap);
  };

  const removeItem = (itemId: string) => {
    const newMap = new Map(selectedItems);
    const currentQty = newMap.get(itemId) || 0;
    if (currentQty > 1) {
      newMap.set(itemId, currentQty - 1);
    } else {
      newMap.delete(itemId);
    }
    setSelectedItems(newMap);
  };

  const calculateTotal = () => {
    return Array.from(selectedItems.entries()).reduce((sum, [itemId, qty]) => {
      const item = menuItems.find(m => m.id === itemId);
      return sum + ((item?.price || 0) * qty);
    }, 0);
  };

  const handleBuild = () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (guestCount < 1) {
      alert('Guest count must be at least 1');
      return;
    }

    const items = Array.from(selectedItems.entries()).map(([itemId, qty]) => ({
      menu_id: itemId,
      quantity: qty,
    }));

    const totalPrice = (calculateTotal() * 1.08) * guestCount; // Total with tax × guest count
    onBuild(items, totalPrice, customerName, guestCount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        backgroundColor: '#0a0a0a',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '900px',
        width: '95%',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: '#fff',
        border: '1px solid rgba(201, 168, 76, 0.2)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(201, 168, 76, 0.3)',
          paddingBottom: '1rem',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Build Your Custom Menu</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#C9A84C',
              cursor: 'pointer',
              fontSize: '1.5rem',
            }}
          >
            <X size={28} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', height: 'calc(90vh - 150px)' }}>
          {/* Menu Items List - LEFT SIDE (LARGER) */}
          <div style={{ overflowY: 'auto', paddingRight: '1rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#C9A84C' }}>Select Items</h3>

            {/* Category Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
            }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: category === cat ? '#C9A84C' : '#1a1a1a',
                    color: category === cat ? '#000' : '#C9A84C',
                    border: '1px solid #C9A84C',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{item.name}</p>
                    {item.description && (
                      <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem' }}>
                        {item.description}
                      </p>
                    )}
                    <p style={{ color: '#C9A84C', fontWeight: 'bold' }}>
                      ₹{item.price}
                    </p>
                  </div>

                  {/* Add/Remove Buttons */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#0a0a0a',
                    borderRadius: '0.25rem',
                    padding: '0.25rem',
                  }}>
                    {selectedItems.has(item.id) && (
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff6b6b',
                          cursor: 'pointer',
                          padding: '0.25rem',
                        }}
                      >
                        <Minus size={18} />
                      </button>
                    )}

                    {selectedItems.has(item.id) && (
                      <span style={{
                        minWidth: '30px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#C9A84C',
                      }}>
                        {selectedItems.get(item.id)}
                      </span>
                    )}

                    <button
                      onClick={() => addItem(item.id, item.price)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#C9A84C',
                        cursor: 'pointer',
                        padding: '0.25rem',
                      }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selector & Summary - RIGHT SIDE (COMPACT) */}
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            height: 'fit-content',
            position: 'sticky',
            top: '20px',
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#C9A84C', fontSize: '1.1rem' }}>Order Details</h3>

            {/* Customer Name Input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#C9A84C', marginBottom: '0.5rem' }}>
                Your Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Guest Count Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#C9A84C', marginBottom: '0.5rem' }}>
                Number of People
              </label>
              <input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Summary */}
            <div style={{
              borderTop: '1px solid #333',
              paddingTop: '1rem',
              marginBottom: '1.5rem',
            }}>
              <h4 style={{ marginBottom: '1rem', color: '#C9A84C', fontSize: '0.95rem' }}>Menu Items</h4>
              
              {selectedItems.size === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '1rem 0', fontSize: '0.9rem' }}>
                  No items selected
                </p>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}>
                  {Array.from(selectedItems.entries()).map(([itemId, qty]) => {
                    const item = menuItems.find(m => m.id === itemId);
                    return (
                      <div key={itemId} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid #333',
                        fontSize: '0.85rem',
                      }}>
                        <span>
                          {item?.name} <span style={{ color: '#999' }}>×{qty}</span>
                        </span>
                        <span style={{ color: '#C9A84C', fontWeight: 'bold' }}>
                          ₹{((item?.price || 0) * qty).toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Calculation */}
            <div style={{
              backgroundColor: '#0a0a0a',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
                fontSize: '0.85rem',
              }}>
                <span>Per Person:</span>
                <span>₹{calculateTotal().toFixed(0)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
                fontSize: '0.85rem',
                color: '#999',
              }}>
                <span>Tax (8%):</span>
                <span>₹{(calculateTotal() * 0.08).toFixed(0)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
                fontSize: '0.85rem',
                color: '#999',
              }}>
                <span>Per Person Total:</span>
                <span>₹{(calculateTotal() * 1.08).toFixed(0)}</span>
              </div>
              <div style={{
                borderTop: '1px solid #333',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#C9A84C',
              }}>
                <span>Total ({guestCount} people):</span>
                <span>₹{(calculateTotal() * 1.08 * guestCount).toFixed(0)}</span>
              </div>
            </div>

            <button
              onClick={handleBuild}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: '#C9A84C',
                color: '#000',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                marginBottom: '0.5rem',
              }}
            >
              Confirm Menu
            </button>

            <button
              onClick={() => {
                setSelectedItems(new Map());
                setCustomerName('');
                setGuestCount(1);
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'transparent',
                color: '#999',
                border: '1px solid #999',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
