import axios from "axios"


export const usePutData = (url, data)=> {

  const postData = async () => {
    try {
      await axios.put(url, data)

    } catch (error) {

      console.log(error);
      
    }
  }

  postData(url, data)

} 


