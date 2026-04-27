import React from 'react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { Award, Briefcase, GraduationCap, Code, ClipboardList } from 'lucide-react';
import Button from '../ui/Button';

const benefits = [
  { icon: <Award className="text-primary w-5 h-5" />, text: 'Verified Certification' },
  { icon: <Briefcase className="text-secondary w-5 h-5" />, text: 'Real-World Projects' },
  { icon: <GraduationCap className="text-edtech-DEFAULT w-5 h-5" />, text: 'Expert Mentorship' },
];

const Internship = () => {
  return (
    <section id="internship" className="py-24 relative bg-surfaceHover/30 border-y border-borderBase">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-textMain">
              IGNITE YOUR <span className="text-gradient">TRAJECTORY</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mb-6 rounded-full" />
            <p className="text-textMuted text-lg mb-8 leading-relaxed">
              Step into the core of innovation. Our internship programs are designed as live simulations in real-world tech environments. Work alongside industry veterans, contribute to live projects, and secure your place in the tech vanguard.
            </p>
            
            <ul className="space-y-4 mb-10">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-4 bg-surface p-4 rounded-lg border border-borderBase">
                  <div className="bg-background p-2 rounded-md">
                    {benefit.icon}
                  </div>
                  <span className="font-semibold text-textMain">
                    {benefit.text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <a href="https://internship.mirafuturetechvision.com" target="_blank" rel="noopener noreferrer">
                <Button variant="primary">
                  Apply for Internship
                </Button>
              </a>
              <a href="https://quiz.mirafuturetechvision.com" target="_blank" rel="noopener noreferrer">
                <button className="px-6 py-2.5 rounded-full border border-primary/30 bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-all flex items-center gap-2 group">
                  <ClipboardList size={18} className="group-hover:scale-110 transition-transform" />
                  Task Portal
                </button>
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:w-1/2 w-full relative"
          >
            <div className="absolute inset-0 bg-primary/5 blur-[80px] -z-10 rounded-full" />
            
            {/* Floating Task Badge */}
            <motion.a 
              href="https://quiz.mirafuturetechvision.com"
              target="_blank"
              rel="noopener noreferrer"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-6 -right-6 z-20 bg-background border border-borderBase p-4 rounded-2xl shadow-2xl flex items-center gap-3 group hover:border-primary/50 transition-colors"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-pulse" />
                <div className="relative bg-primary/10 p-2 rounded-lg text-primary">
                  <Code size={20} />
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-primary">Active Task</p>
                <p className="text-sm font-bold text-textMain group-hover:text-primary transition-colors">Start Skill Quiz</p>
              </div>
            </motion.a>

            <div className="glass-panel p-6 rounded-2xl border border-borderBase">
              <div className="flex items-center justify-between border-b border-borderBase pb-4 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex items-center gap-2 text-textMuted text-sm font-mono">
                  <Code size={14} /> terminal.exe
                </div>
              </div>
              
              <div className="font-mono text-sm space-y-3 text-textMuted">
                <p><span className="text-primary font-semibold">~/mira-tech $</span> ./scan_opportunities.sh</p>
                <p className="opacity-70">Scanning open positions...</p>
                <p className="text-cyber-DEFAULT">[OK] CyberSecurity Analyst Track</p>
                <p className="text-primary">[OK] AI/ML Engineering Track</p>
                <p className="text-edtech-DEFAULT">[OK] Full Stack Web Development</p>
                <p className="pt-2"><span className="text-primary font-semibold">~/mira-tech $</span> Awaiting applicant profile <span className="animate-pulse inline-block w-2 h-4 bg-textMain align-middle ml-1" /></p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Internship;
