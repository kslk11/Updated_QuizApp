"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../config/api";

const DASHBOARD_URL    = `${API_BASE_URL}/api/admin/dashboard`;
const TOP_STUDENTS_URL = `${API_BASE_URL}/api/student/dashboard/top-students`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// ── Animated counter ────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, start]);
  return val;
}

// ── Sparkline ───────────────────────────────────────────────────────────────
function Sparkline({ points, color, width = 80, height = 32 }) {
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline points={coords} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${height} ${coords} ${width},${height}`} fill={`${color}18`} stroke="none" />
    </svg>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, sparkPoints, delay, started }) {
  const animated = useCountUp(typeof value === "number" ? value : 0, 1400, started);
  const display  = typeof value === "number" ? animated : value;
  return (
    <div
      className="stat-card group relative overflow-hidden rounded-2xl border bg-white cursor-default"
      style={{ borderColor: `${color}35`, animationDelay: delay, boxShadow: `0 4px 20px ${color}12` }}
    >
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
            {icon}
          </div>
          {sparkPoints && <Sparkline points={sparkPoints} color={color} />}
        </div>
        <p className="text-3xl font-black tracking-tight mb-1" style={{ color }}>{display}</p>
        <p className="text-sm font-semibold text-slate-800 leading-tight">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ children, delay, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 fade-in ${className}`}
      style={{ animationDelay: delay }}>
      {children}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, accentColor, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 rounded-full" style={{ background: accentColor }} />
        <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">{title}</h3>
      </div>
      {action}
    </div>
  );
}

// ── Activity Row ──────────────────────────────────────────────────────────────
function ActivityRow({ icon, title, desc, time, color, badge }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-b-0 px-1 rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
          {badge && (
            <span className="text-xs px-1.5 py-0.5 rounded-md font-bold shrink-0"
              style={{ background: `${color}18`, color, border: `1px solid ${color}28` }}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">{desc}</p>
      </div>
      <span className="text-xs text-slate-400 shrink-0 mt-0.5">{time}</span>
    </div>
  );
}

// ── Donut Ring ────────────────────────────────────────────────────────────────
function DonutRing({ pct, color, size = 72, label, sublabel }) {
  const r    = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" opacity="0.3" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 1.2s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <p className="text-xs font-bold text-slate-800 text-center leading-tight">{label}</p>
      <p className="text-xs text-slate-400 text-center">{sublabel}</p>
    </div>
  );
}

