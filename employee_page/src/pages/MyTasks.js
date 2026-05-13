import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/tasks', {
          headers: { Authorization: `Bearer ${localStorage.getItem('emp_token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
          calculateStats(data);
        } else {
          console.error('Failed to fetch tasks:', res.status);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchMyTasks();
  }, []);

  const calculateStats = (data) => {
    const now = new Date();
    let completed = 0, pending = 0, overdue = 0;
    data.forEach(t => {
      if (t.status === 'Completed') completed++;
      else if (new Date(t.due_date) < now) overdue++;
      else pending++;
    });
    setStats({ total: data.length, completed, pending, overdue });
  };

  const priorityColors = {
    'Urgent': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'High': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Medium': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Low': 'bg-slate-700 text-slate-300 border-slate-600'
  };

  const statusColors = {
    'Pending': 'bg-slate-700 text-slate-300 border-slate-600',
    'In Progress': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'Review': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  return (
    <div className="p-6 md:p-10 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your tasks and productivity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex items-center">
          <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400 mr-4 border border-blue-500/20"><ListTodo className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-400">Total Tasks</p><p className="text-2xl font-bold text-white">{stats.total}</p></div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex items-center">
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 mr-4 border border-emerald-500/20"><CheckCircle className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-400">Completed</p><p className="text-2xl font-bold text-white">{stats.completed}</p></div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex items-center">
          <div className="p-4 rounded-xl bg-indigo-500/10 text-indigo-400 mr-4 border border-indigo-500/20"><Clock className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-400">Pending</p><p className="text-2xl font-bold text-white">{stats.pending}</p></div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex items-center">
          <div className="p-4 rounded-xl bg-rose-500/10 text-rose-400 mr-4 border border-rose-500/20"><AlertCircle className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-400">Overdue</p><p className="text-2xl font-bold text-white">{stats.overdue}</p></div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700"><h2 className="text-xl font-bold text-white">Recent Assignments</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Task</th>
                <th className="p-5 font-semibold">Project</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 font-semibold">Priority</th>
                <th className="p-5 font-semibold">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {tasks.slice(0, 5).map(task => (
                <tr key={task.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-5 font-medium text-slate-200">{task.title}</td>
                  <td className="p-5 text-slate-400">{task.project_name || 'N/A'}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[task.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority] || 'bg-slate-700'}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-5 text-slate-400 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-slate-500" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-slate-500 bg-slate-800/50">No tasks assigned to you yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;
