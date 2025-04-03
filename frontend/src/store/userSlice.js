import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: {},
    userSettings: {},
    token: ""
}

export const userSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setUserSettings: (state, action) => {
            state.userSettings = action.payload;
        }
    },
})

export const { setUser, setUserSettings } = userSlice.actions

export default userSlice.reducer