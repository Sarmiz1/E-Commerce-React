import axios from "axios"
import { useEffect, useState } from "react"


/* 
=================================================================================
              Fetching data from backEnd
=================================================================================
*/
export const useFetchData = (url) => {
  const [fetchedData, setFetchedData] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {

    let isMounted = true
    const source = axios.CancelToken.source()

    const fetchData = async (url) => {
      setIsLoading(true)

      try {
        const response = await axios.get(url, {
          cancelToken: source.token
        });

        if (isMounted) {
          setFetchedData(response.data)
          setError(null)
        }

      } catch (error) {

        if (isMounted) {
          setError(error.message)
          setFetchedData([])
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }

    }

    fetchData(url)

    const cleanUp = () => {
      isMounted = false
      source.cancel()
    }

    return cleanUp

  }, [url])

  return { fetchedData, error, isLoading }
}


/* 
=================================================================================
              Fetching Object data from backEnd
=================================================================================
*/
export const useFetchDataObject = (url) => {
  const [fetchedData, setFetchedData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        const response = await axios.get(url)

        if (response.status === 200) {
          setFetchedData(response.data)
          setIsLoading(false)
        }

      } catch (error) {
        setError(error.message)
        setIsLoading(false)
      }
    }

    fetchData(url)

    const cleanUp = () => {
      setError(null)
    }

    return cleanUp

  }, [url])


  return { fetchedData, error, isLoading }
}



