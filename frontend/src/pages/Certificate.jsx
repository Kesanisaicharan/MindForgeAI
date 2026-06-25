import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Award, Loader2, MailCheck, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Certificate = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Extract score from URL query params
    const searchParams = new URLSearchParams(location.search);
    const score = Number(searchParams.get('score')) || 100;

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [emailSent, setEmailSent] = useState(false);
    const [generating, setGenerating] = useState(false);
    const hasGenerated = useRef(false);

    // RESET generation state when course ID or search params (score/timestamp) change
    useEffect(() => {
        console.log('CERTIFICATE: Route changed, resetting generation state.');
        hasGenerated.current = false;
        setEmailSent(false);
        setCourse(null);
        setLoading(true);
    }, [id, location.search]);

    // 1. Fetch Course Data
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const API = import.meta.env.VITE_API_URL;
                const response = await axios.get(`${API}/api/ai/course/${id}`);
                if (response.data.success) {
                    setCourse(response.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch course:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCourse();
    }, [id]);

    // 2. Generate Certificate & Send Email (Guarded)
    useEffect(() => {
        const generate = async () => {
            if (hasGenerated.current || !course || !user) return;

            try {
                hasGenerated.current = true;
                setGenerating(true);

                const activeUserId = user._id || user.id || user.uid || 'anonymous';
                console.log("📧 Attempting to send email to:", user.email);

                const API = import.meta.env.VITE_API_URL;
                const response = await axios.post(`${API}/api/certificates/generate`, {
                    userId: activeUserId,
                    userName: user?.user_metadata?.full_name || user?.displayName || 'Valued Student',
                    email: user?.email, // Added user email
                    courseId: id,
                    courseTitle: course.title,
                    score: score
                });

                if (response.data.success) {
                    setEmailSent(true);
                    console.log('CERTIFICATE: Saved successfully');
                }
            } catch (err) {
                console.error('Error generating certificate:', err);
                hasGenerated.current = false; // Allow retry if it failed
            } finally {
                setGenerating(false);
            }
        };

        if (course && user) {
            generate();
        }
    }, [course, user, id, score]);

    const handleLinkedInShare = () => {
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`;
        const message = `I just completed "${course.title}" using MindForgeAI 🚀`;
        const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(message)}`;
        window.open(linkedinUrl, '_blank');
    };

    if (loading || !course) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 py-10">
            {emailSent && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center justify-center gap-3">
                    <MailCheck size={20} />
                    <span>Your achievement has been saved to your dashboard!</span>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white text-black p-12 rounded-3xl relative overflow-hidden shadow-2xl border-8 border-gray-200"
            >
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-yellow-400 via-primary to-accent"></div>
                <div className="absolute top-4 left-4 right-4 bottom-4 border-4 border-double border-gray-300 rounded-2xl pointer-events-none"></div>

                <div className="text-center relative z-10 flex flex-col items-center">
                    <Award size={80} className="text-yellow-500 mb-6 drop-shadow-md" />
                    <h1 className="text-5xl font-serif font-bold mb-2 uppercase tracking-widest text-gray-800">
                        Certificate of Completion
                    </h1>
                    <p className="text-gray-500 tracking-widest uppercase mb-10 text-sm">MindForgeAI Learning Platform</p>

                    <p className="text-xl text-gray-600 mb-4 italic">This is to certify that</p>
                    <h2 className="text-4xl font-extrabold text-primary mb-8 underline decoration-gray-300 underline-offset-8">
                        {user?.user_metadata?.full_name || 'Valued Student'}
                    </h2>

                    <p className="text-xl text-gray-600 mb-4 italic">has successfully completed the AI-generated course</p>
                    <h3 className="text-3xl font-bold text-gray-800 mb-8 max-w-2xl px-10">
                        {course.title}
                    </h3>

                    <p className="text-lg text-gray-500 mb-10">
                        Achieving a quiz score of <span className="font-bold text-black">{score}%</span> demonstrating excellent comprehension.
                    </p>

                    <div className="flex justify-between w-full mt-10 px-10 items-end">
                        <div className="text-left border-t-2 border-gray-300 pt-2 w-48">
                            <p className="font-serif font-bold text-gray-700">MindForge AI</p>
                            <p className="text-sm text-gray-500">Automated Instructor</p>
                        </div>

                        <div className="w-32 h-32 rounded-full border-4 border-yellow-500 flex items-center justify-center bg-yellow-50 rotate-12 relative -top-6">
                            <div className="text-center">
                                <span className="block font-bold text-yellow-600 leading-tight">OFFICIAL</span>
                                <span className="block font-serif text-yellow-700 text-2xl">SEAL</span>
                            </div>
                        </div>

                        <div className="text-left border-t-2 border-gray-300 pt-2 w-48">
                            <p className="font-serif font-bold text-gray-700">{new Date().toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500">Date Issued</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="mt-12 flex justify-center gap-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 bg-gray-800 text-white hover:bg-gray-700 font-bold rounded-xl transition-colors"
                >
                    Back to Dashboard
                </button>
                <button
                    onClick={handleLinkedInShare}
                    className="px-8 py-3 bg-[#0077b5] text-white hover:bg-[#005582] font-bold rounded-xl transition-all glow-effect flex items-center gap-2"
                >
                    <Share2 size={20} />
                    Share on LinkedIn
                </button>
            </div>
        </div>
    );
};

export default Certificate;
