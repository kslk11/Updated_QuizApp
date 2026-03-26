"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import usePagination from "../../hooks/usePagination";
import useDebounce from "../../hooks/useDebounce";
import useTabSwitch from "../../hooks/useTabSwitch";
import { toast } from "react-toastify";


const CATEGORIES_URL_AUTH   = `${API_BASE_URL}/api/client/bundle`;
const CATEGORIES_URL_NOAUTH = `${API_BASE_URL}/api/client/bundlesNoauth`;

const stats = [
  { label: "Questions",  value: "500+" },
  { label: "Categories", value: "12"   },
  { label: "Players",    value: "10k+" },
];

export default function Home() {
  const router  = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch     = useDebounce(search, 500);

  const [count, setCount] = useState(0);
  
  useTabSwitch(() => {
    setCount((prev) => {
      const newCount = prev + 1;

      toast.error(`Warning! Tab switched ${newCount} times`);

      if (newCount >= 3) {
        alert("Quiz auto-submitted!");
        //call your submit API here
      }

      return newCount;
    });
  });

  const roleNum = typeof window !== "undefined"
    ? Number(localStorage.getItem("role") ?? 0)
    : 0;
  const categoriesUrl = roleNum === 2 ? CATEGORIES_URL_AUTH : CATEGORIES_URL_NOAUTH;
  
  const {
    data: categories,
    loading,
    currentPage,
    totalPages,
    pageNumbers,
    hasPrev,
    hasNext,
    fetchData,
    goToPage,
  } = usePagination(categoriesUrl, { itemsPerPage: 6 });

  useEffect(() => {
    fetchData({ page: currentPage, search: debouncedSearch });
  }, [currentPage, debouncedSearch]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <span className="inline-block text-xs uppercase tracking-widest font-bold px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 mb-6">
          🎯 Challenge Your Mind
        </span>
        <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-tight text-slate-900 mb-4">
          Learn. Play.{" "}
          <span className="text-indigo-600">Dominate.</span>
        </h2>
        <p className="text-slate-500 max-w-md mx-auto text-base leading-relaxed mb-8">
          Explore hundreds of curated quizzes across science, history, tech, and more.
          Track your progress and rise through the leaderboard.
        </p>
        <Link
          href="/categories"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-xl font-bold text-sm shadow-md transition-all"
        >
          Start Quiz →
        </Link>

        {/* Stats */}
        <div className="flex justify-center gap-12 mt-14 pt-10 border-t border-slate-100">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black text-indigo-600">{value}</div>
              <div className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wider">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-900">Popular Categories</h3>
          <Link href="/categories" className="text-sm font-semibold text-indigo-600 hover:underline">
            View all →
          </Link>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full mb-6 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <div
                key={cat.id ?? i}
                onClick={() => router.push(`/categories/${cat.id}/sets`)}
                className="bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl p-5 flex items-center gap-4 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="font-bold text-sm text-slate-900">{cat.title}</div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!hasPrev}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>

            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold border transition ${
                    p === currentPage
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNext}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}