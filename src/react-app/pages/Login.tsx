import { useEffect } from "react";
import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { Building2, Shield, FileText, Calendar } from "lucide-react";

export default function Login() {
  const { user, redirectToLogin, isPending } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    await redirectToLogin();
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b5b70] via-[#0d7087] to-white" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b5b70] via-[#0d7087] to-white relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <Building2 className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-semibold text-white mb-2 tracking-tight">CliniGest</h1>
          <p className="text-white/80 text-lg">Gestão sanitária simplificada</p>
        </div>

        {/* Main card */}
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2 text-center">
              Bem-vindo
            </h2>
            <p className="text-white/70 text-center mb-8">
              Acesse sua plataforma de gestão sanitária
            </p>

            <button
              onClick={handleLogin}
              className="w-full bg-white hover:bg-white/90 text-[#0b5b70] font-medium py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Entrar com Google
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-3 rounded-xl bg-white/10">
                <Shield className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-white font-medium text-sm mb-1">Conformidade</h3>
              <p className="text-white/60 text-xs">100% adequado à vigilância</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-3 rounded-xl bg-white/10">
                <FileText className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-white font-medium text-sm mb-1">Documentação</h3>
              <p className="text-white/60 text-xs">POPs e manuais</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-3 rounded-xl bg-white/10">
                <Calendar className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-white font-medium text-sm mb-1">Rotinas</h3>
              <p className="text-white/60 text-xs">Agenda automatizada</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-3 rounded-xl bg-white/10">
                <Building2 className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-white font-medium text-sm mb-1">Multi-clínica</h3>
              <p className="text-white/60 text-xs">Gerencie todas suas unidades</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/50 text-sm mt-8">
          © 2025 CliniGest. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
