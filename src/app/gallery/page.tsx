'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, ZoomIn } from 'lucide-react';
import { galleryImages } from '@/lib/galleryConfig';

type ImageItem = {
  img: string;
  title: string;
};

export default function GalleryPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/admin/gallery', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setImages(data.map((item: any) => ({ img: item.url, title: item.title })));
          } else {
            setImages(galleryImages);
          }
        } else {
          setImages(galleryImages);
        }
      } catch (err) {
        console.error('Failed to fetch gallery images:', err);
        setImages(galleryImages);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Handle escape key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter logic
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredImages(images);
    } else if (activeFilter === 'dishes') {
      const dishesKeywords = ['plating', 'cuisine', 'dishes', 'snacks', 'biryani', 'food', 'veg', 'non-veg', 'flavors', 'mastery', 'chicken', 'tasty', 'delicious', 'fresh', 'spread'];
      const filtered = images.filter((img) =>
        dishesKeywords.some((kw) => img.title.toLowerCase().includes(kw))
      );
      // Fallback if none matched
      setFilteredImages(filtered.length > 0 ? filtered : images.slice(1, 4));
    } else if (activeFilter === 'events') {
      const eventsKeywords = ['setting', 'setup', 'ambient', 'experience', 'wedding', 'buffet', 'decor', 'service', 'corporate', 'staff', 'impeccable', 'happy', 'guests'];
      const filtered = images.filter((img) =>
        eventsKeywords.some((kw) => img.title.toLowerCase().includes(kw))
      );
      // Fallback if none matched
      setFilteredImages(filtered.length > 0 ? filtered : images.slice(0, 2));
    }
  }, [images, activeFilter]);

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-ivory)', fontFamily: 'var(--font-body)', position: 'relative' }}>
      
      {/* Navigation */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '1.2rem 5%', background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" className="hover-target" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(245,240,232,0.7)', fontSize: '13px', letterSpacing: '1px', textDecoration: 'none', textTransform: 'uppercase', fontWeight: 600 }}>
          <ArrowLeft size={16} /> BACK TO HOME
        </a>
        <div className="logo" style={{ fontSize: '1.8rem' }}>Delight</div>
        <a href="tel:9689330035" className="nav-cta hover-target" style={{ border: '1px solid var(--color-gold)', padding: '0.6rem 1.5rem', color: 'var(--color-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none', background: 'transparent' }}>Call Now</a>
      </nav>

      {/* Header */}
      <header style={{ padding: '5rem 5% 3rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span className="section-tag" style={{ color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.8rem', marginBottom: '1rem', display: 'block' }}>Visual Feast</span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: '1.5rem', fontWeight: 400 }}>Our Culinary Journey.</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Explore snapshots of our handcrafted menus, elegant buffets, premium settings, and professional hospitality services in Nagpur.
          </p>
        </div>
      </header>

      {/* Filters */}
      <section style={{ padding: '0 5% 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Images' },
            { id: 'dishes', label: 'Food & Plating' },
            { id: 'events', label: 'Events & Setups' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                background: activeFilter === tab.id ? 'var(--color-gold)' : 'rgba(255,255,255,0.04)',
                color: activeFilter === tab.id ? 'var(--color-bg)' : 'var(--color-ivory)',
                border: activeFilter === tab.id ? '1px solid var(--color-gold)' : '1px solid rgba(201, 168, 76, 0.2)',
                padding: '0.75rem 2rem',
                borderRadius: '30px',
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              className="hover-target"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <main style={{ padding: '0 5% 6rem' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-gold)', fontSize: '1.2rem' }}>Loading Gallery...</div>
          ) : (
            <motion.div 
              layout 
              className="gallery-page-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}
            >
              <AnimatePresence mode="popLayout">
                {filteredImages.map((item, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    key={item.img + idx}
                    onClick={() => setSelectedImage(item)}
                    style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', aspectRatio: '1.2', border: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.02)' }}
                    className="gallery-page-card"
                  >
                    <img 
                      src={item.img} 
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                    {/* Hover Overlay */}
                    <div className="gallery-card-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10, 10, 10, 0.9) 0%, rgba(10, 10, 10, 0.2) 60%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.5rem', opacity: 0, transition: 'opacity 0.3s ease' }}>
                      <ZoomIn size={24} style={{ color: 'var(--color-gold)', position: 'absolute', top: '1.5rem', right: '1.5rem' }} />
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{item.title}</h3>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>Click to zoom</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 5, 5, 0.95)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', outline: 'none' }}
              aria-label="Close Lightbox"
            >
              <X size={32} />
            </button>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90%',
                maxHeight: '75vh',
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(201, 168, 76, 0.1)'
              }}
            >
              <img
                src={selectedImage.img}
                alt={selectedImage.title}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  objectFit: 'contain'
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ marginTop: '1.5rem', textAlign: 'center' }}
            >
              <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontStyle: 'italic', margin: 0 }}>{selectedImage.title}</h2>
              <p style={{ color: 'var(--color-gold)', margin: '0.25rem 0 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Delight Caterers Nagpur</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
