import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Briefcase, Mail, Phone, MapPin, Award, CalendarCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3 text-blue-400">
          <Briefcase className="w-6 h-6" />
          <span className="font-bold text-xl text-white">Employee Portal</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20 font-medium">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 md:p-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-slate-400 text-lg">Here is your employee profile and status.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-1 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 border-4 border-white/30 backdrop-blur-sm">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <span className="mt-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium text-white/90 border border-white/20">
                {user.emp_id || 'ID Pending'}
              </span>
              <span className="mt-2 text-blue-200 text-sm">{user.designation}</span>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl mb-4 border border-slate-700">
                <span className="text-slate-400 text-sm">Account Status</span>
                {user.verified ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-sm font-bold"><Award className="w-4 h-4" /> Verified</span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 text-sm font-bold">Pending Review</span>
                )}
              </div>
              
              <Link to="/attendance" className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 py-3 rounded-xl font-semibold transition-colors">
                <CalendarCheck className="w-5 h-5" /> Mark Attendance
              </Link>
            </div>
          </motion.div>

          {/* Details Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Personal Information</h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Full Name</label>
                <div className="flex items-center gap-3 text-slate-300">
                  <User className="w-5 h-5 text-slate-500" /> {user.name}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Email Address</label>
                <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="w-5 h-5 text-slate-500" /> {user.email}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-500 mb-1 block">Phone Number</label>
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone className="w-5 h-5 text-slate-500" /> {user.number}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-500 mb-1 block">Current Address</label>
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin className="w-5 h-5 text-slate-500" /> {user.address || 'Not provided'}
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-6 mt-10 border-b border-slate-700 pb-4">Professional Details</h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Job Title / Designation</label>
                <div className="text-lg font-medium text-blue-400">{user.designation}</div>
              </div>
              
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Resume Link</label>
                {user.resume_link ? (
                  <a href={user.resume_link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-2">
                    View Document
                  </a>
                ) : (
                  <span className="text-slate-500">Not provided</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
