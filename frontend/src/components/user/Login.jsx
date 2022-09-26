import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { queryClient } from "../../index";
import { userLogin } from "../../Api/userAuth";
import { useUserContext } from "../userAuth/user";
export default function Login() {
  const navigate = useNavigate();
  const {setUser} = useUserContext();
  const [userInput, setUserInput] = useState({
    username: "",
    password: "",
    error: "",
  });

  const loginMutation = useMutation(userLogin, {
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("user_token", data.token);
        queryClient.setQueryData(["user"], () => data.user);
        setUser(data.token);
        navigate('/chat');
      } else {
        setUserInput({ ...userInput, error: data.message });
      }
    },
  });


//   const userLogin = (event) => {
//     event.preventDefault();
//     console.log(userInput);
//     var formdata = new FormData();
// formdata.append("email", userInput.username);
// formdata.append("password", userInput.password);

// var requestOptions = {
//   method: 'POST',
//   body: formdata,
//   redirect: 'follow'
// };

// fetch("user/login", requestOptions)
//   .then(response => response.json())
//   .then(result => {
//     if(result.token)
//     {
//       localStorage.setItem('user_token', result.token);
//       navigate('/chat');
//     }
//     else{
//       setUserInput({...userInput, error: result.message});
//     }
//   })
//   .catch(error => console.log('error', error));

//   };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="bg-white rounded-md min-w-[546px] flex flex-col items-center py-14 auth-shadow">
        <h1 className="font-bold text-2xl mb-10">Chat App</h1>
        <div className="flex flex-col items-center w-full px-16">
          <input
            type="text"
            placeholder="Username"
            className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
            onChange={(event) =>
              setUserInput({ ...userInput, username: event.target.value })
            }
            value={userInput.username}
          />
          <input
            type="password"
            placeholder="Password"
            className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
            onChange={(event) =>
              setUserInput({ ...userInput, password: event.target.value })
            }
            value={userInput.password}
          />
          <button
            className="bg-blue-500 text-white rounded-md p-2 my-2 w-full"
            onClick={() => loginMutation.mutate(userInput)}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