// ── Quick Action ─────────────────────────────────────────────────────────────
function QuickAction({ icon, label, desc, color, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white transition-all duration-200 text-left group hover:scale-[1.01]"
      style={{ borderColor: `${color}28` }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}28` }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 group-hover:opacity-90 transition-opacity">{label}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform"
        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ec4899","#8b5cf6","#ef4444","#14b8a6"];
const avatarColor   = (name = "") => {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};
const RANK_COLORS = { 1: "#f59e0b", 2: "#94a3b8", 3: "#cd7f32" };

// ── Top Students ──────────────────────────────────────────────────────────────
function TopStudents() {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await axios.get(TOP_STUDENTS_URL, getAuthHeaders());
        const raw  = res.data?.data ?? res.data ?? [];
        const list = Array.isArray(raw) ? raw : raw.students ?? raw.top_students ?? [];
        setStudents(list.slice(0, 5));
      } catch { /* silently fail */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <SectionCard delay="480ms">
      <SectionHeader title="Top Students" accentColor="#ec4899"
        action={<span className="text-xs text-slate-400">This week</span>} />

      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-6 h-4 rounded bg-slate-100" />
              <div className="w-7 h-7 rounded-lg bg-slate-100" />
              <div className="flex-1 flex flex-col gap-1">
                <div className="h-3 rounded bg-slate-100 w-3/4" />
                <div className="h-2 rounded bg-slate-100 w-1/2" />
              </div>
              <div className="w-8 h-4 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {!loading && students.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
          <span className="text-3xl">🎓</span>
          <p className="text-xs font-semibold">No data yet</p>
        </div>
      )}

      {!loading && students.length > 0 && (
        <div className="flex flex-col gap-3">
          {students.map((s, i) => {
            const rank  = s.rank  ?? i + 1;
            const name  = s.student_name ?? s.name ?? s.username ?? `Student ${rank}`;
            const score = s.score ?? s.total_score ?? s.marks ?? 0;
            const att   = s.total_attempts ?? s.attempts ?? s.attempt_count ?? "—";
            const color = RANK_COLORS[rank] ?? avatarColor(name);
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 text-center shrink-0">
                  {rank <= 3
                    ? <span className="text-base">{["🥇","🥈","🥉"][rank - 1]}</span>
                    : <span className="text-xs font-black text-slate-400">#{rank}</span>
                  }
                </div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
                  style={{ background: avatarColor(name) }}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
                  <p className="text-xs text-slate-400">{att !== "—" ? `${att} attempts` : "—"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black" style={{ color }}>{score}</p>
                  <p className="text-xs text-slate-400 leading-none">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ── Greeting ──────────────────────────────────────────────────────────────────
const greeting = () => {
  const hr = new Date().getHours();
  if (hr < 12) return "Good morning";
  if (hr < 18) return "Good afternoon";
  return "Good evening";
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(DASHBOARD_URL, getAuthHeaders());
        setData(res.data?.data ?? res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
        setTimeout(() => setStarted(true), 100);
      }
    };
    load();
  }, []);

  const stats      = data ?? {};
  const students   = stats.total_students ?? 0;
  const clients    = stats.total_clients  ?? 0;
  const quizzes    = stats.total_quizzes  ?? 0;
  const attempts   = stats.total_attempts ?? 0;
  const avgRaw     = parseFloat(stats.average_score ?? 0);
  const avgPct     = Math.round(avgRaw > 1 ? avgRaw : avgRaw * 100);
  const completion = students > 0 && quizzes > 0
    ? Math.min(Math.round((attempts / (students * quizzes)) * 100), 100) : 0;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-semibold tracking-widest uppercase">Loading Dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8 fade-in">
          <h2 className="text-2xl font-black text-slate-900 mb-1">
            {greeting()}, <span style={{ color: "#6366f1" }}>SuperAdmin</span> 👋
          </h2>
          <p className="text-slate-400 text-sm">
            Here&apos;s what&apos;s happening with your quiz platform today.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="font-bold ml-4">✕</button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { icon: "👥", label: "Total Students", value: students,         sub: "+2 this week",      color: "#6366f1", sparkPoints: [2,3,2,4,3,5,students||5],       delay: "0ms"   },
            { icon: "🏢", label: "Active Clients",  value: clients,          sub: "All verified",      color: "#0ea5e9", sparkPoints: [1,2,1,2,3,2,clients||3],        delay: "80ms"  },
            { icon: "📝", label: "Total Quizzes",   value: quizzes,          sub: "3 published today", color: "#10b981", sparkPoints: [4,5,6,7,8,9,quizzes||11],       delay: "160ms" },
            { icon: "🎯", label: "Attempts",        value: attempts,         sub: "78% completion",    color: "#f59e0b", sparkPoints: [20,35,28,50,42,65,attempts||78], delay: "240ms" },
            { icon: "⭐", label: "Avg Score",       value: `${avgPct||90}%`, sub: "Above benchmark",   color: "#ec4899", sparkPoints: [70,75,68,82,79,88,avgPct||90],  delay: "320ms" },
          ].map((s) => (
            <StatCard key={s.label} {...s} started={started} />
          ))}
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Performance */}
          <SectionCard delay="200ms">
            <SectionHeader title="Performance" accentColor="#6366f1" />
            <div className="grid grid-cols-3 gap-3 mb-5">
              <DonutRing pct={avgPct||90}     color="#ec4899" label="Avg Score"  sublabel="overall"   />
              <DonutRing pct={completion||71} color="#10b981" label="Completion" sublabel="rate"      />
              <DonutRing pct={82}             color="#f59e0b" label="Engagement" sublabel="7-day avg" />
            </div>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              {[
                { label: "Pass Rate",       val: "68%", color: "#10b981" },
                { label: "Repeat Attempts", val: "34%", color: "#f59e0b" },
                { label: "Avg Time Taken",  val: "18m", color: "#0ea5e9" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-slate-400">{label}</span>
                  </div>
                  <span className="font-black" style={{ color }}>{val}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Recent Activity */}
          <SectionCard delay="300ms" className="lg:col-span-2">
            <SectionHeader title="Recent Activity" accentColor="#f59e0b"
              action={<button className="text-xs text-slate-400 font-semibold">View all →</button>} />
            <div>
              {[
                { icon: "🎓", title: "Rahul completed Java Advance Quiz",  desc: "Scored 10/10 · Rank #1",         time: "2m ago",  color: "#10b981", badge: "Perfect" },
                { icon: "👤", title: "New student registered",             desc: "tanshu · tanshu@email.com",      time: "14m ago", color: "#6366f1", badge: "New"     },
                { icon: "📝", title: "Quiz created: Python Basics",        desc: "By client Vijay · 15 questions", time: "1h ago",  color: "#0ea5e9"                   },
                { icon: "🎯", title: "vijay pankaj attempted quiz",        desc: "Java Advance Quiz · Score 8/10", time: "2h ago",  color: "#f59e0b"                   },
                { icon: "🏢", title: "New client onboarded",               desc: "TechCorp Solutions · 3 quizzes", time: "5h ago",  color: "#ec4899", badge: "Client"  },
                { icon: "⚠️", title: "Auto-submit triggered",              desc: "vijay pankaj · timer expired",   time: "6h ago",  color: "#ef4444"                   },
              ].map((a, i) => <ActivityRow key={i} {...a} />)}
            </div>
          </SectionCard>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick Actions */}
          <SectionCard delay="400ms">
            <SectionHeader title="Quick Actions" accentColor="#10b981" />
            <div className="flex flex-col gap-2.5">
              {[
                { icon: "➕", label: "Add New Student", desc: "Register a student",     color: "#6366f1", onClick: () => router.push("/admin/students/new") },
                { icon: "📝", label: "Create Quiz",     desc: "Build a new assessment", color: "#10b981", onClick: () => router.push("/admin/quizzes/new")  },
                { icon: "🏢", label: "Add Client",      desc: "Onboard a new client",   color: "#0ea5e9", onClick: () => router.push("/admin")              },
                { icon: "📊", label: "View Reports",    desc: "Detailed analytics",     color: "#f59e0b", onClick: () => router.push("/admin/reports")      },
              ].map((a) => <QuickAction key={a.label} {...a} />)}
            </div>
          </SectionCard>

          {/* Top Students */}
          <TopStudents />

          {/* System Status */}
          <SectionCard delay="560ms">
            <SectionHeader title="System Status" accentColor="#0ea5e9" />
            <div className="flex flex-col gap-3 mb-5">
              {[
                { label: "API Server",    status: "Operational", color: "#10b981" },
                { label: "Database",      status: "Operational", color: "#10b981" },
                { label: "Email Service", status: "Operational", color: "#10b981" },
                { label: "File Storage",  status: "Degraded",    color: "#f59e0b" },
                { label: "Auth Service",  status: "Operational", color: "#10b981" },
              ].map(({ label, status, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: color, boxShadow: `0 0 5px ${color}80` }} />
                    <span className="text-xs text-slate-400">{label}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color }}>{status}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Uptime (30d)</span>
                <span className="text-xs font-black text-emerald-500">99.8%</span>
              </div>
              <div className="flex gap-px">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="flex-1 h-4 rounded-sm"
                    style={{ background: i === 12 ? "#f59e0b" : "#10b981", opacity: 0.55 + (i % 3) * 0.15 }} />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 opacity-60">1 incident this month</p>
            </div>
          </SectionCard>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .fade-in   { animation: fadeInUp 0.45s ease both; }
        .stat-card {
          animation: fadeInUp 0.45s ease both;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
}