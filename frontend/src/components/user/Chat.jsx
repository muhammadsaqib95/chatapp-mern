import { useEffect } from "react";
import io from "socket.io-client";
import { useUserDetails } from "../../Api/userAuth";
import ChatList from "./ChatList";
const socket = io.connect("http://localhost:3001");
function Chat() {
  const { isLoading, data, error } = useUserDetails();
  console.log(isLoading, data);
  useEffect(() => {
    socket.emit("send-message", { name: "user" });
    socket.emit("join", "user");
  }, []);

  return (
    <>
      <div className="bg-white header-shadow w-full">
        <div className="max-w-screen-xl w-full mx-auto flex items-center justify-between py-6">
          <h1 className="font-bold text-2xl">Chat App</h1>
          <div className="flex items-center justify-center gap-7">
            <h2 className="font-bold text-xl">{data?.displayName}</h2>
            <button className="bg-[#0066FF] font-semibold text-white rounded-md px-4 py-1">
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 max-w-screen-xl w-full mx-auto flex items-start gap-[13px]">
        <div className="max-w-[334px] w-full bg-white overflow-y-scroll px-4" style={{height : `calc(100vh - 120px)`}}>
            <ChatList />
        </div>
        <div className="w-full bg-white overflow-y-scroll" style={{height : `calc(100vh - 120px)`}}>
            single chat
        </div>

      </div>
    </>
  );
}

export default Chat;
