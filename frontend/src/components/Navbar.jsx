import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Sun, Moon, BrainCircuit } from 'lucide-react';

const Navbar = () => {
    const { user, loginWithGoogle, logout } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setDarkMode(true);
        }
    };

    return (
        <nav className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2 rounded-xl shadow-lg">
                        <BrainCircuit size={28} className="text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">MindForgeAI</span>
                </Link>

                <div className="flex items-center gap-6">
                    <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium">Home</Link>
                    
                    {user && (
                        <>
                            <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium">Dashboard</Link>
                            <Link to="/generate" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium">Generate</Link>
                        </>
                    )}
                    
                    {user ? (
                        <div className="relative border-l border-gray-300 dark:border-gray-700 pl-6 flex items-center">
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                <img 
                                    src={user.user_metadata?.avatar_url || 'https://via.placeholder.com/40'} 
                                    alt="Profile" 
                                    className="w-10 h-10 rounded-full border-2 border-primary shadow-sm"
                                />
                            </button>
                            
                            {dropdownOpen && (
                                <div className="absolute top-14 right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50 py-2">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.user_metadata?.full_name || 'User'}</p>
                                    </div>
                                    <Link to="/" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Home</Link>
                                    <Link to="/generate" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Generate</Link>
                                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</Link>
                                    <Link to="/dashboard#certificates" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">View Certificates</Link>
                                    <Link to="/settings" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Settings</Link>
                                    <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                                        <button 
                                            onClick={() => { setDropdownOpen(false); logout(); }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={loginWithGoogle}
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Login with Google
                        </motion.button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
