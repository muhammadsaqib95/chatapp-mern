import { configureStore } from '@reduxjs/toolkit'
import chatSlice from './reducer/chatSlice'
export const store = configureStore({
  reducer: {
    chat: chatSlice,
  },
})