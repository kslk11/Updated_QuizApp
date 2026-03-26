"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../../../../../../../config/api";
import usePagination from "../../../../../../../hooks/usePagination";
import useDebounce from "../../../../../../../hooks/useDebounce";

const QUIZ_URL = `${API_BASE_URL}/api/client`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const emptyForm = {
  question: "", option_a: "", option_b: "",
  option_c: "", option_d: "", correct_answer: "", marks: "",
};

const OPTIONS = [
  { letter: "A", field: "option_a" },
  { letter: "B", field: "option_b" },
  { letter: "C", field: "option_c" },
  { letter: "D", field: "option_d" },
];

const REQUIRED_COLS  = ["question","option_a","option_b","option_c","option_d","correct_answer","marks"];
const VALID_ANSWERS  = ["A","B","C","D"];

function validateRow(row) {
  const errors = [];
  REQUIRED_COLS.forEach((col) => {
    if (!row[col] && row[col] !== 0) errors.push(`Missing "${col}"`);
  });
  if (row.correct_answer && !VALID_ANSWERS.includes(String(row.correct_answer).toUpperCase()))
    errors.push(`"correct_answer" must be A/B/C/D`);
  if (row.marks !== undefined && (isNaN(Number(row.marks)) || Number(row.marks) <= 0))
    errors.push(`"marks" must be a positive number`);
  return errors;
}

