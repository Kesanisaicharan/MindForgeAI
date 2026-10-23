import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [recoveryMode, setRecoveryMode] = useState(() => typeof window !== 'undefined' && window.location.hash.includes('type=recovery'));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        let alive = true;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (alive && session && window.location.hash.includes('type=recovery')) setRecoveryMode(true);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (alive && event === 'PASSWORD_RECOVERY') setRecoveryMode(true);
        });
        return () => { alive = false; subscription.unsubscribe(); };
    }, []);

    const requestReset = async (event) => {
        event.preventDefault(); setError(''); setMessage('');
        if (!email.trim()) { setError('Enter the email address linked to your account.'); return; }
        setBusy(true);
        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/reset-password`
            });
            if (resetError) throw resetError;
            setMessage('If this address belongs to a password-enabled account, a reset link will be sent. Check your inbox and spam folder.');
        } catch (e) {
            setError(e.message || 'Could not request a password reset.');
        } finally { setBusy(false); }
    };

    const updatePassword = async (event) => {
        event.preventDefault(); setError(''); setMessage('');
        if (password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        setBusy(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;
            setMessage('Password updated successfully. You can return to your dashboard.');
            setPassword(''); setConfirmPassword('');
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
            setError(e.message || 'Could not update the password. Request a new reset link and try again.');
        } finally { setBusy(false); }
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-12">
            <section className="card-glass rounded-3xl p-7 md:p-9 space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">{recoveryMode ? <KeyRound size={28}/> : <Mail size={28}/>}</div>
                <h1 className="text-3xl font-black">{recoveryMode ? 'Set a new password' : 'Reset your password'}</h1>
                <p className="text-sm text-gray-500">{recoveryMode ? 'Choose a new password for your account.' : 'Request a secure password reset link. This applies to accounts configured for password-based sign-in.'}</p>
                {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-red-600">{error}</p>}
                {message && <p role="status" className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">{message}</p>}
                {recoveryMode ? (
                    <form onSubmit={updatePassword} className="space-y-4">
                        <label className="block text-sm font-semibold">New password<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700"/></label>
                        <label className="block text-sm font-semibold">Confirm password<input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700"/></label>
                        <button disabled={busy} className="w-full rounded-xl bg-primary text-white py-3 font-bold disabled:opacity-50">{busy ? <Loader2 className="animate-spin inline" size={18}/> : 'Update password'}</button>
                    </form>
                ) : (
                    <form onSubmit={requestReset} className="space-y-4">
                        <label className="block text-sm font-semibold">Account email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700" placeholder="you@example.com"/></label>
                        <button disabled={busy} className="w-full rounded-xl bg-primary text-white py-3 font-bold disabled:opacity-50">{busy ? <Loader2 className="animate-spin inline" size={18}/> : 'Send reset link'}</button>
                    </form>
                )}
                <Link to="/" className="block text-center text-primary underline">Return home</Link>
            </section>
        </div>
    );
}
