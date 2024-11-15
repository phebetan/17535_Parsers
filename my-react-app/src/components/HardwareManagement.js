import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";

const HardwareManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectID, setSelectedProjectID] = useState(null);
  const [hwSets, setHwSets] = useState([]);
  const [checkoutQuantities, setCheckoutQuantities] = useState({});
  const [checkinQuantities, setCheckinQuantities] = useState({});
  const { userid } = useContext(UserContext);

  // Fetch user projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.post(
          "http://localhost:5000/get_user_projects_list",
          { userid }
        );
        setProjects(res.data.projects);
        if (res.data.projects.length > 0) {
          setSelectedProjectID(res.data.projects[0].projectId);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        alert("Error fetching projects!");
      }
    };
    if (userid) fetchProjects();
  }, [userid]);

  // Fetch hardware sets
  useEffect(() => {
    const fetchHwSets = async () => {
      try {
        const res = await axios.post("http://localhost:5000/get_all_hw_names");
        const hwNames = res.data.hardware_names;

        const hwDetails = [];
        for (const hwName of hwNames) {
          const hwRes = await axios.post("http://localhost:5000/get_hw_info", {
            hw_name: hwName,
          });
          hwDetails.push({
            hwName: hwRes.data.hwName,
            capacity: hwRes.data.capacity,
            availability: hwRes.data.availability,
          });
        }
        setHwSets(hwDetails);
        setCheckoutQuantities(
          hwDetails.reduce((acc, hw) => ({ ...acc, [hw.hwName]: 0 }), {})
        );
        setCheckinQuantities(
          hwDetails.reduce((acc, hw) => ({ ...acc, [hw.hwName]: 0 }), {})
        );
      } catch (err) {
        console.error("Error fetching hardware sets:", err);
        alert("Error fetching hardware sets!");
      }
    };
    fetchHwSets();
  }, []);

  // Update checkout quantities
  const handleCheckoutChange = (hwName, value) => {
    setCheckoutQuantities((prev) => ({ ...prev, [hwName]: value }));
  };

  // Update check-in quantities
  const handleCheckinChange = (hwName, value) => {
    setCheckinQuantities((prev) => ({ ...prev, [hwName]: value }));
  };

  // Handle checkout submit
  const handleCheckoutSubmit = async (hwName) => {
    const quantity = parseInt(checkoutQuantities[hwName], 10);

    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid checkout quantity!");
      return;
    }

    const hardware = hwSets.find((hw) => hw.hwName === hwName);
    if (quantity > hardware.availability) {
      alert("Cannot checkout more units than available!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/check_out", {
        projectID: selectedProjectID,
        hw_name: hwName,
        quantity,
      });

      if (res.data.message === "Hardware checked out successfully!") {
        alert(`Checked out ${quantity} of ${hwName}`);
        setHwSets((prev) =>
          prev.map((hw) =>
            hw.hwName === hwName
              ? { ...hw, availability: hw.availability - quantity }
              : hw
          )
        );
        setCheckoutQuantities((prev) => ({ ...prev, [hwName]: 0 }));
      } else {
        alert(res.data.message || "Failed to check out hardware.");
      }
    } catch (err) {
      console.error("Error during checkout:", err);
      alert("Error during checkout!");
    }
  };

  // Handle check-in submit
  const handleCheckinSubmit = async (hwName) => {
    const quantity = parseInt(checkinQuantities[hwName], 10);

    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid check-in quantity!");
      return;
    }

    const hardware = hwSets.find((hw) => hw.hwName === hwName);
    if (quantity > hardware.capacity - hardware.availability) {
      alert("Cannot check in more units than originally allocated!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/check_in", {
        projectID: selectedProjectID,
        hw_name: hwName,
        quantity,
      });

      if (res.data.message === "Hardware checked in successfully!") {
        alert(`Checked in ${quantity} of ${hwName}`);
        setHwSets((prev) =>
          prev.map((hw) =>
            hw.hwName === hwName
              ? { ...hw, availability: hw.availability + quantity }
              : hw
          )
        );
        setCheckinQuantities((prev) => ({ ...prev, [hwName]: 0 }));
      } else {
        alert(res.data.message || "Failed to check in hardware.");
      }
    } catch (err) {
      console.error("Error during check-in:", err);
      alert("Error during check-in!");
    }
  };

  return (
    <div className="card p-4">
      <h2 className="mb-4">Hardware Management</h2>

      <div className="mb-3">
        <label htmlFor="projectDropdown" className="form-label">
          Select Project:
        </label>
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
          {hwSets.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No hardware sets available to display.
              </td>
            </tr>
          ) : (
            hwSets.map((hw) => (
              <tr key={hw.hwName}>
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
                    onChange={(e) =>
                      handleCheckoutChange(hw.hwName, e.target.value)
                    }
                  />
                  <button
                    className="btn btn-primary mt-1"
                    onClick={() => handleCheckoutSubmit(hw.hwName)}
                  >
                    Checkout
                  </button>
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max={hw.capacity - hw.availability}
                    value={checkinQuantities[hw.hwName]}
                    onChange={(e) =>
                      handleCheckinChange(hw.hwName, e.target.value)
                    }
                  />
                  <button
                    className="btn btn-primary mt-1"
                    onClick={() => handleCheckinSubmit(hw.hwName)}
                  >
                    Check-in
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HardwareManagement;
