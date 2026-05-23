import {
  AUTH_REQUEST,
  AUTH_SUCCESS,
  AUTH_FAILURE,
  AUTH_LOGOUT,
  AUTH_SET_FROM_STORAGE,
} from "./constants";

export type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
} | null;

export type AuthAction =
  | { type: typeof AUTH_REQUEST }
  | { type: typeof AUTH_SUCCESS; payload: { token: string | null; user: User } }
  | { type: typeof AUTH_FAILURE; payload: string | null }
  | { type: typeof AUTH_LOGOUT }
  | { type: typeof AUTH_SET_FROM_STORAGE; payload: { token: string | null; user: User } };
