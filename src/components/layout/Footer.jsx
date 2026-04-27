import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-scroll';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-borderBase pt-16 pb-8">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Company Info */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-50"></div>
              <img
                src="/logo192.jpeg"
                alt="Mira Tech Logo"
                className="relative w-10 h-10 rounded-full object-cover border border-borderBase"
              />
            </div>
            <span className="font-display font-bold text-xl tracking-wider text-textMain">
              MIRA FUTURE TECH VISION PVT LTD
            </span>
          </div>
          <p className="text-textMuted text-sm mb-6 leading-relaxed">
            Pioneering the future through advanced AI, robust cybersecurity solutions, and next-gen technological innovations across multiple domains.
          </p>
          <div className="flex space-x-4">
            <a href="https://www.linkedin.com/company/115014294/" target="_blank" rel="noopener noreferrer" className="text-textMuted hover:text-primary transition-colors"><FaLinkedin size={20} /></a>
            <a href="https://github.com/blackdevil0009" target="_blank" rel="noopener noreferrer" className="text-textMuted hover:text-primary transition-colors"><FaGithub size={20} /></a>
            <a href="https://www.instagram.com/mirafuturetechvision?igsh=MTNqbG14cWpva2pqMQ==" target="_blank" rel="noopener noreferrer" className="text-textMuted hover:text-secondary transition-colors"><FaInstagram size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display font-bold text-lg mb-6 text-textMain tracking-widest">Quick Links</h4>
          <ul className="space-y-3">
            {['Home', 'About', 'Domains', 'Projects', 'Careers'].map((link) => (
              <li key={link}>
                <Link
                  to={link.toLowerCase()}
                  smooth={true}
                  duration={500}
                  className="text-textMuted hover:text-primary text-sm cursor-pointer transition-colors"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Domains */}
        <div>
          <h4 className="font-display font-bold text-lg mb-6 text-textMain tracking-widest">Domains</h4>
          <ul className="space-y-3">
            <li className="text-textMuted hover:text-cyber-DEFAULT text-sm cursor-pointer transition-colors">Cybersecurity</li>
            <li className="text-textMuted hover:text-edtech-DEFAULT text-sm cursor-pointer transition-colors">EdTech Systems</li>
            <li className="text-textMuted hover:text-health-DEFAULT text-sm cursor-pointer transition-colors">HealthTech</li>
            <li className="text-textMuted hover:text-fintech-DEFAULT text-sm cursor-pointer transition-colors">FinTech</li>
            <li className="text-textMuted hover:text-sustain-DEFAULT text-sm cursor-pointer transition-colors">Sustainability</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-display font-bold text-lg mb-6 text-textMain tracking-widest">Contact</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin className="text-primary shrink-0" size={18} />
              <span className="text-textMuted text-sm">Babhnauli Sant Kabir Nagar Uttar Pradesh 272125 </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="text-primary shrink-0" size={18} />
              <span className="text-textMuted text-sm">+91 7052608972</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="text-primary shrink-0" size={18} />
              <span className="text-textMuted text-sm">mirafuturetechvision@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-borderBase text-center">
        <p className="text-textMuted text-xs opacity-70">
          &copy; {new Date().getFullYear()} Mira Future Tech Vision Pvt Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
