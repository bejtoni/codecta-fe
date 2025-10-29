import { useEffect } from "react";
import { isTokenExpired, getCurrentUser } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading, isAuthenticated, login, logout, setLoading } =
    useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      try {
        // Get ID token from localStorage
        const idToken = localStorage.getItem("idToken");

        if (!idToken) {
          throw new Error("No token found");
        }

        // Check if token is expired
        if (isTokenExpired(idToken)) {
          localStorage.removeItem("idToken");
          throw new Error("Token expired");
        }

        // Try to get current user from API (this validates the token)
        const currentUser = await getCurrentUser();

        // Update auth store
        login(currentUser, {
          accessToken: idToken,
          idToken: idToken,
          expiresAt: Date.now() + 3600000, // 1 hour
        });
      } catch (error:unknown) {
        // Token is invalid or expired
        console.error("Auth error:", error);
        localStorage.removeItem("idToken");
        logout();
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setLoading, login, logout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
