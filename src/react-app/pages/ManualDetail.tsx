import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { ArrowLeft, Edit2, Trash2, Save, X } from "lucide-react";
import type { Manual, UpdateManual } from "@/shared/types";

export default function ManualDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manual, setManual] = useState<Manual | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateManual>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchManual();
    }
  }, [id]);

  const fetchManual = async () => {
    try {
      const response = await fetch(`/api/manuals/${id}`);
      const data = await response.json();
      setManual(data);
      setFormData({
        title: data.title,
        type: data.type,
        content: data.content || "",
        version: data.version || "",
        status: data.status,
      });
    } catch (error) {
      console.error("Error fetching manual:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/manuals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedManual = await response.json();
        setManual(updatedManual);
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating manual:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este documento?")) {
      return;
    }

    try {
      const response = await fetch(`/api/manuals/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        navigate("/manuals");
      }
    } catch (error) {
      console.error("Error deleting manual:", error);
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

  if (!manual) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Documento não encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/manuals")}
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
                      title: manual.title,
                      type: manual.type,
                      content: manual.content || "",
                      version: manual.version || "",
                      status: manual.status,
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

        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <input
                  type="text"
                  value={formData.type || ""}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
                <textarea
                  value={formData.content || ""}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Versão</label>
                  <input
                    type="text"
                    value={formData.version || ""}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status || "draft"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0b5b70] focus:ring-2 focus:ring-[#0b5b70]/20 outline-none transition-all"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-semibold text-gray-900">{manual.title}</h1>
                <span
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    manual.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {manual.status === "published" ? "Publicado" : "Rascunho"}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tipo</p>
                  <p className="text-gray-900 font-medium">{manual.type}</p>
                </div>

                {manual.version && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Versão</p>
                    <p className="text-gray-900 font-medium">{manual.version}</p>
                  </div>
                )}
              </div>

              {manual.content && (
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-3">Conteúdo</p>
                  <div className="prose max-w-none">
                    <p className="text-gray-900 whitespace-pre-wrap">{manual.content}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
