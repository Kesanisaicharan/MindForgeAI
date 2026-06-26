import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, Trophy, ArrowLeft, RefreshCw, XCircle, ChevronRight } from 'lucide-react';

const Quiz = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [courseTitle, setCourseTitle] = useState('');

    useEffect(() => {
        const fetchQuizAndCourse = async () => {
            try {
                const API = import.meta.env.VITE_API_URL;
                // Fetch course details to get course title
                const courseRes = await axios.get(`${API}/api/ai/course/${courseId}`);
                if (courseRes.data.success) {
                    setCourseTitle(courseRes.data.data.title);
                }

                // Generate quiz
                const response = await axios.post(`${API}/api/quiz/generate`, 
                    { courseId },
                    { timeout: 20000 } // Add 20 second timeout
                );
                
                if (response.data.success && response.data.data) {
                    const data = response.data.data;
                    let questions = [];

                    // 🛠️ Handle both object wrapper and naked array
                    if (Array.isArray(data)) {
                        questions = data;
                    } else {
                        questions = data.questions || data.Questions || data.quiz || data.Quiz;
                        
                        // If still not found, check if any key contains an array
                        if (!questions || !Array.isArray(questions)) {
                            const firstArrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
                            if (firstArrayKey) questions = data[firstArrayKey];
                        }
                    }

                    if (questions && Array.isArray(questions) && questions.length > 0) {
                        // Normalize the question objects
                        const normalizedQuiz = questions.map(q => ({
                            question: q.question || q.QuestionText || q.question_text || q.text,
                            options: q.options || q.Options || q.choices || q.answers,
                            correctAnswer: q.answer || q.correctAnswer || q.CorrectAnswer || q.answer_text || (typeof q.CorrectAnswerIndex === 'number' ? (q.options || q.Options)[q.CorrectAnswerIndex] : null),
                            explanation: q.explanation || q.Explanation || ""
                        }));
                        setQuiz(normalizedQuiz);
                    } else {
                        setError('Failed to load quiz or invalid data format received.');
                    }
                } else {
                    setError('Failed to load quiz from server.');
                }
            } catch (err) {
                console.error(err);
                if (err.code === 'ECONNABORTED') {
                    setError('Request timed out. The server took too long to generate the quiz.');
                } else {
                    setError(err.response?.data?.error || 'Error fetching quiz from server.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (courseId) fetchQuizAndCourse();
    }, [courseId]);

    const handleSelectOption = (questionIndex, optionIndex) => {
        if (submitted) return;
        setAnswers({
            ...answers,
            [questionIndex]: optionIndex
        });
    };

    const isAnswerCorrect = (qIndex, oIndex) => {
        const question = quiz[qIndex];
        const userSelectedOption = question.options[oIndex];
        const correctAnswer = question.correctAnswer;

        if (!userSelectedOption || !correctAnswer) return false;

        const normalizedUser = String(userSelectedOption).trim().toLowerCase();
        const normalizedCorrect = String(correctAnswer).trim().toLowerCase();

        // 1. Direct match (e.g. "Paris" === "Paris")
        if (normalizedUser === normalizedCorrect) return true;

        // 2. Index match fallback (e.g. if answer is "A" and user clicked index 0)
        const isIndexMatch = (normalizedCorrect === 'a' && oIndex === 0) ||
                             (normalizedCorrect === 'b' && oIndex === 1) ||
                             (normalizedCorrect === 'c' && oIndex === 2) ||
                             (normalizedCorrect === 'd' && oIndex === 3);

        return isIndexMatch;
    };

    const handleSubmit = () => {
        let correctOptionsCount = 0;
        
        quiz.forEach((_, idx) => {
            if (isAnswerCorrect(idx, answers[idx])) {
                correctOptionsCount++;
            }
        });
        
        const calculatedScore = Math.round((correctOptionsCount / quiz.length) * 100);
        setScore(calculatedScore);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClaimCertificate = () => {
        // Add timestamp to ensure navigation always triggers a fresh component state
        navigate(`/certificate/${courseId}?score=${score}&t=${Date.now()}`);
    };

    const answeredCount = Object.keys(answers).length;
    const progressPercent = quiz.length > 0 ? Math.round((answeredCount / quiz.length) * 100) : 0;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-blue-600">
                <Loader2 className="animate-spin mb-4" size={48} />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Generating Quiz Questions...</h2>
                <p className="text-slate-400 text-sm mt-2 max-w-xs text-center">Our AI is analyzing the course contents to design challenging questions.</p>
            </div>
        );
    }

    if (error || quiz.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-glass p-10 rounded-2xl text-center max-w-lg border border-red-500/20 shadow-xl"
                >
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 font-extrabold text-2xl">
                        !
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Quiz Generation Error</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-sm">
                        {error || "We couldn't generate a stable quiz from this course content. This usually happens if the content is too short or unstructured."}
                    </p>
                    <button 
                        onClick={() => navigate(`/course/${courseId}`)}
                        className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-95 transition-all shadow-md"
                    >
                        Return to Course Content
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-8 mb-20">
            {/* Back Button */}
            <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white mb-6 transition-colors font-semibold"
            >
                <ArrowLeft size={16} />
                Back to Course
            </button>

            <div className="text-center mb-10">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">Knowledge Check</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 leading-tight">Course Assessment</h1>
                {courseTitle && <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto italic">"{courseTitle}"</p>}
            </div>

            {/* Sticky/Fixed Progress Bar */}
            {!submitted && (
                <div className="mb-10 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500">Progress: {answeredCount}/{quiz.length} Answered</span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}

            {submitted && (
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="card-glass p-8 rounded-2xl mb-10 text-center border-t-4 border-t-blue-500 shadow-xl relative overflow-hidden"
                >
                    {score >= 80 ? (
                        <>
                            <Trophy size={64} className="mx-auto mb-4 text-amber-500 drop-shadow-md" />
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Assessment Passed!</h2>
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">You scored {score}%</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-8">
                                Exceptional work! You have proven your command over this subject area. You are now eligible to claim your official credential.
                            </p>
                            <button 
                                onClick={handleClaimCertificate}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-xl transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 glow-effect"
                            >
                                Claim Official Certificate
                            </button>
                        </>
                    ) : (
                        <>
                            <XCircle size={64} className="mx-auto mb-4 text-red-500" />
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Practice Needed</h2>
                            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-3">You scored {score}%</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-8">
                                A pass rate of 80% or above is required to earn the credential. Re-read the modules, review the details, and give it another try!
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button 
                                    onClick={() => navigate(`/course/${courseId}`)}
                                    className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-800/80 font-semibold py-3 px-6 rounded-xl transition-all"
                                >
                                    Review Course
                                </button>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                                >
                                    <RefreshCw size={14} /> Retry Quiz
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            )}

            {/* Questions Grid/Feed */}
            <div className="space-y-8">
                {quiz.map((q, qIndex) => (
                    <div 
                        key={qIndex} 
                        className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm"
                    >
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 leading-snug flex items-start gap-3">
                            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                {qIndex + 1}
                            </span>
                            <span>{q.question}</span>
                        </h3>
                        
                        <div className="space-y-3.5">
                            {q.options.map((opt, oIndex) => {
                                const isSelected = answers[qIndex] === oIndex;
                                const isCorrect = submitted && isAnswerCorrect(qIndex, oIndex);
                                const isWrong = submitted && isSelected && !isCorrect;

                                let optionClass = "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-950";
                                if (isSelected && !submitted) optionClass = "border-blue-600 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400";
                                if (isCorrect) optionClass = "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold";
                                if (isWrong) optionClass = "border-red-500 bg-red-500/5 dark:bg-red-500/10 text-red-500 dark:text-red-400";

                                return (
                                    <div 
                                        key={oIndex}
                                        onClick={() => handleSelectOption(qIndex, oIndex)}
                                        className={`flex items-center gap-4 p-4 rounded-xl border ${optionClass} ${!submitted && 'cursor-pointer'} transition-all`}
                                    >
                                        <div className="flex-shrink-0">
                                            {isCorrect ? <CheckCircle2 size={20} className="text-emerald-500" /> :
                                             isSelected ? <CheckCircle2 size={20} className={submitted ? "text-red-500" : "text-blue-500"} /> :
                                             <Circle size={20} className="text-slate-300 dark:text-slate-700" />}
                                        </div>
                                        <span className="text-sm md:text-base leading-relaxed">{opt}</span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {submitted && q.explanation && (
                            <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl text-slate-500 dark:text-slate-400 text-sm leading-relaxed border border-slate-200/50 dark:border-slate-850">
                                <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-xs block mb-1">Answer Explanation:</span> 
                                {q.explanation}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Submit Bar */}
            {!submitted && (
                <div className="mt-12 text-center">
                    <button 
                        onClick={handleSubmit}
                        disabled={answeredCount !== quiz.length}
                        className={`w-full md:w-auto py-4 px-12 rounded-xl text-lg font-bold transition-all inline-flex items-center justify-center gap-2 ${
                            answeredCount === quiz.length
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 glow-effect'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-650 border border-slate-200 dark:border-slate-800 cursor-not-allowed'
                        }`}
                    >
                        Submit Assessment <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Quiz;
