'use client';

import { motion } from 'framer-motion';

export default function GallerySection() {
  return (
    <section id="gallery" className="gallery-section">
      <div className="container">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="gallery-item"
          >
            <p>Event Photography</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="gallery-item"
          >
            <p>Culinary Creations</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="gallery-item"
          >
            <p>Setup & Service</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
