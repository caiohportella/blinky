import { store } from "@simplestack/store";
import { User, authApi } from "./api";

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

// Create the main auth store
export const authStore = store<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
});

// Export granular selectors for specific properties
export const userStore = authStore.select("user");
export const tokenStore = authStore.select("token");
export const isAuthenticatedStore = authStore.select("isAuthenticated");
export const isLoadingStore = authStore.select("isLoading");
export const errorStore = authStore.select("error");

// Auth action functions
export const signin = async (email: string, password: string) => {
  isLoadingStore.set(true);
  errorStore.set(null);

  try {
    const { user, token, error } = await authApi.signin(email, password);

    if (error || !user || !token) {
      errorStore.set(error || "Login failed");
      throw new Error(error || "Login failed");
    }

    // Update store with user data
    userStore.set(user);
    tokenStore.set(token);
    isAuthenticatedStore.set(true);

    // Persist token
    localStorage.setItem("auth_token", token);

    return user;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    errorStore.set(message);
    throw error;
  } finally {
    isLoadingStore.set(false);
  }
};

export const signup = async (email: string, password: string, name: string) => {
  isLoadingStore.set(true);
  errorStore.set(null);

  try {
    const { user, token, error } = await authApi.signup(email, password, name);

    if (error) {
      errorStore.set(error);
      throw new Error(error);
    }

    // Update store with user data
    userStore.set(user);
    tokenStore.set(token);
    isAuthenticatedStore.set(true);

    // Persist token
    localStorage.setItem("auth_token", token ?? "");

    return {
      user,
      token,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed";
    errorStore.set(message);
    throw error;
  } finally {
    isLoadingStore.set(false);
  }
};

export const signout = async () => {
  isLoadingStore.set(true);

  try {
    const token = tokenStore.get();
    if (token) {
      await authApi.signout();
    }
  } catch {
    // Silently handle signout errors
  } finally {
    // Clear auth state
    authStore.set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    // Clear persisted token
    localStorage.removeItem("auth_token");
  }
};

export const checkAuth = async () => {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    isLoadingStore.set(false);
    return;
  }

  isLoadingStore.set(true);

  try {
    const user = await authApi.getCurrentUser(token);

    // Restore user session
    userStore.set(user);
    tokenStore.set(token);
    isAuthenticatedStore.set(true);
  } catch (error) {
    // Clear invalid token
    localStorage.removeItem("auth_token");
    errorStore.set("Session expired. Please login again.");
  } finally {
    isLoadingStore.set(false);
  }
};
