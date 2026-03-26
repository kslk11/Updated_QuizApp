"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../../../../../config/api"
import usePagination from "../../../../../../../hooks/usePagination"
import useDebounce from "../../../../../../../hooks/useDebounce"

const SETS_URL = `${API_BASE_URL}/api/client`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const emptyForm = { title: "", duration: "", total_marks: "" };

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "A → Z",  value: "az"     },
  { label: "Z → A",  value: "za"     },
];

function sortSets(list, sortBy) {
  const arr = [...list];
  switch (sortBy) {
    case "oldest": return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "az":     return arr.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    case "za":     return arr.sort((a, b) => (b.title ?? "").localeCompare(a.title ?? ""));
    default:       return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export default function SetsPage() {
  const { courseId, batchId } = useParams();
  const router                = useRouter();

  const [roleNum,      setRoleNum]      = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [form,         setForm]         = useState(emptyForm);
  const [editId,       setEditId]       = useState(null);
  const [showModal,    setShowModal]    = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sortBy,       setSortBy]       = useState("newest");
  const [sortOpen,     setSortOpen]     = useState(false);
  const [batchName,    setBatchName]    = useState("");
  const [courseName,   setCourseName]   = useState("");

  const searchInputRef = useRef(null);
  const sortRef        = useRef(null);

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: rawSets, loading, currentPage, totalPages,
    totalItems, pageNumbers, hasPrev, hasNext, fetchData, goToPage,
  } = usePagination(`${SETS_URL}/quizzes/${batchId}`, { itemsPerPage: 6 });

  const sets = sortSets(rawSets, sortBy);

  useEffect(() => {
    setRoleNum(Number(localStorage.getItem("role") ?? 0));
  }, []);

  useEffect(() => {
    fetchData({ page: currentPage, search: debouncedSearch });
  }, [currentPage, debouncedSearch]);

  useEffect(() => { goToPage(1); }, [debouncedSearch]);

  // fetch breadcrumb names
  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, bRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/course/${courseId}`,   getAuthHeaders()),
          axios.get(`${API_BASE_URL}/api/batches/${batchId}`,   getAuthHeaders()),
        ]);
        setCourseName((cRes.data?.data ?? cRes.data)?.name ?? "");
        setBatchName((bRes.data?.data  ?? bRes.data)?.name  ?? "");
      } catch { /* silent */ }
    };
    load();
  }, [courseId, batchId]);

  useEffect(() => {
    if (searchOpen) { setTimeout(() => searchInputRef.current?.focus(), 50); }
    else { setSearch(""); }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit   = (set) => {
    setForm({ title: set.title, duration: set.duration, total_marks: set.total_marks });
    setEditId(set.id); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const isValid = form.title.trim() && Number(form.duration) > 0 && Number(form.total_marks) > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true); setError(null);
    try {
      const payload = {
        title:       form.title.trim(),
        duration:    Number(form.duration),
        total_marks: Number(form.total_marks),
      };
      if (editId) {
        await axios.put(`${SETS_URL}/client/quiz/${editId}`, payload, getAuthHeaders());
      } else {
        await axios.post(`${SETS_URL}/quiz1`, { ...payload, categoryId: batchId }, getAuthHeaders());
      }
      closeModal();
      fetchData({ page: currentPage, search: debouncedSearch });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setSubmitting(false); }
  };

  const confirmDelete = async () => {
    setSubmitting(true); setError(null);
    try {
      await axios.delete(`${SETS_URL}/admin/quiz/${deleteTarget.id}`, getAuthHeaders());
      setDeleteTarget(null);
      const targetPage = sets.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      goToPage(targetPage);
      fetchData({ page: targetPage, search: debouncedSearch });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setSubmitting(false); }
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort";

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 flex-wrap text-sm text-slate-400">
          <button onClick={() => router.push("/courses")} className="hover:text-indigo-600 font-medium transition">Courses</button>
          <span>/</span>
          <button onClick={() => router.push(`/courses/${courseId}/batches`)} className="hover:text-indigo-600 font-medium transition">
            {courseName || `Course #${courseId}`}
          </button>
          <span>/</span>
          <span className="text-slate-700 font-semibold">{batchName || `Batch #${batchId}`}</span>
          <span>/</span>
          <span className="text-indigo-600 font-semibold">Sets</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Sets</h1>
            <p className="text-sm text-slate-400 mt-1">{totalItems} {totalItems === 1 ? "set" : "sets"} total</p>
          </div>
          <div className="flex items-center gap-2">

            {/* Search */}
            <div className="flex items-center gap-2">
              <div className={`overflow-hidden transition-all duration-300 ${searchOpen ? "w-56 opacity-100" : "w-0 opacity-0"}`}>
                <input ref={searchInputRef} value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search sets…"
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition placeholder:text-slate-300"
                />
              </div>
              <button onClick={() => setSearchOpen(v => !v)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-all">
                {searchOpen ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                )}
              </button>
            </div>

            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <button onClick={() => setSortOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                <span className="hidden sm:inline">{currentSortLabel}</span>
                <svg className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {sortOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-all ${sortBy === opt.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {roleNum !== 3 && (
              <button onClick={openCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">
                + New Set
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : sets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <span className="text-5xl">📦</span>
            <p className="font-semibold text-lg">No sets found</p>
            <p className="text-sm">{search ? "Try a different search term" : roleNum === 3 ? "No sets available yet" : `Click "+ New Set" to get started`}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sets.map((set) => (
              <div key={set.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-lg font-black shrink-0">
                    {set.title?.charAt(0).toUpperCase()}
                  </div>
                  {roleNum !== 3 && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(set)}
                        className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 flex items-center justify-center text-sm transition-all">
                        ✏️
                      </button>
                      <button onClick={() => setDeleteTarget(set)}
                        className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center text-sm transition-all">
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">{set.title}</h3>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-400">⏱ {set.duration} min</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-xs font-medium text-slate-400">🏆 {set.total_marks} marks</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                  <span className="text-xs text-slate-400">
                    {new Date(set.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  {roleNum === 3 ? (
                    <button onClick={() => router.push(`/sets/${set.id}/start-test`)}
                      className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all">
                      Start Test →
                    </button>
                  ) : (
                    <button onClick={() => router.push(`/courses/${courseId}/batches/${batchId}/sets/${set.id}/quiz`)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all">
                      View Quiz →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
            <button onClick={() => goToPage(currentPage - 1)} disabled={!hasPrev || loading}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all">← Prev</button>
            {pageNumbers.map((p, i) =>
              p === "..." ? <span key={`dot-${i}`} className="px-2 text-sm text-slate-400">…</span> : (
                <button key={p} onClick={() => goToPage(p)} disabled={loading}
                  className={`w-9 h-9 rounded-xl text-sm font-bold border transition-all ${currentPage === p ? "bg-indigo-600 text-white border-transparent shadow-md" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {p}
                </button>
              )
            )}
            <button onClick={() => goToPage(currentPage + 1)} disabled={!hasNext || loading}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all">Next →</button>
          </div>
        )}
        {totalPages > 1 && (
          <p className="text-center text-xs text-slate-400 mt-3">Page {currentPage} of {totalPages} · {totalItems} total</p>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-7 shadow-2xl z-10">
            <h2 className="text-xl font-black text-slate-900 mb-1">{editId ? "Edit Set" : "New Set"}</h2>
            <p className="text-sm text-slate-400 mb-6">{editId ? "Update the set details below." : "Fill in the details for the new set."}</p>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Title <span className="text-rose-400">*</span></label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Chapter 1, Week 2…"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition placeholder:text-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Duration (min) <span className="text-rose-400">*</span></label>
                  <input name="duration" type="number" min="1" value={form.duration} onChange={handleChange} placeholder="e.g. 30"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Total Marks <span className="text-rose-400">*</span></label>
                  <input name="total_marks" type="number" min="1" value={form.total_marks} onChange={handleChange} placeholder="e.g. 100"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button onClick={closeModal} className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl font-semibold text-sm transition-all">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting || !isValid}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all">
                {submitting ? "Saving…" : editId ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-7 shadow-2xl z-10 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Delete Set?</h2>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-800">&quot;{deleteTarget.title}&quot;</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl font-semibold text-sm transition-all">Cancel</button>
              <button onClick={confirmDelete} disabled={submitting} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all">
                {submitting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}