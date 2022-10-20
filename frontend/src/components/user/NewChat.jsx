import { debounce } from "../utility";
import { Children, useState } from "react";
import { searchUser } from "../../Api/userAuth";
import { useDispatch, useSelector } from "react-redux";
import { getSearchResults } from "../../redux/reducer/userSlice";

const updateDebounceText = debounce((text, dispatch) => {
  if (text.trim().length > 0) {
    searchUser(text).then((data) => {
      dispatch(getSearchResults(data));
    });
  }
}, 500);

export default function NewChat() {
  const dispatch = useDispatch();
  const searchResult = useSelector((state) => state.user.searchResults);
  const [search, setSearch] = useState("");
  function handleSearch(event) {
    setSearch(event.target.value);
    updateDebounceText(event.target.value, dispatch);
  }

  return (
    <div className="w-full h-full">
      <h1 className="font-semibold text-lg pl-7 pt-6 pb-2 border-b border-b-[#EAEEF2]">
        New Message To:
      </h1>
      <div className="w-full chat-header-shadow">
        <input
          value={search}
          type="text"
          placeholder="Type name or email here"
          className="w-full pl-7 py-3 text-sm"
          onChange={handleSearch}
        />
      </div>
      <div style={{ height: "calc(100% - 200px)" }}>
        {search ? (
          searchResult.length > 0 ? (
            Children.toArray(
              searchResult.map((user) => {
                return (
                  <div className="flex items-center py-3 px-7 border-b border-b-[#EAEEF2] hover:bg-[#F5F5F5]">
                    <div className="w-12 h-12 rounded-full bg-[#e5ecfb] flex items-center justify-center">
                      {user.displayName[0]}
                    </div>
                    <div className="ml-4">
                      <h1 className="font-semibold text-sm">
                        {user.displayName}
                      </h1>
                      <h1 className="text-xs text-gray-400">{user.email}</h1>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <h1 className="text-gray-400 text-sm">No user found</h1>
            </div>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <h1 className="font-semibold text-lg">Search your friend</h1>
          </div>
        )}
      </div>
    </div>
  );
}
