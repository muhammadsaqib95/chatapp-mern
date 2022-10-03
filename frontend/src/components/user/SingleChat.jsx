import { useEffect, useState, Children, useRef } from "react";
import { useParams } from "react-router-dom";
import { useUserDetails } from "../../Api/userAuth";
import { sendChatMessage, useUserAllChats } from "../../Api/userChat";
import moment from "moment";
import Moment from "react-moment";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../index";
import ScrollToBottom from "react-scroll-to-bottom";
import { newMessage } from "../../redux/reducer/chatSlice";
import { useSelector, useDispatch } from "react-redux";
function SingleChat({newChat, setNewChat}) {
  const lastMessageRef = useRef(null);
  const dispatch = useDispatch();
  const { id } = useParams();
  const { data: userData } = useUserDetails();
  const data = useSelector((state) => state.chat.chats);

  const [currentChat, setCurrentChat] = useState({});
  const [userInput, setUserInput] = useState("");
  useEffect(() => {
    if (data) {
      setCurrentChat(() => data?.filter((chat) => chat._id === id)[0] ?? {});
    }
  }, [data, id]);
  useEffect(() => {
    if(currentChat?.messages?.length > 0){
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChat]);

  const sendMessage = useMutation(sendChatMessage, {
    onSuccess: (data) => {
      dispatch(newMessage({ chatId: id, message: data }));
      setUserInput("");
    },
  });

  return (
    <>
    {
      newChat ? (
        <div className="w-full">
          <h1 className="font-semibold text-lg pl-7 pt-6 pb-2">New Message To:</h1>
        </div>)
        :
    <>
      <div className="w-full chat-header-shadow">
        <div className="flex justify-between items-center py-4 px-4">
          <div className="flex items-center gap-4">
            <div className="relative min-w-[56px] w-14 min-h-[56px] h-14 rounded-full flex items-center justify-center bg-[#D6E1E3]">
              {
                currentChat?.users?.filter(
                  (user) => user._id !== userData?.id
                )[0]?.displayName[0]
              }
            </div>
            <div>
              <h4 className="font-semibold text-base">
                {
                  currentChat?.users?.filter(
                    (user) => user._id !== userData?.id
                  )[0]?.displayName
                }
              </h4>
              <p className="text-[#878787] text-xs">
                last online:{" "}
                <Moment fromNow>
                  {
                    currentChat?.users?.filter(
                      (user) => user._id !== userData?.id
                    )[0]?.updateAt
                  }
                </Moment>
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
            <div className="w-full px-2 md:px-10 h-max flex flex-col transition-all duration-500">
              {Children.toArray(
                currentChat.messages?.map((message, index) => {
                  return (
                    <>
                      {message.sender !== userData.id && (
                        <p className="text-[10px] text-[#706E6D] ml-2 -mb-1">
                          {currentChat.users.filter(
                            (user) => user._id !== userData.id
                          )[0].displayName ?? ""}
                        </p>
                      )}
                      <div
                        key={index}
                        className={`${
                          message.sender === userData.id ? "sent" : "received"
                        } py-1 px-4`}
                      >
                        <p className="text-sm pt-2">{message.message}</p>
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
    </>
}
      <div className="border-t border-t-[#E0E0E0] py-6 px-10 flex items-center gap-3">
        <input
          type="text"
          placeholder="Write your message"
          className={"bg-[#EAEEF2] rounded-full py-3 px-6 w-full"}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
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
  );
}

export default SingleChat;
