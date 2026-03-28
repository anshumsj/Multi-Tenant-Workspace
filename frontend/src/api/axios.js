import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true, // must be true for httpOnly cookies to be sent
});

export default API;