# ResolveOS — AI Agent OS for UPI Complaint Resolution

**4 AI Agents That Handle UPI Complaints Before RBI Deadline.**

Upload a UPI failure screenshot → the Extractor pulls txn facts (GPT-4o Vision), the
Drafter writes an ex-RBI-Ombudsman-grade complaint, the Follow-up agent escalates on
Day 3 → Day 7 → Day 30, and the Reporter keeps a live dashboard of every ticket.

## Stack

- Next.js 14 (App Router) + Tailwind + shadcn-style UI
- Supabase (Postgres `tickets` table + public `screenshots` storage bucket)
- OpenAI GPT-4o (Vision extract + text drafting)
- Gmail + nodemailer (email to bank care desks)
- jsPDF (client-side Proof Pack download)

## Quick start

```bash
cp .env.example .env.local   # fill in your keys
npm install
npm run dev                  # http://localhost:3000
```

### Environment

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon key |
| `SUPABASE_SERVICE_KEY` | ✅ | Service-role key (server-side only) |
| `OPENAI_API_KEY` | optional | Without it: template complaints (or a fallback AI provider) |
| `GMAIL_USER` | optional | Gmail address that sends complaints (nodemailer) |
| `GMAIL_APP_PASS` | optional | Gmail app password (no spaces) — without it send-email is a dry run |
| `SUPABASE_DB_URL` | optional | Postgres URI — enables **automatic** `tickets` table creation |
| `COMPLAINT_BCC` | optional | Address BCC'd on every complaint (e.g. your Gmail) |
| `CRON_SECRET` | optional | Bearer guard for `/api/cron` |

### Database

**Automatic:** if `SUPABASE_DB_URL` is set, the first agent run creates the `tickets`
table and the public `screenshots` bucket for you.

**Manual:** otherwise paste `supabase/schema.sql` into Supabase → SQL Editor and run once.

## The 4 agents

| Agent | Endpoint | What it does |
|---|---|---|
| 1 · Extractor | `POST /api/agents/extract` | Uploads screenshot to Storage, extracts txn/UTR/amount/date/bank/app/payee via GPT-4o Vision, inserts ticket |
| 2 · Drafter | `POST /api/agents/draft` | Fetches ticket, writes formal RBI-TAT complaint (subject + body), saves + `drafted` |
| 3 · Follow-up | `POST /api/agents/followup` (`POST /api/cron`, daily) | Day 3 reminder → `pending_3d`, Day 7 Nodal escalation → `pending_7d`, Day 30 Ombudsman draft → `ombudsman_ready` |
| 4 · Reporter | `GET /api/agents/report` | Dashboard stats: total, pending >3d/>7d, ombudsman_ready, bank-wise counts |

Also: `POST /api/send-email` (Approve & Send → bank care desk + CC complainant, sets
`sent`), `GET /api/tickets` (dashboard table), `GET|POST /api/setup` (infra ensure).

## Pages

- `/` — hero, phone + email + drag-drop screenshot, **live agent activity feed**,
  extracted JSON, editable complaint preview, Approve & Send, Proof Pack PDF.
- `/dashboard` — stats cards, bank-wise failures, all tickets table, click a row for
  the full timeline + latest complaint. "Run Follow-up Agent now" button included.

## Scheduling Agent 3

- **Vercel:** `vercel.json` already registers `/api/cron` daily at 03:00 UTC. Set `CRON_SECRET` in your Vercel env vars and Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` — mismatches get a 401.
- **Local/self-hosted:** `curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron` from cron.
- **Supabase:** `pg_cron` + `pg_net` calling the endpoint.
- Every run appends a row to the `cron_logs` table (run_at, tickets_processed, reminders_sent, nodal_sent, ombudsman_ready) and returns `{processed, reminders, nodal, ombudsman}`.

## Notes

- Email delivery: complaints are sent through Gmail using `GMAIL_USER` + a Google
  **app password** (`GMAIL_APP_PASS`, 16 chars, no spaces). Enable 2-Step
  Verification, then create an app password under Google Account → Security.
- Bank care inboxes are resolved via `lib/bank-emails.ts` (real desks for SBI, HDFC,
  ICICI, Axis, etc., fallback `care@<bank-slug>.com`).
- Escalation ladder follows RBI Integrated Ombudsman Scheme 2021 / DPSS TAT guidance.
