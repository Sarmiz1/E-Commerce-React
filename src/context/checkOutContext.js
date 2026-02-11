import { createContext } from "react";

const checkOutContext = createContext({
  deliveryOptions:[],
  deliveryFetchError: null,
  loadPaymentSumary: null,
  paymentSumary: null
})

export default checkOutContext