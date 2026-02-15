import axios from "axios";

export const deleteData = (url) => {
  axios.delete(url)
}