'use client';

import { motion } from 'framer-motion';

const steps = [
  { number: '1', title: 'Consultation', description: 'Discuss your vision and preferences' },
  { number: '2', title: 'Menu Design', description: 'Curate the perfect menu for your event' },
  { number: '3', title: 'Preparation', description: 'Meticulous preparation and planning' },
  { number: '4', title: 'Execution', description: 'Flawless service and memorable experience' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="container">
        <h2>How It Works</h2>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="step-card"
            >
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
