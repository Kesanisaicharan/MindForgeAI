# MindForgeAI API Reference

Base URL: the backend host configured by `VITE_API_URL` in the frontend. Local development defaults to `http://localhost:5000`.

Except for `GET /health`, endpoints require a valid Supabase access token:

```http
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

Protected endpoints derive the user ID from the validated token. The server ignores client-supplied student IDs for adaptive attempts and derives ownership from the authenticated user. Teacher endpoints additionally require server-controlled `app_metadata.role = "teacher"` or a configured `TEACHER_USER_IDS` allowlist.

## Health

### `GET /health`

Unauthenticated process liveness response:

```json
{ "success": true, "service": "mindforgeai-api" }
```

This endpoint does not prove that MongoDB, Supabase, Groq, or email delivery is reachable.

## Adaptive learning

### `GET /api/adaptive/plan/:studentId`

Returns the authenticated student's learning plan and recommendations. The path ID must match the authenticated user.

Optional query parameters: `grade` (6–10), `board`, `language` (`en`, `hi`, `te`), and `subject`.

### `POST /api/adaptive/attempt`

Records an answer and updates topic mastery. Body:

```json
{
  "topicId": "g6-math-fractions",
  "questionId": "g6-frac-1",
  "answerIndex": 0,
  "grade": 6,
  "board": "CBSE",
  "language": "en",
  "subject": "Mathematics",
  "clientAttemptId": "offline-attempt-0001"
}
```

`answerIndex` must be an integer option index. `clientAttemptId` is optional; it lets retries of an offline attempt avoid double-counting. Reusing an ID for a different answer returns a conflict. The API response returns correctness, an explanation, the updated mastery estimate and the next recommendation. Mastery is a provisional BKT-style estimate, not a validated high-stakes score.

## Teacher class and assessment tools

All routes in this section require the teacher role.

- `GET /api/adaptive/teacher/rosters` — list the current teacher's saved rosters.
- `POST /api/adaptive/teacher/rosters` — create/update a roster with `{ "name": "Class 6", "studentIds": ["<supabase-user-uuid>"] }`.
- `GET /api/adaptive/teacher/overview?rosterId=<id>` — view enrolled status, topic mastery and support indicators for a roster owned by the teacher.
- `GET /api/adaptive/teacher/assessment-topics?grade=6&subject=Mathematics` — list topics from the built-in demonstration question bank.
- `GET /api/adaptive/teacher/assessments` — list assessments created by this teacher.
- `POST /api/adaptive/teacher/assessments` — create and assign an assessment.

Example assessment request:

```json
{
  "title": "Fractions Checkpoint",
  "rosterId": "<teacher-owned-roster-object-id>",
  "grade": 6,
  "board": "CBSE",
  "subject": "Mathematics",
  "language": "en",
  "topicIds": ["g6-math-fractions"],
  "dueAt": null
}
```

The language may be `en`, `hi`, or `te`. Hindi/Telugu assessment creation requires the Groq translation provider. Translation must preserve question IDs and answer-option order; a missing provider or invalid translation response fails clearly instead of silently mislabeling English questions.

- `GET /api/adaptive/teacher/assessments/:assessmentId/results` — view only the selected teacher's assessment submissions and scores.

## Student-assigned assessments

- `GET /api/assessments/assigned` — list assessments assigned to the authenticated student's Supabase user ID.
- `GET /api/assessments/:assessmentId` — retrieve the student's assigned assessment. Correct-answer indices are never returned before submission.
- `POST /api/assessments/:assessmentId/submit` — submit one option index per question.

Example submit body:

```json
{ "answers": [0, 1, 2] }
```

The server validates each index, calculates the score, saves one submission per student/assessment, returns feedback, and updates topic mastery. Repeat submissions return HTTP 409. The response's `passed` flag means a score of at least 80% on this teacher-assigned assessment; certificates are not automatically issued by this endpoint.

## Curriculum tutor and ingestion

- `GET /api/curriculum/sources?grade=6&board=CBSE&subject=Mathematics&language=en` — list source metadata for active curriculum chunks.
- `POST /api/curriculum/ask` — query the tutor with `query`, `grade`, `board`, optional `subject`, and `language`.
- `POST /api/curriculum/chunks` — teacher-only import of one reviewed excerpt.
- `POST /api/curriculum/chunks/bulk` — teacher-only JSON import of 1–100 reviewed chunks.
- `POST /api/curriculum/upload` — teacher-only multipart upload. Send the file in field `file` and metadata fields `grade`, `board`, `subject`, `language`, `sourceTitle`, optional HTTPS `sourceUrl`, and optional `page`.

Document upload is limited to one file up to 8 MB and extensions `.pdf`, `.txt`, `.html`, or `.htm`. PDF extraction requires a text layer; scanned PDFs require OCR before import. Only import content you are legally allowed to store and reuse. Each extracted chunk retains provenance metadata. If the tutor has no relevant source, it returns a no-source fallback rather than inventing citations.

## Existing course, quiz, and certificate APIs

- `POST /api/ai/generate` — generate a course from an AI prompt and save it for the authenticated user.
- `GET /api/ai/course/:id` — retrieve a course owned by the authenticated user.
- `GET /api/courses/user/:userId` — list the authenticated user's courses; path ID must match.
- `DELETE /api/courses/:id` — delete a course owned by the authenticated user.
- `POST /api/quiz/generate` — create a quiz session for an owned course. Correct answers are not sent before submission.
- `POST /api/quiz/submit` — submit option indices for a quiz session and receive server-graded results.
- `POST /api/certificates/generate` — accepts a course ID; the server checks the authenticated user's saved quiz score (at least 80%) before issuing a certificate. Client-supplied score/name/email are not authoritative.
- `GET /api/certificates/:userId` — list the authenticated user's certificates; path ID must match.

## Offline behavior\n\nThe frontend service worker caches the app shell/static assets and never caches authenticated API responses. The adaptive-learning page stores its per-user plan and queued answer records in browser local storage; answer retries include idempotency keys. This does not provide offline sign-in, guarantee storage across cleared browser data, or cache every API resource.\n\n## Common status behavior

- `400` invalid or missing input.
- `401` missing/invalid/expired authentication.
- `403` authenticated user lacks access or a deadline has passed.
- `404` resource absent or not accessible.
- `409` duplicate submission or conflicting idempotency key.
- `413` payload/file too large.
- `415` unsupported document type.
- `422` document text/question structure is unusable.
- `502/503` provider response/configuration problem.

Real deployment verification requires working Supabase and MongoDB configuration. Groq is needed for AI generation and machine translation; Resend is optional for certificate email. CI tests mock database/provider behavior and do not establish production credentials or deployment health.
