import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, CheckCircle, Users } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('emp_token')}` }
      });
      if (res.ok) setProjects(await res.json());
    } catch (error) { console.error(error); }
  };

  const statusColors = {
    'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Completed': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'On Hold': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="p-6 md:p-10 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Company Projects</h1>
        <p className="text-slate-400 mt-1">Overview of all active projects you are a part of</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                  <Briefcase className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white leading-tight">{project.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[project.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                {project.status || 'Active'}
              </span>
            </div>

            <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">{project.description}</p>

            <div className="border-t border-slate-700 pt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-slate-400">
                <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Start Date</p>
                  <p className="text-slate-300">{new Date(project.start_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center text-slate-400">
                <CheckCircle className="w-4 h-4 mr-2 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Deadline</p>
                  <p className="text-slate-300">{new Date(project.end_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-16 text-center text-slate-500 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
            <Briefcase className="w-16 h-16 mb-4 text-slate-600" />
            <p className="text-lg font-medium text-slate-400">No projects found.</p>
            <p className="text-sm mt-1">You haven't been assigned to any projects yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
