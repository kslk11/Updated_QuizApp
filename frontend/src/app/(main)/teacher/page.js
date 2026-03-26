"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config/api";
import usePagination from "../../../hooks/usePagination";
import useDebounce from "../../../hooks/useDebounce";

// ─── Constants ────────────────────────────────────────────────────────────────
const API_URL = `${API_BASE_URL}/api/teachers`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "English Literature", "History", "Geography", "Computer Science",
  "Art & Design", "Physical Education", "Music", "Economics", "Other",
];

const EMPTY_FORM = {
  name: "", email: "", password: "", age: "",
  specialization: "", experience_years: "", bio: "",
};

// ─── Shared style objects (defined outside component) ────────────────────────
const inputSt = {
  width: "100%", padding: "9px 13px", borderRadius: "9px",
  border: "1.5px solid #e2e8f0", fontSize: "13.5px", color: "#111827",
  outline: "none", fontFamily: "'DM Sans', sans-serif", background: "#fff",
  transition: "border-color 0.18s",
};
const labelSt = {
  display: "block", fontSize: "11px", fontWeight: 600,
  letterSpacing: "0.07em", textTransform: "uppercase",
  color: "#6b7280", marginBottom: "5px",
};
const errSt = {
  display: "block", fontSize: "11px", color: "#ef4444", marginTop: "3px",
};
const pgBtnSt = {
  minWidth: "30px", height: "30px", padding: "0 7px", borderRadius: "8px",
  border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151",
  fontSize: "12.5px", fontWeight: 500, display: "flex",
  alignItems: "center", justifyContent: "center", transition: "all 0.14s",
  fontFamily: "'DM Sans',sans-serif",
};
const actBtnSt = (bg, color) => ({
  width: "30px", height: "30px", borderRadius: "7px", border: "none",
  background: bg, color, cursor: "pointer", display: "flex",
  alignItems: "center", justifyContent: "center", transition: "opacity 0.14s",
});

// ─── Reusable field components (OUTSIDE main component to prevent remount) ───
function TextField({ label, name, type = "text", placeholder, value, onChange, error }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={labelSt}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} style={inputSt} autoComplete="off" />
      {error && <span style={errSt}>{error}</span>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, error }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={labelSt}>{label}</label>
      <select name={name} value={value} onChange={onChange}
        style={{ ...inputSt, color: value ? "#111827" : "#9ca3af" }}>
        <option value="">Select subject…</option>
        {SUBJECTS.map((s) => (
          <option key={s} value={s} style={{ color: "#111827" }}>{s}</option>
        ))}
      </select>
      {error && <span style={errSt}>{error}</span>}
    </div>
  );
}

