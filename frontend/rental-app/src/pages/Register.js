// frontend/rental-app/src/pages/Register.js

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Register = () => {
  const { role } = useParams(); // Extract role from URL (tenant or owner)
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Access login function from AuthContext

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: role, // Set role based on URL parameter
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { name, email, password } = formData;

  // Handle input changes
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, formData);
      setSuccess('Registration successful! Redirecting to dashboard...');
      
      // Optionally, log in the user immediately after registration
      login(res.data.token);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error(err.response);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <h2>Register as a {role === 'tenant' ? 'Tenant' : 'Property Owner'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="name">Name:</label><br/>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            required
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label><br/>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            placeholder="Enter your email address"
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label><br/>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            placeholder="Enter a secure password"
          />
        </div>
        <div>
          <label htmlFor="role">Role:</label><br/>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            readOnly
          />
        </div>
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login here</a>.
      </p>
    </div>
  );
};

export default Register;