# Adaptive Learning MVP — MindForgeAI

This branch adds an initial adaptive-learning module for the Classes 6–10 challenge while preserving the existing course-generation application.

## What was added

- **Concept-level learner profile:** stores grade, preferred explanation language, topic mastery estimates, attempts, correctness and last-practiced timestamps in MongoDB.
- **Prerequisite-aware topic map:** a small curriculum catalogue links foundational concepts to later topics so the recommendation can revisit prerequisites first.
- **Bayesian Knowledge Tracing (BKT)-style updates:** each answer updates an estimated probability that the learner has mastered a concept. The initial parameters are illustrative and must be calibrated against teacher-reviewed classroom data.
- **Adaptive practice selection:** selects easier, intermediate or harder questions based on estimated mastery, where the available question bank supports that level.
- **Personalized plan and progress view:** shows topic status, estimated mastery, answer counts, recommended next activity and why it was recommended.
- **Grade, subject and language controls:** includes Classes 6–10, Mathematics and Science starter topics, and English/Hindi/Telugu interface labels.
- **Offline resilience:** caches the latest plan and queues answers locally when the network is unavailable; queued attempts are retried the next time the plan loads successfully.
- **API endpoints:** `GET /api/adaptive/plan/:studentId` and `POST /api/adaptive/attempt`.
- **Tests:** validates curriculum IDs, question structure and prerequisite references using Node's built-in test runner.

## Run locally

Backend:
```bash
cd backend
npm install
# Configure MONGO_URI and PORT in your environment as needed
npm test
npm start
```

Frontend:
```bash
cd frontend
npm install
# Configure VITE_API_URL to point to the backend, e.g. http://localhost:5000
npm run dev
```

Open `/adaptive` after signing in. The existing `/generate` course workflow remains available.

## Important prototype limitations

- The bundled question bank is deliberately small and is **not** a complete CBSE, ICSE or State Board syllabus. The board selector currently records a preference; it does not load board-specific official curriculum.
- The Hindi and Telugu interface labels do not mean every lesson, question or explanation is translated. Content localization should be completed and reviewed by language/subject educators before classroom use.
- Mastery percentages are model estimates, not definitive judgments about a child. Teachers should be able to review and override learning recommendations.
- The current teacher insight is a per-learner progress view, not a cross-class teacher/admin dashboard.
- Offline answers are stored in that browser's local storage until a later successful sync. Clearing browser data can remove unsynced answers.
- These endpoints are a prototype and do not yet enforce server-side identity/role authorization. Do not deploy with real student data until authentication, authorization, validation, rate limits and privacy controls are added.
- This branch does not claim to implement retrieval-augmented generation (RAG) or a multi-agent system. Those should only be added after curriculum sources, licensing, citations and evaluation criteria are defined.

## Suggested next production steps

1. Import teacher-approved curriculum and question banks for each grade, board, subject and language.
2. Add server-side authorization so a student can only read/write their own profile and teachers can only see assigned classes.
3. Evaluate BKT parameters and recommendations with anonymized, educator-reviewed pilot data.
4. Add an educator dashboard, intervention history and human override controls.
5. Add accessible content, translated explanations, safe content filtering and privacy/data-retention policies.
