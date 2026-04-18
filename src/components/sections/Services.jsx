import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, BrainCircuit, ActivitySquare, Globe } from 'lucide-react';
import Card from '../ui/Card';

const services = [
  {
    icon: <ShieldAlert className="w-10 h-10 text-primary" />,
    title: 'Cybersecurity Solutions',
    description: 'Enterprise-grade protection frameworks including penetration testing, vulnerability assessments, and real-time threat neutralization.',
    color: 'primary'
  },
  {
    icon: <BrainCircuit className="w-10 h-10 text-secondary" />,
    title: 'AI-Based Systems',
    description: 'Custom machine learning models and NLP integrations tailored to automate data processing and provide predictive analytics.',
    color: 'secondary'
  },
  {
    icon: <ActivitySquare className="w-10 h-10 text-accent" />,
    title: 'Fraud Detection (FAST + QTD)',
    description: 'Proprietary Quantum Threat Detection algorithms paired with FAST framework to identify and stop anomalies instantly.',
    color: 'accent'
  },
  {
    icon: <Globe className="w-10 h-10 text-primary" />,
    title: 'Web & App Development',
    description: 'Scalable, secure, and hyper-fast web and mobile applications engineered with modern stacks and cyberpunk aesthetics.',
    color: 'primary'
  }
];

const Services = () => {
  return (
    <section id="services" className="py-24 relative bg-surfaceHover/30">
      <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
      
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold mb-4"
          >
            SYSTEM <span className="text-gradient">CAPABILITIES</span>
          </motion.h2>
          <div className="w-24 h-1 bg-gradient-to-r from-secondary to-primary mx-auto rounded-full" />
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
            Deploying advanced technological solutions engineered to secure data architectures and accelerate digital transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
            >
              <Card glowColor={service.color} className="h-full group">
                <div className="mb-6 relative">
                  <div className={`absolute inset-0 bg-${service.color}/20 blur-xl rounded-full transition-all duration-300 group-hover:blur-2xl`} />
                  <div className="relative z-10 p-3 bg-background border border-white/10 rounded-xl inline-block">
                    {service.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold font-display mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {service.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
