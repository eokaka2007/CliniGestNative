import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import { Users, ExternalLink, Phone, Mail, MapPin, Tag } from "lucide-react";
import type { Partner } from "@/shared/types";

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchPartners();
  }, [selectedCategory]);

  const fetchPartners = async () => {
    try {
      const url =
        selectedCategory === "all"
          ? "/api/partners"
          : `/api/partners?category=${selectedCategory}`;
      const response = await fetch(url);
      const data = await response.json();
      setPartners(data);
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "all", label: "Todos os Parceiros" },
    { value: "arquitetura_vigilancia", label: "Arquitetura e Vigilância" },
    { value: "medicina_ocupacional", label: "Medicina do Trabalho" },
    { value: "contabilidade", label: "Contabilidade" },
    { value: "coleta_residuos", label: "Coleta de Resíduos" },
    { value: "equipamentos", label: "Equipamentos e Manutenção" },
    { value: "outros", label: "Outros Serviços" },
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Parceiros</h1>
            <p className="text-gray-600">
              Encontre profissionais e empresas parceiras para sua clínica
            </p>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#0b5b70] to-[#0d7087] shadow-lg">
                  <Users className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                {partner.discount_code && (
                  <span className="px-3 py-1 text-xs font-medium rounded-lg bg-green-100 text-green-700 flex items-center space-x-1">
                    <Tag className="w-3 h-3" strokeWidth={2} />
                    <span>Desconto</span>
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{partner.name}</h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {partner.description || "Parceiro verificado"}
              </p>

              <div className="space-y-2 mb-4">
                {partner.city && partner.state && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" strokeWidth={2} />
                    <span>
                      {partner.city}, {partner.state}
                    </span>
                  </div>
                )}

                {partner.contact_phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" strokeWidth={2} />
                    <span>{partner.contact_phone}</span>
                  </div>
                )}

                {partner.contact_email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" strokeWidth={2} />
                    <span className="truncate">{partner.contact_email}</span>
                  </div>
                )}
              </div>

              {partner.discount_code && (
                <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs text-green-700 mb-1">Código de desconto:</p>
                  <p className="text-sm font-bold text-green-800">{partner.discount_code}</p>
                </div>
              )}

              {partner.website && (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={2} />
                  <span>Visitar site</span>
                </a>
              )}

              {!partner.website && partner.contact_phone && (
                <a
                  href={`tel:${partner.contact_phone}`}
                  className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Phone className="w-4 h-4" strokeWidth={2} />
                  <span>Entrar em contato</span>
                </a>
              )}
            </div>
          ))}
        </div>

        {partners.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0b5b70]/10 to-[#0d7087]/10">
              <Users className="w-8 h-8 text-[#0b5b70]" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum parceiro encontrado</h3>
            <p className="text-gray-600">Tente selecionar outra categoria</p>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200/50 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Seja um Parceiro</h3>
          <p className="text-sm text-gray-700 mb-4">
            Você é um profissional ou empresa que oferece serviços para clínicas? Entre em contato
            para se tornar um parceiro verificado e alcançar mais clientes.
          </p>
          <p className="text-sm text-gray-600">
            Benefícios: Visibilidade na plataforma, sistema de cupons de desconto, e comissionamento
            por indicações.
          </p>
        </div>
      </div>
    </Layout>
  );
}
