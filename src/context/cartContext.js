import { createContext } from "react";

const cartContext = createContext({
  cart: [],
  loadCart: null

})

export default cartContext