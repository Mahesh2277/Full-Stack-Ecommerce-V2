import React, { createContext, useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {

  const [products, setProducts] = useState([]);

  const getDefaultCart = () => {
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }
    return cart;
  };

  const [cartItems, setCartItems] = useState(getDefaultCart());

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiFetch('/allproducts')
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        console.error('Failed to load products:', error)
      }
    }

    const loadCart = async () => {
      if (!localStorage.getItem('auth-token')) return
      try {
        const res = await apiFetch('/getcart', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'auth-token': `${localStorage.getItem('auth-token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
        const data = await res.json()
        if (data && typeof data === 'object') {
          setCartItems(data)
        }
      } catch (error) {
        console.error('Failed to load cart:', error)
      }
    }

    loadProducts()
    loadCart()
  }, [])

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const key in cartItems) {
      if (cartItems[key] > 0) {
        try {
          const productId = Number(key.split('-')[0]);
          let itemInfo = products.find((product) => product.id === productId);
          if (itemInfo) {
            totalAmount += cartItems[key] * itemInfo.new_price;
          }
        } catch (error) {}
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const key in cartItems) {
      if (cartItems[key] > 0) {
        try {
          const productId = Number(key.split('-')[0]);
          let itemInfo = products.find((product) => product.id === productId);
          if (itemInfo) {
            totalItem += cartItems[key];
          }
        } catch (error) {}
      }
    }
    return totalItem;
  };

  const addToCart = async (itemId, size) => {
    if (!localStorage.getItem('auth-token')) {
      alert('Please Login');
      return;
    }

    const key = `${itemId}-${size}`;
    setCartItems((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    try {
      await apiFetch('/addtocart', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: key }),
      })
    } catch (error) {
      console.error('Add to cart failed:', error)
    }
  };

  const removeFromCart = async (key) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[key] > 0) {
        updated[key] -= 1;
      }
      return updated;
    });
    try {
      await apiFetch('/removefromcart', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: key }),
      })
    } catch (error) {
      console.error('Remove from cart failed:', error)
    }
  };

  const contextValue = { products, getTotalCartItems, cartItems, addToCart, removeFromCart, getTotalCartAmount };
  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
