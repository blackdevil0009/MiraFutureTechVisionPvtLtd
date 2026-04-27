import React, { useState } from 'react';

const UserForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    collegeName: '',
    course: '',
    branch: '',
    passingYear: '',
    email: '',
    rollNumber: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required';
    if (!formData.course.trim()) newErrors.course = 'Course is required';
    if (!formData.branch.trim()) newErrors.branch = 'Branch is required';
    if (!formData.passingYear) newErrors.passingYear = 'Passing year is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const years = [2026, 2027, 2028, 2029, 2030];

  return (
    <div className="user-form-container">
      <div className="form-wrapper">
        <div className="form-header">
          <h1>📝 Student Registration</h1>
          <p>Please fill in your details to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-grid">
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            {/* College Name Field */}
            <div className="form-group">
              <label htmlFor="collegeName">College Name *</label>
              <input
                type="text"
                id="collegeName"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                placeholder="Enter your college name"
                className={errors.collegeName ? 'error' : ''}
              />
              {errors.collegeName && <span className="error-message">{errors.collegeName}</span>}
            </div>

            {/* Course Field */}
            <div className="form-group">
              <label htmlFor="course">Course *</label>
              <input
                type="text"
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g., B.Tech, B.Sc, MCA"
                className={errors.course ? 'error' : ''}
              />
              {errors.course && <span className="error-message">{errors.course}</span>}
            </div>

            {/* Branch Field */}
            <div className="form-group">
              <label htmlFor="branch">Branch *</label>
              <input
                type="text"
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="e.g., CSE, IT, ECE"
                className={errors.branch ? 'error' : ''}
              />
              {errors.branch && <span className="error-message">{errors.branch}</span>}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Roll Number Field */}
            <div className="form-group">
              <label htmlFor="rollNumber">Roll Number *</label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="Enter your roll number"
                className={errors.rollNumber ? 'error' : ''}
              />
              {errors.rollNumber && <span className="error-message">{errors.rollNumber}</span>}
            </div>

            {/* Passing Year Field */}
            <div className="form-group">
              <label htmlFor="passingYear">Expected Passing Year *</label>
              <select
                id="passingYear"
                name="passingYear"
                value={formData.passingYear}
                onChange={handleChange}
                className={errors.passingYear ? 'error' : ''}
              >
                <option value="">Select passing year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.passingYear && <span className="error-message">{errors.passingYear}</span>}
            </div>
          </div>

          <div className="form-info">
            <p>ⓘ This information will be displayed in your quiz results</p>
          </div>

          <button type="submit" className="btn-submit">
            Continue to Quiz <span className="arrow">→</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
