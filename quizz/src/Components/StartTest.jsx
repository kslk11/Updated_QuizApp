import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../Hooks/useTheame";
import { API_BASE_URL } from "../config/api";

const PARAM_URL = `${API_BASE_URL}/api/client`;
const QUIZ_URL   = `${API_BASE_URL}/api/student/bundle`;
const SUBMIT_URL = `${API_BASE_URL}/api/student/submit-quiz`;
const START_URL  = `${API_BASE_URL}/api/student/start-quiz`;

const OPTIONS = [
  { letter: "A", key: "option_a" },
  { letter: "B", key: "option_b" },
  { letter: "C", key: "option_c" },
  { letter: "D", key: "option_d" },
];

export default function StartTest() {
  const { setId }   = useParams();
  const navigate    = useNavigate();
  const { t }       = useTheme();

  const [questions, setQuestions]       = useState([]);
  const [quizTitle, setQuizTitle]       = useState("");
  const [loading, setLoading]           = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]           = useState({});
  const [timeLeft, setTimeLeft]         = useState(null);
  const [attemptId, setAttemptId]       = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [error, setError]               = useState(null);
  const [details, setDetails]           = useState(null);
  
  const timerRef     = useRef(null);
  const submittedRef = useRef(false);

  // Single source of truth for loading data
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token   = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Quiz Details (for Duration)
        const detailRes = await axios.get(`${PARAM_URL}/quiz/${setId}`);
        const quizInfo = detailRes.data?.data;
        setDetails(quizInfo);

        // 2. Set Timer based on fetched duration (default to 30 if null/undefined)
        const durationInMinutes = quizInfo?.duration || 30;
        setTimeLeft(durationInMinutes * 60);

        // 3. Fetch Questions
        const qRes = await axios.get(`${QUIZ_URL}/${setId}/quizzes`, { headers });
        const qs   = qRes.data?.data ?? qRes.data ?? [];
        setQuestions(Array.isArray(qs) ? qs : []);
        setQuizTitle(quizInfo?.title || qRes.data?.title || "Quiz");

        // 4. Start/Register Attempt
        const attemptRes = await axios.post(`${START_URL}/${setId}`, {}, { headers });
        setAttemptId(attemptRes.data?.attempt_id);

      } catch (err) {
        console.error("Initialization Error:", err);
        setError(err.response?.data?.message || "Failed to initialize test.");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
    return () => clearInterval(timerRef.current);
  }, [setId]);

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submittedRef.current || submitting) return;
      submittedRef.current = true;
      clearInterval(timerRef.current);
      setSubmitted(true);
      setSubmitting(true);

      try {
        const answersPayload = questions.map((q) => ({
          question_id:     q.id,
          selected_option: answers[q.id] ?? null,
        }));

        const token = localStorage.getItem("token");
        await axios.post(
          `${SUBMIT_URL}/${attemptId}`,
          { answers: answersPayload, auto_submitted: auto },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        navigate(`/result/${attemptId}`, { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || "Submission failed.");
        submittedRef.current = false;
        setSubmitting(false);
        setSubmitted(false);
      }
    },
    [submitting, questions, answers, attemptId, navigate]
  );

  // Timer Ticking Logic
  useEffect(() => {
    if (loading || submitted || timeLeft === null || timeLeft <= 0) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerRef.current);
  }, [loading, submitted, timeLeft === null]);

  // Auto-submit when time hits 0
  useEffect(() => {
    if (timeLeft === 0 && !submitted && !loading) {
      handleSubmit(true);
    }
  }, [timeLeft, submitted, handleSubmit, loading]);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const selectAnswer = (qId, optionKey) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optionKey }));
  };

  if (loading || timeLeft === null) return (
    <div className={`min-h-screen ${t.bg} flex flex-col items-center justify-center gap-4`}>
      <div className={`w-12 h-12 border-4 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
      <p className={`text-sm font-bold ${t.textMuted}`}>Setting up your test environment...</p>
    </div>
  );

  const currentQ = questions[currentIndex];
  const totalQ   = questions.length;
  const answeredCount = Object.keys(answers).length;
  
  const timerColor =
    timeLeft <= 60  ? "text-rose-500 animate-pulse" :
    timeLeft <= 300 ? "text-amber-500 font-bold" :
    t.accentText ?? "text-indigo-600";

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-300 pb-20`}>
      
      {/* Header Section */}
      <div className={`sticky top-0 z-40 ${t.bgCard} border-b ${t.border} px-4 py-4 shadow-md`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`p-2 rounded-xl ${t.accentLight}`}>
              <span className="text-xl">🎓</span>
            </div>
            <div className="min-w-0">
              <h1 className={`text-base font-black ${t.text} truncate`}>{quizTitle}</h1>
              <p className={`text-xs font-bold ${t.textMuted} uppercase`}>
                {answeredCount} of {totalQ} Answered {details?.total_marks ? `| ${details.total_marks} Marks` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={`flex flex-col items-end px-4 py-1.5 rounded-2xl border ${t.border} bg-slate-50/50`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Time Remaining</p>
              <span className={`text-xl font-black tabular-nums leading-none ${timerColor}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <button
              onClick={() => {
                if(window.confirm("Are you sure you want to submit the test?")) handleSubmit(false);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-emerald-200 transition-all transform active:scale-95"
            >
              Finish Test
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${t.accentBg} transition-all duration-700 ease-out`}
            style={{ width: `${(answeredCount / totalQ) * 100}%` }}
          />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className={`mb-6 flex items-center justify-between`}>
             <span className={`px-4 py-1 rounded-full text-xs font-bold ${t.accentLight} ${t.accentText} border ${t.accentBorder}`}>
               Question {currentIndex + 1}
             </span>
          </div>

          <div className={`${t.bgCard} border ${t.border} rounded-3xl p-8 shadow-xl shadow-slate-200/50 mb-6 min-h-[200px] flex items-center`}>
            <p className={`text-lg font-bold leading-relaxed ${t.text}`}>
              {currentQ?.question}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-10">
            {OPTIONS.map(({ letter, key }) => {
              const optionText = currentQ?.[key];
              if (!optionText) return null;
              const isSelected = answers[currentQ.id] === key;

              return (
                <button
                  key={key}
                  onClick={() => selectAnswer(currentQ.id, key)}
                  className={`group flex items-center gap-5 w-full px-6 py-5 rounded-2xl border-2 transition-all duration-200 text-left
                    ${isSelected 
                      ? `${t.accentBorder} ${t.accentLight} border-opacity-100 shadow-lg` 
                      : `${t.border} ${t.bgCard} hover:border-slate-300`}`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all
                    ${isSelected ? `${t.accentBg} text-white` : `bg-slate-100 text-slate-500 group-hover:bg-slate-200`}`}>
                    {letter}
                  </span>
                  <span className={`text-base font-bold ${isSelected ? t.accentText : t.text}`}>
                    {optionText}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2
                ${currentIndex === 0 ? "text-slate-300" : "text-slate-600 hover:bg-slate-50"}`}
            >
              ← Previous
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
              disabled={currentIndex === totalQ - 1}
              className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2
                ${currentIndex === totalQ - 1 ? "text-slate-300" : `${t.accentBg} text-white shadow-lg ${t.accentShadow}`}`}
            >
              {currentIndex === totalQ - 1 ? "End of Test" : "Save & Next →"}
            </button>
          </div>
        </div>

        {/* Right Side Palette */}
        <div className="lg:col-span-4">
          <div className={`${t.bgCard} border ${t.border} rounded-3xl p-6 sticky top-32 shadow-sm`}>
            <h3 className={`text-sm font-black ${t.text} mb-4 uppercase tracking-wider`}>Question Palette</h3>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((q, i) => {
                const isCurrent = i === currentIndex;
                const isAnswered = !!answers[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`aspect-square rounded-xl text-xs font-black transition-all border-2
                      ${isCurrent ? `${t.accentBorder} ${t.accentBg} text-white scale-110 shadow-lg` : 
                        isAnswered ? "bg-emerald-500 border-emerald-500 text-white" : 
                        "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300"}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {submitting && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
           <div className={`w-16 h-16 border-4 ${t.accentBorder} border-t-transparent rounded-full animate-spin mb-6`} />
           <h2 className={`text-2xl font-black ${t.text} mb-2`}>Finalizing Your Test</h2>
           <p className="text-slate-500 font-medium">Please wait while we calculate your score...</p>
        </div>
      )}
    </div>
  );
}