function TextareaField({ label, name, placeholder, value, onChange, error }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={labelSt}>{label}</label>
      <textarea name={name} value={value} onChange={onChange}
        placeholder={placeholder} rows={3}
        style={{ ...inputSt, resize: "vertical", minHeight: "78px" }} />
      {error && <span style={errSt}>{error}</span>}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function SortIcon({ active, order }) {
  if (!active) return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
      <path d="M7 8l5-5 5 5M7 16l5 5 5-5" />
    </svg>
  );
  return order === "asc" ? (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><path d="M7 14l5-5 5 5" /></svg>
  ) : (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><path d="M7 10l5 5 5-5" /></svg>
  );
}
const EyeIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const TrashIcon = ({ size = 13, color = "currentColor" }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
    <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeachersPage() {

  // ── same pattern as courses page ──────────────────────────────────────────
  const [search,    setSearch]    = useState("");
  const [sortBy,    setSortBy]    = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: teachers, loading, error,
    currentPage, totalPages, totalItems,
    pageNumbers, hasPrev, hasNext,
    fetchData, goToPage,
  } = usePagination(API_URL, { itemsPerPage: 5 });

  // ── fetch on page / search / sort change — exactly like courses ────────────
  useEffect(() => {
    fetchData({ page: currentPage, search: debouncedSearch, sortBy, sortOrder });
  }, [currentPage, debouncedSearch, sortBy, sortOrder]);

  const refresh = () =>
    fetchData({ page: currentPage, search: debouncedSearch, sortBy, sortOrder });

  // ── focus search when opened ───────────────────────────────────────────────
  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // ── form state ─────────────────────────────────────────────────────────────
  const [form,          setForm]          = useState({ ...EMPTY_FORM });
  const [editingId,     setEditingId]     = useState(null);
  const [showModal,     setShowModal]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewTeacher,   setViewTeacher]   = useState(null);
  const [formErrors,    setFormErrors]    = useState({});
  const [toastMsg,      setToastMsg]      = useState(null);
  const [submitting,    setSubmitting]    = useState(false);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const showToast = (msg, type = "success") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSort = (col) => {
    if (sortBy === col) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortOrder("asc"); }
    goToPage(1);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name             = "Name is required";
    if (!form.email.trim())      e.email            = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    if (!editingId && !form.password.trim()) e.password = "Password is required";
    if (!form.age || +form.age < 18 || +form.age > 100) e.age = "Age must be 18–100";
    if (!form.specialization)    e.specialization   = "Subject is required";
    if (form.experience_years === "" || +form.experience_years < 0)
                                 e.experience_years = "Experience is required";
    if (!form.bio.trim())        e.bio              = "Bio is required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setEditingId(null); setFormErrors({}); setShowModal(true); };
  const openEdit   = (t)  => { setForm({ ...t, password: "" }); setEditingId(t.id); setFormErrors({}); setShowModal(true); };
  const closeModal = ()   => { setShowModal(false); setFormErrors({}); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form, getAuthHeaders());
        showToast("Teacher updated successfully");
      } else {
        await axios.post(API_URL, form, getAuthHeaders());
        showToast("Teacher added successfully");
      }
      closeModal();
      refresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      setDeleteConfirm(null);
      showToast("Teacher removed", "error");
      refresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  const getAvatarColors = (seed) => ({
    bg:   `hsl(${(seed * 53) % 360}, 55%, 91%)`,
    text: `hsl(${(seed * 53) % 360}, 50%, 34%)`,
  });

  const COLUMNS = [
    { label: "#",          col: null              },
    { label: "Teacher",    col: "name"            },
    { label: "Subject",    col: "specialization"  },
    { label: "Experience", col: "experience_years"},
    { label: "Age",        col: "age"             },
    { label: "Actions",    col: null              },
  ];

  return (
    <div style={{ padding: "30px 32px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::placeholder { color: #c4c9d4; }
        .tr-row:hover       { background: #f0f4ff !important; }
        .th-sort:hover      { background: #f1f5f9 !important; cursor: pointer; }
        .btn-primary:hover  { opacity: 0.88; transform: translateY(-1px); }
        .act-btn:hover      { opacity: 0.68; }
        .pg-btn:hover:not(:disabled) { background: #eff6ff !important; color: #3b82f6 !important; border-color: #bfdbfe !important; }
        input:focus, select:focus, textarea:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        @keyframes slideUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes toastUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer  { 0%,100%{opacity:1} 50%{opacity:.4} }
        .modal-backdrop { animation: fadeIn 0.18s ease; }
        .modal-card     { animation: slideUp 0.22s ease; }
        .toast-msg      { animation: toastUp 0.26s ease; }
        .skeleton-row   { animation: shimmer 1.4s ease-in-out infinite; }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"22px", gap:"12px", flexWrap:"wrap" }}>
        <div>
          <h1 style={{ margin:0, fontSize:"21px", fontWeight:700, color:"#0f172a", fontFamily:"'DM Serif Display',serif", letterSpacing:"-0.02em" }}>Teachers</h1>
          <p style={{ margin:"2px 0 0", fontSize:"12.5px", color:"#94a3b8" }}>
            {totalItems} teacher{totalItems !== 1 ? "s" : ""} registered
          </p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
          {/* Expandable search */}
          <div style={{ display:"flex", alignItems:"center", background:"#fff", border:`1.5px solid ${searchOpen?"#3b82f6":"#e2e8f0"}`, borderRadius:"10px", overflow:"hidden", height:"38px", width:searchOpen?"230px":"38px", transition:"width 0.28s ease, border-color 0.2s ease" }}>
            <button type="button"
              onClick={() => { setSearchOpen(o => !o); if (searchOpen) { setSearch(""); goToPage(1); } }}
              style={{ flexShrink:0, width:"38px", height:"38px", border:"none", background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:searchOpen?"#3b82f6":"#64748b" }}>
              {searchOpen
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
              }
            </button>
            <input ref={searchRef} type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
              placeholder="Search teachers…"
              style={{ border:"none", outline:"none", fontSize:"13px", color:"#111827", width:"100%", paddingRight:"10px", background:"transparent", opacity:searchOpen?1:0, pointerEvents:searchOpen?"auto":"none", fontFamily:"'DM Sans',sans-serif" }}
            />
          </div>

          {/* Sort */}
          {/* <select value={`${sortBy}__${sortOrder}`}
            onChange={(e) => { const [col, order] = e.target.value.split("__"); setSortBy(col); setSortOrder(order); goToPage(1); }}
            style={{ height:"38px", padding:"0 12px", borderRadius:"10px", border:"1.5px solid #e2e8f0", fontSize:"13px", color:"#374151", background:"#fff", cursor:"pointer", outline:"none", fontFamily:"'DM Sans',sans-serif" }}>
            <option value="__asc">Sort by…</option>
            <option value="name__asc">Name A → Z</option>
            <option value="name__desc">Name Z → A</option>
            <option value="age__asc">Age ↑</option>
            <option value="age__desc">Age ↓</option>
            <option value="experience_years__asc">Experience ↑</option>
            <option value="experience_years__desc">Experience ↓</option>
          </select> */}

          {/* Add button */}
          <button type="button" className="btn-primary" onClick={openCreate}
            style={{ height:"38px", padding:"0 16px", borderRadius:"10px", border:"none", background:"linear-gradient(135deg,#3b82f6,#6366f1)", color:"#fff", fontSize:"13px", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", transition:"all 0.2s", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
            Add Teacher
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"13px", marginBottom:"22px" }}>
        {[
          { label:"Total Teachers", value:totalItems, icon:"🧑‍🏫", color:"#3b82f6" },
          { label:"Avg Experience", value:teachers.length ? Math.round(teachers.reduce((s,t)=>s+ +t.experience_years,0)/teachers.length)+" yrs" : "—", icon:"🏅", color:"#10b981" },
          { label:"Subjects",       value:new Set(teachers.map(t=>t.specialization)).size, icon:"📚", color:"#f59e0b" },
          { label:"Page",           value:`${currentPage} / ${totalPages}`, icon:"📄", color:"#8b5cf6" },
        ].map((s) => (
          <div key={s.label} style={{ background:"#fff", borderRadius:"12px", padding:"16px 18px", border:"1px solid #e8ecf4" }}>
            <div style={{ fontSize:"20px", marginBottom:"5px" }}>{s.icon}</div>
            <div style={{ fontSize:"20px", fontWeight:700, color:s.color, fontFamily:"'DM Serif Display',serif" }}>{s.value}</div>
            <div style={{ fontSize:"11px", color:"#94a3b8", fontWeight:500, marginTop:"1px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ background:"#fff", borderRadius:"14px", border:"1px solid #e8ecf4", overflow:"hidden" }}>
        {error && (
          <div style={{ padding:"14px 22px", background:"#fef2f2", borderBottom:"1px solid #fecaca", color:"#dc2626", fontSize:"13px", display:"flex", alignItems:"center", gap:"7px" }}>
            ⚠️ {error}
          </div>
        )}
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#f8fafc", borderBottom:"1px solid #e8ecf4" }}>
              {COLUMNS.map(({ label, col }) => (
                <th key={label} className={col ? "th-sort" : ""}
                  onClick={() => col && handleSort(col)}
                  style={{ padding:"12px 18px", textAlign:"left", fontSize:"10.5px", fontWeight:600, color:sortBy===col?"#3b82f6":"#6b7280", letterSpacing:"0.07em", textTransform:"uppercase", userSelect:"none", transition:"background 0.15s" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:"4px" }}>
                    {label}
                    {col && <SortIcon active={sortBy===col} order={sortOrder} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} style={{ borderBottom:"1px solid #f1f5f9" }}>
                  {[18,220,110,70,45,90].map((w,j) => (
                    <td key={j} style={{ padding:"15px 18px" }}>
                      <div className="skeleton-row" style={{ height:"13px", borderRadius:"6px", background:"#f1f5f9", width:`${w}px` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding:"64px", textAlign:"center", color:"#94a3b8", fontSize:"14px" }}>
                  <div style={{ fontSize:"36px", marginBottom:"10px" }}>🔍</div>
                  No teachers found{search ? ` for "${search}"` : ""}
                </td>
              </tr>
            ) : (
              teachers.map((t, i) => {
                const av = getAvatarColors(t.id ?? i + 1);
                return (
                  <tr key={t.id ?? i} className="tr-row" style={{ borderBottom:"1px solid #f1f5f9", transition:"background 0.12s" }}>
                    <td style={{ padding:"14px 18px", fontSize:"12px", color:"#94a3b8", fontWeight:600 }}>
                      {String((currentPage - 1) * 5 + i + 1).padStart(2, "0")}
                    </td>
                    <td style={{ padding:"14px 18px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                        <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:av.bg, color:av.text, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:700, flexShrink:0 }}>
                          {t.name?.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize:"13.5px", fontWeight:600, color:"#0f172a" }}>{t.name}</div>
                          <div style={{ fontSize:"12px", color:"#94a3b8" }}>{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"14px 18px" }}>
                      <span style={{ background:"#eff6ff", color:"#3b82f6", fontSize:"11.5px", fontWeight:600, padding:"3px 10px", borderRadius:"20px", whiteSpace:"nowrap" }}>
                        {t.specialization}
                      </span>
                    </td>
                    <td style={{ padding:"14px 18px", fontSize:"13.5px", color:"#374151", fontWeight:500 }}>{t.experience_years} yrs</td>
                    <td style={{ padding:"14px 18px", fontSize:"13.5px", color:"#374151" }}>{t.age}</td>
                    <td style={{ padding:"14px 18px" }}>
                      <div style={{ display:"flex", gap:"6px" }}>
                        <button type="button" className="act-btn" onClick={() => setViewTeacher(t)}  title="View"   style={actBtnSt("#f0fdf4","#16a34a")}><EyeIcon /></button>
                        <button type="button" className="act-btn" onClick={() => openEdit(t)}         title="Edit"   style={actBtnSt("#eff6ff","#3b82f6")}><EditIcon /></button>
                        <button type="button" className="act-btn" onClick={() => setDeleteConfirm(t)} title="Delete" style={actBtnSt("#fef2f2","#ef4444")}><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div style={{ padding:"14px 22px", borderTop:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:"12.5px", color:"#64748b" }}>
              Showing <b style={{ color:"#0f172a" }}>{(currentPage-1)*5+1}–{Math.min(currentPage*6,totalItems)}</b> of <b style={{ color:"#0f172a" }}>{totalItems}</b>
            </span>
            <div style={{ display:"flex", gap:"5px", alignItems:"center" }}>
              <button type="button" className="pg-btn" disabled={!hasPrev} onClick={() => goToPage(currentPage-1)}
                style={{ ...pgBtnSt, opacity:hasPrev?1:0.35, cursor:hasPrev?"pointer":"default" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" d="M15 18l-6-6 6-6"/></svg>
              </button>
              {pageNumbers.map((n, idx) =>
                n === "..." ? (
                  <span key={`d${idx}`} style={{ padding:"0 3px", color:"#94a3b8", fontSize:"12px" }}>…</span>
                ) : (
                  <button type="button" key={n} className="pg-btn" onClick={() => goToPage(n)}
                    style={{ ...pgBtnSt, background:n===currentPage?"#3b82f6":"#fff", color:n===currentPage?"#fff":"#374151", borderColor:n===currentPage?"#3b82f6":"#e2e8f0", fontWeight:n===currentPage?700:500, cursor:"pointer" }}>
                    {n}
                  </button>
                )
              )}
              <button type="button" className="pg-btn" disabled={!hasNext} onClick={() => goToPage(currentPage+1)}
                style={{ ...pgBtnSt, opacity:hasNext?1:0.35, cursor:hasNext?"pointer":"default" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}
          style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.30)", backdropFilter:"blur(4px)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}
            style={{ background:"#fff", borderRadius:"18px", width:"100%", maxWidth:"560px", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.14)" }}>
            <div style={{ padding:"24px 28px 16px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"sticky", top:0, background:"#fff", zIndex:1 }}>
              <div>
                <div style={{ fontSize:"18px", fontWeight:700, color:"#0f172a", fontFamily:"'DM Serif Display',serif" }}>
                  {editingId ? "Edit Teacher" : "Add New Teacher"}
                </div>
                <div style={{ fontSize:"12px", color:"#94a3b8", marginTop:"2px" }}>
                  {editingId ? "Update teacher information below" : "Fill in all required fields"}
                </div>
              </div>
              <button type="button" onClick={closeModal}
                style={{ border:"none", background:"#f1f5f9", cursor:"pointer", borderRadius:"8px", width:"30px", height:"30px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"17px", color:"#64748b", flexShrink:0 }}>
                ×
              </button>
            </div>
            <div style={{ padding:"20px 28px 24px" }}>
              <TextField label="Full Name" name="name" placeholder="Jane Smith" value={form.name} onChange={handleFormChange} error={formErrors.name} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                <TextField label="Email Address" name="email" type="email" placeholder="jane@school.edu" value={form.email} onChange={handleFormChange} error={formErrors.email} />
                <TextField label={editingId ? "New Password (optional)" : "Password"} name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleFormChange} error={formErrors.password} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                <TextField label="Age" name="age" type="number" placeholder="30" value={form.age} onChange={handleFormChange} error={formErrors.age} />
                <TextField label="Experience (years)" name="experience_years" type="number" placeholder="5" value={form.experience_years} onChange={handleFormChange} error={formErrors.experience_years} />
              </div>
              <SelectField label="Subject / Specialization" name="specialization" value={form.specialization} onChange={handleFormChange} error={formErrors.specialization} />
              <TextareaField label="Bio" name="bio" placeholder="Brief professional bio…" value={form.bio} onChange={handleFormChange} error={formErrors.bio} />
              <div style={{ display:"flex", gap:"10px", marginTop:"6px" }}>
                <button type="button" onClick={closeModal}
                  style={{ flex:1, padding:"11px", borderRadius:"10px", border:"1px solid #e2e8f0", background:"#fff", color:"#374151", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  Cancel
                </button>
                <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}
                  style={{ flex:2, padding:"11px", borderRadius:"10px", border:"none", background:"linear-gradient(135deg,#3b82f6,#6366f1)", color:"#fff", fontSize:"13px", fontWeight:600, cursor:submitting?"default":"pointer", opacity:submitting?0.7:1, transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif" }}>
                  {submitting ? "Saving…" : editingId ? "Save Changes" : "Add Teacher"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}
          style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.30)", backdropFilter:"blur(4px)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}
            style={{ background:"#fff", borderRadius:"18px", width:"100%", maxWidth:"390px", padding:"30px", textAlign:"center", boxShadow:"0 24px 80px rgba(0,0,0,0.14)" }}>
            <div style={{ width:"52px", height:"52px", background:"#fef2f2", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <TrashIcon size={21} color="#ef4444" />
            </div>
            <div style={{ fontSize:"17px", fontWeight:700, color:"#0f172a", fontFamily:"'DM Serif Display',serif", marginBottom:"8px" }}>Remove Teacher?</div>
            <div style={{ fontSize:"13px", color:"#64748b", marginBottom:"24px", lineHeight:1.65 }}>
              You&apos;re about to remove <strong style={{ color:"#0f172a" }}>{deleteConfirm.name}</strong> from the system. This cannot be undone.
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button type="button" onClick={() => setDeleteConfirm(null)}
                style={{ flex:1, padding:"11px", borderRadius:"10px", border:"1px solid #e2e8f0", background:"#fff", color:"#374151", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={() => handleDelete(deleteConfirm.id)}
                style={{ flex:1, padding:"11px", borderRadius:"10px", border:"none", background:"#ef4444", color:"#fff", fontSize:"13px", fontWeight:600, cursor:"pointer", transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif" }}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {viewTeacher && (
        <div className="modal-backdrop" onClick={() => setViewTeacher(null)}
          style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.30)", backdropFilter:"blur(4px)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}
            style={{ background:"#fff", borderRadius:"18px", width:"100%", maxWidth:"440px", overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,0.14)" }}>
            <div style={{ background:"linear-gradient(135deg,#3b82f6,#6366f1)", padding:"28px", textAlign:"center" }}>
              <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 11px", fontSize:"22px", fontWeight:700, color:"#fff", border:"3px solid rgba(255,255,255,0.3)" }}>
                {viewTeacher.name?.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()}
              </div>
              <div style={{ fontSize:"19px", fontWeight:700, color:"#fff", fontFamily:"'DM Serif Display',serif" }}>{viewTeacher.name}</div>
              <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.7)", marginTop:"3px" }}>{viewTeacher.email}</div>
              <span style={{ display:"inline-block", marginTop:"9px", background:"rgba(255,255,255,0.16)", color:"#fff", fontSize:"11px", fontWeight:600, padding:"3px 11px", borderRadius:"20px", border:"1px solid rgba(255,255,255,0.26)" }}>
                {viewTeacher.specialization}
              </span>
            </div>
            <div style={{ padding:"20px 24px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"11px", marginBottom:"14px" }}>
                {[
                  { label:"Age",        value:`${viewTeacher.age} years`             },
                  { label:"Experience", value:`${viewTeacher.experience_years} years` },
                ].map(item => (
                  <div key={item.label} style={{ background:"#f8fafc", borderRadius:"10px", padding:"12px 14px" }}>
                    <div style={{ fontSize:"10px", color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"3px" }}>{item.label}</div>
                    <div style={{ fontSize:"15px", fontWeight:700, color:"#0f172a" }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#f8fafc", borderRadius:"10px", padding:"13px", marginBottom:"16px" }}>
                <div style={{ fontSize:"10px", color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"5px" }}>Bio</div>
                <div style={{ fontSize:"13px", color:"#374151", lineHeight:1.7 }}>{viewTeacher.bio}</div>
              </div>
              <div style={{ display:"flex", gap:"10px" }}>
                <button type="button" onClick={() => setViewTeacher(null)}
                  style={{ flex:1, padding:"10px", borderRadius:"10px", border:"1px solid #e2e8f0", background:"#fff", color:"#374151", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  Close
                </button>
                <button type="button" className="btn-primary"
                  onClick={() => { setViewTeacher(null); openEdit(viewTeacher); }}
                  style={{ flex:1, padding:"10px", borderRadius:"10px", border:"none", background:"linear-gradient(135deg,#3b82f6,#6366f1)", color:"#fff", fontSize:"13px", fontWeight:600, cursor:"pointer", transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif" }}>
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toastMsg && (
        <div className="toast-msg" style={{
          position:"fixed", bottom:"22px", right:"22px", zIndex:999,
          background:toastMsg.type==="error"?"#fef2f2":"#f0fdf4",
          border:`1px solid ${toastMsg.type==="error"?"#fecaca":"#bbf7d0"}`,
          color:toastMsg.type==="error"?"#dc2626":"#16a34a",
          padding:"11px 16px", borderRadius:"11px", fontSize:"13px", fontWeight:600,
          boxShadow:"0 6px 24px rgba(0,0,0,0.08)", display:"flex", alignItems:"center", gap:"6px",
          fontFamily:"'DM Sans',sans-serif",
        }}>
          {toastMsg.type === "error" ? "🗑️" : "✅"} {toastMsg.msg}
        </div>
      )}
    </div>
  );
}