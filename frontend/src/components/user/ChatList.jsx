import { Children } from "react";
import { Link } from "react-router-dom";
import { useUserDetails } from "../../Api/userAuth";
import { useUserAllChats } from "../../Api/userChat";
export default function ChatList() {
  const { data: userData } = useUserDetails();
  const { isLoading, data, error } = useUserAllChats();
  // console.log(data, userData);
  return (
    <>
      <div className="flex justify-between mt-8">
        <h3 className="font-semibold text-base">Chats</h3>
      </div>
      <div>
        {Children.toArray(
          data?.map((chat, index) => {
            let currentChat = chat.users.filter((user) => user._id !== userData.id)[0];
            return <>
            {index !== 0 && <hr className="w-full border-0 bg-[#F5F5F5] h-[1.06px]" />}
            <Link to={`/chat/${chat._id}`} className="flex items-center gap-4 py-4 pl-4 rounded-md hover:bg-[#F5F5F5] my-1">
              <div className="relative min-w-[56px] w-14 min-h-[56px] h-14 rounded-full flex items-center justify-center bg-[#D6E1E3]">
                {
                  currentChat.displayName[0]
                }
                <div className="absolute right-0 bottom-[8px] min-w-[10px] w-[10px] min-h-[10px] h-[10px] bg-[#867E7E] rounded-full border border-white">
                  
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-base">
                  {
                    currentChat.displayName
                  }
                </h4>
                <p className="text-[#878787] text-xs line-clamp-1">
                  {
                    chat.messages?.[chat.messages.length - 1]?.message ?? 'You last message will appear here'
                  }
                </p>
              </div>
            </Link>
            </>
})
        )}
      </div>
    </>
  );
}
