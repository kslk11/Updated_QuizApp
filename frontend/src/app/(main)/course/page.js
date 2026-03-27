"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../config/api";
import usePagination from "../../../hooks/usePagination";
import useDebounce from "../../../hooks/useDebounce";

const COURSES_URL = `${API_BASE_URL}/api/course`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const emptyForm = { name: "" };

// ── Color palette for course cards ─────────────────────────────────────────────
const CARD_COLORS = [
  { bg: "#eef2ff", icon: "#6366f1", border: "#c7d2fe", text: "#4338ca" },
  { bg: "#f0fdf4", icon: "#10b981", border: "#a7f3d0", text: "#047857" },
  { bg: "#fff7ed", icon: "#f59e0b", border: "#fde68a", text: "#b45309" },
  { bg: "#fdf2f8", icon: "#ec4899", border: "#fbcfe8", text: "#be185d" },
  { bg: "#f0f9ff", icon: "#0ea5e9", border: "#bae6fd", text: "#0369a1" },
  { bg: "#f5f3ff", icon: "#8b5cf6", border: "#ddd6fe", text: "#6d28d9" },
  { bg: "#fff1f2", icon: "#ef4444", border: "#fecaca", text: "#b91c1c" },
  { bg: "#f0fdfa", icon: "#14b8a6", border: "#99f6e4", text: "#0f766e" },
];

const getCardColor = (id) => CARD_COLORS[(id - 1) % CARD_COLORS.length];

// ── Emoji map based on course name keywords ────────────────────────────────────
const getCourseEmoji = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("math"))    return "📐";
  if (n.includes("physics")) return "⚛️";
  if (n.includes("chem"))    return "🧪";
  if (n.includes("bio"))     return "🧬";
  if (n.includes("english")) return "📖";
  if (n.includes("hist"))    return "🏛️";
  if (n.includes("geo"))     return "🌍";
  if (n.includes("computer") || n.includes("cs") || n.includes("code") || n.includes("prog")) return "💻";
  if (n.includes("art"))     return "🎨";
  if (n.includes("music"))   return "🎵";
  if (n.includes("econ"))    return "📊";
  if (n.includes("pe") || n.includes("sport")) return "⚽";
  if (n.includes("science")) return "🔬";
  if (n.includes("cpp") || n.includes("c++")) return "⚙️";
  if (n.includes("java"))    return "☕";
  if (n.includes("python"))  return "🐍";
  return "📚";
};

export default function CoursesPage() {
  const router = useRouter();

  const [search,     setSearch]     = useState("");
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState(emptyForm);
  const [editId,     setEditId]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: courses, loading, currentPage, totalPages,
    totalItems, pageNumbers, hasPrev, hasNext, fetchData, goToPage,
  } = usePagination(COURSES_URL, { itemsPerPage: 8 });

  useEffect(() => {
    fetchData({ page: currentPage, search: debouncedSearch });
  }, [currentPage, debouncedSearch]);

  const refresh    = () => fetchData({ page: currentPage, search: debouncedSearch });
  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit   = (c) => { setForm({ name: c.name }); setEditId(c.id); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setForm(emptyForm); setEditId(null); };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.warning("Course name is required"); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await axios.put(`${COURSES_URL}/${editId}`, form, getAuthHeaders());
        toast.success("Course updated successfully");
      } else {
        await axios.post(COURSES_URL, form, getAuthHeaders());
        toast.success("Course created successfully");
      }
      closeModal(); refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${COURSES_URL}/${id}`, getAuthHeaders());
      toast.success("Course deleted"); setDeleteId(null); refresh();
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Courses</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {totalItems} course{totalItems !== 1 ? "s" : ""} total · click a card to view batches
            </p>
          </div>
          <button onClick={openCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 self-start sm:self-auto">
            <span className="text-base leading-none">+</span> Add Course
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
            placeholder="Search courses..."
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition shadow-sm"
          />
          {search && (
            <button onClick={() => { setSearch(""); goToPage(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* Skeleton — 4 columns */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 mb-4" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/3 mb-4" />
                <div className="h-8 bg-slate-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <div className="text-6xl">{search ? "🔍" : "📚"}</div>
            <p className="text-lg font-semibold text-slate-600">
              {search ? `No results for "${search}"` : "No courses yet"}
            </p>
            <p className="text-sm">
              {search ? "Try a different search term" : "Click \"+ Add Course\" to get started"}
            </p>
            {!search && (
              <button onClick={openCreate}
                className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">
                + Add Course
              </button>
            )}
          </div>
        )}

        {/* Card grid — 4 per row */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {courses.map((course, i) => {
              const color = getCardColor(course.id ?? i + 1);
              const emoji = getCourseEmoji(course.name);
              return (
                <div key={course.id}
                  onClick={() => router.push(`/courses/${course.id}/batches`)}
                  className="bg-white border rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer group hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative"
                  style={{ borderColor: color.border }}>

                  {/* Hover action buttons */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(course)} title="Edit"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                      style={{ background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" }}>
                      ✏️
                    </button>
                    <button onClick={() => setDeleteId(course.id)} title="Delete"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                      style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>
                      🗑️
                    </button>
                  </div>

                  {/* Course icon */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm group-hover:scale-110 transition-transform duration-200"
                    style={{ background: color.bg, border: `2px solid ${color.border}` }}>
                    {emoji}
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-sm text-slate-800 leading-tight mb-1.5 line-clamp-2 group-hover:text-indigo-700 transition-colors px-1">
                    {course.name}
                  </h3>

                  {/* ID badge */}
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                    #{String(course.id).padStart(3, "0")}
                  </span>

                  {/* CTA button */}
                  <div className="mt-4 w-full py-2 rounded-xl text-xs font-semibold border transition-all"
                    style={{ background: color.bg, borderColor: color.border, color: color.text }}>
                    <span className="group-hover:hidden">View Batches</span>
                    <span className="hidden group-hover:inline">View Batches →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => goToPage(currentPage - 1)} disabled={!hasPrev}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
              ← Prev
            </button>
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="px-2 text-slate-400 text-sm">...</span>
              ) : (
                <button key={p} onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold border transition ${
                    p === currentPage ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}>
                  {p}
                </button>
              )
            )}
            <button onClick={() => goToPage(currentPage + 1)} disabled={!hasNext}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
              Next →
            </button>
          </div>
        )}
        {totalPages > 1 && (
          <p className="text-center text-xs text-slate-400 mt-2">
            Page {currentPage} of {totalPages} · {totalItems} total
          </p>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xl">
                {editId ? "✏️" : "📚"}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">{editId ? "Edit Course" : "New Course"}</h2>
                <p className="text-xs text-slate-400">{editId ? "Update course name" : "Add a new course to the system"}</p>
              </div>
            </div>
            <div className="mb-5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Course Name</label>
              <input type="text" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="e.g. Mathematics, Python Basics…"
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={closeModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition">
                {submitting ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-200 text-center">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-rose-200">🗑️</div>
            <h2 className="text-lg font-black text-slate-900 mb-1">Delete Course?</h2>
            <p className="text-sm text-slate-400 mb-6">This will permanently remove the course and cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}