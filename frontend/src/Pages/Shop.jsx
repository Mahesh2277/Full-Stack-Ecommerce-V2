import React, { useEffect, useState } from 'react'
import Hero from '../Components/Hero/Hero'
import Popular from '../Components/Popular/Popular'
import Offers from '../Components/Offers/Offers'
import NewCollections from '../Components/NewCollections/NewCollections'
import NewsLetter from '../Components/NewsLetter/NewsLetter'
import { apiFetch } from '../utils/api';


const Shop = () => {

  const [popular, setPopular] = useState([]);
  const [newcollection, setNewCollection] = useState([]);

  const fetchInfo = () => { 
    apiFetch('/popularinwomen') 
            .then((res) => res.json()) 
            .then((data) => setPopular(data))
            .catch((error) => console.error('Failed to load popular products:', error))
    apiFetch('/newcollections') 
            .then((res) => res.json()) 
            .then((data) => setNewCollection(data))
            .catch((error) => console.error('Failed to load new collections:', error))
    }

    useEffect(() => {
      fetchInfo();
    }, [])


  return (
    <div>
      <Hero/>
      <Popular data={popular}/>
      <Offers/>
      <NewCollections data={newcollection}/>
      <NewsLetter/>
    </div>
  )
}

export default Shop
