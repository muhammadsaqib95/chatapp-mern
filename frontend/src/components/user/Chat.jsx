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
import { useRef } from "react";
function Chat() {
  const { socket } = useSocket();
  const { peer } = usePeer();
  const [newChat, setNewChat] = useState(false);
  const { setUser } = useUserContext();
  const dispatch = useDispatch();
  const { isLoading, data, error } = useUserDetails();
  const { data: userAllChats } = useUserAllChats();
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callSate, setCallState] = useState(null);
  const remoteVid = useRef(null);
  const ownVid = useRef(null);

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
      socket.on("call-made", async (data) => {
        // console.log(data);
        setIncomingCall(data.from);
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
    };
  }, [socket]);

  useEffect(() => {
    if (peer) {
      peer.on("open", (id) => {
        console.log("peer id", id);
      });
      peer.on("call", (call) => {
        setCallState(call);
        let own = ownVid.current;
        own.muted = true;
        
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            call.answer(stream);
            setLocalStream(stream);
            own.srcObject = stream;
            own.play();
          });

        call.on("stream", (stream) => {
          setRemoteStream(stream);
          // console.log("stream", stream);
          // remoteVid.srcObject = stream;

          let video = remoteVid.current;
        video.muted = true;
        video.srcObject = stream;
        video.play();

       


        });

        call.on("close", () => {
          console.log("call close 1");
        });

      });
    }
  }, [peer]);

  useEffect(() => {
    if (callSate){
      callSate.on("close", () => {
        console.log("call close");
        let video = remoteVid.current;
        video.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
        ownVid.current.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
        ownVid.current.srcObject = null;
        video.srcObject = null;
        setRemoteStream(null);
      });
    }
  }, [callSate]);
  return (
    <>
      {
        // <div className="relative">
        <div
          className={`fixed top-0 left-0 z-50 h-screen w-screen bg-white ${
            remoteStream ? "block" : "hidden"
          }`}
        >

            <div className="absolute top-0 left-0 h-full w-full z-[1]">
              <video ref={remoteVid} className="w-full h-full" />
            </div>
          <div className=" absolute right-8 bottom-8 z-[2] ">
            <video ref={ownVid} autoPlay className={`${localStream ? 'w-36 h-48' :"w-full h-full"}`} />
          </div>
          <div className="absolute left-1/2 bottom-16 z-[2]">
              <button 
              className="bg-red-500 text-white px-4 py-2 rounded-full"
              onClick={() => {
                callSate.close();
                let video = remoteVid.current;
                video.srcObject.getTracks().forEach((track) => {
                  track.stop();
                });
                ownVid.current.srcObject.getTracks().forEach((track) => {
                  track.stop();
                });
                ownVid.current.srcObject = null;
                video.srcObject = null;
                setRemoteStream(null);
              }}>End Call</button>
            </div>
        </div>
        // </div>
      }
      {incomingCall && (
        <div className="fixed top-0 left-0 h-screen w-screen flex items-end md:items-center justify-center bg-gray-600 bg-opacity-70 shadow-md z-10">
          <div className="bg-white w-full max-w-[450px] rounded-md py-8 m-3 md:m-0">
            <div className="flex justify-center items-center p-4 flex-col gap-4">
              <div className="min-w-[56px] w-14 min-h-[56px] h-14 rounded-full flex items-center justify-center bg-[#2671e121] uppercase font-bold">
                {incomingCall.displayName[0]}
              </div>
              <div className="flex items-center">
                <div className="ml-4">
                  <h1 className="text-lg font-semibold">
                    {incomingCall.displayName}
                    <span className="font-normal text-base">
                      &nbsp;is calling you
                    </span>
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center p-3 gap-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-full"
                onClick={() => {
                  socket.emit("call-decline", { id: incomingCall.id });
                  setIncomingCall(null);
                }}
              >
                Decline
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-full"
                onClick={() => {
                  socket.emit("call-accept", {
                    id: incomingCall.id,
                    peer: peer._id,
                  });
                  setIncomingCall(null);
                }}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
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
                      <ChatWidget className="h-[300px]" />
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
