import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
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
        <div className="container-fluid p-0">
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <Link className="navbar-brand" to="/">Project Management App</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">Sign Up</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/create-project">Create Project</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/hardware-management">Hardware Management</Link>
                </li>
              </ul>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/create-project"
              element={<CreateProject onProjectSelect={handleProjectSelect} />}
            />
            <Route
              path="/hardware-management"
              element={<HardwareManagement projectID={selectedProjectID} />}
            />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
