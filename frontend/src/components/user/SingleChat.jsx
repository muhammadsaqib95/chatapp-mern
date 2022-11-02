import { useEffect, useState, Children, useRef } from "react";
import { useParams } from "react-router-dom";
import { useUserDetails } from "../../Api/userAuth";
import { sendChatMessage, useUserAllChats } from "../../Api/userChat";
import moment from "moment";
import Moment from "react-moment";
import { useMutation } from "@tanstack/react-query";
import { newMessage } from "../../redux/reducer/chatSlice";
import { useSelector, useDispatch } from "react-redux";
import NewChat from "./NewChat";
import { throttle } from "../utility";
import { useSocket } from "../../Providers/socket";
import EmojiPicker from "emoji-picker-react";

const throttledFunction = throttle((text, socket, user, chat) => {
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
              <div className="flex items-center gap-3">
                <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
                >
                  <circle cx="14.5073" cy="14.4928" r="14.4928" transform="rotate(90 14.5073 14.4928)" fill="#F7F3F3" />
                  <path d="M19.4766 9.90051L17.8791 8.3045C17.6841 8.1095 17.4231 8 17.1471 8C16.8711 8 16.6101 8.108 16.4151 8.3045L14.6946 10.022C14.4996 10.217 14.3901 10.4795 14.3901 10.7555C14.3901 11.033 14.4981 11.2925 14.6946 11.489L16.0386 12.8345C15.7324 13.5479 15.2925 14.1961 14.7426 14.744C14.1921 15.2975 13.5486 15.734 12.8346 16.043L11.4906 14.6975C11.2956 14.5025 11.0346 14.393 10.7586 14.393C10.6224 14.3925 10.4876 14.4192 10.3619 14.4715C10.2362 14.5238 10.1222 14.6006 10.0266 14.6975L8.30456 16.415C8.10956 16.61 8.00006 16.8725 8.00006 17.1485C8.00006 17.426 8.10806 17.6855 8.30456 17.882L9.90057 19.4781C10.2336 19.8111 10.6926 20.0016 11.1636 20.0016C11.2611 20.0016 11.3556 19.9941 11.4516 19.9776C13.4376 19.6506 15.4086 18.593 17.0001 17.003C18.5901 15.41 19.6461 13.439 19.9761 11.4515C20.0706 10.8875 19.8816 10.307 19.4766 9.90051ZM18.9126 11.273C18.6201 13.0415 17.6691 14.8055 16.2366 16.238C14.8041 17.6705 13.0416 18.6215 11.2731 18.914C11.0511 18.9515 10.8231 18.8765 10.6611 18.716L9.09357 17.1485L10.7556 15.485L12.5526 17.285L12.5661 17.2985L12.8901 17.1785C13.8725 16.8173 14.7646 16.2469 15.5046 15.5066C16.2446 14.7664 16.8148 13.874 17.1756 12.8915L17.2956 12.5675L15.4836 10.757L17.1456 9.0935L18.7131 10.661C18.8751 10.823 18.9501 11.051 18.9126 11.273Z" fill="#867E7E" />
                </svg>
                <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
                >
                  <circle cx="14.5073" cy="14.4928" r="14.4928" transform="rotate(90 14.5073 14.4928)" fill="#F7F3F3" />
                  <path d="M17.6001 11.2C17.6001 10.5382 17.0619 10 16.4001 10H9.20006C8.53826 10 8.00006 10.5382 8.00006 11.2V17.2C8.00006 17.8618 8.53826 18.4 9.20006 18.4H16.4001C17.0619 18.4 17.6001 17.8618 17.6001 17.2V15.2002L20.0001 17.2V11.2L17.6001 13.1998V11.2ZM16.4013 17.2H9.20006V11.2H16.4001L16.4007 14.1994L16.4001 14.2L16.4007 14.2006L16.4013 17.2Z" fill="#867E7E" />
                </svg>
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
                          className={`${message.sender === userData.id ? "sent" : "received"
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
