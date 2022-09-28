import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import io from "socket.io-client";
import { queryClient } from "../../index";
import { useUserDetails } from "../../Api/userAuth";
import ChatList from "./ChatList";
import SingleChat from "./SingleChat";
const socket = io.connect("http://localhost:3001");
function Chat() {
  const { isLoading, data, error } = useUserDetails();
  useEffect(() => {
    // socket.emit("send-message", { name: "user" });
    if (data) socket.emit("join-room", { id: data?.id });
    // socket.on('receive-message', (data) => {
    //   console.log(data);
    // }
    // );
  }, [data]);
  useEffect(() => {
      socket.on("receive-message", (data) => {
        queryClient.setQueriesData(["userAllChats"], (oldData) => {
          let newChat = oldData.filter((chat) => chat._id === data.chatId)[0];
          newChat.messages = [...newChat.messages, data.message];
          return oldData;
        }
        );
        
      });
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
          <ChatList />
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
                  <div className="flex items-center justify-center h-full">
                    Select a chat to start messaging
                  </div>
                }
              />
              <Route exact path="/:id" element={<SingleChat />} />
            </Route>
          </Routes>
        </div>
      </div>
    </>
  );
}

export default Chat;
