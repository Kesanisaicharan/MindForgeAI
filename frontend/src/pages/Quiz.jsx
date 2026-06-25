import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, Trophy } from 'lucide-react';

const Quiz = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const API = import.meta.env.VITE_API_URL;
                const response = await axios.post(`${API}/api/quiz/generate`, 
                    { courseId },
                    { timeout: 15000 } // Add 15 second timeout to prevent infinite loading
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

        if (courseId) fetchQuiz();
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
    };

    const handleClaimCertificate = () => {
        // Add timestamp to ensure navigation always triggers a fresh component state
        navigate(`/certificate/${courseId}?score=${score}&t=${Date.now()}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary">
                <Loader2 className="animate-spin mb-4" size={48} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generating your quiz...</h2>
            </div>
        );
    }

    if (error || quiz.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-glass p-12 rounded-3xl text-center max-w-lg border-red-500/20"
                >
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <span className="text-4xl font-bold">!</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Quiz Generation Error</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        {error || "We couldn't generate a stable quiz from this course content. This usually happens if the content is too short or unstructured."}
                    </p>
                    <button 
                        onClick={() => navigate(`/course/${courseId}`)}
                        className="w-full py-4 bg-gray-800 dark:bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-700 dark:hover:bg-gray-600 transition-all shadow-lg"
                    >
                        Return to Course Content
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4 mb-20">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">Course Quiz</h1>

            {submitted && (
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="card-glass p-8 rounded-2xl mb-10 text-center border-t-4 border-t-primary"
                >
                    <Trophy size={64} className={`mx-auto mb-4 ${score >= 80 ? 'text-green-500' : 'text-yellow-500'}`} />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">You scored {score}%</h2>
                    <p className="text-gray-400 text-lg mb-6">
                        {score >= 80 ? 'Congratulations! You passed the quiz.' : 'Good effort! Review the course and try again.'}
                    </p>
                    {score >= 80 && (
                        <button 
                            onClick={handleClaimCertificate}
                            className="bg-primary hover:bg-secondary text-white font-bold py-3 px-8 rounded-xl transition-all glow-effect"
                        >
                            Claim Certificate
                        </button>
                    )}
                </motion.div>
            )}

            <div className="space-y-8">
                {quiz.map((q, qIndex) => (
                    <div key={qIndex} className="bg-black/30 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            <span className="text-primary mr-2">{qIndex + 1}.</span>
                            {q.question}
                        </h3>
                        
                        <div className="space-y-3">
                            {q.options.map((opt, oIndex) => {
                                const isSelected = answers[qIndex] === oIndex;
                                const isCorrect = submitted && isAnswerCorrect(qIndex, oIndex);
                                const isWrong = submitted && isSelected && !isCorrect;

                                let optionClass = "border-gray-700 hover:border-gray-500 hover:bg-gray-800/50";
                                if (isSelected && !submitted) optionClass = "border-primary bg-primary/10 text-primary";
                                if (isCorrect) optionClass = "border-green-500 bg-green-500/10 text-green-400";
                                if (isWrong) optionClass = "border-red-500 bg-red-500/10 text-red-400";

                                return (
                                    <div 
                                        key={oIndex}
                                        onClick={() => handleSelectOption(qIndex, oIndex)}
                                        className={`flex items-center gap-4 p-4 rounded-xl border ${optionClass} ${!submitted && 'cursor-pointer'} transition-all`}
                                    >
                                        <div className="flex-shrink-0">
                                            {isCorrect ? <CheckCircle2 size={24} className="text-green-500" /> :
                                             isSelected ? <CheckCircle2 size={24} className={submitted ? "text-red-500" : "text-primary"} /> :
                                             <Circle size={24} className="text-gray-500" />}
                                        </div>
                                        <span className={`text-lg ${submitted && isCorrect ? 'font-bold' : ''}`}>{opt}</span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {submitted && q.explanation && (
                            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg text-gray-300">
                                <span className="text-accent font-bold">Explanation:</span> {q.explanation}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {!submitted && (
                <div className="mt-10 text-center">
                    <button 
                        onClick={handleSubmit}
                        disabled={Object.keys(answers).length !== quiz.length}
                        className={`py-4 px-12 rounded-xl text-lg font-bold transition-all ${
                            Object.keys(answers).length === quiz.length
                            ? 'bg-primary text-white hover:bg-secondary glow-effect'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        Submit Quiz
                    </button>
                </div>
            )}
        </div>
    );
};

export default Quiz;
