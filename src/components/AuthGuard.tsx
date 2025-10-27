import { useEffect, useState } from "react";
import { isTokenExpired, getCurrentUser } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

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
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem("idToken");
        setIsAuthenticated(false);
        window.location.href = "/login";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

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
