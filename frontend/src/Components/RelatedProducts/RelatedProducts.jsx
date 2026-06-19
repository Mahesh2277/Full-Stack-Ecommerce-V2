import React, { useEffect, useState } from 'react'
import './RelatedProducts.css'
import Item from '../Item/Item'
import { apiFetch } from '../../utils/api';

const RelatedProducts = ({category,id}) => {

  const [related,setRelated] = useState([]);

  useEffect(()=>{
    apiFetch('/relatedproducts',{
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({category:category}),
      })
    .then((res)=>res.json()).then((data)=>setRelated(data))
    .catch((error) => console.error('Failed to load related products:', error))
  },[category])

  return (
    <div className='relatedproducts'>
      <h1>Related Products</h1>
      <hr />
      <div className="relatedproducts-item">
        {related.map((item,index)=>{
          if (id !== item.id) {
            return <Item key={index} id={item.id} category={item.category} name={item.name} image={item.image}  new_price={item.new_price} old_price={item.old_price}/>
          }
          return null;
        })}
      </div>
    </div>
  )
}

export default RelatedProducts
