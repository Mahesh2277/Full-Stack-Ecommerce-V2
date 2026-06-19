import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import { apiFetch } from '../utils/api'
import { currency } from '../App'
import './Checkout.css'

const Checkout = () => {
  const { cartItems, products, getTotalCartAmount } = useContext(ShopContext)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const checkoutItems = Object.keys(cartItems)
    .map((key) => {
      const quantity = cartItems[key];
      if (quantity > 0) {
        const [itemIdStr, size = 'Default'] = key.split('-');
        const itemId = Number(itemIdStr);
        const product = products.find((p) => p.id === itemId);
        if (product) {
          return {
            key,
            id: product.id,
            name: `${product.name} (${size})`,
            price: product.new_price,
            quantity,
          };
        }
      }
      return null;
    })
    .filter(Boolean);

  const total = getTotalCartAmount()

  const handlePayment = async () => {
    if (!total) {
      setStatus({ type: 'error', text: 'Your cart is empty.' })
      return
    }
    setLoading(true)
    setStatus(null)
    try {
      const response = await apiFetch('/checkout-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'INR' }),
      })
      const data = await response.json()
      if (data.success) {
        setStatus({ type: 'success', text: data.message || 'Payment completed successfully.' })
      } else {
        setStatus({ type: 'error', text: data.message || 'Payment failed. Try again.' })
      }
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'Payment request failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="checkout-page">
      <div className="checkout-panel">
        <h1>Checkout</h1>
        <p>Complete your order with a simple payment flow.</p>
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          {checkoutItems.length === 0 ? (
            <p>Your cart is empty. Add products before checking out.</p>
          ) : (
            <div className="checkout-items">
              {checkoutItems.map((item) => (
                <div key={item.key} className="checkout-item">
                  <span>{item.name}</span>
                  <span>{currency}{item.price} x {item.quantity}</span>
                </div>
              ))}
            </div>
          )}
          <div className="checkout-total">
            <span>Total</span>
            <strong>{currency}{total}</strong>
          </div>
        </div>
        <button className="checkout-button" onClick={handlePayment} disabled={loading || total === 0}>
          {loading ? 'Processing...' : `Pay ${currency}${total}`}
        </button>
        {status && (
          <div className={`checkout-status ${status.type}`}>
            {status.text}
          </div>
        )}
        <button className="checkout-back" onClick={() => navigate('/cart')}>
          Back to Cart
        </button>
      </div>
    </div>
  )
}

export default Checkout
