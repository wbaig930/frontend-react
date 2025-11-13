import React, { useEffect, useState } from "react";
import "./salesorder.css"; // small extra css below

const API_BASE = "https://localhost:44361/api";

const todayIso = () => {
  const t = new Date();
  // YYYY-MM-DD
  return t.toISOString().slice(0, 10);
};

export default function SalesOrderForm() {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState([]);

  const [docDate, setDocDate] = useState(todayIso());
  const [docNum, setDocNum] = useState("Auto");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // totals
  const subtotal = orderItems.reduce(
    (s, it) => s + Number(it.UnitPrice || 0) * Number(it.Quantity || 0),
    0,
  );
  const total = subtotal; // no tax / discount now

  useEffect(() => {
    // fetch customers
    fetch(`${API_BASE}/Customers/customers`)
      .then((r) => r.json())
      .then((data) =>
        setCustomers(Array.isArray(data) ? data : data.value || []),
      )
      .catch((e) => {
        console.error("Customers fetch error:", e);
        setCustomers([]);
      });

    // fetch items
    fetch(`${API_BASE}/Items/items`)
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : data.value || []))
      .catch((e) => {
        console.error("Items fetch error:", e);
        setItems([]);
      });
  }, []);

  // Item selection: toggle or add
  const toggleItem = (item) => {
    const exists = orderItems.find((i) => i.ItemCode === item.ItemCode);
    if (exists) {
      setOrderItems(orderItems.filter((i) => i.ItemCode !== item.ItemCode));
    } else {
      // Determine a valid price
      const price = Number(item.Price ?? item.UnitPrice ?? item.PriceList) || 1; // fallback 1

      setOrderItems([
        ...orderItems,
        {
          ItemCode: item.ItemCode,
          ItemName: item.ItemName || item.ItemCode,
          UnitPrice: price,
          Quantity: 1,
        },
      ]);
    }
  };

  const updateQty = (itemCode, qty) => {
    if (!qty || qty < 1) qty = 1;
    setOrderItems(
      orderItems.map((i) =>
        i.ItemCode === itemCode ? { ...i, Quantity: Number(qty) } : i,
      ),
    );
  };

  const updatePrice = (itemCode, price) => {
    setOrderItems(
      orderItems.map((i) =>
        i.ItemCode === itemCode ? { ...i, UnitPrice: Number(price) } : i,
      ),
    );
  };

  const removeLine = (itemCode) =>
    setOrderItems(orderItems.filter((i) => i.ItemCode !== itemCode));

  const submitOrder = async () => {
  if (!selectedCustomer) {
    alert("Please select a customer.");
    return;
  }
  if (orderItems.length === 0) {
    alert("Add at least one item.");
    return;
  }

  const payload = {
    CardCode: selectedCustomer.CardCode,
    CardName: selectedCustomer.CardName || "",
    DocDate: docDate,
    DocDueDate: docDate, // you can change this to another date if needed
    DocTotal: orderItems.reduce(
      (sum, item) => sum + Number(item.UnitPrice || 0) * Number(item.Quantity || 0),
      0
    ),
    SalesOrderRow: orderItems.map((i) => ({
      ItemCode: i.ItemCode,
      ItemName: i.ItemName || i.ItemCode,
      Price: Number(i.UnitPrice),
      Quantity: Number(i.Quantity),
    })),
  };

  try {
    setLoading(true);
    setMessage("");
    console.log("Submitting payload:", payload);

    const res = await fetch(`${API_BASE}/SalesOrders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    const apiError = json?.error?.message?.value || json?.error;

    if (!res.ok || apiError) {
      console.error("Submit failed", json);
      setMessage(`Error: ${apiError || res.statusText || "Submit failed"}`);
    } else {
      setMessage("Sales Order submitted successfully.");
      console.log("Order response:", json);
      setOrderItems([]);
      setSelectedCustomer(null);
      setDocNum("Auto");
    }
  } catch (err) {
    console.error(err);
    setMessage("Network or server error.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h5 className="card-title mb-0">Sales Order</h5>
            <div>
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={() => {
                  // reset form
                  setSelectedCustomer(null);
                  setOrderItems([]);
                  setDocDate(todayIso());
                  setDocNum("Auto");
                  setMessage("");
                }}
              >
                New
              </button>
              <button
                className="btn btn-sm btn-success"
                onClick={submitOrder}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Post Order"}
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="row g-2 mb-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label small">Customer</label>
              <div className="input-group">
                <input
                  className="form-control"
                  readOnly
                  placeholder="Select customer..."
                  value={selectedCustomer ? `${selectedCustomer.CardName}` : ""}
                  onClick={() => setCustomerModalOpen(true)}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setCustomerModalOpen(true)}
                >
                  Select
                </button>
                <button
                  className="btn btn-outline-danger"
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label small">Customer Code</label>
              <input
                className="form-control"
                readOnly
                value={selectedCustomer ? selectedCustomer.CardCode : ""}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label small">Doc Date</label>
              <input
                className="form-control"
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label small">Doc Number</label>
              <input
                className="form-control"
                value={docNum}
                onChange={(e) => setDocNum(e.target.value)}
              />
            </div>
          </div>

          {/* Items controls */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Items</h6>
            <div>
              <button
                className="btn btn-sm btn-primary me-2"
                onClick={() => setItemModalOpen(true)}
              >
                Add / Select Items
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setOrderItems([])}
              >
                Clear Lines
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="table-responsive">
            <table className="table table-sm table-bordered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "12%" }}>Item Code</th>
                  <th>Item Name</th>
                  <th style={{ width: "12%" }}>Unit Price</th>
                  <th style={{ width: "12%" }}>Quantity</th>
                  <th style={{ width: "12%" }}>Line Total</th>
                  <th style={{ width: "6%" }}></th>
                </tr>
              </thead>
              <tbody>
                {orderItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-3">
                      No items added.
                    </td>
                  </tr>
                )}

                {orderItems.map((line) => (
                  <tr key={line.ItemCode}>
                    <td>{line.ItemCode}</td>
                    <td>{line.ItemName}</td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        type="number"
                        step="0.01"
                        value={line.UnitPrice}
                        onChange={(e) =>
                          updatePrice(line.ItemCode, e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        type="number"
                        min="1"
                        value={line.Quantity}
                        onChange={(e) =>
                          updateQty(line.ItemCode, e.target.value)
                        }
                      />
                    </td>
                    <td>
                      {(Number(line.UnitPrice) * Number(line.Quantity)).toFixed(
                        2,
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeLine(line.ItemCode)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer totals */}
          <div className="row mt-3">
            <div className="col-md-8"></div>
            <div className="col-md-4">
              <dl className="row">
                <dt className="col-6">Subtotal</dt>
                <dd className="col-6 text-end">{subtotal.toFixed(2)}</dd>

                {/* If you later add discount/tax lines, insert here */}
                <dt className="col-6">Total</dt>
                <dd className="col-6 text-end fw-bold">{total.toFixed(2)}</dd>
              </dl>
            </div>
          </div>

          {message && <div className="alert alert-info mt-2">{message}</div>}
        </div>
      </div>

      {/* Customer modal */}
      {customerModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Select Customer</h6>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setCustomerModalOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan="2" className="text-muted">
                        No customers
                      </td>
                    </tr>
                  )}
                  {customers.map((c) => (
                    <tr
                      key={c.CardCode}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomerModalOpen(false);
                      }}
                    >
                      <td>{c.CardCode}</td>
                      <td>{c.CardName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Item modal */}
      {itemModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Select Items</h6>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setItemModalOpen(false)}
              >
                Done
              </button>
            </div>

            <div
              className="table-responsive"
              style={{ maxHeight: "50vh", overflow: "auto" }}
            >
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th></th>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-muted">
                        No items
                      </td>
                    </tr>
                  )}
                  {items.map((it) => {
                    const selected = orderItems.some(
                      (o) => o.ItemCode === it.ItemCode,
                    );
                    const price = it.Price ?? it.UnitPrice ?? it.PriceList ?? 0;
                    return (
                      <tr key={it.ItemCode}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleItem({ ...it, Price: price })}
                          />
                        </td>
                        <td>{it.ItemCode}</td>
                        <td>{it.ItemName}</td>
                        <td>{Number(price).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
