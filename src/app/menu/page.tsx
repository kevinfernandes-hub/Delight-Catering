'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

type PackageItem = {
  id: string;
  quantity: number;
  menuItem?: {
    name: string;
  };
};

type MenuPackage = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  items: PackageItem[];
  active: boolean;
};

const fallbackPackages: MenuPackage[] = [
  {
    id: 'normal',
    name: 'Normal Package',
    description: 'Simple catering option for small events.',
    price: 200,
    category: 'Normal',
    items: [],
    active: true,
  },
  {
    id: 'basic',
    name: 'Basic Package',
    description: 'Balanced package with better variety and service.',
    price: 250,
    category: 'Basic',
    items: [],
    active: true,
  },
  {
    id: 'special',
    name: 'Special Package',
    description: 'Enhanced menu spread for mid-size celebrations.',
    price: 330,
    category: 'Special',
    items: [],
    active: true,
  },
  {
    id: 'silver',
    name: 'Silver Package',
    description: 'Premium package for weddings and major family events.',
    price: 400,
    category: 'Silver',
    items: [],
    active: true,
  },
  {
    id: 'gold',
    name: 'Gold Package',
    description: 'Top-tier package with premium dishes and presentation.',
    price: 500,
    category: 'Gold',
    items: [],
    active: true,
  },
  {
    id: 'platinum',
    name: 'Platinum Package',
    description: 'Luxury package with the widest range and priority service.',
    price: 600,
    category: 'Platinum',
    items: [],
    active: true,
  },
  {
    id: 'customized',
    name: 'Customized Package',
    description: 'Tailor-made menus and premium service, priced higher based on your requirements.',
    price: 750,
    category: 'Customized',
    items: [],
    active: true,
  },
];

