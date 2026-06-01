import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_URL from '../config';
import { CalendarCheck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Attendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('emp_token');
      const res = await axios.get(`${API_URL}/api/employees/attendance`, {
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

  const getLocationArea = async (lat, lon) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      if (res.data && res.data.address) {
        const addr = res.data.address;
        return addr.suburb || addr.city_district || addr.city || addr.town || addr.state_district || res.data.display_name;
      }
      return 'Unknown Area';
    } catch (e) {
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  };

  const executeAttendance = async (locationStr) => {
    try {
      const token = localStorage.getItem('emp_token');
      await axios.post(`${API_URL}/api/employees/attendance`, { location: locationStr }, {
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

  const markAttendance = () => {
    setMarking(true);
    setMessage({ text: '', type: '' });
    
    if (!('geolocation' in navigator)) {
      setMessage({ text: 'Geolocation is not supported by your browser', type: 'error' });
      setMarking(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const area = await getLocationArea(pos.coords.latitude, pos.coords.longitude);
        await executeAttendance(area);
      },
      (err) => {
        setMessage({ text: 'Location access is required to mark attendance.', type: 'error' });
        setMarking(false);
      }
    );
  };
  const executeCheckout = async (locationStr) => {
    try {
      const token = localStorage.getItem('emp_token');
      await axios.put(`${API_URL}/api/employees/attendance/checkout`, { location: locationStr }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: 'Checked out successfully!', type: 'success' });
      fetchAttendance();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to check out', type: 'error' });
    } finally {
      setMarking(false);
    }
  };

  const markCheckout = () => {
    setMarking(true);
    setMessage({ text: '', type: '' });
    
    if (!('geolocation' in navigator)) {
      setMessage({ text: 'Geolocation is not supported by your browser', type: 'error' });
      setMarking(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const area = await getLocationArea(pos.coords.latitude, pos.coords.longitude);
        await executeCheckout(area);
      },
      (err) => {
        setMessage({ text: 'Location access is required to check out.', type: 'error' });
        setMarking(false);
      }
    );
  };




  const hasCheckedIn = records.length > 0 && new Date(records[0].date).toLocaleDateString() === new Date().toLocaleDateString();
  const hasCheckedOut = hasCheckedIn && !!records[0].time_out;

  return (
    <div className="text-white">
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-8 flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl font-bold mb-2">Mark Today's Attendance</h2>
            <div className="text-slate-400 mb-6 flex flex-col items-center gap-1">
              <span className="text-sm uppercase tracking-wider font-semibold">Current Time</span>
              <span className="text-3xl font-mono text-emerald-400 font-bold tracking-tight bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            {message.text && (
              <div className={`mb-6 p-4 rounded-xl w-full max-w-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {message.text}
              </div>
            )}

            {hasCheckedOut ? (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-6 py-4 rounded-full border border-emerald-500/20 font-semibold">
                <CheckCircle className="w-6 h-6" /> You have successfully completed today's attendance.
              </div>
            ) : hasCheckedIn ? (
              <button
                onClick={markCheckout}
                disabled={marking}
                className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all ${marking ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 text-white hover:shadow-rose-500/25 active:scale-95'}`}
              >
                {marking ? 'Processing...' : <><Clock className="w-6 h-6" /> Check Out Now</>}
              </button>
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
                    <th className="px-6 py-4 font-semibold">Time Out</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                      <td className="px-6 py-4 font-mono text-blue-400">{record.time_in}</td>
                      <td className="px-6 py-4 font-mono text-rose-400">{record.time_out || '--:--:--'}</td>
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
      </div>
    </div>
  );
};
export default Attendance;
