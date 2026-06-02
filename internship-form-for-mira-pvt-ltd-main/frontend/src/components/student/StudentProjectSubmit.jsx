import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink, CheckCircle, Plus } from 'lucide-react';

const StudentProjectSubmit = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState({ id: null, status: '' });
  
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.get('http://localhost:5001/api/student/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSelectProject = async (projectId) => {
    setActionStatus({ id: projectId, status: 'loading' });
    try {
      const token = localStorage.getItem('studentToken');
      await axios.post('http://localhost:5001/api/student/select-project', { project_id: projectId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActionStatus({ id: projectId, status: 'success' });
      await fetchProjects(); // Refresh data to get updated submission_status
      setTimeout(() => setActionStatus({ id: null, status: '' }), 3000);
    } catch (error) {
      console.error("Error selecting project", error);
      setActionStatus({ id: projectId, status: 'error' });
      setTimeout(() => setActionStatus({ id: null, status: '' }), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Project Catalog</h2>
        <p className="text-slate-500">Browse and select projects assigned to your domain. Added projects will appear in your Kanban board.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading available projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <p>No projects have been assigned to your domain yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(proj => {
            const isSelected = !!proj.submission_status;
            const isLoading = actionStatus.id === proj.id && actionStatus.status === 'loading';
            
            return (
              <div key={proj.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                      {proj.target_audience === 'All' ? 'General Task' : 'Domain Specific'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{proj.title}</h3>
                  <p className="text-slate-500 text-sm mb-6 flex-1">{proj.description}</p>
                  
                  {proj.resource_url && (
                    <a href={proj.resource_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors w-fit mb-4">
                      <ExternalLink className="w-4 h-4" /> View Resources
                    </a>
                  )}
                  
                  <div className="pt-6 border-t border-slate-100 mt-auto">
                    {isSelected ? (
                      <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-emerald-100">
                        <CheckCircle className="w-4 h-4" />
                        Added to My Tasks
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleSelectProject(proj.id)}
                        disabled={isLoading}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        {isLoading ? 'Adding...' : 'Add to Kanban'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentProjectSubmit;
