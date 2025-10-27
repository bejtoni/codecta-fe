import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, AuthUser, AuthTokens } from "@/types/auth";

interface AuthStore extends AuthState {
  setUser: (user: AuthUser) => void;
  setTokens: (tokens: AuthTokens) => void;
  login: (user: AuthUser, tokens: AuthTokens) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
      login: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        }),
      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
