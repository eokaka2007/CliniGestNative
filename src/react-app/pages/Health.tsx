import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import { Plus, Heart, X, AlertCircle, ExternalLink } from "lucide-react";
import type { HealthDocument, CreateHealthDocument, Clinic, Partner } from "@/shared/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HealthPage() {
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateHealthDocument & { clinicId: string }>({
    document_type: "",
    document_url: "",
    expiry_date: "",
    partner_id: undefined,
    notes: "",
    clinicId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clinicsRes, partnersRes] = await Promise.all([
        fetch("/api/clinics"),
        fetch("/api/partners?category=medicina_ocupacional"),
      ]);

      const clinicsData = await clinicsRes.json();
      const partnersData = await partnersRes.json();

      setClinics(clinicsData);
      setPartners(partnersData);

      const allDocs: HealthDocument[] = [];
      for (const clinic of clinicsData) {
        const res = await fetch(`/api/clinics/${clinic.id}/health-documents`);
        const data = await res.json();
        allDocs.push(...data);
      }
      setDocuments(allDocs);
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
      const response = await fetch(`/api/clinics/${formData.clinicId}/health-documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_type: formData.document_type,
          document_url: formData.document_url,
          expiry_date: formData.expiry_date,
          partner_id: formData.partner_id,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocuments([newDoc, ...documents]);
        setShowModal(false);
        setFormData({
          document_type: "",
          document_url: "",
          expiry_date: "",
          partner_id: undefined,
          notes: "",
          clinicId: "",
        });
      }
    } catch (error) {
      console.error("Error creating document:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const documentTypes = [
    { value: "pcmso", label: "PCMSO - Programa de Controle Médico de Saúde Ocupacional" },
    { value: "pgr", label: "PGR - Programa de Gerenciamento de Riscos" },
    { value: "ppra", label: "PPRA - Programa de Prevenção de Riscos Ambientais" },
    { value: "ltcat", label: "LTCAT - Laudo Técnico das Condições Ambientais do Trabalho" },
    { value: "aso", label: "ASO - Atestado de Saúde Ocupacional" },
    { value: "outros", label: "Outros Documentos" },
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
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Saúde do Trabalhador</h1>
            <p className="text-gray-600">Gerencie documentos de medicina ocupacional</p>
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
          {documents.map((doc) => {
            const clinic = clinics.find((c) => c.id === doc.clinic_id);
            const partner = partners.find((p) => p.id === doc.partner_id);
            const expired = isExpired(doc.expiry_date);
            const expiring = isExpiringSoon(doc.expiry_date);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#0b5b70] to-[#0d7087] shadow-lg">
                    <Heart className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  {(expired || expiring) && (
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center space-x-1 ${
                        expired
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <AlertCircle className="w-3 h-3" strokeWidth={2} />
                      <span>{expired ? "Vencido" : "Vence em breve"}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.document_type}</h3>

                {clinic && <p className="text-sm text-gray-600 mb-3">{clinic.name}</p>}

                {doc.expiry_date && (
                  <p className="text-sm text-gray-600 mb-3">
                    Validade: {format(new Date(doc.expiry_date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}

                {partner && (
                  <p className="text-xs text-gray-500 mb-3">Parceiro: {partner.name}</p>
                )}

                {doc.document_url && (
                  <a
                    href={doc.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-[#0b5b70] hover:text-[#0d7087] transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" strokeWidth={2} />
                    <span>Ver documento</span>
                  </a>
                )}

                {doc.notes && (
                  <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                    {doc.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {documents.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0b5b70]/10 to-[#0d7087]/10">
              <Heart className="w-8 h-8 text-[#0b5b70]" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece adicionando documentos de saúde ocupacional
            </p>
          </div>
        )}

        <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200/50 shadow-sm p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" strokeWidth={2} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Documentos Obrigatórios</h3>
              <p className="text-sm text-gray-700 mb-3">
                Para clínicas com funcionários CLT, é obrigatório:
              </p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• PCMSO - Controle médico anual dos funcionários</li>
                <li>• PGR - Identificação e controle de riscos ocupacionais</li>
                <li>• ASO - Atestados de saúde para admissão, periódico e demissão</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento *
                </label>
                <select
                  required
                  value={formData.document_type}
                  onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                >
                  <option value="">Selecione o tipo</option>
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do Documento
                </label>
                <input
                  type="url"
                  value={formData.document_url}
                  onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Validade
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parceiro (Opcional)
                </label>
                <select
                  value={formData.partner_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      partner_id: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                >
                  <option value="">Nenhum parceiro selecionado</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all resize-none"
                  placeholder="Informações adicionais"
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
                  {submitting ? "Criando..." : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
