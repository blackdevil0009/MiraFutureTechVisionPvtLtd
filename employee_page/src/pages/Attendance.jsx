import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogOut, CalendarCheck, CheckCircle, Clock, AlertCircle, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Attendance = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('emp_token');
      const res = await axios.get('http://localhost:5000/api/employees/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const markAttendance = async () => {
    setMarking(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('emp_token');
      await axios.post('http://localhost:5000/api/employees/attendance', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: 'Attendance marked successfully!', type: 'success' });
      fetchAttendance();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to mark attendance', type: 'error' });
    } finally {
      setMarking(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const hasMarkedToday = records.length > 0 && new Date(records[0].date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3 text-blue-400">
          <CalendarCheck className="w-6 h-6" />
          <span className="font-bold text-xl text-white">Attendance</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white flex items-center gap-2">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20 font-medium">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-8 flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl font-bold mb-2">Mark Today's Attendance</h2>
            <p className="text-slate-400 mb-6">Current Server Time: {new Date().toLocaleTimeString()}</p>
            
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl w-full max-w-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {message.text}
              </div>
            )}

            {hasMarkedToday ? (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-6 py-4 rounded-full border border-emerald-500/20 font-semibold">
                <CheckCircle className="w-6 h-6" /> You have successfully marked attendance for today.
              </div>
            ) : (
              <button 
                onClick={markAttendance} 
                disabled={marking}
                className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all ${marking ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/25 active:scale-95'}`}
              >
                {marking ? 'Processing...' : <><Clock className="w-6 h-6" /> Check In Now</>}
              </button>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-8 flex flex-col justify-center text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
              <CalendarCheck className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-1">Total Days</h3>
            <p className="text-4xl font-black text-white">{records.length}</p>
            <p className="text-sm text-slate-400 mt-2">Days Present</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-xl font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-blue-400" /> Attendance History</h3>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
              <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
              <p>No attendance records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/50 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Time In</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                      <td className="px-6 py-4 font-mono text-blue-400">{record.time_in}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};
export default Attendance;
