import { Children, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useUserDetails } from "../../Api/userAuth";
import { useUserAllChats } from "../../Api/userChat";
import { useSelector } from "react-redux";
export default function ChatList({setNewChat}) {
  const { data: userData } = useUserDetails();
  // const { isLoading, data, error } = useUserAllChats();
  const  chatRoute  = useParams();
  const data = useSelector((state) => state.chat.chats);

// useEffect(() => {
  // console.log(x);
  // const x = 9;
// }, []);

  // console.log(data, userData);
  return (
    <>
      <div className="flex justify-between mt-8">
        <div className="flex items-center justify-between w-full">
          <h3 className="font-semibold text-base">Chats</h3>
          <div onClick={() => {setNewChat((previousState) => !previousState)}} className='cursor-pointer'>
            <svg
              width="29"
              height="29"
              viewBox="0 0 29 29"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="14.5073"
                cy="14.4928"
                r="14.4928"
                transform="rotate(90 14.5073 14.4928)"
                fill="#F7F3F3"
              />
              <g clip-path="url(#clip0_1_856)">
                <g clip-path="url(#clip1_1_856)">
                  <path
                    d="M18.4443 6.59393L20.9309 9.08054L19.0353 10.977L16.5487 8.49038L18.4443 6.59393ZM9.33667 18.1881L11.8233 18.1881L17.8632 12.1482L15.3766 9.66157L9.33667 15.7015L9.33667 18.1881Z"
                    fill="#867E7E"
                  />
                  <path
                    d="M17.4687 19.0738L10.4851 19.0738C10.4684 19.0738 10.451 19.0802 10.4343 19.0802C10.413 19.0802 10.3917 19.0744 10.3698 19.0738L8.45101 19.0738L8.45101 10.0561L12.8613 10.0561L14.1496 8.76782L8.45101 8.76782C7.74054 8.76782 7.16276 9.34496 7.16276 10.0561L7.16276 19.0738C7.16276 19.7849 7.74054 20.362 8.45101 20.362L17.4687 20.362C17.8104 20.362 18.1381 20.2263 18.3796 19.9847C18.6212 19.7431 18.757 19.4154 18.757 19.0738L18.757 13.4905L17.4687 14.7788L17.4687 19.0738Z"
                    fill="#867E7E"
                  />
                </g>
              </g>
              <defs>
                <clipPath id="clip0_1_856">
                  <rect
                    width="16.1559"
                    height="16.1559"
                    fill="white"
                    transform="translate(22 6) rotate(90)"
                  />
                </clipPath>
                <clipPath id="clip1_1_856">
                  <rect
                    width="15.2174"
                    height="15.2174"
                    fill="white"
                    transform="translate(5.71349 5.86932)"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      <div>
        {(data && data.length > 0) ? Children.toArray(
          data?.map((chat, index) => {
            let currentChat = chat.users.filter(
              (user) => user._id !== userData.id
            )[0];
            return (
              <>
                {index !== 0 && (
                  <hr className="w-full border-0 bg-[#F5F5F5] h-[1.06px]" />
                )}
                <Link
                  to={`/chat/${chat._id}`}
                  className={`flex items-center gap-4 py-4 pl-4 rounded-md hover:bg-[#F5F5F5] my-1 ${
                  chatRoute['*'] == chat._id ? "bg-[#2671e10d]" : "bg-transparent"
                  }`}
                  style={{
                    // backgroundColor: chatRoute['*'] == chat._id ? "#2671e10d" : "transparent",
                  }}
                >
                  <div className="relative min-w-[56px] w-14 min-h-[56px] h-14 rounded-full flex items-center justify-center bg-[#2671e121]">
                    {currentChat.displayName[0]}
                    <div
                      className="absolute right-0 bottom-[8px] min-w-[10px] w-[10px] min-h-[10px] h-[10px] bg-[#867E7E] rounded-full border border-white"
                      style={{
                        background: currentChat?.isOnline
                          ? `#02B033`
                          : "#867E7E",
                      }}
                    ></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">
                      {currentChat.displayName}
                    </h4>
                    <p className="text-[#878787] text-xs line-clamp-1">
                      {chat.messages?.[chat.messages.length - 1]?.message ??
                        "You last message will appear here"}
                    </p>
                  </div>
                </Link>
              </>
            );
          })
        )
      :
      <div className='flex justify-center items-center h-[300px]'>
        <h3 className='text-[#878787] text-lg'>No chats yet</h3>
      </div>
      }
      </div>
    </>
  );
}
