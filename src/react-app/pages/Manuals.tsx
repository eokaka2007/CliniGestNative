import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { Plus, FileText, X } from "lucide-react";
import type { Manual, CreateManual, Clinic } from "@/shared/types";

export default function ManualsPage() {
  const navigate = useNavigate();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateManual & { clinicId: string }>({
    title: "",
    type: "",
    content: "",
    version: "1.0",
    status: "draft",
    clinicId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const clinicsRes = await fetch("/api/clinics");
      const clinicsData = await clinicsRes.json();
      setClinics(clinicsData);

      // Fetch manuals for all clinics
      const allManuals: Manual[] = [];
      for (const clinic of clinicsData) {
        const res = await fetch(`/api/clinics/${clinic.id}/manuals`);
        const data = await res.json();
        allManuals.push(...data);
      }
      setManuals(allManuals);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clinicId) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/clinics/${formData.clinicId}/manuals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          content: formData.content,
          version: formData.version,
          status: formData.status,
        }),
      });

      if (response.ok) {
        const newManual = await response.json();
        setManuals([newManual, ...manuals]);
        setShowModal(false);
        setFormData({ title: "", type: "", content: "", version: "1.0", status: "draft", clinicId: "" });
      }
    } catch (error) {
      console.error("Error creating manual:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const manualTypes = [
    { value: "manual_acesso", label: "Manual de Acesso" },
    { value: "pop_limpeza", label: "POP - Limpeza e Desinfecção" },
    { value: "pop_esterilizacao", label: "POP - Esterilização" },
    { value: "pop_residuos", label: "POP - Resíduos" },
    { value: "pop_autoclave", label: "POP - Autoclave" },
    { value: "outros", label: "Outros" },
  ];

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Manuais e POPs</h1>
            <p className="text-gray-600">Gerencie documentação e procedimentos operacionais</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
            <span className="font-medium">Novo Documento</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {manuals.map((manual) => {
            const clinic = clinics.find((c) => c.id === manual.clinic_id);
            return (
              <button
                key={manual.id}
                onClick={() => navigate(`/manuals/${manual.id}`)}
                className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 text-left hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#0b5b70] to-[#0d7087] shadow-lg">
                    <FileText className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-lg ${
                      manual.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {manual.status === "published" ? "Publicado" : "Rascunho"}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#0b5b70] transition-colors">
                  {manual.title}
                </h3>

                <p className="text-sm text-gray-600 mb-2">{manual.type}</p>
                {clinic && (
                  <p className="text-xs text-gray-500">{clinic.name}</p>
                )}
                {manual.version && (
                  <p className="text-xs text-gray-400 mt-2">Versão {manual.version}</p>
                )}
              </button>
            );
          })}
        </div>

        {manuals.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0b5b70]/10 to-[#0d7087]/10">
              <FileText className="w-8 h-8 text-[#0b5b70]" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento cadastrado</h3>
            <p className="text-gray-600 mb-6">Comece criando seu primeiro manual ou POP</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200/50 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-xl font-semibold text-gray-900">Novo Documento</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clínica *</label>
                <select
                  required
                  value={formData.clinicId}
                  onChange={(e) => setFormData({ ...formData, clinicId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                >
                  <option value="">Selecione uma clínica</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                >
                  <option value="">Selecione o tipo</option>
                  {manualTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  placeholder="Nome do documento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all resize-none"
                  placeholder="Descreva os procedimentos, instruções e requisitos..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Versão</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                    placeholder="1.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
                </div>
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
                  {submitting ? "Criando..." : "Criar Documento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
