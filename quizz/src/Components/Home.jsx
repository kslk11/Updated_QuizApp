import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../Hooks/useTheame";
import usePagination from "../Hooks/usePagination";
import { API_BASE_URL } from "../config/api";
import { useEffect } from "react";

const CATEGORIES_URL_AUTH   = `${API_BASE_URL}/api/client/bundle`;
const CATEGORIES_URL_NOAUTH = `${API_BASE_URL}/api/client/bundlesNoauth`;

const stats = [
  { label: "Questions", value: "500+" },
  { label: "Categories", value: "12" },
  { label: "Players", value: "10k+" },
];

const Home = () => {
  const roleNum       = Number(localStorage.getItem("role") ?? 0);
const categoriesUrl = roleNum === 2 ? CATEGORIES_URL_AUTH : CATEGORIES_URL_NOAUTH;
const navigate=useNavigate()
  const { t } = useTheme();
  const {
    data: categories,
    currentPage,
    fetchData,
  } = usePagination(categoriesUrl, { itemsPerPage: 6 });

useEffect(() => {
    fetchData({ page: currentPage});
  }, [currentPage]);
console.log("categories",categories);
  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-300`}>
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <span className={`inline-block text-xs uppercase tracking-widest font-bold px-4 py-1.5 rounded-full border ${t.badge} mb-6`}>
          🎯 Challenge Your Mind
        </span>
        <h2 className={`text-5xl md:text-6xl font-black tracking-tight leading-tight ${t.text} mb-4`}>
          Learn. Play. <span className={t.accent}>Dominate.</span>
        </h2>
        <p className={`${t.textSecondary} max-w-md mx-auto text-base leading-relaxed mb-8`}>
          Explore hundreds of curated quizzes across science, history, tech, and more. Track your progress and rise through the leaderboard.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/categories"
            className={`${t.accentBg} ${t.accentBgHover} text-white px-7 py-3 rounded-xl font-bold text-sm shadow-md transition-all`}
          >
            Start Quiz →
          </Link>
        </div>

        <div className={`flex justify-center gap-12 mt-14 pt-10 border-t ${t.borderSubtle}`}>
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className={`text-3xl font-black ${t.accent}`}>{value}</div>
              <div className={`text-xs ${t.textMuted} mt-1 font-medium uppercase tracking-wider`}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-black ${t.text}`}>Popular Categories</h3>
          <Link to="/categories" className={`text-sm font-semibold ${t.accent} hover:underline`}>
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat,i) => (
            <div
              onClick={() => navigate(`/categories/${cat.id}/sets`)}
              key={i}
              className={`${t.bgCard} border ${t.border} ${t.bgCardHover} rounded-2xl p-5 flex items-center gap-4 transition-all group shadow-sm hover:shadow-md ${t.shadow}`}
            >
              {/* <span className="text-3xl">{emoji}</span> */}
              <div>
                <div className={`font-bold text-sm ${t.text}`}>{cat.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;