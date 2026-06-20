import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle } from 'lucide-react';

const StudentAttendance = ({ student }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0); 
  
  useEffect(() => {
    fetchAttendance();
  }, [student?.email]);

  useEffect(() => {
    let timer;
    if (isCheckedIn && !todayRecord?.time_out && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCheckedIn, todayRecord, timeLeft]);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.get('https://api.mirafuturetechvision.com/api/student/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const records = res.data;
      setAttendanceRecords(records);
      
      const todayString = new Date().toDateString();
      const current = records.find(r => new Date(r.date).toDateString() === todayString);
      
      if (current) {
        setTodayRecord(current);
        const checkedIn = !!current.time_in && !current.time_out;
        setIsCheckedIn(checkedIn);
        
        if (checkedIn) {
          const [hours, minutes, seconds] = current.time_in.split(':').map(Number);
          const timeInDate = new Date();
          timeInDate.setHours(hours, minutes, seconds || 0, 0);
          
          const now = new Date();
          const diffSeconds = Math.floor((now - timeInDate) / 1000);
          const requiredSeconds = 2 * 60 * 60; // 2 hours
          
          if (diffSeconds < requiredSeconds) {
            setTimeLeft(requiredSeconds - diffSeconds);
          } else {
            setTimeLeft(0);
          }
        }
      } else {
        setTodayRecord(null);
        setIsCheckedIn(false);
        setTimeLeft(0);
      }
    } catch (error) {
      console.error("Error fetching attendance", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInOut = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      if (!isCheckedIn) {
        await axios.post('https://api.mirafuturetechvision.com/api/student/attendance/checkin', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        if (timeLeft > 0) return; 
        await axios.post('https://api.mirafuturetechvision.com/api/student/attendance/checkout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      await fetchAttendance();
    } catch (error) {
      console.error("Error updating attendance", error);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalPresent = attendanceRecords.filter(r => r.status === 'Present').length;
  const totalDays = 30;

  if (loading) return <div className="text-center p-10 text-slate-500">Loading attendance...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 col-span-1 md:col-span-2 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Today's Attendance</h3>
          <p className="text-slate-500 mb-6">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {!isCheckedIn && !todayRecord?.time_out && (
              <button
                onClick={handleCheckInOut}
                className="w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/30 active:scale-95 transition-all"
              >
                Check In
              </button>
            )}

            {isCheckedIn && !todayRecord?.time_out && (
              <>
                <button
                  onClick={handleCheckInOut}
                  disabled={timeLeft > 0}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all ${
                    timeLeft > 0 
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-amber-500 hover:bg-amber-600 hover:shadow-amber-500/30 active:scale-95'
                  }`}
                >
                  Check Out
                </button>
                {timeLeft > 0 && (
                  <p className="text-sm font-medium text-amber-600 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 animate-pulse" /> 
                    Minimum 2 hours required. Time left: {formatTime(timeLeft)}
                  </p>
                )}
                {timeLeft === 0 && (
                  <p className="text-sm font-medium text-emerald-600 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> 
                    You may check out now.
                  </p>
                )}
              </>
            )}

            {todayRecord?.time_out && (
              <div className="w-full py-4 px-6 rounded-xl font-bold text-slate-500 bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Completed for Today
              </div>
            )}
          </div>

          <div className="flex justify-between w-full max-w-md mt-8 border-t border-slate-100 pt-6">
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Time In</p>
              <p className="text-lg font-bold text-slate-800">{todayRecord?.time_in || '--:--'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Time Out</p>
              <p className="text-lg font-bold text-slate-800">{todayRecord?.time_out || '--:--'}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-6">Attendance Overview</h3>
            <div className="space-y-4">
              <div>
                <p className="text-4xl font-black">{totalPresent} <span className="text-lg font-normal text-slate-400">/ {totalDays}</span></p>
                <p className="text-sm text-slate-400 mt-1">Days Present</p>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(totalPresent / totalDays) * 100}%` }}></div>
              </div>
            </div>
          </div>
          <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Good standing
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Recent Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="py-4 px-6 font-semibold">Date</th>
                <th className="py-4 px-6 font-semibold">Check In</th>
                <th className="py-4 px-6 font-semibold">Check Out</th>
                <th className="py-4 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {attendanceRecords.slice(0, 7).map((record, index) => (
                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-700">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-slate-600">{record.time_in || '--'}</td>
                  <td className="py-4 px-6 text-slate-600">{record.time_out || '--'}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
