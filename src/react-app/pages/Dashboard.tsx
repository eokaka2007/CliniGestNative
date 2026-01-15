import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { Building2, Plus, Stethoscope, AlertCircle } from "lucide-react";
import type { Clinic, Equipment } from "@/shared/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [equipmentCount, setEquipmentCount] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/clinics");
      const data = await response.json();
      setClinics(data);

      // Fetch equipment count for each clinic
      const counts: Record<number, number> = {};
      for (const clinic of data) {
        const equipResponse = await fetch(`/api/clinics/${clinic.id}/equipment`);
        const equipData: Equipment[] = await equipResponse.json();
        counts[clinic.id] = equipData.length;
      }
      setEquipmentCount(counts);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-[#0b5b70]">Carregando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Visão geral das suas clínicas e equipamentos</p>
          </div>
          <button
            onClick={() => navigate("/clinics")}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
            <span className="font-medium">Nova Clínica</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#0b5b70]/10 to-[#0d7087]/10">
                <Building2 className="w-6 h-6 text-[#0b5b70]" strokeWidth={2} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">{clinics.length}</p>
            <p className="text-gray-600 text-sm">Clínicas cadastradas</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#0b5b70]/10 to-[#0d7087]/10">
                <Stethoscope className="w-6 h-6 text-[#0b5b70]" strokeWidth={2} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">
              {Object.values(equipmentCount).reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-gray-600 text-sm">Equipamentos registrados</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                <AlertCircle className="w-6 h-6 text-amber-600" strokeWidth={2} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">0</p>
            <p className="text-gray-600 text-sm">Calibrações pendentes</p>
          </div>
        </div>

        {/* Clinics list */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Suas Clínicas</h2>
          
          {clinics.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0b5b70]/10 to-[#0d7087]/10">
                <Building2 className="w-8 h-8 text-[#0b5b70]" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma clínica cadastrada</h3>
              <p className="text-gray-600 mb-6">Comece criando sua primeira clínica</p>
              <button
                onClick={() => navigate("/clinics")}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" strokeWidth={2} />
                <span className="font-medium">Criar Clínica</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinics.map((clinic) => (
                <button
                  key={clinic.id}
                  onClick={() => navigate(`/clinics/${clinic.id}`)}
                  className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 text-left hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#0b5b70] to-[#0d7087] shadow-lg group-hover:shadow-xl transition-shadow">
                      <Building2 className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#0b5b70] transition-colors">
                    {clinic.name}
                  </h3>
                  
                  {clinic.city && clinic.state && (
                    <p className="text-sm text-gray-600 mb-4">
                      {clinic.city}, {clinic.state}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4 text-gray-400" strokeWidth={2} />
                      <span className="text-sm text-gray-600">
                        {equipmentCount[clinic.id] || 0} equipamentos
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
