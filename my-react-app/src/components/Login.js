import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import './Login.css';

const Login = () => {
  const [userid, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const { setUserid } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', { userid, password });
      if (res.data.message === 'Login successful!') {
        setUserid(userid); // Save userid in context
        alert(res.data.message);
      } else {
        alert('Invalid credentials!');
      }
    } catch (err) {
      alert('Login failed!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>UserID</label>
            <input
              type="text"
              className="form-control"
              value={userid}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-login">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
