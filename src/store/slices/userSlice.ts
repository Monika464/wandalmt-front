import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { authorizedRequest } from "../../utils/authorizedRequest";

type Role = "user" | "admin";

interface IUser {
  _id: string;
  name: string;
  surname: string;
  email: string;
  role: Role;
  active: boolean;
}

interface UserState {
  users: IUser[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UserState = {
  users: [],
  status: "idle",
  error: null,
};

export const fetchUsers = createAsyncThunk<IUser[]>(
  "users/fetchUsers",
  async (_, thunkApi) => {
    try {
      const users = await authorizedRequest<IUser[]>(thunkApi, {
        url: "/admin/users",
        method: "GET",
      });

      //console.log("✅ Users fetched:", users);
      return users;
    } catch (error: any) {
      console.error("❌ Error fetching users:", error);
      return thunkApi.rejectWithValue(error);
    }
  },
);

// Deleting a user
export const deleteUser = createAsyncThunk<string, string>(
  "users/deleteUser",
  async (userId, thunkApi) => {
    try {
      await authorizedRequest(thunkApi, {
        url: `/admin/delete-user/${userId}`,
        method: "DELETE",
      });

      console.log("🗑️ User deleted:", userId);
      return userId;
    } catch (error: any) {
      console.error("❌ Error deleting user:", error);
      return thunkApi.rejectWithValue(error);
    }
  },
);

// Aktywuj/dezaktywuj użytkownika
export const toggleUserStatus = createAsyncThunk<
  { userId: string; newStatus: boolean },
  { userId: string; newStatus: boolean }
>("users/toggleStatus", async ({ userId, newStatus }, thunkApi) => {
  try {
    await authorizedRequest(thunkApi, {
      url: `/admin/users/${userId}/status`,
      method: "PATCH",
      data: { active: newStatus },
    });

    //console.log(`✅ User ${userId} status updated: ${newStatus}`);
    return { userId, newStatus };
  } catch (error: any) {
    console.error("❌ Error toggling user status:", error);
    return thunkApi.rejectWithValue(error);
  }
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { userId, newStatus } = action.payload;
        const user = state.users.find((u) => u._id === userId);
        if (user) user.active = newStatus;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      });
  },
});

export default userSlice.reducer;
