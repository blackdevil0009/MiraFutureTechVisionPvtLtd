import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ListTodo, Briefcase, CalendarCheck, CheckCircle,
  Clock, AlertTriangle, TrendingUp, BarChart2, Layout
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const TOKEN = localStorage.getItem('emp_token');
  const HEADERS = { Authorization: `Bearer ${TOKEN}` };

  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 });
  const [projectCount, setProjectCount] = useState(0);
  const [attendanceDays, setAttendanceDays] = useState(0);
  const [recentTasks, setRecentTasks] = useState([]);
  const [markedToday, setMarkedToday] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [taskRes, projRes, attRes] = await Promise.all([
        fetch('http://localhost:5000/api/tasks', { headers: HEADERS }),
        fetch('http://localhost:5000/api/projects', { headers: HEADERS }),
        fetch('http://localhost:5000/api/employees/attendance', { headers: HEADERS }),
      ]);

      if (taskRes.ok) {
        const tasks = await taskRes.json();
        const now = new Date();
        let completed = 0, inProgress = 0, pending = 0, overdue = 0;
        tasks.forEach(t => {
          if (t.status === 'Completed') completed++;
          else if (t.status === 'In Progress') inProgress++;
          else if (t.status === 'Pending') {
            if (new Date(t.due_date) < now) overdue++;
            else pending++;
          }
        });
        setTaskStats({ total: tasks.length, completed, inProgress, pending, overdue });
        setRecentTasks(tasks.slice(0, 5));
      }

      if (projRes.ok) {
        const projects = await projRes.json();
        setProjectCount(projects.length);
      }

      if (attRes.ok) {
        const att = await attRes.json();
        setAttendanceDays(att.length);
        if (att.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const lastDate = new Date(att[0].date).toISOString().split('T')[0];
          setMarkedToday(lastDate === today);
        }
      }
    } catch (e) { console.error(e); }
  };

  const completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  const statCards = [
    { label: 'Total Tasks',    value: taskStats.total,     icon: ListTodo,     color: 'blue',    sub: `${taskStats.completed} completed` },
    { label: 'In Progress',    value: taskStats.inProgress, icon: TrendingUp,  color: 'indigo',  sub: `${taskStats.pending} pending` },
    { label: 'Projects',       value: projectCount,         icon: Briefcase,   color: 'purple',  sub: 'Active projects' },
    { label: 'Days Present',   value: attendanceDays,       icon: CalendarCheck, color: 'emerald', sub: markedToday ? '✓ Marked today' : 'Not marked today' },
    { label: 'Overdue Tasks',  value: taskStats.overdue,    icon: AlertTriangle, color: 'rose',   sub: 'Needs attention' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: BarChart2,  color: 'amber',   sub: 'Task completion' },
  ];

  const colorMap = {
    blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400'   },
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
    emerald:{ bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',text: 'text-emerald-400'},
    rose:   { bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   text: 'text-rose-400'   },
    amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400'  },
  };

  const statusColors = {
    'Pending':     'bg-slate-700 text-slate-300',
    'In Progress': 'bg-indigo-500/10 text-indigo-400',
    'Review':      'bg-amber-500/10 text-amber-400',
    'Completed':   'bg-emerald-500/10 text-emerald-400',
  };

  return (
    <div className="p-6 md:p-10 text-white">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, <span className="text-white font-medium">{user?.name?.split(' ')[0]}</span> — here's your performance overview.</p>
        </div>
        {!markedToday && (
          <Link to="/attendance" className="px-4 py-2.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-600/30 transition-colors flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" /> Mark Today's Attendance
          </Link>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, sub }, i) => {
          const c = colorMap[color];
          return (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-colors shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl border ${c.bg} ${c.border}`}>
                  <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <span className={`text-3xl font-black ${c.text}`}>{value}</span>
              </div>
              <p className="font-semibold text-slate-200 text-sm">{label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Task Progress Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="md:col-span-1 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-white mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-blue-400" /> Task Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Completed',   value: taskStats.completed,  color: 'bg-emerald-500' },
              { label: 'In Progress', value: taskStats.inProgress,  color: 'bg-blue-500'    },
              { label: 'Pending',     value: taskStats.pending,     color: 'bg-slate-500'   },
              { label: 'Overdue',     value: taskStats.overdue,     color: 'bg-rose-500'    },
            ].map(({ label, value, color }) => {
              const pct = taskStats.total > 0 ? Math.round((value / taskStats.total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-slate-300 font-medium">{value} <span className="text-slate-500 text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.4 }}
                      className={`h-full rounded-full ${color}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Circular completion */}
          <div className="mt-6 pt-5 border-t border-slate-700 flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="#3b82f6" strokeWidth="8"
                  strokeDasharray={`${completionRate * 1.634} 163.4`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-blue-400">{completionRate}%</span>
            </div>
            <div>
              <p className="text-white font-semibold">Completion Rate</p>
              <p className="text-slate-500 text-xs mt-0.5">{taskStats.completed} of {taskStats.total} tasks done</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h3 className="font-bold text-white flex items-center gap-2"><ListTodo className="w-5 h-5 text-blue-400" /> Recent Tasks</h3>
            <Link to="/my-tasks" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">View all →</Link>
          </div>
          <div className="divide-y divide-slate-700">
            {recentTasks.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                <ListTodo className="w-10 h-10 mx-auto mb-3 opacity-20" />
                No tasks assigned yet.
              </div>
            ) : (
              recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-200 text-sm truncate">{task.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3" />{task.project_name || 'No project'}
                      <span className="mx-1">·</span>
                      <Clock className="w-3 h-3" />{new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[task.status] || 'bg-slate-700 text-slate-300'}`}>
                      {task.status}
                    </span>
                    {new Date(task.due_date) < new Date() && task.status !== 'Completed' && (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {recentTasks.length > 0 && (
            <div className="p-4 border-t border-slate-700 flex gap-3">
              <Link to="/kanban" className="flex-1 text-center py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Layout className="w-4 h-4" /> Open Kanban
              </Link>
              <Link to="/my-tasks" className="flex-1 text-center py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> All My Tasks
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
