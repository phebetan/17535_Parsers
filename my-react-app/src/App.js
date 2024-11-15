import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { UserProvider, UserContext } from './contexts/UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import SignUp from './components/SignUp';
import Login from './components/Login';
import MainPage from './components/MainPage';
import CreateProject from './components/CreateProject';
import HardwareManagement from './components/HardwareManagement';
import './App.css';

function App() {
  const [selectedProjectID, setSelectedProjectID] = useState(null);

  const handleProjectSelect = (projectID) => {
    setSelectedProjectID(projectID);
  };

  return (
    <UserProvider>
      <Router>
        <AppContent
          onProjectSelect={handleProjectSelect}
          selectedProjectID={selectedProjectID}
        />
      </Router>
    </UserProvider>
  );
}

const AppContent = ({ onProjectSelect, selectedProjectID }) => {
  const { userid } = useContext(UserContext);

  return (
    <div className="container-fluid p-0">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <Link className="navbar-brand" to="/">
          Project Management App
        </Link>
        {userid && (
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/create-project">
                  Create Project
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/hardware-management">
                  Hardware Management
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={() => window.location.reload()}>
                  Logout
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/create-project"
          element={userid ? <CreateProject onProjectSelect={onProjectSelect} /> : <Login />}
        />
        <Route
          path="/hardware-management"
          element={userid ? <HardwareManagement projectID={selectedProjectID} /> : <Login />}
        />
      </Routes>
    </div>
  );
};

export default App;
