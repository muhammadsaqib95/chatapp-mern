import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import io from "socket.io-client";
import { queryClient } from "../../index";
import { useUserDetails } from "../../Api/userAuth";
import ChatList from "./ChatList";
import SingleChat from "./SingleChat";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllChat,
  newMessage,
  userOnline,
  userOffline,
} from "../../redux/reducer/chatSlice";
import { useUserAllChats } from "../../Api/userChat";
// const socket = io.connect("http://localhost:3001");
function Chat() {
  const [socket, setSocket] = useState(null);
  const [newChat, setNewChat] = useState(false);
  const dispatch = useDispatch();
  const { isLoading, data, error } = useUserDetails();
  const { data: userAllChats } = useUserAllChats();
  useEffect(() => {
    setSocket(() =>
      io.connect("http://localhost:3001", {
        auth: { token: localStorage.getItem("user_token") },
      })
    );
  }, []);

  useEffect(() => {
    if (userAllChats && data) {
      dispatch(getAllChat({ userAllChats }));
    }
  }, [userAllChats, data]);
  useEffect(() => {
    if (data) {
      socket.emit("join-room", { id: data?.id });
    }
  }, [data]);
  useEffect(() => {
    if (socket) {
      socket.on("receive-message", (data) => {
        console.log("receive message on socket", data);
        dispatch(newMessage(data));
      });
      // socket.on("disconnect", () => {
      //   console.log("disconnect");
      //   setSocket(() =>
      //     io.connect("http://localhost:3001", {
      //       auth: { token: localStorage.getItem("user_token") },
      //     })
      //   );
      //   socket.emit("join-room", { id: data?.id });
      // });
      // socket.on("user-online", (data) => {
      //   console.log("this user is online", data);
      //   dispatch(userOnline({ userId: data }));
      // });
      // socket.on("user-offline", (data) => {
      //   console.log("this user is offline", data);
      //   dispatch(userOffline({ userId: data }));
      // });
    }
  }, [socket]);

  return (
    <>
      <div className="bg-white header-shadow w-full">
        <div className="max-w-screen-xl w-full mx-auto flex items-center justify-between py-6">
          <h1 className="font-bold text-2xl">Chat App</h1>
          <div className="flex items-center justify-center gap-7">
            <h2 className="font-bold text-xl">{data?.displayName}</h2>
            <button className="bg-[#2671E1] font-semibold text-white rounded-md px-4 py-1">
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 max-w-screen-xl w-full mx-auto flex items-start gap-[13px]">
        <div
          className="max-w-[334px] w-full bg-white overflow-y-scroll px-4"
          style={{ height: `calc(100vh - 120px)` }}
        >
          <ChatList setNewChat={setNewChat} />
        </div>
        <div
          className="w-full bg-white overflow-y-clip"
          style={{ height: `calc(100vh - 120px)` }}
        >
          <Routes>
            <Route exact path="/">
              <Route
                exact
                index
                element={
                  <div className="flex items-center justify-center h-[410px]">
                    <h1 className="text-[#878787] text-lg">
                      Select a chat to start messaging
                    </h1>
                  </div>
                }
              />
              <Route
                exact
                path="/:id"
                element={
                  <SingleChat newChat={newChat} setNewChat={setNewChat} />
                }
              />
            </Route>
            <Route path="*" element={<div>404</div>} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default Chat;
