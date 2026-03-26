'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Check } from 'lucide-react';
import { useToast } from '@/app/components/admin/Toast';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface PackageItem {
  menu_id: string;
  menuItem?: MenuItem;
  quantity: number;
}

interface MenuPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  items: PackageItem[];
  active: boolean;
}

export default function AdminPackages() {
  const { showToast } = useToast();
  const [packages, setPackages] = useState<MenuPackage[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<MenuPackage | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Gold',
    items: [] as PackageItem[],
  });

  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemQty, setSelectedItemQty] = useState(1);

  const categories = ['Gold', 'Silver', 'Platinum', 'Custom', 'Wedding', 'Corporate', 'Birthday'];

  // Fetch packages and menu items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packagesRes, menuRes] = await Promise.all([
          fetch('/api/packages'),
          fetch('/api/menu'),
        ]);

        if (packagesRes.ok) setPackages(await packagesRes.json());
        if (menuRes.ok) setMenuItems(await menuRes.json());
      } catch (error) {
        showToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddItem = () => {
    if (!selectedItemId) {
      showToast('Select a menu item first', 'error');
      return;
    }

    const menuItem = menuItems.find(m => m.id === selectedItemId);
    if (!menuItem) return;

    const alreadyExists = formData.items.find(i => i.menu_id === selectedItemId);
    if (alreadyExists) {
      setFormData({
        ...formData,
        items: formData.items.map(i =>
          i.menu_id === selectedItemId
            ? { ...i, quantity: i.quantity + selectedItemQty }
            : i
        ),
      });
    } else {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          { menu_id: selectedItemId, menuItem, quantity: selectedItemQty },
        ],
      });
    }

    setSelectedItemId('');
    setSelectedItemQty(1);
  };

  const handleRemoveItem = (menuId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(i => i.menu_id !== menuId),
    });
  };

  const handleSavePackage = async () => {
    if (!formData.name || !formData.price || formData.items.length === 0) {
      showToast('Fill all required fields and add items', 'error');
      return;
    }

    setFormLoading(true);
    try {
      const method = editingPackage ? 'PUT' : 'POST';
      const url = editingPackage ? `/api/packages/${editingPackage.id}` : '/api/packages';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          items: formData.items.map(i => ({
            menu_id: i.menu_id,
            quantity: i.quantity,
          })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (editingPackage) {
          setPackages(packages.map(p => (p.id === result.id ? result : p)));
        } else {
          setPackages([result, ...packages]);
        }
        showToast(editingPackage ? 'Package updated' : 'Package created', 'success');
        resetForm();
      } else {
        showToast('Failed to save package', 'error');
      }
    } catch (error) {
      showToast('Error saving package', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Delete this package?')) return;

    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setPackages(packages.filter(p => p.id !== id));
        showToast('Package deleted', 'success');
      }
    } catch (error) {
      showToast('Failed to delete package', 'error');
    }
  };

  const handleEditPackage = (pkg: MenuPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price.toString(),
      category: pkg.category,
      items: pkg.items,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: 'Gold', items: [] });
    setEditingPackage(null);
    setShowForm(false);
    setSelectedItemId('');
    setSelectedItemQty(1);
  };

  const calculatePackagePrice = () => {
    return formData.items.reduce((sum, item) => {
      return sum + ((item.menuItem?.price || 0) * item.quantity);
    }, 0);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Menu Packages</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#C9A84C',
            color: '#000',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          <Plus size={20} /> Create Package
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            color: '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingPackage ? 'Edit Package' : 'Create Package'}</h2>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Name */}
              <input
                type="text"
                placeholder="Package Name (e.g., Gold Wedding)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#222',
                  border: '1px solid #444',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />

              {/* Description */}
              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#222',
                  border: '1px solid #444',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  minHeight: '80px',
                  fontFamily: 'inherit',
                }}
              />

              {/* Category */}
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#222',
                  border: '1px solid #444',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Price */}
              <input
                type="number"
                placeholder="Price Per Guest/Serving"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                step="10"
                min="0"
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#222',
                  border: '1px solid #444',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />

              {/* Add Items */}
              <div style={{ backgroundColor: '#222', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #444' }}>
                <p style={{ marginBottom: '0.75rem', fontWeight: 'bold' }}>Add Menu Items</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: '#111',
                      border: '1px solid #444',
                      borderRadius: '0.25rem',
                      color: '#fff',
                    }}
                  >
                    <option value="">Select item...</option>
                    {menuItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} (₹{item.price})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={selectedItemQty}
                    onChange={(e) => setSelectedItemQty(parseInt(e.target.value) || 1)}
                    style={{
                      width: '60px',
                      padding: '0.5rem',
                      backgroundColor: '#111',
                      border: '1px solid #444',
                      borderRadius: '0.25rem',
                      color: '#fff',
                    }}
                  />
                  <button
                    onClick={handleAddItem}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#C9A84C',
                      color: '#000',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    Add
                  </button>
                </div>

                {/* Selected Items */}
                {formData.items.length > 0 && (
                  <div style={{ backgroundColor: '#111', padding: '0.75rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>
                    {formData.items.map(item => (
                      <div key={item.menu_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid #333' }}>
                        <span>
                          {item.menuItem?.name} × {item.quantity}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.menu_id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff6b6b',
                            cursor: 'pointer',
                          }}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSavePackage}
                disabled={formLoading}
                style={{
                  padding: '0.75rem',
                  backgroundColor: formLoading ? '#666' : '#C9A84C',
                  color: '#000',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {formLoading && <Loader2 size={18} />}
                {editingPackage ? 'Update Package' : 'Create Package'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packages Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem',
      }}>
        {packages.map(pkg => (
          <div
            key={pkg.id}
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '1rem',
              padding: '1.5rem',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>{pkg.name}</h3>
                <p style={{ color: '#999', fontSize: '0.9rem' }}>{pkg.category}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEditPackage(pkg)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#C9A84C',
                    cursor: 'pointer',
                  }}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDeletePackage(pkg.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff6b6b',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {pkg.description && (
              <p style={{ fontSize: '0.9rem', color: '#bbb', marginBottom: '1rem' }}>{pkg.description}</p>
            )}

            {/* Items */}
            <div style={{ backgroundColor: '#111', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {pkg.items.map(item => (
                <div key={item.menu_id} style={{ color: '#aaa', marginBottom: '0.25rem' }}>
                  • {item.menuItem?.name} × {item.quantity}
                </div>
              ))}
            </div>

            {/* Price */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid #333',
            }}>
              <span style={{ color: '#999' }}>Price per guest:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#C9A84C' }}>
                ₹{pkg.price}
              </span>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: '#999', padding: '3rem' }}>
          No packages created yet
        </div>
      )}
    </div>
  );
}
