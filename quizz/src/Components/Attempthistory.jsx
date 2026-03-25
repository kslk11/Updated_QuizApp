import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../Hooks/useTheame";
import { API_BASE_URL } from "../config/api";

const HISTORY_URL = `${API_BASE_URL}/api/student/attempt-history`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "Not submitted";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};
const fmtTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const normalise = (a) => {
  const totalMarks = a.total_marks ?? a.totalMarks ?? 0;
  const scored     = a.score       ?? a.scored     ?? 0;
  const pct        = a.percentage  ??
    (totalMarks > 0 ? Math.round((scored / totalMarks) * 100) : 0);
  return {
    id:            a.attempt_id ?? a.id ?? a._id,
    quizId:        a.quiz_id ?? a.quizId ?? a.quiz ?? null, // Extracted for Leaderboard routing
    quizTitle:     a.quiz_title  ?? a.quizTitle  ?? "Quiz",
    bundleTitle:   a.bundle_title ?? "",
    correct:       a.correct_answers ?? a.correct ?? 0,
    wrong:         a.wrong_answers   ?? a.wrong   ?? 0,
    skipped:       a.skipped         ?? 0,
    totalMarks,
    scored,
    pct,
    submittedAt:   a.submitted_at ?? a.submittedAt ?? null,
    autoSubmitted: a.auto_submitted ?? false,
    totalQ: (a.correct_answers ?? 0) + (a.wrong_answers ?? 0) + (a.skipped ?? 0),
  };
};

// Accuracy = correct / (correct + wrong) * 100
const accuracy = (correct, wrong) => {
  const attempted = correct + wrong;
  return attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
};

