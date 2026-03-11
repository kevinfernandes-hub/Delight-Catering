'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Filter } from 'lucide-react';

export default function MenuPage() {
    const [items, setItems] = useState<any[]>([]);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [category, setCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    const categories = ['All', 'Appetizers', 'Mains', 'Sides', 'Desserts', 'Packages'];

    useEffect(() => {
        fetch('/api/menu')
            .then(res => res.json())
            .then(data => {
                setItems(data);
                setFilteredItems(data);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (category === 'All') {
            setFilteredItems(items);
        } else {
            setFilteredItems(items.filter(item => item.category === category));
        }
    }, [category, items]);

    return (
        <div className="menu-page-wrapper" style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '10rem 0 5rem' }}>
            <nav style={{ padding: '1rem 5%', background: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <a href="/" className="hover-target" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                        <ArrowLeft size={16} /> Back to Home
                    </a>
                    <div className="logo">Delight</div>
                    <a href="#cta" className="nav-cta hover-target">Book Now</a>
                </div>
            </nav>

            <div className="container">
                <div className="section-header" style={{ textAlign: 'left', marginBottom: '3rem' }}>
                    <span className="section-tag">Gourmet Collections</span>
                    <h1 style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', marginBottom: '1rem' }}>Our Culinary <span className="italic-word">Menu</span></h1>
                    <p>Explore our diverse range of offerings, from spicy appetizers to grand wedding packages.</p>
                </div>

                <div className="filter-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`hover-target ${category === cat ? 'active' : ''}`}
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
                    <div className="menu-items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
                        {filteredItems.map(item => (
                            <div key={item.id} className="menu-item-card" style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.03)', transition: 'var(--transition-normal)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>{item.category}</span>
                                    <span style={{ color: 'var(--color-ivory)', fontWeight: 'bold' }}>₹{item.price} <small style={{ fontWeight: 'normal', opacity: 0.6, fontSize: '0.7rem' }}>{item.unit}</small></span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-ivory)' }}>{item.name}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{item.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <footer style={{ marginTop: '8rem' }}>
                <div className="container">
                    <div className="footer-bottom" style={{ border: 'none' }}>
                        <p>&copy; 2026 Delight Caterers. Excellence in every bite.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
