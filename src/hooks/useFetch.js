import axios from "axios";
import { useEffect, useState } from "react";

export const useFetchData = (url) => {
  const [fetchedData, setFetchedData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(url, {
          signal: controller.signal,
        });

        setFetchedData(response.data);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError(err.message);
          setFetchedData([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [url]);

  return { fetchedData, error, isLoading };
};


/* 
=================================================================================
              Fetching Object data from backEnd
=================================================================================
*/
// export const useFetchDataObject = (url) => {
//   const [fetchedData, setFetchedData] = useState(null)
//   const [error, setError] = useState(null)
//   const [isLoading, setIsLoading] = useState(false)


//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true)

//       try {
//         const response = await axios.get(url)

//         if (response.status === 200) {
//           setFetchedData(response.data)
//           setIsLoading(false)
//         }

//       } catch (error) {
//         setError(error.message)
//         setIsLoading(false)
//       }
//     }

//     fetchData(url)

//     const cleanUp = () => {
//       setError(null)
//     }

//     return cleanUp

//   }, [url])


//   return { fetchedData, error, isLoading }
// }



