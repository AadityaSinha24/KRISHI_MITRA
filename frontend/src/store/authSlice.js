import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../conf/api";

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/users/current-user");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post("/users/login", credentials);
      return res.data.data.user;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await api.post("/users/logout");
  } catch {
    // even if the call fails, clear the local state
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: true }, // loading = checking session on first load
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (s, a) => {
        s.user = a.payload;
        s.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (s) => {
        s.user = null;
        s.loading = false;
      })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.user = a.payload;
      })
      .addCase(logoutUser.fulfilled, (s) => {
        s.user = null;
      });
  },
});

export default authSlice.reducer;