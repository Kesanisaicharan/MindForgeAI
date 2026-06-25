import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Target, BrainCircuit, Award } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Sparkles size={36} className="text-blue-500 mb-6" />,
      title: "AI-Powered Learning",
      description: "Harness the power of AI to generate comprehensive, structured courses on absolutely any topic instantly."
    },
    {
      icon: <Target size={36} className="text-green-500 mb-6" />,
      title: "Personalized Courses",
      description: "Every course is dynamically structured to match your exact prompt, ensuring highly tailored education."
    },
    {
      icon: <BrainCircuit size={36} className="text-purple-500 mb-6" />,
      title: "Smart Quiz System",
      description: "Test your knowledge with dynamic AI-generated quizzes formulated directly from your course materials."
    },
    {
      icon: <Award size={36} className="text-yellow-500 mb-6" />,
      title: "Certificate Generation",
      description: "Prove your expertise! Pass your course quiz to unlock and download a premium certificate of completion."
    }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] transition-colors duration-300">

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center pt-24 pb-20 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            AI-Powered Learning Platform
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
            Instantly generate fully structured courses, take dynamic quizzes, and earn verifiable certificates on any topic imaginable.
          </p>
          <Link
            to="/generate"
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            Start Learning Now <Sparkles size={24} />
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 w-full mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all"
            >
              {feature.icon}
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="mt-auto bg-gray-100 dark:bg-gray-800/50 py-16 text-center border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">About MindForgeAI</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 font-medium leading-relaxed">
            MindForgeAI represents the future of adaptive education. By utilizing cutting-edge Large Language Models, we are able to democratize highly structured, premium educational content allowing anyone to learn exactly what they need, instantly.
          </p>
          <div className="inline-block bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
              Developed by MindForgeAI team with love ❤️
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
