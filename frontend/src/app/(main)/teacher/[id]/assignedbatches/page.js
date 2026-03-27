"use client";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../config/api";

const API_URL = `${API_BASE_URL}/api/batches/bat/new`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const SORT_OPTIONS = [
  { label: "Newest First",  value: "newest"   },
  { label: "Oldest First",  value: "oldest"   },
  { label: "Batch A → Z",   value: "az"       },
  { label: "Batch Z → A",   value: "za"       },
];

// ── Avatar color ──────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ec4899","#8b5cf6","#ef4444","#14b8a6"];
const avatarColor = (name = "") => {
  const sum = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

// ── Format date ───────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fmtRelative = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return fmtDate(iso);
};

export default function MyBatchesPage() {
  const router = useRouter();

  const [allBatches, setAllBatches] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [sortBy,     setSortBy]     = useState("newest");
  const [sortOpen,   setSortOpen]   = useState(false);
  const [view,       setView]       = useState("grid"); // grid | list

  // ── Fetch once ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res  = await axios.get(API_URL, getAuthHeaders());
        const raw  = res.data?.data ?? res.data ?? [];
        setAllBatches(Array.isArray(raw) ? raw : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load batches");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Frontend search + sort (no API call) ───────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    const searched = q
      ? allBatches.filter(b =>
          b.Batch?.name?.toLowerCase().includes(q) ||
          String(b.batch_id).includes(q)
        )
      : allBatches;

    return [...searched].sort((a, b) => {
      switch (sortBy) {
        case "oldest": return new Date(a.createdAt) - new Date(b.createdAt);
        case "az":     return (a.Batch?.name ?? "").localeCompare(b.Batch?.name ?? "");
        case "za":     return (b.Batch?.name ?? "").localeCompare(a.Batch?.name ?? "");
        default:       return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [allBatches, search, sortBy]);

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? "Sort";

  // ── Skeleton cards ─────────────────────────────────────────────────────────
  const SkeletonCard = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100" />
        <div className="w-16 h-5 rounded-full bg-slate-100" />
      </div>
      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
      <div className="h-px bg-slate-100 mb-3" />
      <div className="flex justify-between">
        <div className="h-3 bg-slate-100 rounded w-20" />
        <div className="h-3 bg-slate-100 rounded w-16" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Batches</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {loading ? "Loading…" : (
                <>
                  <span className="text-indigo-600 font-semibold">{filtered.length}</span>
                  {search && ` of ${allBatches.length}`} batch{filtered.length !== 1 ? "es" : ""}
                  {search && <span> matching <em>&quot;{search}&quot;</em></span>}
                </>
              )}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search batches…"
                className="pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition w-52"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button onClick={() => setSortOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 6h18M6 12h12M9 18h6"/>
                </svg>
                <span className="hidden sm:inline">{currentSortLabel}</span>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${sortOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {sortOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-1">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all ${
                        sortBy === opt.value
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
              <button onClick={() => setView("grid")}
                className={`p-2.5 transition ${view === "grid" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-50"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
              </button>
              <button onClick={() => setView("list")}
                className={`p-2.5 transition ${view === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-50"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="font-bold text-rose-400 hover:text-rose-600">✕</button>
          </div>
        )}

        {/* ── Stats row ── */}
        {!loading && allBatches.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: "📚", label: "Total Batches",   value: allBatches.length,                                                           color: "#6366f1" },
              { icon: "🔍", label: "Showing",         value: filtered.length,                                                             color: "#0ea5e9" },
              { icon: "✅", label: "Active",          value: allBatches.filter(b => !b.deletedAt).length,                                 color: "#10b981" },
              { icon: "🗓️", label: "Latest",          value: allBatches.length ? fmtRelative(allBatches[0]?.createdAt) : "—",            color: "#f59e0b" },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0">{s.icon}</div>
                <div>
                  <div className="text-xl font-black text-slate-900 leading-none" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className={`grid gap-4 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <div className="text-6xl">
              {search ? "🔍" : "📚"}
            </div>
            <p className="text-lg font-semibold text-slate-600">
              {search ? "No batches found" : "No batches yet"}
            </p>
            <p className="text-sm">
              {search
                ? `No results for "${search}" — try a different term`
                : "You haven't been assigned to any batches yet"
              }
            </p>
            {search && (
              <button onClick={() => setSearch("")}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition">
                Clear search
              </button>
            )}
          </div>
        )}

        {/* ── Grid view ── */}
        {!loading && filtered.length > 0 && view === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const batchName = item.Batch?.name ?? `Batch #${item.batch_id}`;
              const color     = avatarColor(batchName);
              return (
                <div key={item.id}
                  onClick={() => router.push(`/batches/${item.batch_id}/sets`)}
                  className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">

                  {/* Card top */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0"
                      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                      {batchName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Active
                    </span>
                  </div>

                  {/* Batch name */}
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-700 transition leading-tight">
                      {batchName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <span>🆔</span> Batch ID #{item.batch_id}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100" />

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {fmtRelative(item.createdAt)}
                    </div>
                    <span className="text-xs font-semibold text-indigo-500 group-hover:text-indigo-700 transition flex items-center gap-1">
                      View sets
                      <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── List view ── */}
        {!loading && filtered.length > 0 && view === "list" && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-widest text-slate-400">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Batch</div>
              <div className="col-span-3">Batch ID</div>
              <div className="col-span-3 text-right">Assigned</div>
            </div>

            <div className="divide-y divide-slate-100">
              {filtered.map((item, i) => {
                const batchName = item.Batch?.name ?? `Batch #${item.batch_id}`;
                const color     = avatarColor(batchName);
                return (
                  <div key={item.id}
                    onClick={() => router.push(`/batches/${item.batch_id}/sets`)}
                    className="grid grid-cols-12 px-6 py-4 items-center hover:bg-indigo-50 transition cursor-pointer group">
                    <div className="col-span-1 text-xs text-slate-400 font-mono">{String(i + 1).padStart(2, "0")}</div>

                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                        {batchName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm text-slate-800 group-hover:text-indigo-700 transition">
                        {batchName}
                      </span>
                    </div>

                    <div className="col-span-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
                        🆔 #{item.batch_id}
                      </span>
                    </div>

                    <div className="col-span-3 flex justify-end items-center gap-2">
                      <span className="text-xs text-slate-400">{fmtRelative(item.createdAt)}</span>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Showing <span className="font-bold text-indigo-600">{filtered.length}</span>
                {search && ` of ${allBatches.length}`} batch{filtered.length !== 1 ? "es" : ""}
              </span>
              <span className="text-xs text-slate-300">Click a row to view sets</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}