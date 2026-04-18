import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, ArrowRight, Activity, Leaf, MessageSquare } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { projectsData } from '../../data/projectsData';

const getIcon = (domain) => {
  switch (domain) {
    case 'Cybersecurity': return <ShieldCheck className="w-5 h-5 text-cyber-DEFAULT" />;
    case 'HealthTech': return <Activity className="w-5 h-5 text-health-DEFAULT" />;
    case 'Sustainability': return <Leaf className="w-5 h-5 text-sustain-DEFAULT" />;
    case 'AI': return <MessageSquare className="w-5 h-5 text-primary" />;
    default: return <Cpu className="w-5 h-5 text-primary" />;
  }
};

const Projects = () => {
  return (
    <section id="projects" className="py-24 relative bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block mb-4 px-4 py-1.5 rounded-full border border-borderBase bg-surface/50 backdrop-blur-sm"
            >
              <span className="text-primary text-xs font-display tracking-widest uppercase font-bold">
                Innovation Pipeline
              </span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-display font-bold mb-4 text-textMain"
            >
              ACTIVE <span className="text-gradient">INITIATIVES</span>
            </motion.h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full" />
          </div>
          <Button variant="outline" className="hidden md:block">View Vision Roadmap</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projectsData.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                glowColor={project.color} 
                className="h-full flex flex-col group border-t-2 border-t-borderBase hover:border-t-primary/30 min-h-[320px]"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-surface rounded-xl border border-borderBase group-hover:shadow-glow-sm transition-all duration-500">
                    {getIcon(project.domain)}
                  </div>
                  <span 
                    className="text-[10px] tracking-[0.2em] uppercase font-bold px-4 py-1.5 rounded-full border"
                    style={{ 
                      borderColor: `rgb(var(--color-${project.color === 'primary' ? 'primary' : project.color}) / 0.3)`,
                      color: `rgb(var(--color-${project.color === 'primary' ? 'primary' : project.color}))`,
                      backgroundColor: `rgb(var(--color-${project.color === 'primary' ? 'primary' : project.color}) / 0.05)`
                    }}
                  >
                    {project.domain}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold font-display mb-4 text-textMain group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-textMuted text-base leading-relaxed mb-8 flex-grow">
                  {project.shortDescription}
                </p>
                
                <div className="mt-auto">
                  <Link to={`/projects/${project.id}`}>
                    <Button 
                      variant="outline" 
                      className="group/btn flex items-center gap-2 border-primary/20 hover:border-primary/50"
                    >
                      View Details 
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
