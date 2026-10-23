# MindForgeAI Adaptive Learning — implementation and setup

This branch adds the first integrated adaptive-learning workflow for the Classes 6–10 challenge. It extends the existing React/Express/MongoDB/Groq application.

## Features now wired into this branch

1. **Curriculum ingestion and retrieval (RAG-style):** teachers can add single reviewed excerpts, import up to 100 JSON chunks at a time, or upload a text-based PDF/TXT/HTML file up to 8 MB. Text is extracted, chunked with overlap, and stored with grade, board, subject, language and source metadata. The retrieval tutor returns source markers/metadata and uses a safe excerpt fallback if the AI provider is unavailable. When no excerpt matches, it explicitly says so rather than inventing an answer.
2. **Student learning profile and adaptation:** the learner profile stores concept-level attempts and provisional mastery estimates. A BKT-style update changes mastery estimates after answers, prerequisite relationships influence recommendations, and the question selector uses the estimate to choose a supported difficulty.
3. **Multilingual support:** the adaptive lesson UI supports English/Hindi/Telugu labels and requests machine translation of topic titles, descriptions, question text/options and feedback for Hindi/Telugu. The curriculum tutor retrieves only content tagged with the selected language. Machine-translated material must be educator-reviewed; if the translation model is unavailable, adaptive content falls back to the original English.
4. **Teacher dashboard:** teachers can save class rosters using student Supabase UUIDs, view concept-level support indicators for students in their own saved rosters, and add/import reviewed curriculum excerpts. Teacher access requires server-controlled app_metadata.role = "teacher" or a matching TEACHER_USER_IDS environment allowlist.
5. **Student data security and validation:** protected APIs verify Supabase bearer tokens server-side, learning plans and attempts are scoped to the signed-in student, course list/read/delete/quiz endpoints enforce ownership, teacher routes require teacher access, class overviews are restricted to the teacher's own roster, and certificates require a server-graded quiz score of at least 80%.
6. **Server-side quiz grading:** correct answers are stored in a private quiz session and are not sent to the browser before submission. The server grades submitted option indices and stores the result; certificate issuance checks the saved result rather than trusting the score in the URL.
7. **Offline resilience:** the adaptive page caches its latest plan and queues attempts in local storage when the network is unavailable. Queued answers are retried when the plan is loaded after reconnection.
8. **Teacher-assigned assessments:** teachers can create a class assessment from reviewed curriculum-bank topics, choose language and deadline, and view class submission results. Students assigned to that roster can take a quiz, receive server-side grading, and have topic mastery updated. Submission is unique per student/assessment and answer keys are not sent before submission.
9. **Tests and CI:** Node tests cover BKT bounds/updates, answer persistence and idempotency, document extraction/chunking, curriculum retrieval fallbacks, teacher-role checks, assessment construction/grading/localization, and API health/protected routes. GitHub Actions runs backend tests and a frontend production build on pushes to feature branches and pull requests to main.

## Environment variables

Backend environment:
```env
MONGO_URI=mongodb+srv://...
GROQ_API_KEY=...
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=...
# Either set the user's server-managed Supabase app_metadata.role to "teacher"
# or list trusted teacher Supabase user UUIDs here:
TEACHER_USER_IDS=uuid-one,uuid-two
PORT=5000
```

Frontend environment:
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

Never put a Supabase service-role key, MongoDB credential or Groq secret in frontend environment variables. Do not trust user-editable user_metadata as a teacher role; use server-controlled app_metadata or the backend allowlist.

## Run locally

Backend:
```bash
cd backend
npm install
npm test
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

After signing in:
- /adaptive — personalized concept practice and progress.
- /tutor — curriculum-grounded tutor with source citations.
- /teacher — teacher roster, progress overview, PDF/TXT/HTML + JSON curriculum import, assessment builder and results (teacher role required).
- /assessments — assigned student assessment list, response submission, grading, and result review.

## Curriculum JSON import format

The teacher dashboard accepts PDF/TXT/HTML files up to 8 MB (text-based PDF only; scanned PDFs need OCR) as well as a JSON array or object with a chunks array, up to 100 items per import. Each item uses:
```json
{
  "title": "Fractions",
  "text": "Teacher-reviewed curriculum excerpt text...",
  "grade": 6,
  "board": "CBSE",
  "subject": "Mathematics",
  "language": "en",
  "sourceTitle": "Actual textbook or curriculum document title",
  "sourceUrl": "https://official-or-licensed-source.example/path",
  "page": "12"
}
```
Use only curriculum material you are allowed to use. Keep the actual source title, page/section and a valid HTTPS URL where available. Add separate translated excerpts for hi and te so the RAG tutor can retrieve reliable content in those languages. Official portals to verify content: https://ncert.nic.in/textbook.php, https://epathshala.nic.in/epathshala.php?id=Students&ln=en, and https://ncert.nic.in/syllabus_nep.php?ln=en. NCERT's textbook pages state that the content is copyrighted and use in digital content packages/software is restricted; do not copy textbook text into this app unless the applicable license or written permission allows that use. Store source links and teacher-authored notes where reuse rights are unclear.

## Important limitations before classroom deployment

- **The repository does not bundle a complete official CBSE, ICSE or State Board syllabus.** The existing adaptive question catalogue is a small demonstration bank and is not board-specific. Teachers must import and verify official/licensed materials for the desired grade, board, subject and language. The tutor's retrieval is board/language-filtered once those excerpts are imported.
- BKT parameters are illustrative, not clinically or educationally validated. Mastery scores are estimates and must not be used for high-stakes decisions. Calibrate with anonymized, teacher-reviewed data and provide teacher override.
- Hindi/Telugu adaptive text uses machine translation and needs educator review. A translated interface is not equivalent to fully localized, curriculum-validated instruction.
- Teacher rosters are currently maintained by trusted teachers entering student IDs. Production rollout should add school/class enrollment workflows, audit logs and stricter administrative roster assignment.
- Offline queued answers remain in browser local storage until successfully synced; clearing site data can lose unsynced answers.
- A teacher should review and approve every imported excerpt and question set. Do not upload private student records into curriculum source chunks.
- Run the CI checks and test deployed authentication, ownership checks, certificate issuance, RAG citations, translation quality, accessibility and privacy/data-retention settings before using real students.
