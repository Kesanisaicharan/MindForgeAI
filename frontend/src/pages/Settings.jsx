import React, { useEffect, useState } from 'react';
import { Check, Moon, Sun, Languages } from 'lucide-react';

const supportedLanguages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिन्दी — Hindi' },
    { value: 'te', label: 'తెలుగు — Telugu' }
];

export default function Settings() {
    const [language, setLanguage] = useState(() => localStorage.getItem('mindforge-language') || 'en');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        root.classList.toggle('dark', dark);
        if (theme === 'system') localStorage.removeItem('theme');
        else localStorage.setItem('theme', theme);
    }, [theme]);

    const save = () => {
        localStorage.setItem('mindforge-language', language);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <header className="rounded-3xl p-7 bg-gradient-to-br from-slate-800 to-indigo-700 text-white">
                <h1 className="text-3xl font-black">Settings</h1>
                <p className="text-slate-200 mt-2">Set your preferred learning language and display theme for this browser.</p>
            </header>
            <section className="card-glass rounded-2xl p-6 space-y-6">
                <div className="flex items-start gap-4">
                    <Languages size={24} className="text-primary mt-1"/>
                    <div className="flex-1 space-y-2">
                        <label htmlFor="preferred-language" className="font-bold">Preferred language</label>
                        <p className="text-sm text-gray-500">Adaptive learning and assigned-assessment screens read this preference when opened. Some curriculum content still depends on teacher-imported translated material.</p>
                        <select id="preferred-language" value={language} onChange={e=>setLanguage(e.target.value)} className="w-full sm:max-w-sm rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700">
                            {supportedLanguages.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    {theme === 'dark' ? <Moon size={24} className="text-primary mt-1"/> : <Sun size={24} className="text-primary mt-1"/>}
                    <div className="flex-1 space-y-2">
                        <label htmlFor="display-theme" className="font-bold">Display theme</label>
                        <select id="display-theme" value={theme} onChange={e=>setTheme(e.target.value)} className="w-full sm:max-w-sm rounded-xl border p-3 bg-white dark:bg-gray-900 dark:border-gray-700">
                            <option value="system">Use system setting</option><option value="light">Light</option><option value="dark">Dark</option>
                        </select>
                    </div>
                </div>
                <button onClick={save} className="rounded-xl bg-primary text-white px-5 py-3 font-bold inline-flex items-center gap-2"><Check size={18}/> Save preferences</button>
                {saved && <p role="status" className="text-sm text-emerald-600">Preferences saved in this browser.</p>}
            </section>
        </div>
    );
}
