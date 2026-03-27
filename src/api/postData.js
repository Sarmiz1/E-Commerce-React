import axios from "axios";

export const postData = async (url, data = {}) => {
  try {
    const response = await axios.post(url, data);

    // Only return if status is 2xx
    if (response.status >= 200 && response.status < 300) {
      return response.data; // could be anything, we just care that it's 2xx
    } else {
      throw new Error(`HTTP error: ${response.status}`);
    }

  } catch (error) {
    console.error("POST error:", error);
    throw error; // re-throw so frontend can catch
  }
};