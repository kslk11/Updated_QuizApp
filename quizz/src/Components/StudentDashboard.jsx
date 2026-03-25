import axios from "axios";
import { useCallback, useEffect, useState } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/";
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── VIEWS ────────────────────────────────────────────────────────────────────
const VIEW = { BUNDLES: "bundles", QUIZZES: "quizzes", QUIZ: "quiz", RESULT: "result" };

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  Bundle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  Quiz: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  ),
  Back: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  Trophy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8">
      <path d="M6 9H4a2 2 0 01-2-2V5h4M18 9h2a2 2 0 002-2V5h-4"/><path d="M6 9a6 6 0 0012 0M8 21h8M12 15v6"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  ),
};

// ─── BUNDLE CARD ──────────────────────────────────────────────────────────────
const BUNDLE_COLORS = [
  { bg: "from-orange-400 to-rose-500",   light: "bg-orange-50",  text: "text-orange-600"  },
  { bg: "from-sky-400 to-indigo-500",    light: "bg-sky-50",     text: "text-sky-600"     },
  { bg: "from-emerald-400 to-teal-500",  light: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "from-violet-400 to-purple-600", light: "bg-violet-50",  text: "text-violet-600"  },
  { bg: "from-amber-400 to-orange-500",  light: "bg-amber-50",   text: "text-amber-600"   },
  { bg: "from-pink-400 to-rose-500",     light: "bg-pink-50",    text: "text-pink-600"    },
];

function BundleCard({ bundle, index, onClick }) {
  const color = BUNDLE_COLORS[index % BUNDLE_COLORS.length];
  const initials = (bundle.title || bundle.name || "?")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 text-left w-full overflow-hidden"
      style={{ animationFillMode: "both" }}
    >
      {/* Background accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color.bg} opacity-10 rounded-full translate-x-8 -translate-y-8 group-hover:opacity-20 transition-opacity`} />

      {/* Avatar */}
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color.bg} flex items-center justify-center text-white font-black text-xl mb-4 shadow-md`}>
        {initials}
      </div>

      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">
        {bundle.title || bundle.name}
      </h3>
      <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
        {bundle.description || "Explore quizzes in this bundle"}
      </p>

      <div className={`mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${color.light} ${color.text}`}>
        <Icon.Quiz />
        View Quizzes →
      </div>
    </button>
  );
}

// ─── QUIZ CARD ────────────────────────────────────────────────────────────────
function QuizCard({ quiz, onStart, starting }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-base leading-snug">
            {quiz.title || quiz.name}
          </h3>
          <p className="text-slate-400 text-sm mt-1 line-clamp-2">
            {quiz.description || "Test your knowledge with this quiz"}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
          <Icon.Quiz />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        {quiz.questions_count !== undefined && (
          <span className="flex items-center gap-1">
            <Icon.Quiz />
            {quiz.questions_count} questions
          </span>
        )}
        {quiz.duration_minutes !== undefined && (
          <span className="flex items-center gap-1">
            <Icon.Clock />
            {quiz.duration_minutes} min
          </span>
        )}
      </div>

      <button
        onClick={() => onStart(quiz)}
        disabled={starting === quiz.id}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-2xl text-sm transition-all shadow-md hover:shadow-indigo-200 hover:shadow-lg"
      >
        {starting === quiz.id ? "Starting…" : "Start Quiz"}
      </button>
    </div>
  );
}

// ─── QUIZ PLAYER ──────────────────────────────────────────────────────────────
function QuizPlayer({ attemptId, questions, quizTitle, onFinish }) {
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState(null);

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  const select = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // Format: [{ question_id, selected_option_id }]
      const formatted = Object.entries(answers).map(([question_id, selected_option_id]) => ({
        question_id: Number(question_id),
        selected_option_id: Number(selected_option_id),
      }));
      const res = await api.post(`/api/student/submit-quiz/${attemptId}`, {
        attempt_id: attemptId,
        answers: formatted,
      });
      onFinish(res.data.score);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSubmitting(false);
    }
  };

  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-500">
            Question {current + 1} / {questions.length}
          </span>
          <span className="text-sm font-bold text-indigo-600">
            {Object.keys(answers).length} answered
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6">
        <p className="text-slate-800 font-semibold text-lg leading-relaxed mb-6">
          {q.question_text || q.text || q.question}
        </p>

        <div className="flex flex-col gap-3">
          {(q.options || q.choices || []).map((opt) => {
            const optId   = opt.id ?? opt._id;
            const optText = opt.option_text ?? opt.text ?? opt.label;
            const selected = answers[q.id] === optId;

            return (
              <button
                key={optId}
                onClick={() => select(q.id, optId)}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-medium text-sm transition-all duration-200
                  ${selected
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                    : "border-slate-100 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50"
                  }`}
              >
                <span className={`inline-flex w-6 h-6 rounded-full border-2 mr-3 items-center justify-center text-xs font-bold shrink-0
                  ${selected ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-300"}`}
                >
                  {selected ? "✓" : String.fromCharCode(65 + (q.options || q.choices || []).indexOf(opt))}
                </span>
                {optText}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex-1 border-2 border-slate-200 text-slate-600 font-semibold py-3 rounded-2xl text-sm hover:border-slate-300 disabled:opacity-40 transition-all"
        >
          ← Previous
        </button>

        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent((c) => c + 1)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-sm transition-all shadow-md"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 rounded-2xl text-sm transition-all shadow-md disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit Quiz 🎯"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── RESULT VIEW ──────────────────────────────────────────────────────────────
