import { createContext } from "react";

const dataContext = createContext({
  products:[],
  cart:[],
  setCart: null,
})

export default dataContext