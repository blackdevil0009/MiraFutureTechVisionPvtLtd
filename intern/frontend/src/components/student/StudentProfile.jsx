import { API_URL } from '../../config';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [newSkill, setNewSkill] = useState('');
  
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    college_name: '',
    resume_link: '',
    skills: []
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.get(`${API_URL}/api/student/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let parsedSkills = [];
      if (res.data.skills) {
        try {
          parsedSkills = typeof res.data.skills === 'string' ? JSON.parse(res.data.skills) : res.data.skills;
        } catch (e) {
          // If JSON.parse fails, it might be a comma-separated string from the registration form
          parsedSkills = typeof res.data.skills === 'string' 
            ? res.data.skills.split(',').map(s => s.trim()).filter(Boolean) 
            : [];
        }
      }

      setProfile({
        ...res.data,
        skills: parsedSkills || []
      });
    } catch (error) {
      console.error("Error fetching profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      const token = localStorage.getItem('studentToken');
      await axios.put(`${API_URL}/api/student/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaveStatus('success');
      setIsEditing(false);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error("Error saving profile", error);
      setSaveStatus('error');
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skillToRemove)
    });
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {saveStatus === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-medium">Profile updated successfully!</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-medium">Failed to update profile.</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg shrink-0">
                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 uppercase">
                  {profile.full_name?.charAt(0) || 'S'}
                </div>
              </div>
              <div className="mb-2">
                <h3 className="text-2xl font-bold text-slate-800">{profile.full_name}</h3>
                {profile.domain && (
                  <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-bold tracking-wide uppercase">
                    {profile.domain} Intern
                  </span>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70 flex items-center gap-2"
                >
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-md"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profile.full_name || ''} 
                  disabled={true} // Name comes from initial registration
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email || ''} 
                  disabled={true} // Email can't be changed
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={profile.phone || ''} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">College/University</label>
                <input 
                  type="text" 
                  value={profile.college_name || ''} 
                  onChange={(e) => setProfile({...profile, college_name: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Enter your college name"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Resume Link (Google Drive, Notion, etc.) (Optional)</label>
              <input 
                type="url" 
                value={profile.resume_link || ''} 
                onChange={(e) => setProfile({...profile, resume_link: e.target.value})}
                disabled={!isEditing}
                placeholder="https://"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.skills.length === 0 && !isEditing && (
                  <span className="text-slate-400 text-sm">No skills added yet.</span>
                )}
                {profile.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium border border-blue-100 flex items-center gap-2">
                    {skill}
                    {isEditing && (
                      <button onClick={() => handleRemoveSkill(skill)} className="text-blue-400 hover:text-red-500 transition-colors">
                        &times;
                      </button>
                    )}
                  </span>
                ))}
              </div>
              
              {isEditing && (
                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="E.g. React, Python, Figma"
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button type="submit" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors border border-slate-200">
                    Add Skill
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
