import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Book, PlusCircle, ArrowRight, Loader2, Award, Calendar, ChevronRight } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    // ⚡ Hash Scroll Behavior
    useEffect(() => {
        if (location.hash === '#certificates') {
            const el = document.getElementById('certificates');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location, loading]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            // Use _id as priority (Step 3)
            const activeUserId = user._id || user.id || user.uid;
            console.log("DASHBOARD: Fetching for user ID:", activeUserId);

            try {
                const API = import.meta.env.VITE_API_URL;
                const [coursesRes, certsRes] = await Promise.all([
                    axios.get(`${API}/api/courses/user/${activeUserId}`),
                    axios.get(`${API}/api/certificates/${activeUserId}`)
                ]);

                if (coursesRes.data.success) {
                    const allCourses = coursesRes.data.data;
                    console.log(`DASHBOARD: Found ${allCourses.length} courses total.`);

                    // 🛡️ Deduplicate by Title (Keep first/latest)
                    const uniqueCourses = [];
                    const seenTitles = new Set();

                    allCourses.forEach(course => {
                        const normalizedTitle = course.title.trim().toLowerCase();
                        if (!seenTitles.has(normalizedTitle)) {
                            seenTitles.add(normalizedTitle);
                            uniqueCourses.push(course);
                        }
                    });

                    setCourses(uniqueCourses);
                }

                if (certsRes.data.success) {
                    console.log("Frontend certificates:", certsRes.data.data);
                    setCertificates(certsRes.data.data);
                }

            } catch (error) {
                console.error('DASHBOARD: Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 relative">
            {/* Header section with gradient background highlight */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-cyan-400">{user?.user_metadata?.full_name || 'Student'}</span>!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Continue your custom AI learning journey.</p>
                </div>
                <button
                    onClick={() => navigate('/generate')}
                    className="flex items-center gap-2 self-start md:self-auto bg-blue-600 hover:bg-blue-700 transition-all text-white px-6 py-3.5 rounded-xl font-bold glow-effect shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
                >
                    <PlusCircle size={20} />
                    Generate New Course
                </button>
            </div>

            {/* Courses Section */}
            <div className="mb-20">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                    <Book className="text-blue-500" size={24} /> My Generated Courses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.length > 0 ? (
                        courses.map((course, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                key={course._id}
                                className="card-glass p-6 rounded-2xl flex flex-col h-full border border-slate-200/50 dark:border-slate-800/50 hover:border-blue-500/40 dark:hover:border-blue-400/40 hover:-translate-y-1.5 transition-all duration-300"
                            >
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                        {course.modules?.length || 0} Modules
                                    </div>
                                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-3 line-clamp-2 leading-snug">{course.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 line-clamp-3 text-sm leading-relaxed">{course.description}</p>
                                </div>

                                <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                        <Calendar size={12} /> {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Recent'}
                                    </span>
                                    <Link
                                        to={`/course/${course._id}`}
                                        className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-bold hover:gap-2 transition-all"
                                    >
                                        Study Course
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 card-glass rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                            <Book size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No courses generated yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">Create a customized learning plan on any subject and it will appear here.</p>
                            <button
                                onClick={() => navigate('/generate')}
                                className="bg-transparent border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-slate-950 transition-colors"
                            >
                                Forge First Course
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Certificates Section */}
            <div id="certificates" className="mb-10">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                    <Award className="text-amber-500" size={24} /> My Verified Certificates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {certificates.length === 0 ? (
                        <div className="col-span-full text-center py-16 card-glass rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                            <Award size={40} className="mx-auto text-slate-400 dark:text-slate-600 mb-3" />
                            <p className="text-slate-500 dark:text-slate-400">Complete a course quiz with 80% or higher score to unlock your official certificate.</p>
                        </div>
                    ) : (
                        certificates.map((cert, i) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.08 }}
                                key={cert._id || i}
                                className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-slate-850 p-6 rounded-2xl flex items-center justify-between shadow-xl"
                            >
                                <div className="max-w-[70%]">
                                    <h3 className="text-lg font-bold text-white mb-1.5 truncate">{cert.courseTitle}</h3>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-xs">
                                        <span className="flex items-center gap-1">
                                            Score: <strong className="text-emerald-400">{cert.score}%</strong>
                                        </span>
                                        <span>•</span>
                                        <span>Issued: {new Date(cert.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.open(cert.certificateUrl || `/certificate/${cert.courseId}?score=${cert.score}`, '_blank')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
                                >
                                    View Certificate
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
