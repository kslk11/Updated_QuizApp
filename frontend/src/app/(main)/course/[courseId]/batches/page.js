"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../../../config/api";
import usePagination from "../../../../../hooks/usePagination";
import useDebounce from "../../../../../hooks/useDebounce";

const BATCHES_URL = `${API_BASE_URL}/api/batches`;
const COURSES_URL = `${API_BASE_URL}/api/course`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function BatchesPage() {
  const { courseId } = useParams();
  const router       = useRouter();

  const [search,     setSearch]     = useState("");
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState({ name: "" });
  const [editId,     setEditId]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [courseName, setCourseName] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: batches, loading, currentPage, totalPages,
    totalItems, pageNumbers, hasPrev, hasNext, fetchData, goToPage,
  } = usePagination(`${BATCHES_URL}?course_id=${courseId}`, { itemsPerPage: 5 });

  useEffect(() => {
    fetchData({ page: currentPage, search: debouncedSearch });
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    axios.get(`${COURSES_URL}/${courseId}`, getAuthHeaders())
      .then(res => setCourseName((res.data?.data ?? res.data)?.name ?? ""))
      .catch(() => {});
  }, [courseId]);

  const refresh    = () => fetchData({ page: currentPage, search: debouncedSearch });
  const openCreate = () => { setForm({ name: "" }); setEditId(null); setShowModal(true); };
  const openEdit   = (b)  => { setForm({ name: b.name }); setEditId(b.id); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setForm({ name: "" }); setEditId(null); };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.warning("Batch name is required"); return; }
    setSubmitting(true);
    try {
      const payload = { name: form.name, course_id: courseId };
      if (editId) {
        await axios.put(`${BATCHES_URL}/${editId}`, payload, getAuthHeaders());
        toast.success("Batch updated successfully");
      } else {
        await axios.post(BATCHES_URL, payload, getAuthHeaders());
        toast.success("Batch created successfully");
      }
      closeModal(); refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BATCHES_URL}/${id}`, getAuthHeaders());
      toast.success("Batch deleted"); setDeleteId(null); refresh();
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <button onClick={() => router.push("/course")} className="hover:text-indigo-600 font-medium transition">Courses</button>
          <span>/</span>
          <span className="text-slate-700 font-semibold">{courseName || `Course #${courseId}`}</span>
          <span>/</span>
          <span className="text-indigo-600 font-semibold">Batches</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Batches</h1>
            <p className="text-sm text-slate-400 mt-0.5">{totalItems} batch{totalItems !== 1 ? "es" : ""} · click a row to view sets</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/courses")} className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition">← Back</button>
            <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">+ Add Batch</button>
          </div>
        </div>

        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
          placeholder="Search batches..."
          className="w-full mb-6 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-8" />
                  <div className="h-4 bg-slate-100 rounded w-48" />
                  <div className="ml-auto flex gap-2">
                    <div className="h-8 w-16 bg-slate-100 rounded-xl" />
                    <div className="h-8 w-16 bg-slate-100 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : batches.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No batches found. <button onClick={openCreate} className="text-indigo-600 font-semibold hover:underline">Create one</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-widest text-slate-400">
                <div className="col-span-1">#</div>
                <div className="col-span-7">Batch Name</div>
                <div className="col-span-4 text-right">Actions</div>
              </div>
              <div className="divide-y divide-slate-100">
                {batches.map((batch, i) => (
                  <div key={batch.id}
                    onClick={() => router.push(`/course/${courseId}/batches/${batch.id}/sets`)}
                    className="grid grid-cols-12 px-6 py-4 items-center hover:bg-indigo-50 transition cursor-pointer group">
                    <div className="col-span-1 text-xs text-slate-400 font-mono">{(currentPage - 1) * 5 + i + 1}</div>
                    <div className="col-span-7 flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800 group-hover:text-indigo-700 transition">{batch.name}</span>
                      <span className="hidden group-hover:inline-flex text-xs text-indigo-400 font-medium">View sets →</span>
                    </div>
                    <div className="col-span-4 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEdit(batch)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition">Edit</button>
                      <button onClick={() => setDeleteId(batch.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => goToPage(currentPage - 1)} disabled={!hasPrev} className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition">← Prev</button>
            {pageNumbers.map((p, i) =>
              p === "..." ? <span key={`e-${i}`} className="px-2 text-slate-400 text-sm">...</span> : (
                <button key={p} onClick={() => goToPage(p)} className={`w-9 h-9 rounded-xl text-sm font-bold border transition ${p === currentPage ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>{p}</button>
              )
            )}
            <button onClick={() => goToPage(currentPage + 1)} disabled={!hasNext} className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition">Next →</button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h2 className="text-lg font-black text-slate-900 mb-5">{editId ? "Edit Batch" : "New Batch"}</h2>
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Batch Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()} placeholder="e.g. Morning Batch"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={closeModal} className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition">
                {submitting ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-200">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
            <h2 className="text-lg font-black text-slate-900 text-center mb-1">Delete Batch?</h2>
            <p className="text-sm text-slate-400 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}