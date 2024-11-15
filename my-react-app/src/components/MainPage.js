import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';

const MainPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login'); // Redirect to the Login page
  };

  return (
    <div className="main-container">
      <div className="content-wrapper">
        <h1 className="main-title">Welcome to the Project Management App</h1>
        <p className="main-subtitle">Manage your projects and hardware seamlessly.</p>
        <button className="btn-main" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default MainPage;
