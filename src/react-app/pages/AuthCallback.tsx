import { useEffect } from "react";
import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate("/dashboard");
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/");
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0b5b70] via-[#0d7087] to-white">
      <div className="text-center">
        <div className="animate-spin mb-4 inline-block">
          <Loader2 className="w-10 h-10 text-white" />
        </div>
        <p className="text-white text-lg">Autenticando...</p>
      </div>
    </div>
  );
}
