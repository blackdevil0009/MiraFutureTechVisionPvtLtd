import React from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, HeartPulse, LineChart, Leaf } from 'lucide-react';
import Card from '../ui/Card';

const domains = [
  {
    id: 'cyber',
    icon: <Shield className="w-8 h-8 text-cyber-DEFAULT" />,
    title: 'Cybersecurity',
    color: 'cyber',
    description: 'Next-generation threat detection, zero-trust architectures, and proactive defense mechanisms tailored for enterprise resilience.',
  },
  {
    id: 'edtech',
    icon: <BookOpen className="w-8 h-8 text-edtech-DEFAULT" />,
    title: 'EdTech',
    color: 'edtech',
    description: 'AI-driven personalized learning paths, immersive virtual classrooms, and scalable educational infrastructure.',
  },
  {
    id: 'health',
    icon: <HeartPulse className="w-8 h-8 text-health-DEFAULT" />,
    title: 'HealthTech',
    color: 'health',
    description: 'Secure patient data management, predictive diagnostics, and telemedicine platforms powered by machine learning.',
  },
  {
    id: 'fintech',
    icon: <LineChart className="w-8 h-8 text-fintech-DEFAULT" />,
    title: 'FinTech',
    color: 'fintech',
    description: 'Decentralized finance solutions, quantum-resistant fraud detection, and ultra-low latency trading systems.',
  },
  {
    id: 'sustain',
    icon: <Leaf className="w-8 h-8 text-sustain-DEFAULT" />,
    title: 'Sustainability',
    color: 'sustain',
    description: 'Smart grid optimization, carbon footprint tracking, and IoT-enabled ecological monitoring networks.',
  }
];

const Domains = () => {
  return (
    <section id="domains" className="py-24 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.02)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4 px-4 py-1.5 rounded-full border border-borderBase bg-surface backdrop-blur-sm"
          >
            <span className="text-textMuted text-xs font-display tracking-widest uppercase font-bold">
              Multi-Domain Adaptability
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold mb-6 text-textMain"
          >
            ENGINEERED FOR <span className="text-primary">EVERY INDUSTRY</span>
          </motion.h2>
          <p className="max-w-2xl mx-auto text-textMuted leading-relaxed">
            Our core technologies are modular and adaptive. Whether securing financial data, personalizing education, or optimizing energy grids, Mira's solutions scale across boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {domains.map((domain, idx) => (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card glowColor={domain.color} className="h-full flex flex-col group cursor-default">
                <div className={`p-3 rounded-xl mb-6 inline-flex bg-${domain.color}-light/10 dark:bg-${domain.color}-dark/10 border border-${domain.color}-DEFAULT/20 transition-transform duration-300 group-hover:-translate-y-1`}>
                  {domain.icon}
                </div>
                <h3 className="text-xl font-bold font-display mb-3 text-textMain group-hover:text-textMain transition-colors">
                  {domain.title}
                </h3>
                <p className="text-textMuted text-sm leading-relaxed flex-grow">
                  {domain.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Domains;
