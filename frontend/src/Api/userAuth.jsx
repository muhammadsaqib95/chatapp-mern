import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./axiosInstance";

export const userLogin = async ({ username, password }) => {
  var formdata = new FormData();
  formdata.append("email", username);
  formdata.append("password", password);

  var requestOptions = {
    method: "POST",
    body: formdata,
    redirect: "follow",
  };

  return fetch("/user/login", requestOptions)
    .then((response) => response.json())
    .catch((error) => console.log("error", error));
};

export const getUser = async() => {
  return axiosInstance.get("/user/getUser")
    .then((response) => response.data)
    .catch((error) => console.log("error", error));
};

export function useUserDetails() {
    return useQuery(["user"], getUser);

}

export async function searchUser(user) {
  try {
    const response = await axiosInstance.get(`/user/${user}`);
    return response.data;
  } catch (error) {
    return console.log("error", error);
  }
}