'use client';

import { motion } from 'framer-motion';

export default function CTABannerSection() {
  return (
    <section id="cta" className="cta-banner">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="cta-content"
      >
        <h2>Ready to Elevate Your Event?</h2>
        <p>Contact us today for a personalized consultation</p>
        <a href="tel:+919689330035" className="cta-button">
          Call: +91 9689330035
        </a>
      </motion.div>
    </section>
  );
}
