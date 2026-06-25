import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Book, PlusCircle, ArrowRight, Loader2, Award } from 'lucide-react';

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

    console.log("DASHBOARD: Current certificates state:", certificates);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 underline decoration-primary decoration-4 underline-offset-8">Welcome back!</h1>
                    <p className="text-gray-400 text-lg">Continue your AI learning journey.</p>
                </div>
                <button
                    onClick={() => navigate('/generate')}
                    className="flex items-center gap-2 bg-primary hover:bg-secondary transition-colors text-white px-6 py-3 rounded-xl font-bold glow-effect"
                >
                    <PlusCircle size={20} />
                    New Course
                </button>
            </div>

            {/* Courses Section */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <Book className="text-primary" /> My Courses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.length > 0 ? (
                        courses.map((course, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={course._id}
                                className="card-glass p-6 rounded-2xl flex flex-col h-full hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Book size={14} /> {course.modules.length} Modules
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">{course.title}</h3>
                                    <p className="text-gray-400 line-clamp-3 text-sm">{course.description}</p>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-800">
                                    <Link
                                        to={`/course/${course._id}`}
                                        className="flex items-center justify-between text-primary font-medium hover:text-accent transition-colors"
                                    >
                                        Continue Learning
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 card-glass rounded-2xl">
                            <Book size={48} className="mx-auto text-gray-500 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No courses yet</h3>
                            <p className="text-gray-400 mb-6">You haven't generated any courses. Start forging knowledge!</p>
                            <button
                                onClick={() => navigate('/generate')}
                                className="bg-transparent border border-primary text-primary px-6 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors"
                            >
                                Generate First Course
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Certificates Section */}
            <div id="certificates" className="mb-20">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <Award className="text-yellow-500" /> Completed Certificates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.length === 0 ? (
                        <p className="col-span-full text-center py-20 text-gray-500">No certificates found</p>
                    ) : (
                        certificates.map((cert, i) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                key={cert._id || i}
                                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-6 rounded-2xl flex items-center justify-between"
                            >
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{cert.courseTitle}</h3>
                                    <p className="text-gray-400 text-sm mb-2">Score: <span className="text-green-400 font-bold">{cert.score}%</span> • Issued: {new Date(cert.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => navigate.open(cert.certificateUrl || `/certificate/${cert.courseId}?score=${cert.score}`, '_blank')}
                                    className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30 px-4 py-2 rounded-lg text-sm font-bold transition-all"
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
