import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../Hooks/useTheame";
import { API_BASE_URL } from "../config/api";

const LEADERBOARD_URL = `${API_BASE_URL}/api/student/quiz`;
const INITIAL_SHOW    = 5;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const initials = (name = "") =>
  name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";

const AVATAR_PALETTE = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];
const avatarBg = (name = "") => {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
};

// ─── Top-3 Podium ──────────────────────────────────────────────────────────────
function Podium({ top3 }) {
  if (!top3.length) return null;
  const first  = top3[0];
  const second = top3[1] ?? null;
  const third  = top3[2] ?? null;

  const slots = [
    { entry: second, rank: 2, podiumH: 72, avatarSz: 48, podiumColor: "#94a3b8" },
    { entry: first,  rank: 1, podiumH: 96, avatarSz: 64, podiumColor: "#f59e0b" },
    { entry: third,  rank: 3, podiumH: 56, avatarSz: 44, podiumColor: "#cd7f32" },
  ];
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div className="flex items-end justify-center gap-4 mb-0">
      {slots.map(({ entry, rank, podiumH, avatarSz, podiumColor }) => {
        if (!entry) return <div key={rank} style={{ width: 88 }} />;
        const bg = avatarBg(entry.student_name);
        return (
          <div key={rank} className="flex flex-col items-center" style={{ width: 88 }}>
            {rank === 1 && (
              <div className="text-2xl mb-1" style={{ animation: "crownBounce 2s infinite" }}>👑</div>
            )}
            <div
              className="rounded-full flex items-center justify-center text-white font-black shadow-lg mb-2"
              style={{
                width: avatarSz, height: avatarSz,
                background: bg,
                fontSize: avatarSz > 50 ? 20 : 14,
                border: `3px solid ${podiumColor}`,
                boxShadow: `0 0 0 3px ${podiumColor}40`,
              }}
            >
              {initials(entry.student_name)}
            </div>
            <span className="text-xl mb-0.5">{medals[rank]}</span>
            <p className="text-white text-xs font-bold text-center leading-tight mb-0.5 max-w-[80px] truncate">
              {entry.student_name}
            </p>
            <p className="text-xs font-black mb-2" style={{ color: podiumColor }}>
              {entry.score} pts
            </p>
            <div
              className="w-full rounded-t-xl flex items-center justify-center text-white font-black text-lg shadow-inner"
              style={{
                height: podiumH,
                background: `linear-gradient(180deg, ${podiumColor} 0%, ${podiumColor}bb 100%)`,
              }}
            >
              {rank}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score, maxScore }) {
  const pct   = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const color = pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2 w-28">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-black text-slate-500 w-8 text-right shrink-0">{pct}%</span>
    </div>
  );
}

// ─── Rank Row ──────────────────────────────────────────────────────────────────
function RankRow({ entry, maxScore, isCurrentUser, isEven, animDelay }) {
  const bg         = avatarBg(entry.student_name);
  const rankColors = { 1: "#f59e0b", 2: "#94a3b8", 3: "#cd7f32" };
  const isTop3     = entry.rank <= 3;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 transition-all duration-300 border-b last:border-b-0
        ${isCurrentUser
          ? "bg-indigo-50 border-b-indigo-100"
          : isEven ? "bg-white border-b-slate-50" : "bg-slate-50/60 border-b-slate-100"
        } hover:bg-indigo-50/60`}
      style={{
        animation: `rowSlideIn 0.35s ease both`,
        animationDelay: animDelay,
      }}
    >
      {/* Rank */}
      <div className="w-8 shrink-0 text-center">
        {isTop3
          ? <span className="text-lg">{["🥇","🥈","🥉"][entry.rank - 1]}</span>
          : <span className="text-sm font-black text-slate-400">{entry.rank}</span>
        }
      </div>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm"
        style={{ background: bg }}
      >
        {initials(entry.student_name)}
      </div>

      {/* Name + date */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className={`text-sm font-bold truncate ${isCurrentUser ? "text-indigo-700" : "text-slate-800"}`}>
            {entry.student_name}
          </p>
          {isCurrentUser && (
            <span className="text-xs bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full font-bold shrink-0">
              You
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">{fmtDateTime(entry.submitted_at)}</p>
      </div>

      {/* Score bar */}
      <div className="hidden sm:block shrink-0">
        <ScoreBar score={entry.score} maxScore={maxScore} />
      </div>

      {/* Score */}
      <div className="shrink-0 text-right">
        <p
          className="text-base font-black"
          style={{ color: isTop3 ? rankColors[entry.rank] : entry.score > 0 ? "#6366f1" : "#94a3b8" }}
        >
          {entry.score}
        </p>
        <p className="text-xs text-slate-400 leading-none">pts</p>
      </div>
    </div>
  );
}

// ─── Show More / Less Button ───────────────────────────────────────────────────
function ExpandButton({ showAll, onClick, hiddenCount }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-3.5 px-4
        bg-gradient-to-r from-indigo-50 to-slate-50
        hover:from-indigo-100 hover:to-indigo-50
        border-t border-slate-100 transition-all duration-200 group"
    >
      {/* Animated arrow icon */}
      <span
        className="w-6 h-6 rounded-full bg-indigo-100 group-hover:bg-indigo-200
          flex items-center justify-center transition-all duration-300"
        style={{
          animation: showAll ? "arrowPulseUp 1.5s ease-in-out infinite" : "arrowPulseDown 1.5s ease-in-out infinite",
        }}
      >
        <svg
          className="w-3.5 h-3.5 text-indigo-600 transition-transform duration-300"
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          style={{ transform: showAll ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>

      <span className="text-sm font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
        {showAll ? "Show Less" : `Show More  (+${hiddenCount} more)`}
      </span>
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function Leaderboard() {
  const { quizId } = useParams();
  const navigate   = useNavigate();
  const { t }      = useTheme();

  const [entries,   setEntries]   = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState("");
  const [showAll,   setShowAll]   = useState(false);

  const currentStudentName = localStorage.getItem("studentName") ?? "";

  useEffect(() => {
    if (!quizId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res   = await axios.get(`${LEADERBOARD_URL}/${quizId}/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = res.data?.data ?? res.data ?? [];
        setEntries(Array.isArray(raw) ? raw : []);
        if (res.data?.quiz_title) setQuizTitle(res.data.quiz_title);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId]);

  const maxScore       = entries.length > 0 ? Math.max(...entries.map(e => e.score)) : 0;
  const myEntry        = entries.find(e => e.student_name === currentStudentName);
  const totalAttempts  = entries.length;
  const avgScore       = totalAttempts > 0
    ? Math.round(entries.reduce((s, e) => s + e.score, 0) / totalAttempts) : 0;
  const top3           = entries.slice(0, 3);

  // Filter by search, then slice for show more/less
  const filtered     = search.trim()
    ? entries.filter(e => e.student_name.toLowerCase().includes(search.toLowerCase()))
    : entries;

  const displayed    = (search.trim() || showAll) ? filtered : filtered.slice(0, INITIAL_SHOW);
  const hiddenCount  = filtered.length - INITIAL_SHOW;
  const canExpand    = !search.trim() && hiddenCount > 0;

  // Reset showAll when search changes
  const handleSearch = (val) => {
    setSearch(val);
    setShowAll(false);
  };

  const handleToggle = () => setShowAll(prev => !prev);

  // ── Loading
  if (loading) return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center`}>
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${t.bg}`} style={{ fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Dark navy header ── */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1d4ed8 100%)" }}>
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-0">

          {/* Nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-indigo-200 hover:text-white text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-indigo-200 text-xs font-semibold">LIVE</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm
              border border-white/20 rounded-full px-4 py-1.5 mb-3">
              <span className="text-lg">🏆</span>
              <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Leaderboard</span>
            </div>
            <h1 className="text-white text-2xl font-black leading-tight mb-1">
              {quizTitle || "Quiz Rankings"}
            </h1>
            <p className="text-indigo-300 text-sm">
              {totalAttempts} attempt{totalAttempts !== 1 ? "s" : ""} &nbsp;·&nbsp; Avg: {avgScore} pts
            </p>
          </div>

          {/* Your rank banner */}
          {myEntry && (
            <div className="mb-6 mx-2 bg-white/10 backdrop-blur-sm border border-white/20
              rounded-2xl px-5 py-3 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0"
                style={{ background: avatarBg(myEntry.student_name) }}
              >
                {initials(myEntry.student_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-xs font-semibold">Your Rank</p>
                <p className="text-white font-black text-base leading-tight truncate">
                  #{myEntry.rank} &nbsp;·&nbsp; {myEntry.student_name}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-amber-400 text-xl font-black">{myEntry.score}</p>
                <p className="text-indigo-300 text-xs">points</p>
              </div>
            </div>
          )}

          {/* Podium */}
          {entries.length > 0 && <Podium top3={top3} />}
        </div>
      </div>

      {/* ── White card list ── */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden -mt-2">

          {/* Search bar */}
          <div className="px-4 pt-5 pb-3 border-b border-slate-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search student name…"
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl
                  pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
              {search && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                >✕</button>
              )}
            </div>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border-b border-slate-100">
            <span className="w-8 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">#</span>
            <span className="w-9 shrink-0" />
            <span className="flex-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</span>
            <span className="hidden sm:block w-28 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Progress</span>
            <span className="w-10 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Score</span>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-6 text-center">
              <p className="text-rose-500 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Empty */}
          {!error && displayed.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <span className="text-4xl">{search ? "🔍" : "🏆"}</span>
              <p className="font-semibold text-sm">
                {search ? `No results for "${search}"` : "No attempts yet"}
              </p>
            </div>
          )}

          {/* Rows */}
          {displayed.map((entry, i) => (
            <RankRow
              key={`${entry.rank}-${i}`}
              entry={entry}
              maxScore={maxScore}
              isCurrentUser={entry.student_name === currentStudentName}
              isEven={i % 2 === 0}
              animDelay={`${i * 45}ms`}
            />
          ))}

          {/* ── Show More / Less ── */}
          {canExpand && (
            <ExpandButton
              showAll={showAll}
              onClick={handleToggle}
              hiddenCount={hiddenCount}
            />
          )}

          {/* Footer count */}
          {displayed.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                {search
                  ? `${displayed.length} of ${entries.length} entries`
                  : `Showing ${displayed.length} of ${entries.length} attempt${entries.length !== 1 ? "s" : ""}`
                }
              </p>
            </div>
          )}
        </div>

        <div className="h-10" />
      </div>

      <style>{`
        @keyframes crownBounce {
          0%, 100% { transform: translateY(0);   }
          50%       { transform: translateY(-6px); }
        }
        @keyframes rowSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes arrowPulseDown {
          0%, 100% { transform: translateY(0);    }
          50%       { transform: translateY(2px); }
        }
        @keyframes arrowPulseUp {
          0%, 100% { transform: translateY(0);     }
          50%       { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}