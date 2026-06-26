import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Target, BrainCircuit, Award, ArrowRight, CheckCircle2, Star } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Sparkles size={28} className="text-blue-500" />,
      title: "AI-Powered Learning",
      description: "Harness the power of AI to generate comprehensive, structured courses on absolutely any topic instantly."
    },
    {
      icon: <Target size={28} className="text-emerald-500" />,
      title: "Personalized Courses",
      description: "Every course is dynamically structured to match your exact prompt, ensuring highly tailored education."
    },
    {
      icon: <BrainCircuit size={28} className="text-purple-500" />,
      title: "Smart Quiz System",
      description: "Test your knowledge with dynamic AI-generated quizzes formulated directly from your course materials."
    },
    {
      icon: <Award size={28} className="text-amber-500" />,
      title: "Certificate Generation",
      description: "Prove your expertise! Pass your course quiz to unlock and download a premium certificate of completion."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background blobs for premium glow */}
      <div className="absolute top-20 left-1/4 -translate-x-1/2 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-1/4 translate-x-1/2 w-[450px] h-[450px] bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center pt-20 pb-16 text-center px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6 border border-blue-500/20">
            <Sparkles size={16} /> Empowering Future Learning
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-100 dark:to-slate-300">
            Forge Your Knowledge <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 dark:from-blue-400 dark:via-cyan-400 dark:to-indigo-400">
              With Smart AI
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Instantly generate fully structured courses, take interactive quizzes, and earn credentials on any topic imaginable. Powered by cutting-edge intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/generate"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all glow-effect"
            >
              Start Learning Now <Sparkles size={20} />
            </Link>
            <a
              href="#preview"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 px-8 py-4 rounded-xl font-bold text-lg backdrop-blur-md transition-all"
            >
              See Preview
            </a>
          </div>
        </motion.div>
      </section>

      {/* Interactive Showcase Banner Preview */}
      <section id="preview" className="max-w-5xl mx-auto px-4 py-8 relative z-10 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl md:rounded-3xl p-2.5 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 shadow-2xl overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          {/* Mockup Frame Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 rounded-t-xl md:rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-400" />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-400" />
              <span className="w-3.5 h-3.5 rounded-full bg-green-400" />
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-mono bg-slate-200 dark:bg-slate-950 px-6 py-1.5 rounded-md select-none">
              https://mindforgeai.com/preview
            </div>
            <div className="w-12" /> {/* Spacer */}
          </div>

          <div className="relative overflow-hidden rounded-b-xl md:rounded-b-2xl aspect-[1.1] md:aspect-[1.3] lg:aspect-[1.5] xl:aspect-[1.6] bg-slate-900">
            <img 
              src="/banner.png" 
              alt="MindForgeAI Platform Banner" 
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Unleash the Power of Dynamic Learning
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Traditional learning materials are static. MindForgeAI is alive, adapting directly to your learning goals and curriculum preferences on the fly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -6, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}
              className="card-glass p-8 rounded-2xl flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300"
            >
              <div>
                <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl inline-block mb-6 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Value Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Adaptive Education Tailored Specially For You
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
              We leverage advanced LLMs to create rich structured lessons. Unlike standard tutorials, MindForgeAI crafts specific content maps with takeaways and summaries, preparing you for success.
            </p>
            
            <div className="space-y-3.5 pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Topic coverage that adapts to your prompt</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Instant automated evaluation</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Verifiable certificate credentials</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 card-glass rounded-3xl relative"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                  <Star fill="currentColor" size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Certification</h3>
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Earn Credential</p>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-950/60 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 text-center">
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Pass Score</span>
                <span className="text-5xl font-black text-slate-900 dark:text-white">80%</span>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                  Demonstrate command over the syllabus by scoring 80% or above on the generated course assessment, then download a PDF certificate instantly.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800/80 py-12 bg-white/20 dark:bg-slate-950/20 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <BrainCircuit size={18} />
            </div>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100">MindForgeAI</span>
          </div>

          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} MindForgeAI. Crafted with intelligence ❤️
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
