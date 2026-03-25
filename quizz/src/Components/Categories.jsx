import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import useDebounce from "../Hooks/useDebounce";
import usePagination from "../Hooks/usePagination";
import { useTheme } from "../Hooks/useTheame";

// role 2 (client) → authenticated endpoint
// role 1 (superadmin) & role 3 (student) → no-auth endpoint
const CATEGORIES_URL_AUTH   = `${API_BASE_URL}/api/client/bundle`;
const CATEGORIES_URL_NOAUTH = `${API_BASE_URL}/api/client/bundlesNoauth`;

const emptyForm = { name: "", description: "" };

const SORT_OPTIONS = [
  { label: "Newest",   value: "newest" },
  { label: "Oldest",   value: "oldest" },
  { label: "A → Z",    value: "az"     },
  { label: "Z → A",    value: "za"     },
];

function sortCategories(list, sortBy) {
  const arr = [...list];
  switch (sortBy) {
    case "oldest":
      return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "az":
      return arr.sort((a, b) =>
        (a.title ?? a.name ?? "").localeCompare(b.title ?? b.name ?? "")
      );
    case "za":
      return arr.sort((a, b) =>
        (b.title ?? b.name ?? "").localeCompare(a.title ?? a.name ?? "")
      );
    default: // newest
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export default function Categories() {
  const { t }    = useTheme();
  const navigate = useNavigate();

  const roleNum       = Number(localStorage.getItem("role") ?? 0);
  const categoriesUrl = roleNum === 2 ? CATEGORIES_URL_AUTH : CATEGORIES_URL_NOAUTH;
  const canManage     = roleNum === 2;

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

  const searchInputRef = useRef(null);
  const sortRef        = useRef(null);

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: rawCategories,
    loading,
    currentPage,
    totalPages,
    totalItems,
    pageNumbers,
    hasPrev,
    fetchData,
    goToPage,
  } = usePagination(categoriesUrl, { itemsPerPage: 6 });

  const categories = sortCategories(rawCategories, sortBy);

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

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setForm({
      name:        cat.title ?? cat.name ?? "",
      description: cat.description ?? "",
    });
    setEditId(cat.id ?? cat._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
  };

  // ── Create / Update ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const token   = localStorage.getItem("token");
      const payload = { title: form.name, description: form.description };
      if (editId) {
        await axios.put(`${CATEGORIES_URL_AUTH}/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(CATEGORIES_URL_AUTH, payload, {
          headers: { Authorization: `Bearer ${token}` },
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

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const token    = localStorage.getItem("token");
      const targetId = deleteTarget.id ?? deleteTarget._id;
      await axios.delete(`${CATEGORIES_URL_AUTH}/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteTarget(null);
      const targetPage =
        categories.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      goToPage(targetPage);
      fetchData({ page: targetPage, search: debouncedSearch });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getCatId   = (cat) => cat.id    ?? cat._id;
  const getCatName = (cat) => cat.title ?? cat.name ?? "";

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort";

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-300 p-6`}>
      <div className="max-w-5xl mx-auto">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-black ${t.text}`}>Categories</h1>
            <p className={`text-sm ${t.textMuted} mt-1`}>
              {totalItems} {totalItems === 1 ? "category" : "categories"} total
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
                    placeholder="Search categories…"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
                  />
                  {/* Debounce spinner inside input */}
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
                  // X icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  // Search icon
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

            {/* New Category button — role 2 only */}
            {canManage && (
              <button
                onClick={openCreate}
                className={`${t.accentBg} ${t.accentBgHover} text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all`}
              >
                + New Category
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
        ) : categories.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-24 gap-3 ${t.textMuted}`}>
            <span className="text-5xl">🗂️</span>
            <p className="font-semibold text-lg">No categories found</p>
            <p className="text-sm">
              {search
                ? "Try a different search term"
                : canManage
                  ? `Click "+ New Category" to get started`
                  : "No categories available yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={getCatId(cat)}
                onClick={() => navigate(`/categories/${getCatId(cat)}/sets`)}
                className={`${t.bgCard} border ${t.border} cursor-pointer rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all`}
              >
                {/* Card top */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl ${t.accentLight} ${t.accentText} flex items-center justify-center text-lg font-black shrink-0`}
                  >
                    {getCatName(cat).charAt(0).toUpperCase()}
                  </div>

                  {canManage && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(cat); }}
                        className={`w-8 h-8 rounded-lg border ${t.border} ${t.bgCardHover} ${t.textSecondary} flex items-center justify-center text-sm transition-all`}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(cat); }}
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
                    {getCatName(cat)}
                  </h3>
                  <p className={`text-sm ${t.textMuted} mt-1 line-clamp-2 leading-relaxed`}>
                    {cat.description || "No description provided."}
                  </p>
                </div>

                {/* Card footer */}
                <div className={`flex items-center justify-between pt-2 border-t ${t.borderSubtle}`}>
                  <span className={`text-xs ${t.textMuted}`}>
                    {new Date(cat.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${t.badge}`}>
                    Active
                  </span>
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
                <span key={`dot-${i}`} className={`px-2 text-sm ${t.textMuted}`}>…</span>
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
              disabled={currentPage === totalPages || loading}
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

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className={`relative w-full max-w-md ${t.bgCard} border ${t.border} rounded-3xl p-7 shadow-2xl z-10`}>
            <h2 className={`text-xl font-black ${t.text} mb-1`}>
              {editId ? "Edit Category" : "New Category"}
            </h2>
            <p className={`text-sm ${t.textMuted} mb-6`}>
              {editId
                ? "Update the category details below."
                : "Fill in the details to create a new category."}
            </p>

            <div className="flex flex-col gap-5">
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-1.5 block`}>
                  Name <span className="text-rose-400">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Science, History…"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
                />
              </div>
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-1.5 block`}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this category…"
                  rows={3}
                  className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted} resize-none`}
                />
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
                disabled={submitting || !form.name.trim()}
                className={`flex-1 ${t.accentBg} ${t.accentBgHover} text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all`}
              >
                {submitting ? "Saving…" : editId ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className={`relative w-full max-w-sm ${t.bgCard} border ${t.border} rounded-3xl p-7 shadow-2xl z-10 text-center`}>
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className={`text-xl font-black ${t.text} mb-2`}>Delete Category?</h2>
            <p className={`text-sm ${t.textMuted} mb-6`}>
              Are you sure you want to delete{" "}
              <span className={`font-bold ${t.text}`}>"{getCatName(deleteTarget)}"</span>?
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