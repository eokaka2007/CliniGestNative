import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { ArrowLeft, Edit2, Trash2, Calendar, Save, X } from "lucide-react";
import type { Equipment, UpdateEquipment } from "@/shared/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EquipmentPage() {
  const { clinicId, equipmentId } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateEquipment>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (equipmentId) {
      fetchEquipment();
    }
  }, [equipmentId]);

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`/api/equipment/${equipmentId}`);
      const data = await response.json();
      setEquipment(data);
      setFormData({
        name: data.name,
        category: data.category || "",
        manufacturer: data.manufacturer || "",
        model: data.model || "",
        serial_number: data.serial_number || "",
        purchase_date: data.purchase_date || "",
        calibration_date: data.calibration_date || "",
        calibration_due_date: data.calibration_due_date || "",
        responsible_technician: data.responsible_technician || "",
        notes: data.notes || "",
      });
    } catch (error) {
      console.error("Error fetching equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/equipment/${equipmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedEquipment = await response.json();
        setEquipment(updatedEquipment);
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating equipment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este equipamento?")) {
      return;
    }

    try {
      const response = await fetch(`/api/equipment/${equipmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        navigate(`/clinics/${clinicId}`);
      }
    } catch (error) {
      console.error("Error deleting equipment:", error);
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

  if (!equipment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Equipamento não encontrado</p>
        </div>
      </Layout>
    );
  }

  const isCalibrationDue = () => {
    if (!equipment.calibration_due_date) return false;
    const due = new Date(equipment.calibration_due_date);
    const today = new Date();
    const daysUntilDue = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 30 && daysUntilDue >= 0;
  };

  const isCalibrationOverdue = () => {
    if (!equipment.calibration_due_date) return false;
    const due = new Date(equipment.calibration_due_date);
    const today = new Date();
    return due < today;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/clinics/${clinicId}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            <span className="font-medium">Voltar</span>
          </button>

          <div className="flex items-center space-x-3">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: equipment.name,
                      category: equipment.category || "",
                      manufacturer: equipment.manufacturer || "",
                      model: equipment.model || "",
                      serial_number: equipment.serial_number || "",
                      purchase_date: equipment.purchase_date || "",
                      calibration_date: equipment.calibration_date || "",
                      calibration_due_date: equipment.calibration_due_date || "",
                      responsible_technician: equipment.responsible_technician || "",
                      notes: equipment.notes || "",
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                  <span className="font-medium">Cancelar</span>
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={submitting}
                  className="flex items-center space-x-2 bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" strokeWidth={2} />
                  <span className="font-medium">{submitting ? "Salvando..." : "Salvar"}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" strokeWidth={2} />
                  <span className="font-medium">Editar</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                  <span className="font-medium">Excluir</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Equipment details */}
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Equipamento
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <input
                    type="text"
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fabricante</label>
                  <input
                    type="text"
                    value={formData.manufacturer || ""}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                  <input
                    type="text"
                    value={formData.model || ""}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Série
                  </label>
                  <input
                    type="text"
                    value={formData.serial_number || ""}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Compra
                </label>
                <input
                  type="date"
                  value={formData.purchase_date || ""}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Última Calibração
                  </label>
                  <input
                    type="date"
                    value={formData.calibration_date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, calibration_date: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Próxima Calibração
                  </label>
                  <input
                    type="date"
                    value={formData.calibration_due_date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, calibration_due_date: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Técnico Responsável
                </label>
                <input
                  type="text"
                  value={formData.responsible_technician || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, responsible_technician: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all resize-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-6">{equipment.name}</h1>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {equipment.category && (
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium">
                    {equipment.category}
                  </span>
                )}
                {isCalibrationOverdue() && (
                  <span className="px-4 py-2 bg-red-100 text-red-700 text-sm rounded-lg font-medium flex items-center space-x-2">
                    <Calendar className="w-4 h-4" strokeWidth={2} />
                    <span>Calibração Vencida</span>
                  </span>
                )}
                {isCalibrationDue() && !isCalibrationOverdue() && (
                  <span className="px-4 py-2 bg-amber-100 text-amber-700 text-sm rounded-lg font-medium flex items-center space-x-2">
                    <Calendar className="w-4 h-4" strokeWidth={2} />
                    <span>Calibração Próxima</span>
                  </span>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {equipment.manufacturer && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Fabricante</p>
                    <p className="text-gray-900 font-medium">{equipment.manufacturer}</p>
                  </div>
                )}

                {equipment.model && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Modelo</p>
                    <p className="text-gray-900 font-medium">{equipment.model}</p>
                  </div>
                )}

                {equipment.serial_number && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Número de Série</p>
                    <p className="text-gray-900 font-medium">{equipment.serial_number}</p>
                  </div>
                )}

                {equipment.purchase_date && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Data de Compra</p>
                    <p className="text-gray-900 font-medium">
                      {format(new Date(equipment.purchase_date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                )}

                {equipment.calibration_date && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Última Calibração</p>
                    <p className="text-gray-900 font-medium">
                      {format(new Date(equipment.calibration_date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                )}

                {equipment.calibration_due_date && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Próxima Calibração</p>
                    <p
                      className={`font-medium ${
                        isCalibrationOverdue()
                          ? "text-red-600"
                          : isCalibrationDue()
                          ? "text-amber-600"
                          : "text-gray-900"
                      }`}
                    >
                      {format(new Date(equipment.calibration_due_date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                )}

                {equipment.responsible_technician && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Técnico Responsável</p>
                    <p className="text-gray-900 font-medium">{equipment.responsible_technician}</p>
                  </div>
                )}
              </div>

              {equipment.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Observações</p>
                  <p className="text-gray-900">{equipment.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