export default function QuizPage() {
  const { courseId, batchId, setId } = useParams();
  const router                        = useRouter();
  const fileInputRef                  = useRef(null);

  const [setDetails,     setSetDetails]     = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [submitting,     setSubmitting]     = useState(false);
  const [error,          setError]          = useState(null);
  const [search,         setSearch]         = useState("");
  const [form,           setForm]           = useState(emptyForm);
  const [editId,         setEditId]         = useState(null);
  const [showModal,      setShowModal]      = useState(false);
  const [deleteTarget,   setDeleteTarget]   = useState(null);
  const [batchName,      setBatchName]      = useState("");
  const [courseName,     setCourseName]     = useState("");

  // Excel import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows,      setImportRows]      = useState([]);
  const [importDragging,  setImportDragging]  = useState(false);
  const [importFileName,  setImportFileName]  = useState("");
  const [importProgress,  setImportProgress]  = useState(null);
  const [importDone,      setImportDone]      = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: questions, loading, currentPage, totalPages,
    totalItems, pageNumbers, hasPrev, hasNext, fetchData, goToPage,
  } = usePagination(`${QUIZ_URL}/question/${setId}`, { itemsPerPage: 6 });

  // fetch set details + total count + breadcrumb names
  useEffect(() => {
    const load = async () => {
      try {
        const [setRes, countRes, cRes, bRes] = await Promise.all([
          axios.get(`${QUIZ_URL}/quiz/${setId}`,              getAuthHeaders()),
          axios.get(`${QUIZ_URL}/question/${setId}`,          getAuthHeaders()),
          axios.get(`${API_BASE_URL}/api/course/${courseId}`, getAuthHeaders()),
          axios.get(`${API_BASE_URL}/api/batches/${batchId}`, getAuthHeaders()),
        ]);
        setSetDetails(setRes.data?.data ?? setRes.data);
        setTotalQuestions(countRes.data?.count ?? countRes.data ?? 0);
        setCourseName((cRes.data?.data ?? cRes.data)?.name ?? "");
        setBatchName((bRes.data?.data  ?? bRes.data)?.name  ?? "");
      } catch { /* silent */ }
    };
    load();
  }, [setId, courseId, batchId]);

  useEffect(() => {
    fetchData({ page: currentPage, search: debouncedSearch });
  }, [currentPage, debouncedSearch]);

  useEffect(() => { goToPage(1); }, [debouncedSearch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit   = (q) => {
    setForm({ question: q.question, option_a: q.option_a, option_b: q.option_b,
              option_c: q.option_c, option_d: q.option_d,
              correct_answer: q.correct_answer, marks: q.marks });
    setEditId(q.id); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };

  const isValid = form.question.trim() && form.option_a.trim() && form.option_b.trim() &&
    form.option_c.trim() && form.option_d.trim() && form.correct_answer && Number(form.marks) > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true); setError(null);
    try {
      const payload = {
        question: form.question.trim(), option_a: form.option_a.trim(),
        option_b: form.option_b.trim(), option_c: form.option_c.trim(),
        option_d: form.option_d.trim(), correct_answer: form.correct_answer,
        marks: Number(form.marks),
      };
      if (editId) await axios.put(`${QUIZ_URL}/question/${editId}`, payload, getAuthHeaders());
      else        await axios.post(`${QUIZ_URL}/question/${setId}`,  payload);
      closeModal();
      fetchData({ page: currentPage, search: debouncedSearch });
      // refresh count
      const r = await axios.get(`${QUIZ_URL}/question/${setId}`, getAuthHeaders());
      setTotalQuestions(r.data?.count ?? r.data ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setSubmitting(false); }
  };

  const confirmDelete = async () => {
    setSubmitting(true); setError(null);
    try {
      await axios.delete(`${QUIZ_URL}/question/${deleteTarget.id}`, getAuthHeaders());
      setDeleteTarget(null);
      const targetPage = questions.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      goToPage(targetPage);
      fetchData({ page: targetPage, search: debouncedSearch });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setSubmitting(false); }
  };

  // ── Excel helpers ──────────────────────────────────────────────────────────
  const parseExcel = (file) => {
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: "binary" });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const raw  = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const rows = raw.map((row) => {
          const n = {};
          Object.entries(row).forEach(([k, v]) => { n[k.trim().toLowerCase().replace(/\s+/g, "_")] = v; });
          if (n.correct_answer) n.correct_answer = String(n.correct_answer).toUpperCase().trim();
          return { ...n, _errors: validateRow(n) };
        });
        setImportRows(rows); setImportDone(false); setImportProgress(null);
      } catch { setError("Could not parse the Excel file. Please check the format."); }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileInput = (e) => { const f = e.target.files?.[0]; if (f) parseExcel(f); e.target.value = ""; };
  const handleDrop      = (e)  => { e.preventDefault(); setImportDragging(false); const f = e.dataTransfer.files?.[0]; if (f) parseExcel(f); };

  const validRows   = importRows.filter((r) => r._errors.length === 0);
  const invalidRows = importRows.filter((r) => r._errors.length > 0);

  const handleBulkUpload = async () => {
    if (!validRows.length) return;
    setSubmitting(true);
    let done = 0, failed = 0;
    for (const row of validRows) {
      try {
        await axios.post(`${QUIZ_URL}/question/${setId}`, {
          question: String(row.question).trim(), option_a: String(row.option_a).trim(),
          option_b: String(row.option_b).trim(), option_c: String(row.option_c).trim(),
          option_d: String(row.option_d).trim(), correct_answer: row.correct_answer,
          marks: Number(row.marks),
        });
        done++;
      } catch { failed++; }
      setImportProgress({ done: done + failed, total: validRows.length, failed });
    }
    setImportDone(true); setSubmitting(false);
    fetchData({ page: 1, search: "" });
    try {
      const r = await axios.get(`${QUIZ_URL}/question/${setId}`, getAuthHeaders());
      setTotalQuestions(r.data?.count ?? r.data ?? 0);
    } catch { /* ignore */ }
  };

  const closeImportModal = () => {
    setShowImportModal(false); setImportRows([]); setImportFileName("");
    setImportProgress(null); setImportDone(false);
  };

  const downloadTemplate = () => {
    const sample = [{ question: "What is 2 + 2?", option_a: "3", option_b: "4", option_c: "5", option_d: "6", correct_answer: "B", marks: 1 }];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "questions_template.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 flex-wrap text-sm text-slate-400">
          <button onClick={() => router.push("/courses")} className="hover:text-indigo-600 font-medium transition">Courses</button>
          <span>/</span>
          <button onClick={() => router.push(`/courses/${courseId}/batches`)} className="hover:text-indigo-600 font-medium transition">{courseName || `Course #${courseId}`}</button>
          <span>/</span>
          <button onClick={() => router.push(`/courses/${courseId}/batches/${batchId}/sets`)} className="hover:text-indigo-600 font-medium transition">{batchName || `Batch #${batchId}`}</button>
          <span>/</span>
          <span className="text-slate-700 font-semibold">{setDetails?.title ?? `Set #${setId}`}</span>
          <span>/</span>
          <span className="text-indigo-600 font-semibold">Questions</span>
        </div>

        {/* Set info banner */}
        {setDetails && (
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Set</p>
              <h2 className="text-lg font-black text-slate-900">{setDetails.title}</h2>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-0.5">Duration</p>
                <p className="text-base font-bold text-slate-800">⏱ {setDetails.duration} min</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-0.5">Total Marks</p>
                <p className="text-base font-bold text-slate-800">🏆 {setDetails.total_marks}</p>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Questions</h1>
            <p className="text-sm text-slate-400 mt-1">{totalQuestions} {totalQuestions === 1 ? "question" : "questions"} total</p>
          </div>
          <div className="flex gap-3">
            <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">+ Add Question</button>
            <button onClick={() => setShowImportModal(true)}
              className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2">
              📥 Import Excel
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 relative w-full sm:w-80">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions…"
            className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition placeholder:text-slate-300"
          />
          {search !== debouncedSearch && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Questions list */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <span className="text-5xl">📝</span>
            <p className="font-semibold text-lg">No questions yet</p>
            <p className="text-sm">{search ? "Try a different search term" : `Click "+ Add Question" to get started`}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {questions.map((q, index) => (
              <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="shrink-0 w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-black">
                      {(currentPage - 1) * 6 + index + 1}
                    </span>
                    <p className="font-semibold text-sm leading-relaxed text-slate-800">{q.question}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(q)} className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 flex items-center justify-center text-sm transition-all" title="Edit">✏️</button>
                    <button onClick={() => setDeleteTarget(q)} className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center text-sm transition-all" title="Delete">🗑️</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {OPTIONS.map(({ letter, field }) => {
                    const isCorrect = q.correct_answer === letter;
                    return (
                      <div key={letter}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm transition-all ${isCorrect ? "border-2 border-indigo-300 bg-indigo-50" : "border-slate-100 bg-slate-50"}`}>
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${isCorrect ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700"}`}>{letter}</span>
                        <span className={`text-sm truncate ${isCorrect ? "font-semibold text-indigo-700" : "text-slate-600"}`}>{q[field]}</span>
                        {isCorrect && <span className="ml-auto text-xs font-bold text-emerald-500 shrink-0">✓</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    {new Date(q.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">Correct: {q.correct_answer}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">🏆 {q.marks} mark{q.marks !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
            <button onClick={() => goToPage(currentPage - 1)} disabled={!hasPrev || loading} className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all">← Prev</button>
            {pageNumbers.map((p, i) =>
              p === "..." ? <span key={`dot-${i}`} className="px-2 text-sm text-slate-400">…</span> : (
                <button key={p} onClick={() => goToPage(p)} disabled={loading}
                  className={`w-9 h-9 rounded-xl text-sm font-bold border transition-all ${currentPage === p ? "bg-indigo-600 text-white border-transparent shadow-md" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {p}
                </button>
              )
            )}
            <button onClick={() => goToPage(currentPage + 1)} disabled={!hasNext || loading} className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all">Next →</button>
          </div>
        )}
        {totalPages > 1 && <p className="text-center text-xs text-slate-400 mt-3">Page {currentPage} of {totalPages} · {totalItems} total</p>}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-slate-900 mb-1">{editId ? "Edit Question" : "New Question"}</h2>
            <p className="text-sm text-slate-400 mb-6">{editId ? "Update the question details." : `Adding to "${setDetails?.title ?? "this set"}"`}</p>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Question <span className="text-rose-400">*</span></label>
                <textarea name="question" value={form.question} onChange={handleChange} placeholder="Type your question here…" rows={3}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition placeholder:text-slate-300 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 block">Options <span className="text-rose-400">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OPTIONS.map(({ letter, field }) => (
                    <div key={letter} className="relative">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${form.correct_answer === letter ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700"}`}>{letter}</span>
                      <input name={field} value={form[field]} onChange={handleChange} placeholder={`Option ${letter}`}
                        className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${form.correct_answer === letter ? "border-2 border-indigo-300 bg-indigo-50 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Correct Answer <span className="text-rose-400">*</span></label>
                  <div className="flex gap-1.5">
                    {OPTIONS.map(({ letter }) => (
                      <button key={letter} type="button" onClick={() => setForm({ ...form, correct_answer: letter })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${form.correct_answer === letter ? "bg-indigo-600 text-white border-transparent shadow-md" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Marks <span className="text-rose-400">*</span></label>
                  <input name="marks" type="number" min="1" value={form.marks} onChange={handleChange} placeholder="e.g. 5"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button onClick={closeModal} className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl font-semibold text-sm transition-all">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting || !isValid} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all">
                {submitting ? "Saving…" : editId ? "Save Changes" : "Add Question"}
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
            <h2 className="text-xl font-black text-slate-900 mb-2">Delete Question?</h2>
            <p className="text-sm text-slate-400 mb-6">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl font-semibold text-sm transition-all">Cancel</button>
              <button onClick={confirmDelete} disabled={submitting} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all">
                {submitting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={!submitting ? closeImportModal : undefined} />
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-xl font-black text-slate-900">Import Questions from Excel</h2>
                <p className="text-sm text-slate-400 mt-1">Upload an <code className="font-mono text-xs">.xlsx</code> or <code className="font-mono text-xs">.xls</code> file.</p>
              </div>
              {!submitting && (
                <button onClick={closeImportModal} className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 flex items-center justify-center text-lg font-bold ml-4 shrink-0">✕</button>
              )}
            </div>

            {/* Column guide */}
            <div className="mt-4 mb-5 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Required Columns</p>
              <div className="flex flex-wrap gap-2">
                {REQUIRED_COLS.map((c) => (
                  <code key={c} className="text-xs px-2 py-0.5 rounded-lg font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">{c}</code>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                <code className="font-mono">correct_answer</code> must be A, B, C, or D.{" "}
                <button onClick={downloadTemplate} className="underline text-indigo-600 font-semibold hover:opacity-80">Download sample template ↓</button>
              </p>
            </div>

            {/* Drop zone */}
            {!importDone && (
              <div
                onDragOver={(e) => { e.preventDefault(); setImportDragging(true); }}
                onDragLeave={() => setImportDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-2xl px-6 py-8 flex flex-col items-center justify-center gap-3 transition-all mb-5 ${importDragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}
              >
                <span className="text-4xl">{importFileName ? "📄" : "📂"}</span>
                {importFileName ? (
                  <p className="text-sm font-semibold text-slate-800">{importFileName}</p>
                ) : (
                  <p className="text-sm font-semibold text-slate-400">Drag & drop your Excel file here, or <span className="text-indigo-600 underline">browse</span></p>
                )}
                <p className="text-xs text-slate-400">.xlsx or .xls</p>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileInput} className="hidden" />
              </div>
            )}

            {/* Preview table */}
            {importRows.length > 0 && !importDone && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-slate-800">{importRows.length} row{importRows.length !== 1 ? "s" : ""} found</p>
                  <div className="flex gap-3 text-xs">
                    <span className="text-emerald-600 font-semibold">✓ {validRows.length} valid</span>
                    {invalidRows.length > 0 && <span className="text-rose-500 font-semibold">✕ {invalidRows.length} invalid</span>}
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 mb-5 max-h-64">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {["#","Question","A","B","C","D","Ans","Marks","Status"].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-bold text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.map((row, i) => (
                        <tr key={i} className={`border-b border-slate-100 ${row._errors.length ? "bg-rose-50/40" : ""}`}>
                          <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                          <td className="px-3 py-2 text-slate-800 max-w-[160px] truncate">{String(row.question || "")}</td>
                          <td className="px-3 py-2 text-slate-600 max-w-[80px] truncate">{String(row.option_a || "")}</td>
                          <td className="px-3 py-2 text-slate-600 max-w-[80px] truncate">{String(row.option_b || "")}</td>
                          <td className="px-3 py-2 text-slate-600 max-w-[80px] truncate">{String(row.option_c || "")}</td>
                          <td className="px-3 py-2 text-slate-600 max-w-[80px] truncate">{String(row.option_d || "")}</td>
                          <td className="px-3 py-2 font-bold text-indigo-600">{String(row.correct_answer || "")}</td>
                          <td className="px-3 py-2 text-slate-600">{row.marks}</td>
                          <td className="px-3 py-2">
                            {row._errors.length === 0
                              ? <span className="text-emerald-500 font-bold">✓</span>
                              : <span className="text-rose-500 font-bold" title={row._errors.join(", ")}>✕ {row._errors[0]}</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {invalidRows.length > 0 && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                    ⚠️ {invalidRows.length} row{invalidRows.length !== 1 ? "s" : ""} with errors will be skipped. Only {validRows.length} valid row{validRows.length !== 1 ? "s" : ""} will be uploaded.
                  </div>
                )}
              </>
            )}

            {/* Progress */}
            {importProgress && (
              <div className="mb-5">
                <div className="w-full h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden mb-2">
                  <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${(importProgress.done / importProgress.total) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-400 text-center">Uploading {importProgress.done} / {importProgress.total}{importProgress.failed > 0 && ` · ${importProgress.failed} failed`}</p>
              </div>
            )}

            {/* Done */}
            {importDone && importProgress && (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">{importProgress.failed === 0 ? "🎉" : "⚠️"}</div>
                <h3 className="text-lg font-black text-slate-900 mb-1">{importProgress.failed === 0 ? "All questions imported!" : "Import complete with errors"}</h3>
                <p className="text-sm text-slate-400 mb-6">{importProgress.done - importProgress.failed} uploaded{importProgress.failed > 0 && `, ${importProgress.failed} failed`}.</p>
                <button onClick={closeImportModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">Done</button>
              </div>
            )}

            {/* Footer actions */}
            {!importDone && (
              <div className="flex gap-3 mt-2">
                <button onClick={closeImportModal} disabled={submitting} className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50">Cancel</button>
                <button onClick={handleBulkUpload} disabled={submitting || validRows.length === 0}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all">
                  {submitting ? "Uploading…" : validRows.length > 0 ? `Upload ${validRows.length} Question${validRows.length !== 1 ? "s" : ""}` : "Upload Questions"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}