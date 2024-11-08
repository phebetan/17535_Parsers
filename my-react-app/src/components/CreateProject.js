import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';

const CreateProject = ({ onProjectSelect }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectID, setProjectID] = useState('');
  const [existingProjects, setExistingProjects] = useState([]);
  const { userid } = useContext(UserContext);

  // State for manually inputted project ID for selection
  const [manualProjectID, setManualProjectID] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.post('http://localhost:5000/get_user_projects_list', { userid });
        setExistingProjects(res.data.projects);
      } catch (err) {
        alert('Error fetching projects!');
      }
    };
    if (userid) fetchProjects();
  }, [userid]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/create_project', { name, description, projectID });
      if (res.data.message === 'Project created successfully!') {
        setExistingProjects([...existingProjects, { projectID, name, description }]);
        setName('');
        setDescription('');
        setProjectID('');
        alert('Project created successfully!');
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert('Error creating project!');
    }
  };

  const handleProjectSelect = (id) => {
    onProjectSelect(id); // Pass selected projectID to parent component
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
            value={projectID}
            onChange={(e) => setProjectID(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">Create Project</button>
      </form>

      {/* List of existing projects */}
      <div className="mt-4">
        <h3>Or Select an Existing Project</h3>
        <ul className="list-group mt-2">
          {existingProjects.map((project) => (
            <li key={project.projectID} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{project.name} - {project.description}</span>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleProjectSelect(project.projectID)}
              >
                Select Project
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Manual Project ID Selection */}
      <div className="mt-4">
        <label>Enter Project ID to Select</label>
        <input
          type="text"
          className="form-control"
          value={manualProjectID}
          onChange={(e) => setManualProjectID(e.target.value)}
          placeholder="Enter Project ID"
        />
        <button
          className="btn btn-outline-primary mt-2"
          onClick={() => handleProjectSelect(manualProjectID)}
          disabled={!manualProjectID.trim()} // Disable button if input is empty
        >
          Select Project by ID
        </button>
      </div>
    </div>
  );
};

export default CreateProject;
