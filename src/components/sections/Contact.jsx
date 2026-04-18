import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Loader2, Mail, User, MessageSquare } from 'lucide-react';
import emailjs from '@emailjs/browser';
import Button from '../ui/Button';

// ─── EmailJS Config ───────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID = 'service_v5b62wb';
const EMAILJS_TEMPLATE_ID = 'template_r34v5f6'; // Using existing admin template ID
const EMAILJS_PUBLIC_KEY = 'vaNUhUqWMLaygjcpy';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus('loading');
    
    const templateParams = {
      from_name: form.name,
      applicant_name: form.name, // matching previous template keys
      applicant_email: form.email,
      message: form.message,
      to_email: 'gkum86046@gmail.com',
      timestamp: new Date().toLocaleString(),
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error('EmailJS Error:', err);
      setErrorMsg(err?.text || 'Network error. Please try again.');
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-24 relative bg-surfaceHover/30">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-display font-bold mb-4 text-textMain"
            >
              INITIATE <span className="text-gradient">COMMUNICATION</span>
            </motion.h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
            <p className="mt-6 text-textMuted max-w-lg mx-auto">
              Ready to explore the future together? Send us a message and our team will respond to <span className="text-primary font-semibold">gkum86046@gmail.com</span> for coordination.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 md:p-12 rounded-2xl glow-border bg-surface/50 backdrop-blur-xl relative overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-bold tracking-widest text-textMuted uppercase flex items-center gap-2">
                    <User size={14} className="text-primary" /> Name
                  </label>
                  <input 
                    id="name"
                    required
                    type="text" 
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-background border border-borderBase rounded-lg px-4 py-3 text-textMain focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all duration-300"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold tracking-widest text-textMuted uppercase flex items-center gap-2">
                    <Mail size={14} className="text-primary" /> Email
                  </label>
                  <input 
                    id="email"
                    required
                    type="email" 
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-background border border-borderBase rounded-lg px-4 py-3 text-textMain focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-bold tracking-widest text-textMuted uppercase flex items-center gap-2">
                  <MessageSquare size={14} className="text-primary" /> Message
                </label>
                <textarea 
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  className="w-full bg-background border border-borderBase rounded-lg px-4 py-3 text-textMain focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all duration-300 resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                <AnimatePresence mode="wait">
                  {status === 'success' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-green-400 text-sm font-semibold"
                    >
                      <CheckCircle2 size={18} /> Message transmitted successfully!
                    </motion.div>
                  )}
                  {status === 'error' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-red-400 text-sm font-semibold"
                    >
                      <AlertCircle size={18} /> {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="ml-auto">
                  <Button 
                    type="submit"
                    disabled={status === 'loading'}
                    variant="glow" 
                    className="flex items-center gap-2 group min-w-[160px] justify-center"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        Transmit <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
