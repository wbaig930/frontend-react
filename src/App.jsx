import React from "react";
// import Customers from "./Components/Customers";
// import Items from "./Components/Items";
// import SalesOrders from "./Components/SalesOrders";
import "./App.css";
import SalesOrderForm from "./Components/SalesOrderForm";
//import SalesOrderForm from "./Components/SalesOrderForm";

const App = () => {
  return (
    <div style={{ padding: "20px" }}>
      {/* <Customers />
      <hr />
      <Items />
      <hr />
      <SalesOrders /> */}
      <SalesOrderForm/>
    </div>
  );
};

export default App;
