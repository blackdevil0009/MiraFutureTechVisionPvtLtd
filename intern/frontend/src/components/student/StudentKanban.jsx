import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle, ExternalLink } from 'lucide-react';

const StudentKanban = () => {
  const [columns, setColumns] = useState({ todo: [], inProgress: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState({ isOpen: false, taskId: null, taskTitle: '', submissionUrl: '', githubUrl: '' });
  const [submitStatus, setSubmitStatus] = useState('');

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.get('http://localhost:5001/api/student/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const todo = [];
      const inProgress = [];
      const done = [];

      res.data.forEach(p => {
        const task = {
          id: p.id.toString(),
          title: p.title,
          desc: p.description,
          priority: 'High',
          file: p.resource_url,
          status: p.submission_status,
          submissionUrl: p.submission_url,
          githubUrl: p.github_url
        };

        if (!p.submission_status) {
          // Do nothing. It hasn't been added to Kanban yet.
        } else if (p.submission_status === 'Started' || p.submission_status === 'Rejected') {
          todo.push(task);
        } else if (p.submission_status === 'Pending Review') {
          inProgress.push(task);
        } else if (p.submission_status === 'Approved') {
          done.push(task);
        }
      });
      
      setColumns({ todo, inProgress, done });
    } catch (error) {
      console.error("Error fetching projects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!submitModal.submissionUrl && !submitModal.githubUrl) return alert("Please provide at least one URL.");
    
    setSubmitStatus('submitting');
    try {
      const token = localStorage.getItem('studentToken');
      await axios.post('http://localhost:5001/api/student/submit-project', {
        project_id: submitModal.taskId,
        submission_url: submitModal.submissionUrl,
        github_url: submitModal.githubUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSubmitStatus('success');
      fetchProjects(); // refresh the board immediately
      
      setTimeout(() => {
        setSubmitModal({ isOpen: false, taskId: null, taskTitle: '', submissionUrl: '', githubUrl: '' });
        setSubmitStatus('');
      }, 1500);
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-600';
      case 'Medium': return 'bg-orange-100 text-orange-600';
      case 'Low': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const TaskCard = ({ task, type }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all mb-3 group flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        {task.status === 'Rejected' && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-600">
            Rejected
          </span>
        )}
      </div>
      
      <h4 className="font-bold text-slate-800 mb-1">{task.title}</h4>
      <p className="text-sm text-slate-500 line-clamp-3 flex-1 mb-3">{task.desc}</p>
      
      {task.file && (
        <a href={task.file} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 mb-3 w-fit">
          <ExternalLink className="w-3 h-3" /> View Resource
        </a>
      )}

      <div className="pt-3 border-t border-slate-100 mt-auto">
        {type === 'todo' && (
          <button 
            onClick={() => setSubmitModal({ isOpen: true, taskId: task.id, taskTitle: task.title, submissionUrl: '', githubUrl: '' })}
            className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            Submit Task
          </button>
        )}
        
        {type === 'inProgress' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-amber-600 font-medium flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              Pending Review
            </span>
            <div className="flex gap-2">
              {task.githubUrl && (
                <a href={task.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-800 transition-colors" title="GitHub Repository">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                </a>
              )}
              {task.submissionUrl && (
                <a href={task.submissionUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors" title="Live Deployment">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}
        
        {type === 'done' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Approved
            </span>
            <div className="flex gap-2">
              {task.githubUrl && (
                <a href={task.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-800 transition-colors" title="GitHub Repository">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                </a>
              )}
              {task.submissionUrl && (
                <a href={task.submissionUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors" title="Live Deployment">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col relative">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Tasks</h2>
          <p className="text-slate-500">Track and submit your assigned projects here.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {/* To Do Column */}
        <div className="bg-slate-100/50 rounded-2xl flex flex-col border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              To Do
            </h3>
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{columns.todo.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {columns.todo.map(task => <TaskCard key={task.id} task={task} type="todo" />)}
            {columns.todo.length === 0 && !loading && (
              <div className="text-center p-6 text-slate-400 text-sm">No pending tasks!</div>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-blue-50/50 rounded-2xl flex flex-col border border-blue-100">
          <div className="p-4 border-b border-blue-100 flex items-center justify-between">
            <h3 className="font-bold text-blue-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              In Progress
            </h3>
            <span className="bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{columns.inProgress.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {columns.inProgress.map(task => <TaskCard key={task.id} task={task} type="inProgress" />)}
            {columns.inProgress.length === 0 && !loading && (
              <div className="text-center p-6 text-blue-400/70 text-sm">No tasks pending review.</div>
            )}
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-emerald-50/50 rounded-2xl flex flex-col border border-emerald-100">
          <div className="p-4 border-b border-emerald-100 flex items-center justify-between">
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Completed
            </h3>
            <span className="bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold">{columns.done.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {columns.done.map(task => <TaskCard key={task.id} task={task} type="done" />)}
            {columns.done.length === 0 && !loading && (
              <div className="text-center p-6 text-emerald-500/70 text-sm">Complete a task to see it here.</div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {submitModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Submit Project</h3>
              <button 
                onClick={() => setSubmitModal({ ...submitModal, isOpen: false })}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitTask} className="p-6 space-y-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Task</p>
                <p className="font-semibold text-slate-800">{submitModal.taskTitle}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Deployed Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={submitModal.submissionUrl}
                    onChange={(e) => setSubmitModal({ ...submitModal, submissionUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    GitHub URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={submitModal.githubUrl}
                    onChange={(e) => setSubmitModal({ ...submitModal, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-colors"
                  />
                </div>
              </div>

              {submitStatus === 'error' && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  Failed to submit project. Please try again.
                </div>
              )}

              {submitStatus === 'success' && (
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm border border-emerald-100 flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4" /> Successfully submitted!
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitStatus === 'submitting' || submitStatus === 'success' || (!submitModal.submissionUrl && !submitModal.githubUrl)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-70 flex justify-center items-center"
                >
                  {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentKanban;
