import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  chats: [],
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    getAllChat: (state, action) => {
        return {
            ...state,
            chats: action.payload?.userAllChats ?? [],
        }
    },
    newMessage: (state, action) => {
        let chats = [...state.chats];
        let newArray = chats.map((chat) => {
            if (chat._id === action.payload.chatId) {
              return {
                ...chat,
                messages: [...chat.messages, action.payload.message],
              }
            }
            return chat;
          });
        return {
            ...state,
            chats: newArray
        }
    },
    userOnline: (state, action) => {
        let chats = [...state.chats];
        let newArray = chats.map((chat) => {
            chat.user.forEach((user) => {
                if (user._id === action.payload.userId) {
                    user.online = true;
                }
            })
            return chat;
        })
            
        return {
            ...state,
            chats: newArray
        }
    },
    userOffline: (state, action) => {
        let chats = [...state.chats];
        let newArray = chats.map((chat) => {
            chat.user.forEach((user) => {
                if (user._id === action.payload.userId) {
                    user.online = false;
                    user.updatedAt = new Date();
                }
            })
            return chat;
        })
        return {
            ...state,
            chats: newArray
        }
    }
  },
})

export const { getAllChat, newMessage, userOffline, userOnline } = chatSlice.actions

export default chatSlice.reducer