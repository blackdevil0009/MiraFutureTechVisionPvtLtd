import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, ShieldCheck, Zap, ArrowRight, CreditCard, Code2, Shield, Database, Layout, Smartphone, FileCode, Layers, BrainCircuit } from 'lucide-react';
import Button from '../ui/Button';

const premiumFeatures = [
  "Guaranteed Industry Placement",
  "1-on-1 Personalized Mentorship",
  "Premium Portfolio Review",
  "Direct Interview Referrals",
  "Lifetime Access to Alumni Network"
];

const eliteTracks = [
  { name: "Python", icon: <Code2 className="w-5 h-5" /> },
  { name: "Java", icon: <Layers className="w-5 h-5" /> },
  { name: "DSA", icon: <BrainCircuit className="w-5 h-5" /> },
  { name: "Cyber Security", icon: <Shield className="w-5 h-5" /> },
  { name: "Data Analytics", icon: <Database className="w-5 h-5" /> },
  { name: ".NET Core", icon: <FileCode className="w-5 h-5" /> },
  { name: "Kotlin", icon: <Smartphone className="w-5 h-5" /> },
  { name: "Web Tech", icon: <Layout className="w-5 h-5" /> }
];

const PaidInternship = () => {
  return (
    <section id="paid-internship" className="py-24 relative overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 blur-[100px] -z-10 rounded-full" />

      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6"
            >
              <Sparkles size={16} />
              ELITE SPECIALIZATION
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-display font-bold text-textMain mb-6"
            >
              CHOOSE YOUR <span className="text-gradient">DOMAIN</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {eliteTracks.map((track, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="bg-surface p-5 rounded-2xl border border-borderBase flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
              >
                <div className="bg-background p-3 rounded-xl text-primary group-hover:scale-110 transition-transform">
                  {track.icon}
                </div>
                <span className="font-bold text-textMain text-sm md:text-base">{track.name}</span>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Features List */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {premiumFeatures.map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 group"
                >
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="text-textMain font-medium text-lg">{feature}</span>
                </motion.div>
              ))}
              
              <div className="pt-6 border-t border-borderBase">
                <div className="flex items-center gap-3 text-secondary font-bold">
                  <ShieldCheck size={24} />
                  <span>100% Satisfaction Guarantee</span>
                </div>
              </div>
            </motion.div>

            {/* Pricing Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Card Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-surface p-8 md:p-10 rounded-3xl border border-borderBase shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Zap size={120} />
                </div>

                <div className="mb-8">
                  <p className="text-textMuted font-bold uppercase tracking-widest text-sm mb-2">Investment</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display font-bold text-textMain">₹2,499</span>
                    <span className="text-textMuted">/ program</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-sm text-textMuted">
                    <CreditCard size={16} />
                    Secure Payment Gateway
                  </div>
                  <div className="flex items-center gap-3 text-sm text-textMuted">
                    <Zap size={16} className="text-yellow-500" />
                    Instant Access After Payment
                  </div>
                </div>

                <button 
                  onClick={() => alert("Redirecting to Secure Payment Portal...")}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                >
                  Pay & Proceed
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="mt-6 text-center text-xs text-textMuted leading-relaxed">
                  By clicking "Pay & Proceed", you agree to our Terms of Service and Privacy Policy. Secured by Razorpay.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaidInternship;
