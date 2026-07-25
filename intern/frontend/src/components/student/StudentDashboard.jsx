import { API_URL } from '../../config';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentDashboard = ({ student }) => {
  const [stats, setStats] = useState({
    status: 'Pending',
    pending_tasks: 0,
    attendance_days: 0,
    recent_projects: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const res = await axios.get(`${API_URL}/api/student/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading your dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg shadow-blue-500/20">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {student?.name || 'Student'}! 👋</h1>
        <p className="text-blue-100 opacity-90 max-w-2xl">
          Here is what's happening with your internship today. Keep up the great work and make sure to track your tasks in the Kanban board.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Application Status</p>
            <p className="text-xl font-bold text-slate-800">{stats.status}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Tasks</p>
            <p className="text-xl font-bold text-slate-800">{stats.pending_tasks} Pending</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Days Attended</p>
            <p className="text-xl font-bold text-slate-800">{stats.attendance_days} Days</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Recent Announcements</h3>
          </div>
          <div className="p-6 space-y-4 flex-1">
            <div className="flex gap-4 items-start">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="font-semibold text-slate-800">Welcome to Mira Internships!</p>
                <p className="text-sm text-slate-500 mt-1">Please ensure your profile is up to date and check your Kanban board for your first onboarding task.</p>
                <p className="text-xs text-slate-400 mt-2">Just now</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-2 h-2 mt-2 rounded-full bg-slate-300"></div>
              <div>
                <p className="font-semibold text-slate-800">Update your resume</p>
                <p className="text-sm text-slate-500 mt-1">Make sure you have provided a valid resume link in the Profile tab.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Latest Assigned Projects</h3>
          </div>
          <div className="p-6 flex flex-col flex-1">
            <div className="space-y-4 flex-1">
              {stats.recent_projects.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-6">No projects assigned yet.</div>
              ) : (
                stats.recent_projects.map((project, idx) => (
                  <div key={project.id} className={`flex items-center justify-between p-3 rounded-lg border ${idx === 0 ? 'border-orange-100 bg-orange-50/30' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{project.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{project.description}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 ml-4">{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
