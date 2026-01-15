import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { Plus, Building2, X } from "lucide-react";
import type { Clinic, CreateClinic } from "@/shared/types";

export default function Clinics() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateClinic>({
    name: "",
    cnpj: "",
    address: "",
    city: "",
    state: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await fetch("/api/clinics");
      const data = await response.json();
      setClinics(data);
    } catch (error) {
      console.error("Error fetching clinics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newClinic = await response.json();
        setClinics([newClinic, ...clinics]);
        setShowModal(false);
        setFormData({ name: "", cnpj: "", address: "", city: "", state: "", phone: "" });
      }
    } catch (error) {
      console.error("Error creating clinic:", error);
    } finally {
      setSubmitting(false);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Clínicas</h1>
            <p className="text-gray-600">Gerencie suas unidades</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
            <span className="font-medium">Nova Clínica</span>
          </button>
        </div>

        {/* Clinics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <button
              key={clinic.id}
              onClick={() => navigate(`/clinics/${clinic.id}`)}
              className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 text-left hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-[#0b5b70] to-[#0d7087] shadow-lg">
                <Building2 className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#0b5b70] transition-colors">
                {clinic.name}
              </h3>
              
              {clinic.city && clinic.state && (
                <p className="text-sm text-gray-600">
                  {clinic.city}, {clinic.state}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Create clinic modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200/50 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-xl font-semibold text-gray-900">Nova Clínica</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Clínica *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  placeholder="Digite o nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {submitting ? "Criando..." : "Criar Clínica"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
