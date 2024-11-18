import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignUp.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const SignUp = () => {
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/add_user`, {
        userid,
        password,
      });

      if (res.data.message === 'User created successfully!') {
        alert('Account created! Redirecting to login.');
        navigate('/login'); // Redirect to login after successful signup
      } else {
        alert(res.data.message || 'Sign up failed.');
      }
    } catch (err) {
      console.error('Error during sign up:', err);
      alert('Error signing up!');
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="User ID"
          value={userid}
          onChange={(e) => setUserid(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-signup">Sign Up</button>
      </form>
      <div className="login-link">
        <p>Already have an account? <span onClick={() => navigate('/login')} className="link">Login</span></p>
      </div>
    </div>
  );
};

export default SignUp;
