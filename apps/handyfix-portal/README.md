# HandyFix Frontend API Starter (React + Vite + TS)

This demo app is wired to your HandyFix .NET 8 backend:
- JWT login/register
- Services (browse + admin create)
- Jobs (book, my jobs, admin list/detail + status updates)
- Before/After image upload
- Blog (public list/detail + admin CRUD)
- Reviews (customer can review only after job is Completed)

## Run
```bash
npm install
cp .env.example .env
npm run dev
```

## API Base URL
Edit `.env`:
- `VITE_API_BASE_URL=https://localhost:5001/api`

Backend must allow CORS for `http://localhost:5173`.

## Admin (dev seed)
- Email: admin@handyfix.local
- Password: Admin1234!
