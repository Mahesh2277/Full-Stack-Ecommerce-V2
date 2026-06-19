import React, { useState } from "react";
import "./CSS/Admin.css";
import Sidebar from "../Components/Sidebar/Sidebar";
import AddProduct from "../Components/AddProduct/AddProduct";
import { Route, Routes } from "react-router-dom";
import ListProduct from "../Components/ListProduct/ListProduct";
import { getBackendUrl } from "../utils/api";

const Admin = () => {
  const [backendStatus, setBackendStatus] = useState(getBackendUrl());

  const refreshBackendStatus = () => {
    setBackendStatus(getBackendUrl());
  };

  return (
    <div className="admin">
      <div className="admin-backend-status" style={{ padding: '8px 16px', background: '#eef6ff', color: '#1a3d7c', fontSize: '14px' }}>
        Connected backend: {backendStatus}
      </div>
      <Sidebar />
      <Routes>
        <Route path="/addproduct" element={<AddProduct onBackendUrlUpdate={refreshBackendStatus} />} />
        <Route path="/listproduct" element={<ListProduct onBackendUrlUpdate={refreshBackendStatus} />} />
      </Routes>
    </div>
  );
};

export default Admin;
