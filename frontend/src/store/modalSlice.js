import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isOpen: false,
    modalType: "", // Modal name (id)
    modalData: null,
}


export const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        openModal: (state, action) => {
            state.isOpen = true
            state.modalData = action.payload.modalData
            state.modalType = action.payload.modalType
        },
        closeModal: (state) => {
            state.isOpen = false
            state.modalData = null
            state.modalType = ""
        }
    },
})


export const { openModal, closeModal } = modalSlice.actions

export default modalSlice.reducer