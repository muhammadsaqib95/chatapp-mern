import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { queryClient } from "../../index";
import { useUserDetails } from "../../Api/userAuth";
import ChatList from "./ChatList";
import SingleChat from "./SingleChat";
import { useDispatch } from "react-redux";
import { useUserContext } from "../userAuth/user";
import { useSocket } from "../../Providers/socket";

import {
  getAllChat,
  newMessage,
  userOnline,
  userOffline,
  userTyping,
  userStopTyping,
} from "../../redux/reducer/chatSlice";
import { useUserAllChats } from "../../Api/userChat";
import ChatWidget from "../../assets/svg/ChatWidget";
import { usePeer } from "../../Providers/peer";
function Chat() {
  const { socket } = useSocket();
  const { peer } = usePeer();
  const [newChat, setNewChat] = useState(false);
  const { setUser } = useUserContext();
  const dispatch = useDispatch();
  const { isLoading, data, error } = useUserDetails();
  const { data: userAllChats } = useUserAllChats();

  useEffect(() => {
    if (userAllChats && data) {
      dispatch(getAllChat({ userAllChats }));
    }
  }, [userAllChats, data]);
  useEffect(() => {
    if (data) {
      if (socket) {
        socket.emit("join-room", { id: data?.id });
      }
    }
    return () => {
      socket.off("join-room");
    };
  }, [data]);
  useEffect(() => {
    if (socket) {
      socket.on("receive-message", (data) => {
        dispatch(newMessage(data));
      });
      socket.on("typing", (data) => {
        dispatch(userTyping(data));
      });
      socket.on("notTyping", (data) => {
        dispatch(userStopTyping(data));
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
      socket.on("user-online", (data) => {
        dispatch(userOnline({ userId: data }));
      });
      socket.on("user-offline", (data) => {
        dispatch(userOffline({ userId: data }));
      });
    }
    return () => {
      socket.off("receive-message");
      socket.off("typing");
      socket.off("notTyping");
      socket.off("user-online");
      socket.off("user-offline");
    }
  }, [socket]);


  useEffect(() => {
    if (peer) {
      peer.on("open", (id) => {
        console.log("peer id", id);
      });
      peer.on("call", (call) => {
        console.log("call", call);
        call.answer();
        call.on("stream", (stream) => {
          console.log("stream", stream);
        });
        call.on("close", () => {
          console.log("close");
        });
      });
    }
  }, [peer]);


  return (
    <>
      <div className="bg-white header-shadow w-full">
        <div className="max-w-screen-xl w-full mx-auto flex items-center justify-between py-6">
          <h1 className="font-bold text-2xl">Chat App</h1>
          <div className="flex items-center justify-center gap-7">
            <h2 className="font-bold text-xl">{data?.displayName}</h2>
            <button
              className="bg-[#2671E1] font-semibold text-white rounded-md px-4 py-1"
              onClick={() => {
                localStorage.removeItem("user_token");
                setUser(null);
                queryClient.clear();
              }}
            >
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
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center">
                      <ChatWidget className='h-[300px]' />
                      <h1 className="text-[#878787] text-lg mt-6">
                        Select a chat to start messaging
                      </h1>
                    </div>
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
