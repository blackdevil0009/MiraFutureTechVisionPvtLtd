import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/employees/login`, { email: email.trim(), password });
      if (res.data.require2FA) {
        setStep(2);
      } else {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/employees/verify-otp`, { email, otp });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8"
      >
        <div className="text-center mb-8">
          <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            {step === 1 ? <LogIn className="w-8 h-8 text-blue-400" /> : <KeyRound className="w-8 h-8 text-blue-400" />}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Employee Portal</h2>
          <p className="text-slate-400">
            {step === 1 ? 'Sign in to access your dashboard' : 'Enter the 6-digit OTP sent to your email'}
          </p>
        </div>

        {error && <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required
                pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                title="Please enter a valid email address (e.g., yourname@gmail.com)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Forgot Password?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold transition-colors disabled:opacity-50">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="relative">
              <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" required
                maxLength="6"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 text-center tracking-[0.5em] font-mono text-lg outline-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold transition-colors disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-xl font-semibold transition-colors">
              Back to Login
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="mt-6 text-center text-slate-400">
            Need an account? <Link to="/register" className="text-blue-400 hover:underline">Register here</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};
export default Login;
