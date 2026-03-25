import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import useDebounce from "../Hooks/useDebounce";
import usePagination from "../Hooks/usePagination";
import { useTheme } from "../Hooks/useTheame";

const SETS_URL       = `${API_BASE_URL}/api/client`;
const CATEGORIES_URL = `${API_BASE_URL}/api/client`;
const emptyForm      = { title: "", duration: "", total_marks: "" };

const SORT_OPTIONS = [
  { label: "Newest",   value: "newest" },
  { label: "Oldest",   value: "oldest" },
  { label: "A → Z",    value: "az"     },
  { label: "Z → A",    value: "za"     },
];

function sortSets(list, sortBy) {
  const arr = [...list];
  switch (sortBy) {
    case "oldest":
      return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "az":
      return arr.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    case "za":
      return arr.sort((a, b) => (b.title ?? "").localeCompare(a.title ?? ""));
    default: // newest
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export default function Set() {
  const { categoryId } = useParams();
  const navigate       = useNavigate();
  const { t }          = useTheme();

  const [category, setCategory]         = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [searchOpen, setSearchOpen]     = useState(false);
  const [form, setForm]                 = useState(emptyForm);
  const [editId, setEditId]             = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sortBy, setSortBy]             = useState("newest");
  const [sortOpen, setSortOpen]         = useState(false);

  const [roleNum, setRoleNum] = useState(null);

  const searchInputRef = useRef(null);
  const sortRef        = useRef(null);

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: rawSets,
    loading,
    currentPage,
    totalPages,
    totalItems,
    pageNumbers,
    hasPrev,
    hasNext,
    fetchData,
    goToPage,
  } = usePagination(`${SETS_URL}/quizzes/${categoryId}`, { itemsPerPage: 6 });

  const sets = sortSets(rawSets, sortBy);

  console.log("sets", sets);
  console.log("sets currentPage", currentPage);
  console.log("sets totalPages", totalPages);

  // ── Fetch parent category
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axios.get(`${CATEGORIES_URL}/quizzes/${categoryId}`);
        setCategory(res.data);
      } catch {
        setCategory(null);
      }
    };
    fetchCategory();
  }, [categoryId]);

  // role
  useEffect(() => {
    const role = localStorage.getItem("role");
    setRoleNum(Number(role));
  }, []);

  // ── Fetch sets
  useEffect(() => {
    fetchData({ page: currentPage, search: debouncedSearch });
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    goToPage(1);
  }, [debouncedSearch]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [searchOpen]);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Modal helpers
  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (set) => {
    setForm({
      title:       set.title,
      duration:    set.duration,
      total_marks: set.total_marks,
    });
    setEditId(set.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
  };
console.log("sets",sets)
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ── Validation
  const isValid =
    form.title.trim() &&
    Number(form.duration) > 0 &&
    Number(form.total_marks) > 0;

  console.log(editId);

  // ── Create / Update
  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title:       form.title.trim(),
        duration:    Number(form.duration),
        total_marks: Number(form.total_marks),
      };
      if (editId) {
        await axios.put(`${SETS_URL}/client/quiz/${editId}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        await axios.post(`${SETS_URL}/quiz1`, { ...payload, categoryId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }
      closeModal();
      fetchData({ page: currentPage, search: debouncedSearch });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete
  const confirmDelete = async () => {
    console.log("deleteTarget.id", deleteTarget.id);
    setSubmitting(true);
    setError(null);
    try {
      await axios.delete(`${SETS_URL}/admin/quiz/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDeleteTarget(null);
      const targetPage =
        sets.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      goToPage(targetPage);
      fetchData({ page: targetPage, search: debouncedSearch });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  console.log(sets.quizzes);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort";

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-300 p-6`}>
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => navigate("/categories")}
            className={`text-sm font-semibold ${t.accent} hover:underline`}
          >
            Categories
          </button>
          <span className={`text-sm ${t.textMuted}`}>›</span>
          <span className={`text-sm font-semibold ${t.text}`}>Sets</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-black ${t.text}`}>Sets</h1>
            <p className={`text-sm ${t.textMuted} mt-1`}>
              {category?.description && (
                <span className="mr-2">{category.description} ·</span>
              )}
              {totalItems} {totalItems === 1 ? "set" : "sets"} total
            </p>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">

            {/* Search toggle + input */}
            <div className="flex items-center gap-2">
              {/* Animated search input */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  searchOpen ? "w-56 opacity-100" : "w-0 opacity-0"
                }`}
              >
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search sets…"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
                  />
                  {search !== debouncedSearch && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      <div className={`w-3.5 h-3.5 border-2 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
                    </div>
                  )}
                </div>
              </div>

              {/* Search icon button */}
              <button
                onClick={() => setSearchOpen((v) => !v)}
                title={searchOpen ? "Close search" : "Search"}
                className={`w-9 h-9 flex items-center justify-center rounded-xl border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} transition-all`}
              >
                {searchOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                )}
              </button>
            </div>

            {/* Sort dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} text-sm font-semibold transition-all`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                <span className="hidden sm:inline">{currentSortLabel}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {sortOpen && (
                <div className={`absolute right-0 mt-1.5 w-36 ${t.bgCard} border ${t.border} rounded-2xl shadow-xl z-30 overflow-hidden py-1`}>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-all
                        ${sortBy === opt.value
                          ? `${t.accentBg} text-white`
                          : `${t.textSecondary} ${t.bgCardHover}`
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Only admin/client can create sets */}
            {roleNum !== 3 && (
              <button
                onClick={openCreate}
                className={`${t.accentBg} ${t.accentBgHover} text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all`}
              >
                + New Set
              </button>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-600 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className={`w-8 h-8 border-4 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
          </div>
        ) : sets.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-24 gap-3 ${t.textMuted}`}>
            <span className="text-5xl">📦</span>
            <p className="font-semibold text-lg">No sets found</p>
            <p className="text-sm">
              {search
                ? "Try a different search term"
                : roleNum === 3
                  ? "No sets available yet"
                  : `Click "+ New Set" to get started`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sets.map((set) => (
              <div
                key={set.id}
                className={`${t.bgCard} border ${t.border} rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all`}
              >
                {/* Card top */}
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 rounded-xl ${t.accentLight} ${t.accentText} flex items-center justify-center text-lg font-black shrink-0`}>
                    {set.title?.charAt(0).toUpperCase()}
                  </div>

                  {/* Edit/Delete only for non-students */}
                  {roleNum !== 3 && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(set)}
                        className={`w-8 h-8 rounded-lg border ${t.border} ${t.bgCardHover} ${t.textSecondary} flex items-center justify-center text-sm transition-all`}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteTarget(set)}
                        className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center text-sm transition-all"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>

                {/* Card content */}
                <div>
                  <h3 className={`font-bold text-base ${t.text} leading-tight`}>
                    {set.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`flex items-center gap-1 text-xs font-medium ${t.textMuted}`}>
                      ⏱ {set.duration} min
                    </span>
                    <span className={`w-1 h-1 rounded-full bg-current ${t.textMuted}`} />
                    <span className={`flex items-center gap-1 text-xs font-medium ${t.textMuted}`}>
                      🏆 {set.total_marks} marks
                    </span>
                  </div>
                </div>

                {/* Card footer */}
                <div className={`flex items-center justify-between pt-2 border-t ${t.borderSubtle} mt-auto`}>
                  <span className={`text-xs ${t.textMuted}`}>
                    {new Date(set.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  {/* Role-based action button */}
                  {roleNum === 3 ? (
                    <button
                      onClick={() => navigate(`/sets/${set.id}/start-test`)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full ${t.accentBg} ${t.accentBgHover} text-white shadow-sm transition-all`}
                    >
                      Start Test →
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/sets/${set.id}/quiz`)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${t.badge} ${t.accentText} hover:underline transition-all`}
                    >
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
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!hasPrev || loading}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${t.border} ${t.bgCard} ${t.textSecondary} disabled:opacity-40 ${t.bgCardHover} transition-all`}
            >
              ← Prev
            </button>

            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`dot-${i}`} className={`px-2 text-sm ${t.textMuted}`}>
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  disabled={loading}
                  className={`w-9 h-9 rounded-xl text-sm font-bold border transition-all
                    ${currentPage === p
                      ? `${t.accentBg} text-white border-transparent shadow-md`
                      : `${t.bgCard} ${t.border} ${t.textSecondary} ${t.bgCardHover}`
                    }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNext || loading}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${t.border} ${t.bgCard} ${t.textSecondary} disabled:opacity-40 ${t.bgCardHover} transition-all`}
            >
              Next →
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <p className={`text-center text-xs ${t.textMuted} mt-3`}>
            Page {currentPage} of {totalPages} · {totalItems} total
          </p>
        )}
      </div>

      {/* ── Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className={`relative w-full max-w-md ${t.bgCard} border ${t.border} rounded-3xl p-7 shadow-2xl z-10`}>

            <h2 className={`text-xl font-black ${t.text} mb-1`}>
              {editId ? "Edit Set" : "New Set"}
            </h2>
            <p className={`text-sm ${t.textMuted} mb-6`}>
              {editId
                ? "Update the set details below."
                : `Creating inside "${category?.name ?? "this category"}"`}
            </p>

            <div className="flex flex-col gap-5">

              {/* Title */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-1.5 block`}>
                  Title <span className="text-rose-400">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Chapter 1, Week 2…"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
                />
              </div>

              {/* Duration + Total Marks */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-1.5 block`}>
                    Duration (min) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    name="duration"
                    type="number"
                    min="1"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="e.g. 30"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-1.5 block`}>
                    Total Marks <span className="text-rose-400">*</span>
                  </label>
                  <input
                    name="total_marks"
                    type="number"
                    min="1"
                    value={form.total_marks}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
                  />
                </div>
              </div>

            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={closeModal}
                className={`flex-1 border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} py-2.5 rounded-xl font-semibold text-sm transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !isValid}
                className={`flex-1 ${t.accentBg} ${t.accentBgHover} text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all`}
              >
                {submitting ? "Saving…" : editId ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className={`relative w-full max-w-sm ${t.bgCard} border ${t.border} rounded-3xl p-7 shadow-2xl z-10 text-center`}>
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className={`text-xl font-black ${t.text} mb-2`}>Delete Set?</h2>
            <p className={`text-sm ${t.textMuted} mb-6`}>
              Are you sure you want to delete{" "}
              <span className={`font-bold ${t.text}`}>"{deleteTarget.title}"</span>?
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className={`flex-1 border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} py-2.5 rounded-xl font-semibold text-sm transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={submitting}
                className="flex-1 bg-rose-500 hover:bg-rose-400 text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all"
              >
                {submitting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}