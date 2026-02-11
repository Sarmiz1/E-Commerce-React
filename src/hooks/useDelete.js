import axios from "axios";

export const useDelete = (url) => {
  axios.delete(url)
}