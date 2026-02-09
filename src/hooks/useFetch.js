import axios from "axios"
import { useEffect, useState } from "react"


/* 
=================================================================================
              Fetching data from backEnd
=================================================================================
*/
export const useFetchData = (url)=> {
  const [fetchedData, setFetchedData] = useState([])
  const [error, setError] = useState('')


  useEffect(()=> {
    try {
      axios.get(url)
      .then((response)=> {
        setFetchedData (response.data)
    })
    } catch (error) {
      setError(error.message)
    }
    
  },[])
  
  return {fetchedData, error}
}


/* 
=================================================================================
              Fetching Object data from backEnd
=================================================================================
*/
export const useFetchDataObject = (url)=> {
  const [fetchedData, setFetchedData] = useState(null)
  const [error, setError] = useState('')


  useEffect(()=> {
    try {
      axios.get(url)
      .then((response)=> {
        setFetchedData (response.data)
    })
    } catch (error) {
      setError(error.message)
    }
    
  },[])
  
  return {fetchedData, error}
}



