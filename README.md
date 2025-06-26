# Marketplace Starter

## Setup

1. Copy `.env.example` → `.env` and update `DATABASE_URL`
2. Install: `npm install`
3. Initialize DB:
   ```
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Run locally: `npm run dev`
5. Deploy:
   - Push to GitHub
   - Set `DATABASE_URL` in Vercel
   - Deploy on Vercel
