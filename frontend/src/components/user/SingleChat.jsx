import { useEffect, useState, Children, useRef } from "react";
import { useParams } from "react-router-dom";
import { useUserDetails } from "../../Api/userAuth";
import { sendChatMessage, useUserAllChats } from "../../Api/userChat";
import moment from "moment";
import Moment from "react-moment";
import { useMutation } from "@tanstack/react-query";
import { newMessage } from "../../redux/reducer/chatSlice";
import { useSelector, useDispatch } from "react-redux";
// import { Peer } from "peerjs";
import NewChat from "./NewChat";
import { throttle } from "../utility";
import { useSocket } from "../../Providers/socket";
import EmojiPicker, {
  EmojiStyle,
  SkinTones,
  Theme,
  Categories,
  EmojiClickData,
  Emoji,
  SuggestionMode,
  SkinTonePickerLocation,
} from "emoji-picker-react";

const throttledFunction = throttle((text, socket, user, chat) => {
  // console.log("throttledFunction", text);
  socket.emit("typing", { user, chat });
}, 2000);

function SingleChat({ newChat, setNewChat }) {
  const { socket } = useSocket();
  const lastMessageRef = useRef(null);
  const dispatch = useDispatch();
  const { id } = useParams();
  const { data: userData } = useUserDetails();
  const data = useSelector((state) => state.chat.chats);

  const [currentChat, setCurrentChat] = useState({});
  const [otherUser, setOtherUser] = useState({});
  const [userInput, setUserInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  function onClick(emojiData, event) {
    setUserInput(pre => pre + emojiData.emoji);
  }

  useEffect(() => {
    if (data) {
      let chat = data?.filter((chat) => chat._id === id)[0];
      setCurrentChat(() => chat ?? {});
      setOtherUser(
        () => chat?.users.filter((user) => user._id !== userData?.id)[0] ?? {}
      );
    }
  }, [data, id]);
  useEffect(() => {
    if (currentChat?.messages?.length > 0) {
      lastMessageRef?.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChat]);

  const sendMessage = useMutation(sendChatMessage, {
    onSuccess: (data) => {
      dispatch(newMessage({ chatId: id, message: data }));
      setUserInput("");
    },
  });

  // useEffect(() => {
  //   if (userData?.id) {
  //     const peer = new Peer(userData?.id);
  //     peer.on("open", (id) => {
  //       console.log("peer id", id);
  //     });
  //     peer.on("call", (call) => {
  //       console.log("call", call);
  //       call.answer();
  //       call.on("stream", (stream) => {
  //         console.log("stream", stream);
  //       });
  //     });
  //   }
  // }, [userData]);
  function hanldeMessageType(e) {
    setUserInput(e.target.value);
    throttledFunction(e.target.value, socket, userData?.id, currentChat?._id);
  }
  return (
    <>
      {newChat ? (
        <NewChat />
      ) : (
        <>
          <div className="w-full chat-header-shadow">
            <div className="flex justify-between items-center py-4 px-4">
              <div className="flex items-center gap-4">
                <div className="relative min-w-[56px] w-14 min-h-[56px] h-14 rounded-full flex items-center justify-center bg-[#2671e121] uppercase font-bold">
                  {otherUser?.displayName?.[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-base">
                    {otherUser?.displayName}
                  </h4>
                  <p className="text-[#878787] text-xs">
                    {otherUser?.isTyping ? (
                      "Typing..."
                    ) : otherUser.isOnline ? (
                      "Online"
                    ) : (
                      <>
                        Last online: &nbsp;
                        <Moment fromNow>{otherUser?.updatedAt}</Moment>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {
            <div
              className="overflow-y-scroll flex flex-col-reverse transition-all duration-500"
              style={{ height: "calc(100% - 185px)" }}
              id="chat-scroll"
            >
              <div ref={lastMessageRef}></div>
              <div className="w-full px-2 md:px-4 h-max flex flex-col transition-all duration-500">
                {Children.toArray(
                  currentChat.messages?.map((message, index) => {
                    return (
                      <>
                        {message.sender !== userData.id && (
                          <p className="text-[10px] text-[#706E6D] ml-2 -mb-1">
                            {otherUser.displayName ?? ""}
                          </p>
                        )}
                        <div
                          key={index}
                          className={`${
                            message.sender === userData.id ? "sent" : "received"
                          } py-1 px-4`}
                        >
                          <p className="text-sm pt-2">{message?.message}</p>
                          <small className="text-[8px] font-light float-right">
                            {moment(`${message.sentAt}`).format("LT")}
                          </small>
                        </div>
                      </>
                    );
                  })
                ) ?? ""}
              </div>
            </div>
          }
          <div className="border-t border-t-[#E0E0E0] py-6 px-10 flex items-center gap-3">
            <div className="relative">
              {showEmoji && (
                <div className="absolute bottom-full">
                  <EmojiPicker
                    onEmojiClick={onClick}
                    autoFocusSearch={false}
                  />
                </div>
              )}
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
                onClick={() => setShowEmoji(!showEmoji)}
              >
                <path
                  d="M14.7916 9.91666C15.6891 9.91666 16.4166 9.18912 16.4166 8.29166C16.4166 7.39419 15.6891 6.66666 14.7916 6.66666C13.8942 6.66666 13.1666 7.39419 13.1666 8.29166C13.1666 9.18912 13.8942 9.91666 14.7916 9.91666Z"
                  fill="#2671E1"
                />
                <path
                  d="M7.20837 9.91666C8.10584 9.91666 8.83337 9.18912 8.83337 8.29166C8.83337 7.39419 8.10584 6.66666 7.20837 6.66666C6.31091 6.66666 5.58337 7.39419 5.58337 8.29166C5.58337 9.18912 6.31091 9.91666 7.20837 9.91666Z"
                  fill="#2671E1"
                />
                <path
                  d="M10.9891 0.166656C5.00913 0.166656 0.166626 5.01999 0.166626 11C0.166626 16.98 5.00913 21.8333 10.9891 21.8333C16.98 21.8333 21.8333 16.98 21.8333 11C21.8333 5.01999 16.98 0.166656 10.9891 0.166656ZM11 19.6667C6.21163 19.6667 2.33329 15.7883 2.33329 11C2.33329 6.21166 6.21163 2.33332 11 2.33332C15.7883 2.33332 19.6666 6.21166 19.6666 11C19.6666 15.7883 15.7883 19.6667 11 19.6667ZM5.58329 13.1667C6.42829 15.7017 8.52996 17.5 11 17.5C13.47 17.5 15.5716 15.7017 16.4166 13.1667H5.58329Z"
                  fill="#2671E1"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Write your message"
              className={"bg-[#EAEEF2] rounded-full py-3 px-6 w-full"}
              value={userInput}
              onChange={hanldeMessageType}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendMessage.mutate({
                    message: userInput,
                    chatId: id,
                  });
                }
              }}
            />
            <div
              className="p-2 rounded-md bg-[#2671E1] h-max w-max cursor-pointer"
              onClick={() => {
                sendMessage.mutate({
                  message: userInput,
                  chatId: id,
                });
              }}
            >
              <svg
                width="12"
                height="13"
                viewBox="0 0 12 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.4631 1.32803L5.55298 7.2382"
                  stroke="white"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M11.4628 1.32803L7.70179 12.0738L5.55264 7.2382L0.717041 5.08905L11.4628 1.32803Z"
                  stroke="white"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SingleChat;
