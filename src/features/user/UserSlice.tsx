import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const getUserNameFromLocalStorage = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

const getIdFromLocalStorage = () => {
  try {
    const id = localStorage.getItem("id");
    return id ? JSON.parse(id) : null;
  } catch (error) {
    console.error("Error parsing id from localStorage:", error);
    return null;
  }
};

const getRoleFromLocalStorage = () => {
  try {
    const role = localStorage.getItem("role");
    return role ? JSON.parse(role) : null;
  } catch (error) {
    console.error("Error parsing role from localStorage:", error);
    return null;
  }
};

const getEmailFromLocalStorage = () => {
  try {
    const email = localStorage.getItem("email");
    return email ? JSON.parse(email) : null;
  } catch (error) {
    console.error("Error parsing email from localStorage:", error);
    return null;
  }
};

const getTokenFromLocalStorage = () => {
  try {
    const token = localStorage.getItem("token");
    return token ? JSON.parse(token) : null;
  } catch (error) {
    console.error("Error parsing token from localStorage:", error);
    return null;
  }
};

type InitialStateType = {
  username: string | null;
  email: string | null;
  role: string | null;
  id: string | null;
  token: string | null;
};

const initialState: InitialStateType = {
  username: getUserNameFromLocalStorage(),
  email: getEmailFromLocalStorage(),
  role: getRoleFromLocalStorage(),
  id: getIdFromLocalStorage(),
  token: getTokenFromLocalStorage(),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(
      state,
      action: PayloadAction<{
        username: string;
        email: string | null;
        role: string;
        id: string;
        token: string;
      }>
    ) {
      const { username, email, role, id, token } = action.payload;
      state.username = username;
      state.email = email;
      state.role = role;
      state.id = id;
      state.token = token;
      localStorage.setItem("user", JSON.stringify(username));
      localStorage.setItem("role", JSON.stringify(role));
      localStorage.setItem("email", JSON.stringify(email));
      localStorage.setItem("id", JSON.stringify(id));
      localStorage.setItem("token", JSON.stringify(token));
    },
    clearUser(state) {
      state.username = null;
      state.email = null;
      state.role = null;
      state.id = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("id");
      localStorage.removeItem("token");
    },
    logout(state) {
      state.username = null;
      state.email = null;
      state.role = null;
      state.id = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("id");
      localStorage.removeItem("token");
    },
  },
});

export const { setUser, clearUser, logout } = userSlice.actions;
export default userSlice.reducer;
