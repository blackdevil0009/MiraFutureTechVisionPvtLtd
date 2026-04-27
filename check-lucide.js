const lucide = require('lucide-react');
const icons = [
  'ShieldAlert', 'BrainCircuit', 'ActivitySquare', 'Globe', 
  'ShieldCheck', 'ArrowRight', 'Activity', 'Leaf', 'MessageSquare', 
  'Award', 'Briefcase', 'GraduationCap', 'Code', 'Shield', 
  'BookOpen', 'HeartPulse', 'LineChart', 'Send', 'AlertCircle', 
  'Loader2', 'Mail', 'User', 'ChevronRight', 'Target', 'Zap', 
  'Menu', 'X', 'Sun', 'Moon', 'Phone', 'MapPin', 'ArrowLeft', 
  'Cpu', 'CheckCircle2', 'Lightbulb', 'ExternalLink'
];
icons.forEach(icon => {
  if (lucide[icon]) {
    // console.log(`[OK] ${icon} exists`);
  } else {
    console.log(`[ERROR] ${icon} is MISSING`);
  }
});
console.log('Check complete.');
