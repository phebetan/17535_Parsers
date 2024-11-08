import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HardwareManagement = ({ projectID }) => {
  const [hwSets, setHwSets] = useState([]);
  const [checkoutQuantities, setCheckoutQuantities] = useState({});
  const [checkinQuantities, setCheckinQuantities] = useState({});

  useEffect(() => {
    const fetchHwSets = async () => {
      try {
        const res = await axios.post('http://localhost:5000/get_all_hw_names');
        const hwNames = res.data.hardware_names;

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
        setCheckoutQuantities(hwDetails.reduce((acc, hw) => ({ ...acc, [hw.hwName]: 0 }), {}));
        setCheckinQuantities(hwDetails.reduce((acc, hw) => ({ ...acc, [hw.hwName]: 0 }), {}));
      } catch (err) {
        alert('Error fetching hardware sets!');
      }
    };
    fetchHwSets();
  }, []);

  const handleCheckoutChange = (hwName, value) => {
    setCheckoutQuantities((prev) => ({ ...prev, [hwName]: value }));
  };

  const handleCheckinChange = (hwName, value) => {
    setCheckinQuantities((prev) => ({ ...prev, [hwName]: value }));
  };

  const handleCheckout = async (hwName) => {
    const quantity = parseInt(checkoutQuantities[hwName], 10);
    try {
      const res = await axios.post('http://localhost:5000/check_out', { projectID, hw_name: hwName, quantity });
      if (res.data.message === 'Hardware checked out successfully!') {
        alert(`Checked out ${quantity} of ${hwName}`);
        setHwSets((prev) => prev.map((hw) => (hw.hwName === hwName ? { ...hw, availability: hw.availability - quantity } : hw)));
        setCheckoutQuantities((prev) => ({ ...prev, [hwName]: 0 }));
      }
    } catch (err) {
      alert('Error during checkout');
    }
  };

  const handleCheckin = async (hwName) => {
    const quantity = parseInt(checkinQuantities[hwName], 10);
    try {
      const res = await axios.post('http://localhost:5000/check_in', { projectID, hw_name: hwName, quantity });
      if (res.data.message === 'Hardware checked in successfully!') {
        alert(`Checked in ${quantity} of ${hwName}`);
        setHwSets((prev) => prev.map((hw) => (hw.hwName === hwName ? { ...hw, availability: hw.availability + quantity } : hw)));
        setCheckinQuantities((prev) => ({ ...prev, [hwName]: 0 }));
      }
    } catch (err) {
      alert('Error during check-in');
    }
  };

  return (
    <div className="card p-4">
      <h2 className="mb-4">Hardware Management</h2>
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
