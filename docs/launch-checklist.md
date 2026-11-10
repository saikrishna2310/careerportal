# Pre-production launch checklist

- [ ] Replace demo figures, candidate identities, and sample content with real database-backed views.
- [ ] Extend server-side role guards to every recruiter and admin route (job creation and student workspace guards are already present).
- [ ] Add validated job edit/archive endpoints and pagination (company and job creation/publish flows are present).
- [ ] Add application submission, duplicate protection UX, and status transition rules.
- [ ] Add private resume upload, MIME/type validation, size limits, and signed read URLs.
- [ ] Add mobile email confirmation deep links and auth-state restoration tests.
- [ ] Add Resend email templates with server-side secret storage and retry handling.
- [ ] Add audit logs for recruiter actions and admin changes.
- [ ] Add rate limits, bot protection, backups, error monitoring, and database migration CI.
- [ ] Review privacy notice, data retention, consent, and account deletion workflows.
- [ ] Test RLS using separate student, recruiter, and admin test accounts.
- [ ] Configure Vercel production/staging environments and Cloudflare DNS.
