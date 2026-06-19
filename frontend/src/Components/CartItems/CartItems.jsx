import React, { useContext } from "react";
import "./CartItems.css";
import cross_icon from "../Assets/cart_cross_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backendImageUrl } from "../../utils/api";
import { currency } from "../../App";
import { useNavigate } from 'react-router-dom';

const CartItems = () => {
  const {products} = useContext(ShopContext);
  const {cartItems,removeFromCart,getTotalCartAmount} = useContext(ShopContext);
  const navigate = useNavigate();

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {Object.keys(cartItems).map((key) => {
        const quantity = cartItems[key];
        if (quantity > 0) {
          const [itemIdStr, size = 'Default'] = key.split('-');
          const itemId = Number(itemIdStr);
          const e = products.find((product) => product.id === itemId);
          if (!e) return null;

          return (
            <div key={key}>
              <div className="cartitems-format-main cartitems-format">
                <img className="cartitems-product-icon" src={backendImageUrl(e.image)} alt="" />
                <p className="cartitems-product-title">{e.name} ({size})</p>
                <p>{currency}{e.new_price}</p>
                <button className="cartitems-quantity">{quantity}</button>
                <p>{currency}{e.new_price * quantity}</p>
                <img onClick={() => { removeFromCart(key) }} className="cartitems-remove-icon" src={cross_icon} alt="" />
              </div>
              <hr />
            </div>
          );
        }
        return null;
      })}
      
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>{currency}{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>{currency}{getTotalCartAmount()}</h3>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} disabled={getTotalCartAmount() <= 0}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cartitems-promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="promo code" />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
