import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const glowClasses = {
  primary: 'hover:border-primary/50 before:from-primary',
  secondary: 'hover:border-secondary/50 before:from-secondary',
  cyber: 'hover:border-cyber-DEFAULT/50 before:from-cyber-DEFAULT hover:shadow-[0_0_15px_rgba(0,243,255,0.1)]',
  edtech: 'hover:border-edtech-DEFAULT/50 before:from-edtech-DEFAULT hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]',
  health: 'hover:border-health-DEFAULT/50 before:from-health-DEFAULT hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]',
  fintech: 'hover:border-fintech-DEFAULT/50 before:from-fintech-DEFAULT hover:shadow-[0_0_15px_rgba(251,191,36,0.1)]',
  sustain: 'hover:border-sustain-DEFAULT/50 before:from-sustain-DEFAULT hover:shadow-[0_0_15px_rgba(34,197,94,0.1)]',
};

const Card = ({ children, className, glowColor = 'primary', ...props }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        'glass-panel p-6 rounded-2xl relative transition-all duration-500 group overflow-hidden',
        // Subtle border gradient on hover
        'before:absolute before:-inset-[1px] before:rounded-2xl before:bg-gradient-to-br before:via-transparent before:to-transparent before:-z-10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700',
        glowClasses[glowColor] || glowClasses.primary,
        className
      )}
      {...props}
    >
      {/* Soft internal gradient background reveal on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none from-${glowColor === 'primary' || glowColor === 'secondary' ? glowColor : glowColor + '-DEFAULT'} to-transparent`} />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default Card;
