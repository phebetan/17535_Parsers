import React from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';

const MainPage = () => {
  return (
    <div className="main-container">
      <div className="content-wrapper">
        <h1 className="main-title">Project Management App</h1>
        <p className="main-subtitle">ECE 461L Team Project</p>
        <Link to="/login" className="btn btn-main mt-3">
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default MainPage;
