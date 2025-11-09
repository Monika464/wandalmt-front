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
  }
);
// export const fetchUsers = createAsyncThunk(
//   "users/fetchUsers",
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       const state = getState() as { auth: { token: string | null } };
//       const token = state.auth.token;

//       //console.log("Token in fetchUsers thunk:", token);

//       if (!token) {
//         return rejectWithValue("No token found");
//       }

//       const res = await api.get("/admin/users", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       return res.data;
//     } catch (error) {
//       if (axios.isAxiosError(error) && error.response) {
//         return rejectWithValue(error.response.data.message);
//       }
//       return rejectWithValue("An unknown error occurred");
//     }
//   }
// );

// Usuwanie użytkownika
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
  }
);
// export const deleteUser = createAsyncThunk(
//   "users/deleteUser",
//   async (userId: string, { getState, rejectWithValue }) => {
//     try {
//       const state = getState() as { auth: { token: string | null } };
//       const token = state.auth.token;

//       if (!token) return rejectWithValue("No token found");

//       await api.delete(`/admin/delete-user/${userId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       return userId;
//     } catch (error) {
//       if (axios.isAxiosError(error) && error.response) {
//         return rejectWithValue(error.response.data.message);
//       }
//       return rejectWithValue("An unknown error occurred");
//     }
//   }
// );

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

    console.log(`✅ User ${userId} status updated: ${newStatus}`);
    return { userId, newStatus };
  } catch (error: any) {
    console.error("❌ Error toggling user status:", error);
    return thunkApi.rejectWithValue(error);
  }
});
// export const toggleUserStatus = createAsyncThunk(
//   "users/toggleStatus",
//   async (
//     { userId, newStatus }: { userId: string; newStatus: boolean },
//     { getState, rejectWithValue }
//   ) => {
//     try {
//       const state = getState() as { auth: { token: string | null } };
//       const token = state.auth.token;

//       if (!token) return rejectWithValue("Brak tokenu uwierzytelniającego");

//       await api.patch(
//         `/admin/users/${userId}/status`,
//         { active: newStatus },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       return { userId, newStatus };
//     } catch (err) {
//       // Typowanie błędu jako AxiosError<BackendError>
//       let errorMessage: string = "Wystąpił błąd";
//       if (axios.isAxiosError(err)) {
//         const axiosError = err as AxiosError<BackendError>;
//         errorMessage =
//           axiosError.response?.data?.message ||
//           axiosError.message ||
//           errorMessage;
//       } else if (err instanceof Error) {
//         errorMessage = err.message;
//       }
//       console.error("RegisterAdmin error:", errorMessage, err.response);
//       return rejectWithValue(errorMessage);
//       //   return rejectWithValue(
//       //     err.response?.data?.message || "Błąd zmiany statusu"
//       //   );
//     }
//   }
// );

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
