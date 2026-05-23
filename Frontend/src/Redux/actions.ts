import {
  AUTH_REQUEST,
  AUTH_SUCCESS,
  AUTH_FAILURE,
  AUTH_LOGOUT,
  AUTH_SET_FROM_STORAGE,
} from "./constants";

import { Dispatch } from "redux";
import { AuthAction, User } from "./types"; // <-- required
import axios from "axios";

const saveToken = (token: string | null) => {
  if (token) localStorage.setItem("auth_token", token);
  else localStorage.removeItem("auth_token");
};

const saveUserData = (user: any) => {
  if (user) localStorage.setItem("auth_user", JSON.stringify(user));
  else localStorage.removeItem("auth_user");
};

const loadUserData = (): User | null => {
  const userData = localStorage.getItem("auth_user");
  return userData ? JSON.parse(userData) : null;
};

export const setAuthFromStorage = () => (dispatch: Dispatch<AuthAction>) => {
  const token = localStorage.getItem("auth_token");
  const user = loadUserData();
  if (token) {
    dispatch({
      type: AUTH_SET_FROM_STORAGE,
      payload: { token, user }
    });
  }
};

export const registerUser =
  (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    // Patient fields
    gender?: string;
    birthDate?: string;
    hasMentalHealthHistory?: boolean;
    // Doctor fields
    specialty?: string;
    yearsOfExperience?: string;
    clinicLocation?: string;
    contactNumber?: string;
  }) =>
  async (dispatch: Dispatch<AuthAction>) => {
    dispatch({ type: AUTH_REQUEST });

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/register/", data, {
        headers: { "Content-Type": "application/json" },
      });

      const json = res.data;
      const token = json.token ?? null;
      const user = json.user ?? null;
      saveToken(token);
      saveUserData(user);

      dispatch({
        type: AUTH_SUCCESS,
        payload: { user, token },
      });
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response?.data?.message
          : err instanceof Error
          ? err.message
          : "Error";
      dispatch({ type: AUTH_FAILURE, payload: message });
    }
  };

export const loginUser =
  (data: { email: string; password: string }) =>
  async (dispatch: Dispatch<AuthAction>) => {
    dispatch({ type: AUTH_REQUEST });

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", data, {
        headers: { "Content-Type": "application/json" },
      });

      const json = res.data;
      const token = json.token ?? null;
      const user = json.user ?? null;
      saveToken(token);
      saveUserData(user);

      dispatch({
        type: AUTH_SUCCESS,
        payload: { user, token },
      });
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response?.data?.message
          : err instanceof Error
          ? err.message
          : "Error";
      dispatch({ type: AUTH_FAILURE, payload: message });
    }
  };

export const logout = () => (dispatch: Dispatch<AuthAction>) => {
  saveToken(null);
  saveUserData(null);
  dispatch({ type: AUTH_LOGOUT });
};
