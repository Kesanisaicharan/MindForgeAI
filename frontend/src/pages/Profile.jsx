import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Learner';
    const email = user?.email || 'Email not shared';
    const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString() : null;
    const language = user?.user_metadata?.preferred_language || localStorage.getItem('mindforge-language') || 'en';

    const signOut = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <header className="rounded-3xl p-7 bg-gradient-to-br from-slate-800 to-indigo-700 text-white">
                <div className="flex items-center gap-3"><UserRound size={30}/><h1 className="text-3xl font-black">Your profile</h1></div>
                <p className="mt-2 text-slate-200">View the profile information connected to your signed-in account.</p>
            </header>
            <section className="card-glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                    {user?.user_metadata?.avatar_url
                        ? <img src={user.user_metadata.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700"/>
                        : <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center"><UserRound size={28}/></div>}
                    <div className="min-w-0"><h2 className="text-2xl font-bold truncate">{name}</h2><p className="text-gray-500 break-all">{email}</p></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><p className="text-sm text-gray-500">Account ID</p><p className="font-mono text-sm break-all mt-1">{user?.id || 'Unavailable'}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><p className="text-sm text-gray-500">Account created</p><p className="font-semibold mt-1">{createdAt || 'Unavailable'}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><p className="text-sm text-gray-500">Preferred learning language</p><p className="font-semibold mt-1">{({en:'English',hi:'Hindi',te:'Telugu'})[language] || 'English'}</p></div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><p className="text-sm text-gray-500">Sign-in provider</p><p className="font-semibold mt-1">{user?.app_metadata?.provider || 'Supabase'}</p></div>
                </div>
                <p className="text-sm text-gray-500">Profile identity is managed by your authentication provider. Teacher permissions are checked by the backend and cannot be enabled from this page.</p>
                <button onClick={signOut} className="rounded-xl border border-red-500/30 text-red-600 px-5 py-3 font-bold inline-flex items-center gap-2"><LogOut size={18}/> Sign out</button>
            </section>
        </div>
    );
}
