import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, CheckCircle2, 
  ExternalLink, Loader2, Award, Briefcase 
} from 'lucide-react';
import Button from '../ui/Button';

const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScu9voeG2WNcmsxSt1oBaPt5QaW6MNOXOY9Pag_rt4LI1q1GA/viewform?embedded=true";

const trustBadges = [
  { icon: <Award className="text-primary" size={18} />, text: "100% Free Internship" },
  { icon: <CheckCircle2 className="text-secondary" size={18} />, text: "Verified Certification" },
  { icon: <Briefcase className="text-primary" size={18} />, text: "Real-World Projects" }
];

const domains = [
  { name: "Cybersecurity", icon: "🛡️" },
  { name: "AI / ML", icon: "🤖" },
  { name: "FinTech", icon: "💹" },
  { name: "HealthTech", icon: "🏥" },
  { name: "Sustainability", icon: "🌱" }
];

const InternshipForm = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <section id="apply" className="py-24 relative bg-background min-h-screen">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm"
          >
            <Rocket size={14} className="text-primary" />
            <span className="text-[10px] font-display tracking-[0.2em] uppercase font-bold text-primary">
              Enrollment Open
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-textMain mb-6 leading-tight"
          >
            Future Innovators <br/>
            <span className="text-gradient">Internship Program 🚀</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-textMuted text-lg mb-8 leading-relaxed"
          >
            Apply now and gain real-world experience in Cybersecurity, AI, FinTech, HealthTech, and Sustainability. Fill out the application form below to join Mira Future Tech Vision Pvt Ltd and work on industry-defining projects.
          </motion.p>

          {/* Trust Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-surface/50 border border-borderBase px-4 py-2 rounded-xl backdrop-blur-md">
                {badge.icon}
                <span className="text-xs font-semibold text-textMain uppercase tracking-wider">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto relative group"
        >
          {/* Neon Glow Frame */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
          
          <div className="glass-panel p-2 rounded-[2.5rem] overflow-hidden border-borderBase/10 relative bg-surface/80">
            {/* Loading Overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface/90 backdrop-blur-md rounded-[2.5rem]"
                >
                  <Loader2 className="text-primary animate-spin mb-4" size={48} />
                  <p className="text-textMuted font-display tracking-widest uppercase text-sm animate-pulse">
                    Connecting to Secure Server...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Form Iframe */}
            <iframe
              src={GOOGLE_FORM_URL}
              width="100%"
              height="800"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              onLoad={() => setIsLoading(false)}
              className="rounded-[2rem] bg-white/5"
              title="Internship Application Form"
            >
              Loading…
            </iframe>
          </div>

          {/* Domain Icons Strip */}
          <div className="flex justify-center gap-8 mt-12 overflow-x-auto pb-4 px-4 scrollbar-hide">
            {domains.map((domain, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center gap-2 shrink-0"
              >
                <div className="w-12 h-12 rounded-2xl bg-surface border border-borderBase flex items-center justify-center text-2xl shadow-glow-sm">
                  {domain.icon}
                </div>
                <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">{domain.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Fallback Action */}
          <div className="mt-12 text-center">
            <p className="text-textMuted text-sm mb-6">Having trouble viewing the form?</p>
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLScu9voeG2WNcmsxSt1oBaPt5QaW6MNOXOY9Pag_rt4LI1q1GA/viewform?usp=sf_link" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="flex items-center gap-2 mx-auto">
                Open Form in New Tab <ExternalLink size={16} />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InternshipForm;
