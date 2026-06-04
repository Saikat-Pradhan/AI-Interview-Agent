import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        userData: null
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
            state.name = action.payload.name;
        }
    }
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;