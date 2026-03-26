"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../config/api";
import usePagination from "../../../hooks/usePagination";
import useDebounce from "../../../hooks/useDebounce";

const MAPPING_URL  = `${API_BASE_URL}/api/batch-teacher/assign`;
const BATCHES_URL  = `${API_BASE_URL}/api/batches`;
const TEACHERS_URL = `${API_BASE_URL}/api/teachers`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// ── Avatar ─────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ec4899","#8b5cf6","#ef4444","#14b8a6"];
const avatarColor = (name = "") => {
  const sum = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};
function Avatar({ name = "?", size = 32 }) {
  const bg  = avatarColor(name);
  const ini = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${bg}18`, border: `2px solid ${bg}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: bg, fontWeight: 700, fontSize: size * 0.34, flexShrink: 0,
    }}>
      {ini}
    </div>
  );
}

// ── Multi-select Batch Dropdown ─────────────────────────────────────────────
function MultiSelectBatches({ batches, selected, onChange }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = batches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter(s => s !== id));
    else onChange([...selected, id]);
  };

  const selectedNames = batches
    .filter(b => selected.includes(b.id))
    .map(b => b.name);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      >
        <span className="flex-1 min-w-0">
          {selected.length === 0 ? (
            <span className="text-slate-300">Select batches…</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selectedNames.map(name => (
                <span key={name} className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {name}
                </span>
              ))}
            </div>
          )}
        </span>
        <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Search inside dropdown */}
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search batches…"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          {/* Select all / Clear */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-slate-50">
            <button
              type="button"
              onClick={() => onChange(filtered.map(b => b.id))}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-semibold text-slate-400 hover:text-rose-500"
            >
              Clear
            </button>
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400 text-center">No batches found</p>
            ) : (
              filtered.map(b => {
                const checked = selected.includes(b.id);
                return (
                  <label
                    key={b.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition ${
                      checked ? "bg-indigo-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(b.id)}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                    <span className={`text-sm font-medium ${checked ? "text-indigo-700" : "text-slate-700"}`}>
                      {b.name}
                    </span>
                    {checked && <span className="ml-auto text-indigo-500 text-xs">✓</span>}
                  </label>
                );
              })
            )}
          </div>

          {/* Footer count */}
          {selected.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400">
                <span className="font-bold text-indigo-600">{selected.length}</span> batch{selected.length !== 1 ? "es" : ""} selected
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BatchTeacherPage() {
  const [search,      setSearch]      = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [batches,     setBatches]     = useState([]);
  const [teachers,    setTeachers]    = useState([]);

  // ── Single mapping modal state
  const [showModal,  setShowModal]  = useState(false);
  const [singleForm, setSingleForm] = useState({ batch_id: "", teacher_id: "" });
  const [editId,     setEditId]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);

  // ── Bulk assign modal state (assign multiple batches to one teacher)
  const [showBulkModal,  setShowBulkModal]  = useState(false);
  const [bulkTeacherId,  setBulkTeacherId]  = useState("");
  const [bulkBatchIds,   setBulkBatchIds]   = useState([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: mappings, loading, currentPage, totalPages,
    totalItems, pageNumbers, hasPrev, hasNext, fetchData, goToPage,
  } = usePagination(MAPPING_URL, { itemsPerPage: 10 });

  // fetch mappings
  useEffect(() => {
    fetchData({
      page:   currentPage,
      search: debouncedSearch,
      ...(filterBatch && { batch_id: filterBatch }),
    });
  }, [currentPage, debouncedSearch, filterBatch]);

  // load dropdown data
  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, tRes] = await Promise.all([
          axios.get(`${BATCHES_URL}?limit=200`,  getAuthHeaders()),
          axios.get(`${TEACHERS_URL}?limit=200`, getAuthHeaders()),
        ]);
        const bd = bRes.data?.data ?? bRes.data;
        const td = tRes.data?.data ?? tRes.data;
        setBatches(bd.batches ?? bd.rows ?? bd.data ?? (Array.isArray(bd) ? bd : []));
        setTeachers(td.teachers ?? td.rows ?? td.data ?? (Array.isArray(td) ? td : []));
      } catch { toast.error("Failed to load batches or teachers"); }
    };
    load();
  }, []);

  const refresh = () => fetchData({
    page: currentPage, search: debouncedSearch,
    ...(filterBatch && { batch_id: filterBatch }),
  });

  // ── Helper lookups
  const getBatchName   = (id) => batches.find(b => String(b.id)  === String(id))?.name  ?? `Batch #${id}`;
  const getTeacherName = (id) => teachers.find(t => String(t.id) === String(id))?.name ?? `Teacher #${id}`;

  // ── Single CRUD ────────────────────────────────────────────────────────────
  const openCreate = () => { setSingleForm({ batch_id: "", teacher_id: "" }); setEditId(null); setShowModal(true); };
  const openEdit   = (m)  => {
    setSingleForm({ batch_id: String(m.batch_id), teacher_id: String(m.teacher_id) });
    setEditId(m.id); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setSingleForm({ batch_id: "", teacher_id: "" }); setEditId(null); };

  const handleSubmit = async () => {
    if (!singleForm.batch_id)   { toast.warning("Please select a batch");   return; }
    if (!singleForm.teacher_id) { toast.warning("Please select a teacher"); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await axios.put(`${MAPPING_URL}/${editId}`, singleForm, getAuthHeaders());
        toast.success("Mapping updated");
      } else {
        await axios.post(MAPPING_URL, singleForm, getAuthHeaders());
        toast.success("Teacher assigned to batch");
      }
      closeModal(); refresh();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      // friendly unique constraint message
      if (msg.toLowerCase().includes("unique") || err.response?.status === 409)
        toast.error("This teacher is already assigned to that batch");
      else toast.error(msg);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${MAPPING_URL}/${id}`, getAuthHeaders());
      toast.success("Mapping removed"); setDeleteId(null); refresh();
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
  };

  // ── Bulk assign ─────────────────────────────────────────────────────────────
  const openBulkModal  = () => { setBulkTeacherId(""); setBulkBatchIds([]); setShowBulkModal(true); };
  const closeBulkModal = () => { setShowBulkModal(false); setBulkTeacherId(""); setBulkBatchIds([]); };

  const handleBulkAssign = async () => {
    if (!bulkTeacherId)        { toast.warning("Please select a teacher"); return; }
    if (bulkBatchIds.length === 0) { toast.warning("Please select at least one batch"); return; }
    setBulkSubmitting(true);

    let success = 0, skipped = 0, failed = 0;
    for (const batch_id of bulkBatchIds) {
      try {
        await axios.post(MAPPING_URL, { batch_id, teacher_id: bulkTeacherId }, getAuthHeaders());
        success++;
      } catch (err) {
        if (err.response?.status === 409 || err.response?.data?.message?.toLowerCase().includes("unique"))
          skipped++;
        else failed++;
      }
    }

    if (success > 0) toast.success(`${success} batch${success !== 1 ? "es" : ""} assigned successfully`);
    if (skipped > 0) toast.info(`${skipped} already assigned — skipped`);
    if (failed  > 0) toast.error(`${failed} failed`);

    closeBulkModal(); refresh();
    setBulkSubmitting(false);
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const uniqueTeachers = new Set(mappings.map(m => m.teacher_id)).size;
  const uniqueBatches  = new Set(mappings.map(m => m.batch_id)).size;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Batch–Teacher Mapping</h1>
            <p className="text-sm text-slate-400 mt-0.5">Assign teachers to batches and manage assignments</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openBulkModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm transition">
              <span>🎯</span> Assign Multiple Batches
            </button>
            <button onClick={openCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">
              + Add Mapping
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: "🔗", label: "Total Mappings",    value: totalItems    },
            { icon: "👨‍🏫", label: "Teachers Assigned", value: uniqueTeachers },
            { icon: "📚", label: "Batches Covered",   value: uniqueBatches  },
            { icon: "📋", label: "This Page",         value: mappings.length },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0">{s.icon}</div>
              <div>
                <div className="text-xl font-black text-slate-900 leading-none">{loading ? "—" : s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
            placeholder="Search by teacher or batch name…"
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          <select
            value={filterBatch}
            onChange={(e) => { setFilterBatch(e.target.value); goToPage(1); }}
            className="sm:w-56 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            <option value="">All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
                  <div className="h-4 bg-slate-100 rounded w-36" />
                  <div className="h-6 bg-slate-100 rounded-lg w-28 ml-4" />
                  <div className="ml-auto flex gap-2">
                    <div className="h-8 w-16 bg-slate-100 rounded-xl" />
                    <div className="h-8 w-16 bg-slate-100 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : mappings.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <div className="text-4xl mb-3">🔗</div>
              <p className="font-semibold text-base text-slate-600">No mappings found</p>
              <p className="mt-1">
                {search || filterBatch
                  ? "Try clearing filters"
                  : <span>Click <button onClick={openCreate} className="text-indigo-600 font-semibold hover:underline">+ Add Mapping</button> to get started</span>
                }
              </p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-widest text-slate-400">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Teacher</div>
                <div className="col-span-4">Batch</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {mappings.map((m, i) => {
                  const tName = m.Teacher?.name ?? m.teacher?.name ?? getTeacherName(m.teacher_id);
                  const bName = m.Batch?.name   ?? m.batch?.name   ?? getBatchName(m.batch_id);
                  const tColor = avatarColor(tName);

                  return (
                    <div key={m.id} className="grid grid-cols-12 px-6 py-3.5 items-center hover:bg-slate-50 transition">
                      <div className="col-span-1 text-xs text-slate-400 font-mono">
                        {(currentPage - 1) * 10 + i + 1}
                      </div>

                      {/* Teacher */}
                      <div className="col-span-4 flex items-center gap-2.5">
                        <Avatar name={tName} size={32} />
                        <div>
                          <p className="text-sm font-semibold text-slate-800 leading-tight">{tName}</p>
                          <p className="text-xs text-slate-400">ID #{m.teacher_id}</p>
                        </div>
                      </div>

                      {/* Batch */}
                      <div className="col-span-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
                          style={{ background: `${tColor}10`, color: tColor, border: `1px solid ${tColor}25` }}>
                          <span>📚</span> {bName}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-3 flex justify-end gap-2">
                        <button onClick={() => openEdit(m)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition">
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(m.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition">
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
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
            Page {currentPage} of {totalPages} · {totalItems} total mappings
          </p>
        )}
      </div>

      {/* ── Single Add / Edit Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h2 className="text-lg font-black text-slate-900 mb-1">
              {editId ? "Edit Mapping" : "Add Mapping"}
            </h2>
            <p className="text-sm text-slate-400 mb-5">
              {editId ? "Update the batch–teacher assignment." : "Assign one teacher to one batch."}
            </p>

            {/* Teacher select */}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Teacher</label>
              <select value={singleForm.teacher_id}
                onChange={(e) => setSingleForm({ ...singleForm, teacher_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                <option value="">Select a teacher</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.User.name}</option>
                ))}
              </select>
            </div>

            {/* Batch select */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Batch</label>
              <select value={singleForm.batch_id}
                onChange={(e) => setSingleForm({ ...singleForm, batch_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                <option value="">Select a batch</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={closeModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition">
                {submitting ? "Saving..." : editId ? "Update" : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Assign Modal ───────────────────────────────────────────────── */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-lg font-black text-slate-900">Assign Multiple Batches</h2>
                <p className="text-sm text-slate-400 mt-1">Pick one teacher and select all batches to assign at once.</p>
              </div>
              <button onClick={closeBulkModal}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 flex items-center justify-center text-xs transition shrink-0 ml-4">
                ✕
              </button>
            </div>

            {/* Info banner */}
            <div className="mt-4 mb-5 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs flex items-start gap-2">
              <span className="text-base shrink-0">💡</span>
              <span>Already-assigned batches will be skipped automatically — no duplicates will be created.</span>
            </div>

            {/* Teacher select */}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Teacher <span className="text-rose-400">*</span>
              </label>
              <select value={bulkTeacherId} onChange={(e) => setBulkTeacherId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                <option value="">Select a teacher</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.User.name}</option>
                ))}
              </select>
            </div>

            {/* Multi-select batches */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Batches <span className="text-rose-400">*</span>
                {bulkBatchIds.length > 0 && (
                  <span className="ml-2 text-indigo-600 normal-case font-semibold">
                    ({bulkBatchIds.length} selected)
                  </span>
                )}
              </label>
              <MultiSelectBatches
                batches={batches}
                selected={bulkBatchIds}
                onChange={setBulkBatchIds}
              />
            </div>

            {/* Selected preview chips */}
            {bulkBatchIds.length > 0 && (
              <div className="mb-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Will be assigned</p>
                <div className="flex flex-wrap gap-1.5">
                  {bulkBatchIds.map(id => {
                    const name = getBatchName(id);
                    return (
                      <span key={id}
                        className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {name}
                        <button type="button"
                          onClick={() => setBulkBatchIds(prev => prev.filter(b => b !== id))}
                          className="text-slate-400 hover:text-rose-500 transition ml-0.5">
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button onClick={closeBulkModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition">
                Cancel
              </button>
              <button onClick={handleBulkAssign} disabled={bulkSubmitting}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition flex items-center gap-2">
                {bulkSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Assigning...
                  </>
                ) : (
                  `Assign ${bulkBatchIds.length || ""} Batch${bulkBatchIds.length !== 1 ? "es" : ""}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-200">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🔗</div>
            <h2 className="text-lg font-black text-slate-900 text-center mb-1">Remove Mapping?</h2>
            <p className="text-sm text-slate-400 text-center mb-6">
              The teacher will be unassigned from this batch. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white transition">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}