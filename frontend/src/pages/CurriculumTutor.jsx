import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { BookOpenCheck, Loader2, Send } from 'lucide-react';

export default function CurriculumTutor() {
    const { user } = useAuth();
    const [grade, setGrade] = useState(6);
    const [board, setBoard] = useState('CBSE');
    const [subject, setSubject] = useState('Mathematics');
    const [language, setLanguage] = useState(() => localStorage.getItem('mindforge-language') || 'en');
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { localStorage.setItem('mindforge-language', language); }, [language]);

    const ask = async (event) => {
        event.preventDefault();
        if (!query.trim() || !user) return;
        setLoading(true); setError(''); setAnswer(null);
        try {
            const response = await api.post(`${import.meta.env.VITE_API_URL || ''}/api/curriculum/ask`, {
                query, grade: Number(grade), board, subject, language
            });
            setAnswer(response.data.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Tutor request failed. Check your connection.');
        } finally { setLoading(false); }
    };

    return <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <header className="rounded-3xl p-7 bg-gradient-to-br from-indigo-700 to-cyan-600 text-white">
            <div className="flex items-center gap-3"><BookOpenCheck size={30}/><h1 className="text-3xl font-black">Curriculum Tutor</h1></div>
            <p className="mt-2 text-blue-100">Answers use teacher-approved curriculum excerpts and show source references. If no source matches, the tutor says so instead of guessing.</p>
        </header>
        <form onSubmit={ask} className="card-glass rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <label className="text-sm font-semibold">Class<select value={grade} onChange={e=>setGrade(Number(e.target.value))} className="mt-2 w-full p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">{[6,7,8,9,10].map(g=><option key={g}>{g}</option>)}</select></label>
                <label className="text-sm font-semibold">Board<select value={board} onChange={e=>setBoard(e.target.value)} className="mt-2 w-full p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"><option>CBSE</option><option>ICSE</option><option>State Board</option></select></label>
                <label className="text-sm font-semibold">Subject<select value={subject} onChange={e=>setSubject(e.target.value)} className="mt-2 w-full p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"><option>Mathematics</option><option>Science</option><option>English</option><option>Social Science</option></select></label>
                <label className="text-sm font-semibold">Answer language<select value={language} onChange={e=>setLanguage(e.target.value)} className="mt-2 w-full p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"><option value="en">English</option><option value="hi">हिन्दी</option><option value="te">తెలుగు</option></select></label>
            </div>
            <label className="block text-sm font-semibold">Your question<textarea value={query} onChange={e=>setQuery(e.target.value)} maxLength={1500} rows={4} required placeholder="Ask a question about your class topic…" className="mt-2 w-full p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"/></label>
            <button disabled={loading || !query.trim()} className="rounded-xl bg-primary text-white px-5 py-3 font-bold flex items-center gap-2 disabled:opacity-50">{loading?<Loader2 className="animate-spin"/>:<Send size={18}/>} Ask tutor</button>
        </form>
        {error && <p className="p-4 rounded-xl bg-red-500/10 text-red-600">{error}</p>}
        {answer && <section className="card-glass rounded-2xl p-6 space-y-4"><h2 className="text-xl font-bold">Answer</h2><p className="whitespace-pre-wrap leading-7">{answer.answer}</p><div><p className="font-bold mb-2">Sources</p>{answer.citations?.length ? <ul className="space-y-2">{answer.citations.map(c=><li key={c.marker} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3"><span className="font-bold">[{c.marker}] {c.title}</span><p className="text-sm text-gray-500">{c.section}{c.page ? ` · page ${c.page}` : ''}</p>{c.url && <a className="text-primary underline break-all" href={c.url} target="_blank" rel="noreferrer">{c.url}</a>}</li>)}</ul>:<p className="text-sm text-amber-600">No approved source matched. Ask a teacher to add a reviewed excerpt.</p>}</div></section>}
    </div>;
}
