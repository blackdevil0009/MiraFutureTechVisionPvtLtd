import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Award, Briefcase, Hash, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();
  if (!user) return null;

  const infoFields = [
    { icon: Hash,     label: 'Employee ID',  value: user.emp_id || 'ID Pending' },
    { icon: Mail,     label: 'Email Address', value: user.email },
    { icon: Phone,    label: 'Phone Number',  value: user.number || 'Not provided' },
    { icon: MapPin,   label: 'Address',       value: user.address || 'Not provided' },
    { icon: Briefcase,label: 'Designation',   value: user.designation || 'Not set' },
    { icon: Award,    label: 'Account Status',value: user.verified ? 'Verified ✓' : 'Pending Verification' },
  ];

  return (
    <div className="p-6 md:p-10 text-white">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400 mt-1">Your personal and account information</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
        {/* Avatar Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="md:col-span-1 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 backdrop-blur-sm flex items-center justify-center mb-4 shadow-xl">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white text-center">{user.name}</h2>
            <span className="mt-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium text-white/90 border border-white/20">
              {user.emp_id || 'ID Pending'}
            </span>
            <span className="mt-1.5 text-blue-200 text-sm text-center">{user.designation || 'Employee'}</span>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Status</span>
              {user.verified
                ? <span className="text-emerald-400 text-sm font-bold flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Verified</span>
                : <span className="text-amber-400 text-sm font-bold">Pending</span>
              }
            </div>
          </div>
        </motion.div>

        {/* Info Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 pb-3 border-b border-slate-700 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" /> Personal Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-5">
            {infoFields.map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">{label}</label>
                <div className="flex items-center gap-3 p-3.5 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                  <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-200 text-sm font-medium truncate">{value}</span>
                </div>
              </div>
            ))}
          </div>

          {user.resume_link && (
            <div className="mt-6 pt-5 border-t border-slate-700">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Resume</label>
              <a href={user.resume_link} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-600/30 transition-colors">
                <Briefcase className="w-4 h-4" /> View Resume →
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
