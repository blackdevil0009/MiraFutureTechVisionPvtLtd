import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, Phone, Briefcase, Link as LinkIcon, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', number: '', designation: '', resume_link: '', address: '', password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await axios.post('https://api.mirafuturetechvision.com/api/employees/register', formData);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Employee Registration</h2>
          <p className="text-slate-400">Join our team! Your account will be reviewed by an admin.</p>
        </div>

        {error && <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-lg mb-6">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input type="text" name="name" onChange={handleChange} placeholder="Full Name" required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input type="email" name="email" onChange={handleChange} placeholder="Email Address" required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input type="tel" name="number" onChange={handleChange} placeholder="Phone Number" required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input type="text" name="designation" onChange={handleChange} placeholder="Designation (e.g. Developer)" required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="relative md:col-span-2">
              <LinkIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input type="url" name="resume_link" onChange={handleChange} placeholder="Resume Link (Google Drive, LinkedIn, etc.)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="relative md:col-span-2">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input type="text" name="address" onChange={handleChange} placeholder="Full Address"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="relative md:col-span-2">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input type="password" name="password" onChange={handleChange} placeholder="Password" required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <button type="submit" className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold transition-colors mt-6">
            Register <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400">
          Already registered? <Link to="/login" className="text-blue-400 hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};
export default Register;
