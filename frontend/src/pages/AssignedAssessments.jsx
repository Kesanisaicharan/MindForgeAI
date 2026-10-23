import React, { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import { ClipboardList, CircleAlert, CheckCircle2, Clock3, Loader2, Send } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';
const copy = {
    en: {
        title: 'Assigned Assessments', subtitle: 'Take assessments assigned by your teacher and review your server-graded results.',
        interfaceLanguage: 'Interface language', list: 'Your assessments', refresh: 'Refresh',
        noAssigned: 'No assessments assigned yet', noAssignedHint: 'When your teacher assigns one, it will appear here.',
        back: 'Back to list', questions: 'questions', due: 'Due', finalScore: 'Final score',
        passed: 'Assessment passed', review: 'Review the feedback and practise again',
        correct: 'correct out of', yourAnswer: 'Your answer', correctAnswer: 'Correct answer',
        submit: 'Submit assessment', submitting: 'Submitting…', answered: 'answered',
        answerAll: 'Please answer every question before submitting.',
        submitSuccess: 'Your answers were submitted and graded successfully.',
        start: 'Start assessment', viewResult: 'View result', expired: 'Expired',
        completed: 'Completed', deadlinePassed: 'Deadline passed',
        loadError: 'Could not load assigned assessments. Please sign in again and retry.',
        openError: 'Could not open this assessment.', submitError: 'Submission failed. Please retry.',
        loading: 'Loading…'
    },
    hi: {
        title: 'निर्धारित आकलन', subtitle: 'शिक्षक द्वारा दिए गए आकलन दें और अपने परिणाम देखें।',
        interfaceLanguage: 'इंटरफ़ेस भाषा', list: 'आपके आकलन', refresh: 'रीफ़्रेश करें',
        noAssigned: 'अभी कोई आकलन नहीं दिया गया है', noAssignedHint: 'शिक्षक द्वारा आकलन देने पर यह यहाँ दिखाई देगा।',
        back: 'सूची पर वापस जाएँ', questions: 'प्रश्न', due: 'अंतिम समय', finalScore: 'अंतिम अंक',
        passed: 'आकलन उत्तीर्ण', review: 'प्रतिक्रिया देखें और फिर अभ्यास करें',
        correct: 'सही उत्तर, कुल', yourAnswer: 'आपका उत्तर', correctAnswer: 'सही उत्तर',
        submit: 'आकलन जमा करें', submitting: 'जमा हो रहा है…', answered: 'उत्तर दिए',
        answerAll: 'जमा करने से पहले सभी प्रश्नों के उत्तर दें।',
        submitSuccess: 'आपके उत्तर जमा हुए और जाँच लिए गए।',
        start: 'आकलन शुरू करें', viewResult: 'परिणाम देखें', expired: 'समय समाप्त',
        completed: 'पूरा हुआ', deadlinePassed: 'अंतिम समय बीत गया',
        loadError: 'आकलन लोड नहीं हुए। फिर से साइन इन करके प्रयास करें।',
        openError: 'यह आकलन नहीं खुल पाया।', submitError: 'जमा नहीं हुआ। फिर प्रयास करें।',
        loading: 'लोड हो रहा है…'
    },
    te: {
        title: 'కేటాయించిన అసెస్‌మెంట్లు', subtitle: 'ఉపాధ్యాయుడు ఇచ్చిన అసెస్‌మెంట్లు రాసి, ఫలితాలను చూడండి.',
        interfaceLanguage: 'ఇంటర్‌ఫేస్ భాష', list: 'మీ అసెస్‌మెంట్లు', refresh: 'రిఫ్రెష్',
        noAssigned: 'ఇంకా అసెస్‌మెంట్లు కేటాయించలేదు', noAssignedHint: 'ఉపాధ్యాయుడు అసెస్‌మెంట్ కేటాయిస్తే ఇక్కడ కనిపిస్తుంది.',
        back: 'జాబితాకు తిరిగి వెళ్లు', questions: 'ప్రశ్నలు', due: 'చివరి తేదీ', finalScore: 'తుది స్కోరు',
        passed: 'అసెస్‌మెంట్‌లో ఉత్తీర్ణులయ్యారు', review: 'ఫీడ్‌బ్యాక్ చూసి మళ్లీ అభ్యాసం చేయండి',
        correct: 'సరైనవి, మొత్తం', yourAnswer: 'మీ సమాధానం', correctAnswer: 'సరైన సమాధానం',
        submit: 'అసెస్‌మెంట్ సమర్పించు', submitting: 'సమర్పిస్తోంది…', answered: 'సమాధానాలు ఇచ్చారు',
        answerAll: 'సమర్పించే ముందు అన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి.',
        submitSuccess: 'మీ సమాధానాలు సమర్పించబడి మూల్యాంకనం అయ్యాయి.',
        start: 'అసెస్‌మెంట్ ప్రారంభించు', viewResult: 'ఫలితం చూడు', expired: 'గడువు ముగిసింది',
        completed: 'పూర్తయింది', deadlinePassed: 'గడువు దాటింది',
        loadError: 'అసెస్‌మెంట్లు లోడ్ కాలేదు. మళ్లీ సైన్ ఇన్ చేసి ప్రయత్నించండి.',
        openError: 'ఈ అసెస్‌మెంట్ తెరవలేకపోయాం.', submitError: 'సమర్పించలేకపోయాం. మళ్లీ ప్రయత్నించండి.',
        loading: 'లోడ్ అవుతోంది…'
    }
};

const AssignedAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [active, setActive] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [opening, setOpening] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [uiLanguage, setUiLanguage] = useState('en');
    const t = copy[uiLanguage] || copy.en;

    const loadAssessments = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`${API}/api/assessments/assigned`);
            setAssessments(response.data.data || []);
        } catch (e) {
            setError(e.response?.data?.error || 'Could not load assigned assessments. Please sign in again and retry.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAssessments(); }, [loadAssessments]);

    const openAssessment = async (id) => {
        setOpening(true);
        setError('');
        setMessage('');
        setResult(null);
        setAnswers({});
        try {
            const response = await api.get(`${API}/api/assessments/${encodeURIComponent(id)}`);
            const assessment = response.data.data;
            setActive(assessment);
            if (assessment.completed && assessment.result) setResult(assessment.result);
        } catch (e) {
            setError(e.response?.data?.error || 'Could not open this assessment.');
        } finally {
            setOpening(false);
        }
    };

    const submit = async (event) => {
        event.preventDefault();
        if (!active || active.completed || submitting) return;
        if (active.questions.some((question, index) => !Number.isInteger(answers[index]))) {
            setError('Please answer every question before submitting.');
            return;
        }
        setSubmitting(true);
        setError('');
        setMessage('');
        try {
            const response = await api.post(`${API}/api/assessments/${encodeURIComponent(active.id)}/submit`, {
                answers: active.questions.map((_, index) => answers[index])
            });
            setResult(response.data.data);
            setActive((current) => current ? { ...current, completed: true, questions: [] } : current);
            setMessage('Your answers were submitted and graded successfully.');
            await loadAssessments();
        } catch (e) {
            setError(e.response?.data?.error || 'Submission failed. Please retry.');
        } finally {
            setSubmitting(false);
        }
    };

    const close = () => {
        setActive(null);
        setAnswers({});
        setResult(null);
        setError('');
        setMessage('');
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <header className="rounded-3xl p-7 bg-gradient-to-br from-indigo-700 to-cyan-600 text-white">
                <div className="flex items-center gap-3"><ClipboardList size={30}/><h1 className="text-3xl font-black">{t.title}</h1></div>
                <p className="mt-2 text-blue-100">{t.subtitle}</p>
            <div className="mt-5 flex items-center gap-3 text-sm"><label htmlFor="assessment-language" className="text-blue-100">{t.interfaceLanguage}</label><select id="assessment-language" value={uiLanguage} onChange={e=>setUiLanguage(e.target.value)} className="rounded-lg bg-white/10 border border-white/30 text-white px-3 py-2"><option className="text-gray-900" value="en">English</option><option className="text-gray-900" value="hi">हिन्दी</option><option className="text-gray-900" value="te">తెలుగు</option></select></div></header>

            {error && <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 flex gap-3"><CircleAlert size={20}/><span>{error}</span></div>}
            {message && <p role="status" className="rounded-xl bg-emerald-500/10 p-4 text-emerald-600">{message}</p>}

            {active ? (
                <section className="card-glass rounded-2xl p-5 md:p-7 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-primary font-bold">{active.subject} · Class {active.grade}</p>
                            <h2 className="text-2xl font-black mt-1">{active.title}</h2>
                            <p className="text-sm text-gray-500 mt-1">{active.board} · {active.questions?.length || result?.totalQuestions || 0} {t.questions}</p>
                            {active.dueAt && <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Clock3 size={14}/> {t.due} {new Date(active.dueAt).toLocaleString()}</p>}
                        </div>
                        <button onClick={close} className="self-start rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold">{t.back}</button>
                    </div>

                    {result ? (
                        <div className="space-y-5">
                            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
                                <p className="text-sm text-gray-500">{t.finalScore}</p>
                                <p className="text-5xl font-black mt-1">{result.score}%</p>
                                <p className="mt-2 font-semibold">{(result.passed ?? (result.score >= 80)) ? t.passed : t.review}</p>
                                <p className="text-sm text-gray-500 mt-1">{result.correctCount ?? result.results?.filter((item) => item.isCorrect).length ?? 0} {t.correct} {result.totalQuestions ?? result.results?.length ?? 0}</p>
                            </div>
                            {(result.results || []).map((item, index) => (
                                <article key={item.questionId || index} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="flex items-start gap-3">
                                        {item.isCorrect ? <CheckCircle2 className="text-emerald-500 mt-0.5" size={20}/> : <CircleAlert className="text-amber-500 mt-0.5" size={20}/>}
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold">{index + 1}. {item.question || item.prompt || item.questionId}</p>
                                            <p className="text-sm text-gray-500 mt-2">{t.yourAnswer}: {item.selectedAnswer}</p>
                                            {!item.isCorrect && <p className="text-sm text-emerald-600 mt-1">{t.correctAnswer}: {item.correctAnswer}</p>}
                                            {item.explanation && <p className="text-sm text-gray-500 mt-2">{item.explanation}</p>}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-5">
                            {(active.questions || []).map((question, index) => (
                                <fieldset key={question.questionId} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <legend className="px-2 font-bold">{index + 1}. {question.prompt}</legend>
                                    <div className="space-y-2 mt-2">
                                        {question.options.map((option, optionIndex) => (
                                            <label key={`${question.questionId}-${optionIndex}`} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer ${answers[index] === optionIndex ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-gray-700'}`}>
                                                <input type="radio" name={question.questionId} checked={answers[index] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))} className="mt-1"/>
                                                <span>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            ))}
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <p className="text-sm text-gray-500">{Object.keys(answers).length} / {active.questions.length} {t.answered}</p>
                                <button type="submit" disabled={submitting || active.questions.length === 0 || Object.keys(answers).length !== active.questions.length} className="rounded-xl bg-primary text-white px-5 py-3 font-bold flex items-center gap-2 disabled:opacity-50">
                                    {submitting ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}
                                    {submitting ? t.submitting : t.submit}
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            ) : (
                <section className="card-glass rounded-2xl p-5 md:p-7 space-y-4">
                    <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">{t.list}</h2><button onClick={loadAssessments} className="text-primary text-sm underline" disabled={loading}>{t.refresh}</button></div>
                    {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={32}/></div>
                        : assessments.length === 0 ? <div className="text-center py-10"><ClipboardList size={40} className="mx-auto text-gray-400 mb-3"/><p className="font-semibold">{t.noAssigned}</p><p className="text-sm text-gray-500 mt-1">{t.noAssignedHint}</p></div>
                        : assessments.map((item) => (
                            <article key={item.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="min-w-0">
                                    <h3 className="font-bold">{item.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{item.rosterName} · Class {item.grade} · {item.subject} · {item.questionCount} questions</p>
                                    {item.dueAt && <p className="text-xs text-gray-500 mt-1">{t.due} {new Date(item.dueAt).toLocaleString()}</p>}
                                    {item.completed && <p className="text-sm text-emerald-600 mt-2 font-semibold">{t.completed} · Score {item.score}%</p>}
                                    {item.expired && !item.completed && <p className="text-sm text-amber-600 mt-2">{t.deadlinePassed}</p>}
                                </div>
                                <button disabled={opening || (item.expired && !item.completed)} onClick={() => openAssessment(item.id)} className="rounded-xl bg-primary text-white px-4 py-2 font-semibold disabled:opacity-50">
                                    {opening ? t.loading : item.completed ? t.viewResult : item.expired ? t.expired : t.start}
                                </button>
                            </article>
                        ))}
                </section>
            )}
        </div>
    );
};

export default AssignedAssessments;
