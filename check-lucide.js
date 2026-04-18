const lucide = require('lucide-react');
const keys = Object.keys(lucide);

const targets = ['Github', 'Linkedin', 'Instagram', 'Twitter', 'ShieldAlert', 'BrainCircuit', 'ActivitySquare', 'Globe', 'Terminal', 'Database', 'Code2', 'Award', 'Briefcase', 'GraduationCap', 'Send', 'ChevronRight', 'Target', 'Shield', 'Zap', 'Menu', 'X', 'Mail', 'Phone', 'MapPin'];

targets.forEach(t => {
  if (keys.includes(t)) {
    console.log(`FOUND: ${t}`);
  } else {
    console.log(`MISSING: ${t}`);
    // Check if it ends with Icon
    if (keys.includes(`${t}Icon`)) {
      console.log(`  -> Did you mean ${t}Icon?`);
    } else {
      // Find similar
      const similar = keys.filter(k => k.toLowerCase().includes(t.toLowerCase()));
      if (similar.length > 0) {
        console.log(`  -> Similar: ${similar.slice(0, 5).join(', ')}`);
      }
    }
  }
});
