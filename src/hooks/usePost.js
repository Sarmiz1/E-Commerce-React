import axios from "axios"


export const usePostData = (url, data='')=> {

  const postData = async () => {
    try {
      await axios.post(url, data)

    } catch (error) {

      console.log(error);
      
    }
  }

  postData(url, data)

} 


