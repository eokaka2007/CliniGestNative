import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import { Plus, CheckSquare, X, Calendar, User } from "lucide-react";
import type { RoutineTask, CreateRoutineTask, RoutineCheckin, CreateRoutineCheckin, Clinic } from "@/shared/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RoutinesPage() {
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<RoutineTask | null>(null);
  const [checkins, setCheckins] = useState<RoutineCheckin[]>([]);
  const [formData, setFormData] = useState<CreateRoutineTask & { clinicId: string }>({
    title: "",
    description: "",
    frequency: "",
    responsible: "",
    clinicId: "",
  });
  const [checkinData, setCheckinData] = useState<CreateRoutineCheckin>({
    completed_at: new Date().toISOString().slice(0, 16),
    notes: "",
    batch_number: "",
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

      const allTasks: RoutineTask[] = [];
      for (const clinic of clinicsData) {
        const res = await fetch(`/api/clinics/${clinic.id}/routine-tasks`);
        const data = await res.json();
        allTasks.push(...data);
      }
      setTasks(allTasks);
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
      const response = await fetch(`/api/clinics/${formData.clinicId}/routine-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          frequency: formData.frequency,
          responsible: formData.responsible,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([newTask, ...tasks]);
        setShowModal(false);
        setFormData({ title: "", description: "", frequency: "", responsible: "", clinicId: "" });
      }
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/routine-tasks/${selectedTask.id}/checkins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkinData),
      });

      if (response.ok) {
        const newCheckin = await response.json();
        setCheckins([newCheckin, ...checkins]);
        setShowCheckinModal(false);
        setCheckinData({ completed_at: new Date().toISOString().slice(0, 16), notes: "", batch_number: "" });
      }
    } catch (error) {
      console.error("Error creating checkin:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const openCheckinModal = async (task: RoutineTask) => {
    setSelectedTask(task);
    setShowCheckinModal(true);

    try {
      const response = await fetch(`/api/routine-tasks/${task.id}/checkins`);
      const data = await response.json();
      setCheckins(data);
    } catch (error) {
      console.error("Error fetching checkins:", error);
    }
  };

  const frequencies = [
    { value: "diaria", label: "Diária" },
    { value: "semanal", label: "Semanal" },
    { value: "quinzenal", label: "Quinzenal" },
    { value: "mensal", label: "Mensal" },
    { value: "trimestral", label: "Trimestral" },
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
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Agenda de Rotinas</h1>
            <p className="text-gray-600">Gerencie tarefas recorrentes e check-ins</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
            <span className="font-medium">Nova Rotina</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const clinic = clinics.find((c) => c.id === task.clinic_id);
            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#0b5b70] to-[#0d7087] shadow-lg">
                    <CheckSquare className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700">
                    {task.frequency}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>

                {task.description && (
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                )}

                {clinic && <p className="text-xs text-gray-500 mb-3">{clinic.name}</p>}

                {task.responsible && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <User className="w-4 h-4" strokeWidth={2} />
                    <span>{task.responsible}</span>
                  </div>
                )}

                <button
                  onClick={() => openCheckinModal(task)}
                  className="w-full bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Registrar Check-in
                </button>
              </div>
            );
          })}
        </div>

        {tasks.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0b5b70]/10 to-[#0d7087]/10">
              <CheckSquare className="w-8 h-8 text-[#0b5b70]" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma rotina cadastrada</h3>
            <p className="text-gray-600 mb-6">Comece criando sua primeira tarefa recorrente</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200/50 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-xl font-semibold text-gray-900">Nova Rotina</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  placeholder="Limpeza da sala de esterilização"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all resize-none"
                  placeholder="Descreva os passos necessários"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequência *</label>
                <select
                  required
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                >
                  <option value="">Selecione a frequência</option>
                  {frequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
                <input
                  type="text"
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  placeholder="Nome do responsável"
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
                  {submitting ? "Criando..." : "Criar Rotina"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCheckinModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200/50 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-xl font-semibold text-gray-900">Check-in: {selectedTask.title}</h2>
              <button
                onClick={() => setShowCheckinModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleCheckin} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data e Hora *</label>
                  <input
                    type="datetime-local"
                    required
                    value={checkinData.completed_at}
                    onChange={(e) => setCheckinData({ ...checkinData, completed_at: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lote/Autoclave</label>
                  <input
                    type="text"
                    value={checkinData.batch_number || ""}
                    onChange={(e) => setCheckinData({ ...checkinData, batch_number: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                    placeholder="Número do lote ou autoclave"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                  <textarea
                    value={checkinData.notes || ""}
                    onChange={(e) => setCheckinData({ ...checkinData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all resize-none"
                    placeholder="Adicione observações relevantes"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#0b5b70] to-[#0d7087] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {submitting ? "Registrando..." : "Registrar Check-in"}
                </button>
              </form>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico</h3>
                <div className="space-y-3">
                  {checkins.map((checkin) => (
                    <div
                      key={checkin.id}
                      className="bg-gray-50 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" strokeWidth={2} />
                          <span>
                            {format(new Date(checkin.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        {checkin.batch_number && (
                          <span className="text-xs font-medium text-gray-500">
                            Lote: {checkin.batch_number}
                          </span>
                        )}
                      </div>
                      {checkin.notes && (
                        <p className="text-sm text-gray-700">{checkin.notes}</p>
                      )}
                    </div>
                  ))}

                  {checkins.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum check-in registrado ainda
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
