## EMS Next Frontend

This app runs on Next.js 16 and uses same-origin BFF routes under `/api/*` for login, logout, session lookup, CSRF enforcement, and backend proxying.

## Environment

Create `.env.local` with values that match the backend:

```bash
BACKEND_API_URL=http://localhost:3001/api
JWT_SECRET=<same value as backend JWT_SECRET>
NEXT_PUBLIC_API_BASE_URL=/api
```

Run the Express backend on `http://localhost:3001`.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
