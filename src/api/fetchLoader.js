import axios from "axios";

export const fetchLoader = (url) => {
  
  return async () => {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Response("Failed to fetch object", {
        status: error.response?.status || 500,
      });
    }
  };
};