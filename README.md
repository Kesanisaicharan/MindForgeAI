# 🧠 MindForgeAI — AI-Powered Learning Platform

MindForgeAI is a full-stack AI-driven learning platform that dynamically generates personalized courses, quizzes, and certificates using advanced AI models and modern web technologies.

It is designed to enhance self-learning by providing structured content, real-time assessments, and achievement tracking in a seamless user experience.

---

# 🚀 Live Demo

* 🌐 Frontend: https://mind-forge-ai-apjm.vercel.app/
* ⚙️ Backend API: https://mindforgeai.onrender.com

---

# ✨ Key Features

## 🤖 AI Course Generation

* Generates structured learning content dynamically
* Uses Groq API with LLaMA models
* Topic-based intelligent content creation

## 📝 Quiz & Assessment System

* Auto-generated quizzes based on course content
* Score calculation and evaluation
* Immediate feedback system

## 🎓 Certificate Generation

* Dynamic certificate creation upon completion
* Stored and accessible via dashboard

## 📧 Email Notification System

* Sends completion emails using Resend API
* Clean and styled HTML email templates

## 🔐 Authentication System

* Google OAuth login via Supabase
* Secure and scalable authentication flow

## 📊 User Dashboard

* View enrolled/generated courses
* Access certificates anytime
* Clean and responsive UI

---

# 🛠️ Tech Stack

## 🎨 Frontend

* React (Vite)
* Tailwind CSS
* Axios

## ⚙️ Backend

* Node.js
* Express.js

## 🗄️ Database

* MongoDB (Mongoose ODM)

## 🤖 AI Integration

* Groq API (LLaMA models)

## 🔐 Authentication

* Supabase (Google OAuth)

## 📧 Email Service

* Resend API (SMTP-free, production-ready)

## ☁️ Deployment Platforms

* Frontend: Vercel
* Backend: Render

---

# 📁 Project Structure

```id="w3i2hy"
MindForgeAI/
│
├── frontend/          # React + Vite application
│   ├── src/
│   ├── components/
│   └── pages/
│
├── backend/           # Node.js + Express API
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── utils/
│   └── config/
│
└── README.md
```

---

# 🔐 Environment Variables

## ⚙️ Backend (Render Environment)

```id="wht1hl"
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
RESEND_API_KEY=your_resend_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🌐 Frontend (Vercel Environment)

```id="j9a1nh"
VITE_API_URL=render_url
```

---

# ⚙️ Installation & Setup

## 📥 Clone Repository

```id="x6aqb4"
git clone https://github.com/your-username/mindforgeai.git
cd mindforgeai
```

---

## 🔧 Backend Setup

```id="u2s3u6"
cd backend
npm install
npm run dev
```

---

## 🎨 Frontend Setup

```id="p2b6fj"
cd frontend
npm install
npm run dev
```

---

# 🚀 Deployment Workflow

## 🌐 Frontend Deployment (Vercel)

* Connected GitHub repository
* Set root directory to `frontend`
* Added environment variable:

  * `VITE_API_URL`

## ⚙️ Backend Deployment (Render)

* Deployed Node.js service
* Configured environment variables
* Enabled CORS for frontend domain

---

# 🔄 Application Flow

1. User logs in via Google (Supabase)
2. User enters a topic
3. AI generates structured course content
4. Quiz is generated dynamically
5. User completes quiz → score calculated
6. Certificate is generated
7. Email notification is sent
8. Data is stored in MongoDB
9. User can access everything via dashboard

---

# 🧠 Engineering Highlights

* Modular backend architecture (MVC pattern)
* Dynamic AI content generation pipeline
* Secure OAuth-based authentication
* Environment-based configuration handling
* Fully decoupled frontend and backend
* API-driven architecture

---

# ⚡ Challenges & Solutions

## 🔐 Secure Environment Management

Handled sensitive API keys securely by removing `.env` from Git history and configuring environment variables directly on deployment platforms.

## 🌐 Frontend-Backend Integration

Resolved issues related to API base URLs using environment variables (`VITE_API_URL`) for seamless switching between development and production.

## 🔄 OAuth Redirect Issues

Fixed authentication redirect mismatches by properly configuring Supabase URLs for both local and deployed environments.

## 📧 Email Delivery Reliability

Migrated from SMTP-based email (Nodemailer) to API-based email service (Resend) to avoid network restrictions and improve reliability.

## ⚙️ Deployment Synchronization

Managed deployment across multiple platforms (Vercel + Render) ensuring consistent environment setup and connectivity.

---

# 🚀 Future Enhancements

* 📄 Attach certificate PDF in email
* 💳 Payment integration (Razorpay/Stripe)
* 📊 Advanced analytics dashboard
* 🤖 Enhanced AI personalization
* 📱 Mobile responsiveness improvements

---

# 👩‍💻 Author

**Jahnavi Polisetty**

---

# ⭐ Support

If you found this project useful:

👉 Star ⭐ this repository
👉 Share it with others

---

# 📌 Project Status

🚧 Actively improving and adding new features
