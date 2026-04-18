import React from 'react';
import { motion } from 'framer-motion';
import { Target, Shield, Zap } from 'lucide-react';
import Card from '../ui/Card';

const features = [
  {
    icon: <Shield className="text-primary w-7 h-7" />,
    title: 'Enterprise Security',
    description: 'Impregnable digital fortresses built with zero-trust architectures to safeguard critical assets.',
  },
  {
    icon: <Zap className="text-secondary w-7 h-7" />,
    title: 'Adaptive AI',
    description: 'Harnessing machine learning to automate, predict, and optimize complex workflows intelligently.',
  },
  {
    icon: <Target className="text-primary w-7 h-7" />,
    title: 'Scalable Architecture',
    description: 'Robust, cloud-native solutions designed to scale seamlessly with your organizational growth.',
  }
];

const About = () => {
  return (
    <section id="about" className="py-24 relative bg-surfaceHover/30">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-bold mb-4 text-textMain"
          >
            BEYOND <span className="text-gradient">BOUNDARIES</span>
          </motion.h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-display text-primary mb-4 tracking-widest uppercase font-semibold">Our Mission</h3>
            <p className="text-textMuted leading-relaxed mb-6 text-lg">
              At Mira Future Tech Vision, we don't just adapt to the future; we engineer it. Our mission is to empower organizations with state-of-the-art AI systems, robust cybersecurity solutions, and scalable infrastructures that cross domain boundaries.
            </p>
            <p className="text-textMuted leading-relaxed">
              Founded on the principles of integrity, foresight, and technological excellence, we deliver premium software solutions that serve as the backbone for next-generation enterprises.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 blur-2xl -z-10 rounded-3xl" />
            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
              <h3 className="text-xl font-display text-textMain mb-4 tracking-widest uppercase font-semibold">The Vision</h3>
              <p className="text-textMuted leading-relaxed italic border-l-2 border-primary pl-4 py-2">
                "To be the global nexus where human ingenuity and advanced technology converge to solve industry-defining challenges."
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card glowColor="primary" className="h-full flex flex-col items-start">
                <div className="mb-4 p-3 rounded-lg bg-background border border-borderBase">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold mb-2 font-display text-textMain">{feature.title}</h4>
                <p className="text-textMuted text-sm leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
