'use client';

import { motion } from 'framer-motion';

const testimonials = [
  { text: 'An unforgettable experience', author: 'Client Name' },
  { text: 'Exceeded all expectations', author: 'Event Organizer' },
  { text: 'Exceptional service and cuisine', author: 'Corporate Partner' },
];

export default function TestimonialsSection() {
  return (
    <section className="testimonials-section">
      <div className="container">
        <h2>What Our Clients Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="testimonial-card"
            >
              <p>"{testimonial.text}"</p>
              <p className="author">- {testimonial.author}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
