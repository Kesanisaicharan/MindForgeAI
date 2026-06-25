import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

const CourseView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary">
                <Loader2 className="animate-spin mb-4" size={48} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Loading your course...</h2>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="text-center mt-20 text-red-400">
                <h2 className="text-2xl font-bold mb-4">Oops!</h2>
                <p>{error || 'Course not found.'}</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 mb-20 animate-fade-in">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft size={20} />
                Back
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-700 rounded-2xl p-8 mb-10 border-l-4 border-l-primary shadow-md"
            >
                <h1 className="text-4xl font-extrabold text-white mb-4">
                    {course.title}
                </h1>
                <p className="text-lg text-gray-200 leading-relaxed mb-6">
                    {course.description}
                </p>

                <div className="flex items-center gap-4 text-sm font-medium text-gray-400 bg-black/40 p-4 rounded-xl inline-flex w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <BookOpen size={18} className="text-primary" />
                        {course.modules?.length || 0} Modules
                    </div>
                </div>
            </motion.div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                    Course Content
                </h2>

                {course.modules?.map((module, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={module._id || index}
                        className="bg-gray-700 border border-gray-600 rounded-xl p-6 shadow-md transition-all"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                                {index + 1}
                            </div>
                            <h3 className="text-white font-semibold text-lg">{module.Title}</h3>
                        </div>

                        <p className="text-gray-200 mb-6 leading-relaxed">
                            {module.Explanation}
                        </p>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <CheckCircle size={16} /> Key Takeaways
                            </h4>
                            <ul className="grid gap-2">
                                {module.KeyPoints?.map((point, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-gray-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 text-center">
                <motion.button
                    onClick={() => navigate(`/quiz/${id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-bold text-lg glow-effect shadow-lg"
                >
                    Take Quiz & Earn Certificate
                </motion.button>
            </div>
        </div>
    );
};

export default CourseView;
