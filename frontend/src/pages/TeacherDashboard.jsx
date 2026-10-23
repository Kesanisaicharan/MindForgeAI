import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Loader2, Users } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';
const emptySource = { title:'', text:'', grade:6, board:'CBSE', subject:'Mathematics', language:'en', sourceTitle:'', sourceUrl:'', page:'' };

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [rosters, setRosters] = useState([]);
    const [rosterName, setRosterName] = useState('Class 6');
    const [studentIds, setStudentIds] = useState('');
    const [overview, setOverview] = useState([]);
    const [selectedRoster, setSelectedRoster] = useState('');
    const [source, setSource] = useState(emptySource);
    const [bulkChunks, setBulkChunks] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [documentFile, setDocumentFile] = useState(null);
    const [documentMeta, setDocumentMeta] = useState({ grade: 6, board: 'CBSE', subject: 'Mathematics', language: 'en', sourceTitle: '', sourceUrl: '', page: '' });
    const [uploadingDocument, setUploadingDocument] = useState(false);
    const [assessmentTopics, setAssessmentTopics] = useState([]);
    const [teacherAssessments, setTeacherAssessments] = useState([]);
    const [assessmentResults, setAssessmentResults] = useState(null);
    const [creatingAssessment, setCreatingAssessment] = useState(false);
    const [assessmentForm, setAssessmentForm] = useState({
        title: '', rosterId: '', grade: 6, board: 'CBSE', subject: 'Mathematics',
        language: 'en', topicIds: [], dueAt: ''
    });

    const loadRosters = async () => {
        try {
            const r = await api.get(`${API}/api/adaptive/teacher/rosters`);
            const rosterData = r.data.data || [];
            setRosters(rosterData);
            setAssessmentForm((current) => ({ ...current, rosterId: current.rosterId || rosterData[0]?._id || '' }));
        } catch (e) { setError(e.response?.data?.error || 'Teacher access is required. Configure your teacher role first.'); }
    };
    useEffect(() => { if (user) loadRosters(); }, [user]);

    const loadTeacherAssessments = async () => {
        try {
            const [topicsResponse, assessmentsResponse] = await Promise.all([
                api.get(`${API}/api/adaptive/teacher/assessment-topics`, {
                    params: { grade: assessmentForm.grade, subject: assessmentForm.subject }
                }),
                api.get(`${API}/api/adaptive/teacher/assessments`)
            ]);
            setAssessmentTopics(topicsResponse.data.data || []);
            setTeacherAssessments(assessmentsResponse.data.data || []);
        } catch (e) {
            setError(e.response?.data?.error || 'Could not load assessment tools.');
        }
    };
    useEffect(() => { if (user) loadTeacherAssessments(); }, [user, assessmentForm.grade, assessmentForm.subject]);

    const createAssessment = async (event) => {
        event.preventDefault();
        setError(''); setMessage(''); setCreatingAssessment(true); setAssessmentResults(null);
        try {
            const payload = {
                ...assessmentForm,
                dueAt: assessmentForm.dueAt ? new Date(assessmentForm.dueAt).toISOString() : null
            };
            const response = await api.post(`${API}/api/adaptive/teacher/assessments`, payload);
            setTeacherAssessments((current) => [response.data.data, ...current]);
            setAssessmentForm((current) => ({ ...current, title: '', topicIds: [] }));
            setMessage(`Assessment created and assigned to ${response.data.data.studentCount} students with ${response.data.data.questionCount} questions.`);
        } catch (e) {
            setError(e.response?.data?.error || 'Could not create the assessment.');
        } finally {
            setCreatingAssessment(false);
        }
    };

    const loadAssessmentResults = async (assessmentId) => {
        setError('');
        try {
            const response = await api.get(`${API}/api/adaptive/teacher/assessments/${assessmentId}/results`);
            setAssessmentResults(response.data.data);
        } catch (e) {
            setError(e.response?.data?.error || 'Could not load assessment results.');
        }
    };

    const saveRoster = async (e) => {
        e.preventDefault(); setError(''); setMessage('');
        try {
            const ids = studentIds.split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean);
            const r = await api.post(`${API}/api/adaptive/teacher/rosters`, { name: rosterName, studentIds: ids });
            setRosters(prev => [...prev.filter(x=>x._id !== r.data.data._id), r.data.data]);
            setSelectedRoster(r.data.data._id); setMessage('Class roster saved.'); await loadOverview(r.data.data._id);
        } catch (e) { setError(e.response?.data?.error || 'Could not save class roster.'); }
    };
    const loadOverview = async (id) => {
        if (!id) return;
        setLoading(true); setError('');
        try {
            const r = await api.get(`${API}/api/adaptive/teacher/overview`, { params: { rosterId:id } });
            setOverview(r.data.data?.students || []); setSelectedRoster(id);
        } catch (e) { setError(e.response?.data?.error || 'Could not load class overview.'); }
        finally { setLoading(false); }
    };

    const importBulkFile = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setError(''); setMessage('');
        try {
            const parsed = JSON.parse(await file.text());
            const chunks = Array.isArray(parsed) ? parsed : parsed.chunks;
            if (!Array.isArray(chunks) || chunks.length < 1 || chunks.length > 100) {
                throw new Error('JSON must contain an array of 1–100 curriculum chunks (or { "chunks": [...] }).');
            }
            setBulkChunks(chunks);
            setMessage(`Loaded ${chunks.length} chunks from JSON. Review the file before importing.`);
        } catch (e) {
            setBulkChunks([]);
            setError(e.message || 'Could not read JSON file.');
        } finally { event.target.value = ''; }
    };
    const submitBulkImport = async () => {
        setError(''); setMessage('');
        try {
            const r = await api.post(`${API}/api/curriculum/chunks/bulk`, { chunks: bulkChunks });
            setMessage(`Imported ${r.data.count} reviewed curriculum chunks.`);
            setBulkChunks([]);
        } catch (e) { setError(e.response?.data?.error || 'Bulk import failed.'); }
    };

    const uploadDocument = async (e) => {
        e.preventDefault();
        setError(''); setMessage('');
        if (!documentFile) { setError('Choose a PDF, TXT, or HTML document first.'); return; }
        setUploadingDocument(true);
        try {
            const formData = new FormData();
            formData.append('file', documentFile);
            Object.entries(documentMeta).forEach(([key, value]) => formData.append(key, String(value)));
            const result = await api.post(`${API}/api/curriculum/upload`, formData);
            setMessage(`Imported ${result.data.count} curriculum chunks from ${documentFile.name} (${result.data.charactersExtracted} characters extracted).`);
            setDocumentFile(null);
            setDocumentMeta((old) => ({ ...old, sourceTitle: '', sourceUrl: '', page: '' }));
            const input = document.getElementById('mindforge-curriculum-file');
            if (input) input.value = '';
        } catch (e) {
            setError(e.response?.data?.error || 'Could not ingest the document. Check its format and try again.');
        } finally {
            setUploadingDocument(false);
        }
    };

    const saveSource = async (e) => {
        e.preventDefault(); setError(''); setMessage('');
        try {
            await api.post(`${API}/api/curriculum/chunks`, { ...source, grade:Number(source.grade) });
            setMessage('Curriculum excerpt saved. It can now be retrieved by the student tutor.');
            setSource(emptySource);
        } catch (e) { setError(e.response?.data?.error || 'Could not save curriculum excerpt.'); }
    };

    return <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="rounded-3xl p-7 bg-gradient-to-br from-slate-800 to-indigo-700 text-white"><h1 className="text-3xl font-black flex items-center gap-3"><Users/> Teacher Dashboard</h1><p className="text-slate-200 mt-2">Review student support needs and add approved curriculum excerpts for grounded tutoring.</p></header>
        {message && <p className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600">{message}</p>}
        {error && <p className="p-4 rounded-xl bg-red-500/10 text-red-600">{error}</p>}
        <section className="card-glass rounded-2xl p-6 space-y-4"><h2 className="text-xl font-bold">Class roster</h2><p className="text-sm text-gray-500">Enter authenticated Supabase user IDs for students in your class. Only your own saved rosters are available to your teacher account.</p>
            <form onSubmit={saveRoster} className="space-y-3"><label className="block text-sm font-semibold">Class name<input required maxLength={100} value={rosterName} onChange={e=>setRosterName(e.target.value)} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700"/></label><label className="block text-sm font-semibold">Student IDs (comma or newline separated)<textarea required rows={3} value={studentIds} onChange={e=>setStudentIds(e.target.value)} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700" placeholder="Paste student Supabase user IDs"/></label><button className="rounded-xl bg-primary text-white px-5 py-3 font-bold">Save roster</button></form>
            {rosters.length>0 && <div className="flex flex-wrap gap-2">{rosters.map(r=><button key={r._id} onClick={()=>loadOverview(r._id)} className={`rounded-xl px-4 py-2 border ${selectedRoster===r._id?'bg-primary text-white':'border-gray-300 dark:border-gray-700'}`}>{r.name} ({r.studentIds.length})</button>)}</div>}
        </section>
        <section className="card-glass rounded-2xl p-6 space-y-4"><h2 className="text-xl font-bold">Student learning overview</h2>{loading?<Loader2 className="animate-spin"/>:overview.length===0?<p className="text-sm text-gray-500">Select a roster to view learners and concepts needing support.</p>:<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{overview.map(s=><article key={s.studentId} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><p className="font-bold break-all">{s.studentId}</p><p className="text-sm text-gray-500">Class {s.grade} · {s.board} · {s.totalAttempts} answers</p><p className="mt-3 text-sm font-semibold">Mastered topics: {s.masteredTopics}</p><p className="text-sm font-semibold text-amber-600 mt-2">Needs support: {s.needsSupport.length}</p>{s.needsSupport.map(topic=><p key={topic.topicId} className="text-xs mt-1 break-all">{topic.topicId} — {Math.round(topic.masteryProbability*100)}% estimated mastery</p>)}</article>)}</div>}</section>
        <section className="card-glass rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold">Import a curriculum document</h2>
            <p className="text-sm text-gray-500">Upload a text-based PDF, TXT, or HTML file up to 8 MB. Text is extracted, split into overlapping chunks, and stored with source metadata. Scanned PDFs need OCR before upload. Only import material you are authorized to use.</p>
            <form onSubmit={uploadDocument} className="grid md:grid-cols-2 gap-4">
                <label className="md:col-span-2 text-sm font-semibold">Document file
                    <input id="mindforge-curriculum-file" required type="file" accept=".pdf,.txt,.html,.htm,application/pdf,text/plain,text/html" onChange={e=>setDocumentFile(e.target.files?.[0] || null)} className="mt-2 block w-full text-sm"/>
                </label>
                <label className="text-sm font-semibold">Source / textbook title
                    <input required maxLength={200} value={documentMeta.sourceTitle} onChange={e=>setDocumentMeta({...documentMeta,sourceTitle:e.target.value})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700"/>
                </label>
                <label className="text-sm font-semibold">Source URL (HTTPS only)
                    <input type="url" value={documentMeta.sourceUrl} onChange={e=>setDocumentMeta({...documentMeta,sourceUrl:e.target.value})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700" placeholder="https://…"/>
                </label>
                <label className="text-sm font-semibold">Subject
                    <input required maxLength={80} value={documentMeta.subject} onChange={e=>setDocumentMeta({...documentMeta,subject:e.target.value})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700"/>
                </label>
                <label className="text-sm font-semibold">Grade
                    <select value={documentMeta.grade} onChange={e=>setDocumentMeta({...documentMeta,grade:Number(e.target.value)})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700">{[6,7,8,9,10].map(g=><option key={g} value={g}>Class {g}</option>)}</select>
                </label>
                <label className="text-sm font-semibold">Board
                    <select value={documentMeta.board} onChange={e=>setDocumentMeta({...documentMeta,board:e.target.value})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700"><option>CBSE</option><option>ICSE</option><option>State Board</option></select>
                </label>
                <label className="text-sm font-semibold">Content language
                    <select value={documentMeta.language} onChange={e=>setDocumentMeta({...documentMeta,language:e.target.value})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700"><option value="en">English</option><option value="hi">Hindi</option><option value="te">Telugu</option></select>
                </label>
                <label className="text-sm font-semibold">Page / section (optional)
                    <input maxLength={30} value={documentMeta.page} onChange={e=>setDocumentMeta({...documentMeta,page:e.target.value})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700"/>
                </label>
                <button disabled={!documentFile || uploadingDocument} className="md:col-span-2 rounded-xl bg-primary text-white px-5 py-3 font-bold disabled:opacity-50">{uploadingDocument ? 'Extracting and importing…' : 'Extract and import document'}</button>
            </form>
        </section>
        <section className="card-glass rounded-2xl p-6 space-y-5">
            <h2 className="text-xl font-bold">Create and manage assessments</h2>
            <p className="text-sm text-gray-500">Build a quiz from the reviewed curriculum question bank and assign it to one of your saved class rosters. Correct answers remain on the server until submission.</p>
            <form onSubmit={createAssessment} className="grid md:grid-cols-2 gap-4">
                <label className="text-sm font-semibold">Assessment title
                    <input required maxLength={160} value={assessmentForm.title} onChange={e=>setAssessmentForm({...assessmentForm,title:e.target.value})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700" placeholder="e.g. Fractions checkpoint"/>
                </label>
                <label className="text-sm font-semibold">Assign to class
                    <select required value={assessmentForm.rosterId} onChange={e=>setAssessmentForm({...assessmentForm,rosterId:e.target.value})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700">
                        <option value="">Choose a roster</option>{rosters.map(r=><option key={r._id} value={r._id}>{r.name} ({r.studentIds.length} students)</option>)}
                    </select>
                </label>
                <label className="text-sm font-semibold">Grade
                    <select value={assessmentForm.grade} onChange={e=>setAssessmentForm({...assessmentForm,grade:Number(e.target.value),topicIds:[]})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700">{[6,7,8,9,10].map(g=><option key={g} value={g}>Class {g}</option>)}</select>
                </label>
                <label className="text-sm font-semibold">Board
                    <select value={assessmentForm.board} onChange={e=>setAssessmentForm({...assessmentForm,board:e.target.value})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700"><option>CBSE</option><option>ICSE</option><option>State Board</option></select>
                </label>
                <label className="text-sm font-semibold">Subject
                    <select value={assessmentForm.subject} onChange={e=>setAssessmentForm({...assessmentForm,subject:e.target.value,topicIds:[]})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700"><option>Mathematics</option><option>Science</option><option>Programming</option><option>All</option></select>
                </label>
                <label className="text-sm font-semibold">Question language
                    <select value={assessmentForm.language} onChange={e=>setAssessmentForm({...assessmentForm,language:e.target.value})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700"><option value="en">English</option><option value="hi">Hindi</option><option value="te">Telugu</option></select>
                </label>
                <label className="text-sm font-semibold">Due date (optional)
                    <input type="datetime-local" value={assessmentForm.dueAt} onChange={e=>setAssessmentForm({...assessmentForm,dueAt:e.target.value})} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700"/>
                </label>
                <fieldset className="md:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <legend className="px-2 text-sm font-semibold">Select topics</legend>
                    {assessmentTopics.length===0 ? <p className="text-sm text-gray-500">No question-bank topics match this grade and subject.</p> : <div className="grid sm:grid-cols-2 gap-2">
                        {assessmentTopics.map(topic=><label key={topic.id} className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                            <input type="checkbox" checked={assessmentForm.topicIds.includes(topic.id)} onChange={e=>setAssessmentForm({...assessmentForm,topicIds:e.target.checked?[...assessmentForm.topicIds,topic.id]:assessmentForm.topicIds.filter(id=>id!==topic.id)})} className="mt-1"/>
                            <span><span className="block font-semibold text-sm">{topic.title}</span><span className="block text-xs text-gray-500">Class {topic.grade} · {topic.questionCount} questions</span></span>
                        </label>)}
                    </div>}
                </fieldset>
                <button disabled={creatingAssessment || !assessmentForm.rosterId || assessmentForm.topicIds.length===0} className="md:col-span-2 rounded-xl bg-primary text-white px-5 py-3 font-bold disabled:opacity-50">{creatingAssessment ? 'Creating assessment…' : 'Create and assign assessment'}</button>
            </form>
            <div className="space-y-3">
                <h3 className="font-bold">Existing assessments</h3>
                {teacherAssessments.length===0 ? <p className="text-sm text-gray-500">No assessments have been assigned yet.</p> : teacherAssessments.map(item=><div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div><p className="font-bold">{item.title}</p><p className="text-xs text-gray-500">{item.rosterName} · Class {item.grade} {item.subject} · {item.questionCount} questions · {item.studentCount} students</p><p className="text-xs text-gray-500">{item.dueAt ? `Due ${new Date(item.dueAt).toLocaleString()}` : 'No due date'}</p></div>
                    <button onClick={()=>loadAssessmentResults(item.id)} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold">View results</button>
                </div>)}
            </div>
            {assessmentResults && <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold">{assessmentResults.assessment.title} — results</h3><p className="text-xs text-gray-500">{assessmentResults.submittedCount} of {assessmentResults.assignedCount} submitted</p></div><button onClick={()=>setAssessmentResults(null)} className="text-sm underline">Close</button></div>
                {assessmentResults.submissions.length===0 ? <p className="text-sm text-gray-500">No submissions yet.</p> : assessmentResults.submissions.map(result=><div key={result._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-gray-200 dark:border-gray-700 pt-3"><span className="text-xs break-all">{result.studentId}</span><span className="text-sm font-bold">{result.score}% ({result.correctCount}/{result.totalQuestions})</span><span className="text-xs text-gray-500">{new Date(result.submittedAt).toLocaleString()}</span></div>)}
            </div>}
        </section>
        <section className="card-glass rounded-2xl p-6 space-y-3"><h2 className="text-xl font-bold">Official curriculum references</h2><p className="text-sm text-gray-500">Use official portals to verify the grade, board, edition and language before adding a source. Check the publisher's terms first; linking to a textbook is not permission to republish its text inside an app.</p><ul className="list-disc pl-5 space-y-2 text-primary underline"><li><a href="https://ncert.nic.in/textbook.php" target="_blank" rel="noreferrer">NCERT official textbook portal</a></li><li><a href="https://epathshala.nic.in/epathshala.php?id=Students&ln=en" target="_blank" rel="noreferrer">ePathshala student resources</a></li><li><a href="https://ncert.nic.in/syllabus_nep.php?ln=en" target="_blank" rel="noreferrer">NCERT syllabus resources</a></li></ul></section>
        <section className="card-glass rounded-2xl p-6 space-y-4"><h2 className="text-xl font-bold">Bulk curriculum import (JSON)</h2><p className="text-sm text-gray-500">Prepare a JSON array with title, text, grade, board, subject, language, sourceTitle, sourceUrl and page. Import up to 100 chunks per batch. Only upload teacher-reviewed content you are allowed to use.</p><input type="file" accept=".json,application/json" onChange={importBulkFile} className="block w-full text-sm"/>{bulkChunks.length>0 && <div className="flex items-center justify-between gap-3"><p className="text-sm">{bulkChunks.length} chunks ready to import</p><button onClick={submitBulkImport} className="rounded-xl bg-primary text-white px-5 py-3 font-bold">Import {bulkChunks.length} chunks</button></div>}<details><summary className="cursor-pointer text-sm underline">Show JSON format</summary><pre className="text-xs whitespace-pre-wrap mt-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-900">{JSON.stringify({chunks:[{title:"Fractions",text:"Teacher-reviewed excerpt text",grade:6,board:"CBSE",subject:"Mathematics",language:"en",sourceTitle:"Textbook name",sourceUrl:"https://example.org/source",page:"12"}]},null,2)}</pre></details></section>
        <section className="card-glass rounded-2xl p-6 space-y-4"><h2 className="text-xl font-bold flex items-center gap-2"><BookOpen/> Add reviewed curriculum excerpt</h2><p className="text-sm text-gray-500">Use content you have permission to use, verify its board/class/language, and cite the actual textbook or source. This is an excerpt importer, not a complete syllabus uploader.</p>
            <form onSubmit={saveSource} className="grid md:grid-cols-2 gap-4">
                <label className="text-sm font-semibold">Excerpt title<input required maxLength={180} value={source.title} onChange={e=>setSource({...source,title:e.target.value})} className="mt-2 w-full p-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700"/></label>
                <label className="text-sm font-semibold">Subject<input required maxLength={80} value={source.subject} onChange={e=>setSource({...source,subject:e.target.value})} className="mt-2 w-full p-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700"/></label>
                <label className="text-sm font-semibold">Source / textbook title<input required maxLength={200} value={source.sourceTitle} onChange={e=>setSource({...source,sourceTitle:e.target.value})} className="mt-2 w-full p-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700"/></label>
                <label className="text-sm font-semibold">Source URL (optional)<input type="url" value={source.sourceUrl} onChange={e=>setSource({...source,sourceUrl:e.target.value})} className="mt-2 w-full p-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700" placeholder="https://…"/></label>
                <label className="text-sm font-semibold">Class<select value={source.grade} onChange={e=>setSource({...source,grade:Number(e.target.value)})} className="mt-2 w-full p-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700">{[6,7,8,9,10].map(g=><option key={g}>{g}</option>)}</select></label>
                <label className="text-sm font-semibold">Board<select value={source.board} onChange={e=>setSource({...source,board:e.target.value})} className="mt-2 w-full p-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700"><option>CBSE</option><option>ICSE</option><option>State Board</option></select></label>
                <label className="text-sm font-semibold">Content language<select value={source.language} onChange={e=>setSource({...source,language:e.target.value})} className="mt-2 w-full p-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700"><option value="en">English</option><option value="hi">Hindi</option><option value="te">Telugu</option></select></label>
                <label className="text-sm font-semibold">Page / section<input maxLength={40} value={source.page} onChange={e=>setSource({...source,page:e.target.value})} className="mt-2 w-full p-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700"/></label>
                <label className="md:col-span-2 text-sm font-semibold">Reviewed excerpt<textarea required minLength={20} maxLength={12000} rows={5} value={source.text} onChange={e=>setSource({...source,text:e.target.value})} className="mt-2 w-full p-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700"/></label>
                <button className="md:col-span-2 rounded-xl bg-primary text-white px-5 py-3 font-bold">Save approved excerpt</button>
            </form>
        </section>
    </div>;
}
