# UPI FailSafe - Smart UPI Failure Tracker

4 AI Agents work in backend to track failed UPI payments from screenshot to refund.

## How it works
1. Screenshot Analyzer Agent - User uploads screenshot of failed / pending UPI payment. AI extracts UTR, amount, bank, time, status.
2. Verification Agent - Cross-checks with SMS and creates verified proof report to share with shopkeeper.
3. Refund Tracker Agent - Shows live timeline and auto-drafts Bank / NPCI complaint if refund delayed.
4. Follow-up Agent - Sends Gmail follow-ups with note and team follows up till refund received. Phone + email saved only with user permission.

## Tech
Node.js, Python, AI Agents, OCR / Vision, PostgreSQL, Vultr Compute

## How to run
Open index.html / npm install && npm start
Upload a failed UPI screenshot to test.
