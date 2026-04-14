import axios from "axios";

const api = axios.create({
  baseURL: "/api", // change if needed
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   GENERIC REQUEST HANDLER
========================= */
const request = async (method, url, data) => {
  try {
    const response = await api({ method, url, data });
    return response.data;
  } catch (error) {
    console.error(`${method.toUpperCase()} error:`, error);
    throw error;
  }
};

export const getData = (url) => request("get", url);
export const postData = (url, data) => request("post", url, data);
export const putData = (url, data) => request("put", url, data);
export const deleteData = (url) => request("delete", url);