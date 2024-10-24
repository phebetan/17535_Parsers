import React, { useState } from 'react';
import axios from 'axios';

const CreateProject = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectID, setProjectID] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/create_project', { name, description, projectID });
      alert(res.data.message);
    } catch (err) {
      alert('Error creating project!');
    }
  };

  return (
    <div className="card p-4">
      <h2 className="mb-4">Create Project</h2>
      <form onSubmit={handleSubmit}>
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
    </div>
  );
};

export default CreateProject;
