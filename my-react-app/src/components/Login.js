import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import './Login.css';

const Login = () => {
  const { setUserid } = useContext(UserContext);
  const [userid, setUserIdInput] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', {
        userid,
        password,
      });
      if (res.data.userid) {
        setUserid(res.data.userid);
        navigate('/create-project'); // Redirect to Create Project after login
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      alert('Error logging in!');
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="User ID"
          value={userid}
          onChange={(e) => setUserIdInput(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-login">Login</button>
      </form>
      <div className="signup-link">
        <p>Don't have an account? <span onClick={() => navigate('/signup')} className="link">Sign up</span></p>
      </div>
    </div>
  );
};

export default Login;
