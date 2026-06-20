import React, { useState } from 'react';
import axios from 'axios';

const InternshipForm = ({ internship, onSuccess }) => {
  const COURSE_CONFIG = {
    'B.Tech': {
      branches: ['CS', 'IT', 'AI', 'Data Science', 'ECE', 'Mechanical', 'Civil'],
      duration: '4 Years',
      years: ['1st', '2nd', '3rd', '4th']
    },
    'BCA': {
      branches: ['Computer Applications'],
      duration: '3 Years',
      years: ['1st', '2nd', '3rd']
    },
    'MCA': {
      branches: ['Computer Applications'],
      duration: '2 Years',
      years: ['1st', '2nd']
    },
    'B.Sc': {
      branches: ['Computer Science', 'IT', 'Physics', 'Mathematics'],
      duration: '3 Years',
      years: ['1st', '2nd', '3rd']
    },
    'M.Sc': {
      branches: ['Computer Science', 'IT', 'Physics', 'Mathematics'],
      duration: '2 Years',
      years: ['1st', '2nd']
    }
  };

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    college_name: '',
    degree: 'B.Tech',
    branch: 'CS',
    year: '1st',
    duration: '4 Years',
    domain: internship?.title || 'Full Stack Development',
    skills: '',
    resume_link: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const domains = [
    'Full Stack Development',
    'Frontend Development',
    'Backend Development',
    'Java Development',
    'Python Development',
    'Data Science',
    'Artificial Intelligence',
    'Machine Learning',
    'Cyber Security',
    'Cloud Computing',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'degree') {
      const config = COURSE_CONFIG[value];
      setFormData((prev) => ({
        ...prev,
        degree: value,
        branch: config.branches[0],
        duration: config.duration,
        year: config.years[0]
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setMessage({ type: 'error', text: 'Full Name is required' });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number' });
      return false;
    }

    if (!formData.college_name.trim()) {
      setMessage({ type: 'error', text: 'College Name is required' });
      return false;
    }

    if (!formData.skills.trim()) {
      setMessage({ type: 'error', text: 'Please mention your skills' });
      return false;
    }


    if (!formData.message.trim()) {
      setMessage({ type: 'error', text: 'Message is required' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...formData,
        payment_status: internship?.type === 'Unpaid' ? 'Free' : 'Pending'
      };

      const response = await axios.post(
        'https://api.mirafuturetechvision.com/api/internships/apply',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        if (onSuccess) {
          onSuccess(formData);
        } else {
          setMessage({
            type: 'success',
            text: 'Application submitted successfully!',
          });

          setFormData({
            full_name: '',
            email: '',
            phone: '',
            college_name: '',
            degree: 'B.Tech',
            branch: 'CS',
            year: '1st',
            duration: '4 Years',
            domain: internship?.title || 'Full Stack Development',
            skills: '',
            resume_link: '',
            message: '',
          });
        }
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail || 'Something went wrong. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-12 px-4 text-white font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Mira Future Tech Vision
          </h1>
          <p className="text-xl text-gray-300">Join Our Internship Program</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700">
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm font-medium transition-all ${
                message.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Personal Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit number"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">College Name *</label>
                <input
                  type="text"
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleInputChange}
                  placeholder="Your college name"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Section 2: Academic Info */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Degree *</label>
                <select
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  {Object.keys(COURSE_CONFIG).map((deg) => (
                    <option key={deg} value={deg} className="bg-gray-800">
                      {deg}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Branch *</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  {COURSE_CONFIG[formData.degree].branches.map((br) => (
                    <option key={br} value={br} className="bg-gray-800">
                      {br}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Year *</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  {COURSE_CONFIG[formData.degree].years.map((yr) => (
                    <option key={yr} value={yr} className="bg-gray-800">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Course Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-gray-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Section 3: Professional Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Domain *</label>
                <input
                  type="text"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  placeholder="e.g. Web Development"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Resume / GitHub / LinkedIn URL (Optional)</label>
                <input
                  type="url"
                  name="resume_link"
                  value={formData.resume_link}
                  onChange={handleInputChange}
                  placeholder="Link to Resume, GitHub, or LinkedIn"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Skills *</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="React, Node.js, Python, etc."
                rows="2"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Why do you want to join? *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us about your motivation..."
                rows="4"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 active:scale-95 shadow-lg hover:shadow-blue-500/25'
              }`}
            >
              {loading ? 'Submitting...' : 'Apply Now'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 mt-8 text-sm">
          © 2024 Mira Future Tech Vision Pvt Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default InternshipForm;
