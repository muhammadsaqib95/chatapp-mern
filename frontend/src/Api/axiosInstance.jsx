import axios from "axios";

export const axiosInstance = axios.create({
    headers: {
        "Authorization": "Bearer " + localStorage.getItem('user_token'),
    },
});