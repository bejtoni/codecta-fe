import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  useEffect(() => {
    window.google?.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      // Jako bitno ne diraj bez ovog callbacka ne radi redirect nikako
      callback: async (resp: any) => {
        const idToken = resp.credential; // Google ID token (JWT)

        try {
          await fetch(
              `${
                  import.meta.env.VITE_BE_BASE || "http://localhost:5000"
              }/auth/google`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${idToken}`,
                },
              }
          );

          // Save token for API calls
          localStorage.setItem("idToken", idToken);

          // Redirect to app
          window.location.href = "/";
        } catch (error) {
          alert("Login Failed. Please try again.");
        }
      },
    });

    window.google?.accounts.id.renderButton(
        document.getElementById("google-btn") as HTMLElement,
        { theme: "outline", size: "large", text: "signin_with" }
    );
  }, []);

  return (
      <div className="container mx-auto max-w-6xl p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Welcome to ImageCropper
            </CardTitle>
            <p className="text-gray-600">Please sign in to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div id="google-btn" />
            </div>
            <p className="text-xs text-gray-500 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
  );
}
