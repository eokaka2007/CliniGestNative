import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import { Plus, Trash2, X, Save, FileText } from "lucide-react";
import type { WasteManagementPlan, Clinic } from "@/shared/types";

interface WasteRoom {
  name: string;
  groupA: boolean;
  groupB: boolean;
  groupC: boolean;
  groupD: boolean;
  groupE: boolean;
  container: string;
  frequency: string;
}

export default function WastePage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>("");
  const [plan, setPlan] = useState<WasteManagementPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<WasteRoom[]>([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState<WasteRoom>({
    name: "",
    groupA: false,
    groupB: false,
    groupC: false,
    groupD: false,
    groupE: false,
    container: "",
    frequency: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      fetchPlan();
    }
  }, [selectedClinic]);

  const fetchClinics = async () => {
    try {
      const response = await fetch("/api/clinics");
      const data = await response.json();
      setClinics(data);
      if (data.length > 0) {
        setSelectedClinic(data[0].id.toString());
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/clinics/${selectedClinic}/waste-plan`);
      const data = await response.json();
      if (data) {
        setPlan(data);
        setRooms(JSON.parse(data.plan_data));
      } else {
        setPlan(null);
        setRooms([]);
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
    }
  };

  const handleAddRoom = () => {
    setRooms([...rooms, newRoom]);
    setNewRoom({
      name: "",
      groupA: false,
      groupB: false,
      groupC: false,
      groupD: false,
      groupE: false,
      container: "",
      frequency: "",
    });
    setShowRoomModal(false);
  };

  const handleRemoveRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedClinic) return;

    setSubmitting(true);
    try {
      const url = plan
        ? `/api/waste-plan/${plan.id}`
        : `/api/clinics/${selectedClinic}/waste-plan`;
      
      const method = plan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_data: JSON.stringify(rooms),
          status: "draft",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlan(data);
      }
    } catch (error) {
      console.error("Error saving plan:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const wasteGroups = [
    { key: "groupA" as keyof WasteRoom, label: "Grupo A - Biológico", color: "bg-red-100 text-red-700" },
    { key: "groupB" as keyof WasteRoom, label: "Grupo B - Químico", color: "bg-orange-100 text-orange-700" },
    { key: "groupC" as keyof WasteRoom, label: "Grupo C - Radioativo", color: "bg-yellow-100 text-yellow-700" },
    { key: "groupD" as keyof WasteRoom, label: "Grupo D - Comum", color: "bg-blue-100 text-blue-700" },
    { key: "groupE" as keyof WasteRoom, label: "Grupo E - Perfurocortante", color: "bg-purple-100 text-purple-700" },
  ];

  const containers = [
    "Saco branco leitoso",
    "Saco vermelho",
    "Caixa de perfurocortante",
    "Saco preto comum",
    "Container específico",
  ];

  const frequencies = [
    "Diária",
    "2x por dia",
    "Semanal",
    "Conforme necessário",
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
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Plano de Gerenciamento de Resíduos
            </h1>
            <p className="text-gray-600">
              Configure o PGR conforme RDC/ANVISA e MDC 222
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
            >
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <Save className="w-5 h-5" strokeWidth={2} />
              <span className="font-medium">{submitting ? "Salvando..." : "Salvar Plano"}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Ambientes e Resíduos</h2>
            <button
              onClick={() => setShowRoomModal(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span className="font-medium">Adicionar Ambiente</span>
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0b5b70]/10 to-[#0d7087]/10">
                <Trash2 className="w-8 h-8 text-[#0b5b70]" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum ambiente cadastrado
              </h3>
              <p className="text-gray-600 mb-6">
                Adicione os ambientes da clínica e os grupos de resíduos gerados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 hover:border-[#0b5b70]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                    <button
                      onClick={() => handleRemoveRoom(index)}
                      className="p-1 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {wasteGroups.map((group) => {
                      if (room[group.key]) {
                        return (
                          <span
                            key={group.key}
                            className={`px-3 py-1 text-xs font-medium rounded-lg ${group.color}`}
                          >
                            {group.label}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Recipiente: </span>
                      <span className="text-gray-900 font-medium">{room.container}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Frequência: </span>
                      <span className="text-gray-900 font-medium">{room.frequency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200/50 shadow-sm p-6">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" strokeWidth={2} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Informações sobre os Grupos</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <strong>Grupo A:</strong> Resíduos com possível presença de agentes biológicos
                </li>
                <li>
                  <strong>Grupo B:</strong> Resíduos químicos (medicamentos, produtos químicos)
                </li>
                <li>
                  <strong>Grupo C:</strong> Resíduos radioativos
                </li>
                <li>
                  <strong>Grupo D:</strong> Resíduos comuns (papel, plástico não contaminado)
                </li>
                <li>
                  <strong>Grupo E:</strong> Materiais perfurocortantes (agulhas, lâminas)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200/50 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-xl font-semibold text-gray-900">Adicionar Ambiente</h2>
              <button
                onClick={() => setShowRoomModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Ambiente *
                </label>
                <input
                  type="text"
                  required
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  placeholder="Ex: Sala de atendimento 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Grupos de Resíduos Gerados *
                </label>
                <div className="space-y-2">
                  {wasteGroups.map((group) => (
                    <label key={group.key} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRoom[group.key] as boolean}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, [group.key]: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-[#0b5b70] focus:ring-[#0b5b70]"
                      />
                      <span className="text-sm text-gray-700">{group.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Recipiente *
                </label>
                <select
                  required
                  value={newRoom.container}
                  onChange={(e) => setNewRoom({ ...newRoom, container: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                >
                  <option value="">Selecione o recipiente</option>
                  {containers.map((container) => (
                    <option key={container} value={container}>
                      {container}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequência de Coleta *
                </label>
                <select
                  required
                  value={newRoom.frequency}
                  onChange={(e) => setNewRoom({ ...newRoom, frequency: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                >
                  <option value="">Selecione a frequência</option>
                  {frequencies.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowRoomModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddRoom}
                  disabled={
                    !newRoom.name ||
                    !newRoom.container ||
                    !newRoom.frequency ||
                    !(newRoom.groupA || newRoom.groupB || newRoom.groupC || newRoom.groupD || newRoom.groupE)
                  }
                  className="flex-1 bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
