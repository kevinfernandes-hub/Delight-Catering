'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter, 
  ChefHat,
  Info,
  DollarSign,
  Tag,
  X,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/app/components/admin/Toast';
import ConfirmDialog from '@/app/components/admin/ConfirmDialog';
import { MenuItem } from '@/lib/types';
import { CreateMenuItemInput } from '@/lib/validations';

const CATEGORIES = ['All', 'Appetizers', 'Mains', 'Sides', 'Desserts', 'Packages'];
const UNITS = ['per plate', 'per piece', 'per lb', 'per serving'];

const MenuItemForm = ({ 
  item, 
  onClose, 
  onSave,
  showToast 
}: { 
  item?: MenuItem, 
  onClose: () => void, 
  onSave: (data: CreateMenuItemInput) => void,
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
}) => {
  const [formData, setFormData] = useState<CreateMenuItemInput>(
    item ? { 
      name: item.name, 
      description: item.description || '', 
      price: item.price, 
      category: item.category as any, 
      available: item.available, 
      unit: item.unit || 'per plate' 
    } : { 
      name: '', 
      description: '', 
      price: 0, 
      category: 'Appetizers' as any, 
      available: true, 
      unit: 'per plate' 
    }
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Dish name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setTimeout(() => {
      onSave(formData);
      setLoading(false);
    }, 300);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{item ? 'Edit Menu Item' : 'Add New Dish'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#A3A3A3', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Dish Name *</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Butter Chicken"
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                backgroundColor: '#050505', 
                border: `1px solid ${errors.name ? '#ef4444' : '#333'}`, 
                borderRadius: '0.5rem', 
                color: '#fff' 
              }} 
            />
            {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: '#A3A3A3', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Price (₹) *</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  backgroundColor: '#050505', 
                  border: `1px solid ${errors.price ? '#ef4444' : '#333'}`, 
                  borderRadius: '0.5rem', 
                  color: '#fff' 
                }} 
              />
              {errors.price && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.price}</p>}
            </div>

            <div>
              <label style={{ display: 'block', color: '#A3A3A3', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Category *</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  backgroundColor: '#050505', 
                  border: `1px solid ${errors.category ? '#ef4444' : '#333'}`, 
                  borderRadius: '0.5rem', 
                  color: '#fff' 
                }}
              >
                {CATEGORIES.slice(1).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {errors.category && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.category}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#A3A3A3', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Unit</label>
            <select 
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                backgroundColor: '#050505', 
                border: '1px solid #333', 
                borderRadius: '0.5rem', 
                color: '#fff' 
              }}
            >
              {UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#A3A3A3', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ingredients, preparation method, dietary info..."
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                backgroundColor: '#050505', 
                border: '1px solid #333', 
                borderRadius: '0.5rem', 
                color: '#fff', 
                resize: 'none',
                fontFamily: 'inherit'
              }} 
            />
          </div>

          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              checked={formData.available}
              onChange={(e) => setFormData({...formData, available: e.target.checked})}
              id="available"
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="available" style={{ fontWeight: '600', cursor: 'pointer', color: '#fff' }}>Available for orders</label>
          </div>

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
              {loading ? 'Saving...' : item ? 'Update Dish' : 'Add Dish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchMenu = useCallback(() => {
    setLoading(true);
    fetch('/api/menu')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: MenuItem[]) => {
        setMenuItems(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Menu fetch error:', err);
        showToast('Failed to load menu', 'error');
        setLoading(false);
      });
  }, [showToast]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleSave = async (data: CreateMenuItemInput) => {
    const url = selectedItem ? `/api/menu/${selectedItem.id}` : '/api/menu';
    const method = selectedItem ? 'PUT' : 'POST';

    try {
      setActionLoading(selectedItem?.id || 'new');
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast(`✓ ${data.name} ${selectedItem ? 'updated' : 'added to menu'}`, 'success');
        setIsModalOpen(false);
        setSelectedItem(undefined);
        fetchMenu();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save menu item', 'error');
      }
    } catch (error) {
      console.error('Save menu item error:', error);
      showToast('Failed to save menu item', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setActionLoading(deleteConfirm);
      const res = await fetch(`/api/menu/${deleteConfirm}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Item removed from menu', 'success');
        fetchMenu();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to delete item', 'error');
      }
    } catch (error) {
      console.error('Delete menu item error:', error);
      showToast('Failed to delete item', 'error');
    } finally {
      setActionLoading(null);
      setDeleteConfirm(null);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Menu Management</h1>
          <p style={{ color: '#A3A3A3' }}>Organize your culinary offerings and pricing.</p>
        </div>
        <button
          onClick={() => { setSelectedItem(undefined); setIsModalOpen(true); }}
          className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Add Dish
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="Search dishes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', backgroundColor: '#111', 
              border: '1px solid #333', borderRadius: '0.5rem', color: '#fff', outline: 'none'
            }} 
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid',
                borderColor: activeCategory === cat ? '#C9A84C' : '#333',
                backgroundColor: activeCategory === cat ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                color: activeCategory === cat ? '#C9A84C' : '#64748b',
                cursor: 'pointer',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <p style={{ color: '#64748b' }}>Kitchen is busy loading...</p>
        ) : filteredItems.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', border: '1px dashed #333', borderRadius: '1rem', color: '#64748b' }}>
             <ChefHat size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
             <p>No dishes found in this category.</p>
          </div>
        ) : filteredItems.map(item => (
          <div key={item.id} className="card menu-card">
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#C9A84C', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.category}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button className="icon-btn" onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}><Edit2 size={14} /></button>
                   <button className="icon-btn delete" onClick={() => setDeleteConfirm(item.id)}><Trash2 size={14} /></button>
                </div>
             </div>
             
             <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.25rem' }}>{item.name}</h3>
             <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '2.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>INR {item.price}</div>
                <div style={{ 
                  fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '4px',
                  backgroundColor: item.available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: item.available ? '#10b981' : '#ef4444'
                }}>
                   {item.available ? 'Available' : 'Out of Stock'}
                </div>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && <MenuItemForm item={selectedItem} onClose={() => setIsModalOpen(false)} onSave={handleSave} showToast={showToast} />}
      
      <ConfirmDialog 
        isOpen={deleteConfirm !== null}
        title="Remove Menu Item?"
        message="This action cannot be undone. This dish will no longer be available for new orders."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmVariant="danger"
        confirmLabel="Remove"
      />

      <style jsx>{`
        .menu-card { 
          transition: 0.3s; 
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
        }
        .menu-card:hover { 
          border-color: rgba(201, 168, 76, 0.3);
          transform: translateY(-5px);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }
        
        .icon-btn { 
          width: 32px; height: 32px; border-radius: 6px; border: 1px solid #333; 
          background: #050505; color: #64748b; cursor: pointer; 
          display: flex; align-items: center; justify-content: center; 
        }
        .icon-btn:hover { border-color: #C9A84C; color: #C9A84C; }
        .icon-btn.delete:hover { border-color: #ef4444; color: #ef4444; }

        .modal-overlay { 
          position: fixed; inset: 0; background: rgba(0,0,0,0.85); 
          display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.5rem; 
        }
        .modal-content { 
          background: #111; border: 1px solid #333; border-radius: 1rem; color: #fff; width: 100%;
        }
      `}</style>
    </div>
  );
}
