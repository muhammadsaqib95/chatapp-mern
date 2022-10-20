import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  searchResults: [],
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    getSearchResults: (state, action) => {
        return {
            ...state,
            searchResults: action.payload ,
        }
    },
  },
})

export const { getSearchResults } = userSlice.actions

export default userSlice.reducer