import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png'
import { apiFetch, backendImageUrl } from "../../utils/api";
import { currency } from "../../App";

const ListProduct = ({ onBackendUrlUpdate }) => {
  const [allproducts, setAllProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    old_price: "",
    new_price: "",
    category: "women"
  });

  const fetchInfo = () => {
    apiFetch('/allproducts')
      .then((res) => res.json())
      .then((data) => setAllProducts(data))
      .then(() => onBackendUrlUpdate?.())
      .catch((error) => console.error('Failed to load admin products:', error))
  }

  useEffect(() => {
    fetchInfo();
  }, [])

  const removeProduct = async (id) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      await apiFetch('/removeproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
      })
      fetchInfo();
      onBackendUrlUpdate?.();
    }
  }

  const handleEditClick = (product) => {
    setEditId(product.id);
    setEditForm({
      name: product.name,
      old_price: product.old_price,
      new_price: product.new_price,
      category: product.category
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveClick = async (id) => {
    try {
      const response = await apiFetch('/updateproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          ...editForm
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Product updated successfully");
        setEditId(null);
        fetchInfo();
        onBackendUrlUpdate?.();
      } else {
        alert("Failed to update product: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Update product error:", error);
      alert("Error updating product");
    }
  };

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p> <p>Title</p> <p>Old Price</p> <p>New Price</p> <p>Category</p> <p>Actions</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((e, index) => (
          <div key={index}>
            <div className="listproduct-format-main listproduct-format">
              <img className="listproduct-product-icon" src={backendImageUrl(e.image)} alt="" />
              
              {editId === e.id ? (
                <>
                  <input
                    type="text"
                    name="name"
                    className="listproduct-edit-input"
                    value={editForm.name}
                    onChange={handleEditChange}
                  />
                  <input
                    type="number"
                    name="old_price"
                    className="listproduct-edit-input"
                    value={editForm.old_price}
                    onChange={handleEditChange}
                  />
                  <input
                    type="number"
                    name="new_price"
                    className="listproduct-edit-input"
                    value={editForm.new_price}
                    onChange={handleEditChange}
                  />
                  <select
                    name="category"
                    className="listproduct-edit-select"
                    value={editForm.category}
                    onChange={handleEditChange}
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kid">Kid</option>
                  </select>
                  <div className="listproduct-actions">
                    <button className="listproduct-action-btn listproduct-btn-save" onClick={() => handleSaveClick(e.id)}>Save</button>
                    <button className="listproduct-action-btn listproduct-btn-cancel" onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="cartitems-product-title">{e.name}</p>
                  <p>{currency}{e.old_price}</p>
                  <p>{currency}{e.new_price}</p>
                  <p>{e.category}</p>
                  <div className="listproduct-actions">
                    <button className="listproduct-action-btn listproduct-btn-edit" onClick={() => handleEditClick(e)}>Edit</button>
                    <img className="listproduct-remove-icon" onClick={() => { removeProduct(e.id) }} src={cross_icon} alt="" />
                  </div>
                </>
              )}
            </div>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;
