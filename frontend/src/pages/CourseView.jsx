import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, ArrowLeft, Loader2, Award, ChevronRight, Bookmark } from 'lucide-react';

const CourseView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState(0);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const API = import.meta.env.VITE_API_URL;
                const response = await axios.get(`${API}/api/ai/course/${id}`);
                if (response.data.success) {
                    setCourse(response.data.data);
                } else {
                    setError('Failed to load course details.');
                }
            } catch (err) {
                console.error(err);
                setError('Error fetching course from server.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCourse();
    }, [id]);

    const scrollToModule = (index) => {
        setActiveSection(index);
        const element = document.getElementById(`module-${index}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-blue-600">
                <Loader2 className="animate-spin mb-4" size={48} />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Forging course content...</h2>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="text-center mt-20 text-red-500 max-w-md mx-auto card-glass p-8 rounded-2xl border border-red-500/20">
                <h2 className="text-2xl font-bold mb-4">Error Loading Course</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{error || 'Course not found.'}</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 mb-20">
            {/* Back Button & Breadcrumbs */}
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors font-semibold"
            >
                <ArrowLeft size={18} />
                Back to Dashboard
            </button>

            {/* Course Header Banner */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass rounded-2xl p-8 mb-10 border border-slate-200/50 dark:border-slate-850 shadow-lg relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 dark:bg-blue-500"></div>
                <div className="max-w-4xl">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest mb-3">
                        <BookOpen size={14} /> AI-Generated Course
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-4 leading-tight">
                        {course.title}
                    </h1>
                    <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                        {course.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <span className="bg-slate-100 dark:bg-slate-900 px-4 py-2.5 rounded-lg border border-slate-200/40 dark:border-slate-800/40 flex items-center gap-1.5">
                            <BookOpen size={14} className="text-blue-500" />
                            {course.modules?.length || 0} Syllabus Modules
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Split layout for syllabus contents */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Sticky Sidebar Navigation (Desktop only) */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-28 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 backdrop-blur-md">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 px-2">Course syllabus</h3>
                        <div className="space-y-1">
                            {course.modules?.map((module, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => scrollToModule(idx)}
                                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-start gap-2.5 ${
                                        activeSection === idx 
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-150 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white'
                                    }`}
                                >
                                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                                        activeSection === idx ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                                    }`}>
                                        {idx + 1}
                                    </span>
                                    <span className="truncate">{module.Title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modules Contents (Main Feed) */}
                <div className="lg:col-span-3 space-y-8">
                    {course.modules?.map((module, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            onViewportEnter={() => setActiveSection(index)}
                            id={`module-${index}`}
                            key={module._id || index}
                            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-sm transition-all relative"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-lg border border-blue-500/20">
                                        {index + 1}
                                    </div>
                                    <h3 className="text-slate-800 dark:text-white font-extrabold text-xl leading-snug">{module.Title}</h3>
                                </div>
                                <Bookmark size={18} className="text-slate-300 dark:text-slate-600" />
                            </div>

                            <p className="text-slate-600 dark:text-slate-350 mb-8 leading-relaxed text-base whitespace-pre-line">
                                {module.Explanation}
                            </p>
                            
                            {module.KeyPoints && module.KeyPoints.length > 0 && (
                                <div className="bg-slate-50 dark:bg-slate-950/60 p-6 rounded-xl border border-slate-200/50 dark:border-slate-850">
                                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-850 pb-2">
                                        <CheckCircle size={15} className="text-emerald-500" /> Key Takeaways
                                    </h4>
                                    <ul className="grid gap-3">
                                        {module.KeyPoints.map((point, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mt-2 flex-shrink-0"></span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {/* Take Quiz CTA Block */}
                    <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-indigo-700 p-10 rounded-3xl shadow-xl shadow-blue-500/10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                        <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Ready to Validate Your Knowledge?</h2>
                        <p className="text-blue-150 max-w-lg mx-auto mb-8 text-sm md:text-base leading-relaxed">
                            Take the comprehensive assessment based on these modules. Earn an official completion certificate by scoring 80% or higher.
                        </p>
                        <motion.button
                            onClick={() => navigate(`/quiz/${id}`)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="bg-white hover:bg-slate-50 text-blue-700 font-extrabold px-10 py-4 rounded-xl text-lg shadow-md transition-all inline-flex items-center gap-2 hover:gap-3"
                        >
                            Take Course Quiz <Award size={20} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseView;
