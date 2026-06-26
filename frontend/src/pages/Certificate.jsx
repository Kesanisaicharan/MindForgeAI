import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Award, Loader2, MailCheck, Share2, ArrowLeft, Download, ShieldCheck } from 'lucide-react';
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
        const message = `I just completed "${course.title}" using MindForgeAI 🚀`;
        const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(message)}`;
        window.open(linkedinUrl, '_blank');
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading || !course) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-10 print:p-0">
            {/* Status alerts */}
            {emailSent && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center gap-3 text-sm font-semibold print:hidden">
                    <MailCheck size={18} />
                    <span>Your achievement has been saved successfully to your dashboard!</span>
                </div>
            )}

            {/* Back button */}
            <div className="flex items-center justify-between mb-8 print:hidden">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>

                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                >
                    <Download size={16} />
                    Print / Save PDF
                </button>
            </div>

            {/* Premium Certificate Graphic Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#fcfcfa] text-[#1c1d1f] p-8 md:p-16 rounded-3xl relative overflow-hidden shadow-2xl border-[16px] border-[#e2dfd2] print:border-8 print:shadow-none print:rounded-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(230, 226, 213, 0.15) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            >
                {/* Vintage Corner Accents */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-[#b89742]"></div>
                <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-[#b89742]"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-[#b89742]"></div>
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-[#b89742]"></div>

                {/* Inner Double Thin Border */}
                <div className="absolute top-2 left-2 right-2 bottom-2 border border-[#b89742]/40 rounded-2xl pointer-events-none"></div>
                <div className="absolute top-3 left-3 right-3 bottom-3 border border-[#b89742]/20 rounded-2xl pointer-events-none"></div>

                <div className="text-center relative z-10 flex flex-col items-center">
                    {/* Badge Icon */}
                    <div className="relative mb-6">
                        <Award size={74} className="text-[#b89742] drop-shadow-sm" />
                        <ShieldCheck size={24} className="text-[#b89742] absolute -bottom-1 -right-1 bg-[#fcfcfa] rounded-full p-0.5" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif font-black mb-1 uppercase tracking-widest text-[#2c3e50] leading-none">
                        Certificate of Completion
                    </h1>
                    <p className="text-[#7f8c8d] tracking-[0.25em] uppercase mb-12 text-xs font-bold">MindForgeAI Adaptive Learning System</p>

                    <p className="text-lg text-[#555] mb-3 italic">This credential certifies that student</p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a5f7a] mb-8 font-serif">
                        {user?.user_metadata?.full_name || 'Valued Scholar'}
                    </h2>

                    <p className="text-lg text-[#555] mb-3 italic">has successfully met the academic demands and passed the evaluation for</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-[#2c3e50] mb-8 max-w-2xl px-6 leading-tight border-y border-[#b89742]/20 py-4 font-serif bg-slate-500/5">
                        {course.title}
                    </h3>

                    <p className="text-base text-[#555] mb-12 max-w-lg leading-relaxed">
                        Demonstrated exceptional subject matter comprehension, completing the course evaluation modules with a verified assessment grade of <strong className="text-[#1a5f7a] font-extrabold">{score}%</strong>.
                    </p>

                    {/* Signatures & Seal Grid */}
                    <div className="flex flex-col sm:flex-row justify-between w-full mt-6 px-4 md:px-10 items-center gap-8 sm:gap-4">
                        <div className="text-center sm:text-left border-t border-slate-300 pt-3 w-44">
                            <p className="font-serif font-bold text-slate-800">MindForge AI Engine</p>
                            <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">Automated Proctor</p>
                        </div>

                        {/* Gold Seal Graphic */}
                        <div className="w-24 h-24 rounded-full border-4 border-double border-[#b89742] flex items-center justify-center bg-[#fdfaf2] rotate-6 shadow-sm shrink-0">
                            <div className="text-center font-mono">
                                <span className="block text-[8px] font-bold text-[#b89742] tracking-wider leading-none">VERIFIED</span>
                                <span className="block font-serif text-[#b89742] text-sm font-extrabold my-0.5">SEAL</span>
                                <span className="block text-[8px] font-bold text-[#b89742] tracking-wider leading-none">SECURE</span>
                            </div>
                        </div>

                        <div className="text-center sm:text-right border-t border-slate-300 pt-3 w-44">
                            <p className="font-serif font-bold text-slate-800">{new Date().toLocaleDateString()}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">Verification Date</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Sharing buttons */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 print:hidden">
                <button
                    onClick={handleLinkedInShare}
                    className="px-8 py-3.5 bg-[#0077b5] hover:bg-[#006296] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                    <Share2 size={18} />
                    Add Certificate to LinkedIn Profile
                </button>
            </div>
        </div>
    );
};

export default Certificate;
