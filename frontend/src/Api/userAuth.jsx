export const userLogin = ({ username, password }) => {
  var formdata = new FormData();
  formdata.append("email", username);
  formdata.append("password", password);

  var requestOptions = {
    method: "POST",
    body: formdata,
    redirect: "follow",
  };

 return fetch("user/login", requestOptions)
    .then((response) => response.json())
    .catch((error) => console.log("error", error));
};
