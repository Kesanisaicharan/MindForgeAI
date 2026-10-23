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
import AdaptiveLearning from './pages/AdaptiveLearning';
import CurriculumTutor from './pages/CurriculumTutor';
import TeacherDashboard from './pages/TeacherDashboard';
import AssignedAssessments from './pages/AssignedAssessments';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ResetPassword from './pages/ResetPassword';

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
              <Route path="/adaptive" element={<PrivateRoute><AdaptiveLearning /></PrivateRoute>} />
              <Route path="/tutor" element={<PrivateRoute><CurriculumTutor /></PrivateRoute>} />
              <Route path="/teacher" element={<PrivateRoute><TeacherDashboard /></PrivateRoute>} />
              <Route path="/assessments" element={<PrivateRoute><AssignedAssessments /></PrivateRoute>} />
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
