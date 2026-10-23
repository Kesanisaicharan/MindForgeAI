import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, BrainCircuit, CheckCircle2, CircleAlert, Languages, Loader2, RefreshCw, Target } from 'lucide-react';

const copy = {
    en: {
        title: 'Adaptive Learning', subtitle: 'A learning path that responds to what you know.',
        grade: 'Class', board: 'Syllabus', language: 'Interface language', subject: 'Subject',
        all: 'All subjects', math: 'Mathematics', science: 'Science', programming: 'Programming',
        next: 'Recommended next', start: 'Practice this concept', submit: 'Check answer', nextQ: 'Load next activity',
        mastered: 'Mastered', practice: 'Needs practice', progress: 'Topics mastered', attempts: 'Answers submitted',
        correct: 'Correct!', incorrect: 'Not quite. Review the explanation below.', why: 'Why this is recommended',
        noQuestion: 'No practice question is available for this topic yet.', choose: 'Choose an answer first.',
        error: 'Could not load the learning plan. Check the connection and try again.',
        offline: 'Offline mode: cached plan shown when available. Answers will be saved locally and sync when reconnected.',
        teacher: 'Teacher insight', teacherText: 'Use this view to spot concepts that need support; teachers remain in control of instruction.',
        low: 'Needs practice', medium: 'In progress', high: 'Mastered'
    },
    hi: {
        title: 'अनुकूली शिक्षण', subtitle: 'आपकी समझ के अनुसार बदलता सीखने का मार्ग।',
        grade: 'कक्षा', board: 'पाठ्यक्रम', language: 'इंटरफ़ेस भाषा', subject: 'विषय',
        all: 'सभी विषय', math: 'गणित', science: 'विज्ञान', programming: 'प्रोग्रामिंग',
        next: 'अगली अनुशंसा', start: 'इस विषय का अभ्यास करें', submit: 'उत्तर जाँचें', nextQ: 'अगली गतिविधि',
        mastered: 'सीखा गया', practice: 'अभ्यास आवश्यक', progress: 'सीखे गए विषय', attempts: 'जवाब',
        correct: 'सही!', incorrect: 'अभी सही नहीं। नीचे दी गई व्याख्या पढ़ें।', why: 'यह क्यों सुझाया गया',
        noQuestion: 'इस विषय के लिए अभी प्रश्न उपलब्ध नहीं है।', choose: 'पहले उत्तर चुनें।',
        error: 'पाठ योजना लोड नहीं हुई। कनेक्शन जाँचकर फिर प्रयास करें।',
        offline: 'ऑफलाइन मोड: उपलब्ध होने पर सहेजी योजना दिखाई जाएगी।', teacher: 'शिक्षक जानकारी',
        teacherText: 'यह दृश्य सहायता की जरूरत वाले विषय दिखाता है; शिक्षण का निर्णय शिक्षक का रहेगा।',
        low: 'अभ्यास आवश्यक', medium: 'प्रगति में', high: 'सीखा गया'
    },
    te: {
        title: 'అడాప్టివ్ లెర్నింగ్', subtitle: 'నీకు తెలిసిన దాని ఆధారంగా మారే అభ్యాస మార్గం.',
        grade: 'తరగతి', board: 'సిలబస్', language: 'ఇంటర్‌ఫేస్ భాష', subject: 'విషయం',
        all: 'అన్ని విషయాలు', math: 'గణితం', science: 'సైన్స్', programming: 'ప్రోగ్రామింగ్',
        next: 'తదుపరి సిఫార్సు', start: 'ఈ అంశాన్ని అభ్యసించు', submit: 'జవాబు చెక్ చేయి', nextQ: 'తదుపరి కార్యకలాపం',
        mastered: 'నేర్చుకున్నవి', practice: 'మరింత అభ్యాసం', progress: 'పూర్తైన అంశాలు', attempts: 'సమాధానాలు',
        correct: 'సరైన జవాబు!', incorrect: 'ఇది సరైనది కాదు. వివరణను చదువు.', why: 'ఇది ఎందుకు సూచించబడింది',
        noQuestion: 'ఈ అంశానికి ఇంకా ప్రశ్న అందుబాటులో లేదు.', choose: 'ముందుగా ఒక జవాబు ఎంచుకో.',
        error: 'లెర్నింగ్ ప్లాన్ లోడ్ కాలేదు. కనెక్షన్ తనిఖీ చేసి మళ్లీ ప్రయత్నించు.',
        offline: 'ఆఫ్‌లైన్ మోడ్: అందుబాటులో ఉన్న సేకరించిన ప్లాన్ చూపబడుతుంది.', teacher: 'ఉపాధ్యాయుల సమాచారం',
        teacherText: 'సహాయం అవసరమైన అంశాలను గుర్తించడానికి ఇది ఉపయోగపడుతుంది; బోధనపై నిర్ణయం ఉపాధ్యాయుడిదే.',
        low: 'మరింత అభ్యాసం', medium: 'కొనసాగుతోంది', high: 'నేర్చుకున్నవి'
    }
};

