import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, AlertCircle, ArrowRight, Lightbulb } from 'lucide-react';

const Generate = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const templates = [
        "Python Programming 101 for Absolute Beginners",
        "Introduction to Quantum Computing & Mechanics",
        "Personal Finance, Budgeting, & Wealth Building",
        "Modern Digital Marketing & SEO Strategy Guide"
    ];

    const handleGenerate = async (e) => {
        if (e) e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setError('');

        try {
            const API = import.meta.env.VITE_API_URL;
            const response = await axios.post(`${API}/api/ai/generate`, {
                prompt,
                userId: user?.id || user?.uid || 'anonymous'
            });
            
            if (response.data.success) {
                const courseId = response.data.data._id;
                navigate(`/course/${courseId}`);
            }
        } catch (err) {
            console.error('Error generating course:', err);
            setError(err.response?.data?.error || 'Failed to generate course. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 mt-6 relative">
            {/* Background glows */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass rounded-2xl p-8 overflow-hidden relative border border-slate-200/50 dark:border-slate-800/60"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                
                <div className="text-center mb-10">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                        <Sparkles size={24} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                        Forge a New AI Course
                    </h1>
                    <p className="text-slate-500 dark:text-slate-450 text-sm max-w-md mx-auto">
                        Type in any subject, skill, or academic concept. Our AI will instantly map out lessons, explanations, and check-ups.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/15 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-650 dark:text-red-400 text-sm">
                        <AlertCircle className="shrink-0" size={18} />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleGenerate} className="flex flex-col gap-6">
                    <div className="relative">
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. A comprehensive guide to Python basics matching absolute beginners..."
                            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-250 dark:border-slate-800/80 rounded-xl p-5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[140px] resize-none text-sm md:text-base leading-relaxed"
                            disabled={loading}
                        />
                    </div>

                    {/* Templates Helper Section */}
                    <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Lightbulb size={12} className="text-amber-500" /> Need inspiration? Try these:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {templates.map((tpl, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => !loading && setPrompt(tpl)}
                                    className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 px-3.5 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 hover:border-blue-500/20 dark:hover:border-blue-500/20 transition-all font-semibold"
                                >
                                    {tpl}
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.button
                        whileHover={!loading ? { scale: 1.01 } : {}}
                        whileTap={!loading ? { scale: 0.99 } : {}}
                        type="submit"
                        disabled={loading || !prompt.trim()}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2.5 text-base font-bold transition-all shadow-md ${
                            loading || !prompt.trim() 
                                ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 hover:shadow-blue-500/20 glow-effect cursor-pointer'
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Forging your AI Course...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Generate Course Plan
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default Generate;
