import { ReactNode } from "react";
import { useAuth } from "@getmocha/users-service/react";
import { useNavigate, useLocation } from "react-router";
import { Building2, LogOut, Home, FileText, CheckSquare, Trash2, Users, Heart } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Início" },
    { path: "/clinics", icon: Building2, label: "Clínicas" },
    { path: "/manuals", icon: FileText, label: "Manuais/POPs" },
    { path: "/routines", icon: CheckSquare, label: "Rotinas" },
    { path: "/waste", icon: Trash2, label: "Resíduos" },
    { path: "/health", icon: Heart, label: "Saúde" },
    { path: "/partners", icon: Users, label: "Parceiros" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b5b70]/5 via-[#0d7087]/5 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#0b5b70] to-[#0d7087] shadow-lg">
                <Building2 className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-[#0b5b70] to-[#0d7087] bg-clip-text text-transparent">
                CliniGest
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#0b5b70] text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.google_user_data.name || user?.email}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              {user?.google_user_data.picture && (
                <img
                  src={user.google_user_data.picture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                />
              )}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      <nav className="md:hidden bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-[#0b5b70]"
                    : "text-gray-500"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
