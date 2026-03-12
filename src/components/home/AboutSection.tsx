'use client';

import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="about-content"
        >
          <h2>Our Story</h2>
          <p>
            Delight Caterers brings passion, precision, and creativity to every event. 
            With years of culinary expertise, we create memorable dining experiences 
            that exceed expectations.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
