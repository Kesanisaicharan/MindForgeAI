import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, Trophy } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const Quiz = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quizId, setQuizId] = useState(null);
    const [quiz, setQuiz] = useState([]);
    const [passMark, setPassMark] = useState(80);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null); // { score, passed, results[] } from the server

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await api.post('/api/quiz/generate', { courseId, userId: user?.id }, { timeout: 45000 });
                if (cancelled) return;
                setQuizId(res.data.data.quizId);
                setQuiz(res.data.data.questions);
                setPassMark(res.data.data.passMark ?? 80);
            } catch (err) {
                if (cancelled) return;
                setError(err.code === 'ECONNABORTED'
                    ? 'The server took too long to generate the quiz. Please try again.'
                    : err.response?.data?.error || 'Error fetching quiz from server.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [courseId, user?.id]);

    const handleSelectOption = (qIndex, oIndex) => {
        if (result) return;
        setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await api.post(`/api/quiz/${quizId}/submit`, { userId: user?.id, answers: quiz.map((_, i) => answers[i]) });
            setResult(res.data.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Could not submit the quiz.');
        } finally {
            setSubmitting(false);
        }
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
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card-glass p-12 rounded-3xl text-center max-w-lg border-red-500/20">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <span className="text-4xl font-bold">!</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Quiz Error</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">{error || "We couldn't generate a stable quiz from this course content."}</p>
                    <div className="flex gap-3">
                        <button onClick={() => window.location.reload()} className="flex-1 py-4 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-all">Try Again</button>
                        <button onClick={() => navigate(`/course/${courseId}`)} className="flex-1 py-4 bg-gray-800 dark:bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-700 transition-all">Back to Course</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const answeredAll = Object.keys(answers).length === quiz.length;

    return (
        <div className="max-w-3xl mx-auto p-4 mb-20">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">Course Quiz</h1>

            {result && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-glass p-8 rounded-2xl mb-10 text-center border-t-4 border-t-primary">
                    <Trophy size={64} className={`mx-auto mb-4 ${result.passed ? 'text-green-500' : 'text-yellow-500'}`} />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">You scored {result.score}%</h2>
                    <p className="text-gray-400 text-lg mb-6">
                        {result.passed ? 'Congratulations! You passed the quiz.' : `You need ${passMark}% to earn a certificate. Review the course and try again.`}
                    </p>
                    {result.passed ? (
                        <button onClick={() => navigate(`/certificate/${courseId}?quiz=${quizId}`)} className="bg-primary hover:bg-secondary text-white font-bold py-3 px-8 rounded-xl transition-all glow-effect">
                            Claim Certificate
                        </button>
                    ) : (
                        <button onClick={() => window.location.reload()} className="bg-primary hover:bg-secondary text-white font-bold py-3 px-8 rounded-xl transition-all">
                            Try a New Quiz
                        </button>
                    )}
                </motion.div>
            )}

            <div className="space-y-8">
                {quiz.map((q, qIndex) => {
                    const r = result?.results[qIndex];
                    return (
                        <div key={qIndex} className="bg-black/30 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                <span className="text-primary mr-2">{qIndex + 1}.</span>{q.question}
                            </h3>
                            <div className="space-y-3">
                                {q.options.map((opt, oIndex) => {
                                    const isSelected = answers[qIndex] === oIndex;
                                    const isCorrect = !!r && r.correctIndex === oIndex;
                                    const isWrong = !!r && isSelected && !isCorrect;
                                    let optionClass = 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/50';
                                    if (isSelected && !r) optionClass = 'border-primary bg-primary/10 text-primary';
                                    if (isCorrect) optionClass = 'border-green-500 bg-green-500/10 text-green-400';
                                    if (isWrong) optionClass = 'border-red-500 bg-red-500/10 text-red-400';
                                    return (
                                        <div key={oIndex} onClick={() => handleSelectOption(qIndex, oIndex)}
                                            className={`flex items-center gap-4 p-4 rounded-xl border ${optionClass} ${!result && 'cursor-pointer'} transition-all`}>
                                            <div className="flex-shrink-0">
                                                {isCorrect ? <CheckCircle2 size={24} className="text-green-500" /> :
                                                    isSelected ? <CheckCircle2 size={24} className={r ? 'text-red-500' : 'text-primary'} /> :
                                                        <Circle size={24} className="text-gray-500" />}
                                            </div>
                                            <span className={`text-lg ${isCorrect ? 'font-bold' : ''}`}>{opt}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {r?.explanation && (
                                <div className="mt-6 p-4 bg-gray-900/50 rounded-lg text-gray-300">
                                    <span className="text-accent font-bold">Explanation:</span> {r.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {!result && (
                <div className="mt-10 text-center">
                    <button onClick={handleSubmit} disabled={!answeredAll || submitting}
                        className={`py-4 px-12 rounded-xl text-lg font-bold transition-all ${answeredAll && !submitting ? 'bg-primary text-white hover:bg-secondary glow-effect' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}>
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Quiz;