const getStudentId = (user) => user?.id || user?.uid || user?._id || user?.email || 'demo-student';

const AdaptiveLearning = () => {
    const { user } = useAuth();
    const [grade, setGrade] = useState(6);
    const [board, setBoard] = useState('CBSE');
    const [language, setLanguage] = useState('en');
    const [subject, setSubject] = useState('All');
    const [plan, setPlan] = useState(null);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const t = copy[language] || copy.en;
    const studentId = getStudentId(user);
    const api = import.meta.env.VITE_API_URL;

    const loadPlan = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Retry queued answers when connectivity returns; retain any item that still fails.
            const pendingKey = `mindforge-pending-${studentId}`;
            const queued = JSON.parse(localStorage.getItem(pendingKey) || '[]');
            const remaining = [];
            for (const item of queued) {
                try {
                    const { savedAt, ...attempt } = item;
                    await api.post(`${api}/api/adaptive/attempt`, attempt);
                } catch {
                    remaining.push(item);
                }
            }
            if (remaining.length) localStorage.setItem(pendingKey, JSON.stringify(remaining));
            else localStorage.removeItem(pendingKey);

            const response = await api.get(`${api}/api/adaptive/plan/${encodeURIComponent(studentId)}`, {
                params: { grade, board, language, subject }
            });
            setPlan(response.data.data);
            localStorage.setItem(`mindforge-adaptive-${studentId}`, JSON.stringify(response.data.data));
        } catch (err) {
            const cached = localStorage.getItem(`mindforge-adaptive-${studentId}`);
            if (cached) {
                try { setPlan(JSON.parse(cached)); } catch { /* Ignore corrupt cache. */ }
            }
            setError(t.error);
        } finally {
            setLoading(false);
        }
    }, [api, studentId, grade, board, language, subject, t.error]);

    useEffect(() => { loadPlan(); }, [loadPlan]);

    const recommendation = plan?.recommendation;
    const selectedOption = selected === null ? null : Number(selected);
    const progressPercent = useMemo(() => {
        const total = plan?.summary?.topicsTracked || 0;
        return total ? Math.round((plan.summary.mastered / total) * 100) : 0;
    }, [plan]);

    const submitAnswer = async () => {
        if (selectedOption === null || !recommendation) {
            setFeedback({ message: t.choose, isCorrect: false, warning: true });
            return;
        }
        setSubmitting(true);
        setFeedback(null);
        const payload = {
            studentId, grade: Number(grade), board, language,
            topicId: recommendation.topicId, questionId: recommendation.question.id,
            answerIndex: selectedOption
        };
        try {
            const response = await axios.post(`${api}/api/adaptive/attempt`, payload);
            setFeedback(response.data.data);
            setSelected(null);
            await loadPlan();
        } catch (err) {
            if (!err.response) {
                const pendingKey = `mindforge-pending-${studentId}`;
                const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
                pending.push({ ...payload, savedAt: new Date().toISOString() });
                localStorage.setItem(pendingKey, JSON.stringify(pending.slice(-100)));
                setFeedback({ message: t.offline, warning: true });
            } else {
                setFeedback({ message: err.response.data?.error || 'Could not save this answer. Please retry.', warning: true });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const statusLabel = (status) => status === 'mastered' ? t.high : status === 'in-progress' ? t.medium : t.low;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-7 md:p-9 bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-600 text-white shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-2 text-blue-100 text-sm font-semibold mb-3"><BrainCircuit size={18}/> MINDFORGE EDUAI</div>
                        <h1 className="text-3xl md:text-4xl font-black">{t.title}</h1>
                        <p className="text-blue-100 mt-2 max-w-2xl">{t.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 min-w-[210px]">
                        <div className="rounded-2xl bg-white/10 p-4"><p className="text-blue-100 text-xs">{t.progress}</p><p className="text-3xl font-bold">{plan?.summary?.mastered || 0}</p></div>
                        <div className="rounded-2xl bg-white/10 p-4"><p className="text-blue-100 text-xs">{t.attempts}</p><p className="text-3xl font-bold">{plan?.summary?.totalAttempts || 0}</p></div>
                    </div>
                </div>
            </motion.header>

            <section className="card-glass rounded-2xl p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4"><Languages className="text-primary"/><h2 className="text-lg font-bold">{t.language} & {t.board}</h2></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <label className="text-sm font-semibold"> {t.grade}
                        <select value={grade} onChange={e => setGrade(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                            {[6,7,8,9,10].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-semibold">{t.board}
                        <select value={board} onChange={e => setBoard(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                            <option>CBSE</option><option>State Board</option><option>ICSE</option>
                        </select>
                    </label>
                    <label className="text-sm font-semibold">{t.language}
                        <select value={language} onChange={e => setLanguage(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                            <option value="en">English</option><option value="hi">हिन्दी</option><option value="te">తెలుగు</option>
                        </select>
                    </label>
                    <label className="text-sm font-semibold">{t.subject}
                        <select value={subject} onChange={e => setSubject(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                            <option value="All">{t.all}</option><option value="Mathematics">{t.math}</option><option value="Science">{t.science}</option><option value="Programming">{t.programming}</option>
                        </select>
                    </label>
                </div>
            </section>

            {error && <div className="rounded-xl p-4 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex gap-3 items-center"><CircleAlert size={20}/><span>{error}</span><button onClick={loadPlan} className="ml-auto underline">Retry</button></div>}

            {loading && !plan ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={40}/></div> : plan && (
                <>
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card-glass rounded-2xl p-5"><p className="text-sm text-gray-500">{t.progress}</p><div className="flex items-end justify-between mt-2"><p className="text-3xl font-black">{progressPercent}%</p><Target className="text-primary" size={25}/></div><div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 mt-4 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${progressPercent}%` }}/></div></div>
                        <div className="card-glass rounded-2xl p-5"><p className="text-sm text-gray-500">{t.high}</p><p className="text-3xl font-black mt-2">{plan.summary.mastered}</p><p className="text-xs text-gray-500 mt-1">≥75% estimated mastery</p></div>
                        <div className="card-glass rounded-2xl p-5"><p className="text-sm text-gray-500">{t.practice}</p><p className="text-3xl font-black mt-2">{plan.summary.needsPractice}</p><p className="text-xs text-gray-500 mt-1">Topics below 40% estimated mastery</p></div>
                    </section>

                    {recommendation ? <section className="rounded-3xl border border-primary/30 bg-primary/5 p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row gap-7">
                            <div className="flex-1">
                                <div className="text-xs uppercase tracking-widest font-bold text-primary mb-2">{t.next}</div>
                                <h2 className="text-2xl font-black">{recommendation.topicTitle}</h2>
                                <p className="text-gray-500 mt-2">{recommendation.description}</p>
                                <div className="mt-4 p-4 rounded-xl bg-white/70 dark:bg-gray-900/70"><p className="font-bold text-sm">{t.why}</p><p className="text-sm text-gray-500 mt-1">{recommendation.reason}</p></div>
                            </div>
                            <div className="flex-1 rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-sm">
                                <div className="flex justify-between gap-3 text-xs text-gray-500 mb-4"><span>{recommendation.subject} · Class {recommendation.grade}</span><span>Level {recommendation.question.difficulty}</span></div>
                                <h3 className="font-bold text-lg mb-4">{recommendation.question.prompt}</h3>
                                <div className="space-y-2">
                                    {recommendation.question.options.map((option, index) => <label key={option} className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${selectedOption === index ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}>
                                        <input type="radio" name="adaptive-answer" checked={selectedOption === index} onChange={() => setSelected(index)} className="accent-blue-600"/><span>{option}</span>
                                    </label>)}
                                </div>
                                <button disabled={submitting} onClick={submitAnswer} className="mt-5 w-full rounded-xl bg-primary hover:bg-secondary disabled:opacity-50 text-white font-bold py-3 flex justify-center items-center gap-2">{submitting ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>} {t.submit}</button>
                                {feedback && <div className={`mt-4 rounded-xl p-4 text-sm ${feedback.isCorrect ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
                                    <p className="font-bold">{feedback.message || (feedback.isCorrect ? t.correct : t.incorrect)}</p>
                                    {feedback.correctAnswer && <p className="mt-1">Correct answer: {feedback.correctAnswer}</p>}
                                    {feedback.explanation && <p className="mt-1">{feedback.explanation}</p>}
                                    {feedback.masteryProbability !== undefined && <p className="mt-2">Estimated concept mastery: {Math.round(feedback.masteryProbability * 100)}%</p>}
                                </div>}
                            </div>
                        </div>
                    </section> : <div className="card-glass p-6 rounded-2xl">No recommendations available for this selection.</div>}

                    <section className="space-y-4">
                        <div className="flex items-center justify-between"><h2 className="text-2xl font-black flex items-center gap-2"><BookOpen className="text-primary"/>{t.teacher}</h2><button onClick={loadPlan} className="flex items-center gap-2 text-sm text-primary font-semibold"><RefreshCw size={16}/> Refresh</button></div>
                        <p className="text-sm text-gray-500">{t.teacherText}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {plan.topics.map(topic => <div key={topic.id} className="card-glass rounded-2xl p-5">
                                <div className="flex justify-between gap-2 items-start"><div><p className="text-xs text-primary font-bold uppercase">{topic.subject} · Class {topic.grade}</p><h3 className="font-bold mt-1">{topic.title}</h3></div><span className={`text-xs rounded-full px-2 py-1 ${topic.status === 'mastered' ? 'bg-emerald-500/10 text-emerald-600' : topic.status === 'in-progress' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-700'}`}>{statusLabel(topic.status)}</span></div>
                                <p className="text-sm text-gray-500 mt-2">{topic.description}</p>
                                <div className="flex justify-between text-xs text-gray-500 mt-4"><span>{Math.round(topic.masteryProbability * 100)}% mastery estimate</span><span>{topic.attempts} attempts</span></div>
                                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 mt-2 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.round(topic.masteryProbability * 100)}%` }}/></div>
                            </div>)}
                        </div>
                    </section>
                    <p className="text-xs text-gray-500">Prototype note: the included question bank is a small demonstration catalogue, not a complete official syllabus. Mastery estimates are provisional and require teacher-reviewed calibration before classroom use.</p>
                </>
            )}
        </div>
    );
};

export default AdaptiveLearning;
