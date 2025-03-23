import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: {},
    token: ""
}

export const userSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        }
    },
})

export const { setUser } = userSlice.actions

export default userSlice.reducer