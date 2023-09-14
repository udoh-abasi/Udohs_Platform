import axios from "axios";

// NOTE: Here, we create an axios instance with the django's base URL, so we only have to type in the django's base URL just once
const axiosClient = axios.create({
  baseURL: "http://localhost:8000",
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  withCredentials: true,
});

export default axiosClient;
