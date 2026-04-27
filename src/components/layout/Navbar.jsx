import React, { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../ThemeProvider';

const navLinks = [
  { name: 'Home', to: 'home' },
  { name: 'About', to: 'about' },
  { name: 'Domains', to: 'domains' },
  { name: 'Services', to: 'services' },
  { name: 'Projects', to: 'projects' },
  { name: 'Careers', to: 'careers' },
  { name: 'Contact', to: 'contact' },
];

const Navbar = ({ showApply = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (!isHome) {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavClick = (to) => {
    if (!isHome) {
      navigate('/', { state: { scrollTo: to } });
    }
    setIsOpen(false);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        scrolled ? 'glass-panel py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
            <img 
              src="/logo192.jpeg" 
              alt="Mira Tech" 
              className="relative w-10 h-10 rounded-full object-cover border-2 border-primary/20 bg-background"
            />
          </div>
          <span className="font-display font-bold text-sm md:text-base tracking-wide text-textMain hidden sm:block">
            MIRA FUTURE TECH VISION PVT LTD
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {isHome ? (
            navLinks.map((link) => (
              <ScrollLink
                key={link.name}
                to={link.to}
                smooth={true}
                duration={500}
                spy={true}
                offset={-80}
                className="text-textMuted hover:text-primary font-display tracking-widest text-sm uppercase cursor-pointer transition-colors"
                activeClass="text-primary border-b-2 border-primary"
              >
                {link.name}
              </ScrollLink>
            ))
          ) : (
            navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.to)}
                className="text-textMuted hover:text-primary font-display tracking-widest text-sm uppercase cursor-pointer transition-colors"
              >
                {link.name}
              </button>
            ))
          )}
          
          {showApply && (
            <a href="https://internship.mirafuturetechvision.com" target="_blank" rel="noopener noreferrer">
              <button
                className="px-4 py-2 rounded-lg text-xs font-display font-bold tracking-widest uppercase bg-primary text-background hover:brightness-110 transition-all shadow-glow-sm"
              >
                Apply Now
              </button>
            </a>
          )}
          {!showApply && (
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg text-xs font-display font-bold tracking-widest uppercase border border-borderBase hover:border-primary text-textMuted hover:text-primary transition-all"
            >
              ← Back
            </button>
          )}

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-surfaceHover transition-colors text-textMuted hover:text-primary"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button onClick={toggleTheme} className="text-textMuted hover:text-primary">
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-textMuted hover:text-primary transition-colors"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass-panel border-t border-borderBase py-4 flex flex-col items-center space-y-4 shadow-xl">
          {isHome ? (
            navLinks.map((link) => (
              <ScrollLink
                key={link.name}
                to={link.to}
                smooth={true}
                duration={500}
                spy={true}
                offset={-80}
                onClick={() => setIsOpen(false)}
                className="text-textMuted hover:text-primary font-display tracking-widest text-lg uppercase cursor-pointer transition-colors"
                activeClass="text-primary"
              >
                {link.name}
              </ScrollLink>
            ))
          ) : (
            navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.to)}
                className="text-textMuted hover:text-primary font-display tracking-widest text-lg uppercase cursor-pointer transition-colors"
              >
                {link.name}
              </button>
            ))
          )}
          {showApply && (
            <a href="https://internship.mirafuturetechvision.com" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
              <button
                className="px-6 py-2 rounded-lg text-sm font-display font-bold tracking-widest uppercase bg-primary text-background hover:brightness-110 transition-all"
              >
                Apply Now
              </button>
            </a>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
