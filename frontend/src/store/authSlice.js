import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getCurrentUser } from '../services/authService'

// Runs once when the app opens: is there a valid session cookie?
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      return await getCurrentUser()
    } catch {
      return rejectWithValue(null)
    }
  },
)

// status: 'checking' (first load) | 'authenticated' | 'unauthenticated'
const initialState = {
  user: null,
  status: 'checking',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload
      state.status = 'authenticated'
    },
    clearUser(state) {
      state.user = null
      state.status = 'unauthenticated'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.status = 'unauthenticated'
      })
  },
})

export const { setUser, clearUser } = authSlice.actions
export const selectUser = (state) => state.auth.user
export const selectAuthStatus = (state) => state.auth.status

export default authSlice.reducer
