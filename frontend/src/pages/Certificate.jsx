import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Loader2, MailCheck, Share2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const Certificate = () => {
    const { id } = useParams();
    const [params] = useSearchParams();
    const quizId = params.get('quiz'); // set when arriving from a passed quiz
    const navigate = useNavigate();
    const { user } = useAuth();

    const [cert, setCert] = useState(null);
    const [email, setEmail] = useState(null);
    const [state, setState] = useState('loading'); // loading | ready | missing | error
    const [message, setMessage] = useState('');
    const ran = useRef('');

    // Issue the certificate for a passed quiz, or open the one already earned for this course.
    useEffect(() => {
        const key = `${id}|${quizId}|${user?.id}`;
        if (!user || ran.current === key) return;
        ran.current = key;
        (async () => {
            try {
                if (quizId) {
                    const res = await api.post('/api/certificates/generate', {
                        quizId, userId: user.id, email: user.email,
                        userName: user.user_metadata?.full_name || user.email,
                    });
                    setCert(res.data.data);
                    setEmail(res.data.email);
                } else {
                    const res = await api.get(`/api/certificates/${user.id}`);
                    const found = res.data.data.find((c) => String(c.courseId) === id);
                    if (!found) return setState('missing');
                    setCert(found);
                }
                setState('ready');
            } catch (err) {
                setMessage(err.response?.data?.error || 'Could not load the certificate.');
                setState('error');
            }
        })();
    }, [id, quizId, user]);

    const verifyUrl = cert ? `${window.location.origin}/verify/${cert.certificateId}` : '';

    const handleLinkedInShare = () => {
        const message = `I just completed "${cert.courseTitle}" using MindForgeAI. Verify it: ${verifyUrl}`;
        window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(message)}`, '_blank');
    };

    if (state === 'loading') {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (state !== 'ready') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {state === 'missing' ? 'No certificate for this course yet' : message}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Pass the course quiz with 80% or more to earn one.</p>
                <button onClick={() => navigate(`/quiz/${id}`)} className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-secondary transition-all">Take the Quiz</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 py-10">
            {email && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center justify-center gap-3">
                    <MailCheck size={20} />
                    <span>{email.sent
                        ? `Certificate saved to your dashboard${email.reason === 'already_sent' ? '.' : ` and emailed to ${user.email}.`}`
                        : 'Certificate saved to your dashboard. We could not send the email this time.'}</span>
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
                        {cert.userName}
                    </h2>

                    <p className="text-xl text-gray-600 mb-4 italic">has successfully completed the AI-generated course</p>
                    <h3 className="text-3xl font-bold text-gray-800 mb-8 max-w-2xl px-10">
                        {cert.courseTitle}
                    </h3>

                    <p className="text-lg text-gray-500 mb-10">
                        Achieving a quiz score of <span className="font-bold text-black">{cert.score}%</span> on the course quiz.
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
                            <p className="font-serif font-bold text-gray-700">{new Date(cert.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500">Date Issued</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <p className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <ShieldCheck size={16} /> Certificate ID {cert.certificateId} &middot; verify at <a className="text-primary underline" href={verifyUrl}>{verifyUrl}</a>
            </p>

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
