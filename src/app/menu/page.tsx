'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Minus } from 'lucide-react';

export default function MenuPage() {
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [category, setCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [guestCount, setGuestCount] = useState(10);
    const [ordering, setOrdering] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState<any>(null);

    const categories = ['All', 'Appetizers', 'Mains', 'Sides', 'Desserts', 'Packages'];
    const TAX_RATE = 0.05; // 5% GST

    useEffect(() => {
        Promise.all([
            fetch('/api/menu').then(res => res.json()),
            fetch('/api/packages').then(res => res.json()),
        ])
        .then(([menuData, packagesData]) => {
            setMenuItems(menuData);
            setPackages(packagesData);
            setFilteredItems(menuData);
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (category === 'All') {
            setFilteredItems(menuItems);
        } else {
            setFilteredItems(menuItems.filter(item => item.category === category));
        }
    }, [category, menuItems]);

    const addItem = (itemId: string) => {
        const newMap = new Map(selectedItems);
        newMap.set(itemId, (newMap.get(itemId) || 0) + 1);
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

    const calculateSubtotal = () => {
        return Array.from(selectedItems.entries()).reduce((sum, [itemId, qty]) => {
            const item = menuItems.find(m => m.id === itemId);
            return sum + ((item?.price || 0) * qty);
        }, 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * TAX_RATE;
    };

    const calculatePerPersonTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const calculateFinalTotal = () => {
        return calculatePerPersonTotal() * guestCount;
    };

    const getSelectedItemsCount = () => {
        return Array.from(selectedItems.values()).reduce((sum, qty) => sum + qty, 0);
    };

    const handleConfirmOrder = async () => {
        if (!customerName.trim()) {
            alert('Please enter your name');
            return;
        }
        if (!customerPhone.trim()) {
            alert('Please enter your phone number');
            return;
        }
        if (selectedItems.size === 0) {
            alert('Please select at least one item');
            return;
        }

        try {
            setOrdering(true);
            const items = Array.from(selectedItems.entries()).map(([itemId, qty]) => ({
                menu_id: itemId,
                quantity: qty,
            }));

            // Build items description
            const itemsDescription = Array.from(selectedItems.entries())
                .map(([itemId, qty]) => {
                    const item = menuItems.find(m => m.id === itemId);
                    return `${item?.name} x${qty}`;
                })
                .join(', ');

            const finalTotal = calculateFinalTotal();

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: customerName,
                    customer_email: 'no-email@catering.local',
                    customer_phone: customerPhone,
                    guest_count: guestCount,
                    event_type: 'Custom Menu Order',
                    event_date: new Date().toISOString().split('T')[0],
                    venue: 'TBD',
                    total_amount: finalTotal,
                    notes: `Online menu builder — Items: ${itemsDescription}`,
                    items: items,
                }),
            });

            if (response.ok) {
                const orderData = await response.json();
                setOrderSuccess({
                    orderId: orderData.id,
                    customerName,
                    customerPhone,
                    guestCount,
                    items: itemsDescription,
                    total: finalTotal,
                });
            } else {
                const errorData = await response.json();
                console.error('Order creation error:', errorData);
                alert(`Failed to create order: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Error creating order');
        } finally {
            setOrdering(false);
        }
    };

    const handlePlaceAnotherOrder = () => {
        setSelectedItems(new Map());
        setCustomerName('');
        setCustomerPhone('');
        setGuestCount(10);
        setOrderSuccess(null);
    };

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navigation */}
            <nav style={{ padding: '1rem 5%', background: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', zIndex: 40 }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <a href="/" className="hover-target" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(245,240,232,0.5)', fontSize: '13px', letterSpacing: '1px', textDecoration: 'none', transition: 'color 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(245,240,232,0.5)'}>
                        <ArrowLeft size={16} /> BACK TO HOME
                    </a>
                    <div className="logo">Delight</div>
                    <a href="#cta" className="nav-cta hover-target">Book Now</a>
                </div>
            </nav>

            {/* Two Column Layout */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* LEFT: Menu Area (65%) */}
                <div style={{ flex: '0 0 65%', overflowY: 'auto', paddingTop: '5rem', paddingBottom: '5rem' }}>
                    <div className="container" style={{ maxWidth: '100%' }}>
                        <div className="section-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                            <span className="section-tag">Gourmet Collections</span>
                            <h1 style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', marginBottom: '1rem' }}>Our Culinary <span className="italic-word">Menu</span></h1>
                            <p>Explore our diverse range of offerings, from spicy appetizers to grand wedding packages.</p>
                        </div>

                        {/* Category Filter */}
                        <div className="filter-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: category === cat ? 'var(--color-gold)' : 'var(--color-text-muted)',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        transition: 'var(--transition-fast)',
                                        borderBottom: category === cat ? '2px solid var(--color-gold)' : '2px solid transparent'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-gold)' }}>Loading menu...</div>
                        ) : (
                            <>
                                {/* Pre-made Packages */}
                                {packages.length > 0 && (
                                    <div style={{ marginBottom: '6rem' }}>
                                        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--color-ivory)' }}>Pre-made Packages</h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
                                            {packages.map(pkg => (
                                                <div key={pkg.id} style={{ background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.1) 0%, rgba(201, 168, 76, 0.05) 100%)', padding: '2rem', borderRadius: '4px', border: '1px solid rgba(201, 168, 76, 0.3)', transition: 'var(--transition-normal)' }}>
                                                    <div style={{ marginBottom: '1rem' }}>
                                                        <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>{pkg.category}</span>
                                                    </div>
                                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-gold)' }}>{pkg.name}</h3>
                                                    {pkg.description && (
                                                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{pkg.description}</p>
                                                    )}
                                                    <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.25rem', marginBottom: '1.5rem' }}>
                                                        {pkg.items.map((item: any, idx: number) => (
                                                            <p key={idx} style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: idx < pkg.items.length - 1 ? '0.5rem' : '0' }}>
                                                                • {item.menuItem?.name} × {item.quantity}
                                                            </p>
                                                        ))}
                                                    </div>
                                                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-gold)' }}>₹{pkg.price} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', opacity: 0.7 }}>per guest</span></p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Menu Items Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
                                    {filteredItems.map(item => {
                                        const isSelected = selectedItems.has(item.id);
                                        return (
                                            <div 
                                                key={item.id}
                                                style={{
                                                    background: 'var(--color-surface)',
                                                    padding: '2rem',
                                                    borderRadius: '4px',
                                                    border: isSelected ? '1px solid #C9A84C' : '1px solid rgba(255, 255, 255, 0.03)',
                                                    backgroundColor: isSelected ? 'rgba(201,168,76,0.05)' : 'var(--color-surface)',
                                                    transition: 'var(--transition-normal)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                        <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>{item.category}</span>
                                                        <span style={{ color: 'var(--color-ivory)', fontWeight: 'bold' }}>₹{item.price}</span>
                                                    </div>
                                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-ivory)' }}>{item.name}</h3>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{item.description}</p>
                                                </div>

                                                {/* Add/Remove Buttons */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginTop: '1.5rem',
                                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                                    borderRadius: '0.25rem',
                                                    padding: '0.25rem',
                                                    justifyContent: 'flex-end',
                                                }}>
                                                    {isSelected && (
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#ff6b6b',
                                                                cursor: 'pointer',
                                                                padding: '0.5rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <Minus size={18} />
                                                        </button>
                                                    )}

                                                    {isSelected && (
                                                        <span style={{
                                                            minWidth: '30px',
                                                            textAlign: 'center',
                                                            fontWeight: 'bold',
                                                            color: 'var(--color-gold)',
                                                            fontSize: '0.9rem',
                                                        }}>
                                                            {selectedItems.get(item.id)}
                                                        </span>
                                                    )}

                                                    <button
                                                        onClick={() => addItem(item.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--color-gold)',
                                                            cursor: 'pointer',
                                                            padding: '0.5rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: '1px', background: 'rgba(201,168,76,0.2)' }} />

                {/* RIGHT: Order Sidebar (35%) */}
                <div style={{
                    flex: '0 0 35%',
                    backgroundColor: '#0a0a0a',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: '5rem',
                }}>
                    {orderSuccess ? (
                        // Success Screen
                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
                            <h2 style={{ color: '#C9A84C', fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Order Placed!</h2>
                            
                            <div style={{ backgroundColor: '#1a1a1a', padding: '1.5rem', borderRadius: '0.5rem', width: '100%', marginBottom: '1.5rem', textAlign: 'center' }}>
                                <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Order ID</p>
                                <p style={{ color: '#C9A84C', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>ORD-{orderSuccess.orderId?.slice(0, 8).toUpperCase()}</p>
                                
                                <div style={{ textAlign: 'left', fontSize: '0.9rem', color: '#ccc' }}>
                                    <p><strong>Name:</strong> {orderSuccess.customerName}</p>
                                    <p><strong>Phone:</strong> {orderSuccess.customerPhone}</p>
                                    <p><strong>Guests:</strong> {orderSuccess.guestCount}</p>
                                    <p style={{ marginTop: '1rem', borderTop: '1px solid #333', paddingTop: '1rem' }}><strong>Items:</strong><br/>{orderSuccess.items}</p>
                                    <p style={{ marginTop: '1rem', color: '#C9A84C', fontSize: '1.1rem', fontWeight: 'bold' }}><strong>Total:</strong> ₹{orderSuccess.total.toFixed(0)}</p>
                                </div>
                            </div>

                            <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>Our team will contact you shortly.</p>

                            <button
                                onClick={handlePlaceAnotherOrder}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: '#C9A84C',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                }}
                            >
                                Place Another Order
                            </button>
                        </div>
                    ) : (
                        // Order Form
                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                            <h3 style={{ color: '#C9A84C', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                Your Order {selectedItems.size > 0 && `(${getSelectedItemsCount()} items)`}
                            </h3>

                            {selectedItems.size === 0 ? (
                                // Empty State
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🍽️</div>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Your order is empty</p>
                                    <p style={{ fontSize: '0.85rem', textAlign: 'center' }}>Add dishes from the menu to get started</p>
                                </div>
                            ) : (
                                <>
                                    {/* Selected Items List */}
                                    <div style={{ marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto', paddingBottom: '1rem', borderBottom: '1px solid #333' }}>
                                        {Array.from(selectedItems.entries()).map(([itemId, qty]) => {
                                            const item = menuItems.find(m => m.id === itemId);
                                            if (!item) return null;
                                            return (
                                                <div key={itemId} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    paddingBottom: '0.75rem',
                                                    marginBottom: '0.75rem',
                                                    borderBottom: '1px solid #444',
                                                    fontSize: '0.9rem',
                                                }}>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontWeight: 'bold', color: '#fff', margin: '0 0 0.25rem 0' }}>{item.name}</p>
                                                        <p style={{ color: '#999', margin: 0 }}>₹{item.price} × {qty}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        style={{
                                                            background: '#ff6b6b',
                                                            border: 'none',
                                                            color: '#fff',
                                                            cursor: 'pointer',
                                                            width: '24px',
                                                            height: '24px',
                                                            borderRadius: '0.25rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        −
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Guest Count Stepper */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#C9A84C', marginBottom: '0.75rem', fontWeight: 'bold' }}>
                                            Number of People
                                        </label>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            border: '1px solid #C9A84C',
                                            borderRadius: '0.5rem',
                                            padding: '0.5rem',
                                            backgroundColor: '#0a0a0a',
                                            justifyContent: 'center',
                                        }}>
                                            <button
                                                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#C9A84C',
                                                    cursor: 'pointer',
                                                    fontSize: '1.2rem',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                −
                                            </button>
                                            <div style={{ minWidth: '50px', textAlign: 'center', color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>
                                                {guestCount}
                                            </div>
                                            <button
                                                onClick={() => setGuestCount(guestCount + 1)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#C9A84C',
                                                    cursor: 'pointer',
                                                    fontSize: '1.2rem',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#C9A84C', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Enter name"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                backgroundColor: '#0a0a0a',
                                                border: '1px solid #333',
                                                borderRadius: '0.25rem',
                                                color: '#fff',
                                                fontSize: '0.9rem',
                                                marginBottom: '1rem',
                                                boxSizing: 'border-box',
                                            }}
                                        />

                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#C9A84C', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="98XXXXXXXX"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                backgroundColor: '#0a0a0a',
                                                border: '1px solid #333',
                                                borderRadius: '0.25rem',
                                                color: '#fff',
                                                fontSize: '0.9rem',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>

                                    {/* Price Breakdown */}
                                    <div style={{
                                        backgroundColor: '#1a1a1a',
                                        padding: '1rem',
                                        borderRadius: '0.5rem',
                                        marginBottom: '1.5rem',
                                        fontSize: '0.9rem',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#ccc' }}>
                                            <span>Per person:</span>
                                            <span>₹{calculateSubtotal().toFixed(0)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#999', fontSize: '0.85rem' }}>
                                            <span>GST (5%):</span>
                                            <span>₹{calculateTax().toFixed(0)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#999', fontSize: '0.85rem', paddingBottom: '0.75rem', borderBottom: '1px solid #333' }}>
                                            <span>Per person total:</span>
                                            <span>₹{calculatePerPersonTotal().toFixed(0)}</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontWeight: 'bold',
                                            color: '#C9A84C',
                                            fontSize: '1rem',
                                        }}>
                                            <span>Total ({guestCount}):</span>
                                            <span>₹{calculateFinalTotal().toFixed(0)}</span>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <button
                                        onClick={handleConfirmOrder}
                                        disabled={ordering}
                                        style={{
                                            width: '100%',
                                            height: '52px',
                                            padding: '1rem',
                                            backgroundColor: '#C9A84C',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            cursor: ordering ? 'not-allowed' : 'pointer',
                                            fontWeight: 600,
                                            fontSize: '15px',
                                            marginBottom: '0.5rem',
                                            opacity: ordering ? 0.7 : 1,
                                        }}
                                    >
                                        {ordering ? 'Creating...' : 'Confirm Order'}
                                    </button>

                                    <button
                                        onClick={() => setSelectedItems(new Map())}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            backgroundColor: 'transparent',
                                            color: '#ef4444',
                                            border: '1px solid rgba(239,68,68,0.4)',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#ef4444';
                                            e.currentTarget.style.color = '#fff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#ef4444';
                                        }}
                                    >
                                        Clear
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <footer style={{ marginTop: '0', backgroundColor: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container">
                    <div className="footer-bottom" style={{ border: 'none', padding: '2rem' }}>
                        <p>&copy; 2026 Delight Caterers. Excellence in every bite.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
