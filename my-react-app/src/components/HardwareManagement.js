import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext'; // Assuming UserContext is defined to provide `userid`

const HardwareManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectID, setSelectedProjectID] = useState(null);
  const [hwSets, setHwSets] = useState([]);
  const [checkoutQuantities, setCheckoutQuantities] = useState({});
  const [checkinQuantities, setCheckinQuantities] = useState({});
  const { userid } = useContext(UserContext); // Fetch `userid` from UserContext

  // Fetch user projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.post('http://localhost:5000/get_user_projects_list', { userid });
        console.log("Fetched projects:", res.data.projects); // Log the response
        setProjects(res.data.projects);

        if (res.data.projects.length > 0) {
          setSelectedProjectID(res.data.projects[0].projectId); // Set default project
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        alert('Error fetching projects!');
      }
    };

    if (userid) fetchProjects(); // Only fetch if `userid` is available
  }, [userid]);

  // Fetch hardware sets
  useEffect(() => {
    const fetchHwSets = async () => {
      try {
        const res = await axios.post('http://localhost:5000/get_all_hw_names');
        const hwNames = res.data.hardware_names;

        // Fetch hardware details for each hardware set
        const hwDetailsPromises = hwNames.map(async (hwName) => {
          const hwRes = await axios.post('http://localhost:5000/get_hw_info', { hw_name: hwName });
          return {
            hwName: hwRes.data.hw_name,
            capacity: hwRes.data.capacity,
            availability: hwRes.data.availability,
          };
        });

        const hwDetails = await Promise.all(hwDetailsPromises);
        setHwSets(hwDetails);

        // Initialize checkout and checkin quantities for each hardware set
        setCheckoutQuantities(hwDetails.reduce((acc, hw) => ({ ...acc, [hw.hwName]: 0 }), {}));
        setCheckinQuantities(hwDetails.reduce((acc, hw) => ({ ...acc, [hw.hwName]: 0 }), {}));
      } catch (err) {
        console.error('Error fetching hardware sets:', err);
        alert('Error fetching hardware sets!');
      }
    };

    fetchHwSets();
  }, []);

  // Handle quantity changes for checkout and checkin
  const handleCheckoutChange = (hwName, value) => {
    setCheckoutQuantities((prev) => ({ ...prev, [hwName]: value }));
  };

  const handleCheckinChange = (hwName, value) => {
    setCheckinQuantities((prev) => ({ ...prev, [hwName]: value }));
  };

  // Handle hardware checkout
  const handleCheckout = async (hwName) => {
    const quantity = parseInt(checkoutQuantities[hwName], 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid checkout quantity!');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/check_out', { projectID: selectedProjectID, hw_name: hwName, quantity });
      if (res.data.message === 'Hardware checked out successfully!') {
        alert(`Checked out ${quantity} of ${hwName}`);
        setHwSets((prev) => prev.map((hw) => (hw.hwName === hwName ? { ...hw, availability: hw.availability - quantity } : hw)));
        setCheckoutQuantities((prev) => ({ ...prev, [hwName]: 0 })); // Reset the checkout quantity
      } else {
        alert(res.data.message || 'Error during checkout');
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      alert('Error during checkout!');
    }
  };

  // Handle hardware check-in
  const handleCheckin = async (hwName) => {
    const quantity = parseInt(checkinQuantities[hwName], 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid check-in quantity!');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/check_in', { projectID: selectedProjectID, hw_name: hwName, quantity });
      if (res.data.message === 'Hardware checked in successfully!') {
        alert(`Checked in ${quantity} of ${hwName}`);
        setHwSets((prev) => prev.map((hw) => (hw.hwName === hwName ? { ...hw, availability: hw.availability + quantity } : hw)));
        setCheckinQuantities((prev) => ({ ...prev, [hwName]: 0 })); // Reset the check-in quantity
      } else {
        alert(res.data.message || 'Error during check-in');
      }
    } catch (err) {
      console.error('Error during check-in:', err);
      alert('Error during check-in!');
    }
  };

  return (
    <div className="card p-4">
      <h2 className="mb-4">Hardware Management</h2>

      {/* Project Selection */}
      <div className="mb-3">
        <label htmlFor="projectDropdown" className="form-label">Select Project:</label>
        <select
          id="projectDropdown"
          className="form-select"
          value={selectedProjectID}
          onChange={(e) => setSelectedProjectID(e.target.value)}
        >
          {projects.length === 0 && <option value="">No projects found</option>}
          {projects.map((project) => (
            <option key={project.projectId} value={project.projectId}>
              {project.projectName}
            </option>
          ))}
        </select>
      </div>

      {/* Hardware Table */}
      <table className="table">
        <thead>
          <tr>
            <th>Hardware Set</th>
            <th>Capacity</th>
            <th>Availability</th>
            <th>Checkout Units</th>
            <th>Check-in Units</th>
          </tr>
        </thead>
        <tbody>
          {hwSets.map((hw, index) => (
            <tr key={index}>
              <td>{hw.hwName}</td>
              <td>{hw.capacity}</td>
              <td>{hw.availability}</td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max={hw.availability}
                  value={checkoutQuantities[hw.hwName]}
                  onChange={(e) => handleCheckoutChange(hw.hwName, e.target.value)}
                />
                <button className="btn btn-primary mt-1" onClick={() => handleCheckout(hw.hwName)}>Checkout</button>
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max={hw.capacity - hw.availability}
                  value={checkinQuantities[hw.hwName]}
                  onChange={(e) => handleCheckinChange(hw.hwName, e.target.value)}
                />
                <button className="btn btn-primary mt-1" onClick={() => handleCheckin(hw.hwName)}>Check-in</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HardwareManagement;
