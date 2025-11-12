import React, { useState } from "react";
import "../index.css";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    fetch("https://localhost:44361/api/Customers/customers")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : data.value || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching customers:", err);
        setLoading(false);
      });
  };

  return (
    <div className="card">
      <h2>Customers</h2>
      <button className="button" onClick={fetchCustomers}>Load Customers</button>
      {loading && <p>Loading...</p>}
      {customers.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Card Code</th>
              <th>Card Name</th>
              <th>Email Address</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.CardCode}>
                <td>{c.CardCode}</td>
                <td>{c.CardName}</td>
                <td>{c.EmailAddress || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Customers;