function ResultView({ score, quizTitle, onBack }) {
  const pct = score?.percentage ?? score?.score ?? 0;
  const correct = score?.correct_answers ?? score?.correct ?? "-";
  const total   = score?.total_questions ?? score?.total   ?? "-";

  const grade =
    pct >= 80 ? { label: "Excellent!", color: "text-emerald-600", bg: "from-emerald-400 to-teal-500" } :
    pct >= 60 ? { label: "Good Job!",  color: "text-indigo-600",  bg: "from-indigo-400 to-violet-500" } :
                { label: "Keep Going!", color: "text-amber-600",  bg: "from-amber-400 to-orange-500" };

  return (
    <div className="max-w-md mx-auto text-center">
      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${grade.bg} flex items-center justify-center mx-auto mb-6 shadow-xl text-white`}>
        <Icon.Trophy />
      </div>

      <h2 className="text-3xl font-black text-slate-800 mb-1">{grade.label}</h2>
      <p className="text-slate-400 mb-8">You completed <span className="font-semibold text-slate-600">{quizTitle}</span></p>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
        <div className={`text-6xl font-black ${grade.color} mb-1`}>{pct}%</div>
        <p className="text-slate-400 text-sm mb-6">Overall Score</p>

        <div className="flex justify-center gap-8">
          <div>
            <div className="text-2xl font-black text-slate-800">{correct}</div>
            <div className="text-xs text-slate-400 mt-0.5">Correct</div>
          </div>
          <div className="w-px bg-slate-100" />
          <div>
            <div className="text-2xl font-black text-slate-800">{total}</div>
            <div className="text-xs text-slate-400 mt-0.5">Total</div>
          </div>
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

// ─── MAIN STUDENT DASHBOARD ───────────────────────────────────────────────────
export default function StudentDashboard({ student, onLogout }) {
  const [view, setView]         = useState(VIEW.BUNDLES);
  const [bundles, setBundles]   = useState([]);
  const [quizzes, setQuizzes]   = useState([]);
  const [loadingBundles, setLoadingBundles] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [activeBundle, setActiveBundle]     = useState(null);
  const [activeQuiz, setActiveQuiz]         = useState(null);
  const [attemptId, setAttemptId]           = useState(null);
  const [questions, setQuestions]           = useState([]);
  const [startingQuiz, setStartingQuiz]     = useState(null);
  const [score, setScore]                   = useState(null);
  const [error, setError]                   = useState(null);

  // ── Fetch bundles
  useEffect(() => {
    setLoadingBundles(true);
    api.get("/api/client/bundles")
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setBundles(d?.bundles ?? d?.categories ?? (Array.isArray(d) ? d : []));
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoadingBundles(false));
  }, []);

  // ── Open bundle → fetch its quizzes
  const openBundle = useCallback(async (bundle) => {
    setActiveBundle(bundle);
    setView(VIEW.QUIZZES);
    setLoadingQuizzes(true);
    setError(null);
    const bundleId = bundle.id ?? bundle._id;
    try {
      const res = await api.get(`/api/client/quizzes/${bundleId}`);
      const d   = res.data?.data ?? res.data;
      setQuizzes(d?.quizzes ?? d?.sets ?? (Array.isArray(d) ? d : []));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoadingQuizzes(false);
    }
  }, []);

  // ── Start quiz → fetch questions
  const startQuiz = useCallback(async (quiz) => {
    setStartingQuiz(quiz.id ?? quiz._id);
    setError(null);
    try {
      const quizId = quiz.id ?? quiz._id;

      // 1. Create attempt
      const attemptRes = await api.post(`/api/student/start-quiz/${quizId}`);
      const aId = attemptRes.data?.attempt_id;

      // 2. Fetch questions for the quiz
      const qRes = await api.get(`/api/client/questions/${quizId}`);
      const d    = qRes.data?.data ?? qRes.data;
      const qs   = d?.questions ?? (Array.isArray(d) ? d : []);

      setAttemptId(aId);
      setQuestions(qs);
      setActiveQuiz(quiz);
      setView(VIEW.QUIZ);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setStartingQuiz(null);
    }
  }, []);

  // ── Quiz submitted
  const handleFinish = (scoreData) => {
    setScore(scoreData);
    setView(VIEW.RESULT);
  };

  // ── Back handlers
  const goToBundles = () => { setView(VIEW.BUNDLES); setActiveBundle(null); setQuizzes([]); setError(null); };
  const goToQuizzes = () => { setView(VIEW.QUIZZES); setActiveQuiz(null); setAttemptId(null); setQuestions([]); setError(null); };

  // ── Breadcrumb label
  const breadcrumb = {
    [VIEW.BUNDLES]: null,
    [VIEW.QUIZZES]: { label: "Bundles", action: goToBundles },
    [VIEW.QUIZ]:    { label: activeBundle?.title ?? activeBundle?.name ?? "Quizzes", action: goToQuizzes },
    [VIEW.RESULT]:  null,
  }[view];

  const studentName = student?.name ?? student?.username ?? "Student";
  const initials    = studentName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back button */}
            {breadcrumb && (
              <button
                onClick={breadcrumb.action}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <Icon.Back />
                {breadcrumb.label}
              </button>
            )}
            {/* Title */}
            <div>
              {view === VIEW.BUNDLES && (
                <h1 className="text-xl font-black text-slate-800">My Dashboard</h1>
              )}
              {view === VIEW.QUIZZES && (
                <h1 className="text-xl font-black text-slate-800">
                  {activeBundle?.title ?? activeBundle?.name}
                </h1>
              )}
              {view === VIEW.QUIZ && (
                <h1 className="text-xl font-black text-slate-800">
                  {activeQuiz?.title ?? activeQuiz?.name}
                </h1>
              )}
              {view === VIEW.RESULT && (
                <h1 className="text-xl font-black text-slate-800">Quiz Result</h1>
              )}
            </div>
          </div>

          {/* Student avatar + logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700">{studentName}</p>
              <p className="text-xs text-slate-400">{student?.email ?? "Student"}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black text-sm flex items-center justify-center shadow-md">
              {initials}
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-9 h-9 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 flex items-center justify-center transition-all"
                title="Logout"
              >
                <Icon.Logout />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Global error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 font-bold ml-4">✕</button>
          </div>
        )}

        {/* ── BUNDLES VIEW ── */}
        {view === VIEW.BUNDLES && (
          <>
            {/* Welcome banner */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 mb-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-16 -translate-y-16" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-10 translate-y-10" />
              <div className="relative">
                <p className="text-indigo-200 text-sm font-semibold mb-1">Welcome back 👋</p>
                <h2 className="text-3xl font-black mb-2">{studentName}</h2>
                <p className="text-indigo-100 text-sm max-w-sm">
                  Pick a bundle below and start testing your knowledge. Every quiz counts!
                </p>
              </div>
            </div>

            <h2 className="text-lg font-black text-slate-700 mb-5">
              Available Bundles
              {bundles.length > 0 && (
                <span className="ml-2 text-sm font-semibold text-slate-400">({bundles.length})</span>
              )}
            </h2>

            {loadingBundles ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : bundles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                <span className="text-5xl">📦</span>
                <p className="font-semibold">No bundles available yet</p>
                <p className="text-sm">Check back later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {bundles.map((bundle, i) => (
                  <BundleCard
                    key={bundle.id ?? bundle._id}
                    bundle={bundle}
                    index={i}
                    onClick={() => openBundle(bundle)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── QUIZZES VIEW ── */}
        {view === VIEW.QUIZZES && (
          <>
            <p className="text-slate-400 text-sm mb-6">
              {activeBundle?.description || "Select a quiz to begin"}
            </p>

            {loadingQuizzes ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : quizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                <span className="text-5xl">📝</span>
                <p className="font-semibold">No quizzes in this bundle yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id ?? quiz._id}
                    quiz={quiz}
                    onStart={startQuiz}
                    starting={startingQuiz}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── QUIZ PLAYER VIEW ── */}
        {view === VIEW.QUIZ && questions.length > 0 && (
          <QuizPlayer
            attemptId={attemptId}
            questions={questions}
            quizTitle={activeQuiz?.title ?? activeQuiz?.name}
            onFinish={handleFinish}
          />
        )}

        {view === VIEW.QUIZ && questions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm">Loading questions…</p>
          </div>
        )}

        {/* ── RESULT VIEW ── */}
        {view === VIEW.RESULT && (
          <ResultView
            score={score}
            quizTitle={activeQuiz?.title ?? activeQuiz?.name}
            onBack={goToBundles}
          />
        )}
      </main>
    </div>
  );
}