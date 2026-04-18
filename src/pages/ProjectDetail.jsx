import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projectsData } from '../data/projectsData';
import Button from '../components/ui/Button';
import { ArrowLeft, ExternalLink, Cpu, CheckCircle2, Target, Lightbulb } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projectsData.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-4xl font-display font-bold text-textMain mb-4">Project Not Found</h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-textMuted hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-display tracking-widest uppercase text-sm font-bold">Back to Projects</span>
          </button>

          {/* Header */}
          <div className="mb-12">
            <span 
              className="inline-block px-4 py-1.5 rounded-full border mb-6 text-xs font-display tracking-widest uppercase font-bold"
              style={{ 
                borderColor: `rgb(var(--color-${project.color === 'primary' ? 'primary' : project.color}) / 0.3)`,
                color: `rgb(var(--color-${project.color === 'primary' ? 'primary' : project.color}))`,
                backgroundColor: `rgb(var(--color-${project.color === 'primary' ? 'primary' : project.color}) / 0.05)`
              }}
            >
              {project.domain}
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-textMain mb-6">
              {project.title}
            </h1>
            <p className="text-xl text-textMuted leading-relaxed">
              {project.fullDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column: Features & Tech Stack */}
            <div className="space-y-12">
              <section>
                <h3 className="text-2xl font-display font-bold text-textMain mb-6 flex items-center gap-3">
                  <CheckCircle2 className="text-primary" /> Key Features
                </h3>
                <ul className="space-y-4">
                  {project.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 text-textMuted"
                    >
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-2xl font-display font-bold text-textMain mb-6 flex items-center gap-3">
                  <Cpu className="text-primary" /> Technology Stack
                </h3>
                <div className="flex flex-wrap gap-3">
                  {project.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-lg bg-surface border border-borderBase text-textMuted text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Use Cases & Future Scope */}
            <div className="space-y-12">
              <section>
                <h3 className="text-2xl font-display font-bold text-textMain mb-6 flex items-center gap-3">
                  <Target className="text-primary" /> Use Cases
                </h3>
                <ul className="space-y-4">
                  {project.useCases.map((useCase, i) => (
                    <li key={i} className="flex items-start gap-3 text-textMuted">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                      {useCase}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-2xl font-display font-bold text-textMain mb-6 flex items-center gap-3">
                  <Lightbulb className="text-primary" /> Future Scope
                </h3>
                <ul className="space-y-4">
                  {project.futureScope.map((scope, i) => (
                    <li key={i} className="flex items-start gap-3 text-textMuted">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {scope}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Action Button */}
              {project.demoLink && (
                <div className="pt-8">
                  <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="glow" className="w-full md:w-auto flex items-center justify-center gap-2">
                      Try Demo / Visit Project <ExternalLink size={18} />
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetail;
