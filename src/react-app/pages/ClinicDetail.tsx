import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { Plus, Stethoscope, Calendar, AlertCircle, Edit2, X } from "lucide-react";
import type { Clinic, Equipment, CreateEquipment } from "@/shared/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ClinicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateEquipment>({
    name: "",
    category: "",
    manufacturer: "",
    model: "",
    serial_number: "",
    purchase_date: "",
    calibration_date: "",
    calibration_due_date: "",
    responsible_technician: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClinicData();
    }
  }, [id]);

  const fetchClinicData = async () => {
    try {
      const [clinicRes, equipRes] = await Promise.all([
        fetch(`/api/clinics/${id}`),
        fetch(`/api/clinics/${id}/equipment`),
      ]);

      const clinicData = await clinicRes.json();
      const equipData = await equipRes.json();

      setClinic(clinicData);
      setEquipment(equipData);
    } catch (error) {
      console.error("Error fetching clinic data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/clinics/${id}/equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newEquipment = await response.json();
        setEquipment([newEquipment, ...equipment]);
        setShowModal(false);
        setFormData({
          name: "",
          category: "",
          manufacturer: "",
          model: "",
          serial_number: "",
          purchase_date: "",
          calibration_date: "",
          calibration_due_date: "",
          responsible_technician: "",
          notes: "",
        });
      }
    } catch (error) {
      console.error("Error creating equipment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const isCalibrationDue = (dueDate: string | null) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    const daysUntilDue = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 30 && daysUntilDue >= 0;
  };

  const isCalibrationOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
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

  if (!clinic) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Clínica não encontrada</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Clinic header */}
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">{clinic.name}</h1>
              <div className="space-y-1 text-gray-600">
                {clinic.cnpj && <p>CNPJ: {clinic.cnpj}</p>}
                {clinic.address && <p>{clinic.address}</p>}
                {clinic.city && clinic.state && (
                  <p>
                    {clinic.city}, {clinic.state}
                  </p>
                )}
                {clinic.phone && <p>Tel: {clinic.phone}</p>}
              </div>
            </div>
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Edit2 className="w-5 h-5 text-gray-600" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-[#0b5b70]/10 to-[#0d7087]/10">
              <Stethoscope className="w-6 h-6 text-[#0b5b70]" strokeWidth={2} />
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">{equipment.length}</p>
            <p className="text-gray-600 text-sm">Equipamentos</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10">
              <Calendar className="w-6 h-6 text-amber-600" strokeWidth={2} />
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">
              {equipment.filter((e) => isCalibrationDue(e.calibration_due_date)).length}
            </p>
            <p className="text-gray-600 text-sm">Calibrações próximas</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-red-500/10 to-rose-500/10">
              <AlertCircle className="w-6 h-6 text-red-600" strokeWidth={2} />
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">
              {equipment.filter((e) => isCalibrationOverdue(e.calibration_due_date)).length}
            </p>
            <p className="text-gray-600 text-sm">Calibrações vencidas</p>
          </div>
        </div>

        {/* Equipment section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Equipamentos</h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" strokeWidth={2} />
              <span className="font-medium">Adicionar Equipamento</span>
            </button>
          </div>

          {equipment.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0b5b70]/10 to-[#0d7087]/10">
                <Stethoscope className="w-8 h-8 text-[#0b5b70]" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum equipamento cadastrado</h3>
              <p className="text-gray-600 mb-6">Adicione equipamentos para começar o gerenciamento</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" strokeWidth={2} />
                <span className="font-medium">Adicionar Equipamento</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {equipment.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/clinics/${id}/equipment/${item.id}`)}
                  className="w-full bg-white rounded-xl border border-gray-200/50 shadow-sm p-6 text-left hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#0b5b70] to-[#0d7087] shadow-lg flex-shrink-0">
                          <Stethoscope className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#0b5b70] transition-colors">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.category && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                                {item.category}
                              </span>
                            )}
                            {item.manufacturer && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                                {item.manufacturer}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {item.model && (
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Modelo</p>
                                <p className="text-gray-900 font-medium">{item.model}</p>
                              </div>
                            )}
                            {item.serial_number && (
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Número de Série</p>
                                <p className="text-gray-900 font-medium">{item.serial_number}</p>
                              </div>
                            )}
                            {item.calibration_due_date && (
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Próxima Calibração</p>
                                <p
                                  className={`font-medium ${
                                    isCalibrationOverdue(item.calibration_due_date)
                                      ? "text-red-600"
                                      : isCalibrationDue(item.calibration_due_date)
                                      ? "text-amber-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {format(new Date(item.calibration_due_date), "dd/MM/yyyy", {
                                    locale: ptBR,
                                  })}
                                </p>
                              </div>
                            )}
                            {item.responsible_technician && (
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Responsável</p>
                                <p className="text-gray-900 font-medium">{item.responsible_technician}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add equipment modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200/50 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-xl font-semibold text-gray-900">Novo Equipamento</h2>
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
                  Nome do Equipamento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  placeholder="Ex: Autoclave Vertical"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                    placeholder="Ex: Esterilização"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fabricante</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                    placeholder="Ex: Cristófoli"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                    placeholder="Ex: Vitale 21"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Série</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                    placeholder="Ex: 123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Compra</label>
                <input
                  type="date"
                  value={formData.purchase_date}
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
                    value={formData.calibration_date}
                    onChange={(e) => setFormData({ ...formData, calibration_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Próxima Calibração
                  </label>
                  <input
                    type="date"
                    value={formData.calibration_due_date}
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
                  value={formData.responsible_technician}
                  onChange={(e) =>
                    setFormData({ ...formData, responsible_technician: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  placeholder="Nome do técnico"
                />
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
                  {submitting ? "Criando..." : "Adicionar Equipamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
