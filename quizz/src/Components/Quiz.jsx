import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../config/api";
import useDebounce from "../Hooks/useDebounce";
import usePagination from "../Hooks/usePagination";
import { useTheme } from "../Hooks/useTheame";

const PARAM_URL = `${API_BASE_URL}/api/client`;
const QUIZ_URL  = `${API_BASE_URL}/api/client`;
const SETS_URL  = `${API_BASE_URL}/api/client/quizzes`;

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

const REQUIRED_COLS = ["question","option_a","option_b","option_c","option_d","correct_answer","marks"];
const VALID_ANSWERS = ["A","B","C","D"];

// Validate a single parsed row
function validateRow(row) {
  const errors = [];
  REQUIRED_COLS.forEach((col) => {
    if (!row[col] && row[col] !== 0) errors.push(`Missing "${col}"`);
  });
  if (row.correct_answer && !VALID_ANSWERS.includes(String(row.correct_answer).toUpperCase())) {
    errors.push(`"correct_answer" must be A/B/C/D`);
  }
  if (row.marks !== undefined && (isNaN(Number(row.marks)) || Number(row.marks) <= 0)) {
    errors.push(`"marks" must be a positive number`);
  }
  return errors;
}

export default function Quiz() {
  const { setId }   = useParams();
  const navigate    = useNavigate();
  const { t }       = useTheme();
  const fileInputRef = useRef(null);

  const [set, setSet]                     = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState(null);
  const [search, setSearch]               = useState("");
  const [form, setForm]                   = useState(emptyForm);
  const [editId, setEditId]               = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [details, setDetails]             = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Excel import state 
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows]           = useState([]);
  const [importDragging, setImportDragging]   = useState(false);
  const [importFileName, setImportFileName]   = useState("");
  const [importProgress, setImportProgress]   = useState(null);
  const [importDone, setImportDone]           = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: questions, loading, currentPage, totalPages,
    totalItems, pageNumbers, hasPrev, hasNext, fetchData, goToPage,
  } = usePagination(`${QUIZ_URL}/question/${setId}`, { itemsPerPage: 6 });
  
  console.log("questions",questions);

  //Fetch parent set / details / count
  useEffect(() => {
    const fetchSet = async () => {
      try { const r = await axios.get(`${SETS_URL}/${setId}`); setSet(r.data); }
      catch { setSet(null); }
    };
    const fetchDetails = async () => {
      try {
        const r = await axios.get(`${PARAM_URL}/quiz/${setId}`);
        setDetails(r.data?.data);
      } catch { setSet(null); }
    };
    const totalCount = async () => {
      try {
        const r = await axios.get(`${PARAM_URL}/question/${setId}`);
        setTotalQuestions(r.data);
      } catch { setSet(null); }
    };
    fetchSet(); fetchDetails(); totalCount();
  }, [setId]);

  useEffect(() => {
    fetchData({ page: currentPage, search: debouncedSearch });
  }, [currentPage, debouncedSearch]);

  useEffect(() => { goToPage(1); }, [debouncedSearch]);

  //Single Q helpers
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit   = (q) => {
    setForm({ question: q.question, option_a: q.option_a, option_b: q.option_b,
      option_c: q.option_c, option_d: q.option_d,
      correct_answer: q.correct_answer, marks: q.marks });
    setEditId(q.id); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };

  const isValid =
    form.question.trim() && form.option_a.trim() && form.option_b.trim() &&
    form.option_c.trim() && form.option_d.trim() && form.correct_answer &&
    Number(form.marks) > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true); setError(null);
    try {
      const payload = { question: form.question.trim(), option_a: form.option_a.trim(),
        option_b: form.option_b.trim(), option_c: form.option_c.trim(),
        option_d: form.option_d.trim(), correct_answer: form.correct_answer,
        marks: Number(form.marks) };
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      if (editId) await axios.put(`${QUIZ_URL}/question/${editId}`, payload, { headers });
      else        await axios.post(`${QUIZ_URL}/question/${setId}`, payload);
      closeModal();
      fetchData({ page: currentPage, search: debouncedSearch });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setSubmitting(false); }
  };

  const confirmDelete = async () => {
    setSubmitting(true); setError(null);
    try {
      await axios.delete(`${QUIZ_URL}/question/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDeleteTarget(null);
      const targetPage = questions.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      goToPage(targetPage);
      fetchData({ page: targetPage, search: debouncedSearch });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setSubmitting(false); }
  };

  //Excel import helpers
  const parseExcel = (file) => {
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: "binary" });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const raw  = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const rows = raw.map((row) => {
          
          const normalised = {};
          Object.entries(row).forEach(([k, v]) => {
            normalised[k.trim().toLowerCase().replace(/\s+/g, "_")] = v;
          });
          if (normalised.correct_answer)
            normalised.correct_answer = String(normalised.correct_answer).toUpperCase().trim();
          const _errors = validateRow(normalised);
          return { ...normalised, _errors };
        });
        setImportRows(rows);
        setImportDone(false);
        setImportProgress(null);
      } catch {
        setError("Could not parse the Excel file. Please check the format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) parseExcel(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault(); setImportDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseExcel(file);
  };

  const validRows   = importRows.filter((r) => r._errors.length === 0);
  const invalidRows = importRows.filter((r) => r._errors.length > 0);

  const handleBulkUpload = async () => {
    if (!validRows.length) return;
    setSubmitting(true);
    let done = 0, failed = 0;
    for (const row of validRows) {
      try {
        await axios.post(`${QUIZ_URL}/question/${setId}`, {
          question:       String(row.question).trim(),
          option_a:       String(row.option_a).trim(),
          option_b:       String(row.option_b).trim(),
          option_c:       String(row.option_c).trim(),
          option_d:       String(row.option_d).trim(),
          correct_answer: row.correct_answer,
          marks:          Number(row.marks),
        });
        done++;
      } catch { failed++; }
      setImportProgress({ done: done + failed, total: validRows.length, failed });
    }
    setImportDone(true);
    setSubmitting(false);
    fetchData({ page: 1, search: "" });
    // refresh total count
    try {
      const r = await axios.get(`${PARAM_URL}/question/${setId}`);
      setTotalQuestions(r.data);
    } catch { /* ignore */ }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportRows([]);
    setImportFileName("");
    setImportProgress(null);
    setImportDone(false);
  };

  //Download sample template 
  const downloadTemplate = () => {
    const sample = [{
      question: "What is 2 + 2?",
      option_a: "3", option_b: "4", option_c: "5", option_d: "6",
      correct_answer: "B", marks: 1,
    }];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "questions_template.xlsx");
  };

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-300 p-6`}>
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button onClick={() => navigate("/categories")}
            className={`text-sm font-semibold ${t.accent} hover:underline`}>
            Categories
          </button>
          <span className={`text-sm ${t.textMuted}`}>›</span>
          <button onClick={() => navigate(-1)}
            className={`text-sm font-semibold ${t.accent} hover:underline`}>
            Sets
          </button>
          <span className={`text-sm ${t.textMuted}`}>›</span>
          <span className={`text-sm font-semibold ${t.text}`}>{set?.title ?? "..."}</span>
          <span className={`text-sm ${t.textMuted}`}>›</span>
          <span className={`text-sm font-semibold ${t.text}`}>Questions</span>
        </div>

        {/* Set info banner */}
        {details && (
          <div className={`${t.bgCard} border ${t.border} rounded-2xl px-5 py-4 mb-6 flex flex-wrap gap-4 items-center justify-between`}>
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-0.5`}>Set</p>
              <h2 className={`text-lg font-black ${t.text}`}>{details.title}</h2>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className={`text-xs ${t.textMuted} mb-0.5`}>Duration</p>
                <p className={`text-base font-bold ${t.text}`}>⏱ {details.duration} min</p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${t.textMuted} mb-0.5`}>Total Marks</p>
                <p className={`text-base font-bold ${t.text}`}>🏆 {details.total_marks}</p>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-black ${t.text}`}>Questions</h1>
            <p className={`text-sm ${t.textMuted} mt-1`}>
              {totalQuestions.count} {totalQuestions.count === 1 ? "question" : "questions"} total
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={openCreate}
              className={`${t.accentBg} ${t.accentBgHover} text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all`}>
              + Add Question
            </button>
            <button onClick={() => setShowImportModal(true)}
              className={`border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2`}>
              📥 Import Excel
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 font-bold">✕</button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 relative w-full sm:w-80">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions…"
            className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
          />
          {search !== debouncedSearch && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className={`w-4 h-4 border-2 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
            </div>
          )}
        </div>

        {/* Questions list */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className={`w-8 h-8 border-4 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
          </div>
        ) : questions.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-24 gap-3 ${t.textMuted}`}>
            <span className="text-5xl">📝</span>
            <p className="font-semibold text-lg">No questions yet</p>
            <p className="text-sm">
              {search ? "Try a different search term" : `Click "+ Add Question" to get started`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {questions.map((q, index) => (
              <div key={q.id}
                className={`${t.bgCard} border ${t.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className={`shrink-0 w-7 h-7 rounded-lg ${t.accentLight} ${t.accentText} flex items-center justify-center text-xs font-black`}>
                      {(currentPage - 1) * 6 + index + 1}
                    </span>
                    <p className={`font-semibold text-sm leading-relaxed ${t.text}`}>{q.question}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(q)}
                      className={`w-8 h-8 rounded-lg border ${t.border} ${t.bgCardHover} ${t.textSecondary} flex items-center justify-center text-sm transition-all`}
                      title="Edit">✏️</button>
                    <button onClick={() => setDeleteTarget(q)}
                      className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center text-sm transition-all"
                      title="Delete">🗑️</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {OPTIONS.map(({ letter, field }) => {
                    const isCorrect = q.correct_answer === letter;
                    return (
                      <div key={letter}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm transition-all
                          ${isCorrect ? `border-2 ${t.accentBorder} ${t.accentLight}` : `${t.border} ${t.bg}`}`}>
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0
                          ${isCorrect ? `${t.accentBg} text-white` : `${t.accentLight} ${t.accentText}`}`}>
                          {letter}
                        </span>
                        <span className={`text-sm truncate ${isCorrect ? `font-semibold ${t.accentText}` : t.textSecondary}`}>
                          {q[field]}
                        </span>
                        {isCorrect && <span className="ml-auto text-xs font-bold text-emerald-500 shrink-0">✓</span>}
                      </div>
                    );
                  })}
                </div>

                <div className={`flex items-center justify-between pt-3 border-t ${t.borderSubtle}`}>
                  <span className={`text-xs ${t.textMuted}`}>
                    {new Date(q.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${t.badge}`}>
                      Correct: {q.correct_answer}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${t.badge}`}>
                      🏆 {q.marks} mark{q.marks !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
            <button onClick={() => goToPage(currentPage - 1)} disabled={!hasPrev || loading}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${t.border} ${t.bgCard} ${t.textSecondary} disabled:opacity-40 ${t.bgCardHover} transition-all`}>
              ← Prev
            </button>
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`dot-${i}`} className={`px-2 text-sm ${t.textMuted}`}>…</span>
              ) : (
                <button key={p} onClick={() => goToPage(p)} disabled={loading}
                  className={`w-9 h-9 rounded-xl text-sm font-bold border transition-all
                    ${currentPage === p
                      ? `${t.accentBg} text-white border-transparent shadow-md`
                      : `${t.bgCard} ${t.border} ${t.textSecondary} ${t.bgCardHover}`}`}>
                  {p}
                </button>
              )
            )}
            <button onClick={() => goToPage(currentPage + 1)} disabled={!hasNext || loading}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${t.border} ${t.bgCard} ${t.textSecondary} disabled:opacity-40 ${t.bgCardHover} transition-all`}>
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

      {/*Create / Edit Modal*/}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeModal} />
          <div className={`relative w-full max-w-lg ${t.bgCard} border ${t.border} rounded-3xl p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-xl font-black ${t.text} mb-1`}>{editId ? "Edit Question" : "New Question"}</h2>
            <p className={`text-sm ${t.textMuted} mb-6`}>
              {editId ? "Update the question details." : `Adding to "${set?.title ?? "this set"}"`}
            </p>
            <div className="flex flex-col gap-5">
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-1.5 block`}>
                  Question <span className="text-rose-400">*</span>
                </label>
                <textarea name="question" value={form.question} onChange={handleChange}
                  placeholder="Type your question here…" rows={3}
                  className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted} resize-none`}
                />
              </div>
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-3 block`}>
                  Options <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OPTIONS.map(({ letter, field }) => (
                    <div key={letter} className="relative">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black
                        ${form.correct_answer === letter ? `${t.accentBg} text-white` : `${t.accentLight} ${t.accentText}`}`}>
                        {letter}
                      </span>
                      <input name={field} value={form[field]} onChange={handleChange}
                        placeholder={`Option ${letter}`}
                        className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition
                          ${form.correct_answer === letter
                            ? `border-2 ${t.accentBorder} ${t.accentLight} ${t.accentText} ${t.inputFocus}`
                            : `${t.inputBg} ${t.inputBorder} ${t.text} ${t.inputFocus}`}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-2 block`}>
                    Correct Answer <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex gap-1.5">
                    {OPTIONS.map(({ letter }) => (
                      <button key={letter} type="button"
                        onClick={() => setForm({ ...form, correct_answer: letter })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all
                          ${form.correct_answer === letter
                            ? `${t.accentBg} text-white border-transparent shadow-md`
                            : `${t.bgCard} ${t.border} ${t.textSecondary} ${t.bgCardHover}`}`}>
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-2 block`}>
                    Marks <span className="text-rose-400">*</span>
                  </label>
                  <input name="marks" type="number" min="1" value={form.marks} onChange={handleChange}
                    placeholder="e.g. 5"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button onClick={closeModal}
                className={`flex-1 border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} py-2.5 rounded-xl font-semibold text-sm transition-all`}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting || !isValid}
                className={`flex-1 ${t.accentBg} ${t.accentBgHover} text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all`}>
                {submitting ? "Saving…" : editId ? "Save Changes" : "Add Question"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*Delete Confirm Modal*/}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className={`relative w-full max-w-sm ${t.bgCard} border ${t.border} rounded-3xl p-7 shadow-2xl z-10 text-center`}>
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className={`text-xl font-black ${t.text} mb-2`}>Delete Question?</h2>
            <p className={`text-sm ${t.textMuted} mb-6`}>Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className={`flex-1 border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} py-2.5 rounded-xl font-semibold text-sm transition-all`}>
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={submitting}
                className="flex-1 bg-rose-500 hover:bg-rose-400 text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all">
                {submitting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*Excel Import Modal*/}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={!submitting ? closeImportModal : undefined} />
          <div className={`relative w-full max-w-3xl ${t.bgCard} border ${t.border} rounded-3xl p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto`}>

            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className={`text-xl font-black ${t.text}`}>Import Questions from Excel</h2>
                <p className={`text-sm ${t.textMuted} mt-1`}>
                  Upload an <code className="font-mono text-xs">.xlsx</code> or <code className="font-mono text-xs">.xls</code> file with your questions.
                </p>
              </div>
              {!submitting && (
                <button onClick={closeImportModal}
                  className={`w-8 h-8 rounded-lg border ${t.border} ${t.bgCardHover} ${t.textSecondary} flex items-center justify-center text-lg font-bold ml-4 shrink-0`}>
                  ✕
                </button>
              )}
            </div>

            {/* Column guide */}
            <div className={`mt-4 mb-5 px-4 py-3 rounded-xl border ${t.border} ${t.bg}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-2`}>Required Columns</p>
              <div className="flex flex-wrap gap-2">
                {REQUIRED_COLS.map((c) => (
                  <code key={c} className={`text-xs px-2 py-0.5 rounded-lg font-mono ${t.accentLight} ${t.accentText} border ${t.accentBorder}`}>
                    {c}
                  </code>
                ))}
              </div>
              <p className={`text-xs ${t.textMuted} mt-2`}>
                <code className="font-mono">correct_answer</code> must be A, B, C, or D.&nbsp;
                <button onClick={downloadTemplate}
                  className={`underline ${t.accent} font-semibold hover:opacity-80`}>
                  Download sample template ↓
                </button>
              </p>
            </div>

            {/* Drop zone */}
            {!importDone && (
              <div
                onDragOver={(e) => { e.preventDefault(); setImportDragging(true); }}
                onDragLeave={() => setImportDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-2xl px-6 py-8 flex flex-col items-center justify-center gap-3 transition-all mb-5
                  ${importDragging
                    ? `${t.accentBorder} ${t.accentLight}`
                    : `${t.border} ${t.bg} hover:${t.bgCardHover}`}`}
              >
                <span className="text-4xl">{importFileName ? "📄" : "📂"}</span>
                {importFileName ? (
                  <p className={`text-sm font-semibold ${t.text}`}>{importFileName}</p>
                ) : (
                  <p className={`text-sm font-semibold ${t.textMuted}`}>
                    Drag & drop your Excel file here, or <span className={`${t.accent} underline`}>browse</span>
                  </p>
                )}
                <p className={`text-xs ${t.textMuted}`}>.xlsx or .xls</p>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls"
                  onChange={handleFileInput} className="hidden" />
              </div>
            )}

            {/* Preview table */}
            {importRows.length > 0 && !importDone && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-sm font-bold ${t.text}`}>
                    Preview — {importRows.length} row{importRows.length !== 1 ? "s" : ""} found
                  </p>
                  <div className="flex gap-3 text-xs">
                    <span className="text-emerald-600 font-semibold">✓ {validRows.length} valid</span>
                    {invalidRows.length > 0 && (
                      <span className="text-rose-500 font-semibold">✕ {invalidRows.length} invalid</span>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border ${t.border} mb-5 max-h-64">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className={`${t.bg} border-b ${t.border}`}>
                        <th className={`px-3 py-2 text-left font-bold ${t.textMuted} w-6`}>#</th>
                        <th className={`px-3 py-2 text-left font-bold ${t.textMuted}`}>Question</th>
                        <th className={`px-3 py-2 text-left font-bold ${t.textMuted}`}>A</th>
                        <th className={`px-3 py-2 text-left font-bold ${t.textMuted}`}>B</th>
                        <th className={`px-3 py-2 text-left font-bold ${t.textMuted}`}>C</th>
                        <th className={`px-3 py-2 text-left font-bold ${t.textMuted}`}>D</th>
                        <th className={`px-3 py-2 text-left font-bold ${t.textMuted}`}>Ans</th>
                        <th className={`px-3 py-2 text-left font-bold ${t.textMuted}`}>Marks</th>
                        <th className={`px-3 py-2 text-left font-bold ${t.textMuted}`}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.map((row, i) => (
                        <tr key={i}
                          className={`border-b ${t.border} ${row._errors.length ? "bg-rose-50/40" : ""}`}>
                          <td className={`px-3 py-2 ${t.textMuted}`}>{i + 1}</td>
                          <td className={`px-3 py-2 ${t.text} max-w-[160px] truncate`}>{String(row.question || "")}</td>
                          <td className={`px-3 py-2 ${t.textSecondary} max-w-[80px] truncate`}>{String(row.option_a || "")}</td>
                          <td className={`px-3 py-2 ${t.textSecondary} max-w-[80px] truncate`}>{String(row.option_b || "")}</td>
                          <td className={`px-3 py-2 ${t.textSecondary} max-w-[80px] truncate`}>{String(row.option_c || "")}</td>
                          <td className={`px-3 py-2 ${t.textSecondary} max-w-[80px] truncate`}>{String(row.option_d || "")}</td>
                          <td className={`px-3 py-2 font-bold ${t.accentText}`}>{String(row.correct_answer || "")}</td>
                          <td className={`px-3 py-2 ${t.textSecondary}`}>{row.marks}</td>
                          <td className="px-3 py-2">
                            {row._errors.length === 0 ? (
                              <span className="text-emerald-500 font-bold">✓</span>
                            ) : (
                              <span className="text-rose-500 font-bold" title={row._errors.join(", ")}>
                                ✕ {row._errors[0]}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {invalidRows.length > 0 && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                    ⚠️ {invalidRows.length} row{invalidRows.length !== 1 ? "s" : ""} with errors will be skipped.
                    Only {validRows.length} valid row{validRows.length !== 1 ? "s" : ""} will be uploaded.
                  </div>
                )}
              </>
            )}

            {/* Upload progress */}
            {importProgress && (
              <div className="mb-5">
                <div className={`w-full h-2 rounded-full ${t.bg} border ${t.border} overflow-hidden mb-2`}>
                  <div
                    className={`h-full rounded-full transition-all ${t.accentBg}`}
                    style={{ width: `${(importProgress.done / importProgress.total) * 100}%` }}
                  />
                </div>
                <p className={`text-xs ${t.textMuted} text-center`}>
                  Uploading {importProgress.done} / {importProgress.total}
                  {importProgress.failed > 0 && ` · ${importProgress.failed} failed`}
                </p>
              </div>
            )}

            {/* Done state */}
            {importDone && importProgress && (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">
                  {importProgress.failed === 0 ? "🎉" : "⚠️"}
                </div>
                <h3 className={`text-lg font-black ${t.text} mb-1`}>
                  {importProgress.failed === 0 ? "All questions imported!" : "Import complete with errors"}
                </h3>
                <p className={`text-sm ${t.textMuted} mb-6`}>
                  {importProgress.done - importProgress.failed} uploaded successfully
                  {importProgress.failed > 0 && `, ${importProgress.failed} failed`}.
                </p>
                <button onClick={closeImportModal}
                  className={`${t.accentBg} ${t.accentBgHover} text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all`}>
                  Done
                </button>
              </div>
            )}

            {/* Footer actions */}
            {!importDone && (
              <div className="flex gap-3 mt-2">
                <button onClick={closeImportModal} disabled={submitting}
                  className={`flex-1 border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50`}>
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpload}
                  disabled={submitting || validRows.length === 0}
                  className={`flex-1 ${t.accentBg} ${t.accentBgHover} text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all`}>
                  {submitting
                    ? "Uploading…"
                    : validRows.length > 0
                      ? `Upload ${validRows.length} Question${validRows.length !== 1 ? "s" : ""}`
                      : "Upload Questions"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}