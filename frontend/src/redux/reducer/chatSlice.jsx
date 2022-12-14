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
    userTyping: (state, action) => {
        let chats = [...state.chats];
        let newArray = chats.map((chat) => {
            if (chat._id === action.payload.chat) {
                let users = [...chat.users];
                let newUsers = users.map((user) => {
                    if (user._id === action.payload.user) {
                        return {
                            ...user,
                            isTyping: true
                        }
                    }
                    return user;
                })
                return {
                    ...chat,
                    users: newUsers
                }
            }
            return chat;
        });
        return {
            ...state,
            chats: newArray
        }
    },
    userStopTyping: (state, action) => {
        let chats = [...state.chats];
        let newArray = chats.map((chat) => {
            if (chat._id === action.payload.chat) {
                let users = [...chat.users];
                let newUsers = users.map((user) => {
                    if (user._id === action.payload.user) {
                        return {
                            ...user,
                            isTyping: false
                        }
                    }
                    return user;
                })
                return {
                    ...chat,
                    users: newUsers
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
                let users = [...chat.users];
                let newUsers = users.map((user) => {
                    if (user._id === action.payload.userId) {
                        return {
                            ...user,
                            isOnline: true
                        }
                    }
                    return user;
                })
                return {
                    ...chat,
                    users: newUsers
                }
        });
        return {
            ...state,
            chats: newArray
        }
    },
    userOffline: (state, action) => {
        let chats = [...state.chats];
        let newArray = chats.map((chat) => {
            let users = [...chat.users];
            let newUsers = users.map((user) => {
                if (user._id === action.payload.userId) {
                    return {
                        ...user,
                        isOnline: false,
                        updatedAt: new Date()
                    }
                }
                return user;
            })
            return {
                ...chat,
                users: newUsers
            }
    });
        return {
            ...state,
            chats: newArray
        }
    }
  },
})

export const { getAllChat, newMessage, userOffline, userOnline, userTyping, userStopTyping } = chatSlice.actions

export default chatSlice.reducer