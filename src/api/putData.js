import axios from "axios";

export const putData = async (url, data = {}) => {
  try {
    const response = await axios.put(url, data);

    // Only return data if status is 2xx
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`HTTP error: ${response.status}`);
    }

  } catch (error) {
    console.error("PUT error:", error);
    throw error; // re-throw so calling function can handle it
  }
};