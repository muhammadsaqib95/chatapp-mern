import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./axiosInstance";
export function getUserAllChats() {
    return axiosInstance.get("http://localhost:3001/chat")
        .then((response) => response.data)
        .catch((error) => console.log("error", error));
}

export function sendChatMessage(data) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + localStorage.getItem("user_token"));
    
    var formdata = new FormData();
    for (const key in data) {
        if (data[key]) {
            formdata.append(key, data[key]);
        }
    }  
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow'
    };
    
    return fetch("http://localhost:3001/chat/send-message", requestOptions)
      .then(response => response.json())
      .catch(error => error);
    
}

export function useUserAllChats() {
    return useQuery(["userAllChats"], getUserAllChats);
}