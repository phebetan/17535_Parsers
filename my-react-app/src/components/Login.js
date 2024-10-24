import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [userid, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/login', { userid, password });
      alert(res.data.message);
    } catch (err) {
      alert('Invalid credentials!');
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
