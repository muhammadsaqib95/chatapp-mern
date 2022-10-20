import axios from "axios";

export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("user_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
);