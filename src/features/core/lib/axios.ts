// "use client";
import Axios from "axios";

/*
 * Axios.create
 * this is a function that creates a new instance of Axios.
 *
 * Parameters {objet} :
 * baseURL is the base URL of the API that we are going to use.
 */
const axiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY,
  },
});

/*
 * Interceptor Request
 * this is a function that will be called before every request.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
 * Interceptor Response
 * this is a function that will be called before every response.
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { axiosInstance };
