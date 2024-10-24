import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HardwareManagement = () => {
  const [hwSets, setHwSets] = useState([]);

  useEffect(() => {
    const fetchHwSets = async () => {
      try {
        const res = await axios.post('/get_all_hw_names');
        setHwSets(res.data.hardware_names);
      } catch (err) {
        alert('Error fetching hardware sets!');
      }
    };

    fetchHwSets();
  }, []);

  return (
    <div className="card p-4">
      <h2 className="mb-4">Hardware Management</h2>
      <ul className="list-group">
        {hwSets.map((hw, index) => (
          <li key={index} className="list-group-item">{hw}</li>
        ))}
      </ul>
    </div>
  );
};

export default HardwareManagement;
