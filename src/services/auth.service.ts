import { api } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

/**
 * Get current user from API
 * Uses Bearer token from localStorage
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get("/api/auth/me");
  return response.data;
}

/**
 * Decode JWT ID token to get user info (email, sub)
 */
export function decodeIdToken(idToken: string): AuthUser {
  try {
    const payload = JSON.parse(atob(idToken.split(".")[1]));
    return {
      userId: payload.sub,
      email: payload.email,
    };
  } catch (error) {
    throw new Error("Failed to decode ID token");
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(idToken: string): boolean {
  try {
    const payload = JSON.parse(atob(idToken.split(".")[1]));
    const exp = payload.exp;
    if (!exp) return true;
    return Date.now() >= exp * 1000;
  } catch (error) {
    return true;
  }
}