export default function MenuPage() {
  const [packages, setPackages] = useState<MenuPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<MenuPackage | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [guestCount, setGuestCount] = useState(50);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages');
        if (!response.ok) {
          throw new Error('Failed to load packages');
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setPackages(data.filter((pkg: MenuPackage) => pkg.active !== false));
        } else {
          setPackages(fallbackPackages);
        }
      } catch {
        setPackages(fallbackPackages);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => a.price - b.price);
  }, [packages]);

  const closeForm = () => {
    setSelectedPackage(null);
    setCustomerName('');
    setCustomerPhone('');
    setGuestCount(50);
  };

  const handlePackageSelect = (pkg: MenuPackage) => {
    setSuccessMessage('');
    setSelectedPackage(pkg);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPackage) return;
    if (!customerName.trim() || !customerPhone.trim() || guestCount < 1) {
      alert('Please enter name, phone number, and people count.');
      return;
    }

    const subtotal = selectedPackage.price * guestCount;
    const taxRate = 0.05;
    const taxAmount = subtotal * taxRate;
    const totalPrice = subtotal + taxAmount;

    const payload = {
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      guest_count: guestCount,
      subtotal,
      tax_amount: taxAmount,
      total_price: totalPrice,
      items: {
        package: {
          id: selectedPackage.id,
          name: selectedPackage.name,
          category: selectedPackage.category,
          per_plate_price: selectedPackage.price,
        },
        customer_phone: customerPhone.trim(),
      },
    };

    try {
      setSubmitting(true);
      const response = await fetch('/api/menu-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit package request');
      }

      setSuccessMessage('Your package request was sent successfully. Our admin team will contact you soon.');
      closeForm();
    } catch {
      alert('Could not submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      <nav style={{ padding: '1rem 5%', background: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" className="hover-target" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(245,240,232,0.7)', fontSize: '13px', letterSpacing: '1px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> BACK TO HOME
          </a>
          <div className="logo">Delight</div>
          <a href="/contact" className="nav-cta hover-target">Enquire Now</a>
        </div>
      </nav>

      <section style={{ padding: '4rem 5% 5rem' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <span className="section-tag">Catering Packages</span>
            <h1 style={{ fontSize: 'clamp(2.3rem, 4vw, 4rem)', marginBottom: '1rem' }}>
              Normal to Customized Packages
            </h1>
            <p>
              We provide package-based catering with clear per plate pricing.
              Choose a tier that fits your event and guest count.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-gold)' }}>Loading packages...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {sortedPackages.map((pkg) => (
                <div key={pkg.id} style={{ border: '1px solid rgba(201, 168, 76, 0.35)', borderRadius: '0.5rem', padding: '1.5rem', background: 'rgba(201, 168, 76, 0.06)' }}>
                  <p style={{ margin: 0, color: 'var(--color-gold)', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    {pkg.category}
                  </p>
                  <h3 style={{ margin: '0.6rem 0 0.5rem', color: 'var(--color-ivory)', fontSize: '1.4rem' }}>{pkg.name}</h3>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', minHeight: '2.5rem' }}>
                    {pkg.description || 'Package menu available on enquiry.'}
                  </p>

                  {pkg.items?.length > 0 && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.35rem', backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
                      {pkg.items.slice(0, 5).map((item) => (
                        <p key={item.id} style={{ margin: '0 0 0.35rem 0', fontSize: '0.85rem', color: '#d8d8d8' }}>
                          • {item.menuItem?.name || 'Menu item'} x {item.quantity}
                        </p>
                      ))}
                    </div>
                  )}

                  <p style={{ margin: 0, color: 'var(--color-gold)', fontWeight: 700, fontSize: '1.5rem' }}>
                    Starting from INR {pkg.category === 'Customized' ? `${pkg.price}+` : pkg.price}
                    <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.8 }}> / plate</span>
                  </p>
                  <button
                    onClick={() => handlePackageSelect(pkg)}
                    style={{
                      marginTop: '1rem',
                      width: '100%',
                      padding: '0.7rem 1rem',
                      borderRadius: '0.4rem',
                      border: 'none',
                      backgroundColor: '#C9A84C',
                      color: '#121212',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Select This Package
                  </button>
                </div>
              ))}
            </div>
          )}

          {successMessage && (
            <div style={{ marginTop: '1rem', padding: '0.9rem 1rem', borderRadius: '0.4rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#98f0c0' }}>
              {successMessage}
            </div>
          )}
        </div>
      </section>

      {selectedPackage && (
        <div
          onClick={closeForm}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#141414',
              border: '1px solid rgba(201, 168, 76, 0.35)',
              borderRadius: '0.6rem',
              padding: '1.2rem',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', color: '#fff' }}>Book {selectedPackage.name}</h3>
            <p style={{ margin: '0 0 1rem', color: '#bbb' }}>
              Fill your details. This request will be sent to our admin team.
            </p>

            <form onSubmit={handleSubmitOrder}>
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  style={{ padding: '0.75rem', borderRadius: '0.4rem', border: '1px solid #333', backgroundColor: '#1f1f1f', color: '#fff' }}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  style={{ padding: '0.75rem', borderRadius: '0.4rem', border: '1px solid #333', backgroundColor: '#1f1f1f', color: '#fff' }}
                />
                <input
                  type="number"
                  min={1}
                  placeholder="Number of People"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                  required
                  style={{ padding: '0.75rem', borderRadius: '0.4rem', border: '1px solid #333', backgroundColor: '#1f1f1f', color: '#fff' }}
                />
              </div>

              <div style={{ marginTop: '1rem', color: '#C9A84C', fontWeight: 600 }}>
                Final quote will be shared after confirmation based on your requirements.
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeForm}
                  style={{ padding: '0.65rem 1rem', borderRadius: '0.4rem', border: '1px solid #444', backgroundColor: '#222', color: '#ddd', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.65rem 1rem', borderRadius: '0.4rem', border: 'none', backgroundColor: '#C9A84C', color: '#111', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                >
                  {submitting ? 'Sending...' : 'Send to Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
