import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, BrainCircuit, Menu, X, LogOut, Settings, Award, BookOpen, Sparkles } from 'lucide-react';

const Navbar = () => {
    const { user, loginWithGoogle, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [darkMode, setDarkMode] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/65 transition-colors duration-300">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 p-2.5 rounded-xl shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                            <BrainCircuit size={26} className="text-white" />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                            MindForge<span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">AI</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            <Link 
                                to="/" 
                                className={`relative py-2 font-semibold text-sm transition-colors duration-300 ${
                                    isActive('/') 
                                        ? 'text-blue-600 dark:text-blue-400' 
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Home
                                {isActive('/') && (
                                    <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                                )}
                            </Link>
                            
                            {user && (
                                <>
                                    <Link 
                                        to="/dashboard" 
                                        className={`relative py-2 font-semibold text-sm transition-colors duration-300 ${
                                            isActive('/dashboard') 
                                                ? 'text-blue-600 dark:text-blue-400' 
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Dashboard
                                        {isActive('/dashboard') && (
                                            <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                                        )}
                                    </Link>
                                    <Link 
                                        to="/generate" 
                                        className={`relative py-2 font-semibold text-sm transition-colors duration-300 ${
                                            isActive('/generate') 
                                                ? 'text-blue-600 dark:text-blue-400' 
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Generate
                                        {isActive('/generate') && (
                                            <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                                        )}
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6">
                            <button 
                                onClick={toggleTheme} 
                                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                            </button>

                            {user ? (
                                <div className="relative">
                                    <button 
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <img 
                                            src={user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'} 
                                            alt="Profile" 
                                            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm object-cover"
                                        />
                                    </button>
                                    
                                    <AnimatePresence>
                                        {dropdownOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-14 right-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 py-2"
                                            >
                                                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 mb-2">
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Signed in as</p>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user.user_metadata?.full_name || 'User'}</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{user.email}</p>
                                                </div>
                                                <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <BookOpen size={16} /> My Courses
                                                </Link>
                                                <Link to="/generate" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <Sparkles size={16} /> Generate Course
                                                </Link>
                                                <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <Settings size={16} /> Settings
                                                </Link>
                                                <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
                                                    <button 
                                                        onClick={() => { setDropdownOpen(false); logout(); }}
                                                        className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-950/20"
                                                    >
                                                        <LogOut size={16} /> Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={loginWithGoogle}
                                    className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-sm hover:shadow transition-all text-sm"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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

                    {/* Mobile Menu Toggle */}
                    <div className="flex md:hidden items-center gap-4">
                        <button 
                            onClick={toggleTheme} 
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden px-6 py-4 space-y-4"
                    >
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 font-medium text-slate-600 dark:text-slate-300">Home</Link>
                        {user ? (
                            <>
                                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 font-medium text-slate-600 dark:text-slate-300">Dashboard</Link>
                                <Link to="/generate" onClick={() => setMobileMenuOpen(false)} className="block py-2 font-medium text-slate-600 dark:text-slate-300">Generate</Link>
                                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.user_metadata?.full_name || 'User'}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">{user.email}</p>
                                    </div>
                                    <button 
                                        onClick={() => { setMobileMenuOpen(false); logout(); }}
                                        className="p-2 text-red-600 dark:text-red-400 font-semibold text-sm rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button 
                                onClick={() => { setMobileMenuOpen(false); loginWithGoogle(); }}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm text-sm"
                            >
                                Login with Google
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
