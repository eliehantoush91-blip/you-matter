import {
  AUTH_REQUEST,
  AUTH_SUCCESS,
  AUTH_FAILURE,
  AUTH_LOGOUT,
  AUTH_SET_FROM_STORAGE,
} from "./constants";

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
} | null;

type State = {
  loading: boolean;
  token: string | null;
  user: User;
  error: string | null;
  isAuthenticated: boolean;
};

const loadUserData = () => {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem("auth_user");
  return userData ? JSON.parse(userData) : null;
};

const initialState: State = {
  loading: false,
  token: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
  user: typeof window !== "undefined" ? loadUserData() : null,
  error: null,
  isAuthenticated: !!(typeof window !== "undefined" && localStorage.getItem("auth_token")),
};

type AuthAction =
  | { type: typeof AUTH_REQUEST }
  | { type: typeof AUTH_SUCCESS; payload: { token: string | null; user: User } }
  | { type: typeof AUTH_FAILURE; payload: string | null }
  | { type: typeof AUTH_LOGOUT }
  | { type: typeof AUTH_SET_FROM_STORAGE; payload: { token: string | null; user: User } };

export default function authReducer(
  state: State = initialState,
  action: AuthAction
): State {
  switch (action.type) {
    case AUTH_REQUEST:
      return { ...state, loading: true, error: null };

    case AUTH_SUCCESS:
      return {
        ...state,
        loading: false,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: !!action.payload.token,
        error: null,
      };

    case AUTH_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case AUTH_LOGOUT:
      return { ...initialState, token: null, user: null, isAuthenticated: false };

    case AUTH_SET_FROM_STORAGE:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: !!action.payload.token
      };

    default:
      return state;
  }
}
