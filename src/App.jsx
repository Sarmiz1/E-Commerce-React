import './App.css'
import { supabase } from './supabaseClient'
import { RouterProvider } from 'react-router-dom'
import { CartProvider } from './Context/cart/CartContext' 
import { IconContext } from 'react-icons'
import router from './Router/router'






export default function App() {


  return (
    <>
      <CartProvider>
        <IconContext.Provider value={{ size: "80px", color: "green" }}>
          <RouterProvider router={router} />
        </IconContext.Provider>
      </CartProvider>
    </>

  )
}



