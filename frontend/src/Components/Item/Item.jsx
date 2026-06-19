import React from 'react'
import './Item.css'
import { Link } from 'react-router-dom'
import { backendImageUrl } from '../../utils/api'
import { currency } from '../../App'
import defaultProduct from '../Assets/product_1.png'
import menProduct from '../Assets/product_10.png'
import womenProduct from '../Assets/product_11.png'
import kidProduct from '../Assets/product_12.png'

const Item = (props) => {
  const getFallbackImage = (category) => {
    switch (category) {
      case 'men':
        return menProduct;
      case 'women':
        return womenProduct;
      case 'kid':
        return kidProduct;
      default:
        return defaultProduct;
    }
  }

  const imageSrc = props.image
    ? (props.image.startsWith('http') || props.image.startsWith('data:') ? props.image : backendImageUrl(props.image))
    : getFallbackImage(props.category)

  return (
    <div className='item'>
      <Link to={`/product/${props.id}`}><img onClick={window.scrollTo(0, 0)} src={imageSrc} alt={props.name || 'product'} /></Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">{currency}{props.new_price}</div>
        <div className="item-price-old">{currency}{props.old_price}</div>
      </div>
    </div>
  )
}

export default Item
