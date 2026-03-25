import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTheme } from "../Hooks/useTheame";
import { API_BASE_URL } from "../config/api";

const BASE = `${API_BASE_URL}/api`;

//Avatar
const COLORS = ["#0d9488","#0891b2","#7c3aed","#db2777","#d97706","#16a34a","#dc2626","#2563eb"];
const avatarColor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
};
const Avatar = ({ name = "?", size = 36 }) => {
  const bg = avatarColor(name);
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

//Validation
const emptyForm = { company_name: "", name: "", email: "", contact_number: "", password: "" };

const validate = (f, isEdit = false) => {
  const e = {};
  if (!f.company_name.trim())   e.company_name   = "Required";
  if (!f.name.trim())           e.name           = "Required";
  if (!f.email.trim())          e.email          = "Required";
  else if (!/\S+@\S+\.\S+/.test(f.email)) e.email = "Invalid email";
  if (!f.contact_number.trim()) e.contact_number = "Required";
  if (!isEdit) {
    if (!f.password?.trim())    e.password       = "Required";
    else if (f.password.length < 6) e.password   = "Min 6 chars";
  } else if (f.password && f.password.length > 0 && f.password.length < 6) {
    e.password = "Min 6 chars";
  }
  return e;
};

//Modal
function Modal({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.15)", animation: "admPopIn 0.2s ease", maxHeight: "92vh", overflow: "auto", border: "1px solid #e2e8f0" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: "#0f172a", margin: 0 }}>{title}</h2>
            {subtitle && <p style={{ color: "#94a3b8", fontSize: 12.5, marginTop: 3, margin: "4px 0 0" }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#64748b", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#64748b"; }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

//Add & Edit
function ClientForm({ initial, onSubmit, onCancel, submitLabel = "Save", loading, isEdit = false }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const handleSubmit = () => {
    const e = validate(form, isEdit);
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(form);
  };

  const inputStyle = (err) => ({
    width: "100%", padding: "10px 12px", background: err ? "#fef2f2" : "#f8fafc",
    color: "#0f172a", border: `1.5px solid ${err ? "#fca5a5" : "#e2e8f0"}`,
    borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13.5,
    outline: "none", boxSizing: "border-box", transition: "all 0.15s",
  });

  const fields = [
    { key: "company_name",   label: "Company Name",   icon: "🏢", placeholder: "e.g. Acme Corp",    type: "text"  },
    { key: "name",           label: "name", icon: "👤", placeholder: "Full name",         type: "text"  },
    { key: "email",          label: "Email",          icon: "✉️", placeholder: "email@company.com", type: "email" },
    { key: "contact_number", label: "Phone",          icon: "📞", placeholder: "+1 (555) 000-0000", type: "tel"   },
    { key: "password",       label: isEdit ? "Password (leave blank to keep)" : "Password", icon: "🔑", placeholder: isEdit ? "Leave blank to keep current" : "Min 6 characters", type: "password" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {fields.map(f => (
        <div key={f.key}>
          <label style={{ display: "flex", alignItems: "center", gap: 5, color: "#475569", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, marginBottom: 5, textTransform: "uppercase", fontFamily: "'Sora',sans-serif" }}>
            {f.icon} {f.label}
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={f.type === "password" ? (showPass ? "text" : "password") : f.type}
              placeholder={f.placeholder}
              value={form[f.key] || ""}
              onChange={e => set(f.key, e.target.value)}
              style={{ ...inputStyle(errors[f.key]), paddingRight: f.type === "password" ? 40 : 12 }}
              onFocus={e => { e.target.style.borderColor = "#0d9488"; e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.1)"; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.borderColor = errors[f.key] ? "#fca5a5" : "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = errors[f.key] ? "#fef2f2" : "#f8fafc"; }}
            />
            {f.type === "password" && (
              <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 13 }}>
                {showPass ? "🙈" : "👁️"}
              </button>
            )}
          </div>
          {errors[f.key] && <p style={{ color: "#ef4444", fontSize: 11.5, marginTop: 4 }}>⚠ {errors[f.key]}</p>}
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button onClick={onCancel} disabled={loading} style={{ flex: 1, padding: "10px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, color: "#64748b", fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: "10px", background: "linear-gradient(135deg,#0d9488,#0891b2)", border: "none", borderRadius: 8, color: "#fff", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13.5, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 3px 10px rgba(13,148,136,0.28)" }}>
          {loading ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
}

//View Modal 
function ViewModal({ open, onClose, client }) {
  const [showPass, setShowPass] = useState(false);
  useEffect(() => { if (!open) setShowPass(false); }, [open]);
  if (!client) return null;
  const color = avatarColor(client.name);
  const rows = [
    { label: "Company",        icon: "🏢", value: client.companyName },
    { label: "Contact Person", icon: "👤", value: client.name },
    { label: "Email",          icon: "✉️", value: client.email },
    { label: "Phone",          icon: "📞", value: client.contactNumber },
    { label: "Password",       icon: "🔑", value: showPass ? client.password : "••••••••", toggle: true },
    // { label: "Joined",         icon: "📅", value: client.createdAt ? new Date(client.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—" },
  ];
  return (
    <Modal open={open} onClose={onClose} title="Client Profile" subtitle="Full account details">
      <div style={{ background: `${color}0e`, border: `1.5px solid ${color}28`, borderRadius: 12, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={client.name} size={48} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{client.name}</div>
          <div style={{ color, fontSize: 13, marginTop: 2 }}>{client.company_name}</div>
        </div>
        <span style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>● Active</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map(r => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", padding: "9px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: 13, marginRight: 10, flexShrink: 0 }}>{r.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, marginBottom: 1 }}>{r.label}</div>
              <div style={{ color: "#1e293b", fontSize: 13 }}>{r.value}</div>
            </div>
            {r.toggle && (
              <button onClick={() => setShowPass(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 13 }}>
                {showPass ? "🙈" : "👁️"}
              </button>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}

//Delete Modal 
function DeleteModal({ open, onClose, onConfirm, clientName, loading }) {
  return (
    <Modal open={open} onClose={() => !loading && onClose()} title="Delete Client">
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", border: "2px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 24 }}>🗑️</div>
        <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
          Remove <strong style={{ color: "#0f172a" }}>{clientName}</strong> from the system?
        </p>
        <p style={{ color: "#94a3b8", fontSize: 12.5, marginTop: 4 }}>This cannot be undone.</p>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} disabled={loading} style={{ flex: 1, padding: "10px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, color: "#64748b", fontFamily: "'Sora',sans-serif", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: "10px", background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", borderRadius: 8, color: "#fff", fontFamily: "'Sora',sans-serif", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

//loading
const SkeletonRow = () => (
  <tr>
    {[220, 130, 170, 120, 90, 80].map((w, i) => (
      <td key={i} style={{ padding: "13px 18px" }}>
        <div style={{ height: 12, width: w, maxWidth: "100%", borderRadius: 6, background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "200% 100%", animation: "admShimmer 1.4s infinite" }} />
      </td>
    ))}
  </tr>
);

//Main Page
export default function AdminPage() {
  const { t } = useTheme();

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

  
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE}/admin/allclients`, {
        headers: { authorization: `Bearer ${token}` }
      });
      setClients(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);
  
  console.log("clients",clients);
  useEffect(() => { fetchClients(); }, [fetchClients]);
console.log(clients.data)
  //CREATE
  const handleAdd = async (form) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      console.log(token);
      await axios.post(`${BASE}/admin/create-client`,form, {
        headers: { authorization: `Bearer ${token}` }
      });
      toast.success(`${form.name} added successfully!`);
      setAddOpen(false);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add client");
    } finally {
      setSubmitting(false);
    }
  };
  console.log("editClient",editClient)

  //UPDATE
  const handleEdit = async (form) => {
    setSubmitting(true);
    try {
      
      const token = localStorage.getItem("token");
      const id = editClient.clientId || editClient.id;
      console.log(id)
      await axios.put(`${BASE}/admin/admin/client/${id}`, form, {
        headers: { authorization: `Bearer ${token}` }
      });
      toast.success(`${form.name} updated!`);
      setEditClient(null);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update client");
    } finally {
      setSubmitting(false);
    }
  };

  //DELETE
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const id = deleteTarget.clientId || deleteTarget.id;
      await axios.delete(`${BASE}/admin/admin/client/${id}`, {
         headers: { authorization: `Bearer ${token}` }
      });
      toast.success(`${deleteTarget.name} removed`);
      setDeleteTarget(null);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete client");
    } finally {
      setSubmitting(false);
    }
  };

  //Filter & Sort
  const q = search.toLowerCase();
  const filtered = [...clients]
    .filter(c => [c.company_name, c.name, c.email, c.contact_number].some(v => (v || "").toLowerCase().includes(q)))
    .sort((a, b) => {
      const va = (a[sortField] || "").toString();
      const vb = (b[sortField] || "").toString();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }) => (
    <span style={{ marginLeft: 4, color: sortField === field ? "#0d9488" : "#cbd5e1", fontSize: 10 }}>
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  const stats = [
    { icon: "👥", label: "Total Clients",  value: clients.length,                                 bg: "#f0fdfa", bdr: "#99f6e4" },
    { icon: "🏢", label: "Companies",      value: new Set(clients.map(c => c.company_name)).size, bg: "#f0f9ff", bdr: "#7dd3fc" },
    { icon: "✅", label: "Active",         value: clients.length,                                 bg: "#f0fdf4", bdr: "#86efac" },
    { icon: "🔍", label: "Search Results", value: filtered.length,                                bg: "#fffbeb", bdr: "#fde68a" },
  ];

  const cols = [
    { label: "Client",  key: "name" },
    { label: "Company", key: "companyName" },
    { label: "Email",   key: "email" },
    { label: "Phone",   key: null },
    // { label: "Joined",  key: "createdAt" },
    { label: "Actions", key: null },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes admPopIn   { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes admFadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes admShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .adm-row { transition: background 0.12s; }
        .adm-row:hover { background: #f0fdfa !important; }
        .adm-row:hover .adm-acts { opacity: 1 !important; }
        .adm-acts { opacity: 0; transition: opacity 0.15s; }
        .adm-stat { transition: transform 0.2s, box-shadow 0.2s; }
        .adm-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08) !important; }
      `}</style>

      <div className={`min-h-screen ${t?.bg || ""}`} style={{ fontFamily: "'DM Sans',sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12, animation: "admFadeUp 0.3s ease" }}>
            <div>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 21, color: "#0f172a", margin: "0 0 4px" }}>Client Management</h1>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Add, view, edit and remove client accounts.</p>
            </div>
            <button onClick={() => setAddOpen(true)} style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#0d9488,#0891b2)", border: "none", borderRadius: 10, padding: "10px 18px", color: "#fff", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13.5, cursor: "pointer", boxShadow: "0 3px 12px rgba(13,148,136,0.3)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(13,148,136,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(13,148,136,0.3)"; }}>
              ＋ Add Client
            </button>
          </div>

          {/* ── Stats ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginBottom: 20 }}>
            {stats.map((s, i) => (
              <div key={s.label} className="adm-stat" style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1.5px solid #f1f5f9", boxShadow: "0 2px 6px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 12, animation: `admFadeUp 0.35s ${i * 0.06}s ease both` }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, border: `1.5px solid ${s.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#0f172a", lineHeight: 1 }}>{loading ? "—" : s.value}</div>
                  <div style={{ color: "#94a3b8", fontSize: 11.5, marginTop: 3 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Table Card ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", animation: "admFadeUp 0.4s 0.08s ease both" }}>

            {/* Toolbar */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: "#0f172a" }}>All Clients</span>
                <span style={{ color: "#94a3b8", fontSize: 12, marginLeft: 8 }}>
                  {loading ? "Loading…" : `${filtered.length} of ${clients.length}${search ? ` · "${search}"` : ""}`}
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 13 }}>🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search clients…"
                  style={{ padding: "8px 32px 8px 32px", background: "#f8fafc", color: "#0f172a", border: "1.5px solid #e2e8f0", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: "none", width: 240, transition: "all 0.15s" }}
                  onFocus={e => { e.target.style.borderColor = "#0d9488"; e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.1)"; e.target.style.background = "#fff"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "#e2e8f0", border: "none", borderRadius: "50%", width: 16, height: 16, cursor: "pointer", color: "#64748b", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                )}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {cols.map(col => (
                      <th key={col.label} onClick={() => col.key && handleSort(col.key)}
                        style={{ padding: "11px 18px", textAlign: "left", color: "#64748b", fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", whiteSpace: "nowrap", cursor: col.key ? "pointer" : "default", userSelect: "none" }}
                        onMouseEnter={e => { if (col.key) e.currentTarget.style.color = "#0d9488"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; }}>
                        {col.label}{col.key && <SortIcon field={col.key} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "56px 20px", textAlign: "center" }}>
                        <div style={{ fontSize: 40, marginBottom: 10 }}>{search ? "🔍" : "👥"}</div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, color: "#334155", fontSize: 14 }}>
                          {search ? `No results for "${search}"` : "No clients yet"}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 5 }}>
                          {search ? "Try a different search term" : 'Click "+ Add Client" to get started'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, i) => {
                      const color = avatarColor(c.name);
                      return (
                        <tr key={c._id || c.id} className="adm-row" style={{ borderBottom: "1px solid #f8fafc", background: "#fff", animation: `admFadeUp 0.28s ${i * 0.03}s ease both` }}>
                          <td style={{ padding: "12px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <Avatar name={c.name} size={34} />
                              <div>
                                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{c.name}</div>
                                <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 1 }}>#{(c._id || c.id || "").toString().slice(-6)}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 18px" }}>
                            <span style={{ background: `${color}0e`, border: `1px solid ${color}2e`, color, borderRadius: 6, padding: "3px 9px", fontSize: 12, fontWeight: 600, fontFamily: "'Sora',sans-serif", whiteSpace: "nowrap" }}>
                              🏢 {c.companyName}
                            </span>
                          </td>
                          <td style={{ padding: "12px 18px", color: "#475569", fontSize: 13 }}>{c.email}</td>
                          <td style={{ padding: "12px 18px", color: "#64748b", fontSize: 13, whiteSpace: "nowrap" }}>{c.contactNumber}</td>
                          {/* <td style={{ padding: "12px 18px", color: "#94a3b8", fontSize: 12.5 }}>
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </td> */}
                          <td style={{ padding: "12px 18px" }}>
                            <div className="adm-acts" style={{ display: "flex", gap: 5 }}>
                              {[
                                { label: "View",   icon: "👁️", bg: "#f0f9ff", bdr: "#7dd3fc", clr: "#0369a1", fn: () => setViewClient(c) },
                                { label: "Edit",   icon: "✏️", bg: "#fffbeb", bdr: "#fde68a", clr: "#b45309", fn: () => setEditClient(c) },
                                { label: "Delete", icon: "🗑️", bg: "#fef2f2", bdr: "#fecaca", clr: "#b91c1c", fn: () => setDeleteTarget(c) },
                              ].map(btn => (
                                <button key={btn.label} onClick={btn.fn} title={btn.label}
                                  style={{ width: 30, height: 30, borderRadius: 7, background: btn.bg, border: `1px solid ${btn.bdr}`, color: btn.clr, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, transition: "transform 0.12s" }}
                                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12)"; }}
                                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
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
            <div style={{ padding: "11px 20px", borderTop: "1px solid #f1f5f9", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: 12 }}>
                {!loading && <>Showing <strong style={{ color: "#0d9488" }}>{filtered.length}</strong> of <strong style={{ color: "#0d9488" }}>{clients.length}</strong> clients</>}
              </span>
              <span style={{ color: "#cbd5e1", fontSize: 11.5 }}>Hover a row to see actions</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Modals ── */}
      <Modal open={addOpen} onClose={() => !submitting && setAddOpen(false)} title="Add New Client" subtitle="Fill in the details below">
        <ClientForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} submitLabel="Add Client" loading={submitting} isEdit={false} />
      </Modal>

      <Modal open={!!editClient} onClose={() => !submitting && setEditClient(null)} title="Edit Client" subtitle={editClient?.name}>
        {editClient && (
          <ClientForm
            key={editClient._id || editClient.id}
            initial={{ company_name: editClient.companyName, name: editClient.name, email: editClient.email, contact_number: editClient.contactNumber, password: ""}}
            onSubmit={handleEdit}
            onCancel={() => setEditClient(null)}
            submitLabel="Save Changes"
            loading={submitting}
            isEdit={true}
          />
        )}
      </Modal>

      <ViewModal open={!!viewClient} onClose={() => setViewClient(null)} client={viewClient} />

      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        clientName={deleteTarget?.name}
        loading={submitting}
      />
    </>
  );
}