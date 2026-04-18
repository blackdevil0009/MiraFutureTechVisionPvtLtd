import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const variants = {
  primary: 'bg-primary/10 text-primary border border-primary/50 hover:bg-primary/20 hover:border-primary hover:shadow-glow-sm',
  secondary: 'bg-secondary/10 text-secondary border border-secondary/50 hover:bg-secondary/20 hover:border-secondary hover:shadow-glow-sm',
  glow: 'bg-primary text-white border border-primary hover:brightness-110 hover:shadow-glow-sm font-semibold',
  outline: 'bg-transparent text-textMain border border-borderBase hover:border-textMuted hover:bg-surfaceHover',
};

const Button = ({ children, variant = 'primary', className, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'px-6 py-3 rounded-lg transition-all duration-300 font-display tracking-wide text-sm',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
