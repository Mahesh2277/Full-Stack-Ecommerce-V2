import React, { useContext, useState } from 'react'
import { ShopContext } from '../Context/ShopContext'
import './Assistant.css'

const getBotResponse = (message, products) => {
  const normalized = message.trim().toLowerCase()
  const women = products.filter((p) => p.category === 'women').slice(0, 3)
  const men = products.filter((p) => p.category === 'men').slice(0, 3)
  const kids = products.filter((p) => p.category === 'kid').slice(0, 3)

  if (!normalized) return 'Please ask me something about products, payment, or suggestions.'

  if (normalized.includes('women')) {
    return `For women, I recommend: ${women.map((p) => p.name).join(', ') || 'no items found yet.'}`
  }
  if (normalized.includes('men')) {
    return `For men, try: ${men.map((p) => p.name).join(', ') || 'no items found yet.'}`
  }
  if (normalized.includes('kids')) {
    return `For kids, these look great: ${kids.map((p) => p.name).join(', ') || 'no items found yet.'}`
  }
  if (normalized.includes('recommend') || normalized.includes('suggest')) {
    const topProducts = products.slice(0, 3).map((p) => p.name)
    return `I suggest: ${topProducts.join(', ')}. Use the shop pages to view each product.`
  }
  if (normalized.includes('payment')) {
    return 'Use the Cart page and click Proceed to Checkout. The backend supports a simple payment endpoint for demo payments.'
  }
  if (normalized.includes('describe') && normalized.includes('product')) {
    const product = products[0]
    if (!product) return 'No products are loaded yet. Please open the shop first.'
    return `${product.name} is a stylish item in our ${product.category} line, priced at ${product.new_price}. It has a clean design and fits modern wardrobes.`
  }
  if (normalized.includes('hello') || normalized.includes('hi')) {
    return 'Hi there! Ask me to recommend products, help with checkout, or describe a product.'
  }

  return 'I am a shopping assistant. Try asking for recommendations, payment help, or product descriptions.'
}

const Assistant = () => {
  const { products } = useContext(ShopContext)
  const [messages, setMessages] = useState([
    { author: 'bot', text: 'Hello! I can help you find products, recommend items, or explain checkout.' },
  ])
  const [input, setInput] = useState('')

  const sendMessage = () => {
    if (!input.trim()) return

    const userMessage = { author: 'user', text: input }
    const botMessage = { author: 'bot', text: getBotResponse(input, products) }
    setMessages((prev) => [...prev, userMessage, botMessage])
    setInput('')
  }

  return (
    <div className="assistant-page">
      <div className="assistant-panel">
        <h1>Shopping Assistant</h1>
        <div className="assistant-chat">
          {messages.map((message, index) => (
            <div key={index} className={`assistant-message ${message.author}`}>
              <span>{message.text}</span>
            </div>
          ))}
        </div>
        <div className="assistant-input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about products, payment, or recommendations"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  )
}

export default Assistant
