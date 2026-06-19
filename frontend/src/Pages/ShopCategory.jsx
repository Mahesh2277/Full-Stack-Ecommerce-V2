import React, { useEffect, useState } from "react";
import "./CSS/ShopCategory.css";
import dropdown_icon from '../Components/Assets/dropdown_icon.png'
import Item from "../Components/Item/Item";
import { Link } from "react-router-dom";
import { apiFetch } from '../utils/api';

const ShopCategory = (props) => {

  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = () => { 
    apiFetch('/allproducts')
            .then((res) => res.json()) 
            .then((data) => setAllProducts(data))
            .catch((error) => console.error('Failed to load products:', error))
    }

    useEffect(() => {
      fetchInfo();
    }, [])

  const filteredProducts = props.category
    ? allproducts.filter((item) => item.category === props.category)
    : allproducts;

  const totalProducts = filteredProducts.length;
  const shownProducts = totalProducts > 0 ? Math.min(totalProducts, 12) : 0;
  const startProduct = totalProducts > 0 ? 1 : 0;
    
  return (
    <div className="shopcategory">
      <img src={props.banner} className="shopcategory-banner" alt="" />
      <div className="shopcategory-indexSort">
        <p><span>Showing {startProduct} - {shownProducts}</span> out of {totalProducts} Products</p>
        <div className="shopcategory-sort">Sort by  <img src={dropdown_icon} alt="" /></div>
      </div>
      <div className="shopcategory-products">
        {filteredProducts.map((item,i) => (
          <Item id={item.id} key={i} category={item.category} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
        ))}
      </div>
      <div className="shopcategory-loadmore">
      <Link to='/' style={{ textDecoration: 'none' }}>Explore More</Link>
      </div>
    </div>
  );
};

export default ShopCategory;
