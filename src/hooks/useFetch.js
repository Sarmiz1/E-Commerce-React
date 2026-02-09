import axios from "axios"
import { useEffect, useState } from "react"


export const useFetchProducts = ()=> {
  const [products, setProducts] = useState([])

  const url = 'http://localhost:3000/api/products'

  useEffect(()=> {
    axios.get(url)
      .then((response)=> {
        setProducts (response.data)
        console.log(products);
        console.log(response.data);
        
    })
  },[])

  console.log(products);
  
  return products
}