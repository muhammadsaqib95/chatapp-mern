import { configureStore } from '@reduxjs/toolkit'
import chatSlice from './reducer/chatSlice'
import userSlice from './reducer/userSlice'
export const store = configureStore({
  reducer: {
    chat: chatSlice,
    user: userSlice,
  },
})