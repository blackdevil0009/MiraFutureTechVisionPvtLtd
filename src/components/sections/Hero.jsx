import React from 'react';
import { motion } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import Button from '../ui/Button';

const Hero = () => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 bg-background">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjOTE5MWEwIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNjBoNjBNNjAgMHY2MCIvPjwvZz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
      
      {/* Clean Abstract Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -z-10 animate-float" style={{ animationDelay: '3s' }} />

      <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block mb-6 px-5 py-2 rounded-full border border-borderBase bg-surface/50 backdrop-blur-md"
          >
            <span className="text-primary text-xs font-display tracking-widest uppercase font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Pioneering the Next Generation of Tech
            </span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6 leading-tight text-textMain tracking-tight">
            ENGINEERING THE <br />
            <span className="text-gradient">
              FUTURE TODAY
            </span>
          </h1>
          
          <p className="text-textMuted text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Mira Future Tech Vision Pvt Ltd delivers enterprise-grade solutions across Cybersecurity, Education, Healthcare, Finance, and Sustainability to build a secure and intelligent tomorrow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ScrollLink to="domains" smooth={true} duration={500} offset={-80}>
              <Button variant="glow" className="w-full sm:w-auto px-8">
                Explore Domains
              </Button>
            </ScrollLink>
            <a href="https://internship.mirafuturetechvision.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full sm:w-auto px-8">
                Join Internship
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
