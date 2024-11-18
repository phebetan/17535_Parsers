import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";

const HardwareManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectID, setSelectedProjectID] = useState(null);
  const [hwSets, setHwSets] = useState([]); // All hardware sets
  const [filteredHwSets, setFilteredHwSets] = useState([]); // Filtered for the current project
  const [checkoutQuantities, setCheckoutQuantities] = useState({});
  const [checkinQuantities, setCheckinQuantities] = useState({});
  const [projectHwUsage, setProjectHwUsage] = useState({});
  const { userid } = useContext(UserContext);

  // Fetch user projects and set default project
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.post(
          "http://localhost:5000/get_user_projects_list",
          { userid }
        );
        setProjects(res.data.projects);

        if (res.data.projects.length > 0) {
          const defaultProjectID = res.data.projects[0].projectId;
          setSelectedProjectID(defaultProjectID);
          fetchAllHwSets(defaultProjectID); // Fetch hardware sets for the default project
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        alert("Error fetching projects!");
      }
    };

    if (userid) fetchProjects();
  }, [userid]);

  // Fetch all hardware sets and project-specific usage
  const fetchAllHwSets = async (projectId) => {
    try {
      const res = await axios.post("http://localhost:5000/get_all_hw_names");
      const hwNames = res.data.hardware_names;

      const hwDetails = await Promise.all(
        hwNames.map(async (hwName) => {
          const hwRes = await axios.post("http://localhost:5000/get_hw_info", {
            hw_name: hwName,
          });
          return {
            hwName: hwRes.data.hwName,
            capacity: hwRes.data.capacity,
            availability: hwRes.data.availability,
          };
        })
      );

      setHwSets(hwDetails);
      fetchProjectHwUsage(projectId, hwDetails); // Fetch and filter hardware sets
    } catch (err) {
      console.error("Error fetching hardware sets:", err);
      alert("Error fetching hardware sets!");
    }
  };

  // Fetch project-specific hardware usage
  const fetchProjectHwUsage = async (projectId, hardwareSets = hwSets) => {
    if (!projectId) return;

    try {
      const res = await axios.post("http://localhost:5000/get_project_hw_usage", {
        projectId,
      });
      const usage = res.data.hwSets || {};
      setProjectHwUsage(usage);

      // Filter hardware sets based on usage
      filterHwSets(usage, hardwareSets);
    } catch (err) {
      console.error("Error fetching project hardware usage:", err);
    }
  };

  // Filter hardware sets for the selected project
  const filterHwSets = (usage, hardwareSets = hwSets) => {
    const filtered = hardwareSets
      .filter((hw) => usage[hw.hwName] !== undefined)
      .map((hw) => ({
        ...hw,
        projectUsage: usage[hw.hwName] || 0,
      }));
    setFilteredHwSets(filtered);
  };

  // Handle project change
  const handleProjectChange = async (projectId) => {
    setSelectedProjectID(projectId);
    fetchAllHwSets(projectId);
  };

  // Update checkout quantities
  const handleCheckoutChange = (hwName, value) => {
    setCheckoutQuantities((prev) => ({ ...prev, [hwName]: value }));
  };

  // Update check-in quantities
  const handleCheckinChange = (hwName, value) => {
    setCheckinQuantities((prev) => ({ ...prev, [hwName]: value }));
  };

  // Handle checkout
  const handleCheckoutSubmit = async (hwName) => {
    if (!selectedProjectID) {
      alert("No project selected. Please select a project first.");
      return;
    }

    const quantity = parseInt(checkoutQuantities[hwName], 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid checkout quantity!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/check_out", {
        projectID: selectedProjectID,
        hw_name: hwName,
        quantity,
      });

      if (res.data.message === "Hardware checked out successfully!") {
        alert(`Checked out ${quantity} units of ${hwName}`);
        fetchAllHwSets(selectedProjectID); // Refresh all hardware sets and filtered sets
      } else {
        alert(res.data.message || "Failed to check out hardware.");
      }
    } catch (err) {
      console.error("Error during checkout:", err);
      alert("Error during checkout. Check console logs for details.");
    }
  };

  // Handle check-in
  const handleCheckinSubmit = async (hwName) => {
    if (!selectedProjectID) {
      alert("No project selected. Please select a project first.");
      return;
    }

    const quantity = parseInt(checkinQuantities[hwName], 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid check-in quantity!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/check_in", {
        projectID: selectedProjectID,
        hw_name: hwName,
        quantity,
      });

      if (res.data.message === "Hardware checked in successfully!") {
        alert(`Checked in ${quantity} units of ${hwName}`);
        fetchAllHwSets(selectedProjectID); // Refresh all hardware sets and filtered sets
      } else {
        alert(res.data.message || "Failed to check in hardware.");
      }
    } catch (err) {
      console.error("Error during check-in:", err);
      alert("Error during check-in. Check console logs for details.");
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
          value={selectedProjectID || ""}
          onChange={(e) => handleProjectChange(e.target.value)}
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
            <th>Checked Out by Project</th>
            <th>Checkout Units</th>
            <th>Check-in Units</th>
          </tr>
        </thead>
        <tbody>
          {filteredHwSets.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No hardware sets available for this project.
              </td>
            </tr>
          ) : (
            filteredHwSets.map((hw) => (
              <tr key={hw.hwName}>
                <td>{hw.hwName}</td>
                <td>{hw.capacity}</td>
                <td>{hw.availability}</td>
                <td>{hw.projectUsage}</td>
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
