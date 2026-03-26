"use client";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../config/api";

const BASE = `${API_BASE_URL}/api`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// ── Avatar ────────────────────────────────────────────────────────────────────
const COLORS = ["#0d9488","#0891b2","#7c3aed","#db2777","#d97706","#16a34a","#dc2626","#2563eb"];
const avatarColor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
};
const Avatar = ({ name = "?", size = 36 }) => {
  const bg       = avatarColor(name);
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${bg}18`, border: `2px solid ${bg}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: bg, fontWeight: 700, fontSize: size * 0.33, flexShrink: 0,
    }}>{initials}</div>
  );
};

// ── Validation ────────────────────────────────────────────────────────────────
const emptyForm = { company_name: "", name: "", email: "", contact_number: "", password: "" };

const validate = (f, isEdit = false) => {
  const e = {};
  if (!f.company_name.trim())   e.company_name   = "Required";
  if (!f.name.trim())           e.name           = "Required";
  if (!f.email.trim())          e.email          = "Required";
  else if (!/\S+@\S+\.\S+/.test(f.email)) e.email = "Invalid email";
  if (!f.contact_number.trim()) e.contact_number = "Required";
  if (!isEdit) {
    if (!f.password?.trim())           e.password = "Required";
    else if (f.password.length < 6)    e.password = "Min 6 chars";
  } else if (f.password && f.password.length > 0 && f.password.length < 6) {
    e.password = "Min 6 chars";
  }
  return e;
};

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full border border-slate-200 overflow-auto"
        style={{ maxWidth: 480, maxHeight: "92vh", boxShadow: "0 24px 60px rgba(0,0,0,0.15)", animation: "popIn 0.2s ease" }}
      >
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-base text-slate-900" style={{ fontFamily: "'Sora',sans-serif" }}>{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-xs transition-colors shrink-0"
          >✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Client Form (Add & Edit) ──────────────────────────────────────────────────
