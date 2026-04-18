import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const roles = [
  { title: 'AI Research Engineer', type: 'Full-time', location: 'Remote / HQ', color: 'primary' },
  { title: 'Cybersecurity Analyst', type: 'Full-time', location: 'HQ', color: 'cyber' },
  { title: 'Senior React Developer', type: 'Full-time', location: 'Remote', color: 'primary' },
  { title: 'Quantum Algorithms Specialist', type: 'Contract', location: 'Remote', color: 'fintech' },
];

const Careers = () => {
  return (
    <section id="careers" className="py-24 relative bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-bold mb-4 text-textMain"
          >
            JOIN THE <span className="text-gradient">VANGUARD</span>
          </motion.h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
          <p className="mt-6 text-textMuted max-w-2xl mx-auto">
            We are constantly looking for brilliant minds to join our mission. Explore our open positions and help us build the technology of tomorrow.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {roles.map((role, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center group cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div>
                <h3 className="text-xl font-bold font-display text-textMain mb-2 group-hover:text-primary transition-colors">
                  {role.title}
                </h3>
                <div className="flex gap-3 text-sm text-textMuted">
                  <span className="bg-surface px-3 py-1 rounded-md border border-borderBase">{role.type}</span>
                  <span className="bg-surface px-3 py-1 rounded-md border border-borderBase">{role.location}</span>
                </div>
              </div>
              
              <div className={`mt-4 sm:mt-0 flex items-center text-${role.color}-DEFAULT font-semibold uppercase tracking-wide text-sm`}>
                View Role <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Careers;
