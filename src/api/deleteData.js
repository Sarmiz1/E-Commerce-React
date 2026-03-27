import axios from "axios";

export const deleteData = async (url) => {
  try {
    const response = await axios.delete(url);

    // Only return if status is 2xx
    if (response.status >= 200 && response.status < 300) {
      return response.data; // can be empty, but you know it succeeded
    } else {
      throw new Error(`HTTP error: ${response.status}`);
    }
  } catch (error) {
    console.error("DELETE error:", error);
    throw error; // re-throw so calling function can handle it
  }
};