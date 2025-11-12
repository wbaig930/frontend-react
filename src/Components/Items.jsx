import React, { useState } from "react";
import "../index.css";

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = () => {
    setLoading(true);
    fetch("https://localhost:44361/api/Items/items")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setItems(Array.isArray(data) ? data : data.value || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
  };

  return (
    <div className="card">
      <h2>Items</h2>
      <button className="button" onClick={fetchItems}>Load Items</button>
      {loading && <p>Loading...</p>}
      {items.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Item Type</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.ItemCode}>
                <td>{item.ItemCode}</td>
                <td>{item.ItemName}</td>
                <td>{item.ItemType}</td>
                <td>{item.Price || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Items;
