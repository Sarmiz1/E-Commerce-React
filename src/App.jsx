import './App.css'
import { supabase } from './supabaseClient'
import { RouterProvider } from 'react-router-dom'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { CartActionsContext, CartStateContext } from './Context/cartContext'
import axios from 'axios'
import { IconContext } from 'react-icons'
import router from './Router/router'





export default function App() {

  const [cart, setCart] = useState([])

  const loadCart = useCallback(async () => {
    const cartUrl = '/api/cart-items?expand=product'
    const response = await axios.get(cartUrl)

    setCart(response.data)
  }, [])

  console.log("AppJsx", cart);



  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // useEffect(() => {
  //   async function getPosts() {
  //     const { data, error } = await supabase
  //       .from("products")
  //       .select("*");

  //     if (error) {
  //       console.log(error);
  //     } else {
  //       console.log(data);
  //     }
  //   }
  //   getPosts();

  // }, [])



  const actionsValue = useMemo(() => ({
    loadCart,
  }), [loadCart]);

  const stateValue = useMemo(() => ({
    cart
  }), [cart]);





  return (
    <>
      <CartStateContext.Provider value={stateValue}>
        <CartActionsContext.Provider value={actionsValue}>
          <IconContext.Provider value={{ size: "80px", color: "green" }}>
            <RouterProvider router={router} />
          </IconContext.Provider>
        </CartActionsContext.Provider>
      </CartStateContext.Provider>
    </>

  )
}