// ─── Top summary strip ────────────────────────────────────────────────────────
function SummaryStrip({ attempts }) {
  if (!attempts.length) return null;
  const avg    = Math.round(attempts.reduce((s, a) => s + a.pct, 0) / attempts.length);
  const best   = Math.max(...attempts.map(a => a.pct));
  const passed = attempts.filter(a => a.pct >= 50).length;
  const avgAcc = Math.round(
    attempts.reduce((s, a) => s + accuracy(a.correct, a.wrong), 0) / attempts.length
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
      {[
        { icon: "📝", label: "Total Tests",  value: attempts.length,  unit: "attempted"  },
        { icon: "📊", label: "Avg Score",    value: `${avg}%`,        unit: "per test"   },
        { icon: "🎯", label: "Avg Accuracy", value: `${avgAcc}%`,     unit: "correct"    },
        { icon: "✅", label: "Passed",       value: `${passed}/${attempts.length}`, unit: "tests" },
      ].map(({ icon, label, value, unit }) => (
        <div key={label} className="flex flex-col items-center py-4 px-3 gap-0.5">
          <span className="text-xl mb-1">{icon}</span>
          <p className="text-xl font-black text-slate-800">{value}</p>
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <p className="text-xs text-slate-400">{unit}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Score donut ──────────────────────────────────────────────────────────────
function ScoreDonut({ pct, size = 60 }) {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 60 ? "#0d9488" : pct >= 50 ? "#6366f1" : "#f43f5e";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray .9s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

// ─── Accuracy bar ─────────────────────────────────────────────────────────────
function AccuracyBar({ correct, wrong, skipped }) {
  const total = correct + wrong + skipped || 1;
  return (
    <div className="flex gap-px h-1.5 rounded-full overflow-hidden w-full">
      {correct > 0 && <div className="bg-teal-500 transition-all duration-700" style={{ width: `${(correct/total)*100}%` }} />}
      {wrong   > 0 && <div className="bg-rose-400 transition-all duration-700" style={{ width: `${(wrong/total)*100}%` }} />}
      {skipped > 0 && <div className="bg-amber-300 transition-all duration-700" style={{ width: `${(skipped/total)*100}%` }} />}
    </div>
  );
}

// ─── Attempt Card (Testbook style) ────────────────────────────────────────────
function AttemptCard({ attempt, index, onView, onLeaderboard }) {
  const passed   = attempt.pct >= 50;
  const acc      = accuracy(attempt.correct, attempt.wrong);
  const isPending = !attempt.submittedAt;

  return (
    <div
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{ animation: `slideUp 0.4s ease both`, animationDelay: `${index * 55}ms` }}
    >
      {/* Colored top bar — teal if passed, rose if failed, slate if pending */}
      <div className={`h-1 w-full ${isPending ? "bg-slate-300" : passed ? "bg-teal-500" : "bg-rose-400"}`} />

      <div className="p-5">
        {/* Row 1: title + status badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            {attempt.bundleTitle && (
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-0.5">
                {attempt.bundleTitle}
              </p>
            )}
            <h3 className="text-sm font-black text-slate-800 leading-snug line-clamp-2">
              {attempt.quizTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              🕐 {fmtDate(attempt.submittedAt)}
              {fmtTime(attempt.submittedAt) && (
                <span className="opacity-70">· {fmtTime(attempt.submittedAt)}</span>
              )}
              {attempt.autoSubmitted && (
                <span className="ml-1 text-amber-600 font-semibold">· Auto-submitted</span>
              )}
            </p>
          </div>

          {/* Status pill */}
          <span className={`shrink-0 text-xs font-black px-2.5 py-1 rounded-full border
            ${isPending
              ? "bg-slate-50 border-slate-200 text-slate-400"
              : passed
                ? "bg-teal-50 border-teal-200 text-teal-700"
                : "bg-rose-50 border-rose-200 text-rose-600"
            }`}
          >
            {isPending ? "Pending" : passed ? "✓ Passed" : "✗ Failed"}
          </span>
        </div>

        {/* Row 2: donut + stats grid */}
        <div className="flex items-center gap-5 mb-4">
          <ScoreDonut pct={attempt.pct} size={64} />

          <div className="flex-1 grid grid-cols-3 gap-2">
            {[
              { label: "Marks",    value: `${attempt.scored}/${attempt.totalMarks}`, color: "text-slate-700" },
              { label: "Accuracy", value: `${acc}%`,                                 color: acc >= 60 ? "text-teal-600" : "text-rose-500" },
              { label: "Score",    value: `${attempt.pct}%`,                         color: attempt.pct >= 50 ? "text-teal-600" : "text-rose-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center bg-slate-50 rounded-xl py-2 px-1">
                <p className={`text-sm font-black ${color}`}>{value}</p>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3: Q breakdown bar */}
        <div className="mb-3">
          <AccuracyBar correct={attempt.correct} wrong={attempt.wrong} skipped={attempt.skipped} />
          <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
              {attempt.correct} Correct
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
              {attempt.wrong} Wrong
            </span>
            {attempt.skipped > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-300 shrink-0" />
                {attempt.skipped} Skipped
              </span>
            )}
          </div>
        </div>

        {/* Row 4: action buttons */}
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => onView(attempt.id)}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
          >
            Analysis
          </button>
          
          <button
            onClick={() => onLeaderboard(attempt.quizId)}
            className="flex-1 flex items-center justify-center gap-1 bg-white hover:bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold py-2.5 rounded-xl transition-colors"
          >
            <span>🏆</span> Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
// ─── Tab bar ──────────────────────────────────────────────────────────────────
function TabBar({ active, onChange, counts }) {
  const tabs = [
    { key: "all",    label: "All Tests",  count: counts.all    },
    { key: "passed", label: "Passed",     count: counts.passed },
    { key: "failed", label: "Failed",     count: counts.failed },
  ];
  return (
    <div className="flex border-b border-slate-200 mb-5">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative flex items-center gap-1.5 px-5 py-3 text-sm font-bold transition-colors
            ${active === tab.key
              ? "text-teal-700 border-b-2 border-teal-600 -mb-px"
              : "text-slate-500 hover:text-slate-700"
            }`}
        >
          {tab.label}
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-black
            ${active === tab.key ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AttemptHistory() {
  const navigate = useNavigate();
  const { t }    = useTheme();

  const [attempts, setAttempts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [tab,      setTab]      = useState("all");
  const [sortBy,   setSortBy]   = useState("date");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res   = await axios.get(HISTORY_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = res.data?.data ?? res.data ?? [];
        const list = (Array.isArray(raw) ? raw : raw.attempts ?? raw.history ?? []).map(normalise);
        setAttempts(list);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
console.log(attempts)

  // derived
  const counts = {
    all:    attempts.length,
    passed: attempts.filter(a => a.pct >= 50).length,
    failed: attempts.filter(a => a.pct < 50).length,
  };

  let visible = [...attempts];
  if (tab === "passed") visible = visible.filter(a => a.pct >= 50);
  if (tab === "failed") visible = visible.filter(a => a.pct < 50);
  if (search.trim()) {
    const q = search.toLowerCase();
    visible = visible.filter(a =>
      a.quizTitle.toLowerCase().includes(q) || a.bundleTitle.toLowerCase().includes(q)
    );
  }
  visible.sort((a, b) => {
    if (sortBy === "score") return b.pct - a.pct;
    if (sortBy === "title") return a.quizTitle.localeCompare(b.quizTitle);
    return new Date(b.submittedAt ?? 0) - new Date(a.submittedAt ?? 0);
  });

  if (loading) return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-semibold">Loading your tests…</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-300`}>

      {/* ── Testbook-style teal header ── */}
      <div style={{ background: "linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #14b8a6 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-10">

          {/* nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/categories")}
              className="flex items-center gap-2 text-teal-100 hover:text-white text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <span className="text-teal-200 text-xs font-bold uppercase tracking-widest">My Tests</span>
            <div className="w-16" /> {/* spacer */}
          </div>

          {/* title */}
          <div className="mb-2">
            <h1 className="text-white text-2xl font-black mb-1">My Attempt History</h1>
            <p className="text-teal-200 text-sm">
              {attempts.length} test{attempts.length !== 1 ? "s" : ""} attempted
              {attempts.length > 0 && (
                <span> · Best score: {Math.max(...attempts.map(a => a.pct))}%</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── White lifted card body ── */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100 mb-8">

          {/* Summary strip */}
          {attempts.length > 0 && (
            <div className="border-b border-slate-100">
              <SummaryStrip attempts={attempts} />
            </div>
          )}

          <div className="p-5">

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center justify-between">
                <span>⚠️ {error}</span>
                <button onClick={() => setError(null)} className="font-bold ml-3">✕</button>
              </div>
            )}

            {attempts.length > 0 && (
              <>
                {/* Search + sort row */}
                <div className="flex gap-3 mb-5">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                      fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search tests…"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl
                        pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
                    />
                    {search && (
                      <button onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                        ✕
                      </button>
                    )}
                  </div>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
                  >
                    <option value="date">Latest First</option>
                    <option value="score">Highest Score</option>
                    <option value="title">A → Z</option>
                  </select>
                </div>

                {/* Tabs */}
                <TabBar active={tab} onChange={setTab} counts={counts} />
              </>
            )}

            {/* Empty — no attempts at all */}
            {attempts.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-3xl">
                  📋
                </div>
                <p className="font-black text-slate-700 text-lg">No Tests Attempted</p>
                <p className="text-sm text-slate-400 text-center max-w-xs">
                  Start taking quizzes to track your performance and progress here.
                </p>
                <button
                  onClick={() => navigate("/categories")}
                  className="mt-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors"
                >
                  Browse Tests
                </button>
              </div>
            )}

            {/* Empty — search/filter no match */}
            {attempts.length > 0 && visible.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-slate-400">
                <span className="text-4xl">🔍</span>
                <p className="font-bold text-sm">No tests found</p>
                <p className="text-xs">Try a different search or filter</p>
              </div>
            )}

            {/* Cards grid */}
            {visible.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visible.map((attempt, i) => (
                  <AttemptCard
                    key={attempt.id}
                    attempt={attempt}
                    index={i}
                    onView={(id) => navigate(`/result/${id}`)}
                    onLeaderboard={(quizId) => navigate(`/leaderboard/${quizId}`)}
                  />
                ))}
              </div>
            )}

            {/* Footer count */}
            {visible.length > 0 && (
              <p className="text-center text-xs text-slate-400 mt-6">
                {search
                  ? `${visible.length} of ${attempts.length} tests`
                  : `Showing all ${visible.length} test${visible.length !== 1 ? "s" : ""}`
                }
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}