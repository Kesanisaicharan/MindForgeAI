import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

const Generate = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleGenerate = async (e) => {
        e.preventDefault();
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
        <div className="max-w-3xl mx-auto p-6 mt-10">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass rounded-2xl p-8 overflow-hidden relative"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold mb-4 flex items-center justify-center gap-3">
                        <Sparkles className="text-accent" size={36} />
                        Create a New Course
                    </h1>
                    <p className="text-gray-400 text-lg">What do you want to learn today? Be specific for better results.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                        <AlertCircle size={24} />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleGenerate} className="flex flex-col gap-6">
                    <div className="relative">
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. A comprehensive guide to Python basics matching absolute beginners..."
                            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-gray-700/50 rounded-xl p-6 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all min-h-[150px] resize-none"
                            disabled={loading}
                        />
                    </div>

                    <motion.button
                        whileHover={!loading ? { scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.9)" } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                        type="submit"
                        disabled={loading || !prompt.trim()}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-bold transition-all ${
                            loading || !prompt.trim() 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-primary text-white glow-effect cursor-pointer'
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                Forging your AI Course...
                            </>
                        ) : (
                            <>
                                <Sparkles size={24} />
                                Generate Course
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default Generate;
