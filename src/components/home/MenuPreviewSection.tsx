'use client';

import { motion } from 'framer-motion';

const menuItems = [
  { name: 'Signature Appetizers', category: 'appetizers' },
  { name: 'Gourmet Mains', category: 'mains' },
  { name: 'Artisanal Desserts', category: 'desserts' },
];

export default function MenuPreviewSection() {
  return (
    <section id="menu" className="menu-section">
      <div className="container">
        <h2>Signature Menu</h2>
        <div className="menu-grid">
          {menuItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="menu-card"
            >
              <h3>{item.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
