import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import CourseView from './pages/CourseView';
import Quiz from './pages/Quiz';
import Certificate from './pages/Certificate';
import Home from './pages/Home'; // Properly importing the new Home.jsx

// Placeholders for remaining pages
const Profile = () => <div className="p-10 text-gray-900 dark:text-white"><h1 className="text-3xl font-bold">Profile</h1></div>;
const Settings = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-900 dark:text-white">
        <h1 className="text-4xl font-extrabold mb-6">Settings</h1>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 p-6 rounded-2xl border border-yellow-300 dark:border-yellow-700 max-w-lg text-center shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Development Mode</h2>
            <p className="text-lg">The Settings page is currently in development. New configuration options will be available soon.</p>
        </div>
    </div>
);
const ResetPassword = () => <div className="p-10 text-gray-900 dark:text-white min-h-screen flex items-center justify-center">Full Page Reset Password</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans transition-colors duration-300 selection:bg-blue-500/30">
          <Navbar />
          
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/generate" element={<PrivateRoute><Generate /></PrivateRoute>} />
              <Route path="/course/:id" element={<PrivateRoute><CourseView /></PrivateRoute>} />
              <Route path="/quiz/:courseId" element={<PrivateRoute><Quiz /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="/certificate/:id" element={<PrivateRoute><Certificate /></PrivateRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
