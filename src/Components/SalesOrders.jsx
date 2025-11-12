import React, { useState } from "react";
import "../index.css";

const SalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    fetch("https://localhost:44361/api/SalesOrders/orders")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setOrders(Array.isArray(data) ? data : data.value || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching sales orders:", err);
        setLoading(false);
      });
  };

  return (
    <div className="card">
      <h2>Sales Orders</h2>
      <button className="button" onClick={fetchOrders}>Load Sales Orders</button>
      {loading && <p>Loading...</p>}
      {orders.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Doc Entry</th>
              <th>Doc Num</th>
              <th>Customer</th>
              <th>Doc Date</th>
              <th>Doc Due Date</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.DocEntry}>
                <td>{order.DocEntry}</td>
                <td>{order.DocNum}</td>
                <td>{order.CardName}</td>
                <td>{order.DocDate}</td>
                <td>{order.DocDueDate}</td>
                <td>{order.DocTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SalesOrders;
