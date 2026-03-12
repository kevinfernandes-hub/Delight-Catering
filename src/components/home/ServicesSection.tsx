'use client';

import { motion } from 'framer-motion';

const services = [
  { title: 'Weddings', description: 'Elegant celebrations tailored to your vision' },
  { title: 'Corporate Events', description: 'Professional catering for business gatherings' },
  { title: 'Private Dining', description: 'Intimate experiences with personalized menus' },
  { title: 'Celebrations', description: 'Memorable moments for milestones' },
];

export default function ServicesSection() {
  return (
    <section className="services-section">
      <div className="container">
        <h2>Our Services</h2>
        <div className="services-grid">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="service-card"
            >
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
