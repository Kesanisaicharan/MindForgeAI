# Quiz, certificate and email improvements

## What changed
- **Quiz is graded on the server.** `POST /api/quiz/generate` stores the quiz and returns questions *without* the answer key. `POST /api/quiz/:quizId/submit` grades it (pass mark 80%) and returns per-question results. Model output is validated and retried once.
- **Certificates need a passed quiz.** `POST /api/certificates/generate` takes a `quizId`, not a client score. Opening `/certificate/:id?score=100` no longer produces a certificate.
- **Signed, verifiable certificates.** Ed25519 signature plus a public page `/verify/:certId` (API: `GET /api/certificates/verify/:certId`).
- **Email.** The hard-coded recipient check is removed. The email is sent once per certificate, user text is HTML-escaped, a verify link is included, and the API reports honestly whether it was delivered (`email.sent`, `email.reason`).
- **Bug fix:** the Dashboard "View Certificate" button called `navigate.open`, which does not exist. It now opens the certificate page.
- **Auth:** optional Supabase token check on the API (frontend now sends the token).
- **Tests:** `cd backend && npm test` (15 tests).

## Environment variables (Render)
| Variable | Purpose | Required |
|---|---|---|
| `CERT_PRIVATE_KEY`, `CERT_PUBLIC_KEY` | Certificate signing. Generate with `node scripts/generate-cert-keys.js` | Recommended |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Verify the signed-in user on the API | Recommended |
| `FRONTEND_URL` | Base URL for the verify link in emails, e.g. `https://mind-forge-ai-apjm.vercel.app` | Recommended |
| `CORS_ORIGIN` | Comma-separated allowed origins, e.g. the Vercel URL | Recommended |
| `RESEND_FROM` | Sender on a **verified Resend domain**, e.g. `MindForgeAI <noreply@yourdomain.com>` | Needed to email anyone but the Resend account owner |

Without the Supabase variables the API behaves as before (trusts the `userId` sent by the client). Without the signing keys certificates are still issued but unsigned.

## Known limits
- Email to learners other than the Resend account owner works only after a domain is verified in Resend and `RESEND_FROM` is set.
- Certificates issued before this change have no signature; the verify page shows them as recorded but not signature-checked.
- A quiz can be submitted once; a retry generates a new quiz.
