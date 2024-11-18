import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.NODE_ENV === 'production'
  ? '' // Relative path for production
  : 'http://localhost:5000'; // Local development

const CreateProject = ({ onProjectSelect }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [allProjects, setAllProjects] = useState([]); // Store all projects
  const { userid } = useContext(UserContext); // Assuming userid is provided in UserContext
  const navigate = useNavigate();

  const [manualProjectId, setManualProjectId] = useState('');

  // Fetch all projects from the backend
  const fetchAllProjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/get_all_projects`); // Backticks for template literal
      console.log("Fetched projects:", res.data.projects); // Log to verify structure
      setAllProjects(res.data.projects); // Set all projects with correct structure
    } catch (err) {
      console.error('Error fetching all projects:', err);
      alert('Error fetching all projects!');
    }
  };

  // Fetch projects on component mount
  useEffect(() => {
    if (userid) {
      fetchAllProjects();
    }
  }, [userid]);

  // Handle creating a new project
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/create_project`, { // Backticks for template literal
        projectName: name,
        description: description,
        projectId: projectId
      });

      if (res.data.message === 'Project created successfully!') {
        fetchAllProjects(); // Refresh the project list
        setName('');
        setDescription('');
        setProjectId('');
        alert('Project created successfully!');
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Error creating project!');
    }
  };

  // Handle selecting a project
  const handleProjectSelect = async (project) => {
    try {
      console.log("Sending data to join project:", {
        userid: userid,
        projectId: project.projectId
      });  // Log payload data
  
      const res = await axios.post(`${API_URL}/join_project`, { // Backticks for template literal
        userid: userid,
        projectId: project.projectId
      });
  
      if (res.data.message === 'Joined project successfully!') {
        onProjectSelect(project);
        alert(`Successfully joined project: "${project.projectName}"`);
        //navigate('/project-details');
      } else {
        alert('Failed to join project.');
      }
    } catch (err) {
      console.error('Error joining project:', err);
      alert('Error joining project!');
    }
  };

  return (
    <div className="card p-4">
      <h2 className="mb-4">Create or Select Project</h2>

      {/* Form for creating a new project */}
      <form onSubmit={handleCreateSubmit}>
        <div className="form-group">
          <label>Project Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Project ID</label>
          <input
            type="text"
            className="form-control"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">Create Project</button>
      </form>

      {/* List of all projects */}
      <div className="mt-4">
        <h3>Or Select an Existing Project</h3>
        <ul className="list-group mt-2">
          {allProjects.length === 0 ? (
            <li className="list-group-item">No projects available.</li>
          ) : (
            allProjects.map((project) => (
              <li key={project.projectId} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{project.projectId} - {project.description}</span>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => handleProjectSelect(project)} // Pass the project object here
                >
                  Select Project
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Manual Project ID Selection */}
      <div className="mt-4">
        <label>Enter Project ID to Select</label>
        <input
          type="text"
          className="form-control"
          value={manualProjectId}
          onChange={(e) => setManualProjectId(e.target.value)}
          placeholder="Enter Project ID"
        />
        <button
          className="btn btn-outline-primary mt-2"
          onClick={() => handleProjectSelect({ projectId: manualProjectId })}
          disabled={!manualProjectId.trim()}
        >
          Select Project by ID
        </button>
      </div>
    </div>
  );
};

export default CreateProject;
