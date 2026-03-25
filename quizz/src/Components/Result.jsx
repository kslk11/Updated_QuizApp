import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../Hooks/useTheame";
import { API_BASE_URL } from "../config/api";

const RESULT_URL = `${API_BASE_URL}/api/student/result`;

const OPTIONS_LIST = [
  { key: "option_a", label: "A" },
  { key: "option_b", label: "B" },
  { key: "option_c", label: "C" },
  { key: "option_d", label: "D" },
];

const toLabel = (key) => key?.replace("option_", "").toUpperCase() ?? "—";

export default function Result() {
  const { resultId } = useParams();
  const navigate     = useNavigate();
  const { t }        = useTheme();

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!resultId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res   = await axios.get(`${RESULT_URL}/${resultId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResult(res.data?.data ?? res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load result.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resultId]);
console.log(result)
  if (loading) return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center`}>
      <div className={`w-10 h-10 border-4 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
    </div>
  );

  if (error || !result) return (
    <div className={`min-h-screen ${t.bg} flex flex-col items-center justify-center gap-4`}>
      <span className="text-5xl">⚠️</span>
      <p className={`text-lg font-bold ${t.text}`}>{error ?? "Result not found"}</p>
      <button onClick={() => navigate("/categories")} className={`${t.accentBg} text-white px-5 py-2 rounded-xl font-semibold text-sm`}>
        Go to Categories
      </button>
    </div>
  );

  // Normalise — matches exactly what studentService.getResult() returns
  const correct       = result.correct_answers ?? 0;
  const wrong         = result.wrong_answers   ?? 0;
  const skipped       = result.skipped         ?? 0;
  const scored        = result.scored          ?? result.score ?? 0;
  const totalMarks    = result.total_marks     ?? 0;
  const percent       = result.percentage      ?? 0;
  const autoSubmitted = result.auto_submitted  ?? false;
  const quizTitle     = result.quiz_title      ?? "";
  const answers       = result.answers         ?? [];
  const passed        = percent >= 50;

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-300 py-10 px-4`}>
      <div className="max-w-2xl mx-auto">

        {/* Score card */}
        <div className={`${t.bgCard} border ${t.border} rounded-3xl p-8 shadow-xl text-center mb-6`}>
          <div className="text-6xl mb-3">{passed ? "🎉" : "😔"}</div>
          <h1 className={`text-2xl font-black ${t.text} mb-1`}>
            {autoSubmitted ? "Time's Up! Auto Submitted" : "Quiz Submitted"}
          </h1>
          {quizTitle && <p className={`text-sm ${t.textMuted} mb-2`}>{quizTitle}</p>}
          <p className={`text-sm font-semibold mb-6 ${passed ? "text-emerald-500" : "text-rose-500"}`}>
            {passed ? "✓ Passed" : "✗ Not Passed"} — minimum 50% required
          </p>

          {/* Score circle */}
          <div className={`w-32 h-32 rounded-full mx-auto flex flex-col items-center justify-center mb-8 border-4
            ${passed ? t.accentBorder : "border-rose-400"}`}
          >
            <span className={`text-3xl font-black ${passed ? t.accent : "text-rose-500"}`}>{percent}%</span>
            <span className={`text-xs font-semibold ${t.textMuted}`}>{scored} / {totalMarks}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Correct", value: correct, emoji: "✅", bg: "bg-emerald-50 border-emerald-200", color: "text-emerald-600" },
              { label: "Wrong",   value: wrong,   emoji: "❌", bg: "bg-rose-50 border-rose-200",       color: "text-rose-600"    },
              { label: "Skipped", value: skipped, emoji: "⏭",  bg: "bg-amber-50 border-amber-200",    color: "text-amber-600"   },
            ].map(({ label, value, emoji, bg, color }) => (
              <div key={label} className={`rounded-2xl border p-4 ${bg}`}>
                <div className="text-2xl mb-1">{emoji}</div>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className={`text-xs font-semibold ${color} opacity-80 mt-0.5`}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Answer review */}
        {answers.length > 0 && (
          <div className={`${t.bgCard} border ${t.border} rounded-3xl p-6 shadow-sm mb-6`}>
            <h2 className={`text-lg font-black ${t.text} mb-4`}>Answer Review</h2>
            <div className="flex flex-col gap-3">
              {answers.map((a, i) => {
                const isCorrect      = a.is_correct      ?? false;
                const selectedOption = a.selected_option ?? null;  // "option_a" | null
                const correctOption  = a.correct_option  ?? null;  // "option_b" etc.
                const wasSkipped     = selectedOption === null;

                return (
                  <div
                    key={i}
                    className={`rounded-xl border p-4 text-sm
                      ${wasSkipped ? `${t.bgCard} ${t.border}` :
                        isCorrect  ? "bg-emerald-50 border-emerald-200" :
                                     "bg-rose-50 border-rose-200"}`}
                  >
                    {/* Question */}
                    <div className="flex items-start gap-2 mb-3">
                      <span className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-black
                        ${isCorrect  ? "bg-emerald-500 text-white" :
                          wasSkipped ? `${t.accentLight} ${t.accentText}` :
                                       "bg-rose-500 text-white"}`}
                      >
                        {i + 1}
                      </span>
                      <p className={`font-semibold leading-snug ${t.text}`}>{a.question}</p>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      {OPTIONS_LIST.map(({ key, label }) => {
                        const optionText   = a[key];
                        if (!optionText) return null;
                        const isChosenOpt  = selectedOption === key;
                        const isCorrectOpt = correctOption  === key;

                        return (
                          <div
                            key={key}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs
                              ${isCorrectOpt
                                ? "bg-emerald-100 border-emerald-300 font-semibold text-emerald-700"
                                : isChosenOpt && !isCorrectOpt
                                  ? "bg-rose-100 border-rose-300 text-rose-700"
                                  : `${t.bgCard} ${t.border} ${t.textMuted}`}`}
                          >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-xs shrink-0
                              ${isCorrectOpt ? "bg-emerald-500 text-white" :
                                isChosenOpt  ? "bg-rose-400 text-white" :
                                               `${t.accentLight} ${t.accentText}`}`}
                            >
                              {label}
                            </span>
                            <span className="truncate">{optionText}</span>
                            {isCorrectOpt                 && <span className="ml-auto">✓</span>}
                            {isChosenOpt && !isCorrectOpt && <span className="ml-auto">✗</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary */}
                    <div className="flex gap-4 text-xs mt-1 flex-wrap">
                      <span className={wasSkipped ? t.textMuted : isCorrect ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                        Your answer: {wasSkipped ? "—" : toLabel(selectedOption)}
                      </span>
                      {!isCorrect && !wasSkipped && (
                        <span className="text-emerald-600 font-bold">Correct: {toLabel(correctOption)}</span>
                      )}
                      {wasSkipped && <span className="text-amber-500 font-bold">Skipped</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/categories")}
          className={`w-full ${t.accentBg} ${t.accentBgHover} text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all`}
        >
          Back to Categories
        </button>
      </div>
    </div>
  );
}