function ClientForm({ initial, onSubmit, onCancel, submitLabel = "Save", loading, isEdit = false }) {
  const [form,     setForm]     = useState(initial || emptyForm);
  const [errors,   setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleSubmit = () => {
    const e = validate(form, isEdit);
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(form);
  };

  const fields = [
    { key: "company_name",   label: "Company Name", icon: "🏢", placeholder: "e.g. Acme Corp",          type: "text"     },
    { key: "name",           label: "Name",         icon: "👤", placeholder: "Full name",               type: "text"     },
    { key: "email",          label: "Email",        icon: "✉️", placeholder: "email@company.com",       type: "email"    },
    { key: "contact_number", label: "Phone",        icon: "📞", placeholder: "+1 (555) 000-0000",       type: "tel"      },
    { key: "password",       label: isEdit ? "Password (leave blank to keep)" : "Password",
                             icon: "🔑", placeholder: isEdit ? "Leave blank to keep current" : "Min 6 characters",
                             type: "password" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
            {f.icon} {f.label}
          </label>
          <div className="relative">
            <input
              type={f.type === "password" ? (showPass ? "text" : "password") : f.type}
              placeholder={f.placeholder}
              value={form[f.key] || ""}
              onChange={(e) => set(f.key, e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 transition ${
                errors[f.key]
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-slate-50 focus:bg-white"
              } ${f.type === "password" ? "pr-10" : ""}`}
            />
            {f.type === "password" && (
              <button
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            )}
          </div>
          {errors[f.key] && (
            <p className="text-red-500 text-xs mt-1">⚠ {errors[f.key]}</p>
          )}
        </div>
      ))}

      <div className="flex gap-3 mt-1">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-[2] py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 transition"
          style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)", boxShadow: "0 3px 10px rgba(13,148,136,0.28)" }}
        >
          {loading ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ open, onClose, client }) {
  const [showPass, setShowPass] = useState(false);
  useEffect(() => { if (!open) setShowPass(false); }, [open]);
  if (!client) return null;

  const color = avatarColor(client.name);
  const rows = [
    { label: "Company",        icon: "🏢", value: client.companyName        },
    { label: "Contact Person", icon: "👤", value: client.name               },
    { label: "Email",          icon: "✉️", value: client.email              },
    { label: "Phone",          icon: "📞", value: client.contactNumber      },
    { label: "Password",       icon: "🔑", value: showPass ? client.password : "••••••••", toggle: true },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Client Profile" subtitle="Full account details">
      <div className="rounded-xl p-4 mb-4 flex items-center gap-3"
        style={{ background: `${color}0e`, border: `1.5px solid ${color}28` }}>
        <Avatar name={client.name} size={48} />
        <div className="flex-1">
          <div className="font-bold text-slate-900 text-sm">{client.name}</div>
          <div className="text-xs mt-0.5" style={{ color }}>{client.company_name}</div>
        </div>
        <span className="bg-green-50 border border-green-200 text-green-700 rounded-full px-3 py-1 text-xs font-semibold">● Active</span>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-sm mr-3 shrink-0">{r.icon}</span>
            <div className="flex-1">
              <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-0.5">{r.label}</div>
              <div className="text-sm text-slate-800">{r.value}</div>
            </div>
            {r.toggle && (
              <button onClick={() => setShowPass((s) => !s)} className="text-slate-400 text-sm ml-2">
                {showPass ? "🙈" : "👁️"}
              </button>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ open, onClose, onConfirm, clientName, loading }) {
  return (
    <Modal open={open} onClose={() => !loading && onClose()} title="Delete Client">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
        <p className="text-slate-600 text-sm leading-relaxed">
          Remove <strong className="text-slate-900">{clientName}</strong> from the system?
        </p>
        <p className="text-slate-400 text-xs mt-1">This cannot be undone.</p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-60 transition"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}
          >
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[220, 130, 170, 120, 90].map((w, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className="h-3 rounded animate-pulse bg-slate-100" style={{ width: w, maxWidth: "100%" }} />
        </td>
      ))}
    </tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [clients,      setClients]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [sortField,    setSortField]    = useState("createdAt");
  const [sortDir,      setSortDir]      = useState("desc");
  const [addOpen,      setAddOpen]      = useState(false);
  const [editClient,   setEditClient]   = useState(null);
  const [viewClient,   setViewClient]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/admin/allclients`, getAuthHeaders());
      setClients(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // ── Create ────────────────────────────────────────────────────────────────
  const handleAdd = async (form) => {
    setSubmitting(true);
    try {
      await axios.post(`${BASE}/admin/create-client`, form, getAuthHeaders());
      toast.success(`${form.name} added successfully!`);
      setAddOpen(false);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add client");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const handleEdit = async (form) => {
    setSubmitting(true);
    try {
      const id = editClient.clientId || editClient.id;
      await axios.put(`${BASE}/admin/admin/client/${id}`, form, getAuthHeaders());
      toast.success(`${form.name} updated!`);
      setEditClient(null);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update client");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const id = deleteTarget.clientId || deleteTarget.id;
      await axios.delete(`${BASE}/admin/admin/client/${id}`, getAuthHeaders());
      toast.success(`${deleteTarget.name} removed`);
      setDeleteTarget(null);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete client");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Filter & Sort ──────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filtered = [...clients]
    .filter((c) =>
      [c.company_name, c.name, c.email, c.contact_number].some((v) =>
        (v || "").toLowerCase().includes(q)
      )
    )
    .sort((a, b) => {
      const va = (a[sortField] || "").toString();
      const vb = (b[sortField] || "").toString();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 text-xs" style={{ color: sortField === field ? "#0d9488" : "#cbd5e1" }}>
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  const statCards = [
    { icon: "👥", label: "Total Clients",  value: clients.length,                                  bg: "#f0fdfa", bdr: "#99f6e4" },
    { icon: "🏢", label: "Companies",      value: new Set(clients.map((c) => c.company_name)).size, bg: "#f0f9ff", bdr: "#7dd3fc" },
    { icon: "✅", label: "Active",         value: clients.length,                                  bg: "#f0fdf4", bdr: "#86efac" },
    { icon: "🔍", label: "Search Results", value: filtered.length,                                 bg: "#fffbeb", bdr: "#fde68a" },
  ];

  const cols = [
    { label: "Client",  key: "name"        },
    { label: "Company", key: "companyName" },
    { label: "Email",   key: "email"       },
    { label: "Phone",   key: null          },
    { label: "Actions", key: null          },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        @keyframes popIn    { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .adm-row { transition: background 0.12s; }
        .adm-row:hover { background: #f0fdfa !important; }
        .adm-row:hover .adm-acts { opacity: 1 !important; }
        .adm-acts { opacity: 0; transition: opacity 0.15s; }
        .adm-stat { transition: transform 0.2s, box-shadow 0.2s; }
        .adm-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08) !important; }
      `}</style>

      <div className="min-h-screen bg-slate-50 p-6">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3" style={{ animation: "fadeUp 0.3s ease" }}>
            <div>
              <h1 className="font-extrabold text-xl text-slate-900 mb-1" style={{ fontFamily: "'Sora',sans-serif" }}>
                Client Management
              </h1>
              <p className="text-slate-500 text-sm">Add, view, edit and remove client accounts.</p>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)", boxShadow: "0 3px 12px rgba(13,148,136,0.3)", fontFamily: "'Sora',sans-serif" }}
            >
              ＋ Add Client
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>
            {statCards.map((s, i) => (
              <div key={s.label} className="adm-stat bg-white rounded-xl px-4 py-3.5 border border-slate-100 shadow-sm flex items-center gap-3"
                style={{ animation: `fadeUp 0.35s ${i * 0.06}s ease both` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: s.bg, border: `1.5px solid ${s.bdr}` }}>
                  {s.icon}
                </div>
                <div>
                  <div className="font-extrabold text-2xl text-slate-900 leading-none" style={{ fontFamily: "'Sora',sans-serif" }}>
                    {loading ? "—" : s.value}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm" style={{ animation: "fadeUp 0.4s 0.08s ease both" }}>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 flex-wrap">
              <div>
                <span className="font-bold text-sm text-slate-900" style={{ fontFamily: "'Sora',sans-serif" }}>All Clients</span>
                <span className="text-slate-400 text-xs ml-2">
                  {loading ? "Loading…" : `${filtered.length} of ${clients.length}${search ? ` · "${search}"` : ""}`}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search clients…"
                  className="pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition w-56"
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-xs flex items-center justify-center">
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 680 }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {cols.map((col) => (
                      <th
                        key={col.label}
                        onClick={() => col.key && handleSort(col.key)}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap select-none"
                        style={{ cursor: col.key ? "pointer" : "default", fontFamily: "'Sora',sans-serif" }}
                      >
                        {col.label}
                        {col.key && <SortIcon field={col.key} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-14 text-center">
                        <div className="text-4xl mb-3">{search ? "🔍" : "👥"}</div>
                        <div className="font-bold text-slate-700 text-sm" style={{ fontFamily: "'Sora',sans-serif" }}>
                          {search ? `No results for "${search}"` : "No clients yet"}
                        </div>
                        <div className="text-slate-400 text-xs mt-1">
                          {search ? "Try a different search term" : 'Click "+ Add Client" to get started'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, i) => {
                      const color = avatarColor(c.name);
                      return (
                        <tr key={c._id || c.id} className="adm-row border-b border-slate-50 bg-white"
                          style={{ animation: `fadeUp 0.28s ${i * 0.03}s ease both` }}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={c.name} size={34} />
                              <div>
                                <div className="font-semibold text-sm text-slate-800" style={{ fontFamily: "'Sora',sans-serif" }}>{c.name}</div>
                                <div className="text-xs text-slate-400 mt-0.5">#{(c._id || c.id || "").toString().slice(-6)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md"
                              style={{ background: `${color}0e`, border: `1px solid ${color}2e`, color, fontFamily: "'Sora',sans-serif" }}>
                              🏢 {c.companyName}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-500 text-sm">{c.email}</td>
                          <td className="px-5 py-3 text-slate-500 text-sm whitespace-nowrap">{c.contactNumber}</td>
                          <td className="px-5 py-3">
                            <div className="adm-acts flex gap-1.5">
                              {[
                                { label: "View",   icon: "👁️", bg: "#f0f9ff", bdr: "#7dd3fc", clr: "#0369a1", fn: () => setViewClient(c)   },
                                { label: "Edit",   icon: "✏️", bg: "#fffbeb", bdr: "#fde68a", clr: "#b45309", fn: () => setEditClient(c)   },
                                { label: "Delete", icon: "🗑️", bg: "#fef2f2", bdr: "#fecaca", clr: "#b91c1c", fn: () => setDeleteTarget(c) },
                              ].map((btn) => (
                                <button
                                  key={btn.label}
                                  onClick={btn.fn}
                                  title={btn.label}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-transform hover:scale-110"
                                  style={{ background: btn.bg, border: `1px solid ${btn.bdr}`, color: btn.clr }}
                                >
                                  {btn.icon}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-400">
                {!loading && (
                  <>Showing <strong className="text-teal-600">{filtered.length}</strong> of <strong className="text-teal-600">{clients.length}</strong> clients</>
                )}
              </span>
              <span className="text-xs text-slate-300">Hover a row to see actions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal open={addOpen} onClose={() => !submitting && setAddOpen(false)} title="Add New Client" subtitle="Fill in the details below">
        <ClientForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} submitLabel="Add Client" loading={submitting} isEdit={false} />
      </Modal>

      <Modal open={!!editClient} onClose={() => !submitting && setEditClient(null)} title="Edit Client" subtitle={editClient?.name}>
        {editClient && (
          <ClientForm
            key={editClient._id || editClient.id}
            initial={{ company_name: editClient.companyName, name: editClient.name, email: editClient.email, contact_number: editClient.contactNumber, password: "" }}
            onSubmit={handleEdit}
            onCancel={() => setEditClient(null)}
            submitLabel="Save Changes"
            loading={submitting}
            isEdit={true}
          />
        )}
      </Modal>

      <ViewModal   open={!!viewClient}   onClose={() => setViewClient(null)}   client={viewClient} />
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} clientName={deleteTarget?.name} loading={submitting} />
    </>
  );